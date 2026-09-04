const fs = require("fs");

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: PAGE HEAD
// ─────────────────────────────────────────────────────────────────────────────
function pageHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | MUSTAZ CRAFT</title>
  
  <!-- Google Fonts: Editorial Brutalist Grotesk & Headings -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chivo:wght@700;800;900&family=Hanken+Grotesk:wght@400;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  
  <!-- Master Stylesheet (Variables, Base, Layout, Components, Ecommerce) -->
  <link rel="stylesheet" href="css/main.css">
  
  <!-- Supabase JS Client -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: HEADER & NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
function sharedHeader(activeKey) {
  const navItems = [
    { href: 'index.html', key: 'home', label: 'HOME' },
    { href: 'parts.html', key: 'product', label: 'PRODUCT' },
    { href: 'account.html', key: 'account', label: 'ACCOUNT' },
    { href: 'kulture.html', key: 'about', label: 'ABOUT' }
  ];

  return `
<header class="site-header">
  <div class="site-header-inner">
    <!-- Brand Logo: Official MUSTAZ CRAFT Identity -->
    <a href="index.html" class="brand-badge">
      <img src="assets/images/mustaz_logo_official.png" alt="MUSTAZ CRAFT Logo" class="brand-logo-img">
      <div class="brand-text-block">
        <span class="brand-name" style="font-family:var(--font-headline);font-size:1.35rem;font-weight:900;letter-spacing:0.06em;color:#FFF;line-height:1;">
          CRAFT
        </span>
        <span class="brand-sub" style="color:var(--accent-yellow);font-weight:800;font-size:0.65rem;letter-spacing:0.16em;">
          PET HELM // VISORS
        </span>
      </div>
    </a>

    <!-- Desktop Navigation -->
    <nav class="nav-menu">
      ${navItems.map(item => `
        <a href="${item.href}" class="nav-link ${activeKey === item.key ? 'active' : ''}">
          ${item.label}
        </a>
      `).join('')}
    </nav>

    <!-- Nav Controls (Search, Account, Cart, Mobile Menu) -->
    <div class="nav-actions">
      <button class="nav-btn-icon" id="headerSearchBtn" aria-label="Search visors" title="Search Pet Helm">
        <span class="material-symbols-outlined">search</span>
      </button>
      
      <a href="account.html" class="nav-btn-icon" aria-label="My Account" title="My Account">
        <span class="material-symbols-outlined">person</span>
      </a>

      <button class="nav-cart-btn" id="headerCartBtn" data-open-cart aria-label="Open Cart" title="View Arsenal">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="cart-label">CART</span>
        <span class="cart-count-badge mustaz-cart-badge" id="headerCartBadge">0</span>
      </button>

      <button class="mobile-menu-toggle" id="mobileMenuBtn" aria-label="Toggle Navigation">
        <span class="material-symbols-outlined" id="hamburgerIcon">menu</span>
      </button>
    </div>
  </div>
</header>

<!-- Mobile Navigation Drawer -->
<div class="mobile-nav-drawer" id="mobileNavDrawer">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--accent-pink);">
    <span class="zine-tag-yellow">PET HELM DIRECTORY</span>
    <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">ISSUE 04</span>
  </div>
  ${navItems.map(item => `
    <a href="${item.href}" class="mobile-nav-link ${activeKey === item.key ? 'active' : ''}">
      ${item.label}
      <span class="material-symbols-outlined">arrow_forward</span>
    </a>
  `).join('')}
  <div style="margin-top:auto;padding-top:20px;border-top:1px dashed #333;display:flex;justify-content:space-between;align-items:center;">
    <span class="barcode-decor" style="height:24px;width:110px;"></span>
    <a href="login.html" style="color:var(--accent-pink);font-family:var(--font-headline);font-size:1.1rem;text-transform:uppercase;">
      MEMBER LOGIN →
    </a>
  </div>
</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: MARQUEE RUNNER STRIP
// ─────────────────────────────────────────────────────────────────────────────
function sharedMarquee() {
  const slogans = [
    'MUSTAZ CRAFT // KUSTOM PET',
    'ACID YELLOW',
    'Y-TWO ROOF VISOR',
    'HOT PINK & DIRTY OIL',
    'KUSTOM HELMET ACCESSORIES',
    '3-SNAP RETRO PEAKS',
    'STUDDED LEATHER',
    'NO FACTORY STERILITY',
    'UNDERGROUND HELMET KULTURE',
    'HAND CRAFTED IN INDONESIA',
    'SERIES 01 RUN'
  ];
  const items = [...slogans, ...slogans, ...slogans, ...slogans];
  return `
<div class="marquee-bar">
  <div class="marquee-content">
    ${items.map(s => `<span class="marquee-item">★ ${s}</span>`).join('')}
  </div>
</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function sharedFooter() {
  return `
<!-- Newsletter & Underground Manifesto -->
<div class="footer-manifesto">
  <div class="wrap-tight">
    <div style="display:inline-block;margin-bottom:12px;">
      <span class="zine-tag-pink">COMMS FREQUENCY</span>
    </div>
    <h2 class="editorial-title" style="font-size:clamp(2.5rem, 5.5vw, 4.5rem);margin-bottom:12px;">
      JOIN THE UNDERGROUND
    </h2>
    <p style="max-width:540px;margin:0 auto 28px;color:#A0A0A0;font-size:1rem;line-height:1.6;">
      Drop your comms line below. We only send dispatch intel on new builds, limited hardware drops, and garage parties. No spam. Pure combustion.
    </p>
    <form class="newsletter-form" id="newsletterForm" style="display:flex;gap:12px;justify-content:center;max-width:500px;margin:0 auto;flex-wrap:wrap;">
      <input type="email" class="form-input-brutal" placeholder="ENTER YOUR EMAIL FREQUENCY..." required style="flex:1;min-width:260px;">
      <button type="submit" class="btn-brutal-pink">SUBSCRIBE →</button>
    </form>
  </div>
</div>

<!-- Bottom Footer Bar -->
<footer class="footer-bottom">
  <div class="wrap">
    <div class="footer-bottom-inner">
      <div style="display:flex;align-items:center;gap:16px;">
        <a href="index.html" class="brand-badge">
          <img src="assets/images/mustaz_logo_official.png" alt="MUSTAZ CRAFT Logo" style="height:36px;width:auto;object-fit:contain;">
        </a>
        <span class="barcode-decor" style="height:20px;width:90px;"></span>
      </div>

      <nav class="footer-links">
        <a href="index.html" class="footer-link">HOME</a>
        <a href="parts.html" class="footer-link">PRODUCT</a>
        <a href="account.html" class="footer-link">ACCOUNT</a>
        <a href="kulture.html" class="footer-link">ABOUT</a>
        <a href="admin.html" class="footer-link" style="color:var(--accent-yellow);font-weight:700;">ADMIN</a>
        <a href="privacy-policy.html" class="footer-link">PRIVACY</a>
        <a href="terms-of-service.html" class="footer-link">TERMS</a>
      </nav>

      <div style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#555;letter-spacing:0.1em;text-transform:uppercase;">
        © 2026 MUSTAZ CRAFT. ALL RIGHTS RESERVED.
      </div>
    </div>
  </div>
</footer>

<script type="module" src="js/app.js"></script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1: INDEX.HTML (THE GARAGE - HOME)
// ─────────────────────────────────────────────────────────────────────────────
function buildIndex() {
  const html = `${pageHead('MUSTAZ CRAFT — Kustom Pet Helm & Visors // Issue 04')}
${sharedHeader('home')}
${sharedMarquee()}

<main style="padding-top:70px;">
  <!-- HERO SECTION -->
  <section style="position:relative;background:#080808;padding:80px 0 100px;border-bottom:3px solid var(--accent-pink);overflow:hidden;">
    <!-- Background Large Watermark -->
    <div style="position:absolute;top:20px;right:-40px;font-family:var(--font-headline);font-size:clamp(8rem, 22vw, 18rem);color:rgba(255,255,255,0.03);line-height:0.8;user-select:none;pointer-events:none;font-weight:900;">
      PET HELM
    </div>

    <div class="wrap">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:56px;align-items:center;">
        
        <!-- LEFT: EDITORIAL HEADLINE & METADATA -->
        <div style="position:relative;z-index:10;">
          <!-- Metadata Stamps -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
            <span class="zine-tag-yellow">PET HELM ARCHIVE</span>
            <span class="zine-tag-pink">ACID EDITION</span>
            <span class="zine-tag-dark">KUSTOM VISORS // ISS.04</span>
          </div>

          <!-- Editorial Headline -->
          <h1 class="editorial-title" style="font-size:clamp(3rem, 6.2vw, 5.5rem);line-height:0.9;margin-bottom:22px;letter-spacing:-0.01em;">
            MUSTAZ<br>
            <span style="color:var(--accent-yellow);text-shadow:3px 3px 0px var(--accent-pink);">CRAFT.</span>
          </h1>

          <!-- Editorial Description -->
          <p style="font-size:1.05rem;color:#C0C0C0;max-width:520px;border-left:4px solid var(--accent-yellow);padding-left:20px;margin-bottom:32px;line-height:1.6;">
            Radical visor peaks, hand-crafted pet helm, and studded headgear accessories for two-wheeled street rebels. Hand-forged in dust, heavy leather, and high-voltage neon. No generic factory plastic.
          </p>

          <!-- CTA Buttons -->
          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a href="parts.html" class="btn-brutal-yellow" style="font-size:1.2rem;padding:18px 36px;">
              ENTER SHOP →
            </a>
            <a href="kulture.html" class="btn-brutal-ghost" style="font-size:1.15rem;padding:17px 32px;">
              ABOUT US →
            </a>
          </div>

          <!-- Technical Marking -->
          <div style="display:flex;align-items:center;gap:16px;margin-top:36px;opacity:0.6;">
            <span class="barcode-decor" style="height:28px;width:120px;"></span>
            <span style="font-family:var(--font-mono-sub);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;">
              PROTOCOL: MSTZ-VISOR-SPEC
            </span>
          </div>
        </div>

        <!-- RIGHT: ASYMMETRIC REAL VISOR ASSET COLLAGE -->
        <div style="position:relative;">
          <!-- Masking Tape Accents -->
          <div class="tape-decor tape-top-left" style="background:rgba(255,230,0,0.7);"></div>
          <div class="tape-decor tape-top-right" style="background:rgba(255,0,140,0.7);"></div>

          <!-- Main Tilted Helmet Visor Frame -->
          <div class="hero-photo-frame" style="background:#FFFFFF;border:4px solid #000000;box-shadow:12px 12px 0px var(--accent-pink);padding:14px;max-width:460px;margin:0 auto;transform:rotate(2deg);transition:transform 0.3s ease;"
               onmouseover="this.style.transform='rotate(0deg) scale(1.02)'" onmouseout="this.style.transform='rotate(2deg) scale(1)'">
            <div style="position:relative;width:100%;aspect-ratio:4/5;background:#000;overflow:hidden;border:2px solid #000;">
              <img src="assets/images/pet_visor_yellow_flame.png"
                   alt="MUSTAZ CRAFT Kustom Pet Helm & Visor"
                   style="width:100%;height:100%;object-fit:cover;object-position:center;filter:contrast(115%);">
              <div style="position:absolute;top:14px;right:14px;">
                <span class="stamp-punk" style="background:rgba(0,0,0,0.75);">NO FUTURE</span>
              </div>
              <div style="position:absolute;bottom:14px;left:14px;">
                <span class="zine-tag-yellow">Y-TWO ROOF VISOR // SPIKED</span>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 4px 4px;font-family:var(--font-mono-sub);font-size:0.75rem;color:#000;font-weight:800;text-transform:uppercase;">
              <span>FIG. 01 // KUSTOM PET HELM</span>
              <span>MUSTAZ CRAFT WORKSHOP</span>
            </div>
          </div>

          <!-- Overlapping Secondary Polarized Badge -->
          <div class="hero-sub-badge" style="position:absolute;bottom:-24px;left:-20px;background:#000;border:3px solid var(--accent-yellow);box-shadow:6px 6px 0px var(--accent-pink);padding:14px 18px;transform:rotate(-4deg);z-index:20;">
            <div style="font-family:var(--font-headline);font-size:1.3rem;color:var(--accent-yellow);line-height:1;margin-bottom:4px;">
              PET HELM // 100% REBELLION
            </div>
            <div style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--accent-pink);letter-spacing:0.12em;font-weight:700;">
              VERIFIED UNDERGROUND DISPATCH
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>

  <!-- SECTION 01: SIGNATURE PET HELM DROPS -->
  <section style="padding:90px 0;background:#0d0d0d;position:relative;">
    <div class="wrap">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;flex-wrap:wrap;gap:20px;">
        <div>
          <div class="section-meta-header">
            <span class="section-num">01</span>
            <span class="section-label" style="color:var(--accent-yellow);">SIGNATURE HARDWARE</span>
          </div>
          <h2 class="editorial-title" style="margin-bottom:0;">PET HELM DROPS</h2>
          <p class="editorial-desc" style="margin-top:8px;">
            Hand-built visor peaks, acrylic roofs, and studded leather lids. Compatible with universal 3-snap helmet shells.
          </p>
        </div>
        <a href="parts.html" class="btn-brutal-yellow btn-brutal-sm">
          VIEW ALL PRODUCTS →
        </a>
      </div>

      <!-- 3-Column Asymmetric Drops Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:32px;align-items:start;">
        
        <!-- Drop Card 1: Y-TWO ROOF VISOR -->
        <article class="card-brutal-white" style="transform:rotate(-1deg);">
          <div class="tape-decor tape-top-left" style="background:rgba(255,230,0,0.7);"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-family:var(--font-headline);font-size:1.1rem;color:#000;">SERIES 01 // ACID</span>
            <span class="zine-tag-yellow">BESTSELLER</span>
          </div>
          <div class="card-img-box" style="margin-bottom:18px;">
            <img src="assets/images/pet_visor_yellow_flame.png"
                 alt="Y-Two Roof Visor" style="object-position:center;">
          </div>
          <h3 style="font-family:var(--font-headline);font-size:1.8rem;color:#000;margin-bottom:6px;line-height:0.95;">
            Y-TWO ROOF VISOR
          </h3>
          <p style="font-family:var(--font-mono-sub);font-size:0.82rem;color:#444;margin-bottom:16px;line-height:1.5;">
            High-voltage acid yellow transparent acrylic with punk spikes. Hand-shaped curve for optimal airflow deflection.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;">
            <div style="background:#000;color:#FFF;padding:8px 10px;">
              <span style="display:block;font-size:0.65rem;color:var(--accent-yellow);font-family:var(--font-mono-sub);">SNAP</span>
              <span style="font-family:var(--font-headline);font-size:0.95rem;">UNIVERSAL 3-SNAP</span>
            </div>
            <div style="background:#000;color:#FFF;padding:8px 10px;">
              <span style="display:block;font-size:0.65rem;color:var(--accent-pink);font-family:var(--font-mono-sub);">FINISH</span>
              <span style="font-family:var(--font-headline);font-size:0.95rem;">CHROME SPIKED</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px dashed #000;padding-top:14px;">
            <span style="font-family:var(--font-headline);font-size:1.5rem;color:var(--accent-pink);font-weight:900;">
              IDR 350.000
            </span>
            <button class="btn-brutal-pink btn-brutal-sm" data-add-to-cart="pet-1">
              + ADD
            </button>
          </div>
        </article>

        <!-- Drop Card 2: CHECKER RACER DUCKBILL -->
        <article class="card-brutal-dark" style="transform:translateY(16px) rotate(1deg);border-color:var(--accent-yellow);">
          <div class="tape-decor tape-top-right"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-family:var(--font-headline);font-size:1.1rem;color:var(--accent-yellow);">RETRO RUN // MK-02</span>
            <span class="zine-tag-white">IN STOCK</span>
          </div>
          <div class="card-img-box" style="margin-bottom:18px;border-color:var(--accent-yellow);">
            <img src="assets/images/retro_checkered_helmet.png"
                 alt="Checker Racer Duckbill" style="object-position:center;">
          </div>
          <h3 style="font-family:var(--font-headline);font-size:1.8rem;color:#FFF;margin-bottom:6px;line-height:0.95;">
            CHECKER RACER PET
          </h3>
          <p style="font-family:var(--font-mono-sub);font-size:0.82rem;color:#AAA;margin-bottom:16px;line-height:1.5;">
            Monochrome vintage checkered race visor. Reinforced ABS compound with classic duckbill silhouette.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;">
            <div style="background:#1b1b1b;color:#FFF;padding:8px 10px;border:1px solid #333;">
              <span style="display:block;font-size:0.65rem;color:var(--accent-yellow);font-family:var(--font-mono-sub);">COMPATIBILITY</span>
              <span style="font-family:var(--font-headline);font-size:0.95rem;">OPEN & MOTO</span>
            </div>
            <div style="background:#1b1b1b;color:#FFF;padding:8px 10px;border:1px solid #333;">
              <span style="display:block;font-size:0.65rem;color:var(--accent-pink);font-family:var(--font-mono-sub);">PATTERN</span>
              <span style="font-family:var(--font-headline);font-size:0.95rem;">CHECKERED</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px dashed #333;padding-top:14px;">
            <span style="font-family:var(--font-headline);font-size:1.5rem;color:var(--accent-yellow);font-weight:900;">
              IDR 280.000
            </span>
            <button class="btn-brutal-yellow btn-brutal-sm" data-add-to-cart="pet-3">
              + ADD
            </button>
          </div>
        </article>

        <!-- Drop Card 3: MUSTAZ CRAFT EVENT DROP SET -->
        <article class="card-brutal-white" style="transform:rotate(-1.5deg);">
          <div class="tape-decor tape-top-left"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-family:var(--font-headline);font-size:1.1rem;color:#000;">OFFICIAL BUNDLE</span>
            <span class="zine-tag-pink">EVENT PACK</span>
          </div>
          <div class="card-img-box" style="margin-bottom:18px;">
            <img src="assets/images/mustaz_booth_event.png"
                 alt="MUSTAZ CRAFT Official Drop Set" style="object-position:center;">
          </div>
          <h3 style="font-family:var(--font-headline);font-size:1.8rem;color:#000;margin-bottom:6px;line-height:0.95;">
            MUSTAZ CRAFT DROP BUNDLE
          </h3>
          <p style="font-family:var(--font-mono-sub);font-size:0.82rem;color:#444;margin-bottom:16px;line-height:1.5;">
            Pet Visor + Custom Heavy Ziplock Bag + Zine Issue 04 + Die-Cut Weatherproof Sticker Pack.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;">
            <div style="background:#000;color:#FFF;padding:8px 10px;">
              <span style="display:block;font-size:0.65rem;color:var(--accent-yellow);font-family:var(--font-mono-sub);">PACKAGING</span>
              <span style="font-family:var(--font-headline);font-size:0.95rem;">SEALED ZIP POUCH</span>
            </div>
            <div style="background:#000;color:#FFF;padding:8px 10px;">
              <span style="display:block;font-size:0.65rem;color:var(--accent-pink);font-family:var(--font-mono-sub);">EXTRAS</span>
              <span style="font-family:var(--font-headline);font-size:0.95rem;">ZINE + STICKERS</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px dashed #000;padding-top:14px;">
            <span style="font-family:var(--font-headline);font-size:1.5rem;color:var(--accent-pink);font-weight:900;">
              IDR 450.000
            </span>
            <button class="btn-brutal-pink btn-brutal-sm" data-add-to-cart="pet-4">
              + ADD
            </button>
          </div>
        </article>

      </div>
    </div>
  </section>

  <!-- SECTION 02: FEATURED HERO PET VISOR -->
  <section style="padding:90px 0;background:#080808;border-top:2px solid var(--border-subtle);border-bottom:2px solid var(--border-subtle);">
    <div class="wrap">
      <div class="card-brutal-white" style="box-shadow:12px 12px 0px var(--accent-yellow);padding:36px;border:4px solid #000;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:center;">
          
          <!-- Product Photo with Offset Frame -->
          <div style="position:relative;">
            <div style="border:3px solid #000;background:#000;padding:12px;transform:rotate(-2deg);box-shadow:8px 8px 0px #000;">
              <img src="assets/images/pet_visor_yellow_flame.png"
                   alt="Y-Two Roof Visor Detail"
                   style="width:100%;height:340px;object-fit:cover;object-position:center top;filter:contrast(115%);">
            </div>
            <!-- Torn Paper Price Tag -->
            <div class="raw-paper-edge" style="position:absolute;bottom:-16px;right:-16px;background:var(--accent-yellow);color:#000;padding:12px 24px;border:2px solid #000;box-shadow:4px 4px 0px var(--accent-pink);transform:rotate(3deg);">
              <span style="font-family:var(--font-headline);font-size:1.8rem;font-weight:900;">IDR 350.000</span>
            </div>
          </div>

          <!-- Product Details & CTAs -->
          <div style="color:#000;">
            <div style="display:inline-block;background:#000;color:var(--accent-yellow);padding:4px 10px;font-family:var(--font-mono-sub);font-size:0.75rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:16px;">
              FEATURED PET // ISSUE 04 DROP
            </div>
            <h2 style="font-family:var(--font-headline);font-size:clamp(2.5rem, 5vw, 4rem);color:#000;line-height:0.9;margin-bottom:16px;">
              Y-TWO ROOF VISOR
            </h2>
            <p style="font-size:1.05rem;color:#333;line-height:1.6;margin-bottom:28px;">
              Molded under heat from high-impact optical acrylic, finished with punk chrome spike studs and solid brass snaps. Compatible with all standard 3-snap retro open-face helmets (Biltwell, Bell 500, Beetle, and custom shells).
            </p>
            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              <button class="btn-brutal-pink" data-add-to-cart="pet-1" style="font-size:1.15rem;padding:16px 28px;">
                + ADD TO ARSENAL
              </button>
              <a href="parts.html" class="btn-brutal-dark" style="background:#000;color:#FFF;padding:16px 28px;font-family:var(--font-headline);font-size:1.15rem;border:2px solid #000;cursor:pointer;text-decoration:none;">
                ALL VISOR SPECS →
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 03: UNDERGROUND ARCHIVE & STORIES -->
  <section style="padding:90px 0;background:#0a0a0a;">
    <div class="wrap">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;flex-wrap:wrap;gap:20px;">
        <div>
          <div class="section-meta-header">
            <span class="section-num" style="color:var(--accent-yellow);">02</span>
            <span class="section-label">OUR STORY & ARCHIVE</span>
          </div>
          <h2 class="editorial-title" style="margin-bottom:0;">ABOUT MUSTAZ CRAFT</h2>
          <p class="editorial-desc" style="margin-top:8px;">
            The story behind the spikes, flames, and visor rebellion straight from the workshop.
          </p>
        </div>
        <a href="kulture.html" class="btn-brutal-yellow btn-brutal-sm">
          READ THE STORY →
        </a>
      </div>

      <!-- Bento Collage with Real Assets -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;">
        <!-- Card 1: Event Booth -->
        <div style="background:#111;border:2px solid var(--border-light);position:relative;overflow:hidden;aspect-ratio:4/5;min-height:340px;" class="card-brutal-dark">
          <img src="assets/images/mustaz_booth_event.png"
               alt="MUSTAZ CRAFT Event Booth" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 25%;filter:contrast(115%);">
          <div style="position:relative;z-index:10;padding:24px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(to top, rgba(0,0,0,0.95) 25%, transparent);">
            <span class="zine-tag-yellow" style="margin-bottom:8px;align-self:flex-start;">01 // THE BOOTH</span>
            <h3 style="font-family:var(--font-headline);font-size:1.8rem;margin-bottom:6px;color:#FFF;">COMMUNITY & DROPS</h3>
            <p style="font-size:0.85rem;color:#DDD;">Local chopper shows, swap meets, and live visor fittings.</p>
          </div>
        </div>

        <!-- Card 2: Retro Race Helmet -->
        <div style="background:#111;border:2px solid var(--border-light);position:relative;overflow:hidden;aspect-ratio:4/5;min-height:340px;" class="card-brutal-dark">
          <img src="assets/images/retro_checkered_helmet.png"
               alt="Retro Checkered Helmet" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;filter:contrast(115%);">
          <div style="position:relative;z-index:10;padding:24px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(to top, rgba(0,0,0,0.95) 25%, transparent);">
            <span class="zine-tag-pink" style="margin-bottom:8px;align-self:flex-start;">02 // RACE ATTITUDE</span>
            <h3 style="font-family:var(--font-headline);font-size:1.8rem;margin-bottom:6px;color:#FFF;">DUCKBILL REBELLION</h3>
            <p style="font-size:0.85rem;color:#DDD;">70s flat-track aesthetic re-engineered for the modern streets.</p>
          </div>
        </div>

        <!-- Card 3: Craftsman / Leather Flames -->
        <div style="background:#111;border:2px solid var(--border-light);position:relative;overflow:hidden;aspect-ratio:4/5;min-height:340px;" class="card-brutal-dark">
          <img src="assets/images/pet_visor_yellow_flame.png"
               alt="Flame Visor Craftsman" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:contrast(115%);">
          <div style="position:relative;z-index:10;padding:24px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(to top, rgba(0,0,0,0.95) 25%, transparent);">
            <span class="zine-tag-yellow" style="margin-bottom:8px;align-self:flex-start;">03 // HAND CRAFT</span>
            <h3 style="font-family:var(--font-headline);font-size:1.8rem;margin-bottom:6px;color:#FFF;">SPIKES & FLAMES</h3>
            <p style="font-size:0.85rem;color:#DDD;">Every piece is riveted, cut, and assembled by hand in our shop.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

${sharedFooter()}`;

  fs.writeFileSync("index.html", html);
  console.log("✅ index.html   (The Garage — Home Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2: CHOPPERS.HTML (BUILDS CATALOG)
// ─────────────────────────────────────────────────────────────────────────────
function buildChoppers() {
  const html = `${pageHead('Custom Helmets & Kits — MUSTAZ CRAFT Archive')}
${sharedHeader('product')}
${sharedMarquee()}

<main style="padding-top:70px;">
  <!-- Catalog Hero Header -->
  <section style="background:#080808;padding:70px 0 50px;border-bottom:3px solid var(--accent-pink);position:relative;">
    <div class="wrap">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <span class="zine-tag-yellow">KUSTOM HEADGEAR</span>
        <span class="zine-tag-pink">SERIES 01 RUN</span>
      </div>
      <h1 class="editorial-title" style="font-size:clamp(3rem, 7vw, 6rem);margin-bottom:12px;">
        CUSTOM LIDS & KITS
      </h1>
      <p class="editorial-desc">
        Special commission custom helmets equipped with hand-crafted pet visors, leather ear-guards, and complete rider kits. Built by hand, one by one.
      </p>
    </div>
  </section>

  <!-- Filter & Search Toolbar -->
  <section style="padding:24px 0;background:#111111;border-bottom:1px solid #282828;">
    <div class="wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
        <div class="filter-tabs-container">
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--accent-yellow);font-weight:800;letter-spacing:0.15em;">FILTER:</span>
          <button class="filter-tab-btn active" data-filter="ALL">ALL HEADGEAR</button>
          <button class="filter-tab-btn" data-filter="Custom Helmet">CUSTOM HELMETS</button>
          <button class="filter-tab-btn" data-filter="Drop Sets">DROP SETS</button>
        </div>
        <div style="position:relative;width:100%;max-width:320px;">
          <input type="text" class="form-input-brutal" data-search placeholder="SEARCH LID OR BUILD..." style="padding:10px 14px 10px 38px;">
          <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#888;font-size:20px;">search</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Choppers Inventory Grid -->
  <section style="padding:70px 0 100px;background:#080808;">
    <div class="wrap">
      <div id="choppersGrid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(340px, 1fr));gap:40px;">
        <!-- Injected dynamically by js/components/products.js -->
      </div>
    </div>
  </section>
</main>

${sharedFooter()}`;

  fs.writeFileSync("choppers.html", html);
  console.log("✅ choppers.html (Hand Built Choppers Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3: PARTS.HTML (PARTS SHOP)
// ─────────────────────────────────────────────────────────────────────────────
function buildParts() {
  const html = `${pageHead('Pet Helm & Visors — MUSTAZ CRAFT Garage Goods')}
${sharedHeader('product')}
${sharedMarquee()}

<main style="padding-top:70px;">
  <!-- Catalog Hero Header -->
  <section style="background:#080808;padding:70px 0 50px;border-bottom:3px solid var(--accent-pink);position:relative;">
    <div class="wrap">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <span class="zine-tag-yellow">PET HELM // CATALOG</span>
        <span class="zine-tag-pink">UNIVERSAL 3-SNAP</span>
      </div>
      <h1 class="editorial-title" style="font-size:clamp(3rem, 7vw, 6rem);margin-bottom:12px;">
        PET HELM / VISORS
      </h1>
      <p class="editorial-desc">
        High-voltage acid acrylics, spiked leather visors, and vintage race duckbill peaks. Hand-formed and combat-tested for two-wheeled street culture. No boring factory plastic.
      </p>
    </div>
  </section>

  <!-- Filter & Search Toolbar -->
  <section style="padding:24px 0;background:#111111;border-bottom:1px solid #282828;">
    <div class="wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;">
        <div class="filter-tabs-container">
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--accent-yellow);font-weight:800;letter-spacing:0.15em;">CATEGORY:</span>
          <button class="filter-tab-btn active" data-filter="ALL">ALL PETS</button>
          <button class="filter-tab-btn" data-filter="Acrylic Pet">ACRYLIC PET</button>
          <button class="filter-tab-btn" data-filter="Leather Pet">LEATHER PET</button>
          <button class="filter-tab-btn" data-filter="Retro Visor">RETRO VISOR</button>
          <button class="filter-tab-btn" data-filter="Drop Sets">DROP SETS</button>
        </div>
        <div style="position:relative;width:100%;max-width:320px;">
          <input type="text" class="form-input-brutal" data-search placeholder="SEARCH VISOR OR SKU..." style="padding:10px 14px 10px 38px;">
          <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#888;font-size:20px;">search</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <section style="padding:70px 0 100px;background:#080808;">
    <div class="wrap">
      <div id="partsGrid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:32px;">
        <!-- Injected dynamically by js/components/products.js -->
      </div>
    </div>
  </section>
</main>

${sharedFooter()}`;

  fs.writeFileSync("parts.html", html);
  console.log("✅ parts.html   (Parts Shop Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4: KULTURE.HTML (CULTURE & ZINE STORIES)
// ─────────────────────────────────────────────────────────────────────────────
function buildKulture() {
  const html = `${pageHead('About — MUSTAZ CRAFT Pet Helm Kulture // Issue 04')}
${sharedHeader('about')}
${sharedMarquee()}

<main style="padding-top:70px;">
  <!-- Zine Cover Hero -->
  <section style="padding:80px 0 100px;background:#080808;border-bottom:3px solid var(--accent-pink);position:relative;">
    <div class="wrap">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:56px;align-items:center;">
        
        <!-- Left: Torn Paper Editorial Block -->
        <div style="position:relative;">
          <div class="card-brutal-white" style="transform:rotate(-2deg);padding:36px;">
            <div class="tape-decor tape-top-left" style="background:rgba(255,230,0,0.7);"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <span class="zine-tag-yellow">ISSUE NO. 04</span>
              <span style="font-family:var(--font-mono-sub);font-size:0.75rem;font-weight:800;color:#000;">PET HELM DISPATCH</span>
            </div>
            <h1 class="editorial-title" style="color:#000;font-size:clamp(3rem, 6vw, 5.5rem);margin-bottom:18px;">
              VISOR<br>
              <span style="color:var(--accent-pink);text-shadow:2px 2px 0px #000;">REBEL</span><br>
              LION.
            </h1>
            <div style="border-top:2px solid #000;border-bottom:2px solid #000;padding:14px 0;margin-bottom:20px;font-family:var(--font-mono-sub);font-size:0.85rem;color:#333;font-weight:700;">
              AUTHENTIC VISORS & HEADGEAR ACCESSORIES CRAFTED FOR TWO-WHEELED SURVIVAL.
            </div>
            <p style="color:#333;font-size:0.95rem;line-height:1.6;margin-bottom:24px;">
              We reject sterile corporate helmets and mass-produced showroom plastic. MUSTAZ CRAFT was born out of local motorcycle meets and raw garage passion, handcrafting custom pet visors that give retro lids an unapologetic underground attitude.
            </p>
            <a href="#manifesto" class="btn-brutal-pink" style="width:100%;text-align:center;">
              READ THE MANIFESTO →
            </a>
          </div>
        </div>

        <!-- Right: Real Assets Overlapping Collage -->
        <div style="position:relative;">
          <div class="tape-decor tape-top-right"></div>
          <div style="background:#000;border:3px solid #FFF;box-shadow:12px 12px 0px var(--accent-pink);padding:14px;transform:rotate(2deg);max-width:460px;margin:0 auto;">
            <div style="position:relative;width:100%;aspect-ratio:4/5;overflow:hidden;background:#050505;">
              <img src="assets/images/mustaz_booth_event.png"
                   alt="MUSTAZ CRAFT Booth Community" style="width:100%;height:100%;object-fit:cover;object-position:center;filter:contrast(115%);">
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;">
              <span class="barcode-decor" style="height:22px;width:100px;"></span>
              <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#AAA;">MUSTAZ CRAFT WORKSHOP // LOCAL BOOTH</span>
            </div>
          </div>
          <!-- Overlapping Mini Frame -->
          <div class="kulture-mini-frame" style="position:absolute;bottom:-24px;left:-16px;width:180px;background:#FFF;border:3px solid #000;box-shadow:6px 6px 0px var(--accent-yellow);padding:8px;transform:rotate(-5deg);z-index:20;">
            <div style="width:100%;aspect-ratio:4/3;overflow:hidden;background:#000;">
              <img src="assets/images/pet_visor_yellow_flame.png"
                   alt="Flame Pet Visor Detail" style="width:100%;height:100%;object-fit:cover;object-position:center top;filter:contrast(115%);">
            </div>
            <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:#000;font-weight:900;text-align:center;margin-top:4px;">
              HAND-FORMED ACRYLIC
            </span>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Manifesto Statement -->
  <section id="manifesto" style="padding:90px 0;background:#0d0d0d;border-bottom:2px solid var(--border-subtle);">
    <div class="wrap-tight">
      <div style="text-align:center;margin-bottom:48px;">
        <span class="zine-tag-yellow" style="margin-bottom:12px;">GARAGE CREED</span>
        <h2 class="editorial-title" style="font-size:clamp(2.8rem, 6vw, 5rem);margin-bottom:16px;">
          BUILT BY RIDERS. FOR RIDERS.
        </h2>
        <div class="metal-chain-divider" style="max-width:300px;margin:20px auto;"></div>
      </div>
      <div style="background:#141414;border:2px solid #282828;border-left:6px solid var(--accent-yellow);padding:40px;box-shadow:8px 8px 0px #000;">
        <p style="font-size:1.25rem;color:#F2F0E8;line-height:1.7;margin-bottom:20px;font-style:italic;">
          “A helmet without character is just factory gear. When you snap a MUSTAZ CRAFT Pet onto your shell—whether it's studded heavy leather or neon acrylic spikes—you declare that you don't ride to blend in. You ride to leave a mark.”
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed #333;padding-top:16px;">
          <span style="font-family:var(--font-headline);font-size:1.1rem;color:var(--accent-yellow);text-transform:uppercase;">
            MUSTAZ CRAFT WORKSHOP // CREW
          </span>
          <span style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;">
            DISPATCH #04-88
          </span>
        </div>
      </div>
    </div>
  </section>
</main>

${sharedFooter()}`;

  fs.writeFileSync("kulture.html", html);
  console.log("✅ kulture.html (Culture & Manifesto Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5: ACCOUNT.HTML (MY ARSENAL & PROFILE)
// ─────────────────────────────────────────────────────────────────────────────
function buildAccount() {
  const html = `${pageHead('My Account — MUSTAZ CRAFT Dashboard')}
${sharedHeader('account')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section style="padding:50px 0 90px;">
    <div class="wrap">
      
      <!-- Top Account Greeting & Overview Card -->
      <div class="card-brutal-dark" style="margin-bottom:36px;border-color:var(--accent-pink);padding:28px 32px;background:#0f0f0f;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;">
          
          <!-- Avatar + Member Bio -->
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:72px;height:72px;background:var(--accent-pink);border:3px solid #FFFFFF;box-shadow:4px 4px 0px #000000;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">
              <img id="userAvatarImg" src="" style="display:none;width:100%;height:100%;object-fit:cover;" alt="Avatar">
              <span id="userAvatarInitial" style="font-family:var(--font-headline);font-size:2.4rem;font-weight:900;color:#000000;line-height:1;">M</span>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap;">
                <h1 class="editorial-title" id="userNameHeading" style="font-size:clamp(1.8rem, 3.5vw, 2.5rem);margin:0;color:#FFF;line-height:1;">
                  MEMBER
                </h1>
                <span id="userRoleBadge" class="zine-tag-pink" style="font-size:0.65rem;padding:2px 8px;">MEMBER</span>
                <span class="zine-tag-yellow" style="font-size:0.65rem;padding:2px 8px;">VERIFIED CREW</span>
                <a href="admin.html" id="adminConsoleBtn" class="btn-brutal-yellow btn-brutal-sm" style="display:none;align-items:center;gap:6px;text-decoration:none;padding:4px 10px;font-size:0.75rem;">
                  <span class="material-symbols-outlined" style="font-size:16px;">admin_panel_settings</span>
                  <span>ADMIN WORKSHOP ↗</span>
                </a>
              </div>
              <p id="userSubMeta" style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;letter-spacing:0.08em;margin:0;">
                VERIFIED MEMBER
              </p>
            </div>
          </div>

          <!-- Quick Metrics Bar -->
          <div style="display:flex;gap:18px;flex-wrap:wrap;">
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:var(--accent-yellow);text-transform:uppercase;">TOTAL ORDERS</span>
              <span style="font-family:var(--font-headline);font-size:1.4rem;color:#FFF;font-weight:900;" id="metricTotalOrders">0</span>
            </div>
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:var(--accent-pink);text-transform:uppercase;">WISHLIST</span>
              <span style="font-family:var(--font-headline);font-size:1.4rem;color:#FFF;font-weight:900;" id="metricWishlist">0</span>
            </div>
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:#AAA;text-transform:uppercase;">TOTAL SPENT</span>
              <span style="font-family:var(--font-headline);font-size:1.4rem;color:var(--accent-yellow);font-weight:900;" id="metricTotalSpent">Rp 0</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Account Dashboard Grid (Sidebar + Main Content Panels) -->
      <div class="account-grid">
        
        <!-- SIDEBAR NAVIGATION -->
        <aside>
          <nav class="account-sidebar-nav" id="accountNav">
            <button class="account-nav-item active" data-tab="orders">
              <span class="material-symbols-outlined">package_2</span>
              <span>ORDER HISTORY</span>
              <span class="account-nav-badge" id="navBadgeOrders">0</span>
            </button>
            <button class="account-nav-item" data-tab="profile">
              <span class="material-symbols-outlined">person</span>
              <span>PROFILE DETAILS</span>
            </button>
            <button class="account-nav-item" data-tab="addresses">
              <span class="material-symbols-outlined">local_shipping</span>
              <span>DELIVERY ADDRESSES</span>
            </button>
            <button class="account-nav-item" data-tab="wishlist">
              <span class="material-symbols-outlined">favorite</span>
              <span>SAVED VISORS</span>
              <span class="account-nav-badge" id="navBadgeWishlist">0</span>
            </button>
            <button class="account-nav-item" data-tab="security">
              <span class="material-symbols-outlined">lock</span>
              <span>SECURITY & ACCESS</span>
            </button>
            <hr style="border:none;border-top:1px dashed #333;margin:8px 0;">
            <a href="login.html" class="account-nav-item" id="btnNavLogout" style="color:#FF4444;">
              <span class="material-symbols-outlined" style="color:#FF4444;">logout</span>
              <span>LOGOUT / EXIT</span>
            </a>
          </nav>

          <!-- Help / Direct WhatsApp Support Box -->
          <div style="background:#121212;border:2px solid #222;padding:20px;margin-top:20px;box-shadow:4px 4px 0px #000;">
            <span style="font-family:var(--font-mono-sub);font-size:0.7rem;color:var(--accent-yellow);letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:6px;">
              NEED ASSISTANCE?
            </span>
            <p style="font-size:0.85rem;color:#AAA;line-height:1.4;margin-bottom:14px;">
              Have questions about your Pet Visor custom fitting or shipping tracking?
            </p>
            <a href="https://wa.me/6281234567890?text=Halo%20MUSTAZ%20CRAFT%2C%20saya%20butuh%20bantuan%20pesanan%20saya." target="_blank" class="btn-brutal-pink btn-brutal-sm" style="width:100%;text-align:center;display:block;">
              CHAT CS VIA WHATSAPP →
            </a>
          </div>
        </aside>

        <!-- MAIN CONTENT PANELS -->
        <div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 1: ORDER HISTORY -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel active" id="panel-orders">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
              <h2 class="editorial-title" style="font-size:2rem;margin:0;">ORDER HISTORY</h2>
              <span id="orderHistoryCount" style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#888;">
                SHOWING 0 DISPATCHES
              </span>
            </div>

            <div id="orderHistoryContainer">
              <!-- Rendered dynamically for logged-in user -->
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 2: PROFILE DETAILS -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-profile">
            <div style="margin-bottom:24px;">
              <h2 class="editorial-title" style="font-size:2rem;margin:0 0 6px;">DATA PRIBADI</h2>
              <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;margin:0;">
                KELOLA DATA DIRI, IDENTITAS PENGGUNA, DAN KONTAK AKTIF ANDA.
              </p>
            </div>

            <div style="background:#111;border:2px solid #282828;padding:32px;box-shadow:6px 6px 0px #000;">
              <form id="profileForm">
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:20px;margin-bottom:20px;">
                  <div class="form-group-brutal" style="margin-bottom:0;">
                    <label class="form-label-brutal">NAMA LENGKAP (FULL NAME)</label>
                    <input type="text" id="inputFullName" class="form-input-brutal" placeholder="Nama Anda" required>
                  </div>
                  <div class="form-group-brutal" style="margin-bottom:0;">
                    <label class="form-label-brutal">PANGGILAN / ALIAS / USERNAME</label>
                    <input type="text" id="inputAlias" class="form-input-brutal" placeholder="Rider 7G">
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:20px;margin-bottom:28px;">
                  <div class="form-group-brutal" style="margin-bottom:0;">
                    <label class="form-label-brutal">ALAMAT EMAIL</label>
                    <input type="email" id="inputEmail" class="form-input-brutal" placeholder="your@email.com" required readonly style="opacity:0.85;cursor:not-allowed;">
                  </div>
                  <div class="form-group-brutal" style="margin-bottom:0;">
                    <label class="form-label-brutal">NO. WHATSAPP / HP</label>
                    <input type="tel" id="inputPhone" class="form-input-brutal" placeholder="+62 812-xxxx-xxxx">
                  </div>
                </div>

                <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                  <button type="submit" class="btn-brutal-pink">
                    SAVE CHANGES →
                  </button>
                  <button type="button" class="btn-brutal-ghost" id="btnResetProfile">
                    RESET
                  </button>
                </div>

                <div id="profileSaveNotice" style="display:none;margin-top:20px;background:var(--accent-yellow);color:#000;padding:12px 18px;font-family:var(--font-headline);font-size:0.95rem;font-weight:900;border:2px solid #000;box-shadow:4px 4px 0px var(--accent-pink);">
                  ⚡ DATA PRIBADI BERHASIL DIUPDATE & TERSIMPAN!
                </div>
              </form>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 3: DELIVERY ADDRESSES -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-addresses">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
              <div>
                <h2 class="editorial-title" style="font-size:2rem;margin:0 0 6px;">DELIVERY ADDRESSES</h2>
                <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;margin:0;">
                  DROP COORDINATES FOR EXPEDITION SHIPPING & DISPATCHES.
                </p>
              </div>
              <button class="btn-brutal-yellow btn-brutal-sm" id="btnAddAddressBtn">
                + ADD NEW ADDRESS
              </button>
            </div>

            <div id="addressesContainer">
              <!-- Rendered dynamically for logged-in user -->
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 4: WISHLIST / SAVED VISORS -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-wishlist">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px;">
              <div>
                <h2 class="editorial-title" style="font-size:2rem;margin:0 0 6px;">SAVED VISORS (WISHLIST)</h2>
                <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;margin:0;">
                  ITEMS SAVED TO YOUR PERSONAL VISOR ARSENAL.
                </p>
              </div>
              <a href="parts.html" class="btn-brutal-yellow btn-brutal-sm">
                EXPLORE ALL PETS →
              </a>
            </div>

            <div id="wishlistContainer" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:24px;">
              <!-- Rendered dynamically for logged-in user -->
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 5: SECURITY & ACCESS -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-security">
            <div style="margin-bottom:24px;">
              <h2 class="editorial-title" style="font-size:2rem;margin:0 0 6px;">SECURITY & PASSWORD</h2>
              <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;margin:0;">
                PROTECT YOUR GARAGE ACCESS CREDENTIALS AND ACTIVE LOGINS.
              </p>
            </div>

            <div style="background:#111;border:2px solid #282828;padding:32px;box-shadow:6px 6px 0px #000;margin-bottom:24px;">
              <h3 style="font-family:var(--font-headline);font-size:1.3rem;color:#FFF;margin-bottom:20px;">
                CHANGE ACCESS PASSWORD
              </h3>
              <form onsubmit="event.preventDefault(); alert('Kata sandi berhasil diperbarui!'); this.reset();">
                <div class="form-group-brutal">
                  <label class="form-label-brutal">CURRENT PASSWORD</label>
                  <input type="password" class="form-input-brutal" placeholder="••••••••••••" required>
                </div>
                <div class="form-group-brutal">
                  <label class="form-label-brutal">NEW PASSKEY (MIN. 8 CHARS)</label>
                  <input type="password" class="form-input-brutal" placeholder="••••••••••••" required>
                </div>
                <div class="form-group-brutal">
                  <label class="form-label-brutal">CONFIRM NEW PASSKEY</label>
                  <input type="password" class="form-input-brutal" placeholder="••••••••••••" required>
                </div>
                <button type="submit" class="btn-brutal-pink">
                  UPDATE PASSWORD →
                </button>
              </form>
            </div>

            <!-- Active Sessions Box -->
            <div style="background:#111;border:2px solid #282828;padding:24px;box-shadow:4px 4px 0px #000;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h4 style="font-family:var(--font-headline);font-size:1.1rem;color:#FFF;margin:0;">ACTIVE SESSIONS</h4>
                <span class="zine-tag-yellow" style="font-size:0.65rem;padding:2px 8px;">CURRENT DEVICE</span>
              </div>
              <div style="display:flex;align-items:center;gap:14px;color:#AAA;font-family:var(--font-mono-sub);font-size:0.8rem;">
                <span class="material-symbols-outlined" style="font-size:24px;color:var(--accent-pink);">computer</span>
                <div>
                  <span style="color:#FFF;font-weight:700;display:block;">Chrome on Linux / Desktop</span>
                  <span>IP: 182.1.22.84 • Active Session</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </section>
</main>

<script type="module">
  import { saveCloudAccount, fetchCloudAccount } from './js/services/supabaseService.js';
  import { initAccountAuth } from './js/services/authService.js';
  import { getUserOrders, getUserWishlist, getUserAddresses, saveUserAddress, formatRupiah } from './js/services/cartService.js';

  document.addEventListener('DOMContentLoaded', async () => {
    // 0. Robust Auth Guard: handles Google OAuth tokens from URL hash & active sessions
    const isAuthenticated = await initAccountAuth();
    if (!isAuthenticated) {
      window.location.replace('login.html');
      return;
    }

    // 1. Tab Switching Logic for Account Dashboard
    const navItems = document.querySelectorAll('#accountNav .account-nav-item[data-tab]');
    const panels = document.querySelectorAll('.account-tab-panel');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.dataset.tab;

        // Update nav active classes
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Update panel active classes
        panels.forEach(panel => {
          if (panel.id === 'panel-' + targetTab) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });

    // 2. Dynamic & Persistent Profile Data (Data Diri)
    const STORAGE_KEY = 'mustaz_user_profile_data';
    const defaultData = {
      fullName: '',
      alias: 'Rider 7G',
      email: '',
      phone: '',
      avatarUrl: '',
      role: 'member'
    };

    function loadProfile() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return Object.assign({}, defaultData, parsed);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
      return defaultData;
    }

    function renderProfile(data) {
      // Update Top Greeting Banner
      const nameHeading = document.getElementById('userNameHeading');
      const avatarInitial = document.getElementById('userAvatarInitial');
      const avatarImg = document.getElementById('userAvatarImg');
      const subMeta = document.getElementById('userSubMeta');

      const name = (data.fullName && data.fullName.trim()) || (data.email ? data.email.split('@')[0].toUpperCase() : 'MEMBER');
      if (nameHeading) nameHeading.textContent = name.toUpperCase();

      if (data.avatarUrl && avatarImg) {
        avatarImg.src = data.avatarUrl;
        avatarImg.style.display = 'block';
        if (avatarInitial) avatarInitial.style.display = 'none';
      } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarInitial) {
          avatarInitial.style.display = 'block';
          avatarInitial.textContent = name.charAt(0).toUpperCase();
        }
      }

      if (subMeta) {
        const parts = [data.email, data.phone].filter(Boolean);
        subMeta.textContent = parts.length > 0 ? parts.join(' • ') + ' • VERIFIED MEMBER' : 'VERIFIED MEMBER';
      }

      // Update Form Inputs
      const inName = document.getElementById('inputFullName');
      const inAlias = document.getElementById('inputAlias');
      const inEmail = document.getElementById('inputEmail');
      const inPhone = document.getElementById('inputPhone');

      if (inName) inName.value = data.fullName || '';
      if (inAlias) inAlias.value = data.alias || '';
      if (inEmail) inEmail.value = data.email || '';
      if (inPhone) inPhone.value = data.phone || '';

      // Update Role Badge & Admin Button
      const roleBadge = document.getElementById('userRoleBadge');
      const adminBtn = document.getElementById('adminConsoleBtn');
      if (data.role === 'admin') {
        if (roleBadge) {
          roleBadge.textContent = 'ADMIN WORKSHOP';
          roleBadge.className = 'zine-tag-yellow';
        }
        if (adminBtn) adminBtn.style.display = 'inline-flex';
      } else {
        if (roleBadge) {
          roleBadge.textContent = 'MEMBER';
          roleBadge.className = 'zine-tag-pink';
        }
        if (adminBtn) adminBtn.style.display = 'none';
      }
    }

    // 3. User-Scoped Order History Renderer
    function renderAccountOrders(email) {
      const container = document.getElementById('orderHistoryContainer');
      const countEl = document.getElementById('orderHistoryCount');
      const metricOrders = document.getElementById('metricTotalOrders');
      const metricSpent = document.getElementById('metricTotalSpent');
      const navBadge = document.getElementById('navBadgeOrders');

      const orders = getUserOrders(email);
      const totalSpent = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);

      if (metricOrders) metricOrders.textContent = orders.length;
      if (navBadge) navBadge.textContent = orders.length;
      if (metricSpent) metricSpent.textContent = formatRupiah(totalSpent);
      if (countEl) countEl.textContent = \`SHOWING \${orders.length} DISPATCHES\`;

      if (!container) return;

      if (orders.length === 0) {
        container.innerHTML = \`
          <div style="background:#111;border:2px dashed #333;padding:48px 24px;text-align:center;margin-top:10px;">
            <span class="material-symbols-outlined" style="font-size:48px;color:#555;display:block;margin-bottom:12px;">package_2</span>
            <h3 style="font-family:var(--font-headline);font-size:1.4rem;color:#FFF;margin:0 0 6px;letter-spacing:0.04em;">BELUM ADA RIWAYAT PESANAN</h3>
            <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;max-width:420px;margin:0 auto 20px;line-height:1.5;">
              Akun Anda belum memiliki transaksi pesanan visor atau part helm. Mulai belanja sekarang untuk mengisi riwayat pesanan Anda!
            </p>
            <a href="parts.html" class="btn-brutal-yellow btn-brutal-sm" style="display:inline-flex;">
              JELAJAHI KATALOG PRODUK →
            </a>
          </div>
        \`;
        return;
      }

      container.innerHTML = orders.map(order => {
        const isTransit = order.status === 'IN TRANSIT';
        const statusClass = isTransit ? 'status-badge-transit' : 'status-badge-delivered';
        const statusIcon = isTransit ? 'local_shipping' : 'check_circle';
        const borderColor = isTransit ? 'var(--accent-yellow)' : '#282828';

        const itemsHtml = (order.items || []).map(item => \`
          <div class="order-item-row">
            <img src="\${item.image || 'assets/images/pet_visor_yellow_flame.png'}" alt="\${item.name}" class="order-item-thumb">
            <div style="flex:1;">
              <h4 style="font-family:var(--font-headline);font-size:1.15rem;color:#FFF;margin:0 0 2px;">
                \${item.name}
              </h4>
              <p style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;margin:0;">
                \${item.spec || 'CUSTOM MUSTAZ SPEC'}
              </p>
              <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--accent-pink);">
                QTY: \${item.qty || 1} × \${formatRupiah(item.price || 0)}
              </span>
            </div>
            <div style="font-family:var(--font-headline);font-size:1.2rem;color:#FFF;font-weight:900;">
              \${formatRupiah((item.price || 0) * (item.qty || 1))}
            </div>
          </div>
        \`).join('');

        return \`
          <div class="account-order-card" style="border-color:\${borderColor};margin-bottom:20px;">
            <div class="order-header-bar">
              <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                <span style="font-family:var(--font-headline);font-size:1.2rem;color:#FFF;letter-spacing:0.04em;">
                  ORDER #\${order.id}
                </span>
                <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">
                  PLACED ON \${order.date || 'RECENT'}
                </span>
              </div>
              <div>
                <span class="\${statusClass}">
                  <span class="material-symbols-outlined" style="font-size:16px;">\${statusIcon}</span>
                  \${order.status} // \${order.tracking || 'KURIR EKSPEDISI'}
                </span>
              </div>
            </div>

            <div class="order-items-list">
              \${itemsHtml}
            </div>

            <div class="order-footer-bar">
              <div>
                <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;display:block;">TOTAL TRANSACTION</span>
                <span style="font-family:var(--font-headline);font-size:1.4rem;color:var(--accent-yellow);font-weight:900;">
                  \${formatRupiah(order.total || 0)}
                </span>
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <a href="https://wa.me/6281234567890?text=Halo%20MUSTAZ%20CRAFT%2C%20saya%20ingin%20cek%20status%20order%20%23\${order.id}" target="_blank" class="btn-brutal-ghost btn-brutal-sm">
                  WHATSAPP SUPPORT
                </a>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // 4. User-Scoped Wishlist Renderer
    function renderAccountWishlist(email) {
      const container = document.getElementById('wishlistContainer');
      const metricWish = document.getElementById('metricWishlist');
      const navBadge = document.getElementById('navBadgeWishlist');

      const wishlist = getUserWishlist(email);
      if (metricWish) metricWish.textContent = wishlist.length;
      if (navBadge) navBadge.textContent = wishlist.length;

      if (!container) return;

      if (wishlist.length === 0) {
        container.innerHTML = \`
          <div style="grid-column:1/-1;background:#111;border:2px dashed #333;padding:48px 24px;text-align:center;">
            <span class="material-symbols-outlined" style="font-size:48px;color:#555;display:block;margin-bottom:12px;">favorite</span>
            <h3 style="font-family:var(--font-headline);font-size:1.4rem;color:#FFF;margin:0 0 6px;">WISHLIST MASIH KOSONG</h3>
            <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;max-width:420px;margin:0 auto 20px;line-height:1.5;">
              Simpan pet visor atau custom helmet favorit Anda untuk dibeli kemudian.
            </p>
            <a href="parts.html" class="btn-brutal-pink btn-brutal-sm" style="display:inline-flex;">
              LIHAT DAFTAR VISOR →
            </a>
          </div>
        \`;
        return;
      }

      container.innerHTML = wishlist.map(item => \`
        <div class="card-brutal-dark" style="padding:16px;">
          <div style="aspect-ratio:4/5;background:#080808;border:2px solid #000;overflow:hidden;margin-bottom:14px;">
            <img src="\${item.image || 'assets/images/pet_visor_yellow_flame.png'}" alt="\${item.name}" style="width:100%;height:100%;object-fit:cover;object-position:center;">
          </div>
          <h3 style="font-family:var(--font-headline);font-size:1.3rem;color:#FFF;margin-bottom:4px;">
            \${item.name}
          </h3>
          <p style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#AAA;margin-bottom:12px;">
            \${item.sub || item.category || 'CUSTOM PET VISOR'}
          </p>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px dashed #333;padding-top:12px;">
            <span style="font-family:var(--font-headline);font-size:1.3rem;color:var(--accent-yellow);">
              \${formatRupiah(item.price || 0)}
            </span>
            <button class="btn-brutal-pink btn-brutal-sm" data-add-to-cart="\${item.id}">
              + ADD TO CART
            </button>
          </div>
        </div>
      \`).join('');
    }

    // 5. User-Scoped Delivery Addresses Renderer
    function renderAccountAddresses(email, fullName, phone) {
      const container = document.getElementById('addressesContainer');
      if (!container) return;

      const addresses = getUserAddresses(email, fullName, phone);

      if (addresses.length === 0) {
        container.innerHTML = \`
          <div style="background:#111;border:2px dashed #333;padding:40px 24px;text-align:center;">
            <span class="material-symbols-outlined" style="font-size:40px;color:#555;display:block;margin-bottom:12px;">location_on</span>
            <h3 style="font-family:var(--font-headline);font-size:1.3rem;color:#FFF;margin:0 0 6px;">BELUM ADA ALAMAT TERSIMPAN</h3>
            <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;max-width:400px;margin:0 auto 16px;">
              Tambahkan alamat tujuan drop barang untuk mempercepat proses order dan checkout via WhatsApp.
            </p>
            <button class="btn-brutal-yellow btn-brutal-sm" id="btnAddNewAddrEmpty">
              + TAMBAH ALAMAT BARU
            </button>
          </div>
        \`;
        const btn = document.getElementById('btnAddNewAddrEmpty');
        if (btn) btn.onclick = () => openAddAddressModal(email, fullName);
        return;
      }

      container.innerHTML = addresses.map((addr) => \`
        <div style="background:#111;border:2px solid \${addr.isDefault ? 'var(--accent-pink)' : '#282828'};padding:24px;margin-bottom:20px;box-shadow:4px 4px 0px #000;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-family:var(--font-headline);font-size:1.2rem;color:#FFF;">\${addr.title || 'ALAMAT DROP'}</span>
              \${addr.isDefault ? '<span class="zine-tag-pink" style="font-size:0.65rem;padding:2px 8px;">DEFAULT ADDRESS</span>' : ''}
            </div>
          </div>
          <p style="font-family:var(--font-mono-sub);font-size:0.85rem;color:#FFF;font-weight:700;margin-bottom:4px;">
            \${addr.recipient || fullName || 'Penerima'}
          </p>
          <p style="font-size:0.9rem;color:#AAA;line-height:1.5;margin-bottom:8px;">
            \${addr.address || '-'}
          </p>
          \${addr.notes ? \`<span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:var(--accent-yellow);">NOTES: \${addr.notes}</span>\` : ''}
        </div>
      \`).join('');
    }

    function openAddAddressModal(email, fullName) {
      const title = prompt('Label Alamat (contoh: RUMAH / KANTOR / BENGKEL):', 'RUMAH');
      if (!title) return;
      const address = prompt('Alamat Lengkap & Kota Pengiriman:');
      if (!address) return;
      const notes = prompt('Catatan Kurir (opsional):', '');

      const newAddr = {
        id: 'addr-' + Date.now(),
        title: title.trim().toUpperCase(),
        isDefault: true,
        recipient: fullName || 'MEMBER',
        address: address.trim(),
        notes: (notes || '').trim()
      };
      saveUserAddress(email, newAddr);
      renderAccountAddresses(email, fullName);
    }

    const btnAddAddrHeader = document.getElementById('btnAddAddressBtn');
    if (btnAddAddrHeader) {
      btnAddAddrHeader.addEventListener('click', () => {
        const cur = loadProfile();
        openAddAddressModal(cur.email, cur.fullName);
      });
    }

    // 6. Master Sync Function
    function syncAllUserData(data) {
      const email = data.email || '';
      renderProfile(data);
      renderAccountOrders(email);
      renderAccountWishlist(email);
      renderAccountAddresses(email, data.fullName, data.phone);
    }

    // Initial load on page view from local cache
    const initialData = loadProfile();
    syncAllUserData(initialData);

    // Sync from Supabase Cloud database
    if (initialData.email) {
      try {
        const cloudData = await fetchCloudAccount(initialData.email);
        if (cloudData) syncAllUserData(cloudData);
      } catch {}
    }

    // Listen for cross-component auth or order updates
    window.addEventListener('mustaz:auth_synced', (e) => {
      if (e.detail) syncAllUserData(e.detail);
    });

    window.addEventListener('mustaz:orders_updated', () => {
      const cur = loadProfile();
      renderAccountOrders(cur.email);
    });

    window.addEventListener('mustaz:wishlist_updated', () => {
      const cur = loadProfile();
      renderAccountWishlist(cur.email);
    });

    // Save Changes Handler
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const stored = loadProfile();
        const updated = {
          fullName: document.getElementById('inputFullName').value.trim() || stored.fullName || 'MEMBER',
          alias: document.getElementById('inputAlias').value.trim() || stored.alias || 'Rider 7G',
          email: document.getElementById('inputEmail').value.trim() || stored.email || '',
          phone: document.getElementById('inputPhone').value.trim() || stored.phone || '',
          avatarUrl: stored.avatarUrl || '',
          role: stored.role || 'member'
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('Storage quota error:', e);
        }

        // Live update header banner, avatar, and data immediately
        syncAllUserData(updated);

        // Sync to Supabase Cloud database
        saveCloudAccount(updated).catch(() => {});

        // Visual confirmation message
        const notice = document.getElementById('profileSaveNotice');
        if (notice) {
          notice.style.display = 'block';
          notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            notice.style.display = 'none';
          }, 4000);
        }
      });
    }

    // Reset Button Handler
    const btnReset = document.getElementById('btnResetProfile');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        const stored = loadProfile();
        syncAllUserData(stored);
      });
    }

    // 7. Logout / Exit Protocol
    const btnNavLogout = document.getElementById('btnNavLogout');
    if (btnNavLogout) {
      btnNavLogout.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const { logoutUser } = await import('./js/services/authService.js');
          await logoutUser();
        } catch {}
        localStorage.removeItem('mustaz_auth_logged_in');
        window.location.href = 'login.html';
      });
    }
  });
</script>

${sharedFooter()}`;

  fs.writeFileSync("account.html", html);
  console.log("✅ account.html (Account & Arsenal Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6: LOGIN.HTML (ACCESS GRANTED)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6: LOGIN.HTML (ACCESS GRANTED)
// ─────────────────────────────────────────────────────────────────────────────
function buildLogin() {
  const html = `${pageHead('Login — Access Granted')}
${sharedHeader('login')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section class="login-split-layout">
    
    <!-- LEFT: GRITTY PHOTO COVER WITH RESPONSIVE RATIO -->
    <div class="login-visual-pane">
      <img src="assets/images/retro_checkered_helmet.png" alt="MUSTAZ Retro Helmet" class="login-visual-img">
      <div class="login-visual-overlay"></div>
      <div class="login-visual-content">
        <span class="zine-tag-yellow" style="margin-bottom:10px;display:inline-block;">ENTRY PROTOCOL // MUSTAZ CRAFT</span>
        <h1 class="editorial-title" style="font-size:clamp(2.5rem, 5vw, 4.5rem);line-height:0.9;margin:6px 0 10px;">
          ACCESS<br><span style="color:var(--accent-yellow);">GRANTED.</span>
        </h1>
        <p style="color:#DDD;font-family:var(--font-mono-sub);font-size:0.8rem;max-width:340px;letter-spacing:0.08em;line-height:1.4;margin:0;">
          IDENTIFY YOURSELF BEFORE ENTERING THE GARAGE. UNREGISTERED FREQUENCIES WILL BE TERMINATED.
        </p>
      </div>
    </div>

    <!-- RIGHT: BRUTALIST CREDENTIALS FORM -->
    <div class="login-form-pane">
      <div class="login-card-inner">
        <div style="margin-bottom:20px;display:flex;align-items:center;gap:14px;">
          <img src="assets/images/mustaz_logo_official.png" alt="MUSTAZ Logo" style="height:44px;width:auto;object-fit:contain;">
          <span class="zine-tag-pink" style="font-size:0.65rem;padding:2px 8px;">MEMBER GATE</span>
        </div>

        <h2 style="font-family:var(--font-headline);font-size:clamp(1.8rem, 4vw, 2.4rem);color:#FFF;margin:0 0 6px;">
          AUTHENTICATE
        </h2>
        <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#777;margin:0 0 20px;">
          CHOOSE YOUR AUTHENTICATION PROTOCOL TO ACCESS THE GARAGE.
        </p>

        <!-- Status / Alert Message -->
        <div id="authAlert" style="display:none;padding:12px 14px;border:2px solid #FF4444;background:#1A0505;color:#FF8888;font-family:var(--font-mono-sub);font-size:0.75rem;margin-bottom:18px;line-height:1.4;">
        </div>

        <!-- 1. GOOGLE OAUTH DIRECT BUTTON -->
        <button type="button" id="btnGoogleLogin" class="btn-brutal-dark" style="width:100%;padding:13px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:0.95rem;background:#141414;border:2px solid #333;color:#FFF;cursor:pointer;margin-bottom:20px;box-shadow:4px 4px 0px #000;">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span style="font-family:var(--font-headline);letter-spacing:0.04em;">CONTINUE WITH GOOGLE</span>
        </button>

        <div style="display:flex;align-items:center;margin-bottom:18px;">
          <div style="flex:1;height:1px;background:#282828;"></div>
          <span style="padding:0 12px;font-family:var(--font-mono-sub);font-size:0.68rem;color:#777;letter-spacing:0.1em;">OR USE EMAIL</span>
          <div style="flex:1;height:1px;background:#282828;"></div>
        </div>

        <!-- AUTH TABS: PASSWORD VS OTP -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;">
          <button type="button" id="tabBtnPassword" class="btn-brutal-yellow btn-brutal-sm" style="text-align:center;font-size:0.75rem;padding:8px 6px;">
            EMAIL & PASSWORD
          </button>
          <button type="button" id="tabBtnOtp" class="btn-brutal-dark btn-brutal-sm" style="text-align:center;font-size:0.75rem;padding:8px 6px;">
            EMAIL OTP (KODE MASUK)
          </button>
        </div>

        <!-- TAB 1: PASSWORD FORM -->
        <form id="passwordLoginForm">
          <div class="form-group-brutal">
            <label class="form-label-brutal">CREDENTIAL ID / EMAIL</label>
            <input type="email" id="loginEmail" class="form-input-brutal" placeholder="your@frequency.net" required autocomplete="email">
          </div>
          <div class="form-group-brutal" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label class="form-label-brutal" style="margin-bottom:0;">SECURITY PASSCODE</label>
              <a href="forgot-password.html" style="font-family:var(--font-mono-sub);font-size:0.72rem;color:var(--accent-pink);text-decoration:none;">LUPA PASSWORD?</a>
            </div>
            <input type="password" id="loginPassword" class="form-input-brutal" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" id="btnSubmitPassword" class="btn-brutal-pink" style="width:100%;padding:14px;font-size:1.05rem;">
            ENTER GARAGE →
          </button>
        </form>

        <!-- TAB 2: EMAIL OTP FORM -->
        <form id="otpLoginForm" style="display:none;">
          <!-- Step 1: Request OTP -->
          <div id="otpStep1">
            <div class="form-group-brutal">
              <label class="form-label-brutal">YOUR EMAIL ADDRESS</label>
              <input type="email" id="otpEmail" class="form-input-brutal" placeholder="your@frequency.net">
              <span style="font-family:var(--font-mono-sub);font-size:0.7rem;color:#888;display:block;margin-top:6px;">
                Kode 6-digit rahasia akan dikirimkan langsung ke inbox email Anda.
              </span>
            </div>
            <button type="button" id="btnRequestOtp" class="btn-brutal-yellow" style="width:100%;padding:14px;font-size:1.05rem;">
              KIRIM KODE OTP KE EMAIL →
            </button>
          </div>

          <!-- Step 2: Verify OTP -->
          <div id="otpStep2" style="display:none;">
            <div class="form-group-brutal">
              <label class="form-label-brutal">MASUKKAN 6-DIGIT KODE OTP</label>
              <input type="text" id="otpCode" class="form-input-brutal" placeholder="123456" maxlength="6" style="letter-spacing:0.3em;text-align:center;font-size:1.3rem;font-family:var(--font-headline);">
              <span style="font-family:var(--font-mono-sub);font-size:0.7rem;color:#888;display:block;margin-top:6px;" id="otpSentNotice">
                Cek inbox atau spam email Anda.
              </span>
            </div>
            <button type="button" id="btnVerifyOtp" class="btn-brutal-pink" style="width:100%;padding:14px;font-size:1.05rem;margin-bottom:10px;">
              VERIFIKASI & MASUK →
            </button>
            <button type="button" id="btnBackToOtpStep1" class="btn-brutal-dark btn-brutal-sm" style="width:100%;text-align:center;">
              ← GANTI EMAIL
            </button>
          </div>
        </form>

        <div style="margin-top:24px;text-align:center;border-top:1px dashed #282828;padding-top:18px;">
          <span style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;">
            BELUM MEMILIKI AKUN? <a href="register.html" style="color:var(--accent-yellow);font-weight:700;text-decoration:none;">DAFTAR AKUN SEKARANG →</a>
          </span>
        </div>
      </div>
    </div>

  </section>
</main>

<script type="module">
  import { loginWithPassword, sendEmailOtp, verifyEmailOtp, loginWithGoogle, initAccountAuth } from './js/services/authService.js';

  document.addEventListener('DOMContentLoaded', async () => {
    // If returning from Google OAuth or already logged in, redirect directly to account
    const isAuthed = await initAccountAuth();
    if (isAuthed) {
      window.location.replace('account.html');
      return;
    }

    const alertBox = document.getElementById('authAlert');

    function showAlert(msg, isSuccess = false) {
      if (!alertBox) return;
      alertBox.style.display = 'block';
      alertBox.style.background = isSuccess ? '#051A0B' : '#1A0505';
      alertBox.style.borderColor = isSuccess ? '#22c55e' : '#FF4444';
      alertBox.style.color = isSuccess ? '#86efac' : '#FF8888';
      alertBox.textContent = msg;
    }

    // 1. Google OAuth
    document.getElementById('btnGoogleLogin')?.addEventListener('click', async () => {
      try {
        showAlert('⏳ Mengarahkan ke Google Login...', true);
        await loginWithGoogle();
      } catch (err) {
        showAlert('Google Login error: ' + err.message);
      }
    });

    // 2. Tab Toggles
    const tabBtnPassword = document.getElementById('tabBtnPassword');
    const tabBtnOtp = document.getElementById('tabBtnOtp');
    const passwordForm = document.getElementById('passwordLoginForm');
    const otpForm = document.getElementById('otpLoginForm');

    tabBtnPassword?.addEventListener('click', () => {
      tabBtnPassword.className = 'btn-brutal-yellow btn-brutal-sm';
      tabBtnOtp.className = 'btn-brutal-dark btn-brutal-sm';
      passwordForm.style.display = 'block';
      otpForm.style.display = 'none';
      if (alertBox) alertBox.style.display = 'none';
    });

    tabBtnOtp?.addEventListener('click', () => {
      tabBtnOtp.className = 'btn-brutal-yellow btn-brutal-sm';
      tabBtnPassword.className = 'btn-brutal-dark btn-brutal-sm';
      otpForm.style.display = 'block';
      passwordForm.style.display = 'none';
      if (alertBox) alertBox.style.display = 'none';
    });

    // 3. Password Login
    passwordForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value;
      const btn = document.getElementById('btnSubmitPassword');

      try {
        btn.textContent = 'AUTHENTICATING...';
        btn.disabled = true;
        await loginWithPassword(email, pass);
        showAlert('✓ Login Berhasil! Membuka garasi...', true);
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 800);
      } catch (err) {
        btn.textContent = 'ENTER GARAGE →';
        btn.disabled = false;
        showAlert('Gagal Masuk: ' + (err.message || 'Periksa kembali email dan password Anda'));
      }
    });

    // 4. OTP Request & Verification
    const btnRequestOtp = document.getElementById('btnRequestOtp');
    const btnVerifyOtp = document.getElementById('btnVerifyOtp');
    const otpStep1 = document.getElementById('otpStep1');
    const otpStep2 = document.getElementById('otpStep2');
    const otpEmailInput = document.getElementById('otpEmail');
    const otpCodeInput = document.getElementById('otpCode');

    btnRequestOtp?.addEventListener('click', async () => {
      const email = otpEmailInput.value.trim();
      if (!email) {
        showAlert('Silakan masukkan alamat email Anda.');
        return;
      }

      try {
        btnRequestOtp.textContent = 'MENGIRIM KODE...';
        btnRequestOtp.disabled = true;
        await sendEmailOtp(email);
        showAlert('✓ Kode OTP 6-digit berhasil dikirim ke ' + email, true);
        otpStep1.style.display = 'none';
        otpStep2.style.display = 'block';
        document.getElementById('otpSentNotice').textContent = 'Kode OTP dikirim ke: ' + email;
      } catch (err) {
        btnRequestOtp.textContent = 'KIRIM KODE OTP KE EMAIL →';
        btnRequestOtp.disabled = false;
        showAlert('Gagal mengirim OTP: ' + err.message);
      }
    });

    btnVerifyOtp?.addEventListener('click', async () => {
      const email = otpEmailInput.value.trim();
      const token = otpCodeInput.value.trim();
      if (!token || token.length < 6) {
        showAlert('Masukkan 6-digit kode OTP lengkap.');
        return;
      }

      try {
        btnVerifyOtp.textContent = 'MEMVERIFIKASI...';
        btnVerifyOtp.disabled = true;
        await verifyEmailOtp(email, token);
        showAlert('✓ Verifikasi OTP Berhasil! Mengalihkan...', true);
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 800);
      } catch (err) {
        btnVerifyOtp.textContent = 'VERIFIKASI & MASUK →';
        btnVerifyOtp.disabled = false;
        showAlert('Kode OTP Salah atau Kadaluarsa: ' + err.message);
      }
    });

    document.getElementById('btnBackToOtpStep1')?.addEventListener('click', () => {
      otpStep2.style.display = 'none';
      otpStep1.style.display = 'block';
      btnRequestOtp.textContent = 'KIRIM KODE OTP KE EMAIL →';
      btnRequestOtp.disabled = false;
    });
  });
</script>

${sharedFooter()}`;

  fs.writeFileSync("login.html", html);
  console.log("✅ login.html   (Dual-Mode Login & Google OAuth Completed)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6B: REGISTER.HTML (NEW MEMBER ENROLLMENT)
// ─────────────────────────────────────────────────────────────────────────────
function buildRegister() {
  const html = `${pageHead('Register — Join Mustaz Craft')}
${sharedHeader('account')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section class="login-split-layout">
    
    <!-- LEFT: PHOTO COVER -->
    <div class="login-visual-pane">
      <img src="assets/images/mustaz_booth_event.png" alt="MUSTAZ Craft Enrollment" class="login-visual-img">
      <div class="login-visual-overlay"></div>
      <div class="login-visual-content">
        <span class="zine-tag-yellow" style="margin-bottom:10px;display:inline-block;">ENROLLMENT PROTOCOL // MUSTAZ CRAFT</span>
        <h1 class="editorial-title" style="font-size:clamp(2.5rem, 5vw, 4.5rem);line-height:0.9;margin:6px 0 10px;">
          JOIN THE<br><span style="color:var(--accent-yellow);">SQUAD.</span>
        </h1>
        <p style="color:#DDD;font-family:var(--font-mono-sub);font-size:0.8rem;max-width:340px;letter-spacing:0.08em;line-height:1.4;margin:0;">
          GET EARLY DISPATCH ALERTS, EXCLUSIVE LIMITED DROPS, AND SAVE YOUR HELMET FITMENT SPECS.
        </p>
      </div>
    </div>

    <!-- RIGHT: REGISTRATION FORM -->
    <div class="login-form-pane">
      <div class="login-card-inner">
        <div style="margin-bottom:20px;display:flex;align-items:center;gap:14px;">
          <img src="assets/images/mustaz_logo_official.png" alt="MUSTAZ Logo" style="height:44px;width:auto;object-fit:contain;">
          <span class="zine-tag-yellow" style="font-size:0.65rem;padding:2px 8px;">NEW REGISTRATION</span>
        </div>

        <h2 style="font-family:var(--font-headline);font-size:clamp(1.8rem, 4vw, 2.4rem);color:#FFF;margin:0 0 6px;">
          CREATE ACCOUNT
        </h2>
        <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#777;margin:0 0 20px;">
          REGISTER WITH GOOGLE OR FILL OUT YOUR CREDENTIALS BELOW.
        </p>

        <!-- Alert Box -->
        <div id="regAlert" style="display:none;padding:12px 14px;border:2px solid #FF4444;background:#1A0505;color:#FF8888;font-family:var(--font-mono-sub);font-size:0.75rem;margin-bottom:18px;line-height:1.4;">
        </div>

        <!-- Google OAuth Button -->
        <button type="button" id="btnGoogleRegister" class="btn-brutal-dark" style="width:100%;padding:13px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:0.95rem;background:#141414;border:2px solid #333;color:#FFF;cursor:pointer;margin-bottom:20px;box-shadow:4px 4px 0px #000;">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span style="font-family:var(--font-headline);letter-spacing:0.04em;">CONTINUE WITH GOOGLE</span>
        </button>

        <div style="display:flex;align-items:center;margin-bottom:18px;">
          <div style="flex:1;height:1px;background:#282828;"></div>
          <span style="padding:0 12px;font-family:var(--font-mono-sub);font-size:0.68rem;color:#777;letter-spacing:0.1em;">OR REGISTER WITH EMAIL</span>
          <div style="flex:1;height:1px;background:#282828;"></div>
        </div>

        <form id="registerForm">
          <div class="form-group-brutal">
            <label class="form-label-brutal">FULL NAME / ALIAS *</label>
            <input type="text" id="regFullName" class="form-input-brutal" placeholder="e.g. Raihan Pratama" required>
          </div>

          <div class="form-group-brutal">
            <label class="form-label-brutal">WHATSAPP / PHONE NUMBER</label>
            <input type="tel" id="regPhone" class="form-input-brutal" placeholder="e.g. +62 812-3456-7890">
          </div>

          <div class="form-group-brutal">
            <label class="form-label-brutal">EMAIL ADDRESS *</label>
            <input type="email" id="regEmail" class="form-input-brutal" placeholder="your@frequency.net" required>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
            <div class="form-group-brutal" style="margin-bottom:0;">
              <label class="form-label-brutal">PASSWORD *</label>
              <input type="password" id="regPassword" class="form-input-brutal" placeholder="••••••••" minlength="6" required>
            </div>
            <div class="form-group-brutal" style="margin-bottom:0;">
              <label class="form-label-brutal">CONFIRM *</label>
              <input type="password" id="regConfirmPassword" class="form-input-brutal" placeholder="••••••••" minlength="6" required>
            </div>
          </div>

          <button type="submit" id="btnSubmitRegister" class="btn-brutal-yellow" style="width:100%;padding:14px;font-size:1.05rem;">
            CREATE ACCOUNT →
          </button>
        </form>

        <div style="margin-top:24px;text-align:center;border-top:1px dashed #282828;padding-top:18px;">
          <span style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;">
            SUDAH PUNYA AKUN? <a href="login.html" style="color:var(--accent-pink);font-weight:700;text-decoration:none;">LOGIN DI SINI →</a>
          </span>
        </div>
      </div>
    </div>

  </section>
</main>

<script type="module">
  import { registerWithEmail, loginWithGoogle } from './js/services/authService.js';

  document.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('regAlert');

    function showAlert(msg, isSuccess = false) {
      if (!alertBox) return;
      alertBox.style.display = 'block';
      alertBox.style.background = isSuccess ? '#051A0B' : '#1A0505';
      alertBox.style.borderColor = isSuccess ? '#22c55e' : '#FF4444';
      alertBox.style.color = isSuccess ? '#86efac' : '#FF8888';
      alertBox.textContent = msg;
    }

    // Google Register
    document.getElementById('btnGoogleRegister')?.addEventListener('click', async () => {
      try {
        showAlert('⏳ Mengarahkan ke Google Auth...', true);
        await loginWithGoogle();
      } catch (err) {
        showAlert('Google Auth error: ' + err.message);
      }
    });

    // Form Submit
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirmPassword').value;
      const btn = document.getElementById('btnSubmitRegister');

      if (pass !== confirm) {
        showAlert('Konfirmasi password tidak cocok.');
        return;
      }

      try {
        btn.textContent = 'CREATING ACCOUNT...';
        btn.disabled = true;
        await registerWithEmail(email, pass, { fullName, phone });
        showAlert('✓ Pendaftaran berhasil! Akun telah tersimpan di Supabase. Mengalihkan...', true);
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 1200);
      } catch (err) {
        btn.textContent = 'CREATE ACCOUNT →';
        btn.disabled = false;
        showAlert('Gagal mendaftar: ' + err.message);
      }
    });
  });
</script>

${sharedFooter()}`;

  fs.writeFileSync("register.html", html);
  console.log("✅ register.html (Account Registration Page Generated)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 6C: FORGOT-PASSWORD.HTML (PASSCODE RECOVERY)
// ─────────────────────────────────────────────────────────────────────────────
function buildForgotPassword() {
  const html = `${pageHead('Forgot Password — Mustaz Craft')}
${sharedHeader('account')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section class="login-split-layout">
    
    <!-- LEFT: PHOTO COVER -->
    <div class="login-visual-pane">
      <img src="assets/images/pet_visor_yellow_flame.png" alt="MUSTAZ Flame Visor" class="login-visual-img">
      <div class="login-visual-overlay"></div>
      <div class="login-visual-content">
        <span class="zine-tag-pink" style="margin-bottom:10px;display:inline-block;">SECURITY PROTOCOL // MUSTAZ CRAFT</span>
        <h1 class="editorial-title" style="font-size:clamp(2.5rem, 5vw, 4.5rem);line-height:0.9;margin:6px 0 10px;">
          RECOVER<br><span style="color:var(--accent-pink);">ACCESS.</span>
        </h1>
        <p style="color:#DDD;font-family:var(--font-mono-sub);font-size:0.8rem;max-width:340px;letter-spacing:0.08em;line-height:1.4;margin:0;">
          PASSCODE RECOVERY WILL DISPATCH A SECURE VERIFICATION LINK DIRECTLY TO YOUR EMAIL.
        </p>
      </div>
    </div>

    <!-- RIGHT: RECOVERY FORM -->
    <div class="login-form-pane">
      <div class="login-card-inner">
        <div style="margin-bottom:20px;display:flex;align-items:center;gap:14px;">
          <img src="assets/images/mustaz_logo_official.png" alt="MUSTAZ Logo" style="height:44px;width:auto;object-fit:contain;">
          <span class="zine-tag-yellow" style="font-size:0.65rem;padding:2px 8px;">PASSCODE RECOVERY</span>
        </div>

        <h2 style="font-family:var(--font-headline);font-size:clamp(1.8rem, 4vw, 2.4rem);color:#FFF;margin:0 0 6px;" id="recoveryTitle">
          RESET PASSCODE
        </h2>
        <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#777;margin:0 0 24px;" id="recoverySubtitle">
          ENTER YOUR REGISTERED EMAIL TO RECEIVE PASSWORD RECOVERY INSTRUCTIONS.
        </p>

        <!-- Alert Box -->
        <div id="resetAlert" style="display:none;padding:12px 14px;border:2px solid #FF4444;background:#1A0505;color:#FF8888;font-family:var(--font-mono-sub);font-size:0.75rem;margin-bottom:18px;line-height:1.4;">
        </div>

        <!-- FORM 1: SEND RESET LINK -->
        <form id="sendResetForm">
          <div class="form-group-brutal">
            <label class="form-label-brutal">REGISTERED EMAIL ADDRESS</label>
            <input type="email" id="resetEmail" class="form-input-brutal" placeholder="your@frequency.net" required>
          </div>
          <button type="submit" id="btnSendReset" class="btn-brutal-pink" style="width:100%;padding:14px;font-size:1.05rem;">
            KIRIM LINK RESET KE EMAIL →
          </button>
        </form>

        <!-- FORM 2: NEW PASSWORD (IF ARRIVING FROM RECOVERY LINK) -->
        <form id="newPasswordForm" style="display:none;">
          <div class="form-group-brutal">
            <label class="form-label-brutal">NEW PASSCODE (MIN 6 CHARS)</label>
            <input type="password" id="newPassInput" class="form-input-brutal" placeholder="••••••••" minlength="6" required>
          </div>
          <button type="submit" id="btnSetNewPass" class="btn-brutal-yellow" style="width:100%;padding:14px;font-size:1.05rem;">
            UPDATE PASSCODE ✓
          </button>
        </form>

        <div style="margin-top:24px;text-align:center;border-top:1px dashed #282828;padding-top:18px;">
          <span style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#888;">
            INGAT PASSWORD ANDA? <a href="login.html" style="color:var(--accent-yellow);font-weight:700;text-decoration:none;">KEMBALI KE LOGIN →</a>
          </span>
        </div>
      </div>
    </div>

  </section>
</main>

<script type="module">
  import { requestPasswordReset, updatePassword } from './js/services/authService.js';

  document.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('resetAlert');

    function showAlert(msg, isSuccess = false) {
      if (!alertBox) return;
      alertBox.style.display = 'block';
      alertBox.style.background = isSuccess ? '#051A0B' : '#1A0505';
      alertBox.style.borderColor = isSuccess ? '#22c55e' : '#FF4444';
      alertBox.style.color = isSuccess ? '#86efac' : '#FF8888';
      alertBox.textContent = msg;
    }

    // Check if arriving from Supabase recovery redirect
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      document.getElementById('sendResetForm').style.display = 'none';
      document.getElementById('newPasswordForm').style.display = 'block';
      document.getElementById('recoveryTitle').textContent = 'SET NEW PASSCODE';
      document.getElementById('recoverySubtitle').textContent = 'ENTER YOUR NEW SECURE PASSWORD BELOW.';
    }

    // Send Reset Link
    document.getElementById('sendResetForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();
      const btn = document.getElementById('btnSendReset');

      try {
        btn.textContent = 'SENDING LINK...';
        btn.disabled = true;
        await requestPasswordReset(email);
        showAlert('✓ Instruksi reset password telah dikirim ke ' + email + '. Silakan periksa inbox email Anda.', true);
      } catch (err) {
        btn.textContent = 'KIRIM LINK RESET KE EMAIL →';
        btn.disabled = false;
        showAlert('Gagal mengirim link reset: ' + err.message);
      }
    });

    // Set New Password
    document.getElementById('newPasswordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPass = document.getElementById('newPassInput').value;
      const btn = document.getElementById('btnSetNewPass');

      try {
        btn.textContent = 'UPDATING...';
        btn.disabled = true;
        await updatePassword(newPass);
        showAlert('✓ Password berhasil diperbarui! Mengalihkan ke login...', true);
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      } catch (err) {
        btn.textContent = 'UPDATE PASSCODE ✓';
        btn.disabled = false;
        showAlert('Gagal memperbarui password: ' + err.message);
      }
    });
  });
</script>

${sharedFooter()}`;

  fs.writeFileSync("forgot-password.html", html);
  console.log("✅ forgot-password.html (Passcode Recovery Page Generated)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 7: CHECKOUT.HTML (FINAL PROTOCOL)
// ─────────────────────────────────────────────────────────────────────────────
function buildCheckout() {
  const html = `${pageHead('Checkout — Final Protocol')}
${sharedHeader('account')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section style="padding:60px 0 100px;">
    <div class="wrap">
      
      <!-- Checkout Document Header -->
      <div style="border-bottom:2px solid #282828;padding-bottom:32px;margin-bottom:48px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <span class="zine-tag-pink">FINAL PROTOCOL</span>
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">GATEWAY 01 // DIRECT WHATSAPP</span>
        </div>
        <h1 class="editorial-title" style="font-size:clamp(3rem, 7vw, 6rem);margin-bottom:8px;color:var(--accent-pink);">
          ORDER MANIFEST
        </h1>
        <p class="editorial-desc">
          Verify cargo specifications. Confirm your deployment coordinates. No refunds in the wasteland.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;">
        
        <!-- Left: Dynamic Cargo Manifest (From LocalStorage) -->
        <div class="card-brutal-white" style="box-shadow:10px 10px 0px #000;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:16px;">
            <h2 style="font-family:var(--font-headline);font-size:1.6rem;color:#000;">01 // CARGO SUMMARY</h2>
            <span class="barcode-decor-dark" style="height:20px;width:80px;"></span>
          </div>
          <div id="checkoutPageItemsList" style="margin-bottom:24px;">
            <!-- Rendered by inline script below from cart data -->
          </div>
          <div style="border-top:3px solid #000;padding-top:16px;display:flex;justify-content:space-between;align-items:baseline;">
            <span style="font-family:var(--font-headline);font-size:1.4rem;color:#000;font-weight:900;">TOTAL MANIFEST</span>
            <span style="font-family:var(--font-headline);font-size:2rem;color:var(--accent-pink);font-weight:900;" id="checkoutPageTotal">
              Rp 0
            </span>
          </div>
        </div>

        <!-- Right: Deployment Form -->
        <div class="card-brutal-dark" style="border-color:var(--accent-pink);padding:32px;">
          <h2 style="font-family:var(--font-headline);font-size:1.6rem;color:#FFF;margin-bottom:24px;border-bottom:1px solid #333;padding-bottom:12px;">
            02 // DISPATCH PROTOCOL
          </h2>
          <form id="directCheckoutForm">
            <div class="form-group-brutal">
              <label class="form-label-brutal">CONSIGNEE NAME / ALIAS *</label>
              <input type="text" id="chkName" class="form-input-brutal" placeholder="Raihan / Road Runner" required>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal">WHATSAPP NUMBER *</label>
              <input type="tel" id="chkPhone" class="form-input-brutal" placeholder="08xxxxxxxxxx" required>
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal">DELIVERY COORDINATES (STREET & SECTOR) *</label>
              <textarea id="chkAddress" class="form-input-brutal" rows="3" placeholder="Full street address, city, postal code" required></textarea>
            </div>
            <div class="form-group-brutal" style="margin-bottom:28px;">
              <label class="form-label-brutal">PAYMENT PROTOCOL *</label>
              <select id="chkPayment" class="form-input-brutal" style="cursor:pointer;">
                <option value="Transfer Bank (BCA / Mandiri)">Transfer Bank (BCA / Mandiri)</option>
                <option value="QRIS Instant Pay">QRIS Instant Pay</option>
                <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                <option value="Direct WhatsApp Negotiation">Direct WhatsApp Negotiation</option>
              </select>
            </div>
            <button type="submit" class="btn-brutal-pink" style="width:100%;padding:18px;font-size:1.15rem;">
              CONFIRM ORDER VIA WHATSAPP →
            </button>
          </form>
        </div>

      </div>

    </div>
  </section>
</main>

<script type="module">
  import { getCart, getCartTotal, formatRupiah, generateWhatsAppUrl, clearCart, saveUserOrder } from './js/services/cartService.js';
  import { saveCloudOrder } from './js/services/supabaseService.js';

  function renderPageCheckout() {
    const list = document.getElementById('checkoutPageItemsList');
    const totalEl = document.getElementById('checkoutPageTotal');
    const items = getCart();
    const total = getCartTotal();

    if (totalEl) totalEl.textContent = formatRupiah(total);

    if (!items || items.length === 0) {
      if (list) {
        list.innerHTML = \`
          <div style="text-align:center;padding:32px 0;">
            <p style="font-family:var(--font-headline);font-size:1.4rem;color:#000;">ARSENAL IS EMPTY</p>
            <p style="font-size:0.85rem;color:#666;margin-top:6px;">Add parts or choppers before completing protocol.</p>
            <a href="parts.html" class="btn-brutal-pink btn-brutal-sm" style="margin-top:16px;display:inline-flex;">ENTER PARTS SHOP</a>
          </div>
        \`;
      }
      return;
    }

    if (list) {
      list.innerHTML = items.map(item => \`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px dashed #CCC;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="\${item.image || ''}" style="width:44px;height:44px;object-fit:cover;border:1px solid #000;" onerror="this.style.display='none'">
            <div>
              <div style="font-family:var(--font-headline);font-size:1.1rem;color:#000;">\${item.name}</div>
              <div style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#666;">QTY: \${item.quantity}</div>
            </div>
          </div>
          <div style="font-family:var(--font-headline);font-size:1.15rem;color:var(--accent-pink);font-weight:900;">
            \${formatRupiah(item.price * item.quantity)}
          </div>
        </div>
      \`).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderPageCheckout();

    document.getElementById('directCheckoutForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const items = getCart();
      if (!items || items.length === 0) {
        alert('Your arsenal is empty! Please add hardware first.');
        return;
      }
      const name = document.getElementById('chkName').value.trim();
      const phone = document.getElementById('chkPhone').value.trim();
      const address = document.getElementById('chkAddress').value.trim();
      const payment = document.getElementById('chkPayment').value;
      const total = getCartTotal();

      // Log order to Supabase Cloud Orders in background
      saveCloudOrder({
        customer: name,
        items: items.map(i => \`\${i.name} (x\${i.quantity})\`).join(', '),
        total: total,
        status: 'PROCESSING'
      }).catch(() => {});

      // Save to user's localized order history
      const orderRecord = {
        id: 'MSTZ-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(),
        status: 'IN TRANSIT',
        tracking: 'J&T EXPRESS [PENDING DISPATCH]',
        items: items.map(i => ({
          name: i.name,
          spec: i.category || i.sub || 'CUSTOM MUSTAZ PART',
          qty: i.quantity,
          price: i.price,
          image: i.image || i.image_url || 'assets/images/pet_visor_yellow_flame.png'
        })),
        total: total
      };
      saveUserOrder(null, orderRecord);

      const url = generateWhatsAppUrl({ name, phone, address, payment }, items, total);
      window.open(url, '_blank');
      clearCart();
      window.location.href = 'shipping.html';
    });
  });
</script>

${sharedFooter()}`;

  fs.writeFileSync("checkout.html", html);
  console.log("✅ checkout.html (Checkout Protocol Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 8: SHIPPING.HTML (DROP LOCATION)
// ─────────────────────────────────────────────────────────────────────────────
function buildShipping() {
  const html = `${pageHead('Shipping — Drop Location')}
${sharedHeader('account')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section style="padding:60px 0 100px;">
    <div class="wrap">
      
      <!-- Shipping Header -->
      <div style="border-bottom:2px solid #282828;padding-bottom:32px;margin-bottom:48px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <span class="zine-tag-pink">DEPLOYMENT ZONE</span>
          <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">COORDINATES // PROTOCOL 02</span>
        </div>
        <h1 class="editorial-title" style="font-size:clamp(3rem, 7vw, 6rem);margin-bottom:8px;color:var(--accent-pink);">
          DROP LOCATION
        </h1>
        <p class="editorial-desc">
          Lock your coordinates. We deploy immediately upon confirmation. Ensure comms line is live.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:48px;align-items:start;">
        
        <!-- Form -->
        <div class="card-brutal-dark" style="border-color:var(--accent-pink);padding:32px;">
          <h2 style="font-family:var(--font-headline);font-size:1.6rem;color:#FFF;margin-bottom:24px;border-bottom:1px solid #333;padding-bottom:12px;">
            CONSIGNEE COORDINATES
          </h2>
          <form id="shippingForm">
            <div class="form-group-brutal">
              <label class="form-label-brutal">FULL NAME / ALIAS *</label>
              <input type="text" class="form-input-brutal" placeholder="Your name or alias" required value="Raihan">
            </div>
            <div class="form-group-brutal">
              <label class="form-label-brutal">STREET / ALLEY / GARAGE *</label>
              <input type="text" class="form-input-brutal" placeholder="Jl. Nowhere No.7" required value="Jl. Wasteland No.7">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div class="form-group-brutal">
                <label class="form-label-brutal">CITY / SECTOR *</label>
                <input type="text" class="form-input-brutal" placeholder="Depok / Sector 7G" required value="Depok">
              </div>
              <div class="form-group-brutal">
                <label class="form-label-brutal">POSTAL CODE *</label>
                <input type="text" class="form-input-brutal" placeholder="16424" required value="16424">
              </div>
            </div>
            <div class="form-group-brutal" style="margin-bottom:28px;">
              <label class="form-label-brutal">REGION / PROVINCE *</label>
              <input type="text" class="form-input-brutal" placeholder="Jawa Barat" required value="Jawa Barat">
            </div>
            <button type="submit" class="btn-brutal-pink" style="width:100%;padding:18px;font-size:1.15rem;">
              LOCK IT IN ✓
            </button>
          </form>
        </div>

        <!-- Warning & Coordinates Diagram -->
        <div>
          <!-- Warning Notice -->
          <div style="border:3px dashed var(--accent-pink);padding:32px;background:rgba(255,0,140,0.05);margin-bottom:24px;box-shadow:6px 6px 0px #000;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <span class="material-symbols-outlined" style="color:var(--accent-pink);font-size:32px;">warning</span>
              <h3 style="font-family:var(--font-headline);font-size:1.6rem;color:#FFF;">SECURITY NOTICE</h3>
            </div>
            <p style="color:#BBB;line-height:1.6;font-size:0.9rem;">
              Double check your drop coordinates. We are not responsible for lost packages in uncharted zones or intercepted drops. All shipments are sealed in heavy industrial packaging.
            </p>
          </div>

          <!-- Order Status Protocol -->
          <div class="card-brutal-white">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:2px solid #000;padding-bottom:10px;">
              <span style="font-family:var(--font-headline);font-size:1.2rem;color:#000;">DISPATCH PROTOCOL</span>
              <span class="zine-tag-pink">ARMED</span>
            </div>
            <p style="font-size:0.85rem;color:#444;line-height:1.5;margin-bottom:16px;">
              Courier lines are dispatched through JNE / J&T Cargo or Direct Courier for custom chopper builds. Tracking codes transmitted via WhatsApp.
            </p>
            <a href="parts.html" class="btn-brutal-dark" style="background:#000;color:#FFF;width:100%;text-align:center;display:block;padding:12px;">
              CONTINUE BROWSING HARDWARE →
            </a>
          </div>
        </div>

      </div>

    </div>
  </section>
</main>

<script>
  document.getElementById('shippingForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('COORDINATES LOCKED IN. PROTOCOL DISPATCHED.');
    window.location.href = 'index.html';
  });
</script>

${sharedFooter()}`;

  fs.writeFileSync("shipping.html", html);
  console.log("✅ shipping.html (Shipping Coordinates Redesigned)");
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 9: ADMIN DASHBOARD (admin.html)
// ─────────────────────────────────────────────────────────────────────────────
function buildAdmin() {
  const html = `${pageHead('Admin Console — MUSTAZ CRAFT Workshop')}
${sharedHeader('account')}
${sharedMarquee()}

<main style="padding-top:70px;background:#080808;min-height:calc(100vh - 70px);">
  <section style="padding:40px 0 90px;">
    <div class="wrap">
      
      <!-- Top Admin Greeting & Overview Card (Harmonized with account.html) -->
      <div class="card-brutal-dark" style="margin-bottom:36px;border-color:var(--accent-yellow);padding:28px 32px;background:#0f0f0f;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;">
          
          <!-- Avatar + Member Bio -->
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:72px;height:72px;background:var(--accent-yellow);border:3px solid #000000;box-shadow:4px 4px 0px var(--accent-pink);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="font-family:var(--font-headline);font-size:2.2rem;font-weight:900;color:#000000;line-height:1;">M</span>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap;">
                <h1 class="editorial-title" style="font-size:clamp(1.8rem, 3.5vw, 2.5rem);margin:0;color:#FFF;line-height:1;">
                  MUSTAZ CRAFT ADMIN
                </h1>
                <span class="zine-tag-yellow" style="font-size:0.65rem;padding:2px 8px;">MASTER DESK</span>
                <span class="zine-tag-pink" style="font-size:0.65rem;padding:2px 8px;">INVENTORY PROTOCOL</span>
              </div>
              <p style="font-family:var(--font-mono-sub);font-size:0.8rem;color:#AAA;letter-spacing:0.08em;margin:0;">
                CONTROL DESK // PET VISOR CATALOG & REAL-TIME DISPATCH DISCIPLINE
              </p>
            </div>
          </div>

          <!-- Quick Metrics Bar -->
          <div style="display:flex;gap:14px;flex-wrap:wrap;">
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;min-width:100px;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:var(--accent-yellow);text-transform:uppercase;">TOTAL VISORS</span>
              <span id="statTotalProducts" style="font-family:var(--font-headline);font-size:1.4rem;color:#FFF;font-weight:900;">8</span>
            </div>
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;min-width:100px;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:#4ade80;text-transform:uppercase;">READY STOCK</span>
              <span id="statTotalStock" style="font-family:var(--font-headline);font-size:1.4rem;color:#4ade80;font-weight:900;">106</span>
            </div>
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;min-width:100px;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:var(--accent-pink);text-transform:uppercase;">LOW STOCK</span>
              <span id="statLowStock" style="font-family:var(--font-headline);font-size:1.4rem;color:var(--accent-pink);font-weight:900;">1</span>
            </div>
            <div style="background:#181818;border:1px solid #333;padding:10px 16px;text-align:center;min-width:130px;">
              <span style="display:block;font-family:var(--font-mono-sub);font-size:0.65rem;color:#AAA;text-transform:uppercase;">TOTAL ASSET</span>
              <span id="statInventoryValue" style="font-family:var(--font-headline);font-size:1.3rem;color:var(--accent-yellow);font-weight:900;">Rp 32.880.000</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Account Dashboard Grid (Sidebar + Main Content Panels) -->
      <div class="account-grid">
        
        <!-- SIDEBAR NAVIGATION -->
        <aside>
          <nav class="account-sidebar-nav" id="adminNav">
            <button class="account-nav-item active" data-tab="inventory">
              <span class="material-symbols-outlined">inventory_2</span>
              <span>PRODUCT INVENTORY</span>
              <span class="account-nav-badge" id="navBadgeProducts">8</span>
            </button>
            <button class="account-nav-item" data-tab="add">
              <span class="material-symbols-outlined">add_circle</span>
              <span>+ ADD NEW PRODUCT</span>
            </button>
            <button class="account-nav-item" data-tab="orders">
              <span class="material-symbols-outlined">receipt_long</span>
              <span>CUSTOMER ORDERS</span>
              <span class="account-nav-badge">3</span>
            </button>
            <button class="account-nav-item" data-tab="settings">
              <span class="material-symbols-outlined">tune</span>
              <span>SYSTEM & BACKUP</span>
            </button>
            <hr style="border:none;border-top:1px dashed #333;margin:8px 0;">
            <a href="parts.html" target="_blank" class="account-nav-item" style="color:var(--accent-yellow);">
              <span class="material-symbols-outlined" style="color:var(--accent-yellow);">open_in_new</span>
              <span>VIEW LIVE STORE ↗</span>
            </a>
            <a href="index.html" class="account-nav-item" style="color:#FF4444;">
              <span class="material-symbols-outlined" style="color:#FF4444;">logout</span>
              <span>EXIT TO GARAGE</span>
            </a>
          </nav>

          <!-- Status / Synchronization Box -->
          <div style="background:#121212;border:2px solid #222;padding:20px;margin-top:20px;box-shadow:4px 4px 0px #000;">
            <span style="font-family:var(--font-mono-sub);font-size:0.7rem;color:var(--accent-yellow);letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:6px;">
              SHOP SYNCHRONIZATION
            </span>
            <p style="font-size:0.85rem;color:#AAA;line-height:1.4;margin-bottom:14px;">
              Semua penambahan visor, perubahan stok, dan harga akan langsung tersinkronisasi di katalog toko secara real-time.
            </p>
            <button id="btnSidebarQuickAdd" class="btn-brutal-yellow btn-brutal-sm" style="width:100%;text-align:center;">
              + QUICK ADD PRODUCT
            </button>
          </div>
        </aside>

        <!-- MAIN CONTENT PANELS -->
        <div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 1: PRODUCT INVENTORY TABLE -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel active" id="panel-inventory">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:14px;">
              <div>
                <h2 class="editorial-title" style="font-size:2rem;margin:0 0 4px;">PRODUCT INVENTORY</h2>
                <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#888;margin:0;">
                  MANAGE STOCK QUANTITIES, EDIT SPECS, OR REMOVE CATALOG ITEMS.
                </p>
              </div>

              <button id="btnSwitchToAdd" class="btn-brutal-yellow btn-brutal-sm" style="display:inline-flex;align-items:center;gap:6px;">
                <span class="material-symbols-outlined" style="font-size:18px;">add</span>
                <span>+ ADD NEW VISOR</span>
              </button>
            </div>

            <!-- Search & Filter Controls -->
            <div style="background:#111;border:2px solid #282828;padding:16px 20px;margin-bottom:20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;box-shadow:4px 4px 0px #000;">
              <div style="position:relative;flex:1;min-width:240px;">
                <input type="text" id="adminSearchInput" class="form-input-brutal" placeholder="Search product name, SKU..." style="padding-left:38px;padding-top:10px;padding-bottom:10px;font-size:0.85rem;margin-bottom:0;">
                <span class="material-symbols-outlined" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#888;font-size:20px;">search</span>
              </div>
              <select id="adminCategoryFilter" class="form-input-brutal" style="width:auto;padding:10px 16px;font-size:0.85rem;background:#111;color:#FFF;border-color:#444;margin-bottom:0;">
                <option value="ALL">ALL CATEGORIES</option>
                <option value="Acrylic Pet">Acrylic Pet</option>
                <option value="Leather Pet">Leather Pet</option>
                <option value="Retro Visor">Retro Visor</option>
                <option value="Drop Sets">Drop Sets</option>
              </select>
            </div>

            <!-- Inventory Table -->
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width:64px;">THUMB</th>
                    <th>PRODUCT DETAILS</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th style="text-align:center;">STOCK LEVEL</th>
                    <th>BADGE</th>
                    <th style="text-align:right;">ACTIONS</th>
                  </tr>
                </thead>
                <tbody id="adminProductsTbody">
                  <!-- Populated dynamically by js/admin.js -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 2: ADD NEW PRODUCT -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-add">
            <div style="margin-bottom:24px;">
              <h2 class="editorial-title" style="font-size:2rem;margin:0 0 4px;">ADD NEW PET VISOR</h2>
              <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#888;margin:0;">
                PUBLISH A NEW HAND-CRAFTED HELMET VISOR INTO MUSTAZ CRAFT CATALOG.
              </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:32px;align-items:start;">
              
              <!-- Form -->
              <div style="background:#111;border:2px solid #282828;padding:32px;box-shadow:6px 6px 0px #000;">
                <form id="addProductForm">
                  <div class="form-group-brutal">
                    <label class="form-label-brutal">PRODUCT NAME *</label>
                    <input type="text" id="newProdName" class="form-input-brutal" placeholder="e.g. ACID GHOST ROOF VISOR" required>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div class="form-group-brutal">
                      <label class="form-label-brutal">CATEGORY *</label>
                      <select id="newProdCategory" class="form-input-brutal" style="background:#111;color:#FFF;" required>
                        <option value="Acrylic Pet">Acrylic Pet</option>
                        <option value="Leather Pet">Leather Pet</option>
                        <option value="Retro Visor">Retro Visor</option>
                        <option value="Drop Sets">Drop Sets</option>
                      </select>
                    </div>

                    <div class="form-group-brutal">
                      <label class="form-label-brutal">BADGE / STATUS</label>
                      <select id="newProdBadge" class="form-input-brutal" style="background:#111;color:#FFF;">
                        <option value="NEW">NEW</option>
                        <option value="HOT DROP">HOT DROP</option>
                        <option value="BESTSELLER">BESTSELLER</option>
                        <option value="LIMITED">LIMITED</option>
                        <option value="BUNDLE">BUNDLE</option>
                        <option value="SALE">SALE</option>
                        <option value="">(NONE)</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group-brutal">
                    <label class="form-label-brutal">SUBTITLE / SPECS SUMMARY *</label>
                    <input type="text" id="newProdSub" class="form-input-brutal" placeholder="e.g. Acid Neon Acrylic // 3-Snap Universal // Punk Spikes" required>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                    <div class="form-group-brutal">
                      <label class="form-label-brutal">PRICE (IDR) *</label>
                      <input type="number" id="newProdPrice" class="form-input-brutal" placeholder="350000" min="10000" step="5000" required>
                    </div>
                    <div class="form-group-brutal">
                      <label class="form-label-brutal">ORIGINAL PRICE</label>
                      <input type="number" id="newProdOriginalPrice" class="form-input-brutal" placeholder="450000 (optional)">
                    </div>
                    <div class="form-group-brutal">
                      <label class="form-label-brutal">STOCK QTY *</label>
                      <input type="number" id="newProdStock" class="form-input-brutal" placeholder="10" min="0" value="10" required>
                    </div>
                  </div>

                  <!-- ASSET CHOOSER -->
                  <div class="form-group-brutal" style="margin-bottom:24px;">
                    <label class="form-label-brutal">SELECT PRODUCT IMAGE / ASSET *</label>
                    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:12px;" id="assetPickerGrid">
                      
                      <div class="admin-asset-choice selected" data-asset="assets/images/pet_visor_yellow_flame.png">
                        <img src="assets/images/pet_visor_yellow_flame.png" alt="Yellow Flame Visor">
                        <span style="font-family:var(--font-mono-sub);font-size:0.65rem;color:#FFF;text-align:center;">YELLOW FLAME</span>
                      </div>

                      <div class="admin-asset-choice" data-asset="assets/images/retro_checkered_helmet.png">
                        <img src="assets/images/retro_checkered_helmet.png" alt="Checker Visor">
                        <span style="font-family:var(--font-mono-sub);font-size:0.65rem;color:#FFF;text-align:center;">CHECKER RETRO</span>
                      </div>

                      <div class="admin-asset-choice" data-asset="assets/images/mustaz_booth_event.png">
                        <img src="assets/images/mustaz_booth_event.png" alt="Booth Event">
                        <span style="font-family:var(--font-mono-sub);font-size:0.65rem;color:#FFF;text-align:center;">BUNDLE PACK</span>
                      </div>

                    </div>

                    <!-- Custom URL input -->
                    <input type="url" id="newProdCustomUrl" class="form-input-brutal" placeholder="Or enter custom image URL: https://..." style="font-size:0.8rem;margin-bottom:10px;">

                    <!-- Direct Supabase Storage File Uploader -->
                    <div style="background:#181818;border:2px dashed #444;padding:12px 14px;box-shadow:3px 3px 0px #000;">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <label class="form-label-brutal" style="font-size:0.72rem;color:var(--accent-yellow);margin-bottom:0;">
                          ☁️ UPLOAD DARI PC KE SUPABASE STORAGE
                        </label>
                        <span style="font-family:var(--font-mono-sub);font-size:0.65rem;color:#888;">BUCKET: product-images</span>
                      </div>
                      <input type="file" id="newProdFileInput" accept="image/*" class="form-input-brutal" style="padding:6px;font-size:0.78rem;background:#000;margin-bottom:4px;cursor:pointer;">
                      <div id="uploadStatusText" style="font-family:var(--font-mono-sub);font-size:0.7rem;color:#888;">
                        Pilih file gambar untuk di-upload otomatis ke cloud Supabase Storage.
                      </div>
                    </div>
                  </div>

                  <button type="submit" class="btn-brutal-pink" style="width:100%;padding:16px;font-size:1.1rem;display:flex;justify-content:center;align-items:center;gap:10px;">
                    <span class="material-symbols-outlined">publish</span>
                    <span>PUBLISH PRODUCT TO STORE →</span>
                  </button>
                </form>
              </div>

              <!-- Live Card Preview -->
              <div>
                <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
                  <span class="zine-tag-yellow">LIVE STORE PREVIEW</span>
                  <span style="font-family:var(--font-mono-sub);font-size:0.75rem;color:#888;">AS SEEN ON /PARTS.HTML</span>
                </div>

                <div style="max-width:340px;margin:0 auto;">
                  <article class="part-card" style="transition:all 0.2s ease;">
                    <div style="background:#FFFFFF;color:#000;border:3px solid #000;box-shadow:6px 6px 0px var(--accent-pink);padding:16px;position:relative;">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <span style="font-family:var(--font-headline);font-weight:900;font-size:1.4rem;color:#000;line-height:1;" id="prevNumber">01</span>
                        <span style="background:#000;color:#FFF;font-family:var(--font-mono-sub);font-weight:800;font-size:0.68rem;padding:3px 8px;text-transform:uppercase;letter-spacing:0.12em;" id="prevCategory">ACRYLIC PET</span>
                      </div>

                      <div style="position:relative;width:100%;aspect-ratio:4/5;background:#080808;border:2px solid #000;overflow:hidden;margin-bottom:14px;">
                        <div class="zine-tag-pink" style="position:absolute;top:8px;left:8px;z-index:10;" id="prevBadge">NEW</div>
                        <img id="prevImage" src="assets/images/pet_visor_yellow_flame.png" alt="Preview" style="width:100%;height:100%;object-fit:cover;object-position:center;filter:contrast(110%);">
                      </div>

                      <div>
                        <h3 style="font-family:var(--font-headline);font-size:1.35rem;color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:6px;" id="prevName">
                          UNTITLED PET VISOR
                        </h3>
                        <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#555;text-transform:uppercase;margin-bottom:14px;" id="prevSub">
                          Custom Hand-Crafted Helmet Accessory
                        </p>
                        <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px dashed #000;padding-top:10px;">
                          <span style="font-family:var(--font-headline);font-size:1.35rem;font-weight:900;color:#FF008C;" id="prevPrice">
                            IDR 350.000
                          </span>
                          <span style="font-family:var(--font-mono-sub);font-size:0.7rem;font-weight:700;color:#333;" id="prevStock">
                            STOCK: 10
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 3: CUSTOMER ORDERS -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-orders">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:14px;">
              <div>
                <h2 class="editorial-title" style="font-size:2rem;margin:0 0 4px;">CUSTOMER ORDERS</h2>
                <p style="font-family:var(--font-mono-sub);font-size:0.78rem;color:#888;margin:0;">
                  MONITOR INCOMING DISPATCH ORDERS AND UPDATE DELIVERY STATUS.
                </p>
              </div>
              <button id="btnRefreshOrders" class="btn-brutal-dark btn-brutal-sm">
                REFRESH ORDERS
              </button>
            </div>

            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER / ALIAS</th>
                    <th>ITEMS & SPECS</th>
                    <th>TOTAL AMOUNT</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th style="text-align:right;">ACTION</th>
                  </tr>
                </thead>
                <tbody id="adminOrdersTbody">
                  <!-- Populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- PANEL 4: SYSTEM & BACKUP -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div class="account-tab-panel" id="panel-settings">
            <div style="max-width:700px;display:flex;flex-direction:column;gap:24px;">
              
              <div style="background:#111;border:2px solid #282828;border-left:4px solid var(--accent-yellow);padding:24px;box-shadow:4px 4px 0px #000;">
                <h3 style="font-family:var(--font-headline);font-size:1.4rem;color:#FFF;margin-bottom:8px;">EXPORT INVENTORY JSON</h3>
                <p style="font-size:0.88rem;color:#AAA;margin-bottom:16px;line-height:1.5;">
                  Download complete store catalog as a backup JSON file containing all products, prices, badges, and stock quantities.
                </p>
                <button id="btnExportJson" class="btn-brutal-yellow btn-brutal-sm">
                  DOWNLOAD JSON BACKUP ↓
                </button>
              </div>

              <div style="background:#111;border:2px solid #282828;border-left:4px solid var(--accent-pink);padding:24px;box-shadow:4px 4px 0px #000;">
                <h3 style="font-family:var(--font-headline);font-size:1.4rem;color:var(--accent-pink);margin-bottom:8px;">RESTORE FACTORY DEFAULT CATALOG</h3>
                <p style="font-size:0.88rem;color:#AAA;margin-bottom:16px;line-height:1.5;">
                  Reset all product listings back to the default 8 MUSTAZ workshop products. Useful for testing or wiping sample custom products.
                </p>
                <button id="btnResetCatalog" class="btn-brutal-pink btn-brutal-sm" style="background:#59001b;border-color:var(--accent-pink);">
                  RESET CATALOG TO DEFAULT ⚠️
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  </section>
</main>

<!-- EDIT PRODUCT MODAL (Brutalist Garage Box) -->
<div class="modal-backdrop" id="editProductModal">
  <div class="modal-box" style="max-width:580px;background:#111;border:3px solid var(--accent-yellow);box-shadow:10px 10px 0px #000;">
    <div class="modal-header" style="background:#181818;border-bottom:2px solid #282828;padding:16px 20px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="zine-tag-yellow" id="editModalSku">SKU_001</span>
        <span style="font-family:var(--font-headline);font-size:1.2rem;color:#FFFFFF;">EDIT PRODUCT DETAILS</span>
      </div>
      <button class="modal-close" id="editModalCloseBtn" aria-label="Close modal">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="modal-body" style="padding:24px;">
      <form id="editProductForm">
        <input type="hidden" id="editProdId">
        
        <div class="form-group-brutal">
          <label class="form-label-brutal">PRODUCT NAME</label>
          <input type="text" id="editProdName" class="form-input-brutal" required>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group-brutal">
            <label class="form-label-brutal">CATEGORY</label>
            <select id="editProdCategory" class="form-input-brutal" style="background:#111;color:#FFF;">
              <option value="Acrylic Pet">Acrylic Pet</option>
              <option value="Leather Pet">Leather Pet</option>
              <option value="Retro Visor">Retro Visor</option>
              <option value="Drop Sets">Drop Sets</option>
            </select>
          </div>
          <div class="form-group-brutal">
            <label class="form-label-brutal">BADGE</label>
            <select id="editProdBadge" class="form-input-brutal" style="background:#111;color:#FFF;">
              <option value="NEW">NEW</option>
              <option value="HOT DROP">HOT DROP</option>
              <option value="BESTSELLER">BESTSELLER</option>
              <option value="LIMITED">LIMITED</option>
              <option value="BUNDLE">BUNDLE</option>
              <option value="SALE">SALE</option>
              <option value="">(NONE)</option>
            </select>
          </div>
        </div>

        <div class="form-group-brutal">
          <label class="form-label-brutal">SUBTITLE / SPECS</label>
          <input type="text" id="editProdSub" class="form-input-brutal" required>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="form-group-brutal">
            <label class="form-label-brutal">PRICE (IDR)</label>
            <input type="number" id="editProdPrice" class="form-input-brutal" min="10000" step="5000" required>
          </div>
          <div class="form-group-brutal">
            <label class="form-label-brutal">STOCK QTY</label>
            <input type="number" id="editProdStock" class="form-input-brutal" min="0" required>
          </div>
        </div>

        <div class="form-group-brutal" style="margin-bottom:24px;">
          <label class="form-label-brutal">IMAGE PATH / URL</label>
          <input type="text" id="editProdImage" class="form-input-brutal" required>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button type="button" class="btn-brutal-dark" id="btnCancelEdit" style="padding:10px 18px;">CANCEL</button>
          <button type="submit" class="btn-brutal-yellow" style="padding:10px 22px;">SAVE UPDATES ✓</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script type="module" src="js/admin.js"></script>
${sharedFooter()}
</body>
</html>`;

  fs.writeFileSync("admin.html", html);
  console.log("✅ admin.html   (Authentic MUSTAZ Garage Zine Admin Dashboard Rebuilt)");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE ALL BUILDS
// ─────────────────────────────────────────────────────────────────────────────
buildIndex();
buildChoppers();
buildParts();
buildKulture();
buildAccount();
buildLogin();
buildRegister();
buildForgotPassword();
buildCheckout();
buildShipping();
buildAdmin();

console.log("🎉 ALL 11 MUSTAZ GARAGE ZINE PAGES SUCCESSFULLY REBUILT!");

