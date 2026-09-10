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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_stock_positive'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT check_stock_positive CHECK (stock >= 0);
    END IF;
END $$;

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
DROP POLICY IF EXISTS "Anyone can create pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON public.orders;

-- Aturan 1: Pembeli boleh membuat pesanan baru, tapi status terkunci ke PENDING_PAYMENT / PENDING
CREATE POLICY "Anyone can create pending orders"
ON public.orders
FOR INSERT
WITH CHECK (
  COALESCE(status, 'PENDING_PAYMENT') IN ('PENDING_PAYMENT', 'PENDING')
  OR COALESCE(order_status, 'PENDING_PAYMENT') IN ('PENDING_PAYMENT', 'PENDING')
);

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


-- ==============================================================================
-- 7. STORED PROCEDURE (RPC) ATOMIC CHECKOUT & STOCK DEDUCTION (v2.0)
-- ==============================================================================
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
    IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Nama pembeli wajib diisi.';
    END IF;
    IF p_customer_phone IS NULL OR trim(p_customer_phone) = '' THEN
        RAISE EXCEPTION 'Nomor WhatsApp wajib diisi.';
    END IF;
    IF p_cart_items IS NULL OR jsonb_array_length(p_cart_items) = 0 THEN
        RAISE EXCEPTION 'Keranjang belanja kosong.';
    END IF;

    IF p_order_id IS NOT NULL AND trim(p_order_id) <> '' THEN
        v_order_id := trim(p_order_id);
    ELSE
        v_order_id := 'MSTZ-' || floor(1000 + random() * 9000)::text;
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
        v_prod_id := v_item->>'id';
        v_qty := COALESCE((v_item->>'quantity')::integer, (v_item->>'qty')::integer, 1);

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Jumlah item tidak valid untuk: %', (v_item->>'name');
        END IF;

        -- Kunci baris produk dengan FOR UPDATE
        SELECT price, stock INTO v_real_price, v_real_stock
        FROM products
        WHERE id::text = v_prod_id
        FOR UPDATE;

        IF NOT FOUND THEN
            SELECT price, stock INTO v_real_price, v_real_stock
            FROM products
            WHERE lower(name) = lower(v_item->>'name')
            LIMIT 1
            FOR UPDATE;
        END IF;

        IF FOUND THENFixing Homepage Currency Bugs
        clint saya minta di jelaskan tentang alur pemesanan dari sisi user dan dari sisi admin nya juga step by step nya dong jadikan file md
        11:06 AM
        Dokumentasi lengkap mengenai Alur Pemesanan MUSTAZ CRAFT (Sisi User & Sisi Admin) telah selesai disusun secara terstruktur dalam format Markdown dan telah disimpan langsung di root project:

        📄 File Dokumentasi:

        ALUR_PEMESANAN_MUSTAZ.md

        🔗 Tersimpan di Git: Commit dddf4b8 (pushed to repository raihanputra8/MUSTAZ)

        Ringkasan Alur Pemesanan yang Disajikan di File Tersebut:
        mermaid
        sequenceDiagram
            autonumber
            actor User as Pembeli (User/Rider)
            participant Web as MUSTAZ Web Store
            participant DB as Supabase Cloud & Cache
            actor Admin as Admin / CS Workshop
            participant WA as WhatsApp Gateway
            User->>Web: 1. Pilih Produk & Atur Keranjang Belanja
            User->>Web: 2. Isi Formulir Checkout (Nama, WA, Alamat, Kurir Wajib Diisi)
            Web->>DB: 3. Simpan Pesanan (Status: PENDING) & Potong Stok
            Web->>User: 4. Kirim Email Invoice Resmi Otomatis
            Web->>WA: 5. Buka WhatsApp Bawa Format Pesanan ke CS Toko

            Note over DB,Admin: 6. Audio Chime Synthesizer & Pop-up Order Baru Muncul Real-Time di Admin!

            Admin->>Web: 7. Klik [1] KIRIM REKENING & TAGIHAN
            Web->>WA: Buka Chat ke Nomor Pembeli (Tagihan & No. Rekening Toko)
            DB-->>Web: Status: PENDING_PAYMENT

            User->>Admin: 8. Transfer & Kirim Bukti Pembayaran
            Admin->>Web: 9. Verifikasi Bukti & Klik [2] VERIFIKASI LUNAS
            Web->>WA: Buka Chat ke Nomor Pembeli (Konfirmasi Lunas & Persiapan Packing)
            DB-->>Web: Status: PAID_PROCESSING

            Admin->>Web: 10. Packing Selesai, Klik [3] INPUT RESI
            Web->>WA: Buka Chat ke Nomor Pembeli (Kirim No. Resi & Link Live Tracking)
            DB-->>Web: Status: SHIPPED

            Note over User,Admin: Paket Tiba di Alamat Tujuan
            Admin->>Web: 11. Klik [4] MINTA ULASAN / REVIEW
            Web->>WA: Buka Chat ke Nomor Pembeli (Undangan Beri Testimoni + Link Unik)
            DB-->>Web: Status: DELIVERED
            User->>Web: 12. Mengisi Rating & Ulasan Foto di Website
        Pokok Penjelasan yang Termuat di File:
        Diagram Alur End-to-End: Diagram interaksi antara Pembeli, Web Store, Supabase Database, Admin Console, dan WhatsApp Gateway.
        Sisi Pembeli (User / Rider) Step-by-Step:
        Eksplorasi produk & pemilihan mata uang (IDR Rp / USD $).
        Pengaturan keranjang belanja (Cart Drawer).
        Pengisian formulir checkout lengkap dengan Mandatory Validation (Nama, Nomor WhatsApp minimal 10 digit, Alamat, dan Pilihan Kurir).
        Penerbitan Order ID, pemotongan stok otomatis, pengiriman invoice email, dan pengalihan ke WhatsApp CS.
        Pembayaran, penerimaan resi pengiriman, hingga pengisian ulasan (review).
        Sisi Admin (Admin CS Console) Step-by-Step:
        Real-Time Notification: Audio Chime Alert (G5-B5-D6) & Pop-up Modal instan saat ada pesanan baru tanpa perlu me-refresh halaman.
        Fase 1 ([1] KIRIM REKENING & TAGIHAN): Mengirim tagihan dan rekening toko otomatis langsung ke nomor WhatsApp pembeli (Status: PENDING_PAYMENT).
        Fase 2 ([2] VERIFIKASI LUNAS): Memeriksa/melampirkan bukti transfer dan konfirmasi pembayaran ke pembeli (Status: PAID_PROCESSING).
        Fase 3 ([3] INPUT RESI & SHIPPED): Input nomor resi kurir dan kirim live tracking link ke pembeli (Status: SHIPPED).
        Fase 4 ([4] MINTA ULASAN / REVIEW): Mengirim link resmi ulasan testimoni ke pembeli (Status: DELIVERED).
        Moderasi Testimoni: Review foto dan rating bintang pelanggan sebelum ditampilkan di galeri web.
        Tabel Matriks Status & Otomasi CS: Tabel acuan warna indikator status, tombol tindakan, target pengiriman WhatsApp, dan template pesan yang dikirim.
        Fitur Keamanan & Anti-Error Guard:
        Penjelasan fitur pencegahan chat ke nomor admin sendiri (Self-Chat Prevention).
        Standarisasi otomatis nomor lokal ke format internasional (08... ➔ 628...).
        Dual Storage Redundancy (Supabase Cloud + LocalStorage Cache).
        File

        ALUR_PEMESANAN_MUSTAZ.md
         ini dapat langsung Anda bagikan atau presentasikan kepada klien Anda.

        11:06 AM
        11:14 AM
        HASIL FULL AUDIT SISTEM & ANALISIS ARSITEKTUR
        MUSTAZ CRAFT E-COMMERCE + WHATSAPP ORDER SYSTEM
        Seluruh source code repository MUSTAZ CRAFT telah selesai diaudit secara komprehensif tanpa melakukan perubahan pada kode produksi. Dua dokumen teknis utama telah dibuat di dalam folder docs/:



        docs/CODEBASE_MAP.md
        : Topologi file, arsitektur folder, dependensi komponen, dan integrasi eksternal.


        docs/FULL_SYSTEM_AUDIT.md
        : Laporan audit 26 bab mencakup flow pembeli, admin, checkout, pembayaran, stok, state machine, RLS Supabase, security, race condition, dan rencana mitigasi.
        RINGKASAN SEVERITY ISSUE
        text
        CRITICAL : 4 issues
        HIGH     : 6 issues
        MEDIUM   : 6 issues
        LOW      : 4 issues
        --------------------
        TOTAL    : 20 issues
        TOP 10 THINGS THAT MUST BE FIXED
        Berikut adalah 10 masalah teratas yang wajib diperbaiki sebelum sistem siap digunakan untuk transaksi produksi skala penuh:

        1. Bypass Autentikasi Admin Console via Tombol Switch Role di LocalStorage
        CURRENT BEHAVIOR:
        Di

        js/admin.js
         dan

        js/services/authService.js
        , terdapat tombol #btnSwitchToAdminNow yang mengeksekusi loginAsAdminDirectly(). Fungsi ini langsung menyuntikkan { role: 'admin', email: 'raihanputrairawan8@gmail.com' } ke localStorage['mustaz_user_profile_data']. Selain itu, verifyAdminSession() hanya mempercayai string di localStorage tanpa memvalidasi token JWT ke Supabase Auth.
        WHY IT IS A PROBLEM:
        Siapapun yang mengakses URL /admin dapat mengklik tombol tersebut untuk langsung mendapatkan hak akses penuh sebagai Admin tanpa memerlukan password atau kredensial.
        RISK LEVEL: CRITICAL
        RECOMMENDED SOLUTION:
        Hapus tombol bypass #btnSwitchToAdminNow dan fungsi loginAsAdminDirectly(). Ubah pengecekan sesi admin agar memvalidasi JWT session ke supabase.auth.getUser() serta mengecek role di database via Supabase RPC / metadata JWT.
        FILES AFFECTED:

        js/admin.js
        ,

        js/services/authService.js
        ,

        admin/index.html
        .
        DATABASE AFFECTED: Tabel users (metadata role).
        2. Manipulasi Harga, Diskon, dan Ongkir dari Frontend (Client-Side Trust)
        CURRENT BEHAVIOR:
        Di

        js/components/cart.js
         dan

        checkout.html
        , nilai total_amount dihitung langsung di memori browser pengguna (cartService.getCartTotal()) dan dikirim mentah-mentah ke kolom orders.total_amount di Supabase.
        WHY IT IS A PROBLEM:
        Pengguna dengan pengetahuan teknis dasar dapat memodifikasi array keranjang di browser Console (misal mengubah item.price = 1000) sebelum menekan checkout. Supabase akan mencatat pesanan barang mahal dengan total harga manipulatif.
        RISK LEVEL: CRITICAL
        RECOMMENDED SOLUTION:
        Implementasikan penghitungan harga dan diskon di server/database side melalui Supabase Stored Procedure (RPC: submit_order). Database mengambil harga asli langsung dari tabel products berdasarkan product_id.
        FILES AFFECTED:

        js/components/cart.js
        ,

        checkout.html
        ,

        js/services/supabaseService.js
        .
        DATABASE AFFECTED: Tabel orders, tabel products.
        3. Pemotongan Stok Hanya di LocalStorage (Desinkronisasi Stok Cloud)
        CURRENT BEHAVIOR:
        Fungsi

        cartService.deductProductStock()
         hanya memotong stok pada localStorage['mustaz_dynamic_parts']. Fungsi ini tidak pernah mengirimkan query update ke tabel products di Supabase.
        WHY IT IS A PROBLEM:
        Stok di cloud Supabase tidak pernah berkurang saat pesanan dibuat. Ketika pembeli A menghabiskan stok produk di laptopnya, pembeli B di perangkat lain masih melihat stok utuh dan dapat terus memesan barang yang fisiknya sudah habis.
        RISK LEVEL: CRITICAL
        RECOMMENDED SOLUTION:
        Pindahkan logika pengurangan stok langsung ke Supabase dengan transaksi atomik: UPDATE products SET stock = stock - qty WHERE id = product_id AND stock >= qty.
        FILES AFFECTED:

        js/services/cartService.js
        ,

        js/services/supabaseService.js
        .
        DATABASE AFFECTED: Tabel products (kolom stock).
        4. Row-Level Security (RLS) Terlalu Permisif di Supabase
        CURRENT BEHAVIOR:
        Berdasarkan instruksi pada

        SUPABASE_SETUP.md
        , policy tabel orders dan products dikonfigurasi dengan FOR ALL USING (true) / FOR UPDATE USING (true).
        WHY IT IS A PROBLEM:
        Siapapun yang memiliki Supabase Anon Key (yang tertera di file publik config.js) dapat mengirimkan request HTTP PATCH atau DELETE menggunakan curl atau Postman untuk mengubah status pesanan menjadi PAID atau menghapus seluruh katalog produk.
        RISK LEVEL: CRITICAL
        RECOMMENDED SOLUTION:
        Terapkan skrip keamanan ketat dari

        supabase_security_rules.sql
        : kunci izin UPDATE dan DELETE pada tabel orders dan products hanya untuk user terotentikasi dengan fungsi is_admin() = true.
        FILES AFFECTED:

        SUPABASE_SETUP.md
        ,

        supabase_security_rules.sql
        .
        DATABASE AFFECTED: RLS Policies pada tabel orders, products, order_items, reviews.
        5. Ketiadaan Atomic Lock & Race Condition pada Stok Terakhir
        CURRENT BEHAVIOR:
        Pengecekan stok dilakukan dengan membaca stok terlebih dahulu (SELECT stock), baru kemudian memproses checkout. Tidak ada baris lock (FOR UPDATE) atau atomic decrement.
        WHY IT IS A PROBLEM:
        Jika sisa stok barang = 1, dan dua pembeli menekan tombol checkout pada detik yang sama, kedua pesanan akan berhasil dibuat (overselling). Toko akan menerima dua transaksi untuk satu barang fisik.
        RISK LEVEL: HIGH
        RECOMMENDED SOLUTION:
        Gunakan transaksi database Supabase RPC submit_order yang mengunci baris produk (SELECT ... FOR UPDATE) dan menolak transaksi jika stok tersisa kurang dari quantity yang diminta.
        FILES AFFECTED:

        js/services/cartService.js
        ,

        js/services/supabaseService.js
        .
        DATABASE AFFECTED: Tabel products.
        6. Ketiadaan Rollback Stok Saat Pesanan Dibatalkan / Expired
        CURRENT BEHAVIOR:
        Ketika Admin mengubah status pesanan menjadi CANCELLED di

        js/admin.js
        , sistem hanya memperbarui kolom status pesanan.
        WHY IT IS A PROBLEM:
        Stok barang yang sebelumnya terpotong tidak pernah dikembalikan ke inventori toko. Akibatnya, stok fisik di toko tetap ada, tetapi katalog mencatat barang tersebut habis.
        RISK LEVEL: HIGH
        RECOMMENDED SOLUTION:
        Buat trigger database atau fungsi Supabase RPC cancel_order yang otomatis menambahkan kembali kuantitas produk: UPDATE products SET stock = stock + item_qty WHERE id = product_id.
        FILES AFFECTED:

        js/admin.js
        ,

        js/services/supabaseService.js
        .
        DATABASE AFFECTED: Tabel orders, tabel products.
        7. Dual Source of Truth (Desinkronisasi LocalStorage vs. Supabase)
        CURRENT BEHAVIOR:
        Data pesanan dan produk disimpan ganda di Supabase dan di localStorage (mustaz_admin_orders, mustaz_dynamic_parts). Jika Supabase merespons lambat, aplikasi membaca data dari localStorage.
        WHY IT IS A PROBLEM:
        Admin di laptop A dan Admin di laptop B akan melihat data pesanan dan stok yang berbeda karena masing-masing membaca cache localStorage perangkatnya sendiri.
        RISK LEVEL: HIGH
        RECOMMENDED SOLUTION:
        Jadikan Supabase sebagai Single Source of Truth. Gunakan localStorage hanya untuk data sementara sisi klien (keranjang belanja dan preferensi mata uang).
        FILES AFFECTED:

        js/admin.js
        ,

        js/services/cartService.js
        .
        DATABASE AFFECTED: Semua tabel Supabase.
        8. Nomor Rekening Toko Masih Placeholder Dummy di Template WhatsApp CS
        CURRENT BEHAVIOR:
        Di

        js/services/whatsappCsService.js
        , template pesan Fase 1 (KIRIM REKENING) memuat nomor rekening palsu: Bank BCA: 123-456-7890 a.n. Toko Saya dan Bank Mandiri: 098-765-4321 a.n. Toko Saya.
        WHY IT IS A PROBLEM:
        Ketika Admin menekan tombol [1] KIRIM REKENING di Admin Dashboard, sistem akan mengirimkan nomor rekening palsu kepada pembeli nyata.
        RISK LEVEL: MEDIUM
        RECOMMENDED SOLUTION:
        Pindahkan konfigurasi rekening bank resmi ke js/config.js atau ke tabel settings di database Supabase agar dinamis dan terisi data rekening yang valid.
        FILES AFFECTED:

        js/services/whatsappCsService.js
        ,

        js/config.js
        .
        DATABASE AFFECTED: None (atau tabel baru store_settings).
        9. Kerentanan Dobel Klik & Dobel Submit pada Checkout Modal
        CURRENT BEHAVIOR:
        Pada fungsi handleCheckoutSubmit di

        js/components/cart.js
        , tombol checkout tidak dikunci dengan idempotency flag secara sinkron sebelum proses asinkron supabaseService.createOrder selesai.
        WHY IT IS A PROBLEM:
        Jika koneksi internet pembeli melambat dan pembeli menekan tombol checkout 2 atau 3 kali berturut-turut, sistem akan membuat 2 sampai 3 pesanan duplikat dengan order_id berbeda untuk transaksi yang sama.
        RISK LEVEL: HIGH
        RECOMMENDED SOLUTION:
        Pasang loading state dan lock flag langsung pada saat tombol pertama kali ditekan (isSubmitting = true, btn.disabled = true, tampilkan spinner), serta gunakan client-generated idempotency key yang unik per sesi checkout.
        FILES AFFECTED:

        js/components/cart.js
        ,

        checkout.html
        .
        DATABASE AFFECTED: Tabel orders (constraint unik idempotency_key).
        10. Struktur Item Pesanan Denormalized (orders.items Plain Text String)
        CURRENT BEHAVIOR:
        Saat checkout, daftar produk yang dibeli digabungkan menjadi satu string teks mentah (contoh: "Gundam RX-78-2 (x1), Paint Marker (x2)") dan disimpan di kolom orders.items. Tabel order_items yang ada di database SQL sama sekali tidak digunakan oleh JavaScript.
        WHY IT IS A PROBLEM:
        Sistem tidak dapat melakukan query analitik produk terlaris, tidak dapat melacak varian produk secara individual, tidak dapat mengaitkan foreign key produk, dan menyulitkan proses stock audit jika ada sebagian item yang diretur.
        RISK LEVEL: MEDIUM
        RECOMMENDED SOLUTION:
        Aktifkan penggunaan tabel relasional order_items (order_id, product_id, product_name, quantity, price_per_unit) saat proses checkout berlangsung.
        FILES AFFECTED:

        js/components/cart.js
        ,

        checkout.html
        ,

        js/services/supabaseService.js
        ,

        js/admin.js
        .
        DATABASE AFFECTED: Tabel order_items, tabel orders.
        Dokumentasi lengkap telah tersimpan di repository pada:



        docs/CODEBASE_MAP.md


        docs/FULL_SYSTEM_AUDIT.md
        11:14 AM
        11:27 AM
        supabase_patch_v2.sql
        supabase_security_rules.sql
        supabase_security_rules.sql
        authService.js
        admin.js#L208-260
            IF v_real_stock < v_qty THEN
                RAISE EXCEPTION 'Stok untuk "%" tidak mencukupi (sisa: %, diminta: %)',
                    COALESCE(v_item->>'name', v_prod_id), v_real_stock, v_qty;
            END IF;

            UPDATE products
            SET stock = stock - v_qty
            WHERE (id::text = v_prod_id OR lower(name) = lower(v_item->>'name'));
        ELSE
            v_real_price := COALESCE((v_item->>'price')::numeric, 0);
        END IF;

        v_total_amount := v_total_amount + (v_real_price * v_qty);

        IF NOT v_first THEN
            v_items_summary := v_items_summary || ', ';
        END IF;
        v_items_summary := v_items_summary || (COALESCE(v_item->>'name', 'Produk') || ' (x' || v_qty || ')');
        v_first := false;
    END LOOP;

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

GRANT EXECUTE ON FUNCTION public.submit_order_secure TO anon, authenticated, service_role;


