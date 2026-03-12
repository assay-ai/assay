<div align="center">

# @assay-ai/ai-sdk

*Vercel AI SDK adapter for LLM evaluation with Assay*

[![npm version](https://img.shields.io/npm/v/@assay-ai/ai-sdk?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@assay-ai/ai-sdk)
[![downloads](https://img.shields.io/npm/dm/@assay-ai/ai-sdk?style=flat-square&color=10b981)](https://www.npmjs.com/package/@assay-ai/ai-sdk)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/assay-ai/assay/blob/main/LICENSE)

[Documentation](https://assay.js.org) · [Metrics](https://assay.js.org/metrics/) · [API Reference](https://assay.js.org/api/)

</div>

## Installation

```bash
pnpm add @assay-ai/core @assay-ai/ai-sdk     # pnpm
npm install @assay-ai/core @assay-ai/ai-sdk   # npm
yarn add @assay-ai/core @assay-ai/ai-sdk      # Yarn
```

## Quick Start

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { fromGenerateText } from "@assay-ai/ai-sdk";
import { evaluate, FaithfulnessMetric, AnswerRelevancyMetric } from "@assay-ai/core";

const result = await generateText({
  model: openai("gpt-4o"),
  prompt: "What is the capital of France?",
});

const testCase = fromGenerateText(result, {
  input: "What is the capital of France?",
  context: ["France is a country in Europe. Its capital is Paris."],
});

const evalResults = await evaluate(
  [testCase],
  [new FaithfulnessMetric(), new AnswerRelevancyMetric()],
);

console.log(`Pass rate: ${evalResults.summary.passRate.toFixed(1)}%`);
```

## Part of the [Assay](https://github.com/assay-ai/assay) monorepo

<p align="center">
  <a href="https://assay.js.org"><img src="https://img.shields.io/badge/Documentation-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://www.npmjs.com/package/@assay-ai/ai-sdk"><img src="https://img.shields.io/badge/npm-cb3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" /></a>
  <a href="https://github.com/assay-ai/assay"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://github.com/assay-ai/assay/issues"><img src="https://img.shields.io/badge/Issues-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="Issues" /></a>
</p>
