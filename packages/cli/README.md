<div align="center">

# @assay-ai/cli

*Command-line interface for the Assay LLM evaluation framework*

[![npm version](https://img.shields.io/npm/v/@assay-ai/cli?style=flat-square&color=6366f1)](https://www.npmjs.com/package/@assay-ai/cli)
[![downloads](https://img.shields.io/npm/dm/@assay-ai/cli?style=flat-square&color=10b981)](https://www.npmjs.com/package/@assay-ai/cli)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/assay-ai/assay/blob/main/LICENSE)

[Documentation](https://assay.js.org) · [Metrics](https://assay.js.org/metrics/) · [API Reference](https://assay.js.org/api/)

</div>

## Installation

```bash
pnpm add -g @assay-ai/cli     # pnpm
npm install -g @assay-ai/cli   # npm
yarn global add @assay-ai/cli  # Yarn
```

## Quick Start

```bash
# Initialize a new project (creates assay.config.ts)
assay init

# Run all *.eval.ts files
assay run

# Run a specific glob pattern
assay run "tests/**/*.eval.ts"

# List all 18 built-in metrics
assay list-metrics
```

## Part of the [Assay](https://github.com/assay-ai/assay) monorepo

<p align="center">
  <a href="https://assay.js.org"><img src="https://img.shields.io/badge/Documentation-6366f1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://www.npmjs.com/package/@assay-ai/cli"><img src="https://img.shields.io/badge/npm-cb3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" /></a>
  <a href="https://github.com/assay-ai/assay"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://github.com/assay-ai/assay/issues"><img src="https://img.shields.io/badge/Issues-6366f1?style=for-the-badge&logo=github&logoColor=white" alt="Issues" /></a>
</p>
