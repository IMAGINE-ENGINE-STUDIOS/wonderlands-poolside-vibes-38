// The Wonderlands Product Manual — the engineering text behind the catalogue.
//
// This is documentation, not marketing. Every chapter answers four questions in
// the same order:
//
//   1. What the thing physically is (materials, sections, tolerances).
//   2. The science that governs it (the equation, its variables, its limits).
//   3. The code or standard it must satisfy, cited by section number.
//   4. How our own tool models it — the exact formula the software runs, the
//      inputs it needs, the outputs it produces and where it stops being valid.
//
// Rule for anyone editing this file: if a number appears here it must either be
// imported from the module that uses it, or be a published figure from a named
// standard. Never write a plausible-sounding number. If a value is unknown, say
// it is measured on site.

import { SOLAR_PACKING, SOLAR_PER_WATT, TRADE_LAYERS } from "@/lib/design/siteTradeLayers";
import { SITE_RATES, FENCE_RATE_PER_FT } from "@/lib/siteEstimate";
import { SETBACK_FT, SYSTEM_DERATE, FL_PEAK_SUN_HOURS } from "@/lib/solar/solarEngine";
import {
  FEDERAL_CREDIT_RATE,
  PANEL_DEGRADATION,
  UTILITY_ESCALATION,
  FL_UTILITY_RATE,
} from "@/data/solarHardware";
import { PRICE_PER_SQFT as TURF_PRICE_PER_SQFT } from "@/data/artificialGrassData";
import { NREL_SUITABILITY } from "@/data/nrelRooftopPotential";

/* ── types ────────────────────────────────────────────────────────────── */

export interface ManualSpec {
  label: string;
  value: string;
  note?: string;
}

export interface ManualFormula {
  /** What it computes */
  name: string;
  /** The expression, written for a reader, not for a compiler */
  expression: string;
  /** Every symbol, defined */
  where: string[];
  /** Where the software runs it */
  implementedIn?: string;
  /** Standard, study or measured calibration it comes from */
  source?: string;
}

export interface ManualCode {
  /** Section or clause number */
  clause: string;
  requirement: string;
}

export interface ManualSection {
  id: string;
  title: string;
  /** Paragraphs. Plain sentences, no adjectives for their own sake. */
  body: string[];
  specs?: ManualSpec[];
  formulas?: ManualFormula[];
  codes?: ManualCode[];
  /** Things the reader must decide or verify on site */
  fieldNotes?: string[];
}

export interface ToolManual {
  id: string;
  name: string;
  /** Route, when the tool has its own page */
  route?: string;
  /** One sentence: what it is for */
  purpose: string;
  inputs: string[];
  outputs: string[];
  /** The method, step by step */
  method: string[];
  /** Where it stops being accurate — stated plainly */
  limits: string[];
}

export interface ManualChapter {
  id: string;
  /** Roman numeral used in the running head */
  numeral: string;
  kicker: string;
  title: string;
  standfirst: string;
  sections: ManualSection[];
  tools: ToolManual[];
}

const money = (n: number | undefined, unit: string) =>
  n == null ? "measured on site" : `$${n.toLocaleString("en-US")}/${unit}`;

/* ── chapters ─────────────────────────────────────────────────────────── */

export const MANUAL_CHAPTERS: ManualChapter[] = [
  /* ---------------------------------------------------------------- pools */
  {
    id: "pools",
    numeral: "I",
    kicker: "Water bodies",
    title: "Pools — shells, hydraulics and heat",
    standfirst:
      "A pool is three engineered systems sharing one hole in the ground: a structural shell that resists soil and water pressure, a hydraulic loop that turns the volume over, and a thermal system that fights evaporation. Everything the catalogue offers changes one of those three.",
    sections: [
      {
        id: "shell",
        title: "The shell",
        body: [
          "Fiberglass shells are chopped-strand and woven laminate over a gelcoat or ceramic-composite surface, moulded in one piece and set on a compacted bedding of clean shell or sand. Because the shell is monolithic there is no cold joint to leak, and the surface is non-porous, which is why a fiberglass pool holds chemistry with less acid demand than plaster.",
          "Concrete shells are pneumatically applied over a steel cage and then finished. They can take any shape and any depth, which is the only reason to choose them over fiberglass in a residential build. They also carry the plaster or aggregate finish as a wear surface, which is replaceable — a fiberglass gelcoat is not.",
          "Both types are designed against hydrostatic uplift, not just water weight. In Florida's high water table the shell is at risk when it is EMPTY, not when it is full: a drained pool in wet ground can float. Every installation includes a hydrostatic relief valve in the deepest point, and draining is a controlled procedure, never a convenience.",
        ],
        specs: [
          { label: "Pool shell installed rate", value: money(SITE_RATES.pool, "sq ft"), note: "3.5× the $80/sq ft shell base — turnkey, delivered and set" },
          { label: "Spa / tanning ledge rate", value: money(SITE_RATES.spa, "sq ft"), note: "4× multiplier — more equipment and finish per square foot" },
          { label: "Tanning ledge water depth", value: "8–12 in", note: "sun shelf; loungers and bubblers are shelf-mounted" },
          { label: "Deck / concrete base", value: money(SITE_RATES.deck, "sq ft"), note: "minimum concrete deck rate; a chosen paver replaces this rate, it does not stack" },
        ],
        fieldNotes: [
          "Water table depth and soil bearing decide whether a shell needs a dewatering plan. This is a site survey item, never an assumption in software.",
          "Setback to the property line and to the septic drainfield governs where the shell can physically go before any design decision is made.",
        ],
      },
      {
        id: "hydraulics",
        title: "Turnover, pipe velocity and pump sizing",
        body: [
          "The circulation system is sized by turnover: the time it takes to pass the whole volume through the filter once. Residential practice is a turnover of 8 to 12 hours, and the required flow follows directly from the volume.",
          "Flow is then checked against pipe velocity, because a pump that can move the water is useless if the plumbing cannot carry it quietly. Suction lines are kept at or below 6 ft/s and returns at or below 8 ft/s; above that you get noise, head loss and eventually cavitation at the pump.",
          "Variable-speed pumps matter for one reason that is pure physics: the affinity laws. Halving the speed halves the flow but cuts the shaft power to roughly one eighth. A pump run long and slow moves the same water per day for a fraction of the energy of a short fast run.",
        ],
        formulas: [
          {
            name: "Pool volume (rectangular, average depth)",
            expression: "V (gal) = L × W × D_avg × 7.48",
            where: ["L, W — surface dimensions in feet", "D_avg — average depth in feet", "7.48 — US gallons per cubic foot"],
          },
          {
            name: "Required flow for turnover",
            expression: "Q (gpm) = V ÷ (T × 60)",
            where: ["V — volume in gallons", "T — turnover period in hours (8–12 residential)"],
          },
          {
            name: "Pipe velocity",
            expression: "v (ft/s) = 0.408 × Q ÷ d²",
            where: ["Q — flow in gpm", "d — internal pipe diameter in inches", "limits: 6 ft/s suction, 8 ft/s return"],
          },
          {
            name: "Pump affinity law",
            expression: "Q₂/Q₁ = N₂/N₁ and P₂/P₁ = (N₂/N₁)³",
            where: ["N — pump speed in rpm", "Q — flow", "P — shaft power"],
            source: "Centrifugal pump affinity laws",
          },
        ],
      },
      {
        id: "heat",
        title: "Heating, and why a cover is the cheapest equipment you can buy",
        body: [
          "Heating a pool is a heat-loss problem, not a heat-input problem. Between 50% and 70% of the loss from an uncovered outdoor pool is evaporative, because every pound of water that leaves the surface takes its latent heat of vaporisation with it — roughly 970 BTU per pound at pool temperatures.",
          "That is the whole argument for a cover. A cover does not add heat; it removes the dominant loss term. On a Florida pool it typically cuts heating energy by half or more and cuts make-up water at the same time.",
          "Gas heaters are sized in input BTU/h and deliver heat immediately. Heat pumps move heat instead of making it, with a coefficient of performance of roughly 5 to 6 at Florida air temperatures, which is why they cost a fifth as much to run and why they slow down on a cold night when you most want them.",
        ],
        formulas: [
          {
            name: "Sensible heat to raise pool temperature",
            expression: "BTU = gal × 8.34 × ΔT",
            where: ["gal — pool volume", "8.34 — pounds per US gallon of water", "ΔT — temperature rise in °F"],
          },
          {
            name: "Heater run time",
            expression: "hours = BTU ÷ (rated BTU/h × efficiency)",
            where: ["efficiency — about 0.84 for a modern gas heater; a heat pump instead uses COP × 3,412 BTU/h per kW"],
          },
          {
            name: "Heat pump electrical demand",
            expression: "kW = (BTU/h ÷ 3,412) ÷ COP",
            where: ["COP — coefficient of performance, ~5–6 at Florida ambient", "3,412 — BTU/h per kW"],
          },
        ],
        fieldNotes: [
          "Size the heater to the surface area, not the gallons: evaporation happens at the surface, so a wide shallow pool loses more than a deep narrow one of the same volume.",
        ],
      },
      {
        id: "finishes",
        title: "Finishes, coping and waterline",
        body: [
          "Finish choice is scoped by brand, and the software enforces it: gelcoat colours belong to GlimmerGlass, Latham carries its own finish range, and the Pebble Tec aggregate range belongs to concrete shells. A finish shown on the wrong brand is a defect, not a preference.",
          "Coping is priced per linear foot of shell perimeter because that is how it is bought and set. It is also the detail that decides whether the deck drains away from the water — a cantilever edge sheds toward the deck, a bullnose paver edge sheds toward the pool unless the deck is pitched.",
          "Waterline tile is a 6-inch band priced per linear foot. Its job is chemical and mechanical: it takes the scale line and the scrubbing that would otherwise wear the finish.",
        ],
        specs: [
          { label: "Waterline tile band", value: "$28/linear ft", note: "measured on the shell perimeter" },
          { label: "Coping", value: "per linear ft, catalogue rate", note: "one exclusive choice per shell, as in the studio card" },
        ],
      },
    ],
    tools: [
      {
        id: "studio-pool",
        name: "Wonderlands Studio — pool card",
        route: "/studio",
        purpose: "Configure a shell and every option at published rates, with brand-correct finishes.",
        inputs: ["Model or drawn dimensions", "Finish, coping, waterline", "Heater, cover, lights, jets", "Deck surface and area"],
        outputs: ["Itemised option list", "Installed price at studio rates", "Cart line that carries into the quote"],
        method: [
          "The shell price is area × the layer rate (3.5× base for pools, 4× for spas and ledges).",
          "Per-square-foot options multiply the drawn area; per-linear-foot options multiply the perimeter; equipment is a flat add.",
          "Choosing a paver replaces the concrete deck base rate rather than stacking on top of it.",
          "Selecting any feature adds its parent product to the cart automatically, so a finish can never be quoted without the pool it belongs to.",
        ],
        limits: [
          "Prices are turnkey Florida rates. Rock excavation, dewatering, long equipment runs and crane access are site-survey items and are not in the rate.",
          "The configurator does not size plumbing or heaters — use the formulas above with the surveyed volume.",
        ],
      },
      {
        id: "pool-visualiser",
        name: "Unified Pool Visualiser (2D/3D)",
        purpose: "Draw the shell, see it in three dimensions and keep both views on the same geometry.",
        inputs: ["Vertices and curvature per segment", "Depth anchors (0 = shallow, 1 = deep)", "Finish, coping and deck textures"],
        outputs: ["Shell geometry", "Coping and deck rings", "Areas and perimeters used by the estimate"],
        method: [
          "2D and 3D read one geometry pipeline at 10 px per foot, so a change in either view is the same change.",
          "Depth is interpolated between linear anchors rather than stored per vertex, which is what lets a lagoon profile stay smooth when a vertex moves.",
          "Coping, wall and deck-cutout rings are mitred offsets of the shell outline, so corners stay sharp and surfaces never z-fight.",
        ],
        limits: ["Textures are 1×1 ft UV tiles; a real finish sample should still be viewed in daylight before signing."],
      },
    ],
  },

  /* -------------------------------------------------- saunas & plunges */
  {
    id: "heat-cold",
    numeral: "II",
    kicker: "Heat and cold therapy",
    title: "Saunas and cold plunges",
    standfirst:
      "Both products are envelopes around a temperature you cannot reach at home. The sauna is an insulation-and-convection problem sized in kilowatts; the plunge is a refrigeration-and-sanitation problem sized in BTU per hour.",
    sections: [
      {
        id: "sauna-heat",
        title: "Sizing a sauna heater",
        body: [
          "Electric sauna heaters are sized on room volume: the industry rule is roughly 1 kW per 45 to 50 cubic feet of interior space for an insulated cedar or spruce room, with a penalty for uninsulated glass and log walls.",
          "That rule is why the catalogue clusters at 6 kW for two-to-four-person barrels, 8 kW for six-foot-plus rooms and 10.5 kW for the largest canopy models. A barrel wastes less air volume than a cabin of the same seating count, which is why barrels heat faster on the same heater.",
          "Stones matter more than watts once the room is hot. Heater stones store the energy that survives a door opening and provide the surface area that turns a ladle of water into löyly rather than a hiss.",
        ],
        specs: [
          { label: "Heater sizing rule", value: "1 kW per ~45–50 cu ft", note: "insulated room; add for glass doors and windows" },
          { label: "Catalogue range", value: "6.0 kW · 8.0 kW · 10.5 kW", note: "Harvia KIP and Virta electric, per Almost Heaven model" },
          { label: "Operating temperature", value: "180–194 °F", note: "reached in 45–60 minutes from cold" },
          { label: "Electrical", value: "240 V dedicated circuit", note: "6 kW ≈ 30 A, 8 kW ≈ 40 A, 10.5 kW ≈ 50 A — verify with the heater's listing" },
        ],
        formulas: [
          {
            name: "Heater power from room volume",
            expression: "kW ≈ V ÷ 47 + glass allowance",
            where: ["V — interior volume in cubic feet", "glass allowance — add ~1 kW per 20 sq ft of glazing"],
            source: "Manufacturer sizing tables (Harvia, Almost Heaven)",
          },
        ],
        fieldNotes: [
          "A sauna needs an unobstructed air path: low inlet near the heater, high outlet on the opposite wall. Sealing a sauna 'tight' makes it slow and stale.",
          "Set the room on a level, draining pad. Barrels sit on cradles and must not trap water under the staves.",
        ],
      },
      {
        id: "plunge",
        title: "Cold plunge — chiller load and sanitation",
        body: [
          "A plunge holds a small volume at 39–55 °F against ambient heat gain and against the heat a bather adds. Chiller capacity is quoted in BTU/h, and the sizing problem is pull-down time, not steady state: holding 50 °F is easy, dropping 20 °F overnight is what needs the machine.",
          "Insulation does most of the work. An insulated shell with a fitted lid can hold temperature on a fraction of the compressor duty an uninsulated tub needs, exactly as a pool cover does for heat in the opposite direction.",
          "Cold water is a sanitation problem too: at plunge temperatures the water is chemically inert but biologically hospitable to whatever a bather brings in. Filtration plus ozone or UV, plus a residual sanitiser, is not optional.",
        ],
        formulas: [
          {
            name: "Pull-down energy",
            expression: "BTU = gal × 8.34 × ΔT",
            where: ["ΔT — degrees of cooling required", "then hours = BTU ÷ chiller BTU/h"],
          },
        ],
      },
    ],
    tools: [
      {
        id: "sauna-card",
        name: "Sauna product card + sales pricing view",
        purpose: "Price an Almost Heaven model with heater, controls, screen and accessory options.",
        inputs: ["Model and wood species", "Heater and controller", "Screens, canopy, lighting and accessories"],
        outputs: ["Customer price", "Sales view (behind WONDERMAGIC): cost, freight, install, overhead and margin"],
        method: [
          "Consumer pricing is turnkey: unit cost plus freight, install, overhead and profit.",
          "The sales view unlocks the same build-up so a representative can see where the margin sits before discounting.",
        ],
        limits: ["Electrical service upgrades and pad construction are separate line items; the model price assumes an existing 240 V circuit and a level pad."],
      },
    ],
  },

  /* ------------------------------------------------- screen enclosures */
  {
    id: "enclosures",
    numeral: "III",
    kicker: "Structures",
    title: "Screen enclosures and lanais",
    standfirst:
      "A pool cage is a wind structure that happens to keep insects out. It is designed to ASCE 7 wind provisions under the Florida Building Code, and every part of the specification — extrusion size, anchor spacing, screen mesh — traces back to one number: the design wind speed at the address.",
    sections: [
      {
        id: "wind",
        title: "Wind load — the number everything else follows from",
        body: [
          "Design pressure on an open screen structure starts from the velocity pressure, which scales with the SQUARE of wind speed. That is why moving from a 140 mph zone to a 170 mph zone is not a 20% heavier cage: it is roughly 47% more pressure, and it changes extrusions, anchors and fastener metallurgy.",
          "Screen is a porous surface, so it does not take the pressure a solid roof would; the load path is through the mesh into the beams and down the uprights into the deck anchors. The weakest link in almost every failed cage is the anchor, not the aluminium.",
          "High-Velocity Hurricane Zone provisions (Miami-Dade and Broward) add heavier extrusions, tighter anchor spacing and stainless fasteners. Our configurator carries that as an explicit package rather than burying it in a rate.",
        ],
        formulas: [
          {
            name: "Velocity pressure",
            expression: "q_h = 0.00256 × K_z × K_zt × K_d × V²",
            where: [
              "q_h — velocity pressure in psf at mean roof height",
              "K_z — velocity pressure exposure coefficient",
              "K_zt — topographic factor",
              "K_d — wind directionality factor",
              "V — design wind speed in mph (3-second gust)",
            ],
            implementedIn: "src/data/screenEnclosureConfigurator.ts",
            source: "ASCE 7, Risk Category II",
          },
        ],
        specs: [
          { label: "Cage base rate", value: money(TRADE_LAYERS.enclosure.rate, "sq ft"), note: "mansard pool cage, installed" },
          { label: "Extrusion range", value: '2×2 (0.044 in wall) to 2×5 (0.055 in wall)', note: "max clear span 10 ft to 22 ft respectively" },
          { label: "HVHZ / coastal package", value: "+$4.50/sq ft", note: "heavier sections, tighter anchors, stainless fasteners for 170+ mph" },
        ],
        codes: [
          { clause: "ASCE 7 (Risk Cat. II)", requirement: "Wind pressures derived from the site design wind speed; screen treated as a porous surface." },
          { clause: "FBC HVHZ", requirement: "Miami-Dade and Broward builds require the high-velocity package and product approval." },
          { clause: "FBC-R R4501.17.1.1", requirement: "Where the cage wall serves as the pool barrier it must be at least 48 in high, measured from the outside finished deck." },
          { clause: "FBC-R R4501.17.2.1", requirement: "Barrier doors must be self-closing and self-latching, swinging outward away from the pool, with the release at least 54 in above the deck." },
        ],
      },
      {
        id: "mesh",
        title: "Choosing mesh, honestly",
        body: [
          "Mesh is a trade between airflow, visibility, insect exclusion and life. An 18×14 fiberglass pool-and-patio screen is the cheapest and the most transparent to air. Tighter 20×20 no-see-um weave stops sand flies and costs you airflow. Micro-fibre products (BetterVue, UltraVue2) use a thinner yarn to buy clarity back without closing the weave.",
          "Solar fabrics are a different product doing a different job: Textilene 90 and SunTex 80 block 80–90% of solar heat and glare and belong on the south and west walls, where the afternoon load is, not on the whole cage.",
          "Warranty tracks material, not brand loyalty: 5 years on standard fiberglass, 10 on micro-fibre and vinyl-coated polyester, 15 on the heaviest polyester weave. Coastal UV exposure is what consumes the difference.",
        ],
        specs: [
          { label: "Standard", value: "Phifer 18×14 fiberglass", note: "5-yr, best airflow, base rate" },
          { label: "Clarity", value: "BetterVue 18×16 / UltraVue2 20×21", note: "10-yr micro-fibre, +$1.85 / +$2.45 per sq ft" },
          { label: "Durability", value: "Super Screen Plus / Deluxe", note: "10 and 15-yr vinyl-coated and heavy polyester" },
          { label: "Solar", value: "Textilene 90 / SunTex 80", note: "80–90% solar heat and glare rejection" },
          { label: "Privacy / kick panels", value: "Florida Glass vinyl-laminated", note: "opaque laminate for kick and house-side walls" },
        ],
      },
    ],
    tools: [
      {
        id: "enclosure-config",
        name: "Screen Enclosure Configurator",
        purpose: "Specify a code-checked cage: type, roof, extrusion, mesh, doors and wind package.",
        inputs: ["Plan dimensions or drawn outline", "Design wind speed", "Cage type and roof system", "Mesh and door schedule"],
        outputs: ["Installed price per square foot of screen area", "Velocity pressure at the design speed", "Code issue list with clause numbers"],
        method: [
          "Screen area drives the rate; the cage type applies a multiplier over the mansard base and the roof system adds its own per-square-foot rate.",
          "Velocity pressure is computed from the entered design speed with the ASCE 7 expression above, and the extrusion's maximum clear span is checked against the drawn spans.",
          "Each code rule returns an error or a warning with its clause number, so the reason for a change is auditable.",
        ],
        limits: [
          "The configurator is a specification and estimating aid — it is not a sealed engineering calculation. Permit drawings require an engineer of record.",
          "Anchor design depends on the existing deck's thickness and condition, which must be verified on site.",
        ],
      },
      {
        id: "enclosure-board",
        name: "Enclosure Drawing Board",
        purpose: "Draw the cage in plan, with preset enclosure shapes and self-latching door placement.",
        inputs: ["Drawn or preset outline", "Door positions", "Kick-plate heights"],
        outputs: ["Screen area and beam runs", "Door schedule", "Priced take-off"],
        method: [
          "Presets are drawn centred on the canvas at the shared board scale so a preset and a hand-drawn cage measure the same way.",
          "A door occupies only the width of the leaf on the spline it sits on — it does not paint the whole run.",
        ],
        limits: ["Plan geometry only. Beam heights and gutter tie-ins come from the elevation on the permit set."],
      },
    ],
  },

  /* ------------------------------------------------------------ fencing */
  {
    id: "fencing",
    numeral: "IV",
    kicker: "Barriers",
    title: "Aluminium fencing and pool barriers",
    standfirst:
      "A pool fence is a life-safety device with dimensional rules that are not negotiable. Style is what is left after the geometry is satisfied.",
    sections: [
      {
        id: "barrier-rules",
        title: "The barrier rules, and why each exists",
        body: [
          "The 48-inch minimum height is measured from the OUTSIDE finished grade, because that is the surface a child climbs from. Raising the ground outside a fence reduces its legal height.",
          "The 4-inch bottom clearance stops a child rolling under; over a non-solid surface such as turf or mulch it tightens to 2 inches, because the surface itself compresses.",
          "The 4-inch picket spacing exists so a 4-inch sphere cannot pass — the standard test for a torso opening. Spear and finial tops are banned below 60 inches because they turn a fall into an impalement.",
          "Gate hardware carries the highest failure rate of the whole assembly: self-closing, self-latching, opening AWAY from the pool, with the release at least 54 inches above grade so it is out of a child's reach.",
        ],
        specs: [
          { label: "Pool barrier base run", value: money(FENCE_RATE_PER_FT, "linear ft"), note: "48 in flat-top, three-rail aluminium, installed" },
          { label: "Self-closing / self-latching kit", value: "$185 per gate", note: "code-required where the gate serves the barrier" },
          { label: "Gate alarm", value: "$240 per gate", note: "required where a barrier gate is also a dwelling access point" },
        ],
        codes: [
          { clause: "FBC-R R4501.17.1.1", requirement: "Barrier at least 48 in high from the outside finished grade." },
          { clause: "FBC-R R4501.17.1.2", requirement: "Maximum 4 in clearance below the barrier; 2 in over a non-solid surface." },
          { clause: "FBC-R R4501.17.1.4", requirement: "Clear openings must not pass a 4 in sphere." },
          { clause: "FBC-R R4501.17.1.5", requirement: "No spear or finial tops on barriers under 60 in." },
          { clause: "FBC-R R4501.17.2.1", requirement: "Gates self-closing and self-latching, outward-swinging, release at 54 in minimum." },
          { clause: "F.S. 515", requirement: "Residential Swimming Pool Safety Act — the barrier is one of the permitted safety features for a new pool." },
        ],
        fieldNotes: [
          "Privacy or louvered infill turns a fence into a solid wind surface and a climbable one. It needs engineered post spacing and a permitting review — the configurator flags it rather than pricing it silently.",
        ],
      },
    ],
    tools: [
      {
        id: "fence-config",
        name: "Fence Configurator",
        purpose: "Price a barrier run and audit it against the Florida pool-barrier rules before it is drawn.",
        inputs: ["Run length", "Height and style", "Gates and add-ons", "Design wind speed"],
        outputs: ["Price per linear foot and total", "Gate schedule", "Clause-by-clause compliance list"],
        method: [
          "The 48-inch flat-top run is the base rate; height and style are priced as deltas from it so a change reads as a change.",
          "Every rule above is evaluated against the configuration and returns an error, a warning or nothing, each carrying its clause number.",
        ],
        limits: ["Post embedment depends on soil and on the design wind speed; footing depth is confirmed at survey, not in the configurator."],
      },
    ],
  },

  /* --------------------------------------------------- decks and pavers */
  {
    id: "decks",
    numeral: "V",
    kicker: "Surfaces",
    title: "Decks, pavers and net area",
    standfirst:
      "Hardscape is priced by area, which means the honest number is NET area — what is actually paved after the water, the turf and the planting beds are taken out. Getting that subtraction right is most of what our take-off does.",
    sections: [
      {
        id: "net-area",
        title: "Net area, and what is subtracted from it",
        body: [
          "Gross deck area is the outline you draw. Net area is that outline minus every surface inside it that is not paved: the pool, the spa, the tanning ledge, artificial turf, planting beds and gravel.",
          "The software performs this as a real polygon difference, not a percentage guess. Water bodies drawn on top of a deck cut a hole in the deck, and the deck's price falls accordingly the moment the pool is drawn.",
          "Choosing a paver REPLACES the concrete base rate rather than adding to it. A $25/sq ft porcelain paver deck costs $25 per square foot, not $35 — the published paver rate is the installed rate.",
        ],
        specs: [
          { label: "Concrete deck minimum", value: money(SITE_RATES.deck, "sq ft"), note: "the base surface rate; never quoted below this" },
          { label: "Paver rates", value: "catalogue $/sq ft", note: "replaces the concrete base; one exclusive deck surface" },
          { label: "Penetrating sealer", value: "$1.75/sq ft" },
          { label: "Deck drain", value: "$26/linear ft" },
        ],
        formulas: [
          {
            name: "Net paved area",
            expression: "A_net = A_outline − Σ A_(water, turf, planting, gravel)",
            where: ["all areas from the shoelace formula on the drawn rings"],
            implementedIn: "src/utils/paverAreaLogic.ts and src/lib/design/shapeCrop.ts",
          },
          {
            name: "Polygon area (shoelace)",
            expression: "A = ½ |Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)|",
            where: ["vertices taken in order around a closed ring"],
          },
        ],
        fieldNotes: [
          "Base preparation is what decides whether a paver deck stays flat: compacted sub-base, screeded bedding layer, and a slope of about ⅛ in per foot away from the structure. A paver deck that ponds was a base failure, never a paver failure.",
        ],
      },
    ],
    tools: [
      {
        id: "site-board",
        name: "Site Drawing Board",
        purpose: "Draw every trade in plan on one canvas and read the take-off live.",
        inputs: ["Drawn shapes per trade layer", "Selected options per shape", "Camera altitude / frontage in feet"],
        outputs: ["Areas, perimeters and linear runs per layer", "Itemised estimate with a removable line per option", "Blueprint-ready geometry"],
        method: [
          "Each layer carries its own spline style, cursor and option catalogue, taken from the same source the studio card uses — same titles, same photographs, same prices.",
          "Water bodies, turf and planting automatically crop the deck they overlap, so overlapping shapes still produce one correct number.",
          "Segment dimensions are drawn at the midpoint of each line, not at the corners, because a dimension belongs to the run it measures.",
          "Camera altitude is shared across every board through one persisted value, so a scale set on one board is the scale on all of them.",
        ],
        limits: ["Plan-view only: elevations, grading cuts and drainage design belong to the engineered set."],
      },
    ],
  },

  /* ------------------------------------------------------- turf & plants */
  {
    id: "landscape",
    numeral: "VI",
    kicker: "Ground plane",
    title: "Artificial turf and planting",
    standfirst:
      "Turf is a drainage assembly with grass on top. Planting is a water and light budget. Both are priced per square foot but both live or die on what happens below the surface.",
    sections: [
      {
        id: "turf",
        title: "Turf build-up",
        body: [
          "The assembly from the bottom up is: excavated sub-grade, 3 to 4 inches of compacted crushed base, a screeded levelling course, the turf itself nailed at the perimeter, seams glued and joined, then infill brushed in.",
          "Infill is not filler. It holds the blades upright, weights the carpet against wind lift and carries the antimicrobial function on pet installations. Under-infilled turf lies flat and looks like carpet within a season.",
          "Drainage is through perforated backing into the base. Where the field sits in a low spot, a French drain under the field is the fix; without it the base holds water and the turf smells.",
          "A shock pad is a safety product, not a comfort product: it is what changes a fall height rating on a play area.",
        ],
        specs: [
          { label: "Turf installed base", value: money(TRADE_LAYERS.turf.rate ?? TURF_PRICE_PER_SQFT, "sq ft"), note: "over compacted base, nailed edges, infill and seams" },
          { label: "Pet-grade antimicrobial infill", value: "+$1.40/sq ft" },
          { label: "Shock pad underlay", value: "+$2.10/sq ft" },
          { label: "Bender board edging", value: "$6.50/linear ft" },
          { label: "French drain under field", value: "$22/linear ft" },
        ],
      },
      {
        id: "planting",
        title: "Planting Studio — how plants are actually placed",
        body: [
          "Plants are placed by mature spread, not by nursery pot size. The Planting Studio draws each specimen at its mature canopy so a bed that looks sparse on paper is correct in three years and a bed that looks full on paper is a maintenance problem.",
          "Beds are grouped by hydrozone — plants with the same water demand share a valve. Mixing a xeric palm with a thirsty ornamental on one zone guarantees that one of them is always wrong.",
          "Florida light is the other constraint: full sun on a south-facing wall with reflected heat off a paver deck is a different microclimate from the same bed six feet under a canopy.",
        ],
      },
    ],
    tools: [
      {
        id: "turf-board",
        name: "Artificial Turf board",
        purpose: "Draw the field, choose the product and price the base and infill.",
        inputs: ["Field outline", "Turf product", "Infill, pad, edging and drainage"],
        outputs: ["Net field area after cut-outs", "Priced assembly by layer"],
        method: ["Each catalogued turf is priced at its own published rate as a delta from the base product, so switching product changes one number."],
        limits: ["Sub-grade excavation depth depends on existing soil; the rate assumes a normal 3–4 in base build."],
      },
      {
        id: "planting-board",
        name: "Planting Studio",
        purpose: "Compose beds botanically, with real species footprints and live pricing.",
        inputs: ["Bed outlines", "Species selection", "Spacing"],
        outputs: ["Plant counts by species", "Bed areas", "Priced schedule"],
        method: ["Specimens render at mature spread, and the count follows from bed area and spacing rather than being typed in."],
        limits: ["Irrigation zoning and controller programming are a separate design step."],
      },
    ],
  },

  /* -------------------------------------------------------------- solar */
  {
    id: "solar",
    numeral: "VII",
    kicker: "Energy",
    title: "Solar — the science, in full",
    standfirst:
      "This is the chapter that has to survive an engineer reading it. Everything from the sun's angle to the last dollar of the payback follows from a short chain of physics, and each link is written out with the equation our software actually runs.",
    sections: [
      {
        id: "geometry",
        title: "Where the energy comes from: geometry first",
        body: [
          "Irradiance on a tilted plane depends on the angle between the module's normal and the sun. The controlling relationship is a cosine: as the incidence angle opens, the collected fraction falls with its cosine. That is the whole reason azimuth and tilt matter, and it is why a due-south roof beats a west roof on annual energy while a west roof can beat it on afternoon value.",
          "The optimum fixed tilt is close to the site latitude — about 27° in South Florida. A flat deck is not a disaster: it collects near-optimally once modules are tilt-racked, which is why our model treats a pitch at or below 7° as having no meaningful azimuth penalty at all.",
          "Shade is not linear with area. A shadow across the bottom of a string can cost far more than its share of the surface, because current in a series string is limited by its worst cell group. Per-module optimisers exist to break that dependency, and that is the only honest reason to pay for them.",
        ],
        specs: [
          { label: "Peak sun hours, ideal FL plane", value: `${FL_PEAK_SUN_HOURS.toLocaleString()} h/yr`, note: "reference plane used by the model" },
          { label: "System derate", value: `${Math.round(SYSTEM_DERATE * 100)}%`, note: "inverter, wiring, soiling and temperature losses" },
          { label: "Module degradation", value: `${(PANEL_DEGRADATION * 100).toFixed(1)}%/yr`, note: "warranty-grade linear loss" },
          { label: "Fire-code setback kept clear", value: `${SETBACK_FT} ft`, note: "ridges, hips, valleys and eaves" },
        ],
        formulas: [
          {
            name: "Relative annual irradiance on a face",
            expression: "score = f_azimuth × orientation weight × (1 − shade)",
            where: [
              "f_azimuth = 0.62 + 0.38·cos(offset from due south)",
              "orientation weight — penalty growing with distance from the optimum tilt, compounded when the face also points away from the sun",
              "shade — shading loss dialled in on the face, capped at 0.6",
            ],
            implementedIn: "src/lib/solar/solarEngine.ts · faceIrradianceScore",
          },
          {
            name: "Annual DC energy for a face",
            expression: "kWh = panels × W_module × sun hours × 0.84 ÷ 1,000",
            where: ["sun hours — measured where the address is covered, otherwise peak hours × score", "0.84 — array-level loss factor"],
            implementedIn: "src/lib/solar/solarEngine.ts · layoutFace",
          },
        ],
      },
      {
        id: "fit",
        title: "How many modules actually fit",
        body: [
          "This is where most proposals fail, and the failure is always optimistic. A roof face's reported area is never all rackable: the fire setback ring is removed first, then row gaps, staggered courses, hips, vent stacks, plumbing boots and the equipment path take their share.",
          `Our layout removes the setback ring, subtracts a fixed obstruction allowance and then applies a packing factor of ${SOLAR_PACKING} — calibrated against installed Florida jobs, including the case where a homeowner was sold 47 modules and 36 physically fit.`,
          "That calibration is the single most valuable number in the chapter, because it is the difference between a design and a delivery.",
        ],
        formulas: [
          {
            name: "Modules per face",
            expression: "n = floor( (usable area − obstructions) × packing ÷ module area )",
            where: [
              `usable area — (√A_sloped − 2 × ${SETBACK_FT} ft)² after the setback ring`,
              "obstructions — fixed 45 sq ft allowance per face",
              `packing — ${SOLAR_PACKING}`,
            ],
            implementedIn: "src/lib/solar/solarEngine.ts · layoutFace",
            source: "Calibrated on installed Florida arrays",
          },
          {
            name: "Sloped area from footprint",
            expression: "A_sloped = A_plan ÷ cos(pitch)",
            where: ["A_plan — the plan (footprint) area of the traced face", "pitch — roof slope in degrees"],
          },
        ],
      },
      {
        id: "suitability",
        title: "Is the roof suitable at all? The NREL screen",
        body: [
          "NREL's national rooftop-potential study decided whether roof area counted with four tests, and we run the same four so a rejected face can be defended rather than asserted.",
          "The shading test is the subtle one: a face must still produce at least 70% of what an IDENTICAL unshaded face would make — same tilt, same azimuth. Orientation is held constant so the test measures shade and nothing else.",
        ],
        specs: [
          { label: "Shading", value: `≥ ${Math.round(NREL_SUITABILITY.minShadedProductionRatio * 100)}% of unshaded` },
          { label: "Tilt", value: `≤ ${NREL_SUITABILITY.maxTiltDeg}°` },
          { label: "Azimuth", value: "not north-facing (±45° of north excluded)" },
          { label: "Contiguous area", value: `≥ ${NREL_SUITABILITY.minContiguousAreaM2} m² (${Math.round(NREL_SUITABILITY.minContiguousAreaSqFt)} SF)` },
        ],
        codes: [
          { clause: "NREL 2016 / ERL 13 024027", requirement: "Rooftop suitability criteria and building-class definitions (small < 5,000 SF)." },
          { clause: "DOE CMEI", requirement: "Technical potential is an upper bound — not economic or market potential." },
        ],
      },
      {
        id: "money",
        title: "From kilowatt-hours to money",
        body: [
          `Installed cost is calibrated at $${SOLAR_PER_WATT.toFixed(2)} per watt on a tile roof, anchored to a real ${"$"}37,000 / 36-module QCells job with no battery. Cost per watt, not cost per panel, is the number to compare proposals with.`,
          `Value in year one is the energy delivered times the retail rate — Florida net metering credits export at the same retail rate, so the arithmetic is simply energy × rate. We hold the base retail rate at ${(FL_UTILITY_RATE * 100).toFixed(1)}¢/kWh and escalate it ${(UTILITY_ESCALATION * 100).toFixed(1)}% a year.`,
          `The federal investment tax credit is taken at ${Math.round(FEDERAL_CREDIT_RATE * 100)}% of installed cost in year one. Payback is the year the cumulative position crosses zero, interpolated within the year rather than rounded to it.`,
          "LCOE is the number that lets solar be compared with the utility on equal terms: discounted lifecycle cost divided by discounted lifetime energy. If LCOE sits below today's retail rate, the system is cheaper than the grid over its life — and unlike the utility rate, it does not escalate.",
        ],
        formulas: [
          {
            name: "Levelised cost of energy",
            expression: "LCOE = Σ[Cₜ/(1+d)ᵗ] ÷ Σ[Eₜ/(1+d)ᵗ]",
            where: ["Cₜ — cost in year t (net of the credit, plus O&M or loan/PPA payments)", "Eₜ — energy in year t after degradation", "d — discount rate"],
            implementedIn: "src/lib/solar/financeModel.ts",
            source: "NREL LCOE convention",
          },
          {
            name: "Energy in year t",
            expression: "Eₜ = E₁ × (1 − degradation)^(t−1)",
            where: [`degradation — ${(PANEL_DEGRADATION * 100).toFixed(1)}% per year`],
          },
          {
            name: "Utility rate in year t",
            expression: "rₜ = r₁ × (1 + escalation)^(t−1)",
            where: [`escalation — ${(UTILITY_ESCALATION * 100).toFixed(1)}% per year`],
          },
          {
            name: "Level loan payment",
            expression: "P = L·i ÷ (1 − (1+i)^−n)",
            where: ["L — financed amount", "i — monthly rate (APR ÷ 12)", "n — payments"],
          },
        ],
        fieldNotes: [
          "Batteries do not pay back on energy arbitrage under 1:1 net metering. They buy resilience. Price them as resilience and the conversation stays honest.",
        ],
      },
      {
        id: "astronomy",
        title: "The sun path console",
        body: [
          "The performance console is astronomical, not decorative. Solar position, lunar phase and planetary positions are computed from the Julian day for the selected date and location, so the transit arc drawn over the roof is the real arc for that address.",
          "This matters commercially: a homeowner who can see the December arc sitting low over their own tree line understands winter production without being told a number.",
        ],
        formulas: [
          {
            name: "Solar declination (approximation)",
            expression: "δ ≈ 23.45° × sin(360° × (284 + n) ÷ 365)",
            where: ["n — day of year"],
          },
          {
            name: "Solar altitude at solar noon",
            expression: "α = 90° − |latitude − δ|",
            where: ["δ — declination for the day"],
          },
        ],
      },
    ],
    tools: [
      {
        id: "solar-calculator",
        name: "Total Solar Calculator",
        route: "/solar-board",
        purpose: "Trace the roof from aerial imagery and produce a laid-out, priced array.",
        inputs: ["Address", "Traced roof faces with pitch, azimuth and shade", "Module, battery, roof covering, bill, service run"],
        outputs: ["Modules per face and system kW", "Annual and monthly kWh", "Full bill of materials and installed price"],
        method: [
          "Faces come from Google roof segments where the address is covered, otherwise from a click that flood-fills the plane on the aerial tile; either way every vertex stays editable.",
          "Each face is scored for exposure, laid out for modules, then summed into system DC/AC capacity and energy.",
          "Cable, conduit and feeder lengths are derived from the geometry — the longest roof span plus a two-storey drop plus the entered service run — not guessed.",
        ],
        limits: [
          "Aerial pitch is an estimate until measured. A wrong pitch changes sloped area and therefore module count.",
          "Interconnection, panel capacity and utility approval are not modelled; they are survey and permit items.",
        ],
      },
      {
        id: "solar-genius",
        name: "Solar Genius",
        route: "/solar-genius",
        purpose: "Turn the traced roof into a defensible study: suitability, national benchmark, finance and a dealer sheet.",
        inputs: ["The live solar session from the board", "Finance terms: mode, APR, term, PPA rate, escalation, discount rate"],
        outputs: ["Per-face suitability verdict with reasons", "Benchmarks against national rooftop data", "Cash/loan/PPA payback, NPV, IRR, LCOE", "Consumer report and WONDERMAGIC dealer sheet"],
        method: [
          "The four NREL tests run per face; a failure on tilt, azimuth or area rejects the face, a failure on shading alone marks it marginal.",
          "The roof's developable share, capacity density and specific yield are compared against the published national figures for its building class.",
          "Sensitivity is one-at-a-time: each driver is pushed both ways and payback and net position are re-solved, so the reader sees which assumption matters.",
        ],
        limits: ["Benchmarks are technical potential, an upper bound. They contextualise a quote; they never replace one."],
      },
    ],
  },

  /* ---------------------------------------------------- drawing science */
  {
    id: "geometry-tools",
    numeral: "VIII",
    kicker: "Drafting engine",
    title: "Curvature, cropping and the drawing boards",
    standfirst:
      "Every board in the platform shares one drafting engine. It is worth understanding, because it is what lets a hand-drawn lagoon edge produce a number a contractor can order material against.",
    sections: [
      {
        id: "curvature",
        title: "Arcs, not guesses",
        body: [
          "A segment between two vertices can be straight, a true circular arc, or a spline. Arcs are stored as a bulge — the sagitta of the arc divided by half the chord — which is the notation CAD systems use, because it survives moving either endpoint.",
          "Storing the bulge rather than a radius means the designer can drag a vertex and keep the curve's character; the radius simply re-solves. A bulge of 1 is a semicircle, the tightest arc a single run can hold.",
          "Fillets round a corner by inserting an arc tangent to both adjacent runs. Because the tangency is solved rather than eyeballed, a filleted corner measures correctly instead of nearly correctly.",
        ],
        formulas: [
          {
            name: "Arc radius from chord and sagitta",
            expression: "R = (c²/4 + s²) ÷ (2s)",
            where: ["c — chord length between the two vertices", "s — sagitta, the arc's maximum offset from the chord"],
            implementedIn: "src/lib/design/curvature.ts · arcMetrics",
          },
          {
            name: "Bulge",
            expression: "bulge = s ÷ (c/2)",
            where: ["bulge = 1 is a semicircle; sign selects which side the arc bows"],
          },
          {
            name: "Arc length",
            expression: "L = R × θ,  θ = 2·asin(c ÷ 2R)",
            where: ["θ — included angle in radians"],
          },
        ],
      },
      {
        id: "cropping",
        title: "Cropping with true logic",
        body: [
          "Shapes are allowed to overlap, because that is how a site actually reads: a pool sits inside a deck, a spa sits inside a ledge, turf runs up to a patio. What must not happen is paying for the same square foot twice.",
          "The engine keeps an explicit table of which layer cuts which. Water bodies, turf, gravel and planting cut decks, patios and driveways; they do not cut each other. A cut is a real polygon difference producing a shape with holes, and area is then the outer ring minus the holes.",
          "Because cropping happens in geometry rather than in the price, the drawing, the take-off and the estimate can never disagree.",
        ],
        formulas: [
          {
            name: "Net area of a cropped shape",
            expression: "A = A_outer − Σ A_holes",
            where: ["each ring measured by the shoelace formula"],
            implementedIn: "src/lib/design/shapeCrop.ts",
          },
        ],
      },
      {
        id: "scale",
        title: "Scale, altitude and dimensioning",
        body: [
          "All boards share one persisted camera altitude, expressed as the frontage in feet visible across the canvas. A scale chosen on the pool board is the scale on the solar board, which is what makes a combined site drawing trustworthy.",
          "Dimensions annotate the midpoint of each segment. Corner-anchored dimensions are ambiguous when two runs meet at an angle; a midpoint dimension belongs to exactly one run.",
          "Vertex editing follows the cursor: a new point rides the spline under the pointer until it is dropped, and deleting a point is a deliberate two-step on the point you selected — never the nearest one.",
        ],
        specs: [
          { label: "Default frontage", value: "70 ft", note: "tuned for pool and patio work; 400 ft available for full-lot studies" },
          { label: "2D studio scale", value: "10 px per foot", note: "shared by the 2D and 3D pipelines" },
        ],
      },
    ],
    tools: [
      {
        id: "global-board",
        name: "Global Design Board",
        route: "/global-design-board",
        purpose: "One canvas carrying every trade, with the full project take-off and one-click blueprint export.",
        inputs: ["Shapes across pool, spa, ledge, deck, enclosure, fence, turf, planting and solar layers", "Per-element options"],
        outputs: ["Project-wide dossier: quantities, specifications and priced estimate by trade", "Blueprint-ready plan"],
        method: [
          "Each trade loads its own spline style, cursor, calculator and option catalogue — the same ones its dedicated board uses.",
          "Selecting an element opens its options; arming a layer lets specifications be chosen before the shape is drawn.",
          "The estimate is itemised per option with a thumbnail and a removal control, so any line can be taken off without redrawing.",
        ],
        limits: ["It is a design and estimating instrument. Permit drawings still require the blueprint set and an engineer of record."],
      },
      {
        id: "blueprint-builder",
        name: "Blueprint Builder",
        route: "/blueprint-builder",
        purpose: "Produce and edit a signed plan set, including imported drawings.",
        inputs: ["Global board geometry, or an imported PDF, JPG, DXF, SVG or vector file", "Information boxes and signatures"],
        outputs: ["Editable vertex plan", "Title block and information boxes", "Signed, printable sheet"],
        method: [
          "Imports are converted into editable vertex plans, so a legacy PDF or scan becomes drafting geometry rather than a background image.",
          "Signatures are captured multi-modally and comply with Florida's statutory electronic-signature requirements.",
        ],
        limits: ["Raster imports are traced; verify critical dimensions against the survey before sealing."],
      },
    ],
  },

  /* ----------------------------------------------------------- flip v7 */
  {
    id: "flip",
    numeral: "IX",
    kicker: "The publication",
    title: "FLIP V7 — the narrated edition",
    standfirst:
      "FLIP is the delivery system for everything above: a paged magazine where each product category has its own book, each book carries its own drawing boards, and every price on a page is the same price the studio quotes.",
    sections: [
      {
        id: "architecture",
        title: "How the edition is built",
        body: [
          "A book is a category. Its pages are leaves; two facing leaves form a spread. A drawing board occupies a spread so the canvas sits on one leaf and its console on the other, which is why boards inside FLIP feel like instruments rather than embedded widgets.",
          "Product lists are capped at five per page. Overflow creates additional pages instead of an unscrollable list, which is how the index can promise that every product is reachable.",
          "Imagery is strictly brand-scoped and category-scoped. A sauna book cannot show pool specifications and a Latham page cannot show a GlimmerGlass finish — the allow-lists are enforced in code, not by editorial care.",
          "Page turning is suppressed while a tool has focus, so an address search or a vertex drag can never flip the page out from under the reader.",
        ],
        specs: [
          { label: "Products per page", value: "5", note: "overflow paginates automatically" },
          { label: "Widget presets", value: "49", note: "available to the FLIP Builder" },
          { label: "Index", value: "Plate Index (visual mosaic)", note: "no repeated contents table inside the books" },
        ],
      },
      {
        id: "genius",
        title: "Genius, and the cost discipline behind it",
        body: [
          "Genius is the assistant in the FLIP rail. She reads the viewport, narrates the page, answers product questions, books consultations and can drive the screens.",
          "The important engineering decision is economic: her text is generated LOCALLY from the page content and the product catalogue. Hosted AI is a last-resort fallback for support text, and voice synthesis is the other billed step. That is why narration can be offered on every page without a per-page cost.",
          "Language is detected automatically and the interface translates with it. Staff routes are never exposed through her, regardless of how a question is phrased.",
        ],
      },
      {
        id: "pricing-truth",
        title: "One source of price",
        body: [
          "Every board, book, card and estimate reads the same catalogues. Trade layers pull option titles, photographs and prices from the studio's own product configuration, and the site estimate pulls its rates from those trade layers.",
          "The consequence is the property we care about most: a number cannot differ between the FLIP page, the drawing board, the quote and the invoice, because there is only one number.",
        ],
        specs: [
          { label: "Pool shell", value: money(SITE_RATES.pool, "sq ft") },
          { label: "Spa / ledge", value: money(SITE_RATES.spa, "sq ft") },
          { label: "Deck base", value: money(SITE_RATES.deck, "sq ft") },
          { label: "Screen enclosure", value: money(SITE_RATES.enclosure, "sq ft") },
          { label: "Turf", value: money(SITE_RATES.turf, "sq ft") },
          { label: "Pool barrier", value: money(FENCE_RATE_PER_FT, "linear ft") },
          { label: "Solar", value: `$${SOLAR_PER_WATT.toFixed(2)}/W installed`, note: `${SOLAR_PACKING} roof packing factor` },
        ],
      },
    ],
    tools: [
      {
        id: "flip-v7",
        name: "FLIP V7 magazine",
        route: "/flip",
        purpose: "Read the whole catalogue as a narrated magazine, with working tools on the page.",
        inputs: ["Category selection from the Plate Index", "Interaction with any embedded board"],
        outputs: ["Priced configurations", "Cart and quote lines", "Narrated walkthroughs"],
        method: [
          "Riffle transitions and page-lift corner hints are centralised, so every book animates identically.",
          "Contents rows reveal image and description on hover instead of listing bare text.",
        ],
        limits: ["The books present catalogue pricing. Site-specific conditions still come from the survey."],
      },
      {
        id: "flip-builder",
        name: "FLIP Builder",
        purpose: "Compose custom pages from blocks and widgets, then publish them.",
        inputs: ["Blocks, widgets and copy", "Palette and typeface selection"],
        outputs: ["A publishable book"],
        method: ["Block-based editing over the same widget library the standard books use, so a custom page inherits every behaviour."],
        limits: ["Custom pages inherit the category allow-lists — a block cannot be made to show another brand's imagery."],
      },
    ],
  },
];

export const chapterById = (id: string) => MANUAL_CHAPTERS.find((c) => c.id === id);

/** Every tool in the manual, flattened — used by the tool index. */
export const ALL_TOOLS = MANUAL_CHAPTERS.flatMap((c) =>
  c.tools.map((t) => ({ ...t, chapterId: c.id, chapterTitle: c.title })),
);
