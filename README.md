# 🚀 Modern Web Dev Starter (Figma Hand-off Ready)

Struktur proyek web ini dirancang khusus agar **siap diintegrasikan dengan cepat ketika desain UI dari Figma selesai**.

---

## 📁 Folder Structure & Blueprint

```text
MUSTAZ WEB DEV/
├── index.html                  # Entry page dengan HTML5 semantik & preview komponen
├── assets/                     # Folder Aset Statis
│   ├── images/                 # Gambar (banner, foto, logo)
│   ├── icons/                  # SVG Icons & Favicon
│   └── fonts/                  # Font lokal (jika tidak memakai Google Fonts)
├── css/                        # Arsitektur CSS Modular (Design System)
│   ├── variables.css           # 🎨 Design Tokens (Colors, Typography, Spacing, Shadows)
│   ├── base.css                # Global CSS Reset & Typography
│   ├── layout.css              # Container, Header, Navbar, Footer, Grid System
│   ├── components.css          # UI Components (Buttons, Cards, Inputs, Modals, Skeleton)
│   └── main.css                # Master CSS file yang mengimpor seluruh modul CSS
├── js/                         # JavaScript Modules (ES6 Modules)
│   ├── config.js               # Konfigurasi aplikasi & konstanta API
│   ├── components/             # Logika komponen (Navbar, Modal, Switcher)
│   │   ├── navbar.js
│   │   └── modal.js
│   ├── utils/                  # Helper functions (DOM selectors, formatters)
│   │   └── helpers.js
│   └── app.js                  # Entry point JavaScript
├── README.md                   # Panduan integrasi Figma
└── .gitignore                  # Konfigurasi Git ignore
```

---

## 🎨 Langkah Sync Saat Desain Figma Jadi

1. **Update Design Tokens (`css/variables.css`)**
   - Copy nilai warna (Hex/RGBA), ukuran font, line-height, spacing, border-radius, dan shadow dari inspect panel Figma ke variabel `:root`.
2. **Export Asset Ke `assets/`**
   - Save ikon SVG ke `assets/icons/`.
   - Save foto/ilustrasi WebP/PNG ke `assets/images/`.
3. **Penerapan Layout & Komponen**
   - Sesuaikan struktur HTML di `index.html` menggunakan kelas komponen yang tersedia (`.card`, `.btn`, `.form-input`, `.grid`).
4. **Logika Interaktif**
   - Buat modul JavaScript baru di `js/components/` jika terdapat interaksi baru (carousel, accordion, drawer, dll).

---

## 🌐 Cara Menjalankan secara Lokal

Anda bisa langsung membuka `index.html` di browser atau menggunakan **Live Server** (VS Code / `npx serve`):

```bash
npx serve .
```
