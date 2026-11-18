/**
 * The homeowner management agreement — the click agreement a project owner
 * accepts when they award a proposal (founder spec 2026-11-18). The
 * substance is legally complete; the words are kept very simple and clear
 * on purpose. The exact text built here is what the owner sees in the
 * dialog AND what is stored on the management_agreements record, so the
 * two can never drift apart.
 *
 * Terms carried, in the founder's order: posting is free; no accepted
 * budget means the owner pays nothing; accepting hires Wonderlands World
 * Experience LLC to manage the project as the owner's representative (the
 * owner talks only to Wonderlands); the management fee is 10% of the
 * accepted budget, paid in the first payment, with the numbers shown;
 * Wonderlands does not do the construction work and is not responsible for
 * the subcontractors' work; replacement costs after a subcontractor
 * failure are the owner's; Wonderlands' duties (manage, vet licenses,
 * make sure the work is done, replace failures, permits through a
 * third-party expediter, Wonderlands' GC license if needed); and no other
 * charges to the owner on top of the 10%.
 *
 * The contractor-side award fee is NEVER mentioned here (founder rule).
 * Credits: Imagine Engine Studios Corp.
 */
import { HOMEOWNER_MANAGEMENT_FEE_PERCENT, feeAmountFor } from "./feeConfig";

export const MANAGEMENT_AGREEMENT_VERSION = "2026-11-18-v2";

export const MANAGEMENT_AGREEMENT_TITLE = "Management agreement with Wonderlands";

const money = (n: number) => `$${Number(n).toLocaleString()}`;

export interface BuiltManagementAgreement {
  feePercent: number;
  feeAmount: number;
  /** Paragraphs in display order — the dialog renders exactly these. */
  paragraphs: string[];
  /** The paragraphs as one stored text (what the record keeps). */
  text: string;
}

export function buildManagementAgreement(contractAmount: number): BuiltManagementAgreement {
  const feePercent = HOMEOWNER_MANAGEMENT_FEE_PERCENT;
  const feeAmount = feeAmountFor(contractAmount, feePercent);
  const paragraphs = [
    "Posting your project on Wonderlands is free. Looking at the proposals you receive is free too.",
    "If you do not accept any proposal, and nobody is hired for your project, you pay Wonderlands nothing at all.",
    "When you click “I accept”, you hire Wonderlands World Experience LLC to manage this project for you. Wonderlands is your representative. Wonderlands finds the subcontractors, stands between you and them, and manages the contracts with them. You communicate only with Wonderlands. Wonderlands deals with the rest.",
    `Your accepted budget for this work is ${money(contractAmount)}. That is the price in the proposal you are accepting. Wonderlands charges a management fee of ${feePercent}% of that amount, which is ${money(feeAmount)}. This fee is included in your first payment.`,
    "Wonderlands does not do the construction work itself, and Wonderlands is not responsible for the work the subcontractors are hired to do.",
    "If a subcontractor fails and you need to hire somebody else, any extra cost of the replacement is yours to pay.",
    "This is what Wonderlands does for you: Wonderlands runs and manages the project; makes sure every contractor on the project is licensed and vetted; makes sure the contractors do the work they were hired to do; hires a replacement if one of them fails; arranges the permits for the project through a third-party company that expedites permits; and, if the project needs it, puts its general contractor license on the project. If a subcontractor has its own general contractor license, that subcontractor uses its own license instead.",
    `There are no other charges from Wonderlands to you on top of this management fee. The ${feePercent}% is all you pay Wonderlands for managing this project.`,
  ];
  return { feePercent, feeAmount, paragraphs, text: paragraphs.join("\n\n") };
}
