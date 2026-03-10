# Jest Integration

Run LLM evaluations inside Jest with `describeEval` and `itEval`.

## Setup

```bash
pnpm add -D @assay-ai/core @assay-ai/jest
```

## Usage

```typescript
// chatbot.eval.ts
import { describeEval, itEval } from "@assay-ai/jest";
import { FaithfulnessMetric, AnswerRelevancyMetric } from "@assay-ai/core";

describeEval("Customer Support Chatbot", () => {
  itEval(
    "should answer product questions accurately",
    {
      input: "What is your return policy?",
      actualOutput: "You can return items within 30 days of purchase.",
      context: [
        "Our return policy allows returns within 30 days of purchase.",
      ],
    },
    [new FaithfulnessMetric(), new AnswerRelevancyMetric()],
  );
});
```

Run with:

```bash
jest chatbot.eval.ts
```

## Configuration

Increase the Jest timeout for evaluation tests, since LLM calls take longer than typical unit tests:

```typescript
// jest.config.ts
export default {
  testTimeout: 30000, // 30 seconds
  testMatch: ["**/*.eval.ts"],
};
```

## Dynamic test cases

```typescript
import { describeEval, itEval } from "@assay-ai/jest";
import { FaithfulnessMetric } from "@assay-ai/core";

const testCases = [
  {
    name: "capital question",
    input: "What is the capital of France?",
    actualOutput: "Paris is the capital of France.",
    context: ["Paris is the capital and largest city of France."],
  },
  {
    name: "population question",
    input: "What is the population of Tokyo?",
    actualOutput: "Tokyo has about 14 million residents.",
    context: ["Tokyo has a population of approximately 14 million."],
  },
];

describeEval("Knowledge QA", () => {
  for (const tc of testCases) {
    itEval(tc.name, tc, [new FaithfulnessMetric()]);
  }
});
```

## Using assertEval directly

For more control, use `assertEval` inside regular Jest tests:

```typescript
import { assertEval, FaithfulnessMetric } from "@assay-ai/core";

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
  });
});
```
