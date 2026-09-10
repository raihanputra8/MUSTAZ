# MUSTAZ CRAFT — FULL SYSTEM AUDIT & ARCHITECTURE ANALYSIS

> **Audit Date**: 10 September 2026  
> **Role**: Senior Full-Stack Engineer, Software Architect, Security Auditor, Database Engineer, UX/Business Flow Analyst  
> **Repository**: MUSTAZ CRAFT (`mustaz_buildtest`)  
> **Status**: Comprehensive Read-Only Audit Complete (No Production Code Modified)

---

## 1. Executive Summary

Audit menyeluruh terhadap seluruh source code **MUSTAZ CRAFT** telah dilakukan. Sistem saat ini menggabungkan web frontend modern berbasis Vanilla JavaScript (ES6 Modules), backend database Supabase (PostgREST + GoTrue Auth), serverless email function (Vercel + Resend), dan automasi komunikasi berbasis WhatsApp Web (`wa.me`).

Secara umum, aplikasi ini telah memiliki struktur visual dan fungsional yang berjalan baik untuk interaksi katalog dan customer service. Namun, dari sudut pandang **Arsitektur Perangkat Lunak, Integritas Database, dan Keamanan Transaksi**, ditemukan celah-celah fundamental yang sangat rentan terhadap **manipulasi harga oleh pembeli, bypass hak akses Admin, desinkronisasi stok produk, dan race conditions**.

### Ringkasan Temuan Masalah:
- **CRITICAL**: 4 Masalah
- **HIGH**: 6 Masalah
- **MEDIUM**: 6 Masalah
- **LOW**: 4 Masalah

---

## 2. Current Architecture

Arsitektur saat ini menggunakan pola **Fat Client / Thick Frontend**, di mana sebagian besar logika bisnis (kalkulasi harga, diskon, pengurangan stok, otorisasi role, dan status transaksi) dieksekusi langsung di dalam browser pengguna (Client-Side Logic).

```text
                     +---------------------------------------+
                     |           BROWSER PEMBELI             |
                     |  - Menghitung Total Harga & Diskon   |
                     |  - Memotong Stok Lokal (LocalStorage) |
                     |  - Membuat Objek Order               |
                     +-------------------+-------------------+
                                         |
               +-------------------------+-------------------------+
               | (Direct REST Call)                                | (wa.me Redirect)
               v                                                   v
+-------------------------------+                     +-------------------------+
|        SUPABASE CLOUD         |                     |      WHATSAPP API       |
|  - PostgREST API (Anon Key)   |                     |  - Format Pesan Teks    |
|  - Menyimpan Order Mentah     |                     |  - Dikirim ke Nomor WA  |
|  - Tanpa Validasi Harga DB    |                     |    Admin Toko           |
+---------------+---------------+                     +------------+------------+
                |                                                  |
                | (Direct REST Read/Write)                         |
                v                                                  v
+-------------------------------+                     +-------------------------+
|      BROWSER ADMIN CONSOLE    | <------------------ |   ADMIN OPERASIONAL     |
|  - Login Role via LocalStorage|                     |  - Menerima Chat WA     |
|  - Kirim Rekening (CS Step 1) |                     |  - Cek Mutasi Bank      |
|  - Verifikasi Lunas (Step 2)  |                     |  - Proses & Kirim Paket |
|  - Input Resi (Step 3)        |                     +-------------------------+
+-------------------------------+
```

---

## 3. Project Structure

Topologi file project terbagi secara modular:
- **Halaman Pembeli**: `index.html` (didukung oleh modul `js/app.js` dan komponen `js/components/`) serta `checkout.html` (halaman checkout terpisah).
- **Console Admin**: `admin/index.html` (didukung oleh `js/admin.js`).
- **Data & Service Layer**: `js/services/` (`supabaseClient.js`, `supabaseService.js`, `cartService.js`, `authService.js`, `whatsappCsService.js`, `emailService.js`, `reviewsService.js`).
- **Backend API**: `api/send-order-email.js` (Serverless Function Vercel untuk notifikasi email).
- **Konfigurasi**: `js/config.js` dan `vercel.json`.
- **Database DDL & Policies**: `supabase_security_rules.sql` dan `SUPABASE_SETUP.md`.

---

## 4. Buyer Flow

1. **Eksplorasi Katalog**: Pembeli membuka `index.html`, melihat banner, memilih filter kategori, atau mencari produk melalui search bar.
2. **Add to Cart**: Pembeli memilih item dan varian, lalu menekan tombol "Tambah ke Keranjang". Data masuk ke `localStorage['mustaz_cart']`.
3. **Buka Keranjang / Checkout**:
   - Pembeli membuka drawer keranjang (`#cartModal`).
   - Pembeli dapat memasukkan kupon promo (misal `MUSTAZ10`).
   - Pembeli menekan tombol `Checkout Sekarang` untuk membuka formulir checkout inline (`#checkoutModal`) atau dialihkan ke `checkout.html`.
4. **Pengisian Formulir**:
   - Pembeli mengisi Nama, Nomor WhatsApp, Email, Alamat Lengkap, Kota, Provinsi, Kode Pos, Ekspedisi, dan Catatan Pesanan.
5. **Kalkulasi & Biaya**:
   - Sistem browser menghitung subtotal, diskon kupon, ongkir (flat rate per kurir), dan total akhir.
6. **Submit Pesanan**:
   - Browser menyimpan record pesanan ke tabel Supabase `orders` via REST API.
   - Browser memicu pemotongan stok pada inventori lokal `localStorage`.
   - Browser memicu pengiriman email konfirmasi order via `/api/send-order-email`.
   - Browser membuka jendela baru ke WhatsApp Admin (`https://wa.me/62895325604340`) dengan format order siap kirim.
   - Keranjang belanja dikosongkan.
7. **Pembayaran & Konfirmasi**:
   - Pembeli menunggu Admin mengirimkan instruksi nomor rekening / QRIS melalui WhatsApp.
   - Pembeli mentransfer dana dan mengirim bukti transfer ke WhatsApp Admin.

---

## 5. Admin Flow

1. **Akses Dashboard**: Admin membuka URL `/admin`.
2. **Autentikasi**:
   - Admin memasukkan email dan password di modal `#adminAuthOverlay`.
   - *Catatan Audit*: Terdapat tombol darurat `#btnSwitchToAdminNow` yang memungkinkan siapapun mendapatkan role admin secara instan dengan memodifikasi `localStorage`.
3. **Pemeriksaan Pesanan Masuk**:
   - Tab "Daftar Pesanan" menampilkan daftar order yang diambil dari Supabase `orders` (dengan fallback ke `localStorage['mustaz_admin_orders']`).
4. **Pemrosesan Terfase (Action Buttons)**:
   - **Fase 1 (`PENDING`)**: Admin menekan tombol `[1] KIRIM REKENING` -> Mengubah status menjadi `PAYMENT_PENDING` dan membuka WhatsApp ke nomor pembeli berisi detail nominal & rekening toko.
   - **Fase 2 (`PAYMENT_PENDING` / `WAITING_VERIFICATION`)**: Admin menekan `[2] VERIFIKASI LUNAS` -> Mengubah status menjadi `PAID_PROCESSING` dan mengirim pesan konfirmasi pembayaran lunas ke pembeli via WhatsApp.
   - **Fase 3 (`PAID_PROCESSING`)**: Admin menyiapkan pesanan fisik, mengepak paket, lalu menekan `[3] INPUT RESI` -> Membuka prompt resi, mengupdate status ke `SHIPPED`, dan membuka WhatsApp berisi nomor resi dan link tracking.
   - **Fase 4 (`SHIPPED`)**: Setelah paket sampai, Admin menekan `[4] MINTA REVIEW` -> Mengubah status ke `COMPLETED` dan mengirim template WhatsApp meminta ulasan/testimoni.
5. **Manajemen Produk**:
   - Admin dapat menambah, mengedit stok, mengedit harga, atau menghapus produk di tab "Katalog Produk".

---

## 6. Checkout Flow

### Rincian Pelaksanaan Kode:
- **File Inisiasi**:
  - Modal Inline: [`js/components/cart.js`](file:///home/hann/Desktop/mustaz_buildtest/js/components/cart.js) (fungsi `handleCheckoutSubmit`)
  - Standalone: [`checkout.html`](file:///home/hann/Desktop/mustaz_buildtest/checkout.html) (fungsi `processCheckout`)
- **Fungsi yang Dipanggil**:
  - `cartService.getCart()`
  - `cartService.getCartTotal()`
  - `supabaseService.createOrder(orderData)`
  - `cartService.deductProductStock(productId, qty)`
  - `emailService.sendOrderConfirmationEmail(orderData)`
  - `window.open(whatsappUrl, '_blank')`
  - `cartService.clearCart()`
- **Data yang Dikirim ke Supabase**:
  ```json
  {
    "order_id": "ORD-1725940000-1234",
    "customer_name": "John Doe",
    "customer_phone": "081234567890",
    "customer_email": "john@example.com",
    "shipping_address": "Jl. Mawar No 12, Jakarta, DKI Jakarta, 12345",
    "shipping_courier": "JNE (Reguler)",
    "items": "Gundam RX-78-2 Custom (x1), Paint Marker (x2)",
    "total_amount": 750000,
    "currency": "IDR",
    "order_status": "PENDING",
    "notes": "Tolong bubble wrap tebal",
    "created_at": "2026-09-10T04:14:00.000Z"
  }
  ```

### Jawaban atas Evaluasi Kritis:
1. **Siapa yang menentukan harga?**
   - **Browser Pembeli (Client-side)**. Total harga diambil dari kalkulasi array keranjang di memori JavaScript browser.
2. **Siapa yang menentukan shipping cost?**
   - **Browser Pembeli**. Flat rate ditentukan di hardcode JavaScript (`checkout.html` baris 262-267).
3. **Kapan order dibuat?**
   - Dibuat saat tombol submit diklik, tepat sebelum URL WhatsApp dibuka.
4. **Kapan stok dikurangi?**
   - Tepat setelah `supabaseService.createOrder` mengembalikan response sukses.
5. **Status awal order apa?**
   - `PENDING`.
6. **Apakah user dapat memanipulasi harga?**
   - **YA (CRITICAL VULNERABILITY)**. User dapat membuka Developer Tools (Console) atau memodifikasi `localStorage['mustaz_cart']` untuk mengubah atribut `price: 1000`, lalu menekan checkout. Supabase menerima total berapapun tanpa mencocokkan kembali dengan harga resmi di tabel `products`.
7. **Apakah user dapat memanipulasi quantity?**
   - **YA**. User dapat mengirim quantity yang melebihi batas stok fisik atau bernilai negatif karena validasi hanya dilakukan di DOM frontend.
8. **Apakah order dibuat sebelum WhatsApp dibuka?**
   - **YA**. Order berhasil masuk ke Supabase terlebih dahulu, barulah browser memanggil `window.open(whatsappUrl)`.
9. **Apa yang terjadi jika Supabase gagal?**
   - Blok `try...catch` menangkap error. Jika Supabase offline atau RLS menolak, sistem melakukan fallback menyimpan order ke `localStorage['mustaz_orders_<email>']` dan tetap melanjutkan membuka WhatsApp. Admin tetap menerima pesan WA, tetapi database cloud tidak mencatat order tersebut.
10. **Apa yang terjadi jika user menutup browser?**
    - Jika user menutup browser saat popup WhatsApp muncul, order sudah tersimpan di database dalam status `PENDING`. Pembeli mungkin tidak jadi chat ke Admin sehingga order menjadi "zombie order".
11. **Apa yang terjadi jika user klik checkout dua kali?**
    - Pada `checkout.html`, tombol submit didisable (`submitBtn.disabled = true`). Namun pada modal inline `cart.js`, disable tombol dilakukan secara asinkron tanpa *idempotency key*. Dobel klik cepat dapat memicu pembuatan dua record order duplikat dengan `order_id` berbeda.

---

## 7. Payment Flow

```text
ORDER CREATED (Status: PENDING)
          |
          v
ADMIN KIRIM REKENING (Status: PAYMENT_PENDING)
          |
          v
PEMBELI TRANSFER MANUAL (BCA / Mandiri / QRIS)
          |
          v
PEMBELI KIRIM BUKTI LEWAT WA (Gambar / File)
          |
          v
ADMIN CEK MUTASI BANK MANUAL
          |
     +----+----+
     |         |
 (Valid)    (Palsu/Batal)
     v         v
ADMIN KLIK   ADMIN KLIK
"VERIFIKASI" "BATALKAN"
     |         |
     v         v
   PAID    CANCELLED
```

### Security Check:
- **Apakah user bisa mengubah payment status?**
  - **YA (CRITICAL)**: Berdasarkan policy Supabase `orders` pada `SUPABASE_SETUP.md` (`FOR UPDATE USING (true)`), siapapun yang memiliki Anon Key dapat mengirim request HTTP PATCH ke Supabase PostgREST endpoint untuk mengupdate `order_status` dari `PENDING` menjadi `PAID_PROCESSING` tanpa autentikasi admin!
- **Apakah user bisa mengubah amount?**
  - **YA (CRITICAL)**: Nilai `total_amount` dikirim langsung oleh client dan dapat diedit melalui payload HTTP PATCH ke PostgREST jika RLS tidak mengunci kolom amount.
- **Apakah bukti bayar tersimpan aman?**
  - **TIDAK**: Bukti bayar saat ini dikirimkan via chat personal WhatsApp. Pada kode frontend `admin.js`, ada placeholder field `order.receiptImage` yang disimpan sebagai base64 string, bukan link terenkripsi di Supabase Private Storage.

---

## 8. WhatsApp Flow

### Trace Nomor & Pengiriman:
1. **Nomor Toko / Admin**:
   - Diambil dari `CONFIG.ADMIN_WHATSAPP` (`62895325604340`).
   - Digunakan saat Pembeli melakukan checkout untuk menghubungi toko.
2. **Nomor Pembeli**:
   - Diinput oleh pembeli di field `customer_phone`.
   - Di-sanitize di `admin.js`:
     ```javascript
     let customerPhone = order.customer_phone || order.phone;
     customerPhone = customerPhone.replace(/[^0-9]/g, '');
     if (customerPhone.startsWith('0')) {
       customerPhone = '62' + customerPhone.slice(1);
     }
     ```
3. **Apakah bisa self-chat?**
   - Sebelumnya terjadi bug di mana tombol admin mengirim pesan ke nomor admin sendiri. Bug tersebut telah diperbaiki dengan mengarahkan target ke `customerPhone`. Namun jika pembeli memasukkan nomor dummy/salah, WhatsApp akan gagal terkirim.
4. **Audit Template Pesan**:
   - Template di [`whatsappCsService.js`](file:///home/hann/Desktop/mustaz_buildtest/js/services/whatsappCsService.js) baris 15-32 memuat nomor rekening placeholder:
     ```text
     1. Bank BCA: 123-456-7890 (a.n. Toko Saya)
     2. Bank Mandiri: 098-765-4321 (a.n. Toko Saya)
     ```
     Jika Admin mengeklik tombol `[1] KIRIM REKENING` di produksi, template ini akan mengirim nomor rekening palsu kepada pembeli.
5. **Peran WhatsApp**:
   - Saat ini WhatsApp berfungsi ganda sebagai saluran komunikasi dan tempat kesepakatan transaksi manual. WhatsApp **bukan source of truth**, tetapi sistem sangat bergantung pada interaksi manual di chat untuk melanjutkan status transaksi.

---

## 9. Inventory Flow & Stock Audit

### Analisis Logika Inventori:
1. **Kapan stok dikurangi?**
   - Di fungsi `cartService.deductProductStock(productId, qty)`.
2. **Di mana stok dikurangi?**
   - **HANYA DI LOCALSTORAGE BROWSER!**
   - File [`js/services/cartService.js`](file:///home/hann/Desktop/mustaz_buildtest/js/services/cartService.js) baris 229-242:
     ```javascript
     export function deductProductStock(productId, qty = 1) {
       const parts = getDynamicParts();
       const part = parts.find(p => p.id === productId);
       if (part && typeof part.stock === 'number') {
         part.stock = Math.max(0, part.stock - qty);
         saveDynamicParts(parts); // Menyimpan ke localStorage['mustaz_dynamic_parts']
         return true;
       }
       return false;
     }
     ```
   - **FATAL FLAW (CRITICAL)**: Fungsi ini **tidak pernah memanggil Supabase** untuk mengupdate kolom `stock` pada tabel `products` di database cloud!
   - Akibatnya, saat pembeli A membeli barang sampai habis di laptopnya, pembeli B di ponselnya masih melihat stok utuh di cloud Supabase.
3. **Apakah stok di-reserve?**
   - **TIDAK**. Tidak ada konsep reservasi stok temporary (misalnya hold 1 jam saat status `PENDING`).
4. **Apakah stok bisa negatif?**
   - Pada tabel `products` Supabase, tidak ada check constraint `CHECK (stock >= 0)`. Jika admin mengedit stok menjadi negatif di dashboard, database menerimanya.
5. **Apakah dua user bisa membeli stok terakhir secara bersamaan?**
   - **YA (RACE CONDITION PASTI TERJADI)**. Karena tidak ada database atomic decrement (`stock = stock - 1 WHERE stock >= 1`), dua user dapat bersamaan checkout produk dengan sisa stok 1. Keduanya akan sukses membuat order.
6. **Apakah order dibatalkan mengembalikan stok?**
   - **TIDAK**. Fungsi `updateOrderStatus(orderId, 'CANCELLED')` di `admin.js` tidak memicu pengembalian stok sama sekali.
7. **Apakah order expired mengembalikan stok?**
   - Sistem belum memiliki mekanisme cron/auto-expiry untuk order yang tidak dibayar.

---

## 10. Order State Machine

### Status yang Aktif Digunakan dalam Kode:

| Status | Dibuat Oleh | Transisi Berikutnya | Lokasi Kode | Catatan Fungsional |
|---|---|---|---|---|
| `PENDING` | Buyer Checkout | `PAYMENT_PENDING`, `CANCELLED` | `cart.js:389`, `checkout.html:304` | Order baru dibuat, menunggu aksi admin |
| `PAYMENT_PENDING` | Admin Action | `WAITING_VERIFICATION`, `PAID_PROCESSING`, `CANCELLED` | `admin.js:500` | Admin telah mengirim nomor rekening via WA |
| `WAITING_VERIFICATION` | Admin / System | `PAID_PROCESSING`, `CANCELLED` | `admin.js:401` | Bukti bayar dikirim, menunggu dicek |
| `PAID_PROCESSING` | Admin Action | `SHIPPED`, `CANCELLED` | `admin.js:520` | Dana terkonfirmasi masuk, barang dirakit/dipak |
| `SHIPPED` | Admin Action | `DELIVERED`, `COMPLETED` | `admin.js:540` | Resi telah diinput, paket di kurir |
| `DELIVERED` | Admin Action | `COMPLETED` | `admin.js:405` | Paket diterima pembeli |
| `COMPLETED` | Admin Action | *None (Final)* | `admin.js:560` | Transaksi selesai, review diminta |
| `CANCELLED` | Admin Action | *None (Final)* | `admin.js:575` | Pesanan dibatalkan admin |

### Anomali State Machine:
1. **Status Inkonsisten**: Pada beberapa fungsi, digunakan status `PAID` secara langsung, sementara pada filter tab admin digunakan `PAID_PROCESSING`.
2. **Tidak Ada State Machine Guard**: Transisi status tidak divalidasi di backend. Admin atau user dengan REST API bisa langsung melompat dari `PENDING` ke `COMPLETED` atau dari `CANCELLED` ke `SHIPPED`.
3. **Ketiadaan Status Pembayaran Terpisah**: Status logistik (`SHIPPED`, `DELIVERED`) dicampur aduk dalam satu kolom `order_status` dengan status finansial (`PAYMENT_PENDING`, `PAID_PROCESSING`).

---

## 11. Supabase Architecture

### Tabel-Tabel di Supabase:
1. **`products`**:
   - Kolom: `id` (text/uuid, PK), `name` (text), `price` (numeric), `category` (text), `image` (text), `stock` (integer), `description` (text), `created_at` (timestamptz).
   - Masalah: Kolom `stock` tidak memiliki constraint `CHECK (stock >= 0)`.
2. **`orders`**:
   - Kolom: `order_id` (text, PK), `customer_name` (text), `customer_phone` (text), `customer_email` (text), `shipping_address` (text), `shipping_courier` (text), `items` (text), `total_amount` (numeric), `currency` (text), `order_status` (text), `tracking_number` (text), `notes` (text), `created_at` (timestamptz).
   - Masalah: Kolom `items` menyimpan plain text concatenated string, bukan data relasional.
3. **`order_items`**:
   - Didefinisikan di `supabase_security_rules.sql` baris 26-33, tetapi **sama sekali tidak digunakan oleh JavaScript frontend** saat checkout.
4. **`users`**:
   - Tabel custom metadata pengguna untuk menyimpan role (`admin` / `customer`).
5. **`reviews`**:
   - Tabel ulasan produk dengan rating bintang (1-5), nama pembeli, dan komentar.

---

## 12. RLS & Security Audit

### Evaluasi Row-Level Security:

| Tabel | Operasi | Izin Saat Ini (Setup Guide) | Izin Ideal | Risiko |
|---|---|---|---|---|
| `orders` | SELECT | `anon` dapat select semua jika RLS belum strict | Customer hanya baca order miliknya, Admin baca semua | **HIGH** |
| `orders` | INSERT | `anon` diizinkan (`WITH CHECK (true)`) | Diizinkan via RPC dengan validasi harga | **MEDIUM** |
| `orders` | UPDATE | Diizinkan di panduan awal (`USING (true)`) | **HANYA ADMIN** via role verification | **CRITICAL** |
| `orders` | DELETE | Diizinkan di panduan awal | **HANYA ADMIN** | **CRITICAL** |
| `products` | SELECT | Publik (`anon`) diizinkan | Publik diizinkan | **AMAN** |
| `products` | UPDATE | Diizinkan di panduan awal (`USING (true)`) | **HANYA ADMIN** | **CRITICAL** |
| `products` | INSERT | Diizinkan di panduan awal | **HANYA ADMIN** | **CRITICAL** |

### Evaluasi Hak Akses & Kredensial:
1. **Public Key Exposure**: `CONFIG.SUPABASE_ANON_KEY` berada di `js/config.js`. Ini adalah hal wajar untuk Supabase frontend, **asalkan RLS diaktifkan dengan benar**. Namun karena file setup menyarankan policy terbuka, siapapun bisa memanipulasi database via curl/Postman.
2. **Admin Auth Bypass**:
   - Di `js/services/authService.js` baris 315-327 dan `js/admin.js` baris 239-243:
     ```javascript
     btnSwitchToAdminNow.addEventListener('click', () => {
       loginAsAdminDirectly();
     });
     ```
     Fungsi ini menyuntikkan `{ role: 'admin', email: 'raihanputrairawan8@gmail.com' }` langsung ke `localStorage['mustaz_user_profile_data']`. Siapapun yang mengunjungi `/admin` cukup mengklik satu tombol untuk membobol seluruh hak akses dashboard Admin.

---

## 13. LocalStorage Audit

Daftar seluruh key browser storage yang digunakan:

| Storage | Key | Isi Konten | Tujuan | Status Keamanan |
|---|---|---|---|---|
| `localStorage` | `mustaz_cart` | Array JSON item di keranjang | Menyimpan item sebelum checkout | **Aman** (Standar e-commerce) |
| `localStorage` | `mustaz_currency` | String (`'IDR'` atau `'USD'`) | Menyimpan preferensi mata uang | **Aman** |
| `localStorage` | `mustaz_dynamic_parts` | Array JSON katalog produk & stok | Cache lokal produk & manipulasi stok | **BERBAHAYA**: Menjadi sumber desinkronisasi stok cloud |
| `localStorage` | `mustaz_admin_orders` | Array JSON seluruh data order | Fallback jika Supabase offline | **BERBAHAYA**: Menyimpan PII pelanggan (nama, telp, alamat) di perangkat admin |
| `localStorage` | `mustaz_orders_<email>` | Array JSON order user | Riwayat order offline pembeli | **Cukup Aman** (Lokal ke user) |
| `localStorage` | `mustaz_user_profile_data` | Object profil `{ email, role }` | Otorisasi login & role admin | **CRITICAL**: Sangat mudah dimanipulasi untuk bypass role |

---

## 14. Race Condition & Edge Case Simulations

### Case 1: Dua user membeli produk stok = 1 secara bersamaan
- **Hasil Saat Ini**: **GAGAL (Overselling)**. Kedua browser user membaca stok = 1 dari Supabase. Keduanya memanggil `createOrder()`. Supabase menyimpan kedua order karena tidak ada atomic lock di database. Stok lokal masing-masing browser berkurang jadi 0, namun toko menerima 2 pesanan untuk 1 barang fisik.

### Case 2: Admin klik `[2] VERIFIKASI LUNAS` dua kali cepat
- **Hasil Saat Ini**: Dobel eksekusi request PATCH ke Supabase dan dua popup WhatsApp terbuka sekaligus ke nomor pembeli.

### Case 3: Admin klik `[3] INPUT RESI` dua kali cepat
- **Hasil Saat Ini**: Modal prompt muncul dua kali atau dua URL tracking terkirim ganda ke chat pembeli.

### Case 4: User klik `CHECKOUT` dua kali
- **Hasil Saat Ini**: Pada `cart.js`, dua request insert ke Supabase dikirim dalam interval milidetik, menghasilkan dua order ID berbeda untuk satu transaksi yang sama.

### Case 5: Supabase berhasil menyimpan order, tetapi WhatsApp gagal dibuka (popup blocked)
- **Hasil Saat Ini**: Order tersimpan di Supabase dengan status `PENDING`, namun pembeli tidak terhubung ke chat toko. Pembeli mengira proses gagal padahal order sudah terdaftar.

### Case 6: WhatsApp terbuka, tetapi koneksi Supabase gagal
- **Hasil Saat Ini**: Sistem menyimpan order ke `localStorage` lokal pembeli dan tetap membuka WhatsApp. Admin menerima chat WA, tetapi saat admin membuka Admin Console, order tersebut **tidak ada di database**.

### Case 7: Admin kehilangan koneksi saat memverifikasi pembayaran
- **Hasil Saat Ini**: Update Supabase gagal, namun WhatsApp web pembeli mungkin sudah terlanjur terbuka dengan template "Pembayaran Anda telah kami terima". Terjadi diskrepansi status.

### Case 8: User menutup browser tepat setelah checkout
- **Hasil Saat Ini**: Database mencatat order `PENDING`. Jika email service berhasil, email terkirim, namun komunikasi WhatsApp terputus.

---

## 15. UX Problems Audit

### Perspektif Pembeli (Buyer):
1. **Ketidakjelasan Status Pembayaran Awal**: Setelah submit, pembeli langsung dilempar ke WhatsApp tanpa melihat layar konfirmasi/invoice di website yang memuat nomor rekening resmi.
2. **Ketergantungan Total pada Chat**: Pembeli tidak memiliki halaman tracking visual real-time mandiri (hanya bisa cek jika login akun Supabase di modal profile).
3. **Kebingungan Dua Mode Checkout**: Adanya modal drawer checkout di `index.html` dan halaman checkout mandiri di `checkout.html` membuat perilaku aplikasi tidak konsisten.

### Perspektif Admin:
1. **Manual WhatsApp Overhead**: Admin harus mengklik tombol dan mengirim pesan WhatsApp satu per satu di setiap perubahan fase status pesanan.
2. **Potensi Salah Kirim Pesan**: Jika template nomor rekening di `whatsappCsService.js` masih berisi rekening dummy, admin secara tidak sengaja mengirim rekening palsu ke pelanggan nyata.
3. **Data Order Tidak Terstruktur**: Item pesanan yang disimpan berupa teks gabungan (`"Item A (x1), Item B (x2)"`) menyulitkan admin dalam membaca varian secara terpisah dan menghalangi pelaporan analitik otomatis.

---

## 16. Critical Problems (Severity: CRITICAL)

1. **CRIT-01: Admin Authentication Bypass via LocalStorage**
   - **Kondisi**: Tombol `#btnSwitchToAdminNow` di `js/admin.js` dan fungsi `loginAsAdminDirectly()` di `js/authService.js` memberikan akses admin instan tanpa verifikasi password atau token Supabase.
   - **Dampak**: Siapapun dapat mengakses dashboard admin, menghapus produk, dan memanipulasi data pesanan pelanggan.
2. **CRIT-02: Client-Side Price & Total Calculation Manipulation**
   - **Kondisi**: Total harga dihitung murni di browser (`cartService.getCartTotal()`) dan diterima mentah-mentah oleh Supabase `orders.total_amount`.
   - **Dampak**: Penyerang dapat membeli produk bernilai jutaan rupiah dengan harga Rp 1.000 dengan mengedit memori browser sebelum checkout.
3. **CRIT-03: Permissive Row-Level Security (RLS) pada Tabel Orders & Products**
   - **Kondisi**: Sesuai panduan `SUPABASE_SETUP.md`, policy dibuat dengan `FOR ALL USING (true)`.
   - **Dampak**: Pengguna publik dengan Anon Key dapat melakukan HTTP PATCH atau DELETE pada data order dan katalog produk.
4. **CRIT-04: Desinkronisasi Total Stok Cloud (Client-Only Stock Deduction)**
   - **Kondisi**: `cartService.deductProductStock()` hanya memotong stok pada `localStorage['mustaz_dynamic_parts']` dan tidak pernah memperbarui tabel `products` di Supabase.
   - **Dampak**: Stok di database cloud tidak pernah berkurang saat terjadi transaksi checkout.

---

## 17. High Priority Problems (Severity: HIGH)

1. **HIGH-01: Stock Race Condition & Ketiadaan Atomic Lock**
   - Tidak ada transaksi atomik di database (`UPDATE products SET stock = stock - qty WHERE stock >= qty`). Dua user dapat membeli stok terakhir secara bersamaan.
2. **HIGH-02: Ketiadaan Stock Rollback pada Pembatalan Order**
   - Ketika pesanan dibatalkan (`CANCELLED`) oleh admin, stok barang tidak pernah dikembalikan ke inventori.
3. **HIGH-03: Bukti Pembayaran Tidak Tersimpan di Supabase Storage**
   - Bukti bayar hanya mengandalkan screenshot chat WhatsApp atau base64 di localStorage, tanpa bucket storage terstruktur (`payment-proofs`) dengan URL terverifikasi.
4. **HIGH-04: Dobel Submit pada Checkout Modal (`cart.js`)**
   - Tombol checkout tidak mengimplementasikan lock idempotency yang ketat saat in-flight network request, memungkinkan duplikasi order saat koneksi lambat.
5. **HIGH-05: Struktur Data Order Denormalized (`orders.items` Plain Text)**
   - Item pesanan disimpan sebagai string gabungan dan tidak memanfaatkan tabel `order_items`. Hal ini merusak integritas foreign key dan menyulitkan audit keuangan.
6. **HIGH-06: Dual Source of Truth (LocalStorage vs. Supabase)**
   - Logika sinkronisasi sering membaca data dari localStorage jika Supabase lambat, menyebabkan perbedaan data antar browser admin dan pembeli.

---

## 18. Medium Priority Problems (Severity: MEDIUM)

1. **MED-01: Rekening Bank Placeholder pada Template WhatsApp CS**
   - Template di `whatsappCsService.js` menggunakan nomor rekening palsu (`BCA 123-456-7890`) yang berisiko terkirim ke customer.
2. **MED-02: Hardcoded Ongkos Kirim (Flat Rate di Client)**
   - Biaya kurir di-hardcode di script frontend tanpa validasi wilayah berat paket.
3. **MED-03: Ketiadaan Auto-Expiry untuk Pesanan Pending**
   - Pesanan `PENDING` yang tidak dibayar oleh pelanggan akan menggantung selamanya di dashboard admin.
4. **MED-04: Ekpos Data PII Pelanggan di LocalStorage Admin**
   - `mustaz_admin_orders` menyimpan data sensitif pelanggan (nomor telepon, alamat) di penyimpanan browser lokal tanpa enkripsi.
5. **MED-05: Duplikasi Alur Checkout (`cart.js` modal vs. `checkout.html`)**
   - Terdapat dua implementasi checkout terpisah dengan validasi dan tata letak yang berbeda, menyulitkan pemeliharaan kode.
6. **MED-06: Validasi Nomor Telepon Terbatas di Frontend**
   - Validasi format WhatsApp hanya memeriksa digit awal tanpa pengecekan panjang minimal atau karakter internasional yang valid.

---

## 19. Low Priority Problems (Severity: LOW)

1. **LOW-01: Dead Code / Legacy Sample Data**
   - `apiService.js` masih memuat data mock toko pakaian (`SAMPLE_PRODUCTS` hoodie & cargo pants) yang tidak relevan dengan katalog Gunpla/Craft.
2. **LOW-02: Ketiadaan Format Standar Resi Ekspedisi**
   - Input nomor resi di admin berupa prompt teks bebas tanpa validasi format kurir (misal format JNE / J&T).
3. **LOW-03: Banner & Flash Sale Timer Drift**
   - Timer flash sale mengandalkan jam lokal browser perangkat pengguna, bukan timestamp sinkron dari server.
4. **LOW-04: Penggunaan `window.open` Rentan Popup Blocker**
   - Pemanggilan `window.open(whatsappUrl)` setelah operasi asinkron `await` sering diblokir oleh fitur anti-popup browser modern (iOS Safari & Chrome Mobile).

---

## 20. Recommended Target Architecture

Arsitektur target harus memindahkan Supabase sebagai **Single Source of Truth** yang memiliki logika validasi atomik, sementara WhatsApp dan Email murni bertindak sebagai **Notification / Communication Channel**.

```text
                     +---------------------------------------+
                     |           BROWSER PEMBELI             |
                     |  - Memilih Produk & Varian            |
                     |  - Mengisi Alamat Pengiriman          |
                     +-------------------+-------------------+
                                         |
                                         | (Kirim Keranjang & Data Pembeli)
                                         v
                     +---------------------------------------+
                     |        SUPABASE STORED PROCEDURE      |
                     |             (RPC: submit_order)       |
                     |  1. Kunci Baris Produk (FOR UPDATE)   |
                     |  2. Re-kalkulasi Harga Resmi dari DB  |
                     |  3. Validasi & Kurangi Stok Atomik    |
                     |  4. Insert ke 'orders' & 'order_items'|
                     +-------------------+-------------------+
                                         |
                         +---------------+---------------+
                         |                               |
                         v                               v
         +-------------------------------+ +-------------------------------+
         |     RESPONSE ORDER RESMI      | |       DATABASE WEBHOOK        |
         |  - Order ID Unik              | |  - Memicu Vercel Serverless   |
         |  - Total Harga Terverifikasi  | |  - Kirim Email Invoice Resend |
         +---------------+---------------+ +-------------------------------+
                         |
                         | (Redirect dengan Parameter Terverifikasi)
                         v
         +-------------------------------+
         |         WHATSAPP CS           |
         |  - Pembeli Konfirmasi Order   |
         |  - Admin Verifikasi Pembayaran|
         +-------------------------------+
```

---

## 21. Recommended State Machine

Pemisahan yang tegas antara **Payment State** dan **Fulfillment State**:

```text
                  [ PENDING_PAYMENT ]
                           |
           +---------------+---------------+
           |                               | (Customer konfirmasi bayar)
           v                               v
      [ EXPIRED ]                 [ PAYMENT_REVIEW ]
      (Stok kembali)                       |
                           +---------------+---------------+
                           |                               | (Admin verifikasi)
                           v                               v
                   [ PAYMENT_FAILED ]              [ PAYMENT_CONFIRMED ]
                                                           |
                                                           v
                                                     [ PROCESSING ]
                                                           |
                                                           v
                                                   [ READY_TO_SHIP ]
                                                           |
                                                           v
                                                      [ SHIPPED ]
                                                           |
                                                           v
                                                     [ DELIVERED ]
                                                           |
                                                           v
                                                     [ COMPLETED ]
```

---

## 22. Recommended Admin Contextual Actions

Untuk mengeliminasi tombol yang salah pada status pesanan:

| Status Pesanan | Aksi Kontekstual yang Tersedia | Dampak Sistem |
|---|---|---|
| `PENDING_PAYMENT` | `[Kirim Instruksi Rekening]` atau `[Batalkan Pesanan]` | Buka WA tagihan / kembalikan stok |
| `PAYMENT_REVIEW` | `[Lihat Bukti Bayar]`, `[Verifikasi Lunas]`, `[Tolak Bukti]` | Update status lunas & pindah ke processing |
| `PROCESSING` | `[Selesai Packing & Cetak Label]` | Status beralih ke `READY_TO_SHIP` |
| `READY_TO_SHIP` | `[Input Nomor Resi]` | Simpan resi, status jadi `SHIPPED`, kirim WA tracking |
| `SHIPPED` | `[Cek Status Kurir]`, `[Tandai Diterima]` | Update ke `DELIVERED` |
| `DELIVERED` | `[Kirim Permintaan Review & Testimoni]` | Buka WA review, status jadi `COMPLETED` |
| `COMPLETED` | *Hanya Read-Only (Cetak Invoice)* | Tidak ada aksi transaksi |
| `CANCELLED` | *Hanya Read-Only* | Riwayat tersimpan, stok telah di-rollback |

---

## 23. Recommended Database Changes

1. **Aktifkan Constraint Stok & Relasi**:
   ```sql
   ALTER TABLE products ADD CONSTRAINT check_stock_positive CHECK (stock >= 0);
   ```
2. **Normalisasi Tabel `order_items`**:
   Gunakan tabel `order_items` secara penuh dengan foreign key ke `products(id)` dan `orders(order_id)`.
3. **Database Function Atomic Checkout (RPC)**:
   Buat procedure `create_order_securely` di Supabase untuk mengunci baris produk, menghitung ulang total harga secara server-side, mengurangi stok, dan membuat order dalam satu transaksi database (`BEGIN ... COMMIT`).
4. **Supabase Storage Bucket**:
   Buat bucket `payment-proofs` dengan akses privat, hanya dapat dibaca oleh role `admin` dan pembeli pemilik pesanan.

---

## 24. Recommended Security Changes

1. **Hapus Seluruh Bypass Admin**:
   - Hapus tombol `#btnSwitchToAdminNow` dan fungsi `loginAsAdminDirectly()`.
   - Ubah `verifyAdminSession()` agar memverifikasi token JWT Supabase langsung ke `supabase.auth.getUser()`, bukan membaca role dari `localStorage`.
2. **Kunci RLS Table Orders**:
   - `INSERT`: Hanya izinkan insert order baru dengan status `PENDING_PAYMENT`.
   - `UPDATE`: Hanya role `admin` yang dapat mengupdate `order_status`, `payment_status`, dan `tracking_number`.
   - `SELECT`: Pengguna publik hanya dapat melihat order milik mereka sendiri (berdasarkan session email/auth) atau menggunakan secret order token.
3. **Validasi Server-Side**:
   - Pastikan serverless backend atau RPC Supabase memvalidasi seluruh input harga, diskon kupon, dan tarif pengiriman.

---

## 25. Migration Plan

Rencana migrasi bertahap tanpa downtime (*zero-downtime migration*):

- **Fase 1: Penutupan Celah Keamanan Kritis (Security Hotfix)**
  - Hapus tombol bypass admin di `admin.js` dan amankan otorisasi admin via Supabase JWT.
  - Perbaiki RLS policies di Supabase agar publik tidak bisa mengupdate atau menghapus data order/produk.
  - Masukkan nomor rekening resmi toko ke `whatsappCsService.js`.
- **Fase 2: Integritas Inventori & Harga Server-Side**
  - Buat RPC `submit_order_secure` di Supabase untuk kalkulasi harga resmi dan pemotongan stok atomik.
  - Hubungkan pemotongan stok langsung ke tabel `products` Supabase, bukan lagi `localStorage`.
  - Tambahkan fungsi rollback stok saat admin menekan `[Batalkan Pesanan]`.
- **Fase 3: Refaktor Alur Checkout & Normalisasi Data**
  - Satukan alur checkout ke satu modal/halaman tunggal yang konsisten.
  - Simpan item pesanan ke tabel relasional `order_items`.
  - Pasang guard pencegah dobel klik (*idempotency key*) pada tombol submit checkout.
- **Fase 4: Peningkatan UX Admin & Bukti Bayar**
  - Implementasikan tombol aksi kontekstual sesuai status pada Admin Dashboard.
  - Sediakan upload bukti bayar langsung ke Supabase Storage.

---

## 26. Testing Plan

Pengujian menyeluruh yang wajib dilakukan setelah perbaikan:

1. **Security & Role Verification Test**:
   - Buka `/admin` dalam mode incognito tanpa login -> Pastikan tidak ada celah untuk masuk atau melihat data pesanan.
   - Coba lakukan update HTTP PATCH ke tabel `orders` menggunakan Anon Key -> Pastikan Supabase mengembalikan error `403 Forbidden` (RLS Violations).
2. **Price Manipulation Exploit Test**:
   - Ubah harga item di `localStorage['mustaz_cart']` menjadi Rp 100 sebelum checkout -> Pastikan server menolak atau otomatis menghitung ulang sesuai harga resmi di tabel `products`.
3. **Concurrent Inventory Race Condition Test**:
   - Set stok produk = 1. Buka 2 tab browser berbeda. Lakukan checkout bersamaan -> Pastikan hanya 1 user yang berhasil dan user kedua mendapatkan pesan "Stok tidak mencukupi".
4. **Stock Rollback Test**:
   - Buat pesanan baru -> Verifikasi stok di Supabase berkurang.
   - Masuk ke Admin -> Batalkan pesanan -> Verifikasi stok di Supabase bertambah kembali.
5. **WhatsApp CS Flow Validation**:
   - Lakukan order pengujian -> Pastikan pesan WA terarah ke nomor admin resmi dengan format yang benar.
   - Klik aksi admin Fase 1 sampai 4 -> Pastikan pesan terarah ke nomor pembeli dengan nomor rekening dan data resi yang valid.
