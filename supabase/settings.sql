-- ============================================================
-- CONFIGURACIÓN POR USUARIO (multi-tenant)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Negocio
  business_name VARCHAR(255) DEFAULT 'Soul Streaming',
  -- WhatsApp
  whatsapp_number VARCHAR(20) DEFAULT '',
  -- Banco / pago
  bank_name VARCHAR(100) DEFAULT 'Arcus',
  bank_clabe VARCHAR(30) DEFAULT '',
  -- Mensajes personalizables
  msg_renewal TEXT DEFAULT 'Hola {nombre}.

Te recordamos que tu servicio está próximo a vencer.

{emoji} Servicio: {servicio}
📧 Correo: {correo}

📅 Fecha de renovación: {fecha}
💰 Importe: ${precio}

🏦 Banco: {banco}
CLABE: {clabe}

Una vez realizado el pago comparte tu comprobante para registrar tu renovación.

Gracias por tu preferencia.
{negocio}',
  msg_expired TEXT DEFAULT 'Hola {nombre}.

Detectamos que tu servicio ya venció.

{emoji} Servicio: {servicio}
📧 Correo: {correo}

💰 Importe de renovación: ${precio}

🏦 Banco: {banco}
CLABE: {clabe}

Por favor comparte tu comprobante para reactivar tu servicio.

Gracias por tu preferencia.
{negocio}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_settings" ON public.settings
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_settings_owner ON public.settings(owner_id);

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
