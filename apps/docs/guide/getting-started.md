# Getting Started

## Installation

::: code-group

```bash [pnpm]
pnpm add @assay-ai/core
```

```bash [npm]
npm install @assay-ai/core
```

```bash [yarn]
yarn add @assay-ai/core
```

:::

## Set up your provider

Assay uses an LLM to evaluate outputs. Set your API key as an environment variable:

```bash
# OpenAI (default)
export OPENAI_API_KEY="sk-..."

# Or Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Your first evaluation

```typescript
import {
  evaluate,
  FaithfulnessMetric,
  AnswerRelevancyMetric,
} from "@assay-ai/core";

const results = await evaluate({
  testCases: [
    {
      input: "What is the capital of France?",
      actualOutput: "The capital of France is Paris.",
      expectedOutput: "Paris",
      context: ["France is a country in Europe. Its capital is Paris."],
    },
  ],
  metrics: [new FaithfulnessMetric(), new AnswerRelevancyMetric()],
});

console.log(results);
// => [{ metric: "Faithfulness", score: 1.0, passed: true }, ...]
```

## Using with Vitest

Install the Vitest integration:

```bash
pnpm add -D @assay-ai/core @assay-ai/vitest
```

Write an evaluation test:

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

## Configuration

Every metric accepts optional configuration:

```typescript
new FaithfulnessMetric({
  threshold: 0.7, // Minimum score to pass (default: 0.5)
  model: "gpt-4o-mini", // LLM model for evaluation
  verbose: true, // Log detailed reasoning
});
```

See [Configuration](/guide/configuration) for the full reference.
