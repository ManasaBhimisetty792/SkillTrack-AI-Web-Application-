-- ============================================================================
-- SKILLTRACK AI — SUPABASE DATABASE MIGRATION SCHEMA
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'recruiter', 'admin')),
  avatar_url TEXT,
  membership_type TEXT DEFAULT 'free' CHECK (membership_type IN ('free', 'premium')),
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  current_plan TEXT DEFAULT 'Free Plan',
  premium_start_date TIMESTAMPTZ,
  premium_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT PAYMENTS TABLE (Permanent transaction history)
CREATE TABLE IF NOT EXISTS public.student_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  signature TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  plan_name TEXT DEFAULT 'Student Premium',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('created', 'success', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'Razorpay',
  invoice_number TEXT,
  transaction_reference TEXT,
  razorpay_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENT SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.student_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'Student Premium',
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_id UUID REFERENCES public.student_payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECRUITER INTERVIEWS TABLE (Future Ready Architecture)
CREATE TABLE IF NOT EXISTS public.recruiter_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interview_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  interview_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RECRUITER EARNINGS TABLE (Future Ready Architecture)
CREATE TABLE IF NOT EXISTS public.recruiter_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_interviews INT DEFAULT 0,
  amount_per_interview NUMERIC(10, 2) DEFAULT 500.00,
  total_earned NUMERIC(10, 2) DEFAULT 0.00,
  total_paid NUMERIC(10, 2) DEFAULT 0.00,
  remaining_balance NUMERIC(10, 2) DEFAULT 0.00,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RECRUITER PAYOUTS TABLE (Manual Admin Payouts Architecture)
CREATE TABLE IF NOT EXISTS public.recruiter_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'rejected')),
  payment_mode TEXT DEFAULT 'manual_bank_transfer',
  reference_number TEXT,
  paid_by_admin UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_payouts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Student Payments Policies
CREATE POLICY "Students view own payments" ON public.student_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role insert payments" ON public.student_payments FOR INSERT WITH CHECK (true);

-- Student Subscriptions Policies
CREATE POLICY "Students view own subscriptions" ON public.student_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Recruiter Policies
CREATE POLICY "Recruiters view own interviews" ON public.recruiter_interviews FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters view own earnings" ON public.recruiter_earnings FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters view own payouts" ON public.recruiter_payouts FOR SELECT USING (auth.uid() = recruiter_id);
