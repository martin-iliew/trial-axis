interface MatchingProjectInput {
  title?: string | null;
  phase?: string | null;
  moleculeType?: string | null;
  geographicPreference?: string | null;
  requiredPatientCount?: number | null;
}

interface MatchingRequirementInput {
  description?: string;
  label?: string;
  priority?: string | null;
  isHardFilter?: boolean;
  weight?: number | null;
}

interface MatchingPreviewClinicInput {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  siteType: string | null;
  activeTrialCount: number | null;
  maxConcurrentTrials: number | null;
}

export interface MatchingPreviewClinic {
  id: string;
  name: string;
  city: string;
  country: string;
  siteType: string;
  activeTrialCount: number;
  maxConcurrentTrials: number;
}

export function buildMatchingCriteriaChips(
  project: MatchingProjectInput,
  requirements: MatchingRequirementInput[],
): string[] {
  const chips: string[] = [];

  if (project.phase) {
    chips.push(`Phase ${project.phase}`);
  }

  if (project.moleculeType) {
    chips.push(project.moleculeType);
  }

  if (project.geographicPreference) {
    chips.push(project.geographicPreference);
  }

  if (project.requiredPatientCount) {
    chips.push(`${project.requiredPatientCount} patients`);
  }

  for (const requirement of requirements) {
    if (chips.length >= 6) {
      break;
    }

    const text = requirement.description ?? requirement.label;
    const priority = requirement.priority;
    const isImportant =
      requirement.isHardFilter ||
      priority === "required" ||
      priority === "preferred" ||
      (requirement.weight ?? 0) >= 0.7;

    if (text && isImportant) {
      chips.push(text);
    }
  }

  return chips;
}

export function buildMatchingPreviewQueue(
  clinics: MatchingPreviewClinicInput[],
  limit: number,
): MatchingPreviewClinic[] {
  return [...clinics]
    .sort((left, right) => {
      const leftLoad = (left.activeTrialCount ?? 0) + (left.maxConcurrentTrials ?? 0);
      const rightLoad = (right.activeTrialCount ?? 0) + (right.maxConcurrentTrials ?? 0);

      return rightLoad - leftLoad;
    })
    .slice(0, limit)
    .map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      city: clinic.city ?? "Unknown city",
      country: clinic.country ?? "Unknown country",
      siteType: clinic.siteType ?? "site",
      activeTrialCount: clinic.activeTrialCount ?? 0,
      maxConcurrentTrials: clinic.maxConcurrentTrials ?? 0,
    }));
}

export function getMatchingMinimumDurationMs(totalClinics: number): number {
  if (totalClinics <= 25) {
    return 9000;
  }

  if (totalClinics <= 120) {
    return 11000;
  }

  if (totalClinics <= 300) {
    return 14000;
  }

  return 15000;
}
