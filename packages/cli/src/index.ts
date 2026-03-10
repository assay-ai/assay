import { init } from "./commands/init.js";
import { listMetrics } from "./commands/list-metrics.js";
import { run } from "./commands/run.js";

const args = process.argv.slice(2);
const command = args[0];

function printVersion(): void {
  console.log("assay v0.2.1-beta");
}

function printHelp(): void {
  console.log(`
assay - LLM evaluation framework

Usage:
  assay <command> [options]

Commands:
  run [glob]        Run evaluation files (default: **/*.eval.ts)
  init              Initialize a new assay project
  list-metrics      List all available metrics

Options:
  --version, -v     Show version
  --help, -h        Show this help message

Examples:
  assay run
  assay run "tests/**/*.eval.ts"
  assay run --reporter verbose
  assay init
  assay list-metrics
`);
}

async function main(): Promise<void> {
  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  if (command === "--version" || command === "-v") {
    printVersion();
    process.exit(0);
  }

  switch (command) {
    case "run":
      run(args.slice(1));
      break;
    case "init":
      await init();
      break;
    case "list-metrics":
      listMetrics();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
