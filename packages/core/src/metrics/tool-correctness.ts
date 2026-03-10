import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import type { LLMTestCase } from "../test-case.js";

export interface ToolCorrectnessConfig extends MetricConfig {
  /** Whether to also compare tool input parameters (default: false) */
  matchParameters?: boolean;
}

export class ToolCorrectnessMetric extends BaseMetric {
  readonly name = "Tool Correctness";
  readonly requiredFields: (keyof LLMTestCase)[] = ["toolsCalled", "expectedTools"];
  readonly requiresProvider = false;

  private readonly matchParameters: boolean;

  constructor(config?: ToolCorrectnessConfig) {
    super({ ...config, provider: undefined as never });
    this.matchParameters = config?.matchParameters ?? false;
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    const toolsCalled = testCase.toolsCalled!;
    const expectedTools = testCase.expectedTools!;

    if (expectedTools.length === 0) {
      return this.buildResult(1, "No expected tools specified — trivially correct.", start);
    }

    const calledNames = new Set(toolsCalled.map((t) => t.name));
    let matchCount = 0;

    for (const expected of expectedTools) {
      if (!calledNames.has(expected.name)) {
        continue;
      }

      if (this.matchParameters) {
        const calledTool = toolsCalled.find((t) => t.name === expected.name);
        if (
          calledTool &&
          JSON.stringify(calledTool.inputParameters) === JSON.stringify(expected.inputParameters)
        ) {
          matchCount++;
        }
      } else {
        matchCount++;
      }
    }

    let score = matchCount / expectedTools.length;
    score = this.applyStrictMode(score);

    const reason =
      score === 1
        ? "All expected tools were called correctly."
        : `${matchCount} of ${expectedTools.length} expected tools were called correctly.`;

    return this.buildResult(score, reason, start, {
      matchCount,
      expectedCount: expectedTools.length,
      calledCount: toolsCalled.length,
    });
  }
}
