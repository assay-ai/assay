# Custom Metrics

Create your own evaluation criteria using GEval, the Summarization metric, or by extending BaseMetric.

## GEval

GEval lets you define any evaluation criteria in plain English. An LLM judges the output against your criteria and returns a score.

**Required fields:** `input`, `actualOutput` (plus any fields your criteria reference)

```typescript
import { evaluate, GEval } from "@assay-ai/core";

const politeness = new GEval({
  name: "Politeness",
  criteria:
    "The response should be polite, professional, and use courteous language.",
  evaluationSteps: [
    "Check if the response uses greetings or polite phrases",
    "Verify the tone is professional and respectful",
    "Ensure there is no dismissive or rude language",
  ],
});

await evaluate({
  testCases: [
    {
      input: "I need help with my order",
      actualOutput:
        "I'd be happy to help you with your order! Could you please share your order number?",
    },
  ],
  metrics: [politeness],
});
```

### GEval with custom parameters

You can reference any test case field in your criteria:

```typescript
const factualConsistency = new GEval({
  name: "FactualConsistency",
  criteria:
    "The actual output should be factually consistent with the expected output. All key facts must match.",
  evaluationSteps: [
    "Extract key facts from the expected output",
    "Verify each fact appears in the actual output",
    "Check for contradictions between actual and expected",
  ],
});
```

### GEval configuration

```typescript
import type { GEvalConfig } from "@assay-ai/core";

const config: GEvalConfig = {
  name: "MyMetric",
  criteria: "The response should be concise and under 100 words.",
  evaluationSteps: [
    "Count the number of words in the response",
    "Check if the response stays on topic",
  ],
  threshold: 0.7, // Custom pass threshold
  model: "gpt-4o", // Override model
};
```

## Summarization

Evaluates the quality of text summarization by checking for coverage, conciseness, and factual consistency.

**Required fields:** `input`, `actualOutput`

```typescript
import { evaluate, SummarizationMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input:
        "TypeScript is a strongly typed programming language that builds on JavaScript. It was developed by Microsoft and first released in 2012. TypeScript adds optional static typing and class-based object-oriented programming to the language.",
      actualOutput:
        "TypeScript is a typed superset of JavaScript developed by Microsoft in 2012, adding static typing and OOP features.",
    },
  ],
  metrics: [new SummarizationMetric()],
});
```

## Creating your own metric

Extend `BaseMetric` to build a fully custom metric:

```typescript
import { BaseMetric } from "@assay-ai/core";
import type { MetricResult, MetricConfig, LLMTestCase } from "@assay-ai/core";

interface WordCountConfig extends MetricConfig {
  maxWords: number;
}

class WordCountMetric extends BaseMetric {
  readonly name = "WordCount";
  private maxWords: number;

  constructor(config: WordCountConfig) {
    super(config);
    this.maxWords = config.maxWords;
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    const wordCount = testCase.actualOutput.split(/\s+/).length;
    const score = Math.min(1, this.maxWords / wordCount);
    return {
      metric: this.name,
      score,
      passed: score >= this.threshold,
      reason: `Output has ${wordCount} words (max: ${this.maxWords})`,
    };
  }
}

// Usage
const metric = new WordCountMetric({ maxWords: 50, threshold: 0.8 });
```

Your custom metric can use the LLM provider if needed:

```typescript
class CustomLLMMetric extends BaseMetric {
  readonly name = "CustomLLM";

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    const provider = await this.resolveProvider();
    const response = await provider.generate(
      `Evaluate this response: ${testCase.actualOutput}`,
    );
    // Parse and return result
    return {
      metric: this.name,
      score: parseFloat(response),
      passed: parseFloat(response) >= this.threshold,
      reason: "Custom evaluation",
    };
  }
}
```
