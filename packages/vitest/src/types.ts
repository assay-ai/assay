import type { BaseMetric, LLMTestCase } from "@assay-ai/core";

declare module "vitest" {
  interface Assertion<T = any> {
    toBeRelevant(options?: { threshold?: number }): Promise<void>;
    toBeFaithful(options?: { threshold?: number }): Promise<void>;
    toNotHallucinate(options?: { threshold?: number }): Promise<void>;
    toPassMetric(metric: BaseMetric): Promise<void>;
    toPassAllMetrics(metrics: BaseMetric[]): Promise<void>;
  }
  interface AsymmetricMatchersContaining {
    toBeRelevant(options?: { threshold?: number }): void;
    toBeFaithful(options?: { threshold?: number }): void;
    toNotHallucinate(options?: { threshold?: number }): void;
    toPassMetric(metric: BaseMetric): void;
    toPassAllMetrics(metrics: BaseMetric[]): void;
  }
}
