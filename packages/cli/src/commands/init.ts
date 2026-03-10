import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_TEMPLATE = `import type { AssayConfig } from "@assay-ai/core";

const config: AssayConfig = {
  // Provider auto-detect: reads OPENAI_API_KEY or ANTHROPIC_API_KEY from env
  providerName: "openai",
  threshold: 0.5,
  concurrency: 5,
  verbose: true,
};

export default config;
`;

type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

function detectPackageManager(): PackageManager {
  const cwd = process.cwd();

  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "bun.lockb"))) return "bun";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";

  return "npm";
}

function getInstallCommand(pm: PackageManager): string {
  const packages = "@assay-ai/core @assay-ai/vitest vitest";
  switch (pm) {
    case "pnpm":
      return `pnpm add -D ${packages}`;
    case "yarn":
      return `yarn add -D ${packages}`;
    case "bun":
      return `bun add -D ${packages}`;
    default:
      return `npm add -D ${packages}`;
  }
}

export async function init(): Promise<void> {
  const configPath = join(process.cwd(), "assay.config.ts");

  if (existsSync(configPath)) {
    console.log("assay.config.ts already exists, skipping.");
    return;
  }

  writeFileSync(configPath, CONFIG_TEMPLATE, "utf-8");
  console.log("Created assay.config.ts");

  const pm = detectPackageManager();
  const installCmd = getInstallCommand(pm);

  console.log(`\nDetected package manager: ${pm}`);
  console.log(`\nInstall dependencies:\n  ${installCmd}\n`);
}
