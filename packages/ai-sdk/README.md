# @assay-ai/ai-sdk

Vercel AI SDK adapter for [Assay](https://github.com/assay-ai/assay) -- the TypeScript-native LLM evaluation framework.

[![npm version](https://img.shields.io/npm/v/@assay-ai/ai-sdk?color=blue)](https://www.npmjs.com/package/@assay-ai/ai-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @assay-ai/core @assay-ai/ai-sdk
# or
pnpm add @assay-ai/core @assay-ai/ai-sdk
```

## Quick Start

### Evaluate `generateText` results

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { fromGenerateText } from "@assay-ai/ai-sdk";
import { evaluate, FaithfulnessMetric, AnswerRelevancyMetric } from "@assay-ai/core";

const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "What is the capital of France?",
});

// Convert AI SDK result to an Assay test case
const testCase = fromGenerateText(result, {
  input: "What is the capital of France?",
  context: ["France is a country in Europe. Its capital is Paris."],
});

const evalResults = await evaluate(
  [testCase],
  [new FaithfulnessMetric(), new AnswerRelevancyMetric()],
);
```

### Evaluate `streamText` results

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { fromStreamText } from "@assay-ai/ai-sdk";

const result = streamText({
  model: openai("gpt-4o"),
  prompt: "Explain quantum computing",
});

// Awaits the stream to complete and extracts the test case
const testCase = await fromStreamText(result, {
  input: "Explain quantum computing",
});
```

### Build test cases from message history

```typescript
import { fromMessages } from "@assay-ai/ai-sdk";

const testCase = fromMessages([
  { role: "user", content: "What is the refund policy?" },
  { role: "assistant", content: "You can get a full refund within 30 days." },
]);
// => { input: "What is the refund policy?", actualOutput: "You can get a full refund within 30 days." }
```

## API

### `fromGenerateText(result, options?)`

Converts a `generateText()` result into an `LLMTestCase`.

- `result` -- The result from Vercel AI SDK's `generateText()`
- `options.input` -- The input prompt (optional, extracted from result if available)
- `options.context` -- Context strings for evaluation
- `options.retrievalContext` -- Retrieval context strings
- `options.expectedOutput` -- Expected output for comparison

### `fromStreamText(result, options?)`

Converts a `streamText()` result into an `LLMTestCase`. Returns a Promise since it needs to await the stream.

### `fromMessages(messages, options?)`

Builds an `LLMTestCase` from a conversation message array. Extracts the last user message as `input` and last assistant message as `actualOutput`.

## Peer Dependencies

- `@assay-ai/core` >= 0.1.0
- `ai` >= 4.0.0

## License

[MIT](https://github.com/assay-ai/assay/blob/main/LICENSE)
