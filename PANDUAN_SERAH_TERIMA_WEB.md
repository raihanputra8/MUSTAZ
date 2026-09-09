# 📋 PANDUAN & CHECKLIST SERAH TERIMA WEB (HANDOVER GUIDE)
## MUSTAZ CRAFT — Kustom Kultur & Garage E-Commerce

Dokumen ini berisi daftar lengkap data pribadi, nomor kontak, email, rekening bank, serta konfigurasi backend/API yang saat ini masih menggunakan data pengembang/pemilik awal (`Raihan Putra / raihanputrairawan8@gmail.com`) dan **wajib diubah/disesuaikan ketika proyek diserahterimakan ke pemilik baru (klien)**.

---

## 📑 DAFTAR ISI
1. [Prioritas 1: Nomor WhatsApp Admin & CS](#1-prioritas-1-nomor-whatsapp-admin--cs)
2. [Prioritas 2: Rekening Bank & QRIS Toko](#2-prioritas-2-rekening-bank--qris-toko)
3. [Prioritas 3: Email Super Admin & Whitelist Akses](#3-prioritas-3-email-super-admin--whitelist-akses)
4. [Prioritas 4: Supabase Cloud Database & Storage](#4-prioritas-4-supabase-cloud-database--storage)
5. [Prioritas 5: Layanan Email Notifikasi (Resend / Netlify)](#5-prioritas-5-layanan-email-notifikasi-resend--netlify)
6. [Prioritas 6: Akun Media Sosial & Email Kontak Toko](#6-prioritas-6-akun-media-sosial--email-kontak-toko)
7. [Prioritas 7: Pembersihan Data Uji Coba / Dummy Orders](#7-prioritas-7-pembersihan-data-uji-coba--dummy-orders)
8. [⚡ Cheat Sheet "Cari & Ganti" (Quick Find & Replace)](#8--cheat-sheet-cari--ganti-quick-find--replace)

---

## 1. Prioritas 1: Nomor WhatsApp Admin & CS

Nomor WhatsApp digunakan untuk menerima order otomatis via pesan terstruktur website (*Direct Checkout*), Instant 1-Click Buy, dan bot asisten CS.

### Data Saat Ini:
- **Nomor:** `62895402806350` (atau `0895402806350`)

### Berkas yang Harus Diubah:
1. **[js/config.js](file:///home/hann/Desktop/mustaz_buildtest/js/config.js)** (Pusat Konfigurasi Utama):
   ```javascript
   // Baris 11:
   ADMIN_WHATSAPP: "62895402806350", // Ganti dengan nomor WA resmi klien (format: 628...)
   ```
2. **Link WA Statis di Footer & Tombol Konsultasi**:
   Cari teks `https://wa.me/62895402806350` pada berkas-berkas berikut dan ganti dengan nomor baru:
   - `index.html` (Footer)
   - `helmets.html` (Footer)
   - `parts.html` (Footer)
   - `kulture.html` (Footer & CTA Hubungi)
   - `testimoni.html` (Footer & Tombol Kirim Foto)
   - `account.html` (Footer & Tombol Bantuan Pesanan)
   - `checkout.html` (Footer)
   - `login.html` & `register.html` (Footer)
   - `faq.html` (Tombol Tanya Workshop & Footer)
   - `shipping.html`, `privacy-policy.html`, `terms-of-service.html` (Footer)
   - `admin.html` (Tabel Pesanan & Footer)

> **Tips:** Cukup lakukan fitur **Find in Files / Replace All** di editor untuk `62895402806350` ke `628XXXXXXXXXX`.

---

## 2. Prioritas 2: Rekening Bank & QRIS Toko

Digunakan oleh Bot CS pada **Fase 1 (Incoming Order)** untuk mengirim nomor rekening resmi serta tampilan QRIS kepada pembeli.

### Berkas yang Harus Diubah:
**[js/services/whatsappCsService.js](file:///home/hann/Desktop/mustaz_buildtest/js/services/whatsappCsService.js)** (Baris 14–32):
```javascript
export const OFFICIAL_PAYMENT_ACCOUNTS = {
  BCA: {
    bank: 'BCA',
    accountNumber: '123-456-7890',      // <-- GANTI nomor rekening BCA klien
    accountName: 'Toko Saya',          // <-- GANTI atas nama rekening klien
    formatted: '🏦 *BCA:* 123-456-7890 a.n. Toko Saya'
  },
  MANDIRI: {
    bank: 'Mandiri',
    accountNumber: '098-765-4321',      // <-- GANTI nomor rekening Mandiri klien
    accountName: 'Toko Saya',          // <-- GANTI atas nama rekening klien
    formatted: '🏦 *Mandiri:* 098-765-4321 a.n. Toko Saya'
  },
  QRIS: {
    name: 'QRIS Resmi Toko',
    url: 'https://mustaz-craft.com/assets/images/qris_official.png', // <-- GANTI gambar QRIS klien
    formatted: '📱 *QRIS:* https://mustaz-craft.com/assets/images/qris_official.png'
  }
};
```
*Pastikan juga mengunggah file foto QRIS asli ke folder `assets/images/qris_official.png` atau Supabase Storage.*

---

## 3. Prioritas 3: Email Super Admin & Whitelist Akses

Sistem menggunakan whitelist email untuk mendeteksi siapa yang berhak membuka dashboard Admin (`admin.html`), mengedit produk, memoderasi ulasan, dan mengubah status pesanan.

### Data Saat Ini:
- `raihanputrairawan8@gmail.com`
- `admin@mustazcraft.com`

### Berkas yang Memuat Whitelist Admin:
1. **[js/services/authService.js](file:///home/hann/Desktop/mustaz_buildtest/js/services/authService.js)**:
   - Baris 266: `isOwner = email === '...' || email === '...'`
   - Baris 299: `if (normalized === '...' || normalized === '...')`
   - Baris 317: Default session login helper (`email: '...'`)
   - Baris 357: `isOwner = email.toLowerCase() === '...'`
2. **[js/services/supabaseService.js](file:///home/hann/Desktop/mustaz_buildtest/js/services/supabaseService.js)**:
   - Baris 390: `isOwner = email === '...'`
3. **[js/components/navbar.js](file:///home/hann/Desktop/mustaz_buildtest/js/components/navbar.js)**:
   - Baris 22: Logika menampilkan tombol menu `ADMIN WORKSHOP ⚡` di navbar.
4. **[admin.html](file:///home/hann/Desktop/mustaz_buildtest/admin.html)**:
   - Baris 117: Fallback default session profil admin (`email: '...'`).
5. **[login.html](file:///home/hann/Desktop/mustaz_buildtest/login.html)**:
   - Baris 197 & 265: Pengalihan otomatis setelah login ke `admin.html`.
6. **[account.html](file:///home/hann/Desktop/mustaz_buildtest/account.html)**:
   - Baris 484: Tampilan badge `ADMIN WORKSHOP` dan tombol pintas ke konsol admin.
7. **[supabase_security_rules.sql](file:///home/hann/Desktop/mustaz_buildtest/supabase_security_rules.sql)**:
   - Baris 24: Aturan Row-Level Security (RLS) pada PostgreSQL Supabase:
     ```sql
     IF LOWER(auth.jwt() ->> 'email') IN ('email_baru_admin@domain.com') THEN
     ```

> **Langkah Serah Terima Akun:**
> 1. Buatkan akun baru untuk klien melalui halaman registrasi (`register.html`) menggunakan email klien.
> 2. Ganti email lama (`raihanputrairawan8@gmail.com`) pada berkas-berkas di atas dengan email klien tersebut.
> 3. Jalankan query SQL di SQL Editor Supabase untuk menetapkan role `'admin'` pada tabel `accounts`:
>    ```sql
>    UPDATE public.accounts SET role = 'admin' WHERE email = 'email_klien@domain.com';
>    ```

---

## 4. Prioritas 4: Supabase Cloud Database & Storage

Saat ini website terhubung ke proyek Supabase pengembang. Ketika diserahterimakan, disarankan memindahkan kepemilikan proyek (*Transfer Ownership*) atau membuat proyek Supabase baru milik klien.

### Data Saat Ini:
- **Project URL:** `https://hskggocaakmidbysrpnd.supabase.co`
- **Anon Public Key:** `sb_publishable_GiDVOZNX_cZFe79wO0fw5w_wsfgRyAi`

### Berkas yang Harus Diubah:
**[js/config.js](file:///home/hann/Desktop/mustaz_buildtest/js/config.js)**:
```javascript
SUPABASE_URL: "https://PROJECT_BARU_KLIEN.supabase.co",
SUPABASE_ANON_KEY: "sb_publishable_KEY_BARU_KLIEN",
STORAGE_URL: "https://PROJECT_BARU_KLIEN.supabase.co/storage/v1/object/public/product-images",
```

### Prosedur Setup Proyek Supabase Baru (Jika Buat Baru):
1. Buat project baru di [supabase.com](https://supabase.com).
2. Buat tabel: `products`, `orders`, `accounts`, `categories`, `reviews`.
3. Buat Bucket Storage bernama: `product-images` dan atur menjadi **Public**.
4. Buka menu **SQL Editor**, salin dan jalankan seluruh isi berkas:
   - **[supabase_security_rules.sql](file:///home/hann/Desktop/mustaz_buildtest/supabase_security_rules.sql)**
5. Jika menggunakan **Google Login**, aktifkan Google Provider di *Supabase -> Authentication -> Providers* dengan Client ID & Client Secret dari Google Cloud Console klien.
6. Masukkan Redirect URL: `https://domain-klien.com/login.html` dan `http://localhost:5173/login.html`.

---

## 5. Prioritas 5: Layanan Email Notifikasi (Resend / Netlify)

Website mendukung pengiriman invoice otomatis ke email pembeli setelah checkout.

### Berkas & Konfigurasi:
1. **Netlify / Vercel Environment Variables**:
   Jika di-deploy ke Netlify/Vercel, atur Environment Variables berikut di dashboard hosting klien:
   - `RESEND_API_KEY`: Kunci API akun [resend.com](https://resend.com) milik klien.
   - `RESEND_FROM`: Contoh `MUSTAZ CRAFT <orders@domain-klien.com>` (harus domain terverifikasi di Resend).
2. **Berkas Terkait**:
   - `netlify/functions/send-order-email.js`
   - `api/send-order-email.js`
   - `js/services/emailService.js`

---

## 6. Prioritas 6: Akun Media Sosial & Email Kontak Toko

Tautan sosial media toko di header, footer, dan halaman legalitas.

### Berkas yang Harus Diperiksa:
1. **Email Kontak Publik**:
   - Nilai Saat Ini: `contact@mustazcraft.com`
   - Lokasi: Footer di seluruh halaman HTML (`mailto:contact@mustazcraft.com`).
2. **Instagram**:
   - Nilai Saat Ini: `https://instagram.com/mustazcraft` (dan link profil di `kulture.html`).
   - Ganti ke link Instagram toko klien.
3. **TikTok**:
   - Nilai Saat Ini: `https://tiktok.com/@mustazcraft`
   - Ganti ke akun TikTok toko klien.
4. **Alamat Fisik / Workshop**:
   - Lokasi: `shipping.html` (alamat default pengiriman contoh: Margonda Raya Depok), `faq.html`, dan `testimoni.html`.

---

## 7. Prioritas 7: Pembersihan Data Uji Coba / Dummy Orders

Saat pengembangan, terdapat data dummy pesanan untuk menguji fitur tab filter dan bot CS.

### Berkas:
**[js/admin.js](file:///home/hann/Desktop/mustaz_buildtest/js/admin.js)** (Baris 742–746):
```javascript
const DEFAULT_ADMIN_ORDERS = [
  // Hapus data contoh ini atau kosongkan jadi [] saat toko resmi live:
  // { id: 'MSTZ-9942', customer: 'Raihan // Depok', items: '...', ... }
];
```
*Catatan: Pembeli juga dapat menghapus cache browser lokal dengan menekan logout atau membersihkan `localStorage`.*

---

## 8. ⚡ Cheat Sheet "Cari & Ganti" (Quick Find & Replace)

Berikut tabel ringkas kata kunci yang dapat langsung dicari di IDE (*Global Search / Replace*):

| Kata Kunci Saat Ini (Lama) | Ganti Menjadi (Data Baru Klien) | File Kunci |
| :--- | :--- | :--- |
| `62895402806350` | Nomor WA Klien (Contoh: `6281399887766`) | `js/config.js`, seluruh file `.html` |
| `raihanputrairawan8@gmail.com` | Email Admin Baru Klien | `js/services/authService.js`, `admin.html`, `login.html`, `account.html`, `supabase_security_rules.sql` |
| `admin@mustazcraft.com` | Email Domain Resmi Admin Baru | `js/services/authService.js`, `js/components/navbar.js` |
| `123-456-7890` (BCA) | Nomor Rekening BCA Klien | `js/services/whatsappCsService.js` |
| `098-765-4321` (Mandiri) | Nomor Rekening Mandiri Klien | `js/services/whatsappCsService.js` |
| `contact@mustazcraft.com` | Email Info/Support Toko Klien | Seluruh footer file `.html` |
| `https://instagram.com/mustazcraft` | Link Instagram Toko Klien | Seluruh footer file `.html` & `kulture.html` |
| `https://hskggocaakmidbysrpnd.supabase.co` | URL Supabase Proyek Klien | `js/config.js` |

---

> 🔒 **PENTING UNTUK KEAMANAN:**  
> Sebelum menyerahkan akses ke klien, pastikan Anda:
> 1. Melakukan logout dari akun developer di browser.
> 2. Menghapus API Key pribadi Anda dari hosting (Netlify/Vercel).
> 3. Meminta klien mengganti password email dan password database Supabase mereka.
