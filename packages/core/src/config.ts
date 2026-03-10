import type { BaseMetric } from "./metric.js";
import type { BaseLLMProvider } from "./providers/base.js";

export interface AssayConfig {
  /** Default LLM provider for metrics that need one */
  provider?: BaseLLMProvider;
  /** Provider name shorthand (resolved via resolveProvider) */
  providerName?: "openai" | "anthropic" | "ollama";
  /** Model override */
  model?: string;
  /** API key override */
  apiKey?: string;
  /** Base URL override */
  baseUrl?: string;
  /** Default metrics to run if not specified per-evaluate call */
  metrics?: BaseMetric[];
  /** Max concurrent test case evaluations. Default 5. */
  concurrency?: number;
  /** Global threshold override */
  threshold?: number;
  /** Whether to print results to console. Default true. */
  verbose?: boolean;
}

let cachedConfig: AssayConfig | null = null;

/**
 * Attempt to auto-discover and load assay.config.ts from the current
 * working directory. Returns an empty config if not found.
 *
 * Looks for:
 * - assay.config.ts
 * - assay.config.js
 * - assay.config.mjs
 */
export async function resolveConfig(overrides: AssayConfig = {}): Promise<AssayConfig> {
  if (cachedConfig && Object.keys(overrides).length === 0) {
    return cachedConfig;
  }

  const cwd = process.cwd();
  const configNames = ["assay.config.ts", "assay.config.js", "assay.config.mjs"];

  let fileConfig: AssayConfig = {};

  for (const name of configNames) {
    const configPath = `${cwd}/${name}`;
    try {
      // Dynamic import for config file discovery
      const mod = (await import(configPath)) as {
        default?: AssayConfig;
      } & AssayConfig;
      fileConfig = mod.default ?? mod;
      break;
    } catch {
      // Config file not found, continue
    }
  }

  const resolved: AssayConfig = {
    ...fileConfig,
    ...overrides,
    concurrency: overrides.concurrency ?? fileConfig.concurrency ?? 5,
    verbose: overrides.verbose ?? fileConfig.verbose ?? true,
  };

  if (Object.keys(overrides).length === 0) {
    cachedConfig = resolved;
  }

  return resolved;
}

/**
 * Reset the cached config (useful for testing).
 */
export function resetConfigCache(): void {
  cachedConfig = null;
}
