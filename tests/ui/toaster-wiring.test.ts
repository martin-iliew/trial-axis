import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

async function readProjectFile(relativePath: string) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

test("root layout mounts the local shadcn toaster wrapper", async () => {
  const layoutSource = await readProjectFile("src/app/layout.tsx");

  assert.match(
    layoutSource,
    /import\s+\{\s*Toaster\s*\}\s+from\s+"@\/components\/ui\/sonner"/,
  );
  assert.doesNotMatch(layoutSource, /from\s+"sonner"/);
});

test("local sonner wrapper owns semantic toast styling without stock theme tokens", async () => {
  const sonnerSource = await readProjectFile("src/components/ui/sonner.tsx");

  assert.match(sonnerSource, /const\s+Toaster\s*=\s*\(\{\s*\.\.\.props\s*\}:\s*ToasterProps\)/);
  assert.match(sonnerSource, /theme="light"/);
  assert.match(sonnerSource, /"--border-radius":\s*"var\(--radius-xl\)"/);
  assert.doesNotMatch(sonnerSource, /next-themes/);
  assert.doesNotMatch(sonnerSource, /--popover|--normal-bg|--normal-text|--normal-border/);
  assert.match(sonnerSource, /bg-surface-level-1/);
  assert.match(sonnerSource, /border-primary/);
  assert.match(sonnerSource, /bg-surface-status-success/);
  assert.match(sonnerSource, /bg-surface-status-warning/);
  assert.match(sonnerSource, /bg-surface-status-info/);
});
