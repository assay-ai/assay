import type { BaseLLMProvider } from "./providers/base.js";
import { resolveProvider } from "./providers/index.js";
import type { LLMTestCase } from "./test-case.js";

export interface MetricResult {
  /** Score from 0 to 1 */
  score: number;
  /** LLM-generated explanation of the score */
  reason?: string;
  /** Whether the score meets the threshold */
  pass: boolean;
  /** Name of the metric */
  metricName: string;
  /** Threshold used */
  threshold: number;
  /** Time taken in ms */
  evaluationTimeMs: number;
  /** Details for debugging (extracted statements, verdicts, etc.) */
  details?: Record<string, unknown>;
}

export interface MetricConfig {
  /** Score threshold for pass/fail (default: 0.5) */
  threshold?: number;
  /** LLM provider to use for evaluation */
  provider?: BaseLLMProvider | string;
  /** Include reasoning in results (default: true) */
  includeReason?: boolean;
  /** Binary scoring mode — 0 or 1 only (default: false) */
  strictMode?: boolean;
  /** Enable verbose logging (default: false) */
  verbose?: boolean;
}

export abstract class BaseMetric {
  abstract readonly name: string;
  abstract readonly requiredFields: (keyof LLMTestCase)[];

  readonly threshold: number;
  readonly includeReason: boolean;
  readonly strictMode: boolean;
  readonly verbose: boolean;

  /** Whether a lower score is better (e.g., Hallucination, Bias, Toxicity) */
  readonly lowerIsBetter: boolean = false;

  protected provider: BaseLLMProvider;

  constructor(config?: MetricConfig) {
    this.threshold = config?.threshold ?? 0.5;
    this.includeReason = config?.includeReason ?? true;
    this.strictMode = config?.strictMode ?? false;
    this.verbose = config?.verbose ?? false;
    this.provider = resolveProvider(config?.provider);
  }

  /** Run the metric evaluation. Must be implemented by each metric. */
  abstract measure(testCase: LLMTestCase): Promise<MetricResult>;

  /** Validate that required fields exist on the test case */
  protected validate(testCase: LLMTestCase): void {
    for (const field of this.requiredFields) {
      const value = testCase[field];
      if (value === undefined || value === null) {
        throw new Error(
          `[${this.name}] Missing required field: "${field}". ` +
            `This metric requires: ${this.requiredFields.join(", ")}`,
        );
      }
    }
  }

  /** Apply strict mode (binary 0/1) if enabled */
  protected applyStrictMode(score: number): number {
    if (!this.strictMode) return score;
    if (this.lowerIsBetter) {
      return score <= this.threshold ? 0 : 1;
    }
    return score >= this.threshold ? 1 : 0;
  }

  /** Build a MetricResult from score, reason, and timing */
  protected buildResult(
    score: number,
    reason: string | undefined,
    startTime: number,
    details?: Record<string, unknown>,
  ): MetricResult {
    const clamped = Math.max(0, Math.min(1, score));
    const pass = this.lowerIsBetter
      ? clamped <= this.threshold
      : clamped >= this.threshold;

    return {
      score: clamped,
      reason,
      pass,
      metricName: this.name,
      threshold: this.threshold,
      evaluationTimeMs: performance.now() - startTime,
      details,
    };
  }
}
