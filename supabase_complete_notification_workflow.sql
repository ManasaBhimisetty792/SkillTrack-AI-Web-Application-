-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Complete Notification & Interview Workflow SQL Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Enhance interview_requests table with Meeting Details & Reschedule Fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.interview_requests 
ADD COLUMN IF NOT EXISTS meeting_id TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_date TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '60 mins',
ADD COLUMN IF NOT EXISTS reject_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_status TEXT; -- 'pending_student' | 'accepted_student' | 'rejected_student'

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interview_requests_student_id ON public.interview_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_recruiter_user_id ON public.interview_requests(recruiter_user_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_status ON public.interview_requests(status);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Dedicated interview_feedback Table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_request_id UUID REFERENCES public.interview_requests(id) ON DELETE CASCADE,
    student_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recruiter_user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_rating       NUMERIC DEFAULT 5,
    technical_rating     NUMERIC DEFAULT 5,
    communication_rating NUMERIC DEFAULT 5,
    behaviour_rating     NUMERIC DEFAULT 5,
    comments             TEXT,
    recommendation       TEXT,
    is_anonymous         BOOLEAN DEFAULT FALSE,
    submitted_by_role    TEXT DEFAULT 'student', -- 'student' | 'recruiter'
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for interview_feedback
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read interview feedback" ON public.interview_feedback;
CREATE POLICY "Allow authenticated read interview feedback" 
    ON public.interview_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert interview feedback" ON public.interview_feedback;
CREATE POLICY "Allow authenticated insert interview feedback" 
    ON public.interview_feedback FOR INSERT WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Enhance Notifications Table for Admin & Dynamic Entity References
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS sender_id UUID,
ADD COLUMN IF NOT EXISTS receiver_id UUID,
ADD COLUMN IF NOT EXISTS sender_role TEXT,
ADD COLUMN IF NOT EXISTS receiver_role TEXT,
ADD COLUMN IF NOT EXISTS is_admin_viewable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update RLS for Notifications to allow Admin & User views
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read notifications" ON public.notifications;
CREATE POLICY "Allow authenticated read notifications" 
    ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated insert notifications" 
    ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update notifications" ON public.notifications;
CREATE POLICY "Allow authenticated update notifications" 
    ON public.notifications FOR UPDATE USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Verification Query
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'Migration completed successfully. Table columns updated.' AS result;
