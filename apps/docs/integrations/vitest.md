# Vitest Integration

Run LLM evaluations inside Vitest using familiar `describe` / `it` / `expect` patterns.

## Setup

```bash
pnpm add -D @assay-ai/core @assay-ai/vitest
```

## Usage

Use `describeEval` and `itEval` to write evaluation tests:

```typescript
// chatbot.eval.ts
import { describeEval, itEval } from "@assay-ai/vitest";
import {
  FaithfulnessMetric,
  AnswerRelevancyMetric,
  HallucinationMetric,
} from "@assay-ai/core";

describeEval("Customer Support Chatbot", () => {
  itEval(
    "should answer product questions accurately",
    {
      input: "What is your return policy?",
      actualOutput: "You can return items within 30 days of purchase.",
      context: [
        "Our return policy allows returns within 30 days of purchase.",
        "Items must be in original packaging.",
      ],
    },
    [
      new FaithfulnessMetric(),
      new AnswerRelevancyMetric(),
      new HallucinationMetric(),
    ],
  );
});
```

Run with:

```bash
vitest --reporter=verbose chatbot.eval.ts
```

## Dynamic test cases

Generate test cases from your actual application:

```typescript
import { describeEval, itEval } from "@assay-ai/vitest";
import { FaithfulnessMetric } from "@assay-ai/core";
import { myRAGPipeline, loadTestDataset } from "./helpers";

describeEval("RAG Pipeline", () => {
  const dataset = loadTestDataset();

  for (const item of dataset) {
    itEval(
      `should faithfully answer: ${item.question}`,
      {
        input: item.question,
        actualOutput: await myRAGPipeline(item.question),
        context: item.retrievedDocs,
        expectedOutput: item.expectedAnswer,
      },
      [new FaithfulnessMetric({ threshold: 0.8 })],
    );
  }
});
```

## Custom matchers

The Vitest integration extends Vitest's `expect` with evaluation-aware matchers:

```typescript
import { describe, it, expect } from "vitest";
import { assertEval } from "@assay-ai/core";
import { FaithfulnessMetric } from "@assay-ai/core";

describe("RAG Pipeline", () => {
  it("should be faithful", async () => {
    const result = await assertEval({
      testCase: {
        input: "What is TypeScript?",
        actualOutput: "A typed superset of JavaScript.",
        context: ["TypeScript is a typed superset of JavaScript."],
      },
      metrics: [new FaithfulnessMetric()],
    });

    expect(result.passed).toBe(true);
    expect(result.results[0].score).toBeGreaterThan(0.7);
  });
});
```

## Reporter

Use the Assay console reporter alongside Vitest's output:

```typescript
import { evaluate, FaithfulnessMetric, ConsoleReporter } from "@assay-ai/core";

const results = await evaluate({
  testCases: [/* ... */],
  metrics: [new FaithfulnessMetric()],
});

const reporter = new ConsoleReporter();
reporter.report(results);
```

## File naming convention

We recommend using `.eval.ts` for evaluation files to distinguish them from unit tests:

```
src/
  chatbot.eval.ts
  rag-pipeline.eval.ts
  safety.eval.ts
```

Run all evaluations:

```bash
vitest --reporter=verbose "**/*.eval.ts"
```
