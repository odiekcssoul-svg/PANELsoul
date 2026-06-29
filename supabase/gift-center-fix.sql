-- ============================================================
-- CORRECCIÓN DE POLÍTICAS RLS para Centro de Canje
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Eliminar políticas anteriores que pueden estar bloqueando
DROP POLICY IF EXISTS "public_read_codes"       ON public.gift_codes;
DROP POLICY IF EXISTS "public_insert_clients"   ON public.gift_clients;
DROP POLICY IF EXISTS "public_insert_redemptions" ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_read_inventory"   ON public.gift_inventory;
DROP POLICY IF EXISTS "public_update_inventory" ON public.gift_inventory;

-- ── gift_codes: anon puede leer códigos activos ──────────────────────────────
CREATE POLICY "anon_read_active_codes" ON public.gift_codes
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- ── gift_clients: anon puede insertar (registro público) ─────────────────────
CREATE POLICY "anon_insert_clients" ON public.gift_clients
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ── gift_clients: anon puede leer por teléfono (para verificar duplicados) ───
CREATE POLICY "anon_read_clients" ON public.gift_clients
  FOR SELECT TO anon, authenticated
  USING (true);

-- ── gift_clients: anon puede actualizar last_seen ─────────────────────────────
CREATE POLICY "anon_update_clients" ON public.gift_clients
  FOR UPDATE TO anon, authenticated
  USING (true);

-- ── gift_inventory: anon puede leer disponibles ──────────────────────────────
CREATE POLICY "anon_read_inventory" ON public.gift_inventory
  FOR SELECT TO anon, authenticated
  USING (status = 'available');

-- ── gift_inventory: anon puede marcar como entregado ────────────────────────
CREATE POLICY "anon_update_inventory" ON public.gift_inventory
  FOR UPDATE TO anon, authenticated
  USING (status = 'available')
  WITH CHECK (true);

-- ── gift_redemptions: anon puede insertar ────────────────────────────────────
CREATE POLICY "anon_insert_redemptions" ON public.gift_redemptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ── gift_codes: anon puede actualizar contador ───────────────────────────────
CREATE POLICY "anon_update_codes" ON public.gift_codes
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
