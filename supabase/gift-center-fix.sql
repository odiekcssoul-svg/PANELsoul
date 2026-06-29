-- ============================================================
-- CORRECCIÓN POLÍTICAS RLS — Centro de Canje v3
-- Ejecutar en Supabase SQL Editor — LÍNEA POR LÍNEA si es necesario
-- ============================================================

-- ── 1. Eliminar políticas anteriores (ignorar errores si no existen) ─────────

DROP POLICY IF EXISTS "own_gift_codes"              ON public.gift_codes;
DROP POLICY IF EXISTS "own_gift_inventory"          ON public.gift_inventory;
DROP POLICY IF EXISTS "own_gift_clients"            ON public.gift_clients;
DROP POLICY IF EXISTS "own_gift_redemptions"        ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_read_codes"           ON public.gift_codes;
DROP POLICY IF EXISTS "public_insert_clients"       ON public.gift_clients;
DROP POLICY IF EXISTS "public_insert_redemptions"   ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_read_inventory"       ON public.gift_inventory;
DROP POLICY IF EXISTS "public_update_inventory"     ON public.gift_inventory;
DROP POLICY IF EXISTS "anon_read_active_codes"      ON public.gift_codes;
DROP POLICY IF EXISTS "anon_insert_clients"         ON public.gift_clients;
DROP POLICY IF EXISTS "anon_read_clients"           ON public.gift_clients;
DROP POLICY IF EXISTS "anon_update_clients"         ON public.gift_clients;
DROP POLICY IF EXISTS "anon_read_inventory"         ON public.gift_inventory;
DROP POLICY IF EXISTS "anon_update_inventory"       ON public.gift_inventory;
DROP POLICY IF EXISTS "anon_insert_redemptions"     ON public.gift_redemptions;
DROP POLICY IF EXISTS "anon_update_codes"           ON public.gift_codes;
DROP POLICY IF EXISTS "admin_gift_codes"            ON public.gift_codes;
DROP POLICY IF EXISTS "admin_gift_inventory"        ON public.gift_inventory;
DROP POLICY IF EXISTS "admin_gift_clients"          ON public.gift_clients;
DROP POLICY IF EXISTS "admin_gift_redemptions"      ON public.gift_redemptions;
DROP POLICY IF EXISTS "admin_codes_all"             ON public.gift_codes;
DROP POLICY IF EXISTS "admin_inventory_all"         ON public.gift_inventory;
DROP POLICY IF EXISTS "admin_clients_all"           ON public.gift_clients;
DROP POLICY IF EXISTS "admin_redemptions_all"       ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_read_active_codes"    ON public.gift_codes;
DROP POLICY IF EXISTS "public_update_codes"         ON public.gift_codes;
DROP POLICY IF EXISTS "public_select_clients"       ON public.gift_clients;
DROP POLICY IF EXISTS "public_update_clients"       ON public.gift_clients;
DROP POLICY IF EXISTS "public_insert_clients"       ON public.gift_clients;
DROP POLICY IF EXISTS "public_select_redemptions"   ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_update_code_counter"  ON public.gift_codes;

-- ── 2. Hacer owner_id nullable ───────────────────────────────────────────────

ALTER TABLE public.gift_clients     ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.gift_redemptions ALTER COLUMN owner_id DROP NOT NULL;

-- ── 3. gift_codes ────────────────────────────────────────────────────────────

CREATE POLICY "admin_codes_all" ON public.gift_codes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "public_read_active_codes" ON public.gift_codes
  FOR SELECT TO anon
  USING (status = 'active');

CREATE POLICY "public_update_codes" ON public.gift_codes
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── 4. gift_inventory ────────────────────────────────────────────────────────

CREATE POLICY "admin_inventory_all" ON public.gift_inventory
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "public_read_inventory" ON public.gift_inventory
  FOR SELECT TO anon
  USING (status = 'available');

CREATE POLICY "public_update_inventory" ON public.gift_inventory
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── 5. gift_clients ──────────────────────────────────────────────────────────

CREATE POLICY "admin_clients_all" ON public.gift_clients
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (true);

CREATE POLICY "public_insert_clients" ON public.gift_clients
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_select_clients" ON public.gift_clients
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "public_update_clients" ON public.gift_clients
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ── 6. gift_redemptions ──────────────────────────────────────────────────────

CREATE POLICY "admin_redemptions_all" ON public.gift_redemptions
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (true);

CREATE POLICY "public_insert_redemptions" ON public.gift_redemptions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_select_redemptions" ON public.gift_redemptions
  FOR SELECT TO anon
  USING (true);

-- ── 7. Activar Realtime ──────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_codes;
