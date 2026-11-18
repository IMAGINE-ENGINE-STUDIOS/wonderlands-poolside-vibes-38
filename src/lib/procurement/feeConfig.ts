/**
 * Procurement fee configuration — the ONE place the platform's award fees
 * are set. Change a number here and every new award uses it; awards already
 * made keep the numbers recorded on them at award time, so history never
 * rewrites itself.
 *
 * HOMEOWNER_MANAGEMENT_FEE_PERCENT — what a project owner pays Wonderlands
 * to manage their project when they accept a proposal (the management
 * agreement). Founder ruling 2026-11-18: 10% of the accepted budget,
 * collected in the first payment, and nothing charged to the homeowner on
 * top of it. This is the only fee a homeowner ever sees.
 *
 * CONTRACTOR_AWARD_FEE_PERCENT — what the HIRED subcontractor pays
 * Wonderlands when they win a contract. Founder ruling 2026-11-18: the
 * rate is "something about 10 or 8%" — NOT finally fixed, so it lives here
 * as one configurable value (default 10) inside the founder's 8–10% range.
 * HARD RULE: this fee is contractor-side only. It must never appear in the
 * management agreement, in My Postings, in bid comparisons, on the public
 * board, or in any notification sent to a project owner.
 * Credits: Imagine Engine Studios Corp.
 */

export const HOMEOWNER_MANAGEMENT_FEE_PERCENT = 10;

export const CONTRACTOR_AWARD_FEE_PERCENT = 10;

/** Round a fee amount to cents. */
export const feeAmountFor = (contractAmount: number, percent: number): number =>
  Math.round(contractAmount * percent) / 100;
