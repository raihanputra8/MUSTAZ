# ⚡ Panduan Setup Supabase Cloud // MUSTAZ CRAFT

Project Supabase Anda telah berhasil dikonfigurasikan di codebase:
- **Project URL:** `https://hskggocaakmidbysrpnd.supabase.co`
- **Publishable Key:** `sb_publishable_GiDVOZNX_cZFe79wO0fw5w_wsfgRyAi`
- **Storage Bucket:** `product-images`

---

## 🛠️ Langkah Cepat Aktivasi (Hanya 1 Menit di Dashboard Supabase)

1. Buka [https://supabase.com/dashboard](https://supabase.com/dashboard) dan pilih project **`hskggocaakmidbysrpnd`**.
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Klik **New query**, lalu **Copy & Paste** script SQL di bawah ini dan klik **RUN** (tombol hijau):

```sql
-- ══════════════════════════════════════════════════════════════════════════
-- 1. BUAT TABEL KATALOG PRODUK (products)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Acrylic Pet',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock INT DEFAULT 10,
  badge TEXT,
  sub TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Publik dapat melihat, menambah, mengubah, dan menghapus produk
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert products" ON public.products;
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update products" ON public.products;
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete products" ON public.products;
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);


-- ══════════════════════════════════════════════════════════════════════════
-- 2. BUAT TABEL PESANAN MASUK (orders)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  city TEXT DEFAULT 'JAKARTA',
  phone TEXT,
  items TEXT,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'PROCESSING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update orders" ON public.orders;
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);


-- ══════════════════════════════════════════════════════════════════════════
-- 3. BUAT TABEL AKUN PENGGUNA (accounts) DENGAN ROLE ADMIN/MEMBER
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  alias TEXT DEFAULT 'Rider 7G',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' atau 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom role jika tabel sudah dibuat sebelumnya
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read accounts" ON public.accounts;
CREATE POLICY "Public read accounts" ON public.accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert accounts" ON public.accounts;
CREATE POLICY "Public insert accounts" ON public.accounts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update accounts" ON public.accounts;
CREATE POLICY "Public update accounts" ON public.accounts FOR UPDATE USING (true);


-- ══════════════════════════════════════════════════════════════════════════
-- 4. OTOMATIS SYNC USER SUPABASE AUTH KE TABEL ACCOUNTS
-- ══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (email) DO UPDATE
  SET updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ══════════════════════════════════════════════════════════════════════════
-- 5. CARA MENJADIKAN AKUN SEBAGAI ADMIN WORKSHOP
-- ══════════════════════════════════════════════════════════════════════════
-- Jalankan baris ini untuk memberikan hak akses Admin ke email Anda:
-- UPDATE public.accounts SET role = 'admin' WHERE email = 'email_anda@domain.com';


-- ══════════════════════════════════════════════════════════════════════════
-- 6. BUAT STORAGE BUCKET FOTO ('product-images')
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public upload product images" ON storage.objects;
CREATE POLICY "Public upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');


-- ══════════════════════════════════════════════════════════════════════════
-- 7. INSERT 8 DATA PRODUK AWAL MUSTAZ CRAFT
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO public.products (id, name, category, price, original_price, stock, badge, sub, image)
VALUES
('pet-1', 'Y-TWO ROOF VISOR', 'Acrylic Pet', 350000, NULL, 12, 'BESTSELLER', 'Neon Lime Translucent // Spiked Studs // 3-Snap Universal Mount', 'assets/images/pet_visor_yellow_flame.png'),
('pet-2', 'STUDDED LID FLAME VISOR', 'Leather Pet', 380000, NULL, 8, 'HOT DROP', 'Black Heavy Leather // Hand-Painted Red & Yellow Flames // Brass Rivets', 'assets/images/pet_visor_yellow_flame.png'),
('pet-3', 'CHECKER RACER DUCKBILL', 'Retro Visor', 280000, NULL, 15, 'LIMITED', 'Monochrome Checkered Motocross Visor // Chrome Hardware', 'assets/images/retro_checkered_helmet.png'),
('pet-4', 'MUSTAZ OFFICIAL BUNDLE SET', 'Drop Sets', 450000, 520000, 10, 'BUNDLE', 'Pet Visor + Custom Packaging Bag + Zine + Sticker Bomb Kit', 'assets/images/mustaz_booth_event.png'),
('pet-5', 'ACID YELLOW SPIKED PET', 'Acrylic Pet', 360000, NULL, 18, 'NEW', 'Acid Yellow High-Voltage Acrylic // Punk Spike Hardware', 'assets/images/pet_visor_yellow_flame.png'),
('pet-6', 'SMOKE TINT SHORT PEAK', 'Retro Visor', 220000, 250000, 24, 'SALE', 'Dark Smoke Polycarbonate // Universal 3-Snap Fit', 'assets/images/retro_checkered_helmet.png'),
('pet-7', 'VINTAGE HIGHWAY EAR GUARDS', 'Leather Pet', 195000, NULL, 14, 'CORE', 'Vintage Leather Side Covers with Brass Rivets', 'assets/images/pet_visor_yellow_flame.png'),
('pet-8', 'CHOPPER DIRT VISOR WHITE', 'Retro Visor', 260000, NULL, 9, 'LIMITED', 'Crisp White MX Peak // Hand-Screened MUSTAZ Logo', 'assets/images/retro_checkered_helmet.png')
ON CONFLICT (id) DO NOTHING;
```

---

## 🔑 Cara Mengaktifkan Google OAuth di Supabase:
1. Buka Dashboard Supabase -> **Authentication** -> **Providers**.
2. Cari dan klik **Google**.
3. Centang **Enable Google provider**.
4. Masukkan **Client ID** dan **Client Secret** (didapatkan dari Google Cloud Console Credentials -> OAuth 2.0 Client IDs).
5. Tambahkan Callback URL Supabase yang tertera di sana ke Google Cloud Console Anda:
   `https://hskggocaakmidbysrpnd.supabase.co/auth/v1/callback`
6. Klik **Save**.

```

---

## 🚀 Fitur yang Langsung Aktif Setelah Script Dijalankan:
1. **Cloud Database Katalog:** Semua produk visor tersimpan di cloud PostgreSQL Supabase secara realtime.
2. **Cloud Storage Bucket (`product-images`):** Admin bisa upload foto visor langsung dari komputer ke CDN Supabase.
3. **Pencatatan Pesanan Cloud (`orders`):** Setiap pesanan pembeli otomatis tercatat di database cloud Supabase Anda.

