import type { BaseMetric } from "@assay-ai/core";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeRelevant(options?: { threshold?: number }): Promise<R>;
      toBeFaithful(options?: { threshold?: number }): Promise<R>;
      toNotHallucinate(options?: { threshold?: number }): Promise<R>;
      toPassMetric(metric: BaseMetric): Promise<R>;
      toPassAllMetrics(metrics: BaseMetric[]): Promise<R>;
    }
  }
}
