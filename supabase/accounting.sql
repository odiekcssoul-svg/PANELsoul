-- =====================
-- CONTABILIDAD
-- =====================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(50) NOT NULL,
  -- income categories: 'renewal', 'new_account', 'other_income'
  -- expense categories: 'provider', 'tools', 'services', 'other_expense'
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- referencias opcionales
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  streaming_account_id UUID REFERENCES public.streaming_accounts(id) ON DELETE SET NULL,
  service_type VARCHAR(50),
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) DEFAULT 'efectivo',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions(client_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all" ON public.transactions FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
