-- ============================================================
-- TrialMatch — Reference Schema
-- Reflects the live database as of 2026-03-29
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.user_role            AS ENUM ('sponsor', 'clinic_admin', 'admin');
CREATE TYPE public.organization_type    AS ENUM ('sponsor', 'clinic');
CREATE TYPE public.clinic_status        AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.equipment_category   AS ENUM ('imaging', 'laboratory', 'monitoring', 'surgical', 'rehabilitation', 'diagnostic', 'other');
CREATE TYPE public.availability_type    AS ENUM ('available', 'busy', 'tentative');
CREATE TYPE public.project_status       AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE public.requirement_type     AS ENUM ('therapeutic_area', 'equipment', 'patient_volume', 'certification', 'geography', 'other');
CREATE TYPE public.match_status         AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE public.inquiry_status       AS ENUM ('open', 'in_progress', 'closed', 'withdrawn');
CREATE TYPE public.message_type         AS ENUM ('text', 'document', 'status_update');


-- ============================================================
-- TABLES
-- ============================================================

-- Organizations (sponsors + clinics both have one)
CREATE TABLE public.organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        public.organization_type NOT NULL,
  website     text,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- User profiles (one per auth.users row, created by trigger)
CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            public.user_role NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  first_name      text,
  last_name       text,
  full_name       text,
  avatar_url      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Therapeutic areas lookup
CREATE TABLE public.therapeutic_areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Clinic sites
CREATE TABLE public.clinics (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES public.organizations(id),
  name                text NOT NULL,
  status              public.clinic_status NOT NULL DEFAULT 'pending',
  address             text,
  city                text,
  country             text,
  latitude            numeric,
  longitude           numeric,
  patient_capacity    integer,
  num_investigators   integer,
  phase_experience    text[],
  therapeutic_area_ids uuid[],
  description         text,
  contact_email       text,
  contact_phone       text,
  website             text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Clinic equipment inventory
CREATE TABLE public.clinic_equipment (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name         text NOT NULL,
  category     public.equipment_category NOT NULL DEFAULT 'other',
  model        text,
  manufacturer text,
  quantity     integer NOT NULL DEFAULT 1,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Clinic certifications
CREATE TABLE public.certifications (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id            uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  certification_name   text NOT NULL,
  issued_by            text,
  valid_until          date,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Clinic availability windows
CREATE TABLE public.clinic_availability (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  type       public.availability_type NOT NULL DEFAULT 'available',
  start_date date NOT NULL,
  end_date   date NOT NULL,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trial projects (created by sponsors)
CREATE TABLE public.trial_projects (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES public.organizations(id),
  title                text NOT NULL,
  description          text,
  status               public.project_status NOT NULL DEFAULT 'draft',
  phase                text,
  therapeutic_area_id  uuid REFERENCES public.therapeutic_areas(id),
  target_enrollment    integer,
  start_date           date,
  end_date             date,
  geographic_preference text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Project requirements (criteria for matching)
CREATE TABLE public.project_requirements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES public.trial_projects(id) ON DELETE CASCADE,
  type          public.requirement_type NOT NULL,
  label         text NOT NULL,
  value         jsonb NOT NULL,
  weight        numeric DEFAULT 1.0,
  is_hard_filter boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Match results (output of the matching algorithm)
CREATE TABLE public.match_results (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES public.trial_projects(id) ON DELETE CASCADE,
  clinic_id         uuid NOT NULL REFERENCES public.clinics(id),
  status            public.match_status NOT NULL DEFAULT 'pending',
  overall_score     numeric,
  score_breakdown   jsonb,
  algorithm_version text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Inquiries (sponsor → clinic partnership requests)
CREATE TABLE public.inquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_result_id uuid NOT NULL REFERENCES public.match_results(id) ON DELETE CASCADE,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  subject         text NOT NULL,
  status          public.inquiry_status NOT NULL DEFAULT 'open',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Inquiry messages (threaded conversation)
CREATE TABLE public.inquiry_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id  uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES auth.users(id),
  type        public.message_type NOT NULL DEFAULT 'text',
  content     text NOT NULL,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE public.audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id),
  action     text NOT NULL,
  table_name text,
  record_id  uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapeutic_areas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_equipment     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_availability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log            ENABLE ROW LEVEL SECURITY;

-- organizations
CREATE POLICY "organizations_select_member" ON public.organizations FOR SELECT USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "organizations_insert_member" ON public.organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "organizations_update_member" ON public.organizations FOR UPDATE USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- profiles
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- therapeutic_areas (public read)
CREATE POLICY "therapeutic_areas_select_all" ON public.therapeutic_areas FOR SELECT USING (true);

-- clinics (public read, owner write)
CREATE POLICY "clinics_select_public"  ON public.clinics FOR SELECT USING (true);
CREATE POLICY "clinics_insert_owner"   ON public.clinics FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "clinics_update_owner"   ON public.clinics FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- clinic_equipment
CREATE POLICY "clinic_equipment_select" ON public.clinic_equipment FOR SELECT USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "clinic_equipment_select_sponsor_all" ON public.clinic_equipment FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sponsor'));
CREATE POLICY "clinic_equipment_insert" ON public.clinic_equipment FOR INSERT WITH CHECK (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "clinic_equipment_update" ON public.clinic_equipment FOR UPDATE USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "clinic_equipment_delete" ON public.clinic_equipment FOR DELETE USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- certifications
CREATE POLICY "certifications_select" ON public.certifications FOR SELECT USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "certifications_select_sponsor_all" ON public.certifications FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sponsor'));
CREATE POLICY "certifications_insert" ON public.certifications FOR INSERT WITH CHECK (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "certifications_delete" ON public.certifications FOR DELETE USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- clinic_availability
CREATE POLICY "clinic_availability_select" ON public.clinic_availability FOR SELECT USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "clinic_availability_select_sponsor_all" ON public.clinic_availability FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'sponsor'));
CREATE POLICY "clinic_availability_insert" ON public.clinic_availability FOR INSERT WITH CHECK (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "clinic_availability_update" ON public.clinic_availability FOR UPDATE USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "clinic_availability_delete" ON public.clinic_availability FOR DELETE USING (clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- trial_projects
CREATE POLICY "trial_projects_select" ON public.trial_projects FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "trial_projects_insert" ON public.trial_projects FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "trial_projects_update" ON public.trial_projects FOR UPDATE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "trial_projects_delete" ON public.trial_projects FOR DELETE USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- project_requirements
CREATE POLICY "project_requirements_select" ON public.project_requirements FOR SELECT USING (project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "project_requirements_insert" ON public.project_requirements FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "project_requirements_update" ON public.project_requirements FOR UPDATE USING (project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "project_requirements_delete" ON public.project_requirements FOR DELETE USING (project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- match_results
CREATE POLICY "match_results_select" ON public.match_results FOR SELECT USING (
  project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  OR clinic_id IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "match_results_insert" ON public.match_results FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())));

-- inquiries
CREATE POLICY "inquiries_select" ON public.inquiries FOR SELECT USING (
  match_result_id IN (
    SELECT mr.id FROM public.match_results mr
    WHERE mr.project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
       OR mr.clinic_id  IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  )
);
CREATE POLICY "inquiries_insert" ON public.inquiries FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "inquiries_update" ON public.inquiries FOR UPDATE USING (
  match_result_id IN (
    SELECT mr.id FROM public.match_results mr
    WHERE mr.project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
       OR mr.clinic_id  IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  )
);

-- inquiry_messages
CREATE POLICY "inquiry_messages_select" ON public.inquiry_messages FOR SELECT USING (
  inquiry_id IN (
    SELECT i.id FROM public.inquiries i
    JOIN public.match_results mr ON mr.id = i.match_result_id
    WHERE mr.project_id IN (SELECT id FROM public.trial_projects WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
       OR mr.clinic_id  IN (SELECT id FROM public.clinics WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()))
  )
);
CREATE POLICY "inquiry_messages_insert" ON public.inquiry_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- audit_log
CREATE POLICY "audit_log_admin_select" ON public.audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- TRIGGER: auto-create organization + profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id    uuid;
  v_role      public.user_role;
  v_org_type  public.organization_type;
  v_first     text;
  v_last      text;
BEGIN
  v_first    := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last     := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  v_role     := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'sponsor');
  v_org_type := CASE v_role WHEN 'clinic_admin' THEN 'clinic'::public.organization_type ELSE 'sponsor'::public.organization_type END;

  INSERT INTO public.organizations (name, type)
  VALUES (TRIM(v_first || ' ' || v_last) || '''s Organization', v_org_type)
  RETURNING id INTO v_org_id;

  INSERT INTO public.profiles (id, role, first_name, last_name, full_name, organization_id)
  VALUES (NEW.id, v_role, v_first, v_last, TRIM(v_first || ' ' || v_last), v_org_id)
  ON CONFLICT (id) DO UPDATE SET
    first_name      = EXCLUDED.first_name,
    last_name       = EXCLUDED.last_name,
    full_name       = EXCLUDED.full_name,
    organization_id = EXCLUDED.organization_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
