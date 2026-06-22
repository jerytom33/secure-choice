-- SQL Schema for Secure Choice Database (Supabase PostgreSQL)

-- 1. Health Insurance Leads Table
CREATE TABLE IF NOT EXISTS public."HealthInsuranceLeads" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    state TEXT,
    family_members JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for HealthInsuranceLeads
ALTER TABLE public."HealthInsuranceLeads" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the lead forms)
CREATE POLICY "Allow public insert" ON public."HealthInsuranceLeads"
    FOR INSERT WITH CHECK (true);

-- Allow authenticated reads (for the Admin Dashboard)
CREATE POLICY "Allow authenticated read" ON public."HealthInsuranceLeads"
    FOR SELECT TO authenticated USING (true);


-- 2. Life Insurance Leads Table
CREATE TABLE IF NOT EXISTS public."LifeInsuranceLeads" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL,
    dob DATE,
    profession TEXT,
    annual_income TEXT,
    existing_policies TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for LifeInsuranceLeads
ALTER TABLE public."LifeInsuranceLeads" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow public insert" ON public."LifeInsuranceLeads"
    FOR INSERT WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Allow authenticated read" ON public."LifeInsuranceLeads"
    FOR SELECT TO authenticated USING (true);


-- 3. General Insurance Leads Table
CREATE TABLE IF NOT EXISTS public."GeneralInsuranceLeads" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    state TEXT,
    insurance_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for GeneralInsuranceLeads
ALTER TABLE public."GeneralInsuranceLeads" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow public insert" ON public."GeneralInsuranceLeads"
    FOR INSERT WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Allow authenticated read" ON public."GeneralInsuranceLeads"
    FOR SELECT TO authenticated USING (true);


-- 4. Consultation Requests Table
CREATE TABLE IF NOT EXISTS public."ConsultationRequests" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_date DATE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for ConsultationRequests
ALTER TABLE public."ConsultationRequests" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow public insert" ON public."ConsultationRequests"
    FOR INSERT WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Allow authenticated read" ON public."ConsultationRequests"
    FOR SELECT TO authenticated USING (true);
