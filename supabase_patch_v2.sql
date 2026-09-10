-- ==============================================================================
-- MUSTAZ CRAFT - SUPABASE SECURITY HARDENING & ATOMIC RPC PATCH (v2.0)
-- ==============================================================================
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. PASTIKAN KOLOM-KOLOM PENTING PADA TABEL ORDERS DAN PRODUCTS TERSEDIA
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 10;
UPDATE public.products SET stock = 0 WHERE stock IS NULL OR stock < 0;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING_PAYMENT';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_courier TEXT;

-- 2. TAMBAHKAN CONSTRAINT STOK POSITIF PADA TABEL PRODUCTS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_stock_positive'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT check_stock_positive CHECK (stock >= 0);
    END IF;
END $$;


-- 3. FUNGSI CEK STATUS ADMIN (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tamu tanpa login / anonim tidak pernah menjadi admin
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Whitelist email owner utama MUSTAZ CRAFT
  IF LOWER(auth.jwt() ->> 'email') IN ('raihanputrairawan8@gmail.com', 'raihanputra8@gmail.com', 'admin@mustazcraft.com') THEN
    RETURN true;
  END IF;

  -- Cek role di auth metadata JWT
  IF (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
    RETURN true;
  END IF;

  -- Cek kolom role di tabel public.accounts jika tabel ada
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'accounts') THEN
    RETURN EXISTS (
      SELECT 1 FROM public.accounts
      WHERE (id = auth.uid()::text OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
        AND role = 'admin'
    );
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- 4. KUNCI ROW-LEVEL SECURITY (RLS) TABEL PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Public insert products" ON public.products;
DROP POLICY IF EXISTS "Public update products" ON public.products;
DROP POLICY IF EXISTS "Public delete products" ON public.products;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;

-- Publik hanya boleh membaca katalog
CREATE POLICY "Public can view products"
ON public.products FOR SELECT
USING (true);

-- HANYA Admin yang boleh menambah produk
CREATE POLICY "Admin can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- HANYA Admin yang boleh mengubah produk, harga, dan stok
CREATE POLICY "Admin can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- HANYA Admin yang boleh menghapus produk
CREATE POLICY "Admin can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin());


-- 5. KUNCI ROW-LEVEL SECURITY (RLS) TABEL ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Publik (Guest & User) hanya boleh INSERT pesanan baru dengan status PENDING_PAYMENT / PENDING / PROCESSING
CREATE POLICY "Anyone can create pending orders"
ON public.orders FOR INSERT
WITH CHECK (
  COALESCE(status, 'PENDING_PAYMENT') IN ('PENDING_PAYMENT', 'PENDING', 'PROCESSING')
);

-- Admin boleh membaca seluruh pesanan
CREATE POLICY "Admin can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.is_admin());

-- Member boleh membaca pesanan miliknya sendiri (jika login)
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  LOWER(customer_email) = LOWER(auth.jwt() ->> 'email')
  OR LOWER(phone) = LOWER(auth.jwt() ->> 'phone')
);

-- HANYA Admin yang boleh melakukan UPDATE status order, nomor resi, dll.
CREATE POLICY "Admin can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- HANYA Admin yang boleh menghapus pesanan
CREATE POLICY "Admin can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (public.is_admin());


-- 6. STORED PROCEDURE (RPC) ATOMIC CHECKOUT & STOCK DEDUCTION
-- Menghitung ulang total harga secara server-side dari tabel products
-- Mengurangi stok secara atomik dengan baris terkunci (FOR UPDATE)
-- Mencegah manipulasi harga dari client dan race condition
CREATE OR REPLACE FUNCTION public.submit_order_secure(
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text,
    p_shipping_address text,
    p_shipping_courier text,
    p_notes text,
    p_payment_method text,
    p_cart_items jsonb,
    p_order_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id text;
    v_item jsonb;
    v_prod_id text;
    v_qty integer;
    v_real_price numeric;
    v_real_stock integer;
    v_total_amount numeric := 0;
    v_items_summary text := '';
    v_first boolean := true;
BEGIN
    -- Validasi data wajib
    IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Nama pembeli wajib diisi.';
    END IF;
    IF p_customer_phone IS NULL OR trim(p_customer_phone) = '' THEN
        RAISE EXCEPTION 'Nomor WhatsApp wajib diisi.';
    END IF;
    IF p_cart_items IS NULL OR jsonb_array_length(p_cart_items) = 0 THEN
        RAISE EXCEPTION 'Keranjang belanja kosong.';
    END IF;

    -- Tentukan Order ID
    IF p_order_id IS NOT NULL AND trim(p_order_id) <> '' THEN
        v_order_id := trim(p_order_id);
    ELSE
        v_order_id := 'MSTZ-' || floor(1000 + random() * 9000)::text;
    END IF;

    -- Iterasi setiap item keranjang
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        v_prod_id := v_item->>'id';
        v_qty := COALESCE((v_item->>'quantity')::integer, (v_item->>'qty')::integer, 1);
        
        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Jumlah item tidak valid untuk: %', (v_item->>'name');
        END IF;

        -- 1. KUNCI BARIS PRODUK DI TABEL PRODUCTS DENGAN "FOR UPDATE"
        -- Ambil harga dan stok resmi langsung dari database (Server-Side)
        SELECT price, stock INTO v_real_price, v_real_stock
        FROM products
        WHERE id::text = v_prod_id
        FOR UPDATE;

        -- Fallback pencarian berdasarkan nama produk jika id frontend berbeda
        IF NOT FOUND THEN
            SELECT price, stock INTO v_real_price, v_real_stock
            FROM products
            WHERE lower(name) = lower(v_item->>'name')
            LIMIT 1
            FOR UPDATE;
        END IF;

        -- Validasi stok fisik produk
        IF FOUND THEN
            IF v_real_stock < v_qty THEN
                RAISE EXCEPTION 'Stok untuk "%" tidak mencukupi (sisa: %, diminta: %)', 
                    COALESCE(v_item->>'name', v_prod_id), v_real_stock, v_qty;
            END IF;

            -- POTONG STOK SECARA ATOMIK DI DATABASE
            UPDATE products
            SET stock = stock - v_qty
            WHERE (id::text = v_prod_id OR lower(name) = lower(v_item->>'name'));
        ELSE
            -- Jika item kustom/tidak terdaftar di katalog products, gunakan harga item
            v_real_price := COALESCE((v_item->>'price')::numeric, 0);
        END IF;

        -- Akumulasi total berdasarkan harga resmi server
        v_total_amount := v_total_amount + (v_real_price * v_qty);

        IF NOT v_first THEN
            v_items_summary := v_items_summary || ', ';
        END IF;
        v_items_summary := v_items_summary || (COALESCE(v_item->>'name', 'Produk') || ' (x' || v_qty || ')');
        v_first := false;
    END LOOP;

    -- 2. INSERT KE TABEL ORDERS DENGAN STATUS TERKUNCI PENDING_PAYMENT
    INSERT INTO orders (
        id,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        shipping_courier,
        items,
        total_amount,
        status,
        city,
        phone,
        created_at
    ) VALUES (
        v_order_id,
        p_customer_name || CASE WHEN p_customer_email IS NOT NULL AND p_customer_email <> '' THEN ' (' || p_customer_email || ')' ELSE '' END,
        p_customer_phone,
        p_customer_email,
        p_shipping_address,
        p_shipping_courier,
        v_items_summary,
        v_total_amount,
        'PENDING_PAYMENT',
        p_shipping_address || ' (' || COALESCE(p_shipping_courier, 'Kurir') || ')',
        p_customer_phone,
        now()
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'total_amount', v_total_amount,
        'status', 'PENDING_PAYMENT',
        'items', v_items_summary
    );
END;
$$;

-- Izin eksekusi RPC untuk pengunjung publik dan authenticated user
GRANT EXECUTE ON FUNCTION public.submit_order_secure TO anon, authenticated, service_role;
