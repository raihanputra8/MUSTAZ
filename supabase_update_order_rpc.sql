-- ==============================================================================
-- MUSTAZ CRAFT - SECURE ORDER STATUS UPDATE RPC (SECURITY DEFINER)
-- ==============================================================================
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skrip ini mengizinkan webhook Midtrans dan sistem sinkronisasi untuk memperbarui
-- status pesanan dari PENDING_PAYMENT menjadi PAID_PROCESSING secara aman tanpa terbentur RLS.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_order_status_secure(
    p_order_id TEXT,
    p_status TEXT,
    p_payment_status TEXT DEFAULT NULL,
    p_payment_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_rows INT;
BEGIN
    UPDATE public.orders
    SET 
        status = p_status,
        payment_status = COALESCE(p_payment_status, payment_status),
        payment_type = COALESCE(p_payment_type, payment_type),
        updated_at = now()
    WHERE id = p_order_id OR id = ('MSTZ-' || p_order_id);

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', p_status,
        'rows_affected', v_updated_rows
    );
END;
$$;

-- Berikan izin akses eksekusi RPC ke anon, authenticated, dan service_role
GRANT EXECUTE ON FUNCTION public.update_order_status_secure TO anon, authenticated, service_role;
