-- ============================================================
-- MULTI-TENANT: Cada usuario ve SOLO sus propios datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar owner_id a todas las tablas
ALTER TABLE public.clients           ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.streaming_accounts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.providers          ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.gmail_accounts     ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.renewals           ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications      ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.activity_log       ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.transactions       ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Asignar datos existentes al primer usuario (el tuyo)
-- Reemplaza 'TU_USER_ID' con tu UUID de auth.users
-- Para obtenerlo: SELECT id FROM auth.users LIMIT 1;
-- UPDATE public.clients            SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.streaming_accounts SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.providers           SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.gmail_accounts      SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.renewals            SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.notifications       SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.activity_log        SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;
-- UPDATE public.transactions        SET owner_id = 'TU_USER_ID' WHERE owner_id IS NULL;

-- O más fácil, asignar a todos automáticamente al primer usuario:
DO $$
DECLARE first_user UUID;
BEGIN
  SELECT id INTO first_user FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF first_user IS NOT NULL THEN
    UPDATE public.clients            SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.streaming_accounts SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.providers          SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.gmail_accounts     SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.renewals           SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.notifications      SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.activity_log       SET owner_id = first_user WHERE owner_id IS NULL;
    UPDATE public.transactions       SET owner_id = first_user WHERE owner_id IS NULL;
  END IF;
END $$;

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_owner            ON public.clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_streaming_accounts_owner ON public.streaming_accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_providers_owner          ON public.providers(owner_id);
CREATE INDEX IF NOT EXISTS idx_gmail_owner              ON public.gmail_accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_owner       ON public.transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_activity_owner           ON public.activity_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_owner      ON public.notifications(owner_id);

-- 4. Eliminar políticas anteriores (permisivas para todos)
DROP POLICY IF EXISTS "authenticated_all" ON public.clients;
DROP POLICY IF EXISTS "authenticated_all" ON public.streaming_accounts;
DROP POLICY IF EXISTS "authenticated_all" ON public.providers;
DROP POLICY IF EXISTS "authenticated_all" ON public.gmail_accounts;
DROP POLICY IF EXISTS "authenticated_all" ON public.renewals;
DROP POLICY IF EXISTS "authenticated_all" ON public.notifications;
DROP POLICY IF EXISTS "authenticated_all" ON public.activity_log;
DROP POLICY IF EXISTS "authenticated_all" ON public.transactions;

-- 5. Nuevas políticas RLS — cada usuario solo ve sus datos
CREATE POLICY "own_data" ON public.clients
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.streaming_accounts
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.providers
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.gmail_accounts
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.renewals
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.notifications
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.activity_log
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "own_data" ON public.transactions
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
