# @assay-ai/vitest

Vitest integration for [Assay](https://github.com/assay-ai/assay) -- the TypeScript-native LLM evaluation framework.

[![npm version](https://img.shields.io/npm/v/@assay-ai/vitest?color=blue)](https://www.npmjs.com/package/@assay-ai/vitest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -D @assay-ai/core @assay-ai/vitest
# or
pnpm add -D @assay-ai/core @assay-ai/vitest
```

## Quick Start

### Custom Matchers

Register the Assay matchers once, then use them in any test file:

```typescript
// setup.ts or at the top of your test file
import { setupAssayMatchers } from "@assay-ai/vitest";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(() => {
  setupAssayMatchers();
});

describe("Customer Support Chatbot", () => {
  test("answers product questions accurately", async () => {
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

### Available Matchers

| Matcher | Description |
|---------|-------------|
| `toBeRelevant(options?)` | Asserts the output is relevant to the input (Answer Relevancy) |
| `toBeFaithful(options?)` | Asserts the output is grounded in context (Faithfulness) |
| `toNotHallucinate(options?)` | Asserts the output doesn't contain hallucinations |
| `toPassMetric(metric)` | Asserts the test case passes a specific metric |
| `toPassAllMetrics(metrics)` | Asserts the test case passes all given metrics |

All matchers accept an optional `{ threshold?: number }` options object.

### Custom Metric Matcher

Use `toPassMetric` with any built-in or custom metric:

```typescript
import { GEval } from "@assay-ai/core";

const politeness = new GEval({
  name: "Politeness",
  criteria: "The response should be polite and professional.",
});

test("response is polite", async () => {
  await expect({
    input: "Help me with my order",
    actualOutput: "I'd be happy to help! Could you share your order number?",
  }).toPassMetric(politeness);
});
```

### Reporter

Assay includes a custom Vitest reporter that formats evaluation results:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["default", "@assay-ai/vitest/reporter"],
  },
});
```

## Peer Dependencies

- `@assay-ai/core` >= 0.1.0
- `vitest` >= 2.0.0

## License

[MIT](https://github.com/assay-ai/assay/blob/main/LICENSE)
