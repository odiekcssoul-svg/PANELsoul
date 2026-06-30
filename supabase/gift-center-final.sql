-- ============================================================
-- SOLUCIÓN DEFINITIVA — Centro de Canje
-- Deshabilitar RLS en gift_clients y gift_redemptions
-- La seguridad se maneja via RPC SECURITY DEFINER
-- ============================================================

-- Deshabilitar RLS (la seguridad la maneja la función RPC)
ALTER TABLE public.gift_clients     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_redemptions DISABLE ROW LEVEL SECURITY;

-- gift_codes e inventory siguen con RLS para proteger datos del admin
-- pero permitir lectura pública para el proceso de canje
ALTER TABLE public.gift_codes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_inventory ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas conflictivas de gift_codes
DROP POLICY IF EXISTS "admin_codes_all"          ON public.gift_codes;
DROP POLICY IF EXISTS "public_read_active_codes" ON public.gift_codes;
DROP POLICY IF EXISTS "public_update_codes"      ON public.gift_codes;
DROP POLICY IF EXISTS "own_gift_codes"           ON public.gift_codes;

-- Nuevas políticas gift_codes
CREATE POLICY "admin_codes" ON public.gift_codes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "anon_read_codes" ON public.gift_codes
  FOR SELECT TO anon
  USING (status = 'active');

-- Eliminar políticas conflictivas de gift_inventory  
DROP POLICY IF EXISTS "admin_inventory_all"   ON public.gift_inventory;
DROP POLICY IF EXISTS "public_read_inventory" ON public.gift_inventory;
DROP POLICY IF EXISTS "public_update_inventory" ON public.gift_inventory;
DROP POLICY IF EXISTS "own_gift_inventory"    ON public.gift_inventory;

-- Nuevas políticas gift_inventory
CREATE POLICY "admin_inventory" ON public.gift_inventory
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "anon_read_inventory" ON public.gift_inventory
  FOR SELECT TO anon
  USING (status = 'available');

-- Asegurarse que owner_id puede ser null
ALTER TABLE public.gift_clients     ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.gift_redemptions ALTER COLUMN owner_id DROP NOT NULL;
