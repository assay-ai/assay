import { z } from "zod";
import type { MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { TaskCompletionTemplate } from "../templates/task-completion.js";
import type { LLMTestCase } from "../test-case.js";

const evaluationSchema = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

export class TaskCompletionMetric extends BaseMetric {
  readonly name = "Task Completion";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput"];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    const { score: rawScore, reason: llmReason } = await this.provider.generateJSON(
      TaskCompletionTemplate.evaluate(testCase.input, testCase.actualOutput!),
      evaluationSchema,
    );

    // Normalize 1-5 scale to 0-1: (raw - 1) / 4
    let score = (rawScore - 1) / 4;
    score = this.applyStrictMode(score);

    const reason = this.includeReason ? llmReason : undefined;

    return this.buildResult(score, reason, start, { rawScore });
  }
}
