-- ══════════════════════════════════════════════════════════════════════════════
-- MUSTAZ CRAFT - STORE SETTINGS & DYNAMIC ADMIN WHATSAPP CONFIGURATION
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Buat tabel store_settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Siapa saja (publik / pembeli) dapat membaca pengaturan toko (untuk checkout WA)
DROP POLICY IF EXISTS "Public can read store settings" ON public.store_settings;
CREATE POLICY "Public can read store settings" 
ON public.store_settings FOR SELECT 
USING (true);

-- 4. Policy: Izinkan insert/update pengaturan toko oleh Admin/Sistem
DROP POLICY IF EXISTS "Public insert store settings" ON public.store_settings;
CREATE POLICY "Public insert store settings" 
ON public.store_settings FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public update store settings" ON public.store_settings;
CREATE POLICY "Public update store settings" 
ON public.store_settings FOR UPDATE 
USING (true);

-- 5. Masukkan data awal nomor WhatsApp resmi CS toko
INSERT INTO public.store_settings (key, value) 
VALUES ('admin_whatsapp', '62895325604340')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();
