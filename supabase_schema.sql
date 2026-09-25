-- =========================================================
-- SyncPulse: Meeting Decision & Action Tracker
-- Supabase PostgreSQL Database Schema
-- Paste this script into your Supabase SQL Editor and run it!
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users & Profiles Table (Synced automatically on Google Sign-In)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    google_access_token TEXT,
    google_refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Meetings Table
CREATE TABLE IF NOT EXISTS public.meetings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, -- user's email or UUID
    title TEXT NOT NULL,
    meeting_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_transcript TEXT NOT NULL,
    summary TEXT,
    key_topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Decisions Table
CREATE TABLE IF NOT EXISTS public.decisions (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES public.meetings(id) ON DELETE CASCADE,
    decision_text TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    rationale TEXT,
    source_quote TEXT,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Action Items Table
CREATE TABLE IF NOT EXISTS public.action_items (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES public.meetings(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_email TEXT,
    deadline TIMESTAMPTZ,
    priority TEXT DEFAULT 'Medium',
    category TEXT DEFAULT 'Engineering',
    source_quote TEXT,
    status TEXT DEFAULT 'pending',
    synced_tools JSONB DEFAULT '{
        "calendar": {"synced": false, "event_id": null, "synced_at": null},
        "jira": {"synced": false, "issue_key": null, "synced_at": null},
        "slack": {"synced": false, "message_ts": null, "synced_at": null},
        "email": {"synced": false, "sent_at": null}
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. User Integrations & API Configs
CREATE TABLE IF NOT EXISTS public.user_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'google', 'jira', 'slack'
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMPTZ,
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider)
);

-- 7. Indexes for High Performance Search
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON public.meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_meeting_id ON public.decisions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON public.action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_owner ON public.action_items(owner_name);

-- 8. Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Allow read/write access
CREATE POLICY "Public access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public access meetings" ON public.meetings FOR ALL USING (true);
CREATE POLICY "Public access decisions" ON public.decisions FOR ALL USING (true);
CREATE POLICY "Public access action_items" ON public.action_items FOR ALL USING (true);
CREATE POLICY "Public access user_integrations" ON public.user_integrations FOR ALL USING (true);
