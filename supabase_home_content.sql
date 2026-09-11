-- ========================================================
-- MUSTAZ CRAFT - SUPABASE HOME CONTENT & SITE ASSETS CMS
-- ========================================================

-- 1. Buat Tabel Content
CREATE TABLE IF NOT EXISTS public.home_content (
    section_id TEXT PRIMARY KEY,
    content_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

-- Policy: Publik bisa membaca konten Home
CREATE POLICY "Public can read home content" 
ON public.home_content FOR SELECT USING (true);

-- Policy: Hanya Admin yang bisa mengedit konten
CREATE POLICY "Admin can update home content" 
ON public.home_content FOR ALL 
TO authenticated USING (public.is_admin());

-- Insert Default Values (Fallback Data)
INSERT INTO public.home_content (section_id, content_value) VALUES
('hero_title', 'PET HELM / VISORS'),
('hero_subtitle', 'High-voltage acid acrylics, spiked leather visors, and vintage race duckbill peaks.'),
('hero_banner_image', '/assets/banner/hero-main.jpg')
ON CONFLICT (section_id) DO NOTHING;

-- 2. Buat Storage Bucket untuk Upload Gambar
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Publik bisa baca gambar, Admin bisa upload
CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Admin Upload Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());
