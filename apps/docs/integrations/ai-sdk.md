# Vercel AI SDK

Evaluate outputs from the Vercel AI SDK with zero boilerplate. The `@assay-ai/ai-sdk` adapter converts AI SDK responses into Assay test cases automatically.

## Setup

```bash
pnpm add @assay-ai/core @assay-ai/ai-sdk
```

## fromGenerateText

Evaluate the result of `generateText`:

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { evaluateAIResponse } from "@assay-ai/ai-sdk";
import { FaithfulnessMetric, AnswerRelevancyMetric } from "@assay-ai/core";

const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "What is the capital of France?",
});

const evalResults = await evaluateAIResponse({
  input: "What is the capital of France?",
  response: result,
  context: ["France is a country in Europe. Its capital is Paris."],
  metrics: [new FaithfulnessMetric(), new AnswerRelevancyMetric()],
});

console.log(evalResults);
```

## fromStreamText

Evaluate streamed responses by collecting the full text:

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { evaluateAIResponse } from "@assay-ai/ai-sdk";
import { AnswerRelevancyMetric } from "@assay-ai/core";

const result = await streamText({
  model: openai("gpt-4o"),
  prompt: "Explain TypeScript in one paragraph",
});

// Collect the full stream
const text = await result.text;

const evalResults = await evaluateAIResponse({
  input: "Explain TypeScript in one paragraph",
  response: { text },
  metrics: [new AnswerRelevancyMetric()],
});
```

## fromMessages

Evaluate conversational AI SDK responses:

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { evaluateAIResponse } from "@assay-ai/ai-sdk";
import { AnswerRelevancyMetric } from "@assay-ai/core";

const messages = [
  { role: "user" as const, content: "What is TypeScript?" },
  {
    role: "assistant" as const,
    content: "TypeScript is a typed superset of JavaScript.",
  },
  { role: "user" as const, content: "Who created it?" },
];

const result = await generateText({
  model: openai("gpt-4o"),
  messages,
});

const evalResults = await evaluateAIResponse({
  input: "Who created it?",
  response: result,
  metrics: [new AnswerRelevancyMetric()],
});
```

## With Vitest

Combine the AI SDK adapter with the Vitest integration for end-to-end evaluation tests:

```typescript
import { describe, it, expect } from "vitest";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { evaluateAIResponse } from "@assay-ai/ai-sdk";
import { FaithfulnessMetric, ToxicityMetric } from "@assay-ai/core";

describe("AI Chatbot", () => {
  it("should produce faithful and safe responses", async () => {
    const result = await generateText({
      model: openai("gpt-4o"),
      prompt: "What is the return policy?",
      system: "You are a helpful customer support agent.",
    });

    const evalResults = await evaluateAIResponse({
      input: "What is the return policy?",
      response: result,
      context: ["Returns accepted within 30 days of purchase."],
      metrics: [
        new FaithfulnessMetric({ threshold: 0.8 }),
        new ToxicityMetric({ threshold: 0.9 }),
      ],
    });

    for (const r of evalResults) {
      expect(r.passed).toBe(true);
    }
  });
});
```
