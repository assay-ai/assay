import { z } from "zod";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { GEvalTemplate } from "../templates/g-eval.js";
import type { LLMTestCase } from "../test-case.js";

const stepsSchema = z.object({
  steps: z.array(z.string()),
});

const evaluationSchema = z.object({
  score: z.number().min(1).max(5),
  reason: z.string(),
});

export interface GEvalConfig extends MetricConfig {
  /** Human-readable name for this evaluation */
  name?: string;
  /** The evaluation criteria in natural language */
  criteria: string;
  /** Which test case fields to include in evaluation */
  evaluationParams?: (keyof LLMTestCase)[];
  /** Optional pre-defined evaluation steps (auto-generated if omitted) */
  evaluationSteps?: string[];
}

export class GEval extends BaseMetric {
  readonly name: string;
  readonly requiredFields: (keyof LLMTestCase)[] = ["input"];

  private readonly criteria: string;
  private readonly evaluationParams: (keyof LLMTestCase)[];
  private evaluationSteps?: string[];

  constructor(config: GEvalConfig) {
    super(config);
    this.name = config.name ?? "G-Eval";
    this.criteria = config.criteria;
    this.evaluationParams = config.evaluationParams ?? ["input", "actualOutput"];
    this.evaluationSteps = config.evaluationSteps;
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    // Step 1: Generate evaluation steps if not provided
    if (!this.evaluationSteps) {
      const result = await this.provider.generateJSON(
        GEvalTemplate.generateSteps(this.criteria),
        stepsSchema,
      );
      this.evaluationSteps = result.steps;
    }

    // Step 2: Build the test case fields for evaluation
    const fields: Record<string, string> = {};
    for (const param of this.evaluationParams) {
      const value = testCase[param];
      if (value !== undefined && value !== null) {
        fields[param] = Array.isArray(value) ? value.join("\n") : String(value);
      }
    }

    // Step 3: Evaluate with LLM
    const evaluation = await this.provider.generateJSON(
      GEvalTemplate.evaluate(this.criteria, this.evaluationSteps!, fields),
      evaluationSchema,
    );

    // Step 4: Normalize score from 1-5 to 0-1
    let score = (evaluation.score - 1) / 4;
    score = this.applyStrictMode(score);

    return this.buildResult(score, evaluation.reason, start, {
      rawScore: evaluation.score,
      evaluationSteps: this.evaluationSteps,
      criteria: this.criteria,
    });
  }
}
