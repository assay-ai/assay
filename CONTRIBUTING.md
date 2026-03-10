# Contributing to Assay

Thank you for your interest in contributing to Assay! This guide will help you get started.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) 9.x

### Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/assay.git
cd assay

# 3. Install dependencies
pnpm install

# 4. Build all packages
pnpm build

# 5. Run tests
pnpm test

# 6. Run linting
pnpm lint
```

### Project Structure

```
assay/
  packages/
    core/         # Core evaluation engine and metrics
    vitest/       # Vitest integration
    jest/         # Jest integration
    ai-sdk/       # Vercel AI SDK adapter
    tsconfig/     # Shared TypeScript configuration
  examples/       # Example projects
  apps/
    docs/         # Documentation site
```

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** and write tests.

3. **Run checks** before committing:
   ```bash
   pnpm lint        # Biome linting
   pnpm typecheck   # TypeScript type checking
   pnpm test        # Run all tests
   pnpm build       # Ensure everything builds
   ```

4. **Commit your changes** using [Conventional Commits](#commit-conventions).

5. **Push to your fork** and open a Pull Request against `main`.

## How to Add a New Metric

Adding a new evaluation metric is one of the most impactful contributions you can make.

### Step 1: Create the Metric File

Create a new file in `packages/core/src/metrics/`:

```typescript
// packages/core/src/metrics/my-metric.ts
import type { LLMTestCase } from "../test-case";
import type { BaseMetric, MetricResult } from "./base";

export interface MyMetricOptions {
  threshold?: number;
  model?: string;
  verbose?: boolean;
}

export class MyMetric implements BaseMetric {
  readonly name = "MyMetric";
  private threshold: number;

  constructor(options: MyMetricOptions = {}) {
    this.threshold = options.threshold ?? 0.5;
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    // 1. Validate required fields
    if (!testCase.actualOutput) {
      throw new Error("MyMetric requires actualOutput");
    }

    // 2. Compute the score (0 to 1)
    const score = await this.computeScore(testCase);

    // 3. Return the result
    return {
      metric: this.name,
      score,
      passed: score >= this.threshold,
      reason: `Score: ${score}`,
    };
  }

  private async computeScore(testCase: LLMTestCase): Promise<number> {
    // Your evaluation logic here
    return 1.0;
  }
}
```

### Step 2: Export the Metric

Add the export to `packages/core/src/index.ts`:

```typescript
export { MyMetric } from "./metrics/my-metric";
export type { MyMetricOptions } from "./metrics/my-metric";
```

### Step 3: Write Tests

Create a test file at `packages/core/src/metrics/__tests__/my-metric.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { MyMetric } from "../my-metric";

describe("MyMetric", () => {
  it("should return a score between 0 and 1", async () => {
    const metric = new MyMetric();
    const result = await metric.measure({
      input: "test input",
      actualOutput: "test output",
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
```

### Step 4: Add Documentation

Update the metrics table in `README.md` with your new metric.

### Step 5: Add a Changeset

```bash
pnpm changeset
```

Select `@assay-ai/core` and describe the change as a minor (new feature).

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process or tooling changes |

### Scopes

Use the package name without the `@assay-ai/` prefix:

- `core` -- changes to `@assay-ai/core`
- `vitest` -- changes to `@assay-ai/vitest`
- `jest` -- changes to `@assay-ai/jest`
- `ai-sdk` -- changes to `@assay-ai/ai-sdk`
- `docs` -- documentation site changes

### Examples

```
feat(core): add hallucination detection metric
fix(vitest): resolve test isolation issue with concurrent runs
docs: update README with Jest integration example
chore: upgrade TypeScript to 5.7
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

- **Indent**: 2 spaces
- **Quotes**: double quotes
- **Semicolons**: always
- **Trailing commas**: always
- **Line width**: 100

The pre-commit hook runs Biome automatically via `lint-staged`. You can also run it manually:

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

## Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

When making a user-facing change, add a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages are affected
2. Choose the semver bump type (patch / minor / major)
3. Write a summary of the change

The changeset file will be committed with your PR. The maintainers will handle publishing.

## Pull Request Guidelines

- Fill out the PR template completely
- Keep PRs focused -- one feature or fix per PR
- Include tests for new functionality
- Ensure all CI checks pass
- Update documentation if applicable

## Need Help?

- Open an [issue](https://github.com/assay-ai/assay/issues) for bugs or feature requests
- Start a [discussion](https://github.com/assay-ai/assay/discussions) for questions

Thank you for contributing!
