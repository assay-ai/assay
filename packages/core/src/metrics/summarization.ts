import type { LLMTestCase } from "../test-case.js";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { SummarizationTemplate } from "../templates/summarization.js";
import { z } from "zod";

const truthsSchema = z.object({
  truths: z.array(z.string()),
});

const contradictionSchema = z.object({
  verdicts: z.array(
    z.object({
      truth: z.string(),
      verdict: z.enum(["yes", "no"]),
      reason: z.string(),
    }),
  ),
});

const questionsSchema = z.object({
  questions: z.array(z.string()),
});

const answerSchema = z.object({
  answer: z.string(),
});

const reasonSchema = z.object({
  reason: z.string(),
});

export class SummarizationMetric extends BaseMetric {
  readonly name = "Summarization";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput"];

  constructor(config?: MetricConfig) {
    super(config);
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    // Run alignment and coverage evaluation in parallel
    const [alignmentScore, coverageScore] = await Promise.all([
      this.evaluateAlignment(testCase.input!, testCase.actualOutput!),
      this.evaluateCoverage(testCase.input!, testCase.actualOutput!),
    ]);

    // Final score: min of both (zero in either = zero overall)
    let score = Math.min(alignmentScore, coverageScore);
    score = this.applyStrictMode(score);

    // Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        SummarizationTemplate.generateReason(alignmentScore, coverageScore),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { alignmentScore, coverageScore });
  }

  private async evaluateAlignment(input: string, summary: string): Promise<number> {
    // Extract truths from the original document
    const { truths } = await this.provider.generateJSON(
      SummarizationTemplate.extractTruths(input),
      truthsSchema,
    );

    if (truths.length === 0) return 1;

    // Check if summary contradicts any truths
    const { verdicts } = await this.provider.generateJSON(
      SummarizationTemplate.checkContradiction(summary, truths),
      contradictionSchema,
    );

    const contradicted = verdicts.filter((v) => v.verdict === "yes").length;
    return 1 - contradicted / truths.length;
  }

  private async evaluateCoverage(input: string, summary: string): Promise<number> {
    // Generate assessment questions from the original document
    const { questions } = await this.provider.generateJSON(
      SummarizationTemplate.generateQuestions(input),
      questionsSchema,
    );

    if (questions.length === 0) return 1;

    // Answer each question using both the original and the summary
    const results = await Promise.all(
      questions.map(async (question) => {
        const [originalAnswer, summaryAnswer] = await Promise.all([
          this.provider.generateJSON(
            SummarizationTemplate.answerFromText(question, input),
            answerSchema,
          ),
          this.provider.generateJSON(
            SummarizationTemplate.answerFromText(question, summary),
            answerSchema,
          ),
        ]);
        // Simple agreement check: do both answers convey the same info?
        return originalAnswer.answer.toLowerCase().trim() ===
          summaryAnswer.answer.toLowerCase().trim();
      }),
    );

    const agreementCount = results.filter(Boolean).length;
    return agreementCount / questions.length;
  }
}
