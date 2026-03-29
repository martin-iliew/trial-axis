-- ============================================================
-- TrialMatch Seed Data (current schema)
-- Focused on a broad clinic marketplace for matching demos
-- ============================================================

-- ============================================================
-- THERAPEUTIC AREAS
-- ============================================================
INSERT INTO public.therapeutic_areas (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Oncology', 'Cancer and tumor diseases'),
  ('00000000-0000-0000-0000-000000000102', 'Cardiology', 'Heart and cardiovascular diseases'),
  ('00000000-0000-0000-0000-000000000103', 'Neurology', 'Nervous system disorders'),
  ('00000000-0000-0000-0000-000000000104', 'Endocrinology', 'Hormonal and metabolic disorders'),
  ('00000000-0000-0000-0000-000000000105', 'Pulmonology', 'Respiratory and lung diseases'),
  ('00000000-0000-0000-0000-000000000106', 'Rheumatology', 'Autoimmune and musculoskeletal diseases'),
  ('00000000-0000-0000-0000-000000000107', 'Gastroenterology', 'Digestive system disorders'),
  ('00000000-0000-0000-0000-000000000108', 'Dermatology', 'Skin diseases and conditions'),
  ('00000000-0000-0000-0000-000000000109', 'Psychiatry', 'Mental health and behavioral disorders'),
  ('00000000-0000-0000-0000-000000000110', 'Ophthalmology', 'Eye diseases and disorders'),
  ('00000000-0000-0000-0000-000000000111', 'Immunology', 'Immune system disorders and therapies'),
  ('00000000-0000-0000-0000-000000000112', 'Infectious Disease', 'Bacterial, viral, and parasitic infections'),
  ('00000000-0000-0000-0000-000000000113', 'Orthopedics', 'Bone, joint, and musculoskeletal conditions'),
  ('00000000-0000-0000-0000-000000000114', 'Hematology', 'Blood and lymphatic system disorders'),
  ('00000000-0000-0000-0000-000000000115', 'Nephrology', 'Kidney diseases and disorders')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
INSERT INTO public.organizations (id, name, type, website, description) VALUES
  ('00000000-0000-0000-0000-000000000301', 'St. Ivan Rilski University Hospital Research Centre', 'clinic', 'https://www.rilski.bg', 'Academic research hospital in Sofia'),
  ('00000000-0000-0000-0000-000000000302', 'Tokuda Hospital Clinical Trials Unit', 'clinic', 'https://www.tokuda.bg', 'Dedicated clinical trials center in Sofia'),
  ('00000000-0000-0000-0000-000000000303', 'St. George University Hospital Oncology Institute', 'clinic', 'https://www.stgeorge.bg', 'South Bulgaria academic oncology institute'),
  ('00000000-0000-0000-0000-000000000304', 'MedStar Clinic Varna', 'clinic', 'https://www.medstarvarna.bg', 'Cardiology-focused coastal clinic'),
  ('00000000-0000-0000-0000-000000000305', 'Acibadem City Clinic Research', 'clinic', 'https://www.acibademcityclinic.bg', 'High-throughput private research hospital'),
  ('00000000-0000-0000-0000-000000000306', 'Military Medical Academy Sofia', 'clinic', 'https://www.vma.bg', 'National referral center with broad patient access'),
  ('00000000-0000-0000-0000-000000000307', 'Vita Research Center Burgas', 'clinic', 'https://www.vita-research.bg', 'Lean private research site'),
  ('00000000-0000-0000-0000-000000000308', 'Prof. Dr. Stoyan Kirkovich University Hospital', 'clinic', 'https://www.mbal-stara-zagora.com', 'Regional university hospital with CNS focus'),
  ('00000000-0000-0000-0000-000000000309', 'Charite Clinical Research Organisation', 'clinic', 'https://www.charite.de', 'Large European academic site'),
  ('00000000-0000-0000-0000-000000000310', 'Amsterdam UMC Trial Centre', 'clinic', 'https://www.amsterdamumc.nl', 'High-quality academic trial center'),
  ('00000000-0000-0000-0000-000000000311', 'Hospital Vall d''Hebron Research Institute', 'clinic', 'https://www.vhir.org', 'Major oncology and cardiology center'),
  ('00000000-0000-0000-0000-000000000312', 'Gustave Roussy Clinical Trials Office', 'clinic', 'https://www.gustaveroussy.fr', 'Large dedicated oncology center'),
  ('00000000-0000-0000-0000-000000000313', 'University Hospital Zurich Research Centre', 'clinic', 'https://www.usz.ch', 'Swiss cardiology and neurology center'),
  ('00000000-0000-0000-0000-000000000314', 'Pirogov Emergency Research Center', 'clinic', 'https://pirogov.eu', 'High-volume multidisciplinary emergency hospital'),
  ('00000000-0000-0000-0000-000000000315', 'Alexandrovska Metabolic Disorders Unit', 'clinic', 'https://alexandrovska.bg', 'Endocrinology and nephrology specialist clinic'),
  ('00000000-0000-0000-0000-000000000316', 'Queen Giovanna Pulmonary Research Clinic', 'clinic', 'https://isul.eu', 'Respiratory and infectious disease center'),
  ('00000000-0000-0000-0000-000000000317', 'Pleven Heart and Vascular Institute', 'clinic', 'https://hearthospital.bg', 'Regional cardiovascular trials center'),
  ('00000000-0000-0000-0000-000000000318', 'Ruse Danube Gastro Center', 'clinic', 'https://danubegastro.bg', 'Gastroenterology and immunology focused site'),
  ('00000000-0000-0000-0000-000000000319', 'Thessaloniki Precision Oncology Center', 'clinic', 'https://t-poc.gr', 'Cross-border oncology and hematology center'),
  ('00000000-0000-0000-0000-000000000320', 'Bucharest NeuroAxis Trial Hub', 'clinic', 'https://neuroaxis.ro', 'Neurology and psychiatry network site'),
  ('00000000-0000-0000-0000-000000000321', 'Belgrade Autoimmune and Rheumatology Clinic', 'clinic', 'https://barc.rs', 'Rheumatology and immunology specialist site'),
  ('00000000-0000-0000-0000-000000000322', 'Skopje Vision and Retina Institute', 'clinic', 'https://retina.mk', 'Ophthalmology-focused outpatient research institute')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CLINICS
-- The first three IDs are preserved for seed-auth.ts demo account linking.
-- ============================================================
INSERT INTO public.clinics (
  id, organization_id, name, status, address, city, country,
  patient_capacity, num_investigators, phase_experience, therapeutic_area_ids,
  description, contact_email, contact_phone, website
) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', 'St. Ivan Rilski University Hospital Research Centre', 'active', '2 Urvich St, Sofia 1431', 'Sofia', 'Bulgaria', 240, 18, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000114']::uuid[], 'Academic hospital with strong oncology and hematology research.', 'research@rilski.bg', '+359 2 9520 900', 'https://www.rilski.bg'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000302', 'Tokuda Hospital Clinical Trials Unit', 'active', '51B Nikola Vaptsarov Blvd, Sofia 1407', 'Sofia', 'Bulgaria', 320, 22, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000104']::uuid[], 'Fast operational site with broad Phase II-III capacity.', 'trials@tokuda.bg', '+359 2 4035 700', 'https://www.tokuda.bg'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000303', 'St. George University Hospital Oncology Institute', 'active', '66 Peshtersko Shose Blvd, Plovdiv 4000', 'Plovdiv', 'Bulgaria', 280, 20, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000114']::uuid[], 'Large oncology referral center for south Bulgaria.', 'oncology@stgeorge-plovdiv.bg', '+359 32 602 900', 'https://www.stgeorge.bg'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000304', 'MedStar Clinic Varna', 'active', '100 Vladislav Varnenchik Blvd, Varna 9000', 'Varna', 'Bulgaria', 160, 11, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000115']::uuid[], 'Coastal cardiology-focused clinical research unit.', 'research@medstarvarna.bg', '+359 52 688 000', 'https://www.medstarvarna.bg'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000305', 'Acibadem City Clinic Research', 'active', '2 Srebarna St, Sofia 1407', 'Sofia', 'Bulgaria', 340, 24, ARRAY['II','IIa','IIb','III'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000106']::uuid[], 'Private hospital with mature sponsor operations and strong screening.', 'clinicaltrials@acibadem.bg', '+359 2 9069 100', 'https://www.acibademcityclinic.bg'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000306', 'Military Medical Academy Sofia', 'active', '3 Georgi Sofiiski St, Sofia 1606', 'Sofia', 'Bulgaria', 190, 13, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000109','00000000-0000-0000-0000-000000000112']::uuid[], 'Multidisciplinary referral center with broad patient access.', 'research@mma.bg', '+359 2 9225 810', 'https://www.vma.bg'),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000307', 'Vita Research Center Burgas', 'active', '120 Alexandrovska St, Burgas 8000', 'Burgas', 'Bulgaria', 95, 7, ARRAY['III','IV'], ARRAY['00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000105']::uuid[], 'Lean private site optimized for quick startup.', 'info@vita-research.bg', '+359 56 813 200', 'https://www.vita-research.bg'),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000308', 'Prof. Dr. Stoyan Kirkovich University Hospital', 'active', '11 Armeyska St, Stara Zagora 6000', 'Stara Zagora', 'Bulgaria', 140, 10, ARRAY['II','IIa','IIb','III'], ARRAY['00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000109']::uuid[], 'Regional CNS-focused hospital with strong psychiatry referrals.', 'research@kirkovich.bg', '+359 42 664 401', 'https://www.mbal-stara-zagora.com'),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000309', 'Charite Clinical Research Organisation', 'active', 'Chariteplatz 1, 10117 Berlin', 'Berlin', 'Germany', 620, 44, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000108','00000000-0000-0000-0000-000000000109','00000000-0000-0000-0000-000000000110','00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000112','00000000-0000-0000-0000-000000000113','00000000-0000-0000-0000-000000000114','00000000-0000-0000-0000-000000000115']::uuid[], 'Large European academic site with advanced imaging and cell therapy.', 'cro@charite.de', '+49 30 450 550', 'https://www.charite.de'),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000310', 'Amsterdam UMC Trial Centre', 'active', 'Meibergdreef 9, 1105 AZ Amsterdam', 'Amsterdam', 'Netherlands', 410, 29, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000114']::uuid[], 'Academic center with strong data quality and broad therapeutic reach.', 'trials@amsterdamumc.nl', '+31 20 566 9111', 'https://www.amsterdamumc.nl'),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000311', 'Hospital Vall d''Hebron Research Institute', 'active', 'Passeig de la Vall d''Hebron 119-129, Barcelona', 'Barcelona', 'Spain', 450, 31, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000111']::uuid[], 'High-volume academic site with deep oncology experience.', 'research@vhir.org', '+34 93 489 4000', 'https://www.vhir.org'),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000312', 'Gustave Roussy Clinical Trials Office', 'active', '114 Rue Edouard Vaillant, 94805 Villejuif', 'Villejuif', 'France', 560, 38, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000108','00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000114']::uuid[], 'Large dedicated oncology center with cell therapy capabilities.', 'essais-cliniques@gustaveroussy.fr', '+33 1 4211 4211', 'https://www.gustaveroussy.fr'),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000313', 'University Hospital Zurich Research Centre', 'active', 'Ramistrasse 100, 8091 Zurich', 'Zurich', 'Switzerland', 275, 19, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000115']::uuid[], 'Swiss center with strong cardiology and neurology operations.', 'research@usz.ch', '+41 44 255 1111', 'https://www.usz.ch'),
  ('00000000-0000-0000-0000-000000000214', '00000000-0000-0000-0000-000000000314', 'Pirogov Emergency Research Center', 'active', '21 Totleben Blvd, Sofia 1606', 'Sofia', 'Bulgaria', 175, 12, ARRAY['II','IIa','IIb','III'], ARRAY['00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000112','00000000-0000-0000-0000-000000000113']::uuid[], 'High-volume emergency hospital suitable for infectious disease and neuro trials.', 'studies@pirogov.eu', '+359 2 9154 233', 'https://pirogov.eu'),
  ('00000000-0000-0000-0000-000000000215', '00000000-0000-0000-0000-000000000315', 'Alexandrovska Metabolic Disorders Unit', 'active', '1 Georgi Sofiiski Blvd, Sofia 1431', 'Sofia', 'Bulgaria', 155, 10, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000115']::uuid[], 'Specialist center for endocrinology, nephrology, and chronic disease studies.', 'trials@alexandrovska.bg', '+359 2 9230 295', 'https://alexandrovska.bg'),
  ('00000000-0000-0000-0000-000000000216', '00000000-0000-0000-0000-000000000316', 'Queen Giovanna Pulmonary Research Clinic', 'active', '8 Bialo More St, Sofia 1527', 'Sofia', 'Bulgaria', 165, 11, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000112']::uuid[], 'Pulmonology and respiratory infection site with bronchoscopy capabilities.', 'research@isul.eu', '+359 2 9432 170', 'https://isul.eu'),
  ('00000000-0000-0000-0000-000000000217', '00000000-0000-0000-0000-000000000317', 'Pleven Heart and Vascular Institute', 'active', '91 Georgi Kochev Blvd, Pleven 5800', 'Pleven', 'Bulgaria', 185, 14, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000115']::uuid[], 'Cardiology-focused regional site with echo, cath lab, and imaging support.', 'research@hearthospital.bg', '+359 64 886 400', 'https://hearthospital.bg'),
  ('00000000-0000-0000-0000-000000000218', '00000000-0000-0000-0000-000000000318', 'Ruse Danube Gastro Center', 'active', '2 Nezavisimost Sq, Ruse 7000', 'Ruse', 'Bulgaria', 120, 8, ARRAY['II','IIa','IIb','III'], ARRAY['00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000111']::uuid[], 'GI-focused site with immunology crossover and strong outpatient screening.', 'clinical@danubegastro.bg', '+359 82 507 300', 'https://danubegastro.bg'),
  ('00000000-0000-0000-0000-000000000219', '00000000-0000-0000-0000-000000000319', 'Thessaloniki Precision Oncology Center', 'active', '32 Ethnikis Aminis, Thessaloniki 54635', 'Thessaloniki', 'Greece', 260, 17, ARRAY['I','Ia','Ib','II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000111','00000000-0000-0000-0000-000000000114']::uuid[], 'Cross-border precision oncology and hematology site.', 'ctu@t-poc.gr', '+30 2310 884 200', 'https://t-poc.gr'),
  ('00000000-0000-0000-0000-000000000220', '00000000-0000-0000-0000-000000000320', 'Bucharest NeuroAxis Trial Hub', 'active', '120 Splaiul Independentei, Bucharest 050098', 'Bucharest', 'Romania', 210, 16, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000109']::uuid[], 'Neurology and psychiatry network site with strong outpatient recruitment.', 'studies@neuroaxis.ro', '+40 21 315 9012', 'https://neuroaxis.ro'),
  ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000321', 'Belgrade Autoimmune and Rheumatology Clinic', 'active', '8 Dr Subotica St, Belgrade 11000', 'Belgrade', 'Serbia', 145, 9, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000111']::uuid[], 'Specialist site for autoimmune and rheumatology protocols.', 'research@barc.rs', '+381 11 3663 411', 'https://barc.rs'),
  ('00000000-0000-0000-0000-000000000222', '00000000-0000-0000-0000-000000000322', 'Skopje Vision and Retina Institute', 'active', '17 Vodnjanska, Skopje 1000', 'Skopje', 'North Macedonia', 90, 6, ARRAY['II','IIa','IIb','III','IV'], ARRAY['00000000-0000-0000-0000-000000000110','00000000-0000-0000-0000-000000000104']::uuid[], 'Compact ophthalmology site suitable for retina and diabetic eye studies.', 'trials@retina.mk', '+389 2 3147 500', 'https://retina.mk')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CLINIC EQUIPMENT
-- ============================================================
INSERT INTO public.clinic_equipment (clinic_id, name, category, model, manufacturer, quantity, notes) VALUES
  ('00000000-0000-0000-0000-000000000201', 'Leukapheresis Machine', 'laboratory', 'COM.TEC', 'Fresenius', 2, 'Cell therapy capable'),
  ('00000000-0000-0000-0000-000000000201', '3T MRI Scanner', 'imaging', 'MAGNETOM Prisma', 'Siemens', 1, NULL),
  ('00000000-0000-0000-0000-000000000201', 'PET-CT Scanner', 'imaging', 'Discovery MI', 'GE', 1, NULL),
  ('00000000-0000-0000-0000-000000000202', 'MRI Scanner', 'imaging', 'Ingenia', 'Philips', 2, NULL),
  ('00000000-0000-0000-0000-000000000202', 'CT Scanner', 'imaging', 'SOMATOM', 'Siemens', 2, NULL),
  ('00000000-0000-0000-0000-000000000202', 'Echocardiography System', 'diagnostic', 'EPIQ', 'Philips', 2, NULL),
  ('00000000-0000-0000-0000-000000000203', 'PET-CT Scanner', 'imaging', 'Biograph', 'Siemens', 1, NULL),
  ('00000000-0000-0000-0000-000000000203', 'Tumor Biopsy Suite', 'surgical', NULL, NULL, 1, 'Interventional radiology guided'),
  ('00000000-0000-0000-0000-000000000203', 'Flow Cytometer', 'laboratory', 'FACSCanto II', 'BD', 1, NULL),
  ('00000000-0000-0000-0000-000000000204', 'Cardiac Catheterization Lab', 'diagnostic', NULL, NULL, 1, NULL),
  ('00000000-0000-0000-0000-000000000204', 'Holter ECG Monitor', 'monitoring', NULL, 'GE', 5, NULL),
  ('00000000-0000-0000-0000-000000000205', '3T MRI Scanner', 'imaging', 'Skyra', 'Siemens', 1, NULL),
  ('00000000-0000-0000-0000-000000000205', 'Infusion Suite', 'monitoring', NULL, NULL, 15, 'HEPA filtered chairs'),
  ('00000000-0000-0000-0000-000000000206', 'EEG System', 'diagnostic', NULL, 'Nihon Kohden', 3, NULL),
  ('00000000-0000-0000-0000-000000000206', 'MRI Scanner', 'imaging', 'Optima', 'GE', 1, NULL),
  ('00000000-0000-0000-0000-000000000207', 'Spirometry System', 'diagnostic', 'MasterScreen', 'Jaeger', 2, NULL),
  ('00000000-0000-0000-0000-000000000207', 'ECG Machine', 'monitoring', 'MAC 5500', 'GE', 3, NULL),
  ('00000000-0000-0000-0000-000000000208', 'MRI Scanner', 'imaging', 'Essenza', 'Siemens', 1, NULL),
  ('00000000-0000-0000-0000-000000000208', 'EEG System', 'diagnostic', 'Quantum', 'Natus', 4, NULL),
  ('00000000-0000-0000-0000-000000000209', '7T Research MRI', 'imaging', 'Terra', 'Siemens', 1, NULL),
  ('00000000-0000-0000-0000-000000000209', 'Cyclotron PET-CT', 'imaging', 'Biograph', 'Siemens', 1, 'On-site radiopharmacy'),
  ('00000000-0000-0000-0000-000000000209', 'Cell Therapy Cleanroom', 'laboratory', NULL, NULL, 1, 'GMP compliant'),
  ('00000000-0000-0000-0000-000000000210', 'Leukapheresis Machine', 'laboratory', 'Spectra Optia', 'Terumo', 2, NULL),
  ('00000000-0000-0000-0000-000000000210', '3T MRI Scanner', 'imaging', 'Ingenia Ambition', 'Philips', 3, NULL),
  ('00000000-0000-0000-0000-000000000211', 'Phase I Unit', 'monitoring', NULL, NULL, 8, 'Dose escalation capable'),
  ('00000000-0000-0000-0000-000000000211', 'PET-CT Scanner', 'imaging', 'Discovery MI', 'GE', 1, NULL),
  ('00000000-0000-0000-0000-000000000212', 'Radiopharmacy Cyclotron', 'laboratory', NULL, NULL, 1, NULL),
  ('00000000-0000-0000-0000-000000000212', 'Liquid Nitrogen Storage', 'laboratory', NULL, NULL, 8, NULL),
  ('00000000-0000-0000-0000-000000000213', 'Cardiac MRI Suite', 'imaging', NULL, NULL, 1, NULL),
  ('00000000-0000-0000-0000-000000000213', 'Echocardiography System', 'diagnostic', 'Vivid E95', 'GE', 4, NULL),
  ('00000000-0000-0000-0000-000000000214', 'CT Scanner', 'imaging', NULL, 'Siemens', 2, NULL),
  ('00000000-0000-0000-0000-000000000214', 'Isolation Beds', 'monitoring', NULL, NULL, 12, 'Infectious disease capable'),
  ('00000000-0000-0000-0000-000000000215', 'DEXA Scanner', 'diagnostic', NULL, 'Hologic', 1, NULL),
  ('00000000-0000-0000-0000-000000000215', 'Continuous Glucose Monitoring Lab', 'monitoring', NULL, NULL, 1, NULL),
  ('00000000-0000-0000-0000-000000000216', 'Bronchoscopy Tower', 'diagnostic', NULL, 'Olympus', 2, NULL),
  ('00000000-0000-0000-0000-000000000216', 'Pulmonary Function Testing Suite', 'diagnostic', NULL, NULL, 1, NULL),
  ('00000000-0000-0000-0000-000000000217', 'Cardiac Catheterization Lab', 'diagnostic', NULL, NULL, 1, NULL),
  ('00000000-0000-0000-0000-000000000217', 'Echo System', 'diagnostic', NULL, 'Philips', 3, NULL),
  ('00000000-0000-0000-0000-000000000218', 'Endoscopy Suite', 'diagnostic', NULL, 'Olympus', 2, NULL),
  ('00000000-0000-0000-0000-000000000218', 'Infusion Chairs', 'monitoring', NULL, NULL, 6, NULL),
  ('00000000-0000-0000-0000-000000000219', 'NGS Sequencer', 'laboratory', NULL, 'Illumina', 1, 'Precision oncology workflows'),
  ('00000000-0000-0000-0000-000000000219', 'PET-CT Scanner', 'imaging', NULL, 'Siemens', 1, NULL),
  ('00000000-0000-0000-0000-000000000220', 'EEG System', 'diagnostic', NULL, 'Natus', 3, NULL),
  ('00000000-0000-0000-0000-000000000220', 'MRI Scanner', 'imaging', NULL, 'Philips', 2, NULL),
  ('00000000-0000-0000-0000-000000000221', 'Ultrasound Suite', 'diagnostic', NULL, 'GE', 2, NULL),
  ('00000000-0000-0000-0000-000000000221', 'Infusion Suite', 'monitoring', NULL, NULL, 8, NULL),
  ('00000000-0000-0000-0000-000000000222', 'Optical Coherence Tomography', 'diagnostic', NULL, 'Zeiss', 2, NULL),
  ('00000000-0000-0000-0000-000000000222', 'Retinal Imaging Station', 'diagnostic', NULL, 'Topcon', 2, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CERTIFICATIONS
-- ============================================================
INSERT INTO public.certifications (clinic_id, certification_name, issued_by, valid_until) VALUES
  ('00000000-0000-0000-0000-000000000201', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000201', 'FACT Accreditation', 'FACT', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000202', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-01-01'),
  ('00000000-0000-0000-0000-000000000202', 'AAHRPP Accreditation', 'AAHRPP', '2028-01-01'),
  ('00000000-0000-0000-0000-000000000203', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2026-09-01'),
  ('00000000-0000-0000-0000-000000000203', 'ISO 15189 Medical Laboratory', 'Bulgarian Accreditation Service', '2027-01-01'),
  ('00000000-0000-0000-0000-000000000204', 'Joint Commission International', 'JCI', '2027-08-01'),
  ('00000000-0000-0000-0000-000000000205', 'AAHRPP Accreditation', 'AAHRPP', '2028-06-01'),
  ('00000000-0000-0000-0000-000000000205', 'JCI Hospital Accreditation', 'JCI', '2027-02-01'),
  ('00000000-0000-0000-0000-000000000206', 'ISO 9001:2015 Quality Management', 'Bureau Veritas', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000207', 'GCP ICH E6(R2)', 'ICH / BDA Bulgaria', '2027-02-01'),
  ('00000000-0000-0000-0000-000000000208', 'ISO 9001:2015 Quality Management', 'TUV SUD', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000209', 'GMP Cell Therapy Manufacturing', 'Paul-Ehrlich-Institut', '2027-06-01'),
  ('00000000-0000-0000-0000-000000000209', 'AAHRPP Accreditation', 'AAHRPP', '2028-03-01'),
  ('00000000-0000-0000-0000-000000000210', 'FACT Accreditation', 'FACT', '2027-12-01'),
  ('00000000-0000-0000-0000-000000000210', 'ISO 15189 Medical Laboratory', 'RvA Netherlands', '2027-04-01'),
  ('00000000-0000-0000-0000-000000000211', 'AAHRPP Accreditation', 'AAHRPP', '2028-02-01'),
  ('00000000-0000-0000-0000-000000000212', 'FACT Accreditation', 'FACT', '2028-01-01'),
  ('00000000-0000-0000-0000-000000000212', 'GMP Cell and Gene Therapy Manufacturing', 'ANSM France', '2027-08-01'),
  ('00000000-0000-0000-0000-000000000213', 'SwissMedic Site Certification', 'SwissMedic', '2028-01-01'),
  ('00000000-0000-0000-0000-000000000214', 'GCP ICH E6(R2)', 'BDA Bulgaria', '2027-05-01'),
  ('00000000-0000-0000-0000-000000000215', 'ISO 15189 Medical Laboratory', 'Bulgarian Accreditation Service', '2027-09-01'),
  ('00000000-0000-0000-0000-000000000216', 'GCP ICH E6(R2)', 'BDA Bulgaria', '2027-04-01'),
  ('00000000-0000-0000-0000-000000000217', 'JCI Cardiology Program', 'JCI', '2027-11-01'),
  ('00000000-0000-0000-0000-000000000218', 'ISO 9001:2015 Quality Management', 'SGS', '2027-03-01'),
  ('00000000-0000-0000-0000-000000000219', 'CAP Laboratory Accreditation', 'CAP', '2027-10-01'),
  ('00000000-0000-0000-0000-000000000220', 'GCP ICH E6(R2)', 'Romanian Agency for Medicines', '2027-07-01'),
  ('00000000-0000-0000-0000-000000000221', 'EULAR Center of Excellence', 'EULAR', '2027-12-01'),
  ('00000000-0000-0000-0000-000000000222', 'Retina Research Certification', 'Euretina', '2027-08-01')
ON CONFLICT DO NOTHING;

-- ============================================================
-- CLINIC AVAILABILITY
-- ============================================================
INSERT INTO public.clinic_availability (clinic_id, type, start_date, end_date, notes) VALUES
  ('00000000-0000-0000-0000-000000000201', 'available', '2026-05-01', '2029-12-31', 'Open capacity for complex oncology studies'),
  ('00000000-0000-0000-0000-000000000202', 'available', '2026-04-15', '2029-10-31', 'Fast startup window'),
  ('00000000-0000-0000-0000-000000000203', 'available', '2026-06-01', '2029-12-31', 'Large oncology referral flow'),
  ('00000000-0000-0000-0000-000000000204', 'available', '2026-05-15', '2028-12-31', 'Cardiology enrollment window'),
  ('00000000-0000-0000-0000-000000000205', 'available', '2026-04-01', '2029-12-31', 'Strong sponsor readiness'),
  ('00000000-0000-0000-0000-000000000206', 'available', '2026-07-01', '2029-08-31', 'Moderate capacity'),
  ('00000000-0000-0000-0000-000000000207', 'available', '2026-05-01', '2028-05-31', 'Best for lean Phase III-IV studies'),
  ('00000000-0000-0000-0000-000000000208', 'available', '2026-06-15', '2029-07-31', 'CNS studies preferred'),
  ('00000000-0000-0000-0000-000000000209', 'available', '2026-04-01', '2030-12-31', 'High-capacity flagship site'),
  ('00000000-0000-0000-0000-000000000210', 'available', '2026-04-15', '2030-06-30', 'Academic capacity available'),
  ('00000000-0000-0000-0000-000000000211', 'available', '2026-04-01', '2030-05-31', 'Busy but open for priority studies'),
  ('00000000-0000-0000-0000-000000000212', 'available', '2026-04-01', '2030-12-31', 'Large oncology intake'),
  ('00000000-0000-0000-0000-000000000213', 'available', '2026-05-01', '2029-12-31', 'Chronic disease programs'),
  ('00000000-0000-0000-0000-000000000214', 'available', '2026-05-15', '2029-09-30', 'Infectious disease and trauma crossover'),
  ('00000000-0000-0000-0000-000000000215', 'available', '2026-05-01', '2029-11-30', 'Endocrinology and nephrology capacity'),
  ('00000000-0000-0000-0000-000000000216', 'available', '2026-04-15', '2029-10-31', 'Pulmonary capacity available'),
  ('00000000-0000-0000-0000-000000000217', 'available', '2026-05-01', '2029-12-31', 'Cardiovascular trials ready'),
  ('00000000-0000-0000-0000-000000000218', 'available', '2026-06-01', '2029-06-30', 'Outpatient-heavy GI recruitment'),
  ('00000000-0000-0000-0000-000000000219', 'available', '2026-04-01', '2030-03-31', 'Precision oncology programs'),
  ('00000000-0000-0000-0000-000000000220', 'available', '2026-05-01', '2029-12-31', 'Neurology and psychiatry trials'),
  ('00000000-0000-0000-0000-000000000221', 'available', '2026-05-15', '2029-09-30', 'Autoimmune and rheumatology studies'),
  ('00000000-0000-0000-0000-000000000222', 'available', '2026-05-01', '2029-08-31', 'Ophthalmology and diabetic retinopathy studies')
ON CONFLICT DO NOTHING;
