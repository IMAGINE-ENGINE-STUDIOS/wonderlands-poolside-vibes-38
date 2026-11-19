-- Sourced homeowner projects loader: 31 claimable procurement projects
-- (founder order, 2026-11-18: create-then-claim outreach).
-- Creates one claimable procurement project per sourced homeowner lead
-- so the outreach message can invite the homeowner to claim a project
-- that already exists on the platform. Source data, used verbatim and
-- with nothing added (no budgets, no dates, no addresses):
-- ~/workspace/wonder-build/procurement-projects/claim-build/LOADER-31-DATA.md
-- (itself drawn from ~/workspace/procurement-sourcing/LEADS.csv).
-- Order in this file: Agnieszka Gruchala first, then the 7 priority
-- leads, then the rest in file order.
--
-- CLAIM CONVENTIONS (per 20261118170000_procurement_project_claim.sql):
-- created_by stays NULL, the project status is 'unclaimed', and every
-- procurement_listings row starts as 'draft', which keeps each project
-- off the public /procurement page until the homeowner claims it
-- through claim_procurement_project(share_token), which flips the
-- project to 'active' and its listings to 'open'.
--
-- IDEMPOTENCY GUARD: each project's notes carry its source reference,
-- the lead's Facebook post URL, appended to the description text as
-- "Source: <post_url>". Before inserting, the block checks for an
-- existing project with created_by IS NULL, status 'unclaimed', and
-- that exact post URL inside its notes (matched with strpos, so no
-- LIKE wildcard can false-match). If one exists, that project is
-- skipped with a NOTICE and nothing is duplicated. The guard and the
-- audit trail are the same data: the notes always say where the
-- project came from.
--
-- COLUMNS DELIBERATELY OMITTED, relying on database defaults, the same
-- way the proven Gonzalez loader (20261117210000) omitted them:
-- - share_token: construction_projects.share_token is
--   TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') with a
--   unique index, so the database generates a unique claim token per
--   project. The loader does NOT generate tokens itself.
-- - company_id: NOT NULL DEFAULT public.current_company_id() on all
--   four tables; that function falls back to the platform company
--   (Wonderlands) when run from the dashboard SQL editor.
-- - id, created_at, updated_at: generated / now() defaults.
-- procurement_listings.created_by is left NULL (platform created).
--
-- PER PROJECT this loader writes: 1 construction_projects row,
-- 1 project_phases row ("Procurement Areas", phase_order 0),
-- 1 project level procurement_listings row (phase_item_id NULL,
-- title = project_name), and per bid area 1 phase_items row
-- (item_order 0-based, mirroring the Gonzalez loader) plus
-- 1 procurement_listings row (phase_item_id set).
-- TOTALS: 31 projects + 31 phases + 39 phase items + 70 listings
-- (31 project level + 39 area) = 171 rows.
--
-- NOTE: migrations in this repo do not apply themselves. Run this file
-- once in the Supabase dashboard SQL editor for project
-- bwngxlbnavnhbtahyzbf. Verification SELECTs are at the bottom of this
-- file as comments.

DO $$
DECLARE
  p record;
  a record;
  v_project_id uuid;
  v_phase_id uuid;
  v_item_id uuid;
  v_notes text;
  v_loaded int := 0;
  v_skipped int := 0;
BEGIN
  FOR p IN
    SELECT * FROM (VALUES
      (1, 'Agnieszka''s Pool resurfacing project', 'Florida — city to confirm',
       'Agnieszka is looking for a reliable pool contractor to resurface her pool, which holds about 10000 gallons. She posted asking for recommendations and welcomes replies in the comments or by private message. She has openly invited contractors to respond to her post.',
       'https://www.facebook.com/groups/516061361775789/permalink/28720851717536709/'),
      (2, 'Joseph''s Pool build project, Gainesville', 'Gainesville, Florida',
       'Joseph is asking for pool builder recommendations in the Gainesville area. He wants a reliable builder who answers the phone. He also wants software renderings during the design stage, before installation begins.',
       'https://www.facebook.com/joseph.buffington.543/posts/pfbid0ZHdCofuCpeNz1mNS2qg87ZCGrq8LfowMdsLrfGYEZie4ig3SiSvdaMYQUiHor3L3l'),
      (3, 'Kara''s Pool build project', 'Florida — city to confirm',
       'Kara is asking for pool builder recommendations. She needs to start gathering quotes now for a pool project planned for next year. She is at the stage of comparing builders before she commits.',
       'https://www.facebook.com/groups/209289257620220/permalink/1595677308981401/'),
      (4, 'Jennifer''s Pool renovation project', 'Florida — city to confirm',
       'Jennifer is seeking recommendations for a pool renovation. The work she describes is resurfacing plus replacing the coping and the tiles. She is already comparing two named companies and asking for opinions on them.',
       'https://www.facebook.com/groups/924306008210857/permalink/2145035786137867/'),
      (5, 'Robbie''s Pool and spa resurfacing project', 'Florida — city to confirm',
       'Robbie is seeking a reputable company to resurface both his pool and his spa. He is looking for the work to be done at a fair price. His post asks the community who they would trust for this.',
       'https://www.facebook.com/groups/468443093900364/permalink/2411517929592861/'),
      (6, 'Stephanie''s Pool resurfacing project', 'Florida — city to confirm',
       'Stephanie is asking for a contractor who can resurface her gunite pool. She also needs the heater and the lighting system fixed. Her post combines the resurfacing and the equipment repairs in one ask.',
       'https://www.facebook.com/stephanie.o.burger/posts/pfbid0vfNmEBTGUV5JdjKY3wUfjuPJMUoq2kVhMkoZLxViXs3KW2xLK2C3hhAyEkWmuTmhl'),
      (7, 'Danielle''s Pool remodel project', 'Florida — city to confirm',
       'Danielle is looking for a dependable contractor for pool remodeling and renovation work. The specific parts of the pool are to be confirmed with her.',
       'https://www.facebook.com/groups/349690213039339/permalink/1842101763798169/'),
      (8, 'James''s Pool build project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated by him)',
       'James is asking the community for pool builders anyone has had an outstanding experience with. His thread is active, with 17 comments and local builder names already being suggested. He is collecting real experiences before choosing.',
       'https://www.facebook.com/groups/558797677593980/permalink/3844197012387347/'),
      (9, 'Jorge''s Pool resurfacing project, Tampa', 'Tampa, Florida',
       'Jorge is soliciting recommendations for a reliable pool resurfacing contractor in the Tampa area. He wants referrals from people who hired the company personally. His handle shows he works as a real estate broker, so he may be asking for a client or a property rather than his own pool.',
       'https://www.facebook.com/Broker.Jorge.Vazquez/posts/pfbid02ZJVCXC3iq1vbzxdQZ2uBBTEDqtmqGbiHeDGHxApc4SLyZLj9U8twU9oyXUDFABmGl'),
      (10, 'Yaudelkys''s Pool build project', 'Florida — city to confirm',
       'Yaudelkys is seeking recommendations for a reliable professional to construct a swimming pool with quality work. Her post was written in Spanish. She is looking for someone the community trusts to build well.',
       'https://www.facebook.com/groups/154390386481088/permalink/1677422947511150/'),
      (11, 'Jessica''s Pool resurfacing and pavers project', 'Florida — city to confirm',
       'Jessica is soliciting recommendations for professionals for two pieces of work. She needs pool resurfacing done. She also needs pavers around the pool area.',
       'https://www.facebook.com/jessica.zombekferris/posts/pfbid0P2Jz8X8PyCG1UgQfAhojpqaVdiPMSpUPKJv5VdgR5Z3dFSXRo2Q1BGSdFtFYMtLhl'),
      (12, 'John''s Pool refinishing project', 'Florida — city to confirm',
       'John is soliciting recommendations for a pool refinishing company. He wants referrals from people who used the company on their own pool. He posted in the same community group where another homeowner on this list also asked for pool builders.',
       'https://www.facebook.com/groups/3196932190535489/permalink/4970843986477625/'),
      (13, 'Eric''s Pool and spa build project', 'South Florida — city to confirm (region comes from a thread signal, not stated by him)',
       'Eric is asking for recommendations for a pool and spa builder who delivers quality work and exceeds expectations. His thread turned into a South Florida builder referral list, with commenters discussing builders around Loxahatchee and Avenir. He is comparing names the community put forward.',
       'https://www.facebook.com/groups/847074957786428/permalink/989178950242694/'),
      (14, 'Rocky''s Pool resurfacing project', 'Florida — city to confirm',
       'Rocky is requesting recommendations for a pool contractor for resurfacing work. She specifies that the contractor must be licensed and insured. That requirement is stated plainly in her post.',
       'https://www.facebook.com/Mrs.Rocky2U/posts/pfbid0MP5dCGH87L5CpUPFNACi92fL17wiTt99W6ZgdXLoHVcn8G6DKpf2CLy1F8vZcx4el'),
      (15, 'Rob''s Screen enclosure project, Orlando', 'Dr Phillips, Orlando, Florida',
       'Rob is seeking a screen enclosure contractor for structural gutter and downspout work between the pool and the screen enclosure. It is a smaller repair scope than a full build. He posted in the Dr Phillips Orlando community group and is ready to hire for this specific work.',
       'https://www.facebook.com/groups/drphillips/permalink/4527840117475651/'),
      (16, 'Tiffany''s Pool resurfacing project', 'Florida — city to confirm',
       'Tiffany is asking whether others have experience resurfacing a concrete swimming pool. She is requesting recommendations for reputable companies. Her pool is concrete, which she mentions in the post.',
       'https://www.facebook.com/groups/997072068598839/permalink/1623893249250048/'),
      (17, 'Adam''s Pool build project', 'Florida — city to confirm',
       'Adam is soliciting recommendations for a professional pool contractor with at least five years in business. He also asks for proof of liability insurance and workers compensation. He screens builders hard before he talks scope.',
       'https://www.facebook.com/groups/1735660387045092/permalink/2107252173219243/'),
      (18, 'Kena''s Pool build project', 'Florida — city to confirm',
       'Kena is seeking community recommendations for a pool builder her followers have used and would highly recommend. She wants names backed by real builds. Her post asks people to share who built their pool and whether they would hire them again.',
       'https://www.facebook.com/kena.estes/posts/pfbid03yDTGfXM9xur96wbHgx1Wipwg3VFkcBYYtgGe6qnYkUBiqo3wkzf1S2ZnrfSZfd9l'),
      (19, 'Pamela''s Pool resurfacing project', 'Florida — city to confirm',
       'Pamela is asking for referrals to a pool resurfacing company with excellent references. References are the centre of her ask. She wants to hear from people who can vouch for the company.',
       'https://www.facebook.com/pamela.l.rogers.5/posts/pfbid0NL1kBSYrvEaqKg5zRM6akqU7MGM4fDxEtK3VuwvcNw6hdHSTZt5xCd3mhCB9QVABl'),
      (20, 'Patty''s Pool and deck resurfacing project, Volusia County', 'Volusia County, Florida',
       'Patty is asking for recommendations for the best pool company to resurface a deck and pool. Her thread is large, with local contractor suggestions, and the commenters are primarily in Volusia County. She has two surfaces to redo and is comparing the names coming in.',
       'https://www.facebook.com/groups/642733089906830/permalink/2292006718312784/'),
      (21, 'Dana''s Outdoor kitchen and pavers project', 'Florida — city to confirm',
       'Dana is collecting recommendations of companies that do outdoor kitchens and pavers. She is asking on behalf of one of her clients, so she is the channel and her client is the owner. The project location and details sit with the client.',
       'https://www.facebook.com/groups/1844958312473040/permalink/4065771800391669/'),
      (22, 'Sue''s Pool deck resurfacing project', 'Florida — city to confirm',
       'Sue is soliciting recommendations for a professional company that performs pool deck resurfacing. Her ask is only about the deck, not the pool surface. She wants a company that does this work professionally.',
       'https://www.facebook.com/groups/2649186525126619/permalink/28617111607907422/'),
      (23, 'Scott''s Pool build project, The Villages', 'The Villages, Florida',
       'Scott is soliciting recommendations for a pool construction company offering the best quality pools at a fair price. He posted in The Villages Florida community group. Quality and fair price are the two terms he uses.',
       'https://www.facebook.com/groups/thevillagesfloridacommunityinformation/permalink/1611334103970438/'),
      (24, 'Lorelle''s Pool resurfacing project', 'Florida — city to confirm',
       'Lorelle is in search of contractors to resurface the pool and redo the tile and the surrounding deck. Her post names three pieces of work in one ask. Each piece can take its own bids.',
       'https://www.facebook.com/rellie.proferes/posts/pfbid0X2EjTdSWt8KYbfwh4NCXij2nxnWYibXYwUXr2JdLn2RakFhEKsLvdYqdwgz9mFZVl'),
      (25, 'Chris''s Pool build project', 'Florida — city to confirm',
       'Chris is soliciting recommendations for pool builders. He asks which company people used and whether the experience was positive or negative. He is weighing real experiences on both sides before choosing.',
       'https://www.facebook.com/chris.fowler.7902564/posts/pfbid07ToRF5qUxZtsMPLXFYjMcJCGZ5Y78ZKPfoJPnztE8xnSpyxMNZtPXRnVfk1q7s3Tl'),
      (26, 'Carol''s Pool resurfacing or repair project', 'Florida — city to confirm',
       'Carol is asking for referrals to a trustworthy and high quality pool resurfacing or repair company. She wants the referrals based on personal positive experiences. Trust is the word her post leans on.',
       'https://www.facebook.com/groups/740146259387832/permalink/28445608415081577/'),
      (27, 'Gina''s Pool build project', 'Florida — city to confirm',
       'Gina and her husband are beginning the process of getting a pool installed. They ask whether others shopped around for multiple quotes and whether quotes tended to be similar in price. They are at the early comparing stage of a first pool.',
       'https://www.facebook.com/groups/273395260599363/permalink/1749938762944998/'),
      (28, 'Gary''s Pool resurfacing project', 'Florida — city to confirm (his handle hints at Key West, not confirmed)',
       'Gary is requesting personal recommendations for a swimming pool resurfacing company. His pool is 20 years old and needs work. He wants referrals from people speaking from their own experience.',
       'https://www.facebook.com/groups/1174823293639953/permalink/1879927083129567/'),
      (29, 'Denny''s Pool build project', 'Florida — city to confirm',
       'Denny is seeking personal recommendations for a reputable pool company to install a pool. He wants to hear from people who used the company and had a positive experience. Reputation from real customers is his filter.',
       'https://www.facebook.com/groups/1059008941607902/permalink/2218776655631119/'),
      (30, 'Kristen''s Pool build project', 'Florida — city to confirm',
       'Kristen is soliciting recommendations for pool builders. She asks anyone who had a new pool constructed within the last five years which company they used and whether they would recommend that builder. She posted in the same community group as another homeowner on this list.',
       'https://www.facebook.com/groups/3196932190535489/permalink/4886287768266581/'),
      (31, 'Lisa''s Pool resurfacing project, Plantation', 'Plantation, Florida',
       'Lisa is soliciting suggestions for companies or services that perform Diamond Brite pool resurfacing. She is planning a pool surface renovation. She posted in the Plantation Nation community group, and hers is the oldest post in this list, so the project may already be moving.',
       'https://www.facebook.com/groups/plantationnation/permalink/28791697983751260/')
    ) AS t(idx, project_name, location, description, post_url)
    ORDER BY t.idx
  LOOP
    v_notes := p.description || E'\n\nSource: ' || p.post_url;

    IF EXISTS (
      SELECT 1 FROM public.construction_projects
      WHERE created_by IS NULL
        AND status = 'unclaimed'
        AND strpos(notes, p.post_url) > 0
    ) THEN
      RAISE NOTICE 'Sourced projects loader: already loaded, skipping %', p.project_name;
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO public.construction_projects (project_name, status, created_by, notes)
    VALUES (p.project_name, 'unclaimed', NULL, v_notes)
    RETURNING id INTO v_project_id;

    INSERT INTO public.project_phases (project_id, phase_name, phase_order)
    VALUES (v_project_id, 'Procurement Areas', 0)
    RETURNING id INTO v_phase_id;

    INSERT INTO public.procurement_listings
      (project_id, phase_item_id, title, description, location, status)
    VALUES
      (v_project_id, NULL, p.project_name, p.description, p.location, 'draft');

    FOR a IN
      SELECT * FROM (VALUES
        (1, 1, 'Pool Resurfacing', 'Resurface a pool of about 10000 gallons, as described in her post.'),
        (2, 1, 'Pool Construction', 'Build a new pool in the Gainesville area, with design renderings provided before installation as he requested.'),
        (3, 1, 'Pool Construction', 'Build a new pool, with quotes being gathered now for a project planned for next year.'),
        (4, 1, 'Pool Resurfacing', 'Resurface the pool as part of her renovation.'),
        (4, 2, 'Coping and Tile Replacement', 'Replace the coping and the tiles, as she described in her post.'),
        (5, 1, 'Pool Resurfacing', 'Resurface the pool, as requested in his post.'),
        (5, 2, 'Spa Resurfacing', 'Resurface the spa, as requested in his post.'),
        (6, 1, 'Pool Resurfacing', 'Resurface her gunite pool, as described in her post.'),
        (6, 2, 'Pool Heater and Lighting', 'Fix the heater and the lighting system, as she described in her post.'),
        (7, 1, 'Pool Remodel', 'Pool remodeling and renovation work as she described it, with the specific scope to be confirmed with her.'),
        (8, 1, 'Pool Construction', 'Build a new pool, with James looking for a builder backed by outstanding customer experiences.'),
        (9, 1, 'Pool Resurfacing', 'Resurface a pool in the Tampa area, with the exact property to be confirmed with him.'),
        (10, 1, 'Pool Construction', 'Construct a new swimming pool, with quality work as she requested.'),
        (11, 1, 'Pool Resurfacing', 'Resurface the pool, as requested in her post.'),
        (11, 2, 'Pool Deck Pavers', 'Pavers around the pool area, as requested in her post.'),
        (12, 1, 'Pool Refinishing', 'Refinish the pool, as requested in his post.'),
        (13, 1, 'Pool and Spa Construction', 'Build a pool and spa, with the quality standard he described in his post.'),
        (14, 1, 'Pool Resurfacing', 'Resurface the pool, with the contractor licensed and insured as she requires.'),
        (15, 1, 'Screen Enclosure', 'Structural gutter and downspout work between the pool and the screen enclosure, as he described in his post.'),
        (16, 1, 'Pool Resurfacing', 'Resurface her concrete swimming pool, as described in her post.'),
        (17, 1, 'Pool Construction', 'Build a new pool, with the contractor meeting his stated requirements on years in business and insurance proof.'),
        (18, 1, 'Pool Construction', 'Build a new pool, with Kena looking for a builder her community highly recommends.'),
        (19, 1, 'Pool Resurfacing', 'Resurface the pool, with the company backed by excellent references as she requested.'),
        (20, 1, 'Pool Resurfacing', 'Resurface the pool, as requested in her post.'),
        (20, 2, 'Pool Deck Resurfacing', 'Resurface the deck, as requested in her post.'),
        (21, 1, 'Outdoor Kitchen', 'Build an outdoor kitchen, as requested in her post on behalf of her client.'),
        (21, 2, 'Pavers', 'Paver work alongside the outdoor kitchen, as requested in her post.'),
        (22, 1, 'Pool Deck Resurfacing', 'Resurface the pool deck, as requested in her post.'),
        (23, 1, 'Pool Construction', 'Build a new pool in The Villages area, to the quality and fair price standard he described.'),
        (24, 1, 'Pool Resurfacing', 'Resurface the pool, as requested in her post.'),
        (24, 2, 'Pool Tile', 'Redo the pool tile, as requested in her post.'),
        (24, 3, 'Pool Deck', 'Redo the surrounding deck, as requested in her post.'),
        (25, 1, 'Pool Construction', 'Build a new pool, with Chris looking for a builder backed by positive owner experiences.'),
        (26, 1, 'Pool Resurfacing or Repair', 'Resurfacing or repair work on the pool, as she described it, with the exact scope to be confirmed with her.'),
        (27, 1, 'Pool Construction', 'Install a new pool, with Gina and her husband gathering and comparing quotes at this stage.'),
        (28, 1, 'Pool Resurfacing', 'Resurface his 20 year old pool, as described in his post.'),
        (29, 1, 'Pool Construction', 'Install a new pool, with Denny looking for a reputable company backed by positive customer experiences.'),
        (30, 1, 'Pool Construction', 'Build a new pool, with Kristen looking for a builder recommended by recent pool owners.'),
        (31, 1, 'Pool Resurfacing', 'Diamond Brite pool resurfacing for her planned pool surface renovation, as described in her post.')
      ) AS t(proj_idx, area_order, area_title, area_description)
      WHERE t.proj_idx = p.idx
      ORDER BY t.area_order
    LOOP
      INSERT INTO public.phase_items (phase_id, item_name, item_order, notes)
      VALUES (v_phase_id, a.area_title, a.area_order - 1, a.area_description)
      RETURNING id INTO v_item_id;

      INSERT INTO public.procurement_listings
        (project_id, phase_item_id, title, description, location, status)
      VALUES
        (v_project_id, v_item_id, a.area_title, a.area_description, p.location, 'draft');
    END LOOP;

    v_loaded := v_loaded + 1;
    RAISE NOTICE 'Sourced projects loader: loaded % (%)', p.project_name, v_project_id;
  END LOOP;

  RAISE NOTICE 'Sourced projects loader: done. Loaded %, skipped % (already present).', v_loaded, v_skipped;
END $$;

-- =====================================================================
-- VERIFICATION (run these SELECTs after running the block above;
-- they are comments here so this file only loads data)
-- =====================================================================
-- 1. Projects: expect 31 rows, all 'unclaimed', all created_by NULL,
--    every notes carrying its Source post URL, every share_token set
--    by the database default.
--
-- SELECT count(*) AS projects,
--        count(*) FILTER (WHERE status = 'unclaimed') AS unclaimed,
--        count(*) FILTER (WHERE created_by IS NULL) AS unclaimed_owner,
--        count(*) FILTER (WHERE strpos(notes, 'Source: https://www.facebook.com/') > 0) AS with_source,
--        count(*) FILTER (WHERE share_token IS NOT NULL) AS with_token
-- FROM public.construction_projects
-- WHERE created_by IS NULL AND status = 'unclaimed';
--
-- 2. Phases: expect 31 "Procurement Areas" phases on those projects.
--
-- SELECT count(*) AS phases
-- FROM public.project_phases pp
-- JOIN public.construction_projects cp ON cp.id = pp.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
--   AND pp.phase_name = 'Procurement Areas';
--
-- 3. Phase items: expect 39 (one per bid area).
--
-- SELECT count(*) AS phase_items
-- FROM public.phase_items pi
-- JOIN public.project_phases pp ON pp.id = pi.phase_id
-- JOIN public.construction_projects cp ON cp.id = pp.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
--   AND pp.phase_name = 'Procurement Areas';
--
-- 4. Listings: expect 70 total, all 'draft': 31 project level
--    (phase_item_id NULL) + 39 area listings (phase_item_id set).
--
-- SELECT count(*) AS listings,
--        count(*) FILTER (WHERE status = 'draft') AS draft,
--        count(*) FILTER (WHERE phase_item_id IS NULL) AS project_level,
--        count(*) FILTER (WHERE phase_item_id IS NOT NULL) AS area_level
-- FROM public.procurement_listings pl
-- JOIN public.construction_projects cp ON cp.id = pl.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed';
--
-- 5. Claim links, one per project, in loader order, ready to paste
--    into each outreach message (Agnieszka first is by created order
--    of this load; check the project_name beside each link):
--
-- SELECT cp.project_name,
--        '/procurement?claim=' || cp.share_token AS claim_link,
--        cp.notes
-- FROM public.construction_projects cp
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
-- ORDER BY cp.created_at, cp.project_name;
