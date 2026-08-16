/**
 * The Wonderlands turn-key scope.
 *
 * These are the ONLY lines that are fitted/delivered as standard on every
 * pool, spa and tanning ledge. Everything else — waterline tile, shell shape,
 * depth profile, finishes, coping, heaters, jets, enclosures — is a *selection*
 * the client makes and is priced as configured in Wonderlands Studio.
 */

export interface TurnkeyScopeItem {
  label: string;
  note: string;
}

export const TURNKEY_SCOPE: TurnkeyScopeItem[] = [
  { label: "Salt water system", note: "Fitted as standard on every pool we install" },
  { label: "Pentair pump and filtration package", note: "Pump, filter, plumbing and start-up" },
  { label: "Permits and municipal fees", note: "Filed and carried by Wonderlands World" },
  { label: "Construction drawings", note: "Site plan, sections and details issued for permit" },
  { label: "Engineering and architecture", note: "Sealed structural engineering and architectural review" },
  { label: "Inspections", note: "All scheduled county and city inspections through final" },
  { label: "Digging and excavation", note: "Layout, excavation and spoil removal" },
  { label: "Land work and grading", note: "Rough and final grade, compaction and drainage" },
  { label: "Site and soil studies", note: "Survey review, soil and water-table assessment" },
  { label: "Deliveries", note: "Shell, equipment and material deliveries to your address" },
  { label: "Logistics and craning", note: "Access planning, craning or transport as the site requires" },
  { label: "Sourcing and procurement", note: "Materials sourced and warehoused ahead of each phase" },
  { label: "Specialist subcontracting", note: "Licensed electrical, gas, plumbing and screen trades" },
  { label: "Project management to turn-key", note: "One project manager from contract to handover" },
];

/**
 * Keywords that identify a turn-key scope line. Deliberately narrow: a
 * selection such as "Ocean Blue waterline" must never read as standard.
 */
const SCOPE_MATCHERS: RegExp[] = [
  /salt\s*water|salt\s*system/i,
  /pentair|pump|filtration/i,
  /permit/i,
  /construction drawing|drawings?\b/i,
  /engineering|architectur/i,
  /inspection/i,
  /excavat|digging/i,
  /land work|grading/i,
  /soil|site stud|survey/i,
  /deliver/i,
  /logistic|cran/i,
  /sourcing|procurement/i,
  /subcontract/i,
  /project manage|turn[- ]key/i,
];

/** True only for lines that belong to the standard turn-key scope. */
export const isTurnkeyScopeLine = (label: string): boolean =>
  SCOPE_MATCHERS.some((re) => re.test(label));
