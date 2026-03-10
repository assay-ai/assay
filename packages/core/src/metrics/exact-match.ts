import type { LLMTestCase } from "../test-case.js";
import type { MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import type { MetricConfig } from "../metric.js";

export interface ExactMatchConfig extends MetricConfig {
  /** Whether to ignore case when comparing (default: false) */
  ignoreCase?: boolean;
  /** Whether to trim whitespace when comparing (default: true) */
  trimWhitespace?: boolean;
}

export class ExactMatchMetric extends BaseMetric {
  readonly name = "Exact Match";
  readonly requiredFields: (keyof LLMTestCase)[] = ["actualOutput", "expectedOutput"];
  readonly requiresProvider = false;

  private readonly ignoreCase: boolean;
  private readonly trimWhitespace: boolean;

  constructor(config?: ExactMatchConfig) {
    super({ ...config, provider: undefined as never });
    this.ignoreCase = config?.ignoreCase ?? false;
    this.trimWhitespace = config?.trimWhitespace ?? true;
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    let actual = testCase.actualOutput!;
    let expected = testCase.expectedOutput!;

    if (this.trimWhitespace) {
      actual = actual.trim();
      expected = expected.trim();
    }

    if (this.ignoreCase) {
      actual = actual.toLowerCase();
      expected = expected.toLowerCase();
    }

    const score = actual === expected ? 1 : 0;
    const reason = score === 1 ? "Output exactly matches expected output." : "Output does not match expected output.";

    return this.buildResult(score, reason, start);
  }
}
