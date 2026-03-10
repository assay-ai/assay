# @assay-ai/jest

Jest integration for [Assay](https://github.com/assay-ai/assay) -- the TypeScript-native LLM evaluation framework.

[![npm version](https://img.shields.io/npm/v/@assay-ai/jest?color=blue)](https://www.npmjs.com/package/@assay-ai/jest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -D @assay-ai/core @assay-ai/jest
# or
pnpm add -D @assay-ai/core @assay-ai/jest
```

## Quick Start

### Setup

Register the Assay matchers in your Jest setup file:

```typescript
// jest.setup.ts
import { setupAssayMatchers } from "@assay-ai/jest";

setupAssayMatchers();
```

Then configure Jest to use it:

```json
// jest.config.json
{
  "setupFilesAfterSetup": ["./jest.setup.ts"]
}
```

### Writing Evaluations

```typescript
// chatbot.eval.ts
import { GEval } from "@assay-ai/core";

describe("Customer Support Chatbot", () => {
  it("should answer product questions accurately", async () => {
    await expect({
      input: "What is your return policy?",
      actualOutput: "You can return items within 30 days of purchase.",
      retrievalContext: [
        "Our return policy allows returns within 30 days of purchase.",
      ],
    }).toBeRelevant({ threshold: 0.8 });
  });

  it("should be faithful to context", async () => {
    await expect({
      input: "What is your return policy?",
      actualOutput: "You can return items within 30 days of purchase.",
      retrievalContext: [
        "Our return policy allows returns within 30 days of purchase.",
      ],
    }).toBeFaithful();
  });

  it("should pass custom metric", async () => {
    const politeness = new GEval({
      name: "Politeness",
      criteria: "The response should be polite and professional.",
    });

    await expect({
      input: "Help me with my order",
      actualOutput: "I'd be happy to help! Could you share your order number?",
    }).toPassMetric(politeness);
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

## Peer Dependencies

- `@assay-ai/core` >= 0.1.0
- `jest` >= 29.0.0

## License

[MIT](https://github.com/assay-ai/assay/blob/main/LICENSE)
