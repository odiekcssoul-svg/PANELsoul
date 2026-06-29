-- ============================================================
-- CORRECCIÓN COMPLETA — Centro de Canje
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Eliminar TODAS las políticas existentes de gift_*
DROP POLICY IF EXISTS "own_gift_codes"            ON public.gift_codes;
DROP POLICY IF EXISTS "own_gift_inventory"        ON public.gift_inventory;
DROP POLICY IF EXISTS "own_gift_clients"          ON public.gift_clients;
DROP POLICY IF EXISTS "own_gift_redemptions"      ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_read_codes"         ON public.gift_codes;
DROP POLICY IF EXISTS "public_insert_clients"     ON public.gift_clients;
DROP POLICY IF EXISTS "public_insert_redemptions" ON public.gift_redemptions;
DROP POLICY IF EXISTS "public_read_inventory"     ON public.gift_inventory;
DROP POLICY IF EXISTS "public_update_inventory"   ON public.gift_inventory;
DROP POLICY IF EXISTS "anon_read_active_codes"    ON public.gift_codes;
DROP POLICY IF EXISTS "anon_insert_clients"       ON public.gift_clients;
DROP POLICY IF EXISTS "anon_read_clients"         ON public.gift_clients;
DROP POLICY IF EXISTS "anon_update_clients"       ON public.gift_clients;
DROP POLICY IF EXISTS "anon_read_inventory"       ON public.gift_inventory;
DROP POLICY IF EXISTS "anon_update_inventory"     ON public.gift_inventory;
DROP POLICY IF EXISTS "anon_insert_redemptions"   ON public.gift_redemptions;
DROP POLICY IF EXISTS "anon_update_codes"         ON public.gift_codes;

-- 2. Hacer owner_id nullable en gift_clients y gift_redemptions
ALTER TABLE public.gift_clients     ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.gift_redemptions ALTER COLUMN owner_id DROP NOT NULL;

-- 3. Nuevas políticas — admin ve solo sus datos, público puede insertar/leer lo necesario

-- gift_codes: admin CRUD propio, público lee activos
CREATE POLICY "admin_gift_codes" ON public.gift_codes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "public_read_codes" ON public.gift_codes
  FOR SELECT TO anon
  USING (status = 'active');

-- gift_inventory: admin CRUD propio, público lee disponibles y puede actualizar
CREATE POLICY "admin_gift_inventory" ON public.gift_inventory
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "public_read_inventory" ON public.gift_inventory
  FOR SELECT TO anon
  USING (status = 'available');

CREATE POLICY "public_update_inventory" ON public.gift_inventory
  FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- gift_clients: admin ve los suyos, público puede insertar y leer
CREATE POLICY "admin_gift_clients" ON public.gift_clients
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (true);

CREATE POLICY "public_insert_clients" ON public.gift_clients
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "public_read_clients" ON public.gift_clients
  FOR SELECT TO anon USING (true);

CREATE POLICY "public_update_clients" ON public.gift_clients
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- gift_redemptions: admin ve las suyas, público puede insertar
CREATE POLICY "admin_gift_redemptions" ON public.gift_redemptions
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (true);

CREATE POLICY "public_insert_redemptions" ON public.gift_redemptions
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Permitir update del contador en gift_codes desde anon
CREATE POLICY "public_update_code_counter" ON public.gift_codes
  FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- 5. Activar Realtime para las tablas del Centro de Canje
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_codes;
