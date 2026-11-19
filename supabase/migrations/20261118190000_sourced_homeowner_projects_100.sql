-- Sourced homeowner projects loader 100: 100 claimable procurement
-- projects (founder order, 2026-11-18: create-then-claim outreach).
-- Creates one claimable procurement project per sourced homeowner
-- lead so the outreach message can invite the homeowner to claim a
-- project that already exists on the platform. Source data, used
-- verbatim and with nothing added (no budgets, no dates, no
-- addresses):
-- ~/workspace/wonder-build/procurement-projects/claim-build/LOADER-100-DATA-PART-A.md
-- (entries 1 to 50) and
-- ~/workspace/wonder-build/procurement-projects/claim-build/LOADER-100-DATA-PART-B.md
-- (entries 51 to 100), themselves drawn from
-- ~/workspace/procurement-sourcing/LEADS-100.csv.
-- Order in this file: the 100 leads in file order, richest first.
-- This loader runs AFTER the 31 loader
-- (20261118180000_sourced_homeowner_projects_31.sql); none of these
-- 100 post URLs overlaps with that file.
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
-- TOTALS: 100 projects + 100 phases + 124 phase items + 224 listings
-- (100 project level + 124 area) = 548 rows.
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
      (1, 'Daina''s Pool build project', 'Florida — city to confirm',
       'Daina is moving to Florida from out of state and is asking for recommendations for an inground pool installation. She specifies that she wants something reliable and not astronomically priced. Her post drew a long discussion about what a pool realistically costs today.',
       'https://www.facebook.com/groups/1505517603098972/permalink/4204701519847220/'),
      (2, 'Arleen''s Fiberglass pool installation project', 'Volusia County, Florida',
       'Arleen is seeking a trustworthy and reasonably priced pool contractor in Volusia County. She has a preference for a fiberglass shell pool, contingent on price. She warns against contractors who might overcharge or deliver subpar work.',
       'https://www.facebook.com/reddoggy15/posts/pfbid02WxiSm1sZV6pGwf1vjpciwe9kevjzUgbPp2vVmLSejfNooZe3ztTfwk4XuGsvJncSl'),
      (3, 'Charlene''s Pool build project', 'Jacksonville, Florida — city to confirm (area comes from thread signals and her related post, not stated in this post)',
       'Charlene is requesting help finding a trustworthy pool builder. She names three criteria: the contractor must visit her home to take precise measurements, provide an accurate and transparent price quote, and honor scheduled appointments by actually showing up. She has already spoken with three different companies without satisfactory results, and she is frustrated with vendors who over promise or fail to communicate clearly about material options.',
       'https://www.facebook.com/charlene.jordan.37669/posts/pfbid02PaYJWcLyGjMnnXuq6TK7KBuKcbWN9FNphKkfxtNZsZ2KL9CNPBHdmUZVKgEvitLTl'),
      (4, 'Whitney''s Pool build project', 'Brevard County, Florida — city to confirm (county comes from a thread signal, not stated in her post)',
       'Whitney is soliciting community recommendations for hiring a pool builder. She asks for reputable contractors people have had good experiences with, warnings about builders to avoid, and general tips on the pool construction process. She engages actively in her thread, thanking commenters and asking follow up questions.',
       'https://www.facebook.com/groups/822065446575123/permalink/1326406846140978/'),
      (5, 'Kelley''s Pool build project', 'The Villages, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Kelley is moving to The Villages and is seeking feedback on alternatives to the default Villages pool builder. She asks for experiences with different companies, with details on quality, timeline, and photos of completed work, plus recommendations for reputable installers. She also asks about the process for new homeowners, including whether pool approval was sought at closing so construction could begin promptly.',
       'https://www.facebook.com/groups/thevillagesfloridacommunityinformation/permalink/1570093791427803/'),
      (6, 'Sandi''s Pool build project', 'Palm Bay, Florida — city to confirm (area comes from a thread signal, not stated in her post)',
       'Sandi announces she is moving forward with installing a swimming pool and is actively seeking price quotes. She asks for referrals to pool designers who were excellent to work with. She also invites private messages with warnings or mistakes to avoid during the process.',
       'https://www.facebook.com/sandi.smith.3939/posts/pfbid0ZsUpujWSTM3m8esY6SBXrAr6cED7DT9JXfqzTQDvu2z4tAyoYCwMFLcaSP74vNdLl'),
      (7, 'Stacy''s Pool build project, Jacksonville', 'Jacksonville, Florida',
       'Stacy is soliciting recommendations for pool construction companies in Jacksonville. She notes the market is crowded and quality varies, and she asks people who recently built a pool to share who they used, whether they would recommend them, and which companies to avoid. She requests specific feedback on workmanship quality, communication, adherence to budget, and on time completion.',
       'https://www.facebook.com/stacy.burkart/posts/pfbid029xpWptbQaMjT2svMQDkpk2jEtqumWryN1EweQ8PPTyLyysRhm3JGkKxFSu7zvCmwl'),
      (8, 'Sherri''s Pool build project', 'The Villages, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Sherri is seeking community input before committing to a new pool build. She asks followers to share reviews, personal experiences, contractor references, and warnings, and she invites private messages for sensitive details. She frames it as a major financial decision and notes concern that the contracts she has reviewed appear one sided and attempt to shift significant liability onto the homeowner. She has already met with T&D.',
       'https://www.facebook.com/groups/thevillagesfloridacommunityinformation/permalink/1277383487365503/'),
      (9, 'Carrie''s Pool build project', 'Polk County, Florida — city to confirm (county comes from a thread signal, not stated in her post)',
       'Carrie is new to the area and is asking for recommendations on reputable pool builders, along with warnings about companies to avoid. She was advised to research carefully before choosing. Her thread drew a large set of personal experiences from local homeowners.',
       'https://www.facebook.com/groups/548974998586256/permalink/3475795465904180/'),
      (10, 'Tina''s Pool build project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated in her post)',
       'Tina asks the community for pool builder recommendations and warnings, noting that Better Business Bureau complaints make independent research difficult. Her thread became a detailed crowdsourced review of Southwest Florida builders, with sharply divided experiences and specific grievances. She is vetting builders carefully before choosing.',
       'https://www.facebook.com/groups/924306008210857/permalink/2089061708401942/'),
      (11, 'Deby''s Pool build project, Sarasota', 'Sarasota, Florida',
       'Deby is asking her network for recommendations for a pool builder in Sarasota. She notes she searched Google but found many companies with bad reviews or complaints. She wants a company with a clean slate.',
       'https://www.facebook.com/groups/299995403430782/permalink/9580013888762174/'),
      (12, 'Patrick''s Pool equipment installation project, Clearwater', 'Clearwater, Florida',
       'Patrick is posting from Clearwater seeking a contractor to install new pool equipment for his recently remodeled pool. He has already purchased Pentair products, including a cartridge filter, a variable speed pump, and a salt generator. He is requesting a labor only quote with cash payment and ASAP timing, and he asks interested parties to message him privately.',
       'https://www.facebook.com/groups/swimmingpoolconstruction/permalink/2190815858323175/'),
      (13, 'Gary''s Pool build project, The Villages', 'The Villages, Florida',
       'Gary is soliciting recommendations for a reasonable pool installation company that works in The Villages. He emphasises affordability and value. He engages in his thread, thanking contributors and requesting contacts.',
       'https://www.facebook.com/groups/702127498072282/permalink/1637046271247062/'),
      (14, 'Marisol''s Pool build project', 'Citrus County, Florida — city to confirm (county comes from a thread signal, not stated in her post)',
       'Marisol is soliciting recommendations for a pool builder. She has currently received one quote, while another prospective builder has stopped responding. She emphasises wanting a reliable and serious professional, noting she has already experienced enough problems during her home build and wants to avoid further issues with the pool project.',
       'https://www.facebook.com/groups/3629323090624517/permalink/4514530642103753/'),
      (15, 'Ashley''s Pool build project, Wesley Chapel', 'Wesley Chapel, Florida',
       'Ashley is in the early planning stages of adding a swimming pool to her new residence in Wesley Chapel. She posted an inspiration photo of a sleek, modern rectangular pool with a small hot tub to show the style she wants. She requests contractor recommendations, price estimates, and photos of completed projects, and she is gathering preliminary quotes.',
       'https://www.facebook.com/atweyer/posts/pfbid0wFXAKMu18UL1dMHrx9mDAscgtpYyWZuJAKbwGWzRJp5F3CRQTWmBPHp4mcfjnrkpl'),
      (16, 'Brenda''s Pool build project', 'The Villages, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Brenda is asking for feedback on using T&D Pools during a new home build, with specific questions about satisfaction, regrets, issues, cost, and quality. She is weighing swimming on day one with the home build against having more options and a lower cost by building after the build. Alternatives are being discussed in her thread.',
       'https://www.facebook.com/groups/1462393284678795/permalink/2140909156827201/'),
      (17, 'Philip''s Pool build project, The Villages', 'The Villages, Florida',
       'Philip is seeking recommendations for pool installation after buying a home in The Villages. He has a design meeting scheduled with TD Pools, the builder affiliated option, and he asks others who installed a pool after purchase which company they used, whether they saved money compared to TD Pools, and how much they spent and saved.',
       'https://www.facebook.com/groups/1462393284678795/permalink/2089509051967212/'),
      (18, 'Shirley''s Pool and spa build project', 'Brevard County, Florida — city to confirm (county comes from a thread signal, not stated in her post)',
       'Shirley is soliciting recommendations for a pool construction company for a full installation that includes a spa. She prioritises affordability, speed, and quality of work. She places an emphasis on immediate availability to start the project.',
       'https://www.facebook.com/weemsteam/posts/pfbid03EPxWWsgSikHb4fFELk2CRqvkHdPa7enQ4BE1sM2WurV1aMrwjvVjXpmHiXyKaYbl'),
      (19, 'Miguel''s Pool and spa build project', 'Tampa Bay area, Florida — city to confirm (area comes from a thread signal, not stated in his post)',
       'Miguel is soliciting recommendations to install a backyard pool roughly 30 feet by 25 feet with a jacuzzi. He states a budget of around $60,000 and says he wants nothing elaborate. He invites direct messages with company names or personal referrals.',
       'https://www.facebook.com/groups/2442414209355164/permalink/4347493822180517/'),
      (20, 'Sasha''s Pool resurfacing project', 'Florida — city to confirm',
       'Sasha is asking for approximate cost estimates and contractor recommendations to resurface a 12,000 gallon pool. Her pool is kidney shaped, as shown in her photo. She notes the work would likely be scheduled for winter to avoid the Florida heat, and she says she may consider resealing if the cost is prohibitive.',
       'https://www.facebook.com/groups/2442414209355164/permalink/3935538186709418/'),
      (21, 'Donna''s Pool build project', 'The Villages, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Donna is asking her community for experiences with a specific pool builder, Bluescape Pools, for a new installation. She is vetting that builder before committing. Her thread drew alternative local recommendations and practical vetting advice.',
       'https://www.facebook.com/groups/thevillagesfloridacommunityinformation/permalink/1490250632745453/'),
      (22, 'Dewey''s Pool and screen enclosure build project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated in his post)',
       'Dewey is soliciting recommendations for constructing a swimming pool and an associated enclosure, a pool cage. He engages in his thread with technical follow up questions about concrete curing times. His post names the pool and the enclosure as the two pieces of work.',
       'https://www.facebook.com/groups/544137753850173/permalink/1465106425086630/'),
      (23, 'Jazzmene''s Pool build project', 'Tampa, Florida — city to confirm (city comes from a thread signal, not stated in her post)',
       'Jazzmene is seeking recommendations for a pool installation company. She jokes that some of the quotes she is getting approach the price of her house. She plans to handle the deck and pavers herself, and she already has a preferred landscape company.',
       'https://www.facebook.com/jazzmene.edwards/posts/pfbid02KASAZtLZHtg4Rw68QzTBHhhyALL3Xa4C5Z2x5fmx26noDsZXBS8NsGRHS4zARPvDl'),
      (24, 'Lisa''s Pool build project', 'North Florida — city to confirm (region comes from a thread signal, not stated in her post)',
       'Lisa is asking for recommendations for a pool contractor and requesting private messages with information and photos of previous work. She pushed back on a builder who replied by asking her to browse a website, saying she wants direct contact and photos. She notes a one year wait time quoted by one builder.',
       'https://www.facebook.com/groups/430111613842460/permalink/2898568810330049/'),
      (25, 'Cassie''s Pool build project, Jacksonville Beach', 'Jacksonville Beach, Florida',
       'Cassie is soliciting recommendations for pool building companies that operate in Jacksonville Beach. She wants recommendations based on personal experience rather than second hand referrals, from people who have actually used the companies themselves. She states she will reach out for quotes soon.',
       'https://www.facebook.com/cassie.oneal.5/posts/pfbid022xuJukC3ZxNnDJ3qgTcW73FUTeceVT1EvN9S6Z6JY3cohhkFJeMWuGiHwXPRAiiGl'),
      (26, 'Danny''s Fiberglass pool installation project', 'Ocala, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Danny is asking the community for reputable and qualified fiberglass pool builders in Ocala and surrounding areas. He specifically requests personal experiences and photos of completed work. His thread debates fiberglass versus gunite for the Ocala area.',
       'https://www.facebook.com/groups/wordofmouthocala/permalink/24067897659512246/'),
      (27, 'Alex''s Pool build project, Sanford', 'Sanford, Florida',
       'Alex is soliciting recommendations for a pool builder or installer in Sanford. He is in the process of planning or starting a pool construction project and is seeking trusted local professionals. A commenter asked whether the desired pool is high end or a standard rectangle.',
       'https://www.facebook.com/alessandro.dimare.3/posts/pfbid02wdWCjYT9zL5VnXT4c7kxec1LKE32Eo8UtkhfGRmtCHydjSk6NdiDHvJ7xVe2G9dUl'),
      (28, 'Tash''s Pool and deck remodel project', 'Volusia County, Florida — city to confirm (county comes from a thread signal, not stated in her post)',
       'Tash is soliciting bids for a large scale project, a full remodel including a pool, the surrounding pool deck, and an exterior lanai, covering more than 900 square feet in total. She prefers a single provider who can handle the entire scope as a one stop shop. Her post is an explicit request for bids.',
       'https://www.facebook.com/groups/642733089906830/permalink/1918181299028663/'),
      (29, 'Amy''s Pool refinishing project', 'Central Florida — exact city to confirm (region stated in her post, no city named)',
       'Amy is soliciting recommendations for a professional to refinish a swimming pool. She clarifies that the interior of the pool needs refinishing. She reports she already left a voicemail for one contractor and that one company has been fantastic so far.',
       'https://www.facebook.com/ami.babs/posts/pfbid0cnkeDDsQYyEqvgoxNkpYiZxWJ7uTfDyBTJ62YG5Z9CnxAo4Qf2zUAZyaXG2HkAfil'),
      (30, 'Tyler''s Pool build project', 'Brevard County, Florida',
       'Tyler is a homeowner in Brevard County planning to act as his own general contractor for a pool build. He is soliciting contractor recommendations based on personal experience, broken down by construction phase, rather than general advertising. He is hiring contractors phase by phase.',
       'https://www.facebook.com/groups/818553254969337/permalink/3654316374726330/'),
      (31, 'Nicole''s Pool build project', 'Brevard County, Florida',
       'Nicole is seeking community advice about installing a swimming pool at a home in Brevard. She asks for recommendations on contractors to hire and to avoid. She also invites people to share lessons learned from their own installations, specifically what features or additions they wish they had included.',
       'https://www.facebook.com/iamnicolebeach/posts/pfbid033uWLqrfCKe9qt99UprbnLSke1FgXkcmTH17cxoJ5upRYjk75rbt8agMHiYLzAJuAl'),
      (32, 'Jennifer''s Pool build project', 'Lakewood Ranch, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Jennifer is seeking pool builder recommendations after receiving a $398,000 quote through her home builder for a relatively standard backyard pool. She is looking for alternative companies for competitive quotes. Her thread drew a large number of competing price points and builder names.',
       'https://www.facebook.com/groups/ilovelakewoodranch/permalink/2352618631895492/'),
      (33, 'Marisol''s Pool resurfacing project, Orange City', 'Orange City, Florida',
       'Marisol is posting photos of her pool and spa and requesting licensed and insured pool contractors to provide quotes for resurfacing work to be done after October 2026. Her circular spa shows stained plaster in the photos. She notes she will collect three quotes.',
       'https://www.facebook.com/marisol.reyesordonez.1/posts/pfbid0Z3k9K44Jvugz3qhVjLx86JrVXgmsXev6ZarPYgrz6WByAhtnQKaEFfpgKYFbLwiXl'),
      (34, 'Dan''s Pool build project', 'Tampa Bay area, Florida — city to confirm (area comes from a thread signal, not stated in his post)',
       'Dan is asking for recent experiences with pool construction, noting that current quotes are more than double a pool he built six years ago at a previous home. He is seeking trustworthy builders at reasonable pricing. He also makes a secondary request for a screened in patio contractor.',
       'https://www.facebook.com/groups/1197051953959477/permalink/2537382013259791/'),
      (35, 'Tiffany''s Pool remodel project', 'Florida — city to confirm',
       'Tiffany is asking for recommendations for reputable pool remodeling companies. She has received one estimate from US Pools and is seeking two more options. She clarifies she wants a complete remodel of the pool and pool deck, with total demo and redo.',
       'https://www.facebook.com/groups/1571821309942058/permalink/2482762875514559/'),
      (36, 'Lauren''s Pool build project', 'Jacksonville, Florida — city to confirm (city comes from a thread signal, not stated in her post)',
       'Lauren is soliciting recommendations for contractors who install inground swimming pools. She invites replies with personal experiences or business suggestions. Commenters in her thread also suggested fiberglass options.',
       'https://www.facebook.com/lauren.griffis.5/posts/pfbid087GNCf2VJk2JKeW273cgLoX3PRoPK4yj1UmTjoFPynQDDDR8RoqA86fCHmfdogMJl'),
      (37, 'Calee''s Pool resurfacing project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated in her post)',
       'Calee is asking for recommendations for contractors who have recently resurfaced a swimming pool, seeking personal experiences and referrals. Her thread is large and active, and it discusses finish options at length. She is comparing contractors who have done this work recently.',
       'https://www.facebook.com/groups/516061361775789/permalink/27947767404845148/'),
      (38, 'Dilup''s Pool installation project, Ocala', 'Ocala, Florida',
       'Dilup is seeking community recommendations for a pool installer in the Ocala, Florida area. He wants an installer who is willing to work with a shell that he provides himself, rather than supplying the shell as part of the installation package. It is an installation labour scope.',
       'https://www.facebook.com/groups/404693583765927/permalink/1695875854647687/'),
      (39, 'Ginger''s Pool resurfacing project', 'Boca Raton, Florida — city to confirm (place comes from the community group she posted in, not stated in the post itself)',
       'Ginger is requesting recommendations for a reliable and reasonably priced pool resurfacing contractor for a 10x20 pool with a gem plaster finish. She notes the job is simple and may include a small decorative tile line. She actively engaged in her thread and agreed to message a recommended contractor.',
       'https://www.facebook.com/groups/AskBoca/permalink/2027670714769153/'),
      (40, 'Chad''s Pool build project', 'Polk County, Florida',
       'Chad is soliciting community recommendations for the best pool installation company serving Polk County. He is gathering personal experiences and referrals. His post indicates intent to hire a contractor for residential pool construction or installation.',
       'https://www.facebook.com/clindsey80/posts/pfbid033uHNrdUSPVKnbS5QYU7PwKjU3et9XNn3mnYjyiyRoDzLKAp8iFDXxw3SCD5sm5nul'),
      (41, 'Christine''s Screen enclosure project', 'Polk County, Florida — city to confirm (county comes from the community group she posted in, not stated in the post itself)',
       'Christine is asking followers for recommendations for a company to build a new pool enclosure. She specifies that it needs to be constructed rather than rescreened. Commenters provide local contractor suggestions with personal endorsements.',
       'https://www.facebook.com/groups/863area/permalink/10162545562834150/'),
      (42, 'Greg''s Pool build project, Jacksonville', 'Jacksonville, Florida',
       'Greg announces plans to have a swimming pool constructed and solicits recommendations on which contractor or company to choose. He states in his thread that he is getting a few estimates. He is moving to Rivertown Fruit Cove.',
       'https://www.facebook.com/greg.gause.3/posts/pfbid02z4p3e9j79ai1RxqMkAYJW4vbSth6HjxUL6CJ3V6UNqyNzf2NLfLPTQ66yF78F2pgl'),
      (43, 'Jeff''s Pool build project', 'The Villages, Florida — city to confirm (place comes from the community group he posted in, not stated in the post itself)',
       'Jeff recently purchased a home in The Villages and is now planning to add a swimming pool. He is soliciting recommendations for the best pool contractor serving The Villages area. He asks for honest referrals and personal experiences.',
       'https://www.facebook.com/groups/thevillagesfloridacommunityinformation/permalink/1611211333982715/'),
      (44, 'Savannah''s Pool build project', 'Brevard County, Florida — city to confirm (county comes from the community group and thread, not stated in her post)',
       'Savannah is asking her network for recent experiences hiring a pool builder. She specifically requests recommendations and warnings about companies to avoid. Her thread drew many comments with repeated endorsements of local builders.',
       'https://www.facebook.com/groups/BrevardJobsNetwork/permalink/26956845900577657/'),
      (45, 'Emma''s Pool area landscaping and outdoor living project', 'Southwest Florida — city to confirm (region stated in her post, no city named)',
       'Emma is planning backyard pool area work in Southwest Florida, with pavers around the pool out to the existing concrete pad. She has dropped the pool cage from the plan and is leaning toward artificial turf with a sand area and a fire pit at the end of the property along the water. She is asking for ideas for the large open space in between, and she specifies no watering of grass.',
       'https://www.houzz.com/discussions/6485893/backyard-pool-area-landscaping-suggestions'),
      (46, 'Kristy''s Pool build project', 'Port St Lucie, Florida — city to confirm (city comes from a thread signal, not stated in her post)',
       'Kristy is soliciting recommendations for contractors to build a new swimming pool. She has already received a quote from a company named Platinum. She is looking for additional options beyond that vendor.',
       'https://www.facebook.com/kristy.gerdts/posts/pfbid0Y88Xd1dt3s7yXdXNpBw3m62R7wB7Kc9ZX5GLuRuH89DftdetG5LRZx4VDjoKFUV3l'),
      (47, 'Jennifer''s Pool build project, Tampa', 'Tampa, Florida',
       'Jennifer is soliciting recommendations from friends and real estate agents in the Tampa area for pool builders they have used recently. She says her existing list of contacts is outdated. She wants current, first hand referrals, and she replies in her thread requesting photos and confirming the recency of work.',
       'https://www.facebook.com/scales.jen/posts/pfbid0KhZKXTVtGqkbryrNXoREgbZh75dnJp1ghJ7GMYbAr5JRydRA3xzL95fpXkejcPhel'),
      (48, 'Teresa''s Pool build project, Palm Bay', 'Palm Bay, Florida',
       'Teresa is asking for recommendations on installing a new in ground pool in southwest Palm Bay. She also wants to know typical allowable depths. Her thread discusses depth norms and typical build timelines.',
       'https://www.facebook.com/groups/acityinflorida/permalink/10162867933212644/'),
      (49, 'Jennifer''s Pool remodel and pavers project, Seminole', 'Seminole, Florida',
       'Jennifer is requesting pool remodel and paver contractor recommendations in Seminole, noting she is new to the area and unfamiliar with pools. She clarifies that her project involves updating a 1970s pool with hallway coping and adding a sun shelf. Her thread includes warnings about specific firms.',
       'https://www.facebook.com/groups/seminolehappenings/permalink/1899042114188282/'),
      (50, 'Alan''s Pool build project', 'Cape Coral, Florida — city to confirm (city comes from a thread signal, not stated in his post)',
       'Alan is soliciting recommendations for pool builders to build a basic rectangular pool measuring approximately 12 feet wide by 24 to 28 feet long. He emphasises looking for companies that are reasonably priced. His thread carries recommendations backed by personal anecdotes of completed and ongoing builds.',
       'https://www.facebook.com/alan.spangler.96/posts/pfbid0Nn7uthcCsc35eEVLvTN7UU6q5fxizeufFcMoibLgtQqAJyfrdSaT7sa3MXJQ35Tnl'),
      (51, 'Frankie''s Pool resurfacing project', 'Winter Haven, Florida — city to confirm (city comes from a thread signal, not stated by him)',
       'Frankie is soliciting personal recommendations for contractors who perform both pool leak repair and pool resurfacing. He wants providers based on firsthand experience rather than general advertising. His ask covers two pieces of work in one post.',
       'https://www.facebook.com/frankie.flo.7/posts/pfbid02kPQkaBHkrbwtVZrFhu9e1FYAYqGxxBT3i1wU1W2oSn3DpCsW924FfWthUK6CcwYfl'),
      (52, 'Micheal''s Outdoor kitchen project', 'Citrus County, Florida',
       'Micheal is seeking recommendations for a licensed architect or contractor to design an outdoor kitchen addition to his lanai. He has already tried several professionals he found online without receiving callbacks. The project is at the design stage and needs plans for the lanai addition.',
       'https://www.facebook.com/groups/citruscountysofficialwordofmouth/permalink/1033264659443743/'),
      (53, 'Clarence''s Screen enclosure project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated by him)',
       'Clarence posted a brief request seeking recommendations for building a pool enclosure. His thread drew a dense list of Southwest Florida screened pool cage installers. He is comparing the installers the community put forward.',
       'https://www.facebook.com/groups/997736844668449/permalink/1278976449877819/'),
      (54, 'Steve''s Pool build project', 'Parrish, Florida — city to confirm (city comes from a thread signal, not stated by him)',
       'Steve is soliciting firsthand accounts of working directly with Coast to Coast Pools to construct a swimming pool, outside a home builder package deal. He is also asking for alternative contractor recommendations. His thread discusses building in the Parrish and Palmetto area.',
       'https://www.facebook.com/groups/1164878465435646/permalink/1510905930832896/'),
      (55, 'Rod''s Pool and spa build project', 'The Villages, Florida',
       'Rod is soliciting recommendations from fellow Villages community members for companies that install pools and spas. He explicitly asks for honest referrals and personal reviews or experiences. His ask is brief and he is collecting names from people who have built.',
       'https://www.facebook.com/groups/thevillagesfloridacommunityinformation/permalink/1535957044841478/'),
      (56, 'Darlene''s Pool build project, Sarasota', 'Sarasota, Florida',
       'Darlene is asking for a reasonably priced pool builder who can visit her Sarasota home soon to assess and install a 12 by 20 foot pool. She states the size she wants in her post. She is ready for a builder to come out and look at the property.',
       'https://www.facebook.com/darlene.gamble.3/posts/pfbid0GUAJTutSJTsSSEAvZotF19bdX5HimXVVvUv3tSQKZ4HtBvVxswrUFctJw6q35F3nl'),
      (57, 'Lisa''s Pool and spa build project', 'Tampa, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Lisa is asking for experience using a general contractor versus a dedicated pool builder for a new home pool, noting she has built a pool before. She is also asking about design options and the pros and cons of including a spa. She is at the decision stage on who should build and what the design should include.',
       'https://www.facebook.com/groups/836604156453621/permalink/27192808667073144/'),
      (58, 'Elina''s Pool build project', 'Port Charlotte, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Elina is asking her community for personal experiences and recommendations for pool installation companies. She is specifically seeking positive firsthand accounts before choosing a builder. Her thread names pool builders in the Port Charlotte area.',
       'https://www.facebook.com/elinambolam/posts/pfbid02WGtUHR4jqSMaWmjzScH5woSeCTMECraC8g1Q5LLc7dxK3poc5s6Y8fDA1V2RXwbzl'),
      (59, 'Jen''s Pool renovation project', 'Florida — city to confirm',
       'Jen is soliciting recommendations for a pool renovation project. Her existing pool was installed in 1975 and is 9 feet deep, and her goals are to reduce the depth and potentially add a sun shelf to modernize it. The work is structural and changes how the pool is used.',
       'https://www.facebook.com/groups/345946310109548/permalink/1393867098650792/'),
      (60, 'Jessica''s Pool resurfacing project', 'Winter Haven, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Jessica is asking for recommendations for a pool company that can visit her property and provide a price estimate for resurfacing an existing swimming pool. She wants the estimate based on an on site visit. She is at the stage of choosing who comes out to look at the pool.',
       'https://www.facebook.com/jessica.jouppi.2025/posts/pfbid029qQhtowTWZbtP72zKeKfQW5fyizvxkU3nF3PfJLhBvvw7gZJLFwkxkzkEZiyJTUYl'),
      (61, 'Amanda''s Pool build project', 'Parrish, Florida',
       'Amanda is soliciting honest recommendations on pool designers and installers in the Parrish community. She asks which companies people would use again and which they would avoid, based on personal experience. She wants both sides of the record before she chooses.',
       'https://www.facebook.com/groups/parrishnetwork/permalink/2816663682052505/'),
      (62, 'Kerrey''s Pool build project, Fort Myers', 'Fort Myers, Florida',
       'Kerrey is soliciting recommendations from people in Fort Myers who have recently had a new pool installed. She wants people who were satisfied enough with their pool contractor to recommend them. Recent finished work is the evidence she is asking for.',
       'https://www.facebook.com/kerrey.hoolihan/posts/pfbid02ENvQRGCpA6nyWvPXkNxiCjkxKu6jxQQA6eYWezFbQo9RWdvLVjACz9Ze4Y2vQ5qXl'),
      (63, 'Brent''s Pool build project, Fort Myers', 'Fort Myers, Florida',
       'Brent is seeking a contractor to install an insulated concrete form pool in Fort Myers. He specifies that only the installation portion is needed. He asks interested parties to message him directly.',
       'https://www.facebook.com/groups/371524774404487/permalink/1481655356724751/'),
      (64, 'Sharon''s Pool renovation project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated by her)',
       'Sharon is asking for referrals to a pool company people have used in the past to perform updates or renovations on their swimming pool. She is seeking personal recommendations and prior experience. Her thread drew repeated endorsements of the same Southwest Florida companies.',
       'https://www.facebook.com/groups/121869524521336/permalink/35754409394173897/'),
      (65, 'Liz''s Pool build project, Ocala', 'Ocala, Florida',
       'Liz is soliciting community recommendations for companies that install new swimming pools in Ocala, Florida. She is seeking personal experiences and trusted contractor suggestions for pool construction. She is collecting names before choosing a builder.',
       'https://www.facebook.com/liz.gray.54/posts/pfbid02txD68Hn3CwGEX9SrWQgrV1ix4VBXcZ7iNDv47ScKDxwkBxnVNua736BqexkfwH7vl'),
      (66, 'Kendra''s Pool build project', 'Ocala, Florida',
       'Kendra is asking for reliable in ground pool installation recommendations for her parents'' upcoming home purchase in the Ocala area. She requests details on companies used, pool type, cost, timeline, permits and tips. Her parents are the homeowners and she is gathering the information for them.',
       'https://www.facebook.com/groups/wordofmouthocala/permalink/25492639517038046/'),
      (67, 'Sue''s Pool resurfacing and deck project', 'Seminole, Florida',
       'Sue is asking for recommendations for pool resurfacing, demolition of her existing decking, and extending a cement surface around the pool. She specifies a preference for local mom and pop companies. Her ask covers three pieces of work around the same pool.',
       'https://www.facebook.com/groups/seminolehappenings/permalink/1811755056250322/'),
      (68, 'Tricia''s Pool resurfacing project', 'Southwest Florida — city to confirm (region comes from a thread signal, not stated by her)',
       'Tricia is requesting reliable and honest pool companies to resurface her pool and install a new system. She notes she received recommendations before but none of the companies returned her calls. Responsiveness is central to what she is asking for this time.',
       'https://www.facebook.com/groups/787724735099369/permalink/2140061549865674/'),
      (69, 'Heidi''s Pool resurfacing project', 'Southwest Florida — city to confirm (region stated in her post, no city named)',
       'Heidi is asking her community for personal, satisfied user recommendations for a pool resurfacing company in Southwest Florida. She explicitly requests real experiences and no promotional cheerleading. She wants to hear from people who used the company on their own pool.',
       'https://www.facebook.com/groups/1452878758989982/permalink/1744669326477589/'),
      (70, 'Pool build project, Jupiter', 'Jupiter, Florida',
       'This homeowner moved to Jupiter about two years ago and is planning a first pool, comparing bids from multiple contractors. He holds a quoted contract between $135,500 and $138,500 for a 20 by 40 pool of about 28,000 gallons including a spa, an 8 by 8 hot tub, two 10 by 16 sun shelves, laminar jets and bubblers. He is also weighing whether to build 2,500 square feet of decking himself and asks whether the price and specification are right before he commits.',
       'https://www.troublefreepool.com/posts/2675984/'),
      (71, 'Sandi''s Pool build project, Port St. Lucie', 'Port St. Lucie, Florida',
       'Sandi is planning to install a pool at her Valencia Vista property in Port St. Lucie. She asks about experiences with GL Homes and for suggestions for outside pool installation companies. She is weighing the home builder route against an independent installer.',
       'https://www.facebook.com/groups/620946796285265/permalink/1627196632326938/'),
      (72, 'Lisa''s Pool build project, Cape Coral', 'Cape Coral, Florida',
       'Lisa is preparing to interview pool contractors for work on a waterfront property in Cape Coral. She is soliciting recommendations ahead of those interviews. She included a phone number in her post for responses.',
       'https://www.facebook.com/LisaGottesmanRealtor/posts/pfbid02h7GjdTBKr6cvdDfv4HvCnEU1949N493fpSTDYyP7jx3BFdDs3doNtBBmipNyTjRFl'),
      (73, 'Maureen''s Pool build project', 'Wesley Chapel, Florida',
       'Maureen is planning to build a pool in the Wesley Chapel area and is soliciting feedback on Tampa Bay area companies she is already comparing, including Tampa Bay Pools, Coast to Coast, and Tropical Pools and Pavers. She is at the vetting stage with named builders. Her thread carries positive and negative firsthand experiences with those companies.',
       'https://www.facebook.com/groups/wcresident/permalink/1674801953673844/'),
      (74, 'Allan''s Pool build project', 'Central Florida — city to confirm (he names the Central Florida service area, not his property city)',
       'Allan is publicly requesting recommendations for a reliable, licensed and insured pool contractor serving Central Florida, including Orlando, Kissimmee, Clermont and Sanford. Licensed and insured is a requirement he states himself. He is collecting names of contractors who meet that standard.',
       'https://www.facebook.com/groups/285954536479249/permalink/1533789071695783/'),
      (75, 'Tricia''s Pool build project', 'Sarasota, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Tricia is soliciting community input on pool construction companies. She asks followers to recommend builders they personally trust who delivered a smooth, hassle free building process. Her thread names Sarasota area builders.',
       'https://www.facebook.com/groups/1210705262753634/permalink/2109486179542200/'),
      (76, 'John''s Pool resurfacing project', 'Florida — city to confirm',
       'John is seeking recommendations for pool resurfacing services for a waterfront property with a rectangular in ground pool and a concrete surround, shown in his photo. He posted the property photo with his request. He is collecting names of resurfacing companies from people with experience.',
       'https://www.facebook.com/john.f.mcguire.3/posts/pfbid0UuUZcf3cvUZ8ATXQybkXh66L23qdDywny1ZTLTWKN9NWqHywbCeuUvBDqi3KqvWql'),
      (77, 'Deana''s Pool resurfacing project', 'Suntree, Florida',
       'Deana is asking her Suntree network for personal recommendations for a pool resurfacing company they have been happy with. Her thread includes licensing and permit vetting advice from commenters. She is weighing names against that vetting standard.',
       'https://www.facebook.com/groups/SuntreeFriends/permalink/4437529846522043/'),
      (78, 'Bill''s Pool build project', 'Lakewood Ranch, Florida',
       'Bill is seeking firsthand experiences with three pool builders he has already received bids from: Bulldog Pools, Family Pools, and Cody Pools. He is at the bid stage in Lakewood Ranch. He wants to hear from people who used those builders before he decides.',
       'https://www.facebook.com/groups/ilovelakewoodranch/permalink/1949568352200524/'),
      (79, 'Justin''s Pool build project', 'Ocala, Florida',
       'Justin is soliciting community recommendations for a trustworthy pool construction company in the Ocala area. He is seeking input from others who have experience hiring reputable builders. His thread is very large and active, with many endorsements traded.',
       'https://www.facebook.com/groups/wordofmouthocala/permalink/27196016106700370/'),
      (80, 'Leslie''s Pool renovation project', 'Seminole, Florida',
       'Leslie is asking for recommendations for pool renovation, resurfacing, and new tile in Seminole. She specifies that she does not want fiberglass. She is also asking about job duration and is actively engaging in replies about timing and contractor vetting.',
       'https://www.facebook.com/groups/seminolehappenings/permalink/2168750130550811/'),
      (81, 'Vipul''s Pool build project, Sarasota', 'Sarasota, Florida',
       'Vipul is soliciting recommendations for the best pool builder or installer operating in Sarasota. He invites personal experiences and reputable contractor referrals. His ask is brief and he is collecting names.',
       'https://www.facebook.com/groups/404693583765927/permalink/1532122637689677/'),
      (82, 'Melissa''s Pool build project, Tampa', 'Tampa, Florida',
       'Melissa is soliciting recommendations for a high end, luxury level pool construction company to handle a large scale project in Tampa. She is looking for builders who work at that level. Her thread drew many vendor suggestions and endorsements.',
       'https://www.facebook.com/groups/1740727832641943/permalink/9766756690038977/'),
      (83, 'Wendy''s Outdoor kitchen project', 'Babcock Ranch, Florida',
       'Wendy is asking her Babcock Ranch network for recommendations for companies that design and build outdoor kitchens. She is collecting names of builders who handle both the design and the build. Her thread drew repeated local builder endorsements.',
       'https://www.facebook.com/groups/movingtobabcockranch/permalink/1562024561994957/'),
      (84, 'Manuel''s Pool build project', 'Tampa Bay area — city to confirm (region comes from a thread signal, not stated by him)',
       'Manuel is soliciting recommendations for a custom pool builder to work on a new construction project. His ask is specific about new construction but brief on other details. His thread drew many Tampa Bay area builder recommendations and testimonials.',
       'https://www.facebook.com/groups/956181901495587/permalink/2554075108372917/'),
      (85, 'Meg''s Pool resurfacing and pavers project', 'Seminole, Florida',
       'Meg is asking for recommendations to resurface her pool, remove the existing deck and replace it with pavers, and convert the filtration to a salt system in Seminole. Her ask covers three pieces of work on the same pool area. She is collecting names for the full scope.',
       'https://www.facebook.com/groups/seminolehappenings/permalink/1788879175204577/'),
      (86, 'Joe''s Pool build project', 'Tampa, Florida — city to confirm (city comes from a thread signal, not stated by him)',
       'Joe is asking for recommendations on pool installation contractors for a backyard project. He requests good and bad experiences and price information from people who have built. His thread discusses Tampa Bay area builders.',
       'https://www.facebook.com/groups/2442414209355164/permalink/4123374384592463/'),
      (87, 'Annalee''s Pool build project', 'St. Petersburg, Florida',
       'Annalee is soliciting recommendations for companies to install a residential pool in St. Petersburg. She clarifies in a reply that the need is for construction, not cleaning. Her thread drew many local builder endorsements.',
       'https://www.facebook.com/groups/ilovestpetefl/permalink/10162651311134490/'),
      (88, 'Tamara''s Pool build project', 'Treasure Coast — city to confirm (region comes from a thread signal, not stated by her)',
       'Tamara is seeking pool builder recommendations for a client who just closed on a home and wants construction to begin immediately. She is a real estate agent asking on the client''s behalf, so the client is the homeowner. The ask carries urgency about starting right away.',
       'https://www.facebook.com/groups/376780754308834/permalink/1107518191235083/'),
      (89, 'Shannon''s Pool build project', 'Tampa, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Shannon is asking for personal recommendations for a pool company to provide a quote for designing and building a pool. She is at the quote stage. Her thread names Tampa Bay area builders.',
       'https://www.facebook.com/groups/2442414209355164/permalink/3877525252510712/'),
      (90, 'Edmond''s Pool remodel project, Venice', 'Venice, Florida',
       'Edmond is requesting recommendations for a reputable pool remodeling company serving Venice, Florida. He is collecting names of companies with a reputation for this work. His thread drew many responses, mostly contractors offering estimates.',
       'https://www.facebook.com/groups/6793610440764548/permalink/24986444541054527/'),
      (91, 'Anna''s Outdoor kitchen project', 'Tampa, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Anna is soliciting recommendations for a professional to build an outdoor kitchen. She is seeking trusted local builders for the work. Her thread points to Tampa Bay area businesses.',
       'https://www.facebook.com/groups/368815561864550/permalink/1203098785102886/'),
      (92, 'Jason''s Pool build project', 'Oldsmar, Florida — city to confirm (city comes from a thread signal, not stated by him)',
       'Jason is asking his network for pool company recommendations and clarifies he is building a new pool, not seeking maintenance. His thread discusses Tampa and Oldsmar area builders at length. He is weighing endorsements before choosing.',
       'https://www.facebook.com/groups/836604156453621/permalink/25534509142903113/'),
      (93, 'Jason''s Pool resurfacing project, Dunedin', 'Dunedin, Florida',
       'Jason states he is looking to have his fiberglass pool resurfaced in Florida and asks for contractor recommendations. He confirmed his Dunedin location in the thread. Fiberglass resurfacing is a narrower specialty than standard resurfacing.',
       'https://www.facebook.com/groups/470978157112423/permalink/1620774215466139/'),
      (94, 'Catherine''s Pool build project', 'Tampa, Florida — city to confirm (city comes from a thread signal, not stated by her)',
       'Catherine is asking for recommendations for affordable pool builders offering fiberglass or concrete pools. She is open on material and is comparing both routes. Her thread names Tampa area builders.',
       'https://www.facebook.com/groups/836604156453621/permalink/25872979009056123/'),
      (95, 'Allison''s Outdoor kitchen project, Boca Raton', 'Boca Raton, Florida',
       'Allison is posting a request to hire a licensed and insured contractor to build an outdoor kitchen in West Boca. Licensed and insured is a requirement she states herself. Her post drew a heavy local builder response.',
       'https://www.facebook.com/groups/AskBoca/permalink/1918889892313903/'),
      (96, 'Ruben''s Pool resurfacing project', 'Pembroke Pines, Florida',
       'Ruben is seeking recommendations from other homeowners for a company that performs pool resurfacing services in Pembroke Pines. He wants names from people who have had the work done. His thread includes strong opinions about providers from fellow homeowners.',
       'https://www.facebook.com/groups/WeLovePembrokePines/permalink/1998988110592317/'),
      (97, 'Tanya''s Pool resurfacing project, Port St. Lucie', 'Port St. Lucie, Florida',
       'Tanya is seeking personal recommendations for pool resurfacing in St. Lucie West, Port St. Lucie. She is collecting names from people speaking from their own experience. She is comparing resurfacing companies for her pool.',
       'https://www.facebook.com/tanya.nunnery.1/posts/pfbid02eHZNQexSx1wyJL8c3g5otD5CComYpBgiCuTWXtzc6fjrsDrGyBv7BWurLrNQtcUrl'),
      (98, 'Yardiel''s Screen enclosure project', 'Jensen Beach, Florida — city to confirm (city comes from a thread signal, not stated by him)',
       'Yardiel is posting a request for estimates on a new pool screen enclosure. He is collecting prices from enclosure companies. His thread names Jensen Beach area contractors.',
       'https://www.facebook.com/groups/1174823293639953/permalink/1351277595994521/'),
      (99, 'Stephanie''s Pool resurfacing and remodel project', 'South Florida — city to confirm (region comes from a thread signal mentioning Davie and Weston, not stated by her)',
       'Stephanie is asking followers for recommendations to resurface and remodel her residential pool. Her ask covers both pieces of work on the same pool. Her thread discusses Davie and Weston area companies in South Florida.',
       'https://www.facebook.com/groups/1284208815256360/permalink/2460442794299617/'),
      (100, 'Pool build and screen enclosure project', 'Southeast Florida — city to confirm (region comes from the thread title, no city named)',
       'This homeowner is in the planning phase for a new 36 by 16 pool at their forever home in Southeast Florida, to sit inside a screened enclosure. They already hold builder renderings and quotes and are deciding the final layout, including travertine against ShellLock against paver deck, sun shelf placement, and whether to include a hot tub. The decisions are layout decisions, made before committing to a builder.',
       'https://www.troublefreepool.com/threads/se-fl-pool-build.276144/')
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
      RAISE NOTICE 'Sourced projects loader 100: already loaded, skipping %', p.project_name;
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
        (1, 1, 'Pool Construction', 'Build a new inground pool, as described in her post.'),
        (2, 1, 'Fiberglass Pool Installation', 'Install a fiberglass shell pool in Volusia County, as she described in her post.'),
        (3, 1, 'Pool Construction', 'Build a new pool, with the site visit, measurements, and transparent quote she asked for in her post.'),
        (4, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (5, 1, 'Pool Construction', 'Build a new pool, with the quality, timeline, and completed work photos she asked about in her post.'),
        (6, 1, 'Pool Construction', 'Build a new pool, with the quotes she is actively gathering as described in her post.'),
        (7, 1, 'Pool Construction', 'Build a new pool in Jacksonville, as described in her post.'),
        (8, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (9, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (10, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (11, 1, 'Pool Construction', 'Build a new pool in Sarasota, as described in her post.'),
        (12, 1, 'Pool Equipment Installation', 'Install the new pool equipment he has already purchased, including the Pentair cartridge filter, variable speed pump, and salt generator, as a labor only job as he described in his post.'),
        (13, 1, 'Pool Construction', 'Build a new pool in The Villages, as described in his post.'),
        (14, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (15, 1, 'Pool Construction', 'Build a new pool in the modern rectangular style she showed in her inspiration photo, as described in her post.'),
        (15, 2, 'Spa Construction', 'Build the small hot tub shown alongside the pool in her inspiration photo, as she described.'),
        (16, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (17, 1, 'Pool Construction', 'Build a new pool in The Villages, as described in his post.'),
        (18, 1, 'Pool Construction', 'Build a new pool as part of the full installation she described in her post.'),
        (18, 2, 'Spa Construction', 'Build the spa included in her full installation, as she described in her post.'),
        (19, 1, 'Pool Construction', 'Build a backyard pool roughly 30 feet by 25 feet, as he described in his post.'),
        (19, 2, 'Spa Construction', 'Build the jacuzzi he included in his ask, as described in his post.'),
        (20, 1, 'Pool Resurfacing', 'Resurface her 12,000 gallon kidney shaped pool, as described in her post.'),
        (21, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (22, 1, 'Pool Construction', 'Build a new swimming pool, as described in his post.'),
        (22, 2, 'Screen Enclosure', 'Build the pool enclosure, or cage, associated with the pool, as he described in his post.'),
        (23, 1, 'Pool Construction', 'Install a new pool, as described in her post. The deck and pavers are not part of this area, since she states she will handle them herself.'),
        (24, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (25, 1, 'Pool Construction', 'Build a new pool in Jacksonville Beach, as described in her post.'),
        (26, 1, 'Fiberglass Pool Installation', 'Install a fiberglass pool in the Ocala area, as he described in his post.'),
        (27, 1, 'Pool Construction', 'Build a new pool in Sanford, as described in his post.'),
        (28, 1, 'Pool Remodel', 'Remodel the pool as part of her full project, as described in her post.'),
        (28, 2, 'Pool Deck Remodel', 'Remodel the surrounding pool deck, as described in her post.'),
        (28, 3, 'Lanai Remodel', 'Remodel the exterior lanai, which together with the pool and deck makes up the combined scope of more than 900 square feet she described.'),
        (29, 1, 'Pool Refinishing', 'Refinish the interior of her swimming pool, as she described in her post.'),
        (30, 1, 'Pool Construction', 'Build a new pool in Brevard County, with contractors hired phase by phase as he described in his post, since he acts as his own general contractor.'),
        (31, 1, 'Pool Construction', 'Build a new pool in Brevard County, as described in her post.'),
        (32, 1, 'Pool Construction', 'Build a new backyard pool, as described in her post.'),
        (33, 1, 'Pool Resurfacing', 'Resurface the pool, with quotes requested from licensed and insured contractors for work after October 2026, as she described in her post.'),
        (33, 2, 'Spa Resurfacing', 'Resurface the circular spa, which shows stained plaster in her photos, as she described.'),
        (34, 1, 'Pool Construction', 'Build a new pool, as described in his post.'),
        (34, 2, 'Screened Patio', 'Build a screened in patio, his secondary request in the post.'),
        (35, 1, 'Pool Remodel', 'Completely remodel the pool with total demo and redo, as she described in her post.'),
        (35, 2, 'Pool Deck Remodel', 'Completely remodel the pool deck with total demo and redo, as she described in her post.'),
        (36, 1, 'Pool Construction', 'Install a new inground swimming pool, as described in her post.'),
        (37, 1, 'Pool Resurfacing', 'Resurface her swimming pool, as described in her post.'),
        (38, 1, 'Pool Installation', 'Install a pool shell that the homeowner provides himself, in the Ocala area, as he described in his post.'),
        (39, 1, 'Pool Resurfacing', 'Resurface her 10x20 pool with a gem plaster finish, possibly including the small decorative tile line she mentioned, as described in her post.'),
        (40, 1, 'Pool Construction', 'Build a new pool in Polk County, as described in his post.'),
        (41, 1, 'Screen Enclosure', 'Build a new pool enclosure, constructed rather than rescreened, as she described in her post.'),
        (42, 1, 'Pool Construction', 'Build a new pool, as described in his post.'),
        (43, 1, 'Pool Construction', 'Build a new pool in The Villages area, as described in his post.'),
        (44, 1, 'Pool Construction', 'Build a new pool, as described in her post.'),
        (45, 1, 'Pool Deck Pavers', 'Lay pavers around the pool out to the existing concrete pad, as she described in her post.'),
        (45, 2, 'Artificial Turf and Sand Area', 'Install artificial turf with a sand area, as she described in her post, with no watering of grass.'),
        (45, 3, 'Fire Pit', 'Build a fire pit at the end of the property along the water, as she described in her post.'),
        (46, 1, 'Pool Construction', 'Build a new swimming pool, as described in her post.'),
        (47, 1, 'Pool Construction', 'Build a new pool in the Tampa area, as described in her post.'),
        (48, 1, 'Pool Construction', 'Build a new in ground pool in southwest Palm Bay, as described in her post.'),
        (49, 1, 'Pool Remodel', 'Update her 1970s pool, including the hallway coping she described in her post.'),
        (49, 2, 'Sun Shelf Addition', 'Add a sun shelf to the pool, as she described in her post.'),
        (49, 3, 'Pavers', 'Carry out the paver work she requested alongside the remodel, as described in her post.'),
        (50, 1, 'Pool Construction', 'Build a basic rectangular pool approximately 12 feet wide by 24 to 28 feet long, as he described in his post.'),
        (51, 1, 'Pool Leak Repair', 'Repair the pool leak, as described in his post.'),
        (51, 2, 'Pool Resurfacing', 'Resurface the pool, as described in his post.'),
        (52, 1, 'Outdoor Kitchen', 'Design an outdoor kitchen addition to his lanai, as described in his post.'),
        (53, 1, 'Screen Enclosure', 'Build a pool enclosure, as requested in his post.'),
        (54, 1, 'Pool Construction', 'Construct a swimming pool, with Steve weighing one named builder against alternatives as he described in his post.'),
        (55, 1, 'Pool and Spa Construction', 'Install a pool and spa, as requested in his post.'),
        (56, 1, 'Pool Construction', 'Assess and install a 12 by 20 foot pool at her Sarasota home, as she described in her post.'),
        (57, 1, 'Pool and Spa Construction', 'Build a new home pool, with the spa inclusion she is weighing as described in her post.'),
        (58, 1, 'Pool Construction', 'Install a new pool, with Elina looking for a builder backed by positive firsthand accounts as she described in her post.'),
        (59, 1, 'Pool Depth Reduction', 'Reduce the depth of her 1975 pool from 9 feet, as she described in her post.'),
        (59, 2, 'Sun Shelf Addition', 'Add a sun shelf to modernize the pool, as she described in her post.'),
        (60, 1, 'Pool Resurfacing', 'Resurface her existing swimming pool, with an on site estimate visit as she requested in her post.'),
        (61, 1, 'Pool Construction', 'Design and install a new pool, with Amanda weighing companies people would use again as she described in her post.'),
        (62, 1, 'Pool Construction', 'Install a new pool in Fort Myers, with Kerrey looking for a contractor recent customers recommend as she described in her post.'),
        (63, 1, 'Pool Installation', 'Install an insulated concrete form pool in Fort Myers, installation only, as he described in his post.'),
        (64, 1, 'Pool Renovation', 'Perform updates or renovations on her swimming pool, as she described in her post.'),
        (65, 1, 'Pool Construction', 'Install a new swimming pool in Ocala, as requested in her post.'),
        (66, 1, 'Pool Construction', 'Install an in ground pool for her parents'' upcoming home purchase, as she described in her post.'),
        (67, 1, 'Pool Resurfacing', 'Resurface the pool, as requested in her post.'),
        (67, 2, 'Deck Demolition', 'Demolish the existing decking, as she described in her post.'),
        (67, 3, 'Cement Surface Extension', 'Extend the cement surface around the pool, as she described in her post.'),
        (68, 1, 'Pool Resurfacing', 'Resurface her pool, as described in her post.'),
        (68, 2, 'Pool System Installation', 'Install a new pool system, as she described in her post.'),
        (69, 1, 'Pool Resurfacing', 'Resurface her pool in Southwest Florida, with the company backed by satisfied users as she requested in her post.'),
        (70, 1, 'Pool and Spa Construction', 'Build the 20 by 40 pool with spa, hot tub, sun shelves, laminar jets and bubblers, as set out in the quotes he holds and described in his thread.'),
        (71, 1, 'Pool Construction', 'Install a pool at her Valencia Vista property, as she described in her post.'),
        (72, 1, 'Pool Construction', 'Build a pool on a waterfront property in Cape Coral, as she described in her post.'),
        (73, 1, 'Pool Construction', 'Build a new pool, with Maureen vetting the named companies she is comparing as described in her post.'),
        (74, 1, 'Pool Construction', 'Build a new pool in Central Florida, with the contractor licensed and insured as he requires in his post.'),
        (75, 1, 'Pool Construction', 'Build a new pool, with Tricia looking for a builder who delivers a smooth process as she described in her post.'),
        (76, 1, 'Pool Resurfacing', 'Resurface the rectangular in ground pool at his waterfront property, as shown and described in his post.'),
        (77, 1, 'Pool Resurfacing', 'Resurface her pool in Suntree, as requested in her post.'),
        (78, 1, 'Pool Construction', 'Build a new pool in Lakewood Ranch, with Bill comparing the three bids he already holds as described in his post.'),
        (79, 1, 'Pool Construction', 'Build a new pool in Ocala, with Justin looking for a trustworthy company as he described in his post.'),
        (80, 1, 'Pool Resurfacing', 'Resurface the pool as part of her renovation, as described in her post.'),
        (80, 2, 'Pool Tile Replacement', 'Install new tile, as she described in her post.'),
        (81, 1, 'Pool Construction', 'Build a new pool in Sarasota, as requested in his post.'),
        (82, 1, 'Pool Construction', 'Build a large scale, high end pool in Tampa, as she described in her post.'),
        (83, 1, 'Outdoor Kitchen', 'Design and build an outdoor kitchen, as requested in her post.'),
        (84, 1, 'Pool Construction', 'Build a custom pool for a new construction project, as he described in his post.'),
        (85, 1, 'Pool Resurfacing', 'Resurface the pool, as requested in her post.'),
        (85, 2, 'Pool Deck Pavers', 'Remove the existing deck and replace it with pavers, as she described in her post.'),
        (85, 3, 'Salt System Conversion', 'Convert the filtration to a salt system, as she described in her post.'),
        (86, 1, 'Pool Construction', 'Install a pool in his backyard, with Joe weighing good and bad experiences as he described in his post.'),
        (87, 1, 'Pool Construction', 'Install a residential pool in St. Petersburg, as she clarified in her post.'),
        (88, 1, 'Pool Construction', 'Build a pool for her client who just closed on a home, as she described in her post.'),
        (89, 1, 'Pool Construction', 'Design and build a pool, with a quote as she requested in her post.'),
        (90, 1, 'Pool Remodel', 'Remodel his pool in Venice, as requested in his post.'),
        (91, 1, 'Outdoor Kitchen', 'Build an outdoor kitchen, as requested in her post.'),
        (92, 1, 'Pool Construction', 'Build a new pool, as he clarified in his post.'),
        (93, 1, 'Pool Resurfacing', 'Resurface his fiberglass pool in Dunedin, as he described in his post.'),
        (94, 1, 'Pool Construction', 'Build a fiberglass or concrete pool, with Catherine comparing both materials as she described in her post.'),
        (95, 1, 'Outdoor Kitchen', 'Build an outdoor kitchen in West Boca, with the contractor licensed and insured as she requires in her post.'),
        (96, 1, 'Pool Resurfacing', 'Resurface his pool in Pembroke Pines, as requested in his post.'),
        (97, 1, 'Pool Resurfacing', 'Resurface her pool in St. Lucie West, as she described in her post.'),
        (98, 1, 'Screen Enclosure', 'Build a new pool screen enclosure, with estimates as he requested in his post.'),
        (99, 1, 'Pool Resurfacing', 'Resurface her residential pool, as requested in her post.'),
        (99, 2, 'Pool Remodel', 'Remodel her residential pool, as requested in her post.'),
        (100, 1, 'Pool Construction', 'Build the new 36 by 16 pool, as described in their thread.'),
        (100, 2, 'Screen Enclosure', 'Build the screened enclosure the pool will sit inside, as described in their thread.'),
        (100, 3, 'Pool Deck', 'Build the pool deck, with the deck material still being decided as described in their thread.')
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
    RAISE NOTICE 'Sourced projects loader 100: loaded % (%)', p.project_name, v_project_id;
  END LOOP;

  RAISE NOTICE 'Sourced projects loader 100: done. Loaded %, skipped % (already present).', v_loaded, v_skipped;
END $$;

-- =====================================================================
-- VERIFICATION (run these SELECTs after running the block above;
-- they are comments here so this file only loads data)
-- =====================================================================
-- Expectations are CUMULATIVE: the 31 loader
-- (20261118180000_sourced_homeowner_projects_31.sql) is already
-- loaded, so the unclaimed sourced set totals 131 projects after
-- this run.
--
-- 1. Projects: expect 131 rows, all 'unclaimed', all created_by NULL,
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
-- 2. Phases: expect 131 "Procurement Areas" phases on those projects.
--
-- SELECT count(*) AS phases
-- FROM public.project_phases pp
-- JOIN public.construction_projects cp ON cp.id = pp.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
--   AND pp.phase_name = 'Procurement Areas';
--
-- 3. Phase items: expect 163 (one per bid area: 39 from the 31
--    loader + 124 from this loader).
--
-- SELECT count(*) AS phase_items
-- FROM public.phase_items pi
-- JOIN public.project_phases pp ON pp.id = pi.phase_id
-- JOIN public.construction_projects cp ON cp.id = pp.project_id
-- WHERE cp.created_by IS NULL AND cp.status = 'unclaimed'
--   AND pp.phase_name = 'Procurement Areas';
--
-- 4. Listings: expect 294 total, all 'draft': 131 project level
--    (phase_item_id NULL) + 163 area listings (phase_item_id set).
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
