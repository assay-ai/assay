import { execSync } from "node:child_process";

export function run(args: string[]): void {
  let glob = "**/*.eval.ts";
  let reporter: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--reporter" && i + 1 < args.length) {
      reporter = args[i + 1] ?? "";
      i++;
    } else if (arg && !arg.startsWith("--")) {
      glob = arg;
    }
  }

  const reporterFlag = reporter ? ` --reporter ${reporter}` : "";
  const cmd = `npx vitest run "${glob}"${reporterFlag}`;

  console.log(`\nRunning evaluations: ${glob}\n`);

  try {
    execSync(cmd, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch {
    process.exit(1);
  }
}
