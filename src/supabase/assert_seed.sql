-- ============================================================
-- Seed Integrity Assertions (current schema)
-- Every query should return 0 rows.
-- ============================================================

-- 1. Clinics missing equipment
SELECT c.id, c.name, 'missing equipment' AS issue
FROM clinics c
LEFT JOIN clinic_equipment e ON e.clinic_id = c.id
WHERE e.id IS NULL;

-- 2. Clinics missing certifications
SELECT c.id, c.name, 'missing certifications' AS issue
FROM clinics c
LEFT JOIN certifications cert ON cert.clinic_id = c.id
WHERE cert.id IS NULL;

-- 3. Clinics missing availability
SELECT c.id, c.name, 'missing availability' AS issue
FROM clinics c
LEFT JOIN clinic_availability a ON a.clinic_id = c.id
WHERE a.id IS NULL;

-- 4. Clinics missing therapeutic area tags
SELECT id, name, 'missing therapeutic areas' AS issue
FROM clinics
WHERE therapeutic_area_ids IS NULL
   OR cardinality(therapeutic_area_ids) = 0;

-- 5. Organizations seeded as clinic orgs without a clinic row
SELECT o.id, o.name, 'orphan clinic organization' AS issue
FROM organizations o
LEFT JOIN clinics c ON c.organization_id = o.id
WHERE o.type = 'clinic'
  AND c.id IS NULL;
