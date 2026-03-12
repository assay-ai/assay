<div align="center">

# @assay-ai/vitest

*Custom Vitest matchers for LLM evaluation with Assay*

[![npm version](https://img.shields.io/npm/v/@assay-ai/vitest?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@assay-ai/vitest)
[![downloads](https://img.shields.io/npm/dm/@assay-ai/vitest?style=flat-square&color=10b981)](https://www.npmjs.com/package/@assay-ai/vitest)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/assay-ai/assay/blob/main/LICENSE)

[Documentation](https://assay.js.org) · [Metrics](https://assay.js.org/metrics/) · [API Reference](https://assay.js.org/api/)

</div>

## Installation

```bash
pnpm add -D @assay-ai/core @assay-ai/vitest     # pnpm
npm install -D @assay-ai/core @assay-ai/vitest   # npm
yarn add -D @assay-ai/core @assay-ai/vitest      # Yarn
```

## Quick Start

```typescript
import { beforeAll, describe, expect, test } from "vitest";
import { setupAssayMatchers } from "@assay-ai/vitest";

beforeAll(() => {
  setupAssayMatchers();
});

describe("Customer Support Chatbot", () => {
  test("answers are relevant", async () => {
    await expect({
      input: "What is your return policy?",
      actualOutput: "You can return items within 30 days of purchase.",
      retrievalContext: [
        "Our return policy allows returns within 30 days of purchase.",
      ],
    }).toBeRelevant({ threshold: 0.8 });
  });

  test("does not hallucinate", async () => {
    await expect({
      input: "What is your return policy?",
      actualOutput: "You can return items within 30 days of purchase.",
      context: [
        "Our return policy allows returns within 30 days of purchase.",
      ],
    }).toNotHallucinate();
  });
});
```

## Part of the [Assay](https://github.com/assay-ai/assay) monorepo

<p align="center">
  <a href="https://assay.js.org"><img src="https://img.shields.io/badge/Documentation-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://www.npmjs.com/package/@assay-ai/vitest"><img src="https://img.shields.io/badge/npm-cb3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" /></a>
  <a href="https://github.com/assay-ai/assay"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://github.com/assay-ai/assay/issues"><img src="https://img.shields.io/badge/Issues-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="Issues" /></a>
</p>
