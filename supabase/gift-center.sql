-- ============================================================
-- CENTRO DE CANJE — Gift Center v2 (limpio)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Códigos promocionales ─────────────────────────────────────────────────────
CREATE TABLE public.gift_codes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  code             VARCHAR(100) NOT NULL UNIQUE,
  product          VARCHAR(255) NOT NULL,
  description      TEXT,
  start_date       DATE DEFAULT CURRENT_DATE,
  expiry_date      DATE,
  max_redemptions  INTEGER DEFAULT 0,
  max_per_user     INTEGER DEFAULT 1,
  redemption_count INTEGER DEFAULT 0,
  status           VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Inventario ────────────────────────────────────────────────────────────────
CREATE TABLE public.gift_inventory (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_code_id UUID REFERENCES public.gift_codes(id) ON DELETE SET NULL,
  product      VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  password     VARCHAR(255) NOT NULL,
  pin          VARCHAR(50),
  status       VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','delivered','suspended')),
  delivered_to UUID,
  delivered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Clientes ──────────────────────────────────────────────────────────────────
CREATE TABLE public.gift_clients (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  NOT NULL,
  email      VARCHAR(255),
  ip_address VARCHAR(50),
  country    VARCHAR(100),
  city       VARCHAR(100),
  device     VARCHAR(100),
  browser    VARCHAR(100),
  os         VARCHAR(100),
  tags       TEXT[] DEFAULT '{}',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Historial de canjes ───────────────────────────────────────────────────────
CREATE TABLE public.gift_redemptions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id        UUID REFERENCES public.gift_clients(id) ON DELETE SET NULL,
  gift_code_id     UUID REFERENCES public.gift_codes(id) ON DELETE SET NULL,
  inventory_id     UUID REFERENCES public.gift_inventory(id) ON DELETE SET NULL,
  code_used        VARCHAR(100),
  product          VARCHAR(255),
  account_email    VARCHAR(255),
  account_password VARCHAR(255),
  account_pin      VARCHAR(50),
  browser          VARCHAR(100),
  device           VARCHAR(100),
  status           VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed','failed','pending')),
  redeemed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_gift_codes_owner    ON public.gift_codes(owner_id);
CREATE INDEX idx_gift_codes_code     ON public.gift_codes(code);
CREATE INDEX idx_gift_inv_owner      ON public.gift_inventory(owner_id);
CREATE INDEX idx_gift_inv_status     ON public.gift_inventory(status);
CREATE INDEX idx_gift_clients_owner  ON public.gift_clients(owner_id);
CREATE INDEX idx_gift_clients_phone  ON public.gift_clients(phone);
CREATE INDEX idx_gift_redeem_owner   ON public.gift_redemptions(owner_id);
CREATE INDEX idx_gift_redeem_client  ON public.gift_redemptions(client_id);

-- ── RLS — Solo admin ve sus datos, sin RLS para clients y redemptions ─────────
ALTER TABLE public.gift_codes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_inventory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_clients      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_redemptions  DISABLE ROW LEVEL SECURITY;

-- gift_codes: admin CRUD + anon puede leer activos
CREATE POLICY "admin_codes" ON public.gift_codes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "anon_read_codes" ON public.gift_codes
  FOR SELECT TO anon USING (status = 'active');

-- gift_inventory: admin CRUD + anon puede leer disponibles
CREATE POLICY "admin_inventory" ON public.gift_inventory
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "anon_read_inventory" ON public.gift_inventory
  FOR SELECT TO anon USING (status = 'available');

-- ── Trigger updated_at ────────────────────────────────────────────────────────
CREATE TRIGGER update_gift_codes_updated_at
  BEFORE UPDATE ON public.gift_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
