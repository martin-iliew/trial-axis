import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

async function readProjectFile(relativePath: string) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

test("MobileMenu is a client component", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /'use client'/);
});

test("MobileMenu hamburger button is hidden on desktop", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /sm:hidden/);
  assert.match(src, /aria-label/);
});

test("MobileMenu drawer has role=dialog and aria-modal", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /role="dialog"/);
  assert.match(src, /aria-modal="true"/);
});

test("MobileMenu drawer slides in from the right", async () => {
  const src = await readProjectFile("src/components/layout/MobileMenu.tsx");
  assert.match(src, /translate-x-full/);
  assert.match(src, /translate-x-0/);
});

test("Navbar delegates mobile nav to MobileMenu", async () => {
  const src = await readProjectFile("src/components/layout/Navbar.tsx");
  assert.match(src, /MobileMenu/);
  assert.match(src, /hidden sm:flex/);
});

test("ClinicProfileTabs list rows have min-w-0 on text containers", async () => {
  const src = await readProjectFile(
    "src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx"
  );
  const count = (src.match(/min-w-0/g) ?? []).length;
  assert.ok(count >= 3, `Expected ≥3 min-w-0 instances (equipment + cert + availability), got ${count}`);
});

test("ClinicProfileTabs Remove buttons are shrink-0", async () => {
  const src = await readProjectFile(
    "src/app/(clinic)/clinic/profile/components/ClinicProfileTabs.tsx"
  );
  const count = (src.match(/shrink-0/g) ?? []).length;
  assert.ok(count >= 3, `Expected ≥3 shrink-0 Remove buttons, got ${count}`);
});
