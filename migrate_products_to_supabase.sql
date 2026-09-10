-- ==============================================================================
-- MUSTAZ CRAFT - MIGRASI SELURUH PRODUK KE SUPABASE DATABASE
-- ==============================================================================
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skrip ini memigrasikan semua 8 katalog produk, harga, stok, spesifikasi, dan
-- gambar resmi ke tabel public.products di cloud Supabase.
-- ==============================================================================

-- 1. PASTIKAN SELURUH STRUKTUR KOLOM TABEL PRODUCTS SIAP
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Acrylic Pet';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sub TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 10;

-- 2. MIGRASI DATA KATALOG LENGKAP (8 PRODUK MUSTAZ CRAFT)
INSERT INTO public.products (id, name, category, price, original_price, stock, badge, sub, image)
VALUES
(
  'pet-1',
  'Y-TWO ROOF VISOR',
  'Acrylic Pet',
  350000,
  450000,
  12,
  'BESTSELLER',
  'Neon Lime Translucent // Spiked Studs // 3-Snap Universal',
  'Product1.png'
),
(
  'pet-2',
  'STUDDED LID FLAME VISOR',
  'Leather Pet',
  380000,
  NULL,
  8,
  'HOT DROP',
  'Black Heavy Leather // Hand-Painted Red & Yellow Flames',
  'Product2.png'
),
(
  'pet-3',
  'CHECKER RACER DUCKBILL',
  'Retro Visor',
  280000,
  320000,
  15,
  'LIMITED',
  'Monochrome Checkered Motocross Visor // Chrome Snaps',
  'Product3.png'
),
(
  'pet-4',
  'MUSTAZ OFFICIAL BUNDLE SET',
  'Drop Sets',
  450000,
  520000,
  10,
  'BUNDLE',
  'Pet Visor + Custom Packaging Bag + Zine + Sticker Pack',
  'mustaz_booth_event.png'
),
(
  'pet-5',
  'ACID YELLOW SPIKED PET',
  'Acrylic Pet',
  360000,
  NULL,
  18,
  'NEW',
  'Acid Yellow High-Voltage Acrylic // Punk Spike Hardware',
  'Product1.png'
),
(
  'pet-6',
  'SMOKE TINT SHORT PEAK',
  'Retro Visor',
  220000,
  270000,
  24,
  'SALE',
  'Dark Smoke Polycarbonate // Universal 3-Snap Fit',
  'Product2.png'
),
(
  'pet-7',
  'VINTAGE HIGHWAY EAR GUARDS',
  'Leather Pet',
  195000,
  NULL,
  14,
  'CORE',
  'Vintage Leather Side Covers with Brass Rivets',
  'Product3.png'
),
(
  'pet-8',
  'MUSTAZ EVENT EDITION PACK',
  'Drop Sets',
  490000,
  550000,
  5,
  'ARCHIVE',
  'Special Event Pack // Limited Screenprinted Ziplock',
  'mustaz_booth_event.png'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  stock = EXCLUDED.stock,
  badge = EXCLUDED.badge,
  sub = EXCLUDED.sub,
  image = EXCLUDED.image;

-- 3. VERIFIKASI HASIL SEEDING
SELECT id, name, category, price, stock, image FROM public.products ORDER BY id ASC;
