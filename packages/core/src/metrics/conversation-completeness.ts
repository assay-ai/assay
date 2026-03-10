import { z } from "zod";
import type { MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { ConversationCompletenessTemplate } from "../templates/conversation-completeness.js";
import type { LLMTestCase } from "../test-case.js";

const evaluationSchema = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

export class ConversationCompletenessMetric extends BaseMetric {
  readonly name = "Conversation Completeness";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput"];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    if (!testCase.conversation) {
      throw new Error(
        `[${this.name}] This metric requires a "conversation" field on the test case.`,
      );
    }

    if (!testCase.conversation.scenario || !testCase.conversation.expectedOutcome) {
      throw new Error(
        `[${this.name}] This metric requires "scenario" and "expectedOutcome" on the conversation.`,
      );
    }

    // Step 1: LLM evaluates conversation completeness
    const evaluation = await this.provider.generateJSON(
      ConversationCompletenessTemplate.evaluate(
        testCase.conversation.turns,
        testCase.conversation.scenario,
        testCase.conversation.expectedOutcome,
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
