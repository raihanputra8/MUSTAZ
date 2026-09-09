# ⚡ PANDUAN OPERASIONAL ADMIN — MUSTAZ CRAFT

## Admin Dashboard Control Console

> Dokumen ini menjelaskan cara lengkap mengoperasikan Dashboard Admin MUSTAZ CRAFT,
> mulai dari cara masuk, mengelola produk, memproses pesanan, moderasi ulasan, hingga mengatur Flash Sale.

---

## 📑 DAFTAR ISI

1. [Cara Masuk ke Halaman Admin](#1-cara-masuk-ke-halaman-admin)
2. [Tampilan Dashboard & Statistik](#2-tampilan-dashboard--statistik)
3. [PRODUCT INVENTORY — Kelola Stok Produk](#3-product-inventory--kelola-stok-produk)
4. [ADD NEW PRODUCT — Tambah Produk Baru](#4-add-new-product--tambah-produk-baru)
5. [CUSTOMER ORDERS — Kelola Pesanan Masuk](#5-customer-orders--kelola-pesanan-masuk)
6. [TESTIMONI & ULASAN — Moderasi Review](#6-testimoni--ulasan--moderasi-review)
7. [⚡ FLASH SALE MANAGER — Atur Promo Kilat](#7-flash-sale-manager--atur-promo-kilat)
8. [Tips & Troubleshooting](#8-tips--troubleshooting)

---

## 1. Cara Masuk ke Halaman Admin

### Langkah Login:

1. Buka browser dan akses halaman login:
   ```
   https://mustazbuildtest.vercel.app/login.html
   ```
2. Masukkan **Email Admin** dan **Password** yang sudah terdaftar.
3. Klik tombol **LOGIN**.
4. Setelah login berhasil, sistem otomatis mengarahkan ke:
   ```
   https://mustazbuildtest.vercel.app/admin.html
   ```

### Cara Langsung Akses Admin:

Jika sudah login sebelumnya, langsung buka `/admin.html` atau klik menu **ADMIN** di navigation bar (hanya muncul untuk akun admin).

> ⚠️ **Jika muncul layar "AREA KHUSUS ADMINISTRATOR":**
> Artinya kamu sedang login dengan akun biasa (bukan admin).
> Klik **LOG OUT DARI AKUN INI**, lalu login ulang dengan email admin.

---

## 2. Tampilan Dashboard & Statistik

Setelah berhasil masuk, halaman admin menampilkan **Header Statistik Cepat**:

| Indikator           | Keterangan                                       |
| :------------------ | :----------------------------------------------- |
| 🟡 **TOTAL VISORS** | Jumlah total produk yang terdaftar di katalog    |
| 🟢 **READY STOCK**  | Total unit produk yang masih tersedia            |
| 🔴 **LOW STOCK**    | Jumlah produk dengan stok rendah (perlu restock) |
| 🟡 **TOTAL ASSET**  | Estimasi total nilai inventaris (stok × harga)   |

### Sidebar Menu Navigasi:

| Tab                       | Fungsi                         |
| :------------------------ | :----------------------------- |
| 📦 **PRODUCT INVENTORY**  | Lihat & kelola semua produk    |
| ➕ **ADD NEW PRODUCT**    | Tambah produk baru ke katalog  |
| 🧾 **CUSTOMER ORDERS**    | Lihat & proses pesanan masuk   |
| ⭐ **TESTIMONI & ULASAN** | Moderasi ulasan pembeli        |
| ⚡ **FLASH SALE MANAGER** | Atur promosi & countdown timer |
| 🔗 **VIEW LIVE STORE ↗**  | Buka toko langsung di tab baru |
| 🚪 **LOG OUT**            | Keluar dari akun admin         |

---

## 3. PRODUCT INVENTORY — Kelola Stok Produk

Klik tab **PRODUCT INVENTORY** di sidebar.

### Kolom Tabel Produk:

| Kolom              | Keterangan                                    |
| :----------------- | :-------------------------------------------- |
| **THUMB**          | Foto produk (thumbnail)                       |
| **PRODUCT & SLUG** | Nama produk + URL identifier                  |
| **CATEGORY**       | Jenis produk (Acrylic Pet, Leather Pet, dst.) |
| **PRICE**          | Harga jual dalam Rupiah (IDR)                 |
| **STOCK LEVEL**    | Jumlah unit tersisa (merah = low stock)       |
| **STATUS**         | ACTIVE = tampil di toko / DRAFT = tersembunyi |
| **ACTIONS**        | Tombol Edit & Delete                          |

### Filter & Pencarian:

- **Search Box** → Ketik nama produk, slug, atau SKU.
- **ALL CATEGORIES** → Filter: Acrylic Pet, Leather Pet, Retro Visor, Drop Sets, Custom Helmet.
- **ALL STATUS** → Filter produk ACTIVE atau DRAFT.
- **SORT** → Urutkan: Terbaru, Nama A-Z, Harga, atau Stok Terendah.

### Sinkronisasi Data:

Klik **🔄 SYNC SUPABASE** untuk memperbarui data dari database cloud secara manual.

### Edit Produk:

1. Klik tombol ✏️ **EDIT** pada baris produk yang ingin diubah.
2. Form edit muncul dengan data produk saat ini.
3. Ubah field yang diperlukan, lalu klik **SAVE CHANGES**.

### Hapus Produk:

1. Klik tombol 🗑️ **DELETE** pada baris produk.
2. Konfirmasi dialog — klik **OK/HAPUS** untuk melanjutkan.

> ⚠️ **Produk yang dihapus tidak bisa dikembalikan. Pastikan yakin sebelum menghapus.**

---

## 4. ADD NEW PRODUCT — Tambah Produk Baru

Klik tab **+ ADD NEW PRODUCT** di sidebar.

### Form Produk Baru:

| Field                          | Keterangan                                    | Contoh                                     |
| :----------------------------- | :-------------------------------------------- | :----------------------------------------- |
| **PRODUCT NAME** _(wajib)_     | Nama produk lengkap                           | `ACID GHOST ROOF VISOR`                    |
| **SLUG / URL** _(wajib)_       | Identifier URL (huruf kecil, pakai tanda `-`) | `acid-ghost-roof-visor`                    |
| **CATEGORY** _(wajib)_         | Jenis produk                                  | `Acrylic Pet`                              |
| **STATUS** _(wajib)_           | ACTIVE agar langsung tampil di toko           | `ACTIVE (LIVE)`                            |
| **BADGE**                      | Label promosi di kartu produk                 | `NEW`, `HOT DROP`, `BESTSELLER`, `LIMITED` |
| **SUBTITLE / SPECS** _(wajib)_ | Deskripsi singkat spesifikasi                 | `Acid Neon Acrylic // 3-Snap Universal`    |
| **PRICE (IDR)** _(wajib)_      | Harga jual normal                             | `350000`                                   |
| **ORIGINAL PRICE**             | Harga coret jika ada diskon (opsional)        | `450000`                                   |
| **STOCK QTY** _(wajib)_        | Jumlah unit tersedia                          | `10`                                       |

### Upload Foto Produk:

1. Scroll ke bagian **ASSET CHOOSER**.
2. Pilih metode:
   - **Upload File** → Pilih gambar dari komputer (JPG/PNG/WEBP).
   - **URL Gambar** → Masukkan link langsung dari Supabase Storage.
3. Preview foto muncul setelah dipilih.

### Simpan Produk Baru:

1. Pastikan semua field `*` sudah terisi.
2. Klik **➕ PUBLISH VISOR TO CATALOG**.
3. Produk otomatis muncul di toko jika status `ACTIVE`.

> 💡 **Tips:** Gunakan `DRAFT` dulu jika produk belum siap dijual. Ubah ke `ACTIVE` kapan saja dari tabel Inventory.

---

## 5. CUSTOMER ORDERS — Kelola Pesanan Masuk

Klik tab **CUSTOMER ORDERS** di sidebar.

### Kolom Tabel Pesanan:

| Kolom                      | Keterangan                                      |
| :------------------------- | :---------------------------------------------- |
| **ORDER ID**               | ID unik pesanan (format: `#MSTZ-XXXX`)          |
| **CUSTOMER & ALAMAT**      | Nama pembeli, nomor WhatsApp, alamat pengiriman |
| **ITEMS & SPECS**          | Daftar produk yang dipesan                      |
| **TOTAL TAGIHAN**          | Total pembayaran yang harus dibayar             |
| **BUKTI BAYAR**            | Status bukti pembayaran                         |
| **STATUS**                 | Status pesanan saat ini                         |
| **AKSI CEPAT CS WHATSAPP** | Tombol 1-klik kirim pesan via WhatsApp          |

### Status Pesanan:

| Status           | Artinya                                       |
| :--------------- | :-------------------------------------------- |
| 🟡 **PENDING**   | Pesanan masuk, menunggu konfirmasi pembayaran |
| 🔵 **CONFIRMED** | Pembayaran terkonfirmasi, siap diproses       |
| 🟢 **SHIPPED**   | Produk sudah dikirim (ada nomor resi)         |
| ✅ **COMPLETED** | Pesanan selesai, produk diterima pembeli      |
| 🔴 **CANCELLED** | Pesanan dibatalkan                            |

### Proses Pesanan via WhatsApp:

1. Klik tombol **WhatsApp CS** pada baris pesanan.
2. WhatsApp Web / App otomatis terbuka dengan pesan terstruktur berisi:
   - Nama pembeli, produk yang dipesan, total tagihan, dan nomor rekening.
3. Kirim pesan ke pembeli untuk konfirmasi atau update pengiriman.

### Filter Pesanan:

- **Search Box** → Cari berdasarkan ID `#MSTZ-`, nama pembeli, atau nama produk.
- **Tab Filter** → Filter per status: SEMUA, PENDING, CONFIRMED, SHIPPED, COMPLETED.

---

## 6. TESTIMONI & ULASAN — Moderasi Review

Klik tab **TESTIMONI & ULASAN** di sidebar.

### Kolom Tabel Ulasan:

| Kolom              | Keterangan                           |
| :----------------- | :----------------------------------- |
| **RIDER / USER**   | Nama pengguna yang memberikan ulasan |
| **PRODUK & ORDER** | Produk yang diulas                   |
| **RATING**         | Bintang 1–5                          |
| **ULASAN**         | Isi teks ulasan pembeli              |
| **STATUS**         | PENDING / APPROVED / REJECTED        |
| **MODERASI**       | Tombol approve/reject                |

### Cara Moderasi:

- Klik ✅ **APPROVE** → Ulasan tampil di halaman toko.
- Klik ❌ **REJECT** → Ulasan disembunyikan dari toko.

> 💡 Hanya ulasan **APPROVED** yang ditampilkan di homepage dan halaman testimoni publik.

Klik **REFRESH DATA ↻** untuk memuat ulasan terbaru dari database.

---

## 7. ⚡ FLASH SALE MANAGER — Atur Promo Kilat

Klik tab **⚡ FLASH SALE MANAGER** di sidebar.

---

### 7.1 — JADWAL COUNTDOWN TIMER (Banner Homepage)

Mengatur tampilan banner Flash Sale di halaman utama toko.

| Field                     | Keterangan                                    |
| :------------------------ | :-------------------------------------------- |
| **JUDUL CAMPAIGN**        | Judul besar banner promo (`LIMITED DISPATCH`) |
| **SUBTITLE / KETERANGAN** | Teks deskripsi promo                          |
| **WAKTU MULAI**           | Tanggal & jam dimulainya flash sale           |
| **WAKTU BERAKHIR**        | Tanggal & jam berakhirnya flash sale          |
| **STATUS AKTIF**          | Centang = Flash Sale ON di homepage           |

**Cara Mengaktifkan Flash Sale:**

1. Isi semua field.
2. Centang checkbox **STATUS FLASH SALE AKTIF DI HOME**.
3. Klik **💾 SIMPAN JADWAL COUNTDOWN**.
4. Buka halaman utama toko untuk verifikasi countdown berjalan.

**Cara Menonaktifkan Flash Sale:**

1. Hapus centang pada **STATUS FLASH SALE AKTIF DI HOME**.
2. Klik **💾 SIMPAN JADWAL COUNTDOWN**.

---

### 7.2 — DAFTARKAN PRODUK PROMO

Mendaftarkan produk dengan harga diskon khusus selama Flash Sale.

| Field               | Keterangan                               |
| :------------------ | :--------------------------------------- |
| **PILIH PRODUK**    | Dropdown semua produk aktif              |
| **HARGA DISKON**    | Harga spesial selama flash sale (IDR)    |
| **STOK FLASH SALE** | Kuota unit yang dialokasikan untuk promo |

**Cara Daftarkan Produk:**

1. Pilih produk dari dropdown.
2. Masukkan harga diskon dan kuota stok.
3. Klik **➕ TAMBAHKAN KE FLASH SALE**.

**Cara Hapus dari Flash Sale:**

- Klik **❌ REMOVE** pada baris produk di daftar Flash Sale.

---

## 8. Tips & Troubleshooting

| Masalah                          | Solusi                                                                     |
| :------------------------------- | :------------------------------------------------------------------------- |
| Tabel produk kosong              | Klik **SYNC SUPABASE**, pastikan internet stabil, refresh halaman          |
| Tab sidebar tidak bisa diklik    | Refresh halaman (`F5`), cek browser Console (`F12`) untuk error            |
| Produk baru tidak muncul di toko | Pastikan status `ACTIVE`, klik SYNC SUPABASE, buka toko di tab baru        |
| Ubah stok cepat                  | Edit produk → ubah **STOCK QTY** → SAVE CHANGES                            |
| Sembunyikan produk tanpa hapus   | Edit produk → ubah STATUS ke `DRAFT (HIDDEN)` → SAVE CHANGES               |
| Lupa password admin              | Gunakan fitur "Lupa Password" di halaman login, atau minta developer reset |

---

## 🔒 Catatan Keamanan

- **Jangan bagikan** email & password admin ke siapapun yang tidak berwenang.
- Selalu **LOG OUT** setelah selesai, terutama jika menggunakan perangkat bersama.
- Untuk menambah akun admin baru, hubungi developer untuk mendaftarkan email ke whitelist.

---

> 📞 **Butuh bantuan teknis?** Hubungi developer
> 🌐 **Live Store:** https://mustazbuildtest.vercel.app
> 🛠️ **Admin Panel:** https://mustazbuildtest.vercel.app/admin.html
