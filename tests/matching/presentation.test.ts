import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMatchingCriteriaChips,
  buildMatchingPreviewQueue,
  getMatchingMinimumDurationMs,
} from "@/features/matching/presentation";

test("buildMatchingCriteriaChips derives visible chips from project fields and requirements", () => {
  const chips = buildMatchingCriteriaChips(
    {
      title: "Phase III Oncology Study",
      phase: "III",
      moleculeType: "Biologic",
      geographicPreference: "Germany, France",
      requiredPatientCount: 120,
    },
    [
      { description: "PET-CT available on site", priority: "required" },
      { description: "AAHRPP accreditation preferred", priority: "preferred" },
      { description: "Low screen failure rate", priority: "preferred" },
    ],
  );

  assert.deepEqual(chips, [
    "Phase III",
    "Biologic",
    "Germany, France",
    "120 patients",
    "PET-CT available on site",
    "AAHRPP accreditation preferred",
  ]);
});

test("buildMatchingPreviewQueue keeps the highest-signal clinics for the animation pass", () => {
  const queue = buildMatchingPreviewQueue(
    [
      {
        id: "clinic-a",
        name: "Berlin Oncology Center",
        city: "Berlin",
        country: "Germany",
        siteType: "academic_medical_center",
        activeTrialCount: 18,
        maxConcurrentTrials: 30,
      },
      {
        id: "clinic-b",
        name: "Paris Research Unit",
        city: "Paris",
        country: "France",
        siteType: "dedicated_research",
        activeTrialCount: 25,
        maxConcurrentTrials: 40,
      },
      {
        id: "clinic-c",
        name: "Madrid Site Group",
        city: "Madrid",
        country: "Spain",
        siteType: "community_hospital",
        activeTrialCount: 9,
        maxConcurrentTrials: 12,
      },
    ],
    2,
  );

  assert.equal(queue.length, 2);
  assert.deepEqual(
    queue.map((clinic) => clinic.name),
    ["Paris Research Unit", "Berlin Oncology Center"],
  );
});

test("getMatchingMinimumDurationMs scales with clinic pool size but stays within cinematic bounds", () => {
  assert.equal(getMatchingMinimumDurationMs(18), 9000);
  assert.equal(getMatchingMinimumDurationMs(80), 11000);
  assert.equal(getMatchingMinimumDurationMs(240), 14000);
  assert.equal(getMatchingMinimumDurationMs(800), 15000);
});
