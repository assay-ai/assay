# @assay-ai/cli

Command-line interface for the [Assay](https://github.com/assay-ai/assay) LLM evaluation framework.

## Installation

```bash
npm install -g @assay-ai/cli
# or
pnpm add -g @assay-ai/cli
```

## Usage

### Initialize a project

```bash
assay init
```

Creates an `assay.config.ts` and prints the install command for your detected package manager.

### Run evaluations

```bash
# Run all *.eval.ts files
assay run

# Run a specific glob pattern
assay run "tests/**/*.eval.ts"

# With a custom reporter
assay run --reporter verbose
```

### List available metrics

```bash
assay list-metrics
```

Prints a formatted table of all built-in metrics with their type (LLM / Non-LLM) and required fields.

### Other options

```bash
assay --version
assay --help
```
