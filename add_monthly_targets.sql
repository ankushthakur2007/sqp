-- ============================================
-- Add monthly_targets table
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the monthly_targets table
CREATE TABLE IF NOT EXISTS public.monthly_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    production_target INTEGER DEFAULT 4000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year, month)
);

-- Create index for faster month lookups
CREATE INDEX IF NOT EXISTS idx_monthly_targets_year_month ON public.monthly_targets(year, month);

-- Enable RLS
ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monthly_targets
CREATE POLICY "Users can view all targets" ON public.monthly_targets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert targets" ON public.monthly_targets
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update targets" ON public.monthly_targets
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_monthly_targets_updated_at ON public.monthly_targets;
CREATE TRIGGER update_monthly_targets_updated_at
    BEFORE UPDATE ON public.monthly_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.monthly_targets TO authenticated;

-- Verify
SELECT 'monthly_targets table created successfully!' as status;
