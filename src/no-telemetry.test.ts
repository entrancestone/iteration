import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// This fork sends no telemetry. Guard against the upstream analytics host,
// Umami settings, or the old opt-out variable creeping back into the sources,
// the build config, or the release workflow.
const BANNED = /a\.kunchenguid\.com|umami|ITERATION_TELEMETRY/i;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|js|mjs)$/.test(name) && !name.endsWith("no-telemetry.test.ts")
      ? [path]
      : [];
  });
}

describe("no telemetry", () => {
  it("embeds no analytics host or Umami settings", () => {
    const files = [
      ...sourceFiles("src"),
      "tsdown.config.ts",
      ".github/workflows/release-please.yml",
    ];
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(BANNED);
    }
  });
});
