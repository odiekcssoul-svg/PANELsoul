-- ============================================================
-- FUNCIÓN RPC — redeem_gift_code v3 (columnas correctas)
-- ============================================================

DROP FUNCTION IF EXISTS public.redeem_gift_code(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT);

CREATE OR REPLACE FUNCTION public.redeem_gift_code(
  p_code         TEXT,
  p_client_name  TEXT,
  p_client_phone TEXT,
  p_client_email TEXT DEFAULT NULL,
  p_browser      TEXT DEFAULT NULL,
  p_os           TEXT DEFAULT NULL,
  p_device       TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code      gift_codes%ROWTYPE;
  v_inventory gift_inventory%ROWTYPE;
  v_client_id UUID;
  v_now       TIMESTAMPTZ := NOW();
BEGIN

  -- 1. Buscar código activo
  SELECT * INTO v_code
  FROM gift_codes
  WHERE code = UPPER(TRIM(p_code)) AND status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Código inválido o inactivo.');
  END IF;

  -- 2. Expiración
  IF v_code.expiry_date IS NOT NULL AND v_code.expiry_date < CURRENT_DATE THEN
    RETURN json_build_object('success', false, 'error', 'Este código ha expirado.');
  END IF;

  -- 3. Límite total
  IF v_code.max_redemptions > 0 AND v_code.redemption_count >= v_code.max_redemptions THEN
    RETURN json_build_object('success', false, 'error', 'Este código ya alcanzó el límite de canjes.');
  END IF;

  -- 4. Inventario disponible
  SELECT * INTO v_inventory
  FROM gift_inventory
  WHERE owner_id = v_code.owner_id AND status = 'available'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No hay cuentas disponibles. Contacta a soporte.');
  END IF;

  -- 5. Crear o actualizar cliente
  SELECT id INTO v_client_id
  FROM gift_clients
  WHERE phone = p_client_phone LIMIT 1;

  IF v_client_id IS NULL THEN
    INSERT INTO gift_clients
      (owner_id, name, phone, email, browser, os, device, tags, last_seen)
    VALUES
      (v_code.owner_id, p_client_name, p_client_phone, p_client_email,
       p_browser, p_os, p_device, '{}', v_now)
    RETURNING id INTO v_client_id;
  ELSE
    UPDATE gift_clients SET
      owner_id  = COALESCE(owner_id, v_code.owner_id),
      last_seen = v_now,
      browser   = COALESCE(p_browser, browser),
      os        = COALESCE(p_os, os),
      device    = COALESCE(p_device, device)
    WHERE id = v_client_id;
  END IF;

  -- 6. Marcar inventario como entregado
  UPDATE gift_inventory SET
    status       = 'delivered',
    delivered_to = v_client_id,
    delivered_at = v_now
  WHERE id = v_inventory.id;

  -- 7. Registrar canje (sin columna os — no existe en gift_redemptions)
  INSERT INTO gift_redemptions
    (owner_id, client_id, gift_code_id, inventory_id,
     code_used, product, account_email, account_password, account_pin,
     browser, device, status, redeemed_at)
  VALUES
    (v_code.owner_id, v_client_id, v_code.id, v_inventory.id,
     UPPER(TRIM(p_code)), v_inventory.product,
     v_inventory.email, v_inventory.password, v_inventory.pin,
     p_browser, p_device, 'completed', v_now);

  -- 8. Incrementar contador
  UPDATE gift_codes
  SET redemption_count = redemption_count + 1
  WHERE id = v_code.id;

  RETURN json_build_object(
    'success',     true,
    'product',     v_inventory.product,
    'email',       v_inventory.email,
    'password',    v_inventory.password,
    'pin',         v_inventory.pin,
    'redeemed_at', v_now
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Error interno: ' || SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_gift_code TO anon;
GRANT EXECUTE ON FUNCTION public.redeem_gift_code TO authenticated;
