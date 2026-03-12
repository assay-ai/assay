<div align="center">

# @assay-ai/core

*The evaluation engine powering Assay -- 18 metrics, 5 providers, zero `any`*

[![npm version](https://img.shields.io/npm/v/@assay-ai/core?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@assay-ai/core)
[![downloads](https://img.shields.io/npm/dm/@assay-ai/core?style=flat-square&color=10b981)](https://www.npmjs.com/package/@assay-ai/core)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/assay-ai/assay/blob/main/LICENSE)

[Documentation](https://assay.js.org) · [Metrics](https://assay.js.org/metrics/) · [API Reference](https://assay.js.org/api/)

</div>

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

## Part of the [Assay](https://github.com/assay-ai/assay) monorepo

<p align="center">
  <a href="https://assay.js.org"><img src="https://img.shields.io/badge/Documentation-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://www.npmjs.com/package/@assay-ai/core"><img src="https://img.shields.io/badge/npm-cb3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" /></a>
  <a href="https://github.com/assay-ai/assay"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://github.com/assay-ai/assay/issues"><img src="https://img.shields.io/badge/Issues-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="Issues" /></a>
</p>
