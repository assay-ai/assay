# Non-LLM Metrics

Deterministic metrics that do not require an LLM API key. These run locally and are fast, free, and fully reproducible.

## Exact Match

Checks whether the actual output exactly matches the expected output.

**Required fields:** `actualOutput`, `expectedOutput`

```typescript
import { evaluate, ExactMatchMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "What is 2 + 2?",
      actualOutput: "4",
      expectedOutput: "4",
    },
  ],
  metrics: [new ExactMatchMetric()],
});
```

### Configuration

```typescript
import type { ExactMatchConfig } from "@assay-ai/core";

// Case-insensitive matching
new ExactMatchMetric({ caseSensitive: false });

// Trim whitespace before comparing
new ExactMatchMetric({ trim: true });
```

## JSON Correctness

Validates that the actual output is valid JSON and optionally matches the expected JSON structure.

**Required fields:** `actualOutput`, `expectedOutput`

```typescript
import { evaluate, JsonCorrectnessMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "Return the user's profile as JSON",
      actualOutput: '{"name": "Alice", "age": 30, "role": "engineer"}',
      expectedOutput: '{"name": "Alice", "age": 30, "role": "engineer"}',
    },
  ],
  metrics: [new JsonCorrectnessMetric()],
});
```

### Configuration

```typescript
import type { JsonCorrectnessConfig } from "@assay-ai/core";

// Only check if output is valid JSON (ignore expected)
new JsonCorrectnessMetric({ validateStructureOnly: true });
```

## Tool Correctness

While listed under [Agentic Metrics](/metrics/agentic#tool-correctness), `ToolCorrectnessMetric` is also a non-LLM metric. It compares tool calls deterministically without needing an API key.

**Required fields:** `input`, `toolsCalled`, `expectedTools`

```typescript
import { evaluate, ToolCorrectnessMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "Search for red shoes",
      actualOutput: "Found 5 results",
      toolsCalled: [
        { name: "search", parameters: { query: "red shoes" } },
      ],
      expectedTools: [
        { name: "search", parameters: { query: "red shoes" } },
      ],
    },
  ],
  metrics: [new ToolCorrectnessMetric()],
});
```

## When to use non-LLM metrics

Non-LLM metrics are ideal for:

- **CI pipelines** where you want fast, deterministic checks without API costs
- **Structured output validation** (JSON, tool calls) where exact comparison is sufficient
- **Regression testing** where you have known-good expected outputs
- **Combining with LLM metrics** to cover both deterministic and semantic evaluation
