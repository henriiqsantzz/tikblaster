-- ============================================================
-- TikBlaster - Supabase Database Schema
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Users (extends Supabase Auth) ====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== Business Centers ====================
CREATE TABLE IF NOT EXISTS public.business_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bc_id TEXT NOT NULL,
  name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bc_id)
);

CREATE INDEX idx_bc_user_id ON public.business_centers(user_id);

-- ==================== Advertisers ====================
CREATE TABLE IF NOT EXISTS public.advertisers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bc_id TEXT NOT NULL,
  advertiser_id TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, advertiser_id)
);

CREATE INDEX idx_adv_user_bc ON public.advertisers(user_id, bc_id);
CREATE INDEX idx_adv_status ON public.advertisers(status);

-- ==================== Pixels ====================
CREATE TABLE IF NOT EXISTS public.pixels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advertiser_id TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  pixel_name TEXT,
  status TEXT DEFAULT 'ACTIVE',
  events JSONB DEFAULT '[]',
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pixel_id)
);

CREATE INDEX idx_px_user_adv ON public.pixels(user_id, advertiser_id);

-- ==================== Bulk Campaign Jobs ====================
CREATE TABLE IF NOT EXISTS public.bulk_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bc_id TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'CAMPAIGN_CREATE', -- CAMPAIGN_CREATE, ACCOUNT_PROVISION
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, PARTIAL
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}',
  results JSONB DEFAULT '[]',
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_user ON public.bulk_jobs(user_id);
CREATE INDEX idx_jobs_status ON public.bulk_jobs(status);
CREATE INDEX idx_jobs_created ON public.bulk_jobs(created_at DESC);

-- ==================== Campaign Snapshots (for tracking) ====================
CREATE TABLE IF NOT EXISTS public.campaign_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advertiser_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  ad_status TEXT,
  review_status TEXT,
  previous_status TEXT,
  spend DECIMAL(12,2) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snap_user_date ON public.campaign_snapshots(user_id, snapshot_date);
CREATE INDEX idx_snap_campaign ON public.campaign_snapshots(campaign_id);

-- ==================== Notifications ====================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- AD_APPROVED, AD_REJECTED, ACCOUNT_SUSPENDED, SALE_APPROVED, CAMPAIGN_CREATED, BUDGET_ALERT
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON public.notifications(user_id);
CREATE INDEX idx_notif_unread ON public.notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notif_created ON public.notifications(created_at DESC);

-- ==================== Push Subscriptions ====================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_push_user ON public.push_subscriptions(user_id);

-- ==================== Campaign Templates (saved presets) ====================
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_user ON public.campaign_templates(user_id);

-- ==================== Row Level Security ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Business Centers
CREATE POLICY "Users can view own BCs" ON public.business_centers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own BCs" ON public.business_centers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own BCs" ON public.business_centers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own BCs" ON public.business_centers
  FOR DELETE USING (auth.uid() = user_id);

-- Advertisers
CREATE POLICY "Users can view own advertisers" ON public.advertisers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own advertisers" ON public.advertisers
  FOR ALL USING (auth.uid() = user_id);

-- Pixels
CREATE POLICY "Users can view own pixels" ON public.pixels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own pixels" ON public.pixels
  FOR ALL USING (auth.uid() = user_id);

-- Bulk Jobs
CREATE POLICY "Users can view own jobs" ON public.bulk_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own jobs" ON public.bulk_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.bulk_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Campaign Snapshots
CREATE POLICY "Users can view own snapshots" ON public.campaign_snapshots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own snapshots" ON public.campaign_snapshots
  FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Push Subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Templates
CREATE POLICY "Users can manage own templates" ON public.campaign_templates
  FOR ALL USING (auth.uid() = user_id);

-- ==================== Updated At Trigger ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bc_updated_at
  BEFORE UPDATE ON public.business_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.campaign_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
