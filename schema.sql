-- ============================================
-- SQP Daily Tracker - Complete Supabase Schema
-- WITH AUTHENTICATION SUPPORT
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This schema works with authenticated users

-- ============================================
-- Step 1: Create the safety_status enum type
-- ============================================
DO $$ BEGIN
    CREATE TYPE safety_status_type AS ENUM ('safe', 'recordable', 'lost-time');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Step 2: Create the daily_entries table
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    production INTEGER,
    quality NUMERIC(5, 2),
    safety_status safety_status_type DEFAULT 'safe',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create an index on the date column for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON public.daily_entries(date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON public.daily_entries(user_id);

-- ============================================
-- Step 3: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Users can insert entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Users can update entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Users can delete entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.daily_entries;
DROP POLICY IF EXISTS "Allow anonymous access" ON public.daily_entries;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.daily_entries;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.daily_entries;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.daily_entries;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.daily_entries;

-- ============================================
-- Step 4: Create RLS Policies for Authenticated Users
-- ============================================
-- Allow authenticated users to view ALL entries (shared data)
CREATE POLICY "Users can view all entries" ON public.daily_entries
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert entries
CREATE POLICY "Users can insert entries" ON public.daily_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update entries
CREATE POLICY "Users can update entries" ON public.daily_entries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete entries
CREATE POLICY "Users can delete entries" ON public.daily_entries
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- Step 5: Create updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_daily_entries_updated_at ON public.daily_entries;
CREATE TRIGGER update_daily_entries_updated_at
    BEFORE UPDATE ON public.daily_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Step 5.5: Create monthly_targets table
-- ============================================
-- Stores production targets and other settings per month
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

-- Trigger for updated_at
CREATE TRIGGER update_monthly_targets_updated_at
    BEFORE UPDATE ON public.monthly_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Step 6: Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.daily_entries TO authenticated;
GRANT ALL ON public.monthly_targets TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- Verification: Check that everything is set up
-- ============================================
SELECT 
    'Table exists' as check_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_entries'
    ) as result
UNION ALL
SELECT 
    'RLS enabled' as check_name,
    relrowsecurity::boolean as result
FROM pg_class
WHERE relname = 'daily_entries';
