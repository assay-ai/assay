import type { File, Reporter, Task, TaskResultPack } from "vitest";

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
};

function colorize(text: string, ...codes: string[]): string {
  return codes.join("") + text + COLORS.reset;
}

function scoreBar(score: number, width = 20): string {
  const filled = Math.round(score * width);
  const empty = width - filled;
  const color = score >= 0.8 ? COLORS.green : score >= 0.5 ? COLORS.yellow : COLORS.red;
  return color + "\u2588".repeat(filled) + COLORS.dim + "\u2591".repeat(empty) + COLORS.reset;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

interface MetricResult {
  metric: string;
  score: number;
  threshold?: number;
  passed: boolean;
}

function extractMetricResults(task: Task): MetricResult[] {
  const results: MetricResult[] = [];

  if (task.result?.state !== "pass" && task.result?.state !== "fail") {
    return results;
  }

  // Extract metric info from assertion errors if available
  if (task.result.errors) {
    for (const error of task.result.errors) {
      const message = error.message ?? "";

      // Parse metric results from our formatted error messages
      const metricMatch = /Expected test case (?:to|NOT to) pass (\S+)/.exec(message);
      const scoreMatch = /Score:\s+([\d.]+)%/.exec(message);
      const thresholdMatch = /Threshold:\s+([\d.]+)%/.exec(message);

      if (metricMatch && scoreMatch && thresholdMatch) {
        const score = Number.parseFloat(scoreMatch[1]!) / 100;
        const threshold = Number.parseFloat(thresholdMatch[1]!) / 100;
        results.push({
          metric: metricMatch[1]!,
          score,
          threshold,
          passed: score >= threshold,
        });
      }
    }
  }

  return results;
}

/**
 * Vitest Reporter that formats Assay evaluation results with visual scoring
 * indicators, metric breakdowns, and a summary table.
 */
export class AssayReporter implements Reporter {
  private startTime = 0;
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;
  private allMetricResults: Array<{ test: string; metrics: MetricResult[] }> = [];

  onInit(): void {
    this.startTime = Date.now();
    console.log("");
    console.log(
      colorize(" ASSAY ", COLORS.bold, COLORS.bgGreen, COLORS.white) +
        colorize(" LLM Evaluation Suite", COLORS.bold, COLORS.cyan),
    );
    console.log(colorize("─".repeat(60), COLORS.dim));
    console.log("");
  }

  onTaskUpdate(packs: TaskResultPack[]): void {
    for (const [id, result] of packs) {
      if (!result) continue;

      // Task updates are processed; we accumulate counts in onFinished
      void id;
    }
  }

  onFinished(files?: File[]): void {
    if (!files) return;

    const tasks = this.collectTasks(files);

    for (const task of tasks) {
      this.totalTests++;

      if (task.result?.state === "pass") {
        this.passedTests++;
        this.printTaskResult(task, true);
      } else if (task.result?.state === "fail") {
        this.failedTests++;
        this.printTaskResult(task, false);
      } else {
        this.skippedTests++;
      }
    }

    this.printSummary();
  }

  private collectTasks(files: File[]): Task[] {
    const tasks: Task[] = [];

    function walk(items: Task[]): void {
      for (const item of items) {
        if (item.type === "test") {
          tasks.push(item);
        }
        if ("tasks" in item && item.tasks) {
          walk(item.tasks);
        }
      }
    }

    for (const file of files) {
      walk(file.tasks);
    }

    return tasks;
  }

  private printTaskResult(task: Task, passed: boolean): void {
    const icon = passed
      ? colorize("\u2713", COLORS.green)
      : colorize("\u2717", COLORS.red);
    const name = task.name;
    const duration = task.result?.duration
      ? colorize(` (${formatDuration(task.result.duration)})`, COLORS.dim)
      : "";

    console.log(`  ${icon} ${name}${duration}`);

    // Extract and display metric results
    const metricResults = extractMetricResults(task);
    if (metricResults.length > 0) {
      this.allMetricResults.push({ test: name, metrics: metricResults });
      for (const mr of metricResults) {
        const statusIcon = mr.passed
          ? colorize("\u25CF", COLORS.green)
          : colorize("\u25CF", COLORS.red);
        const scoreStr = (mr.score * 100).toFixed(1) + "%";
        const thresholdStr = mr.threshold
          ? colorize(` (min: ${(mr.threshold * 100).toFixed(1)}%)`, COLORS.dim)
          : "";
        console.log(
          `      ${statusIcon} ${mr.metric}: ${scoreBar(mr.score)} ${scoreStr}${thresholdStr}`,
        );
      }
    }
  }

  private printSummary(): void {
    const duration = Date.now() - this.startTime;

    console.log("");
    console.log(colorize("─".repeat(60), COLORS.dim));

    // Metrics summary table
    if (this.allMetricResults.length > 0) {
      console.log("");
      console.log(colorize("  Metric Summary", COLORS.bold, COLORS.magenta));
      console.log("");

      const allMetrics = new Map<string, { scores: number[]; passed: number; total: number }>();

      for (const { metrics } of this.allMetricResults) {
        for (const m of metrics) {
          const existing = allMetrics.get(m.metric) ?? { scores: [], passed: 0, total: 0 };
          existing.scores.push(m.score);
          existing.total++;
          if (m.passed) existing.passed++;
          allMetrics.set(m.metric, existing);
        }
      }

      for (const [name, data] of allMetrics) {
        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        const min = Math.min(...data.scores);
        const max = Math.max(...data.scores);
        const passRate = `${data.passed}/${data.total}`;

        console.log(
          `    ${colorize(name, COLORS.bold)}  avg: ${(avg * 100).toFixed(1)}%  min: ${(min * 100).toFixed(1)}%  max: ${(max * 100).toFixed(1)}%  pass: ${passRate}`,
        );
      }

      console.log("");
      console.log(colorize("─".repeat(60), COLORS.dim));
    }

    // Test totals
    console.log("");
    const parts: string[] = [];
    if (this.passedTests > 0) {
      parts.push(colorize(`${this.passedTests} passed`, COLORS.green, COLORS.bold));
    }
    if (this.failedTests > 0) {
      parts.push(colorize(`${this.failedTests} failed`, COLORS.red, COLORS.bold));
    }
    if (this.skippedTests > 0) {
      parts.push(colorize(`${this.skippedTests} skipped`, COLORS.yellow));
    }
    parts.push(colorize(`${this.totalTests} total`, COLORS.white));

    console.log(`  Tests:    ${parts.join(colorize(" | ", COLORS.dim))}`);
    console.log(`  Duration: ${colorize(formatDuration(duration), COLORS.cyan)}`);
    console.log("");
  }
}
