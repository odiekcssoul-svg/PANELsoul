-- StreamAdmin - Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS (extends auth.users)
-- =====================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CLIENTS
-- =====================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- STREAMING ACCOUNTS
-- =====================
CREATE TABLE IF NOT EXISTS public.streaming_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN (
    'Netflix','Prime Video','Disney+','HBO Max','Spotify',
    'YouTube Premium','Crunchyroll','Vix Premium','Paramount+'
  )),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','suspended')),
  start_date DATE,
  renewal_date DATE NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  counter INTEGER DEFAULT 1,
  account_status VARCHAR(50),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PROVIDERS
-- =====================
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  service VARCHAR(50) NOT NULL,
  contact VARCHAR(100),
  renewal_date DATE,
  price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- GMAIL ACCOUNTS
-- =====================
CREATE TABLE IF NOT EXISTS public.gmail_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- RENEWALS
-- =====================
CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streaming_account_id UUID REFERENCES public.streaming_accounts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) DEFAULT 0,
  renewal_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- NOTIFICATIONS
-- =====================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('renewal','expiration','info','warning')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ACTIVITY LOG
-- =====================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_streaming_accounts_client ON public.streaming_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_streaming_accounts_renewal ON public.streaming_accounts(renewal_date);
CREATE INDEX IF NOT EXISTS idx_streaming_accounts_status ON public.streaming_accounts(status);
CREATE INDEX IF NOT EXISTS idx_renewals_date ON public.renewals(renewal_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_log(user_id);

-- =====================
-- RLS (Row Level Security)
-- =====================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust for production)
CREATE POLICY "authenticated_all" ON public.clients FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.streaming_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.providers FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.gmail_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.renewals FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all" ON public.activity_log FOR ALL TO authenticated USING (true);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.streaming_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_gmail_updated_at BEFORE UPDATE ON public.gmail_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
