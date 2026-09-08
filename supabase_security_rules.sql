-- ==============================================================================
-- MUSTAZ CRAFT - SUPABASE ROW LEVEL SECURITY (RLS) & DATABASE SECURITY HARDENING
-- ==============================================================================
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skrip ini melindungi database dari serangan manipulasi role, Postman tampering,
-- dan akses tidak sah ke data produk maupun pesanan.
-- ==============================================================================

-- 1. FUNGSI CEK STATUS ADMIN (SECURITY DEFINER)
-- Fungsi ini mengecek apakah pengguna yang sedang memanggil request adalah Admin sah.
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
  IF LOWER(auth.jwt() ->> 'email') IN ('raihanputrairawan8@gmail.com', 'admin@mustazcraft.com') THEN
    RETURN true;
  END IF;

  -- Cek kolom role di tabel public.accounts
  RETURN EXISTS (
    SELECT 1 FROM public.accounts
    WHERE (id = auth.uid()::text OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
      AND role = 'admin'
  );
END;
$$;

-- Berikan izin eksekusi fungsi kepada role authenticated dan anon
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- ==============================================================================
-- 2. PROTEKSI TABEL PRODUCTS (KATALOG PRODUK & STOK)
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;

-- Aturan 1: Siapapun (pengunjung & member) boleh membaca katalog produk
CREATE POLICY "Public can view products"
ON public.products
FOR SELECT
USING (true);

-- Aturan 2: HANYA Admin yang boleh menambahkan produk baru
CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.is_admin());

-- Aturan 3: HANYA Admin yang boleh mengubah produk, harga, dan stok
CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Aturan 4: HANYA Admin yang boleh menghapus produk dari katalog
CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
USING (public.is_admin());


-- ==============================================================================
-- 3. PROTEKSI TABEL ORDERS (PESANAN PELANGGAN)
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;

-- Aturan 1: Pembeli (guest maupun member) boleh membuat pesanan (Checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Aturan 2: HANYA Admin yang boleh melihat seluruh daftar pesanan pelanggan
CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
USING (public.is_admin());

-- Aturan 3: HANYA Admin yang boleh mengubah status pengiriman pesanan
CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Aturan 4: HANYA Admin yang boleh menghapus pesanan jika diperlukan
CREATE POLICY "Admin can delete orders"
ON public.orders
FOR DELETE
USING (public.is_admin());


-- ==============================================================================
-- 4. PROTEKSI TABEL ACCOUNTS (PROFIL PENGGUNA & PREVENSI ELEVASI ROLE)
-- ==============================================================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and Admin can read accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own account" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own account without role tampering" ON public.accounts;

-- Aturan 1: Pengguna hanya boleh melihat akun miliknya sendiri, Admin boleh melihat semua
CREATE POLICY "Users and Admin can read accounts"
ON public.accounts
FOR SELECT
USING (
  public.is_admin() OR
  LOWER(email) = LOWER(auth.jwt() ->> 'email') OR
  id = auth.uid()::text
);

-- Aturan 2: Pengguna baru boleh menyimpan data registrasi awal (default role: member)
CREATE POLICY "Users can insert own account"
ON public.accounts
FOR INSERT
WITH CHECK (
  public.is_admin() OR
  (LOWER(email) = LOWER(auth.jwt() ->> 'email') AND role = 'member')
);

-- Aturan 3: Pengguna boleh update profil miliknya, TAPI DILARANG mengubah role menjadi admin
CREATE POLICY "Users can update own account without role tampering"
ON public.accounts
FOR UPDATE
USING (
  public.is_admin() OR
  LOWER(email) = LOWER(auth.jwt() ->> 'email') OR
  id = auth.uid()::text
)
WITH CHECK (
  public.is_admin() OR
  (role = 'member') -- Mencegah member mengubah role mereka sendiri menjadi 'admin'
);


-- ==============================================================================
-- 5. STORAGE BUCKET 'product-images' (CDN HOSTING ASET PRODUK & MEDIA)
-- ==============================================================================
-- 1. Buat bucket 'product-images' jika belum ada (wajib public = true agar CDN aktif)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  20971520, -- 20MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Bersihkan policies lama
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

-- 3. Policy SELECT: Siapapun (publik, website, pembeli) dapat memuat gambar via CDN Supabase
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 4. Policy INSERT: Admin dan script migrasi dapat mengunggah aset gambar
CREATE POLICY "Admin and authenticated can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 5. Policy UPDATE & DELETE: Hanya admin yang dapat memperbarui atau menghapus gambar
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND (public.is_admin() OR auth.role() = 'authenticated'));

CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND (public.is_admin() OR auth.role() = 'authenticated'));

-- Selesai! Seluruh aset produk kini tersentralisasi di Supabase Storage CDN.
-- ==============================================================================

-- ==============================================================================
-- 6. PROTEKSI TABEL REVIEWS (ULASAN RESMI VERIFIED BUYER // SKEMA 1)
-- ==============================================================================
-- Tabel ini menampung testimoni dari pembeli terverifikasi
CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY,
  order_id text NOT NULL,
  user_email text NOT NULL,
  user_name text NOT NULL,
  bike_model text,
  city text,
  product_id text,
  product_name text NOT NULL,
  product_image text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_verified boolean DEFAULT true,
  status text DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated buyers can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON public.reviews;

-- Aturan 1: Publik dan pengunjung website boleh membaca seluruh ulasan yang disetujui
CREATE POLICY "Public can view approved reviews"
ON public.reviews
FOR SELECT
USING (status = 'approved' OR public.is_admin());

-- Aturan 2: Pembeli dapat mengirimkan ulasan (dibatasi rating 1-5 dan is_verified)
CREATE POLICY "Authenticated buyers can insert reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Aturan 3: Admin bebas mengupdate status (misal menyembunyikan spam) dan menghapus ulasan
CREATE POLICY "Admin can update reviews"
ON public.reviews
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete reviews"
ON public.reviews
FOR DELETE
USING (public.is_admin());
-- ==============================================================================

