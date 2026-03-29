import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function readRepoFile(path: string) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("supabase contract uses cro instead of sponsor enums", () => {
  const supabaseTypes = readRepoFile("src/types/supabase.ts");

  assert.match(supabaseTypes, /organization_type:\s*"cro"\s*\|\s*"clinic"/);
  assert.doesNotMatch(supabaseTypes, /organization_type:\s*"sponsor"\s*\|\s*"clinic"/);

  assert.match(supabaseTypes, /user_role:\s*"cro"\s*\|\s*"clinic_admin"\s*\|\s*"admin"/);
  assert.doesNotMatch(supabaseTypes, /user_role:\s*"sponsor"\s*\|\s*"clinic_admin"\s*\|\s*"admin"/);
});

test("seed auth script creates CRO users with the cro role", () => {
  const seedAuth = readRepoFile("src/supabase/seed-auth.ts");

  assert.match(seedAuth, /createUser\(\s*"cro@demo\.com",\s*"Demo1234!",\s*"cro"/);
  assert.match(seedAuth, /createUser\(\s*"cro2@demo\.com",\s*"Demo1234!",\s*"cro"/);
  assert.doesNotMatch(seedAuth, /createUser\(\s*"cro@demo\.com",\s*"Demo1234!",\s*"sponsor"/);
  assert.doesNotMatch(seedAuth, /createUser\(\s*"cro2@demo\.com",\s*"Demo1234!",\s*"sponsor"/);
  assert.match(seedAuth, /organization_id:\s*cro1OrgId/);
  assert.doesNotMatch(seedAuth, /sponsor_user_id:\s*cro1Id/);
});
