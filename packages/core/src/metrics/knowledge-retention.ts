import { z } from "zod";
import type { MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { KnowledgeRetentionTemplate } from "../templates/knowledge-retention.js";
import type { LLMTestCase } from "../test-case.js";

const evaluationSchema = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

export class KnowledgeRetentionMetric extends BaseMetric {
  readonly name = "Knowledge Retention";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput"];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    if (!testCase.conversation || testCase.conversation.turns.length < 2) {
      throw new Error(
        `[${this.name}] This metric requires a "conversation" with at least 2 turns.`,
      );
    }

    // Step 1: LLM evaluates knowledge retention across conversation
    const evaluation = await this.provider.generateJSON(
      KnowledgeRetentionTemplate.evaluate(
        testCase.conversation.turns,
        testCase.input,
        testCase.actualOutput!,
      ),
      evaluationSchema,
    );

    // Step 2: Normalize 1-5 score to 0-1
    let score = (evaluation.score - 1) / 4;
    score = this.applyStrictMode(score);

    // Step 3: Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      reason = evaluation.reason;
    }

    return this.buildResult(score, reason, start, {
      rawScore: evaluation.score,
    });
  }
}
