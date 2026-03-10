<div align="center">

# Assay

**Assay your AI. Ship with confidence.**

The TypeScript-native LLM evaluation framework that fits into your existing test suite.

[![npm version](https://img.shields.io/npm/v/@assay-ai/core?color=blue&label=npm)](https://www.npmjs.com/package/@assay-ai/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://github.com/assay-ai/assay/actions/workflows/ci.yml/badge.svg)](https://github.com/assay-ai/assay/actions/workflows/ci.yml)

[Quick Start](#quick-start) | [Metrics](#metrics) | [Vitest](#vitest-integration) | [Jest](#jest-integration) | [AI SDK](#vercel-ai-sdk) | [Docs](https://assay.dev)

</div>

---

## Why Assay?

You write tests for your code. Why not for your AI?

LLM outputs are non-deterministic. A prompt change that improves one response can silently break ten others. Assay gives you the safety net:

- **12 research-backed metrics** -- faithfulness, answer relevancy, hallucination, contextual precision/recall/relevancy, bias, toxicity, GEval, tool correctness, latency, and cost
- **Drop into Vitest or Jest** -- evaluate inside the test runner you already use, with familiar `describe` / `it` / `expect` patterns
- **Vercel AI SDK adapter** -- pipe `generateText` results straight into evaluation
- **Custom metrics with GEval** -- define any evaluation criteria in plain English and let an LLM grade it
- **Type-safe from the ground up** -- full TypeScript, Zod-validated configs, zero `any`
- **Parallel execution** -- run hundreds of test cases concurrently with configurable concurrency limits
- **Provider agnostic** -- works with OpenAI, Anthropic, or any LLM provider

Stop guessing if your AI works. Start asserting it.

## Quick Start

```bash
pnpm add @assay-ai/core
```

```typescript
import { evaluate, Faithfulness, AnswerRelevancy } from "@assay-ai/core";

const results = await evaluate({
  testCases: [
    {
      input: "What is the capital of France?",
      actualOutput: "The capital of France is Paris.",
      expectedOutput: "Paris",
      context: ["France is a country in Europe. Its capital is Paris."],
    },
  ],
  metrics: [
    new Faithfulness(),
    new AnswerRelevancy(),
  ],
});

console.log(results);
// => [{ metric: "Faithfulness", score: 1.0, passed: true }, ...]
```

## Metrics

Assay ships with 12 evaluation metrics out of the box.

| Metric | Description | Required Fields |
|--------|-------------|-----------------|
| **Faithfulness** | Measures whether the output is grounded in the provided context | `input`, `actualOutput`, `context` |
| **Answer Relevancy** | Measures how relevant the output is to the input question | `input`, `actualOutput` |
| **Hallucination** | Detects claims in the output not supported by context | `input`, `actualOutput`, `context` |
| **Contextual Precision** | Measures whether relevant context items are ranked higher | `input`, `actualOutput`, `expectedOutput`, `context` |
| **Contextual Recall** | Measures whether all relevant information from context is retrieved | `input`, `actualOutput`, `expectedOutput`, `context` |
| **Contextual Relevancy** | Measures whether retrieved context is relevant to the input | `input`, `actualOutput`, `context` |
| **Bias** | Detects demographic or ideological bias in the output | `input`, `actualOutput` |
| **Toxicity** | Detects toxic, harmful, or offensive content | `input`, `actualOutput` |
| **GEval** | Custom LLM-as-judge evaluation with user-defined criteria | `input`, `actualOutput` (+ custom) |
| **Tool Correctness** | Validates that the correct tools were called with correct parameters | `input`, `toolsCalled`, `expectedTools` |
| **Latency** | Asserts that completion time is within acceptable bounds | `input`, `completionTime` |
| **Cost** | Asserts that token cost is within budget | `input`, `tokenCost` |

Every metric returns a score between 0 and 1 and a boolean `passed` based on a configurable threshold (default: 0.5).

## Vitest Integration

```bash
pnpm add -D @assay-ai/core @assay-ai/vitest
```

```typescript
// chatbot.eval.ts
import { describe } from "vitest";
import { describeEval, itEval } from "@assay-ai/vitest";
import { Faithfulness, AnswerRelevancy, Hallucination } from "@assay-ai/core";

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
    [new Faithfulness(), new AnswerRelevancy(), new Hallucination()],
  );
});
```

Run with:

```bash
vitest --reporter=verbose chatbot.eval.ts
```

## Jest Integration

```bash
pnpm add -D @assay-ai/core @assay-ai/jest
```

```typescript
// chatbot.eval.ts
import { describeEval, itEval } from "@assay-ai/jest";
import { Faithfulness, AnswerRelevancy } from "@assay-ai/core";

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
    [new Faithfulness(), new AnswerRelevancy()],
  );
});
```

## Vercel AI SDK

```bash
pnpm add @assay-ai/core @assay-ai/ai-sdk
```

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { evaluateAIResponse } from "@assay-ai/ai-sdk";
import { Faithfulness, AnswerRelevancy } from "@assay-ai/core";

const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "What is the capital of France?",
});

const evalResults = await evaluateAIResponse({
  input: "What is the capital of France?",
  response: result,
  context: ["France is a country in Europe. Its capital is Paris."],
  metrics: [new Faithfulness(), new AnswerRelevancy()],
});

console.log(evalResults);
```

## Custom Metrics with GEval

Define any evaluation criteria in plain English. Assay uses an LLM to judge the output against your criteria.

```typescript
import { evaluate, GEval } from "@assay-ai/core";

const politeness = new GEval({
  name: "Politeness",
  criteria: "The response should be polite, professional, and use courteous language.",
  evaluationSteps: [
    "Check if the response uses greetings or polite phrases",
    "Verify the tone is professional and respectful",
    "Ensure there is no dismissive or rude language",
  ],
});

const results = await evaluate({
  testCases: [
    {
      input: "I need help with my order",
      actualOutput: "I'd be happy to help you with your order! Could you please share your order number?",
    },
  ],
  metrics: [politeness],
});
```

## Configuration

### Provider Configuration

Assay uses environment variables for LLM provider configuration:

```bash
# OpenAI (default)
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Metric Options

Every metric accepts optional configuration:

```typescript
new Faithfulness({
  threshold: 0.7,       // Minimum score to pass (default: 0.5)
  model: "gpt-4o-mini", // LLM model for evaluation
  verbose: true,         // Log detailed reasoning
});
```

### Evaluation Options

```typescript
await evaluate({
  testCases: [...],
  metrics: [...],
  options: {
    concurrency: 5,       // Run 5 test cases in parallel (default: 10)
    verbose: true,         // Detailed logging
  },
});
```

## Packages

| Package | Description |
|---------|-------------|
| [`@assay-ai/core`](./packages/core) | Core evaluation engine and all metrics |
| [`@assay-ai/vitest`](./packages/vitest) | Vitest integration (`describeEval`, `itEval`) |
| [`@assay-ai/jest`](./packages/jest) | Jest integration (`describeEval`, `itEval`) |
| [`@assay-ai/ai-sdk`](./packages/ai-sdk) | Vercel AI SDK adapter |

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on the development workflow, how to propose changes, and how to add new metrics.

## License

[MIT](LICENSE) -- Assay AI
