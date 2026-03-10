# Agentic Metrics

Metrics for evaluating AI agents that use tools, complete tasks, and pursue goals.

## Tool Correctness

Validates that the agent called the correct tools with the correct parameters.

**Required fields:** `input`, `toolsCalled`, `expectedTools`

**How it works:** Compares the tools actually called by the agent against the expected tool calls, checking both tool names and parameters. This is a deterministic metric -- no LLM is required.

```typescript
import { evaluate, ToolCorrectnessMetric } from "@assay-ai/core";
import type { ToolCall } from "@assay-ai/core";

const toolsCalled: ToolCall[] = [
  { name: "searchProducts", parameters: { query: "red shoes", limit: 10 } },
];

const expectedTools: ToolCall[] = [
  { name: "searchProducts", parameters: { query: "red shoes", limit: 10 } },
];

await evaluate({
  testCases: [
    {
      input: "Find me red shoes",
      actualOutput: "Here are some red shoes I found.",
      toolsCalled,
      expectedTools,
    },
  ],
  metrics: [new ToolCorrectnessMetric()],
});
```

## Task Completion

Evaluates whether the agent successfully completed the assigned task.

**Required fields:** `input`, `actualOutput`

**How it works:** An LLM judges whether the agent's output demonstrates successful completion of the task described in the input. The metric considers partial completion and awards proportional scores.

```typescript
import { evaluate, TaskCompletionMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "Book a flight from NYC to London for next Friday",
      actualOutput:
        "I've booked flight BA178 from JFK to Heathrow departing next Friday at 7:00 PM. Confirmation number: ABC123.",
    },
  ],
  metrics: [new TaskCompletionMetric({ threshold: 0.8 })],
});
```

## Goal Accuracy

Measures how accurately the agent achieved the stated goal, considering both the final result and the approach taken.

**Required fields:** `input`, `actualOutput`

**How it works:** An LLM evaluates whether the agent's output aligns with the goal implied by the input. It considers correctness, completeness, and whether the approach was appropriate.

```typescript
import { evaluate, GoalAccuracyMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "Calculate the total cost of 3 items at $25 each with 8% tax",
      actualOutput:
        "3 items at $25 = $75 subtotal. Tax: $75 x 0.08 = $6.00. Total: $81.00.",
    },
  ],
  metrics: [new GoalAccuracyMetric()],
});
```
