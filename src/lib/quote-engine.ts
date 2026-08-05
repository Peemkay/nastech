/**
 * Trade-in quote engine.
 *
 * A device's quote starts at its model's `baseValueKobo` (best condition,
 * top storage tier) and is reduced by the deduction (in basis points, i.e.
 * 1/100 of a percent) attached to whichever condition-question option the
 * seller picks. Deductions stack additively and are capped so a quote never
 * drops below a floor percentage of the base value.
 */

export type QuoteAnswerOption = { questionId: string; optionId: string; deductionBps: number };

const MAX_TOTAL_DEDUCTION_BPS = 9000; // never deduct more than 90%
const MIN_QUOTE_FLOOR_BPS = 1000; // quote never falls below 10% of base value
const MIN_QUOTE_FLOOR_KOBO = 200000; // ...or ₦2,000, whichever is higher

export function computeQuoteKobo(baseValueKobo: number, selectedOptions: { deductionBps: number }[]) {
  const totalDeductionBps = Math.min(
    selectedOptions.reduce((sum, o) => sum + o.deductionBps, 0),
    MAX_TOTAL_DEDUCTION_BPS,
  );

  const raw = Math.round((baseValueKobo * (10000 - totalDeductionBps)) / 10000);
  const floor = Math.max(Math.round((baseValueKobo * MIN_QUOTE_FLOOR_BPS) / 10000), MIN_QUOTE_FLOOR_KOBO);

  return Math.max(raw, Math.min(floor, baseValueKobo));
}
