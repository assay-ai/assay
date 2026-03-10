import { z } from "zod";
import type { MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { RoleAdherenceTemplate } from "../templates/role-adherence.js";
import type { LLMTestCase } from "../test-case.js";

const evaluationSchema = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

export class RoleAdherenceMetric extends BaseMetric {
  readonly name = "Role Adherence";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput"];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    if (!testCase.conversation) {
      throw new Error(
        `[${this.name}] This metric requires a "conversation" field on the test case.`,
      );
    }

    if (!testCase.conversation.chatbotRole) {
      throw new Error(`[${this.name}] This metric requires "chatbotRole" on the conversation.`);
    }

    // Step 1: LLM evaluates role adherence
    const evaluation = await this.provider.generateJSON(
      RoleAdherenceTemplate.evaluate(
        testCase.conversation.turns,
        testCase.conversation.chatbotRole,
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
