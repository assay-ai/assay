<div align="center">

# Assay

**Assay your AI. Ship with confidence.**

*The TypeScript-native LLM evaluation framework*

[![npm version](https://img.shields.io/npm/v/@assay-ai/core?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@assay-ai/core)
[![downloads](https://img.shields.io/npm/dm/@assay-ai/core?style=flat-square&color=10b981)](https://www.npmjs.com/package/@assay-ai/core)
[![CI](https://img.shields.io/github/actions/workflow/status/assay-ai/assay/ci.yml?style=flat-square&label=CI)](https://github.com/assay-ai/assay/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[Documentation](https://assay.js.org) · [API Reference](https://assay.js.org/api/) · [Metrics](https://assay.js.org/metrics/) · [Changelog](https://github.com/assay-ai/assay/releases)

</div>

## Highlights

<table>
<tr>
<td width="50%">

### 18 Metrics

- **RAG** — Faithfulness, Answer Relevancy, Hallucination, Contextual Precision/Recall/Relevancy
- **Agentic** — Tool Correctness, Task Completion, Goal Accuracy
- **Conversational** — Knowledge Retention, Conversation Completeness, Role Adherence
- **Safety** — Bias, Toxicity
- **Custom** — GEval, Summarization
- **Non-LLM** — Exact Match, JSON Correctness

</td>
<td width="50%">

### Features

- **Vitest & Jest** integration with custom matchers
- **Vercel AI SDK** adapter
- **CLI** — `assay run`, `assay init`, `assay list-metrics`
- **5 providers** — OpenAI, Anthropic, Gemini, Azure, Ollama
- **Type-safe** — full TypeScript, Zod-validated, zero `any`
- **Parallel execution** with configurable concurrency
- **Provider agnostic** — bring your own LLM

</td>
</tr>
</table>

## Installation

```bash
pnpm add @assay-ai/core     # pnpm
npm install @assay-ai/core   # npm
yarn add @assay-ai/core      # Yarn
```

## Quick Start

```typescript
import {
  AnswerRelevancyMetric,
  evaluate,
  FaithfulnessMetric,
  HallucinationMetric,
} from "@assay-ai/core";

const results = await evaluate(
  [
    {
      input: "What is the refund policy?",
      actualOutput: "You can request a full refund within 30 days.",
      retrievalContext: [
        "Refund Policy: Full refund within 30 days of purchase.",
      ],
      context: ["Our refund policy allows returns within 30 days."],
    },
  ],
  [
    new AnswerRelevancyMetric({ threshold: 0.7 }),
    new FaithfulnessMetric({ threshold: 0.7 }),
    new HallucinationMetric({ threshold: 0.3 }),
  ],
);

console.log(`Pass rate: ${results.summary.passRate.toFixed(1)}%`);
```

## Vitest Integration

```bash
pnpm add -D @assay-ai/core @assay-ai/vitest
```

```typescript
import { beforeAll, describe, expect, test } from "vitest";
import { setupAssayMatchers } from "@assay-ai/vitest";
import { GEval } from "@assay-ai/core";

beforeAll(() => { setupAssayMatchers(); });

describe("Chatbot Evaluation", () => {
  test("answers are relevant", async () => {
    await expect({
      input: "How do I reset my password?",
      actualOutput: "Go to Settings > Security > Reset Password.",
    }).toBeRelevant({ threshold: 0.8 });
  });

  test("custom criteria with GEval", async () => {
    await expect({
      input: "Help with my order",
      actualOutput: "I'd be happy to help! What's your order number?",
    }).toPassMetric(new GEval({
      name: "Politeness",
      criteria: "The response should be polite and professional.",
    }));
  });
});
```

## Packages

| Package | Description |
|---------|-------------|
| [`@assay-ai/core`](https://www.npmjs.com/package/@assay-ai/core) | Core evaluation engine — 18 metrics, 5 providers |
| [`@assay-ai/vitest`](https://www.npmjs.com/package/@assay-ai/vitest) | Vitest custom matchers & reporter |
| [`@assay-ai/jest`](https://www.npmjs.com/package/@assay-ai/jest) | Jest custom matchers |
| [`@assay-ai/ai-sdk`](https://www.npmjs.com/package/@assay-ai/ai-sdk) | Vercel AI SDK adapter |
| [`@assay-ai/cli`](https://www.npmjs.com/package/@assay-ai/cli) | CLI tool — `assay run`, `assay init` |

## Configuration

```bash
# Set your LLM provider (auto-detected from env vars)
export OPENAI_API_KEY="sk-..."        # OpenAI
export ANTHROPIC_API_KEY="sk-ant-..." # Anthropic
export GOOGLE_API_KEY="..."           # Google Gemini
```

```typescript
// Every metric accepts optional config
new FaithfulnessMetric({
  threshold: 0.7,       // Min score to pass (default: 0.5)
  model: "gpt-4o-mini", // LLM model for evaluation
  verbose: true,        // Log detailed reasoning
});
```

<p align="center">
  <a href="https://assay.js.org"><img src="https://img.shields.io/badge/Full_Documentation-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://assay.js.org/metrics/"><img src="https://img.shields.io/badge/All_18_Metrics-10b981?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Metrics" /></a>
  <a href="https://assay.js.org/api/"><img src="https://img.shields.io/badge/API_Reference-f97316?style=for-the-badge&logo=book&logoColor=white" alt="API Reference" /></a>
</p>

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE) © [Assay AI](https://github.com/assay-ai)

<p align="center">
  <a href="https://assay.js.org"><img src="https://img.shields.io/badge/Documentation-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://www.npmjs.com/org/assay-ai"><img src="https://img.shields.io/badge/npm-cb3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" /></a>
  <a href="https://github.com/assay-ai/assay"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://github.com/assay-ai/assay/issues"><img src="https://img.shields.io/badge/Issues-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="Issues" /></a>
</p>
