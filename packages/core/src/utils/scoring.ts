/**
 * Common scoring utilities for evaluation metrics.
 */

/**
 * Safe division returning 0 when total is 0.
 * Result is clamped to [0, 1].
 */
export function ratio(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.max(0, Math.min(1, count / total));
}

/**
 * Compute a weighted average of values.
 * If weights sum to 0, returns 0.
 *
 * @throws {Error} if values and weights have different lengths.
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error(
      `values and weights must have the same length (got ${values.length} and ${weights.length})`,
    );
  }

  if (values.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < values.length; i++) {
    const w = weights[i]!;
    const v = values[i]!;
    weightedSum += v * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

/**
 * Compute Mean Average Precision (MAP) from a list of relevance judgments.
 * Used for evaluating contextual precision - how well relevant items
 * are ranked before irrelevant ones.
 *
 * @param relevances - Array of boolean values indicating whether each item is relevant.
 * @returns MAP score between 0 and 1.
 */
export function meanAveragePrecision(relevances: boolean[]): number {
  if (relevances.length === 0) return 0;

  let relevantCount = 0;
  let precisionSum = 0;

  for (let i = 0; i < relevances.length; i++) {
    if (relevances[i]) {
      relevantCount++;
      // Precision at this position
      precisionSum += relevantCount / (i + 1);
    }
  }

  if (relevantCount === 0) return 0;
  return precisionSum / relevantCount;
}
