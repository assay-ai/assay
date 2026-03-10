import type { MetricResult } from "./metric.js";

export interface EvaluationSummary {
  results: TestCaseResult[];
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  averageScores: Record<string, number>;
  duration: number;
}

export interface TestCaseResult {
  testCaseName: string;
  input: string;
  metricResults: MetricResult[];
  passed: boolean;
}

// Box-drawing characters for table rendering
const BOX = {
  topLeft: "\u250C",
  topRight: "\u2510",
  bottomLeft: "\u2514",
  bottomRight: "\u2518",
  horizontal: "\u2500",
  vertical: "\u2502",
  teeDown: "\u252C",
  teeUp: "\u2534",
  teeRight: "\u251C",
  teeLeft: "\u2524",
  cross: "\u253C",
} as const;

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return str + " ".repeat(len - str.length);
}

function padCenter(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  const left = Math.floor((len - str.length) / 2);
  const right = len - str.length - left;
  return " ".repeat(left) + str + " ".repeat(right);
}

function horizontalLine(
  widths: number[],
  left: string,
  mid: string,
  right: string,
): string {
  return (
    left +
    widths.map((w) => BOX.horizontal.repeat(w + 2)).join(mid) +
    right
  );
}

function row(cells: string[], widths: number[]): string {
  return (
    BOX.vertical +
    cells.map((cell, i) => ` ${padRight(cell, widths[i]!)} `).join(BOX.vertical) +
    BOX.vertical
  );
}

export class ConsoleReporter {
  /**
   * Print a full evaluation summary to the console.
   */
  report(summary: EvaluationSummary): void {
    console.log();
    this.printHeader(summary);
    this.printResultsTable(summary);
    this.printSummaryFooter(summary);
    console.log();
  }

  private printHeader(summary: EvaluationSummary): void {
    const durationSec = (summary.duration / 1000).toFixed(2);
    console.log(
      `  Assay Evaluation Results  (${summary.totalTests} test cases, ${durationSec}s)`,
    );
    console.log();
  }

  private printResultsTable(summary: EvaluationSummary): void {
    if (summary.results.length === 0) {
      console.log("  No test cases to display.");
      return;
    }

    // Collect all metric names
    const metricNames = new Set<string>();
    for (const result of summary.results) {
      for (const mr of result.metricResults) {
        metricNames.add(mr.metricName);
      }
    }
    const metrics = [...metricNames];

    // Column widths
    const nameWidth = Math.max(
      10,
      ...summary.results.map((r) =>
        Math.min(30, r.testCaseName.length),
      ),
    );
    const statusWidth = 6;
    const metricWidth = 8;

    const headers = ["Test Case", "Status", ...metrics];
    const widths = [
      nameWidth,
      statusWidth,
      ...metrics.map((m) => Math.max(metricWidth, m.length)),
    ];

    // Top border
    console.log(
      `  ${horizontalLine(widths, BOX.topLeft, BOX.teeDown, BOX.topRight)}`,
    );

    // Header row
    console.log(`  ${row(headers.map((h, i) => padCenter(h, widths[i]!)), widths)}`);

    // Header separator
    console.log(
      `  ${horizontalLine(widths, BOX.teeRight, BOX.cross, BOX.teeLeft)}`,
    );

    // Data rows
    for (const result of summary.results) {
      const status = result.passed ? "PASS" : "FAIL";
      const cells = [
        result.testCaseName.slice(0, nameWidth),
        status,
        ...metrics.map((metricName) => {
          const mr = result.metricResults.find(
            (r) => r.metricName === metricName,
          );
          if (!mr) return "-";
          return mr.score.toFixed(2);
        }),
      ];
      console.log(`  ${row(cells, widths)}`);
    }

    // Bottom border
    console.log(
      `  ${horizontalLine(widths, BOX.bottomLeft, BOX.teeUp, BOX.bottomRight)}`,
    );
  }

  private printSummaryFooter(summary: EvaluationSummary): void {
    console.log();
    const passRate =
      summary.totalTests > 0
        ? ((summary.totalPassed / summary.totalTests) * 100).toFixed(1)
        : "0.0";

    console.log(
      `  Passed: ${summary.totalPassed}/${summary.totalTests} (${passRate}%)`,
    );

    if (Object.keys(summary.averageScores).length > 0) {
      console.log("  Average Scores:");
      for (const [metric, avg] of Object.entries(summary.averageScores)) {
        console.log(`    ${metric}: ${avg.toFixed(3)}`);
      }
    }
  }
}
