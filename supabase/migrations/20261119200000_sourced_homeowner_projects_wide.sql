-- Sourced homeowner projects loader wide: 47 claimable procurement
-- projects from the wider sourcing beyond pools (founder order,
-- 2026-11-19: create-then-claim outreach). Creates one claimable
-- procurement project per sourced homeowner lead so the outreach
-- message can invite the homeowner to claim a project that already
-- exists on the platform. Source data, used verbatim and with
-- nothing added (no budgets, no dates, no addresses):
-- ~/workspace/wonder-build/procurement-projects/claim-build/LOADER-WIDE-DATA.md
-- (all 47 entries), itself drawn from
-- ~/workspace/procurement-sourcing/LEADS-WIDE.csv.
-- Order in this file: the 47 leads in file order, richest first.
-- This loader runs AFTER the 100 loader
-- (20261118190000_sourced_homeowner_projects_100.sql); none of these
-- 47 post URLs overlaps with that file or with the 31 loader
-- (20261118180000_sourced_homeowner_projects_31.sql).
--
-- CLAIM CONVENTIONS (per 20261118170000_procurement_project_claim.sql):
-- created_by stays NULL, the project status is 'unclaimed', and every
-- procurement_listings row starts as 'draft', which keeps each project
-- off the public /procurement page until the homeowner claims it
-- through claim_procurement_project(share_token), which flips the
-- project to 'active' and its listings to 'open'.
--
-- IDEMPOTENCY GUARD: each project's notes carry its source reference,
-- the lead's post URL, appended to the description text as
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
-- TOTALS: 47 projects + 47 phases + 49 phase items + 96 listings
-- (47 project level + 49 area) = 239 rows.
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
      (1, 'Coral''s Fence installation project, Sumterville', 'Sumterville, Florida',
       'Coral is seeking an experienced vinyl fence installer for her backyard. She specifies a tan colored vinyl fence required by her HOA, about 50 feet across the back, with two panels plus a gate on one side and three panels on the other, set in concrete. She asks installers to message her with estimates, availability, and photos of prior work.',
       'https://www.facebook.com/groups/1146781739772412/permalink/1599122917871623/'),
      (2, 'Marc''s Outdoor kitchen completion project, Bonita Springs', 'Bonita Springs, Florida',
       'Marc posted three photos of his unfinished cinder block outdoor kitchen, an L shaped base with partial stone veneer and an arched pizza oven, in his Bonita Springs backyard. He is looking for someone to finish it because the original contractor was taking too long, and he invites interested contractors to message him.',
       'https://www.facebook.com/groups/403870404289708/permalink/1725632345446834/'),
      (3, 'Paul''s Spa installation project', 'Boca Raton, Florida — city to confirm (place comes from the Ask Boca community group he posted in, not stated in the post itself)',
       'Paul is seeking personal recommendations for companies that install in ground hot tubs next to an existing pool. He wants experiences from people who actually used the company, he is gathering multiple competitive quotes, and he explicitly excludes one provider he already knows.',
       'https://www.facebook.com/groups/AskBoca/permalink/2034117377457820/'),
      (4, 'Jami''s Screen enclosure project, Cape Coral', 'Cape Coral, Florida',
       'Jami purchased a new pool house in Southwest Cape Coral that has no pool cage. She asks the community for recommendations for companies that can design and install a pool enclosure.',
       'https://www.facebook.com/groups/516061361775789/permalink/27409228095365751/'),
      (5, 'Lillian''s Fence installation project', 'Lehigh Acres, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Lillian is asking for help financing a new home fence after receiving a quote over $10,000 from Home Depot. She is looking for fencing companies that offer financing.',
       'https://www.facebook.com/groups/lehighacresflcommunitybulletinboard/permalink/25696747676663618/'),
      (6, 'Bob''s Solar panel installation project', 'Seminole, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Bob asks for referrals to solar panel installers people are happy with. He is specifically interested in a pergola with solar panels on top, and in understanding cost versus electric bill savings.',
       'https://www.facebook.com/groups/seminolehappenings/permalink/2023953131697179/'),
      (7, 'Carol''s Fence installation project', 'Citrus County, Florida — city to confirm (county comes from the thread, not stated in her post)',
       'Carol is asking for fence company recommendations because her lot is small and she received a $5,500 quote for a 6 foot wooden fence and wants something more affordable. She replied in her thread that she would call the suggested numbers.',
       'https://www.facebook.com/groups/3703777459894461/permalink/4487506348188231/'),
      (8, 'Jessica''s Fence installation project', 'Tampa Bay, Florida — city to confirm (area comes from the Tampa Bay vendors in her thread, not stated in her post)',
       'Jessica is purchasing a house that closes October 15 and needs a fencing company that can quote and advise on materials this week, then start installation on the closing date. She requires licensing, insurance, and permit handling. She needs the fence done before moving her dogs in, and she says two companies already failed to respond.',
       'https://www.facebook.com/groups/548974998586256/permalink/3765039450313112/'),
      (9, 'Melissa''s Landscaping renovation project', 'Tampa Bay, Florida — city to confirm (area comes from the Tampa Bay firms in her thread, not stated in her post)',
       'Melissa is seeking a local landscaper, not a maintenance service, to completely redo her backyard: remove dead sod, weeds, and some gravel down to dirt, keep some trees and plants, and design with Florida native and Florida friendly plants for a small space. She offered to share photos by message.',
       'https://www.facebook.com/groups/525359428847389/permalink/1961846245198693/'),
      (10, 'Meredith''s Landscaping renovation project', 'Palm Bay / Melbourne, Florida — city to confirm (she names the Palm Bay and Melbourne area in her post but not her own city)',
       'Meredith is seeking a reasonably priced landscaper to remove most of her existing landscaping and start fresh: remove overgrown plants and shrubs, clean out beds, install weed barrier or landscape fabric, add new mulch or rock, and design and install low maintenance Florida friendly landscaping, with knowledge of plantings near a house foundation. She asks for providers people have personally used, and anyone to avoid.',
       'https://www.facebook.com/groups/acityinflorida/permalink/10163091557072644/'),
      (11, 'Stijn''s Hardscaping project', 'Cape Coral, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Stijn posted in search of a reputable landscape company to provide a quote for hardscaping his backyard, such as patios, walkways, or retaining walls.',
       'https://www.facebook.com/groups/516061361775789/permalink/26133947556227151/'),
      (12, 'Lisa''s Screen enclosure project', 'Sarasota area, Florida — city to confirm (area comes from the firms in her thread, which serve Sarasota, North Port, and Charlotte County)',
       'Lisa is seeking recommendations for a company to install a pool cage. She is explicit about urgency: she hopes to avoid a multi month wait and wants recent, trustworthy referrals.',
       'https://www.facebook.com/groups/1558472287545731/permalink/28748920951407497/'),
      (13, 'Cali''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the firms in her thread, not stated in her post)',
       'Cali is soliciting recommendations for a trustworthy fencing contractor and needs a quote for installing approximately half an acre of fencing on a residential property. She values reputation over price shopping alone.',
       'https://www.facebook.com/groups/896340857400861/permalink/2768558160179112/'),
      (14, 'Eric''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in his post)',
       'Eric requests an estimate for approximately 300 linear feet of fence installation in wood or metal, and invites contact.',
       'https://www.facebook.com/groups/746738363428570/permalink/1441391500629916/'),
      (15, 'Carlos''s Fence installation project', 'Lee County, Florida — city to confirm (county comes from the thread, not stated in his post)',
       'Carlos posted in Spanish seeking a contractor to build a fence around his house, specifying that the contractor should also handle obtaining the permits. He published his own phone number in the post for contractors to call directly.',
       'https://www.facebook.com/groups/986116699359815/permalink/1791938018777675/'),
      (16, 'Axelle''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in her post)',
       'Axelle is asking for recommendations for a fence company to install approximately 350 feet of chain link fence and remove an existing fence.',
       'https://www.facebook.com/groups/832378635091083/permalink/1454079859587621/'),
      (17, 'Meagan''s Screen enclosure project', 'Southwest Florida — city to confirm (region comes from the firms in her thread, not stated in her post)',
       'Meagan is seeking recommendations for companies that install pool enclosures, specifically asking who offers good pricing or deals.',
       'https://www.facebook.com/groups/1998697690143140/permalink/27425397983713094/'),
      (18, 'Rachel''s Swim spa project', 'Citrus County area, Florida — city to confirm (she asks about proximity to Citrus County in her post but names no city)',
       'Rachel is asking for recommendations for the best swim spa for her family in Florida. She has a 5 month old baby and wants a unit for exercise swimming, plus a hot tub area for her husband, and she asks about depth differences between the swim lane and jacuzzi sections for her 4 year old.',
       'https://www.facebook.com/groups/swimspaowners/permalink/1282287033314325/'),
      (19, 'Don''s Solar panel installation project, North Port', 'North Port, Florida',
       'Don asks for recommendations for a reliable, reasonably priced solar company. He is planning to purchase outright rather than lease.',
       'https://www.facebook.com/groups/northportflorida/permalink/3210463355784468/'),
      (20, 'Charles''s Sauna project, New Port Richey', 'New Port Richey, Florida',
       'Charles is asking for recommendations on buying an outdoor sauna sized for 3 to 4 people. He specifies design priorities: correct seat height, ventilation, good wood quality, and a reasonable price, and he says the search has been exhausting.',
       'https://www.facebook.com/groups/390323110124460/permalink/972471915242907/'),
      (21, 'Bryan''s Fence installation project', 'Atlantic Beach, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Bryan is seeking an experienced fence installer for vinyl and black aluminum fencing at his house. He already purchased all supplies after getting estimates from several companies and wants to hire labor, offering cash payment. He and a friend will assist, with a timeline about a week and a half out. He replied in his thread confirming he has contacted recommended installers.',
       'https://www.facebook.com/groups/realatlanticbeach/permalink/10163275180774621/'),
      (22, 'Deidra''s Landscaping renovation project', 'Port St. Lucie, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Deidra is requesting a reliable landscaping company to redo the poor landscaping installed by her builder. She notes she contacted her lawn company in January without results, and that she knows what she wants.',
       'https://www.facebook.com/groups/pslr2020/permalink/1269509211163990/'),
      (23, 'Stephanie''s Landscaping renovation project', 'Florida — city to confirm',
       'Stephanie is requesting landscaper recommendations for a yard renovation: removing existing rock for salvage, killing weeds, removing dead plants and bushes, installing new plantings, and replacing rock with possible additional material.',
       'https://www.facebook.com/groups/OWOM1/permalink/26172499662411516/'),
      (24, 'Kylene''s Solar panel service project', 'Nature Coast / Ocala area, Florida — city to confirm (area comes from the firms recommended in her thread)',
       'Kylene is asking for recommendations for a solar company to service the existing panels on a newly purchased house because the original installer is out of business.',
       'https://www.facebook.com/groups/3703777459894461/permalink/4512885468983652/'),
      (25, 'Rais''s Solar panel installation project, Port Charlotte', 'Port Charlotte, Florida',
       'Rais is asking the community for honest feedback about installing solar panels: pros, cons, out of pocket costs, and whether it is worth it. He is hesitant about door to door salespeople.',
       'https://www.facebook.com/groups/1024402581485832/permalink/1987307055195375/'),
      (26, 'Ara''s Solar panel installation project', 'Seminole, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Ara asks the community for recommendations for a reliable solar company based on positive personal experiences. She engages actively in the replies.',
       'https://www.facebook.com/groups/seminolehappenings/permalink/2009435439815615/'),
      (27, 'Karen''s Solar panel installation project', 'Babcock Ranch, Florida — city to confirm (place comes from thread signals, not stated in her post)',
       'Karen is asking for personal recommendations on going solar, requesting which installers people used, why they recommend them, and whether they purchased or leased and how the process went.',
       'https://www.facebook.com/groups/1524946318062565/permalink/1886073618616498/'),
      (28, 'Müüja''s Solar panel installation project, Orlando', 'Orlando, Florida',
       'Müüja is seeking recommendations for solar panel installation companies serving Orlando and Central Florida, inviting suggestions in comments or by direct message, and explicitly welcoming installers who serve the area to reach out.',
       'https://www.facebook.com/groups/404626118670049/permalink/1127386736393980/'),
      (29, 'Kory''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in his post)',
       'Kory is a new homeowner asking for recommendations for a reasonably priced company to install a privacy fence.',
       'https://www.facebook.com/groups/348121297387222/permalink/1271881621677847/'),
      (30, 'Amena''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in her post)',
       'Amena is asking neighbors for a trustworthy, reasonably priced fencing service to relocate an existing fence and install a new fence and gate at the front of her house. She later replied that she has already reached out to most of the suggested companies.',
       'https://www.facebook.com/groups/832378635091083/permalink/1483554026640204/'),
      (31, 'Anja''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in her post)',
       'Anja is soliciting recommendations for a fencing company, asking for a reputable provider with competitive pricing.',
       'https://www.facebook.com/groups/896340857400861/permalink/2795561207478807/'),
      (32, 'Shawna''s Fence installation project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in her post)',
       'Shawna made a brief request for fence company referrals. She replied in her thread thanking everyone and saying she will start with True Fence.',
       'https://www.facebook.com/groups/242324640986621/permalink/1335487345003673/'),
      (33, 'Kim''s Fence installation project', 'Spring Hill, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Kim is asking for recommendations for vinyl fence companies people have used and been happy with, explicitly stating she is not looking for a handyman.',
       'https://www.facebook.com/groups/springhillfloridaneighbors/permalink/1427564758316021/'),
      (34, 'Victoria''s Fence installation project', 'Palm Coast, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Victoria is soliciting suggestions for a fencing contractor that balances affordability with reliability and quality workmanship.',
       'https://www.facebook.com/groups/Palmcoastcommunitynetwork/permalink/28295266410075190/'),
      (35, 'Rachel''s Screen enclosure project', 'Central Florida — city to confirm (region comes from the serving area of the firms in her thread, not stated in her post)',
       'Rachel asks her network for recommendations for a reputable pool cage installation company.',
       'https://www.facebook.com/groups/2667087273504935/permalink/4312969752250004/'),
      (36, 'Amy''s Screen enclosure project', 'Southwest Florida — city to confirm (region comes from the firms in her thread, not stated in her post)',
       'Amy asks her local community for suggestions for companies that install or repair pool enclosures and screens.',
       'https://www.facebook.com/groups/657818359845051/permalink/1283489803944567/'),
      (37, 'Vin''s Pool and screen enclosure project', 'Cape Coral, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Vin is soliciting recommendations or offers for a contractor who installs swimming pools and the surrounding screened enclosure (pool cage). He is logged in this book for the enclosure scope; the pool element overlaps the pool books theme but he is not in them.',
       'https://www.facebook.com/groups/516061361775789/permalink/27297858053169423/'),
      (38, 'Patrick''s Screen enclosure repair project', 'Southwest Florida — city to confirm (region comes from the thread, whose firms serve Manatee through Collier counties)',
       'Patrick is asking for recommendations for a local owner operator contractor to repair or replace a few screen panels on his pool cage, specifying a preference for someone licensed and insured and reasonably priced.',
       'https://www.facebook.com/groups/473678656939134/permalink/1824016978571955/'),
      (39, 'Tammy''s Screen door replacement project', 'Bonita Springs, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Tammy is asking for recommendations to replace a screen door on her pool cage. She confirmed in her thread that she booked a Monday appointment with a recommended firm.',
       'https://www.facebook.com/groups/bonitaspringsareacommunityinformation/permalink/2667135026960800/'),
      (40, 'Jules''s Screen enclosure repair project', 'Spring Hill, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Jules is asking for recommendations for someone to rescreen a pool cage.',
       'https://www.facebook.com/groups/SpringHillFlorida/permalink/10163289416789242/'),
      (41, 'Denise''s Screen enclosure repair project', 'Florida — city to confirm',
       'Denise is asking for recommendations for companies that can rescreen and paint a pool enclosure. Multiple businesses reply directly offering free estimates.',
       'https://www.facebook.com/groups/172468969814240/permalink/2637727359955043/'),
      (42, 'Alan''s Screen enclosure installation project', 'Florida — city to confirm (the firms in his thread span Northeast and Central Florida, and no city is stated)',
       'Alan is asking for recommendations for a contractor to install a screen enclosure on an existing concrete pad with a roof already in place.',
       'https://www.facebook.com/groups/2370368349747177/permalink/23994148496942517/'),
      (43, 'Alyssa''s Landscaping design project', 'Tampa Bay, Florida — city to confirm (area comes from the group and thread, not stated in her post)',
       'Alyssa is requesting recommendations for a landscape design company to plan her large empty yard.',
       'https://www.facebook.com/groups/836604156453621/permalink/9976261459154466/'),
      (44, 'Diana''s Hot tub purchase project, Orlando', 'Orlando, Florida',
       'Diana is asking the community for recommendations for a hot tub store in Orlando, with follow up questions about year round hot tub use and whether the water can be left unheated while running the jets.',
       'https://www.facebook.com/groups/263695941373248/permalink/1299573544452144/'),
      (45, 'Shelby''s Hot tub purchase and installation project', 'Port Charlotte, Florida — city to confirm (place comes from the vendor she accepted as local in her thread, not stated in the post itself)',
       'Shelby is soliciting recommendations for a reputable company that sells and installs hot tubs. Her thread converges on one Port Charlotte retailer confirmed to deliver and install, including salt water spas.',
       'https://www.facebook.com/groups/8620986144593397/permalink/33756651863933478/'),
      (46, 'Jon''s Spa electrical hookup project', 'Southwest Florida — city to confirm (region comes from the thread, not stated in his post)',
       'Jon posted a request for an electrician to install a disconnect panel and wire a hot tub, describing the job as straightforward and inviting messages for details. The hot tub is already being installed; the scope is the electrical hookup only.',
       'https://www.facebook.com/groups/1998697690143140/permalink/10085859958093499/'),
      (47, 'Brittany''s Sauna project', 'Florida — city to confirm',
       'Brittany is seeking recommendations for buying her first sauna because she does not have someone to build one custom. She is comparing three specific models, the Almost Heaven Allegheny, the SaunaLife Model G4, and the SaunaLife CL5G Cube, and is unsure which to choose. She states in her thread that she wants an outdoor sauna in Florida by her pool.',
       'https://www.facebook.com/groups/saunaloverscommunity/permalink/1778391072910392/')
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
      RAISE NOTICE 'Sourced projects loader wide: already loaded, skipping %', p.project_name;
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
        (1, 1, 'Vinyl Fence Installation', 'Install the tan vinyl fence she described, about 50 feet across the back with the panels, gate, and concrete setting she specified in her post.'),
        (2, 1, 'Outdoor Kitchen Completion', 'Finish his unfinished cinder block outdoor kitchen, with the L shaped base, stone veneer, and arched pizza oven shown in his photos.'),
        (3, 1, 'Spa Installation', 'Install an in ground hot tub next to his existing pool, as described in his post.'),
        (4, 1, 'Screen Enclosure Installation', 'Design and install a pool enclosure for her new pool house, as described in her post.'),
        (5, 1, 'Fence Installation', 'Install a new fence at her home, as described in her post.'),
        (6, 1, 'Solar Panel Installation', 'Install solar panels, including the pergola with solar panels on top that he asked about in his post.'),
        (7, 1, 'Fence Installation', 'Install a fence on her small lot, as described in her post.'),
        (8, 1, 'Fence Installation', 'Quote, supply, and install the fence for her new house, with the licensing, insurance, and permit handling she requires.'),
        (9, 1, 'Landscaping Renovation', 'Completely redo her backyard, removing the dead sod, weeds, and gravel and designing with Florida native and Florida friendly plants, as described in her post.'),
        (10, 1, 'Landscaping Renovation', 'Remove her existing landscaping and design and install the low maintenance Florida friendly landscaping she described in her post.'),
        (11, 1, 'Hardscaping', 'Carry out the backyard hardscaping he described, such as patios, walkways, or retaining walls.'),
        (12, 1, 'Screen Enclosure Installation', 'Install a pool cage at her home, as described in her post.'),
        (13, 1, 'Fence Installation', 'Install approximately half an acre of fencing on her residential property, as described in her post.'),
        (14, 1, 'Fence Installation', 'Install approximately 300 linear feet of fence in wood or metal, as described in his post.'),
        (15, 1, 'Fence Installation', 'Build the fence around his house, including obtaining the permits, as he described in his post.'),
        (16, 1, 'Fence Installation', 'Remove the existing fence and install approximately 350 feet of chain link fence, as described in her post.'),
        (17, 1, 'Screen Enclosure Installation', 'Install a pool enclosure at her home, as described in her post.'),
        (18, 1, 'Swim Spa Purchase', 'Supply a swim spa with an exercise swim lane and a hot tub section, as she described in her post.'),
        (19, 1, 'Solar Panel Installation', 'Install solar panels at his home, as described in his post.'),
        (20, 1, 'Sauna Purchase', 'Supply an outdoor sauna sized for 3 to 4 people with the seat height, ventilation, and wood quality he specified in his post.'),
        (21, 1, 'Fence Installation Labor', 'Install his vinyl and black aluminum fencing using the supplies he already purchased, as described in his post.'),
        (22, 1, 'Landscaping Renovation', 'Redo the builder installed landscaping at her home, as described in her post.'),
        (23, 1, 'Landscaping Renovation', 'Carry out the yard renovation she described, removing the existing rock for salvage, clearing weeds and dead plants, and installing new plantings and replacement material.'),
        (24, 1, 'Solar Panel Service', 'Service the existing solar panels on her newly purchased house, as described in her post.'),
        (25, 1, 'Solar Panel Installation', 'Install solar panels at his home, as described in his post.'),
        (26, 1, 'Solar Panel Installation', 'Install solar panels at her home, as described in her post.'),
        (27, 1, 'Solar Panel Installation', 'Install solar panels at her home, as described in her post.'),
        (28, 1, 'Solar Panel Installation', 'Install solar panels, as described in the post.'),
        (29, 1, 'Fence Installation', 'Install a privacy fence at his new home, as described in his post.'),
        (30, 1, 'Fence Installation', 'Relocate her existing fence and install a new fence and gate at the front of her house, as described in her post.'),
        (31, 1, 'Fence Installation', 'Install a fence at her home, as described in her post.'),
        (32, 1, 'Fence Installation', 'Install a fence at her home, as described in her post.'),
        (33, 1, 'Vinyl Fence Installation', 'Install a vinyl fence at her home, as described in her post.'),
        (34, 1, 'Fence Installation', 'Install a fence at her home, as described in her post.'),
        (35, 1, 'Screen Enclosure Installation', 'Install a pool cage at her home, as described in her post.'),
        (36, 1, 'Screen Enclosure Installation or Repair', 'Install or repair her pool enclosure and screens, as described in her post.'),
        (37, 1, 'Pool Construction', 'Build a new swimming pool, as described in his post.'),
        (37, 2, 'Screen Enclosure Installation', 'Install the screened enclosure (pool cage) around the pool, as described in his post.'),
        (38, 1, 'Screen Enclosure Repair', 'Repair or replace the few screen panels on his pool cage, as described in his post.'),
        (39, 1, 'Screen Door Replacement', 'Replace the screen door on her pool cage, as described in her post.'),
        (40, 1, 'Screen Enclosure Rescreening', 'Rescreen his pool cage, as described in his post.'),
        (41, 1, 'Screen Enclosure Rescreening', 'Rescreen her pool enclosure, as described in her post.'),
        (41, 2, 'Enclosure Painting', 'Paint her pool enclosure, as described in her post.'),
        (42, 1, 'Screen Enclosure Installation', 'Install a screen enclosure on his existing concrete pad under the roof already in place, as described in his post.'),
        (43, 1, 'Landscaping Design', 'Design a landscape plan for her large empty yard, as described in her post.'),
        (44, 1, 'Hot Tub Purchase', 'Supply the hot tub she described in her post.'),
        (45, 1, 'Hot Tub Purchase and Installation', 'Sell and install a hot tub at her home, as described in her post.'),
        (46, 1, 'Spa Electrical Hookup', 'Install a disconnect panel and wire his hot tub, as described in his post.'),
        (47, 1, 'Sauna Purchase', 'Supply the sauna she described, one of the models she is comparing in her post.')
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
    RAISE NOTICE 'Sourced projects loader wide: loaded % (%)', p.project_name, v_project_id;
  END LOOP;

  RAISE NOTICE 'Sourced projects loader wide: done. Loaded %, skipped % (already present).', v_loaded, v_skipped;
END $$;

-- =====================================================================
-- VERIFICATION (run these SELECTs after running the block above;
-- they are comments here so this file only loads data)
-- =====================================================================
-- Expectations are CUMULATIVE: the 31 loader
-- (20261118180000_sourced_homeowner_projects_31.sql) and the 100
-- loader (20261118190000_sourced_homeowner_projects_100.sql) are
-- already loaded, so the unclaimed sourced set totals 178 projects
-- after this run.
--
-- 1. Projects: expect 178 rows, all 'unclaimed', all created_by NULL,
--    every notes carrying its Source post URL, every share_token set
--    by the database default.
--
-- SELECT count(*) AS projects,
--        count(*) FILTER (WHERE status = 'unclaimed') AS unclaimed,
--        count(*) FILTER (WHERE created_by IS NULL) AS unclaimed_owner,
--        count(*) FILTER (WHERE strpos(notes, 'Source: http') > 0) AS with_source,
--        count(*) FILTER (WHERE share_token IS NOT NULL) AS with_token
-- FROM public.construction_projects
-- WHERE created_by IS NULL AND status = 'unclaimed';
--
-- 2. Phases: expect 178 "Procurement Areas" phases on those projects.
--
-- SELECT count(*) AS phases
-- FROM public.project_phases pp
-- JOIN public.construction_projects cp ON cp.id = pp.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
--   AND pp.phase_name = 'Procurement Areas';
--
-- 3. Phase items: expect 212 (one per bid area: 39 from the 31
--    loader + 124 from the 100 loader + 49 from this loader).
--
-- SELECT count(*) AS phase_items
-- FROM public.phase_items pi
-- JOIN public.project_phases pp ON pp.id = pi.phase_id
-- JOIN public.construction_projects cp ON cp.id = pp.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
--   AND pp.phase_name = 'Procurement Areas';
--
-- 4. Listings: expect 390 total, all 'draft': 178 project level
--    (phase_item_id NULL) + 212 area listings (phase_item_id set).
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
--    into each outreach message (check the project_name beside each
--    link):
--
-- SELECT cp.project_name,
--        '/procurement?claim=' || cp.share_token AS claim_link,
--        cp.notes
-- FROM public.construction_projects cp
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
-- ORDER BY cp.created_at, cp.project_name;
