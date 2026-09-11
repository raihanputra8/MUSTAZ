/**
 * MUSTAZ CRAFT - CS Online Store WhatsApp Automation Service
 * 
 * Implements the 4-Phase System Workflow & Guardrails:
 * - Phase 1: Incoming Order Parser & Payment Instructions
 * - Phase 2: Payment Verification & Status Update (PAID_PROCESSING)
 * - Phase 3: Shipping Notification & Tracking Links (SHIPPED)
 * - Phase 4: Post-Purchase Follow-Up & Review with Discount Voucher (DELIVERED)
 */

import { CONFIG } from '../config.js';

// ─── 1. Official Store Payment Channels & Guardrails Config ─────────────────
export const OFFICIAL_PAYMENT_ACCOUNTS = {
  BCA: {
    bank: 'BCA',
    accountNumber: '123-456-7890',
    accountName: 'Toko Saya',
    formatted: '🏦 *BCA:* 123-456-7890 a.n. Toko Saya'
  },
  MANDIRI: {
    bank: 'Mandiri',
    accountNumber: '098-765-4321',
    accountName: 'Toko Saya',
    formatted: '🏦 *Mandiri:* 098-765-4321 a.n. Toko Saya'
  },
  QRIS: {
    name: 'QRIS Resmi Toko',
    url: 'https://mustaz-craft.com/assets/images/qris_official.png',
    formatted: '📱 *QRIS:* https://mustaz-craft.com/assets/images/qris_official.png'
  }
};

// ─── 2. Helpers & Formatting ────────────────────────────────────────────────
export function formatRupiahNumber(amount) {
  const num = typeof amount === 'number' ? amount : Number(String(amount).replace(/[^0-9]/g, '')) || 0;
  return num.toLocaleString('id-ID');
}

export function cleanOrderId(orderId) {
  if (!orderId) return '';
  return String(orderId).replace(/^#+/, '').trim().toUpperCase();
}

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function buildTrackingUrl(courier, resiNumber) {
  const c = String(courier || '').toLowerCase();
  const cleanResi = encodeURIComponent(String(resiNumber || '').trim());
  if (c.includes('jne')) {
    return `https://www.jne.co.id/id/tracking/trace/${cleanResi}`;
  } else if (c.includes('j&t') || c.includes('jnt')) {
    return `https://www.jet.co.id/track?bills=${cleanResi}`;
  } else if (c.includes('sicepat')) {
    return `https://www.sicepat.com/checkAwb/${cleanResi}`;
  } else if (c.includes('pos')) {
    return `https://www.posindonesia.co.id/id/tracking?awb=${cleanResi}`;
  }
  return `https://cekresi.com/?noresi=${cleanResi}`;
}

export function buildReviewUrl(orderId, customerName) {
  const cleanId = cleanOrderId(orderId);
  const base = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'https://mustaz-craft.com';
  const nameParam = customerName ? `&buyer=${encodeURIComponent(customerName)}` : '';
  return `${base}/testimoni.html?review_order=${encodeURIComponent(cleanId)}${nameParam}`;
}

// ─── 3. Phase 1: Incoming Order Parser & Guardrails ─────────────────────────

/**
 * Extracts structured order data from incoming web order WhatsApp messages
 * Expects: Kode Order, Items, Total Tagihan, Data Pengiriman (Nama, No. WA, Alamat)
 */
export function parseIncomingOrder(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      isValid: false,
      error: 'Pesan kosong atau tidak valid.',
      hasOrderId: false
    };
  }

  const text = rawText.trim();

  // 1. Extract Order ID (strictly look for MSTZ code or Kode Order)
  const orderIdMatch = text.match(/#\s*(MSTZ-[A-Za-z0-9-]+)/i)
    || text.match(/\b(MSTZ-[0-9]{4,6})\b/i)
    || text.match(/(?:Kode\s*Order|Order\s*ID|No\.?\s*Order)[\s:*#]+([A-Za-z0-9-]+)/i);

  const orderId = orderIdMatch ? cleanOrderId(orderIdMatch[1]) : '';

  // Guardrail Check: Reject if no Kode Order from web is present
  if (!orderId) {
    return {
      isValid: false,
      hasOrderId: false,
      error: 'DILARANG MEMPROSES: Pembeli tidak menyertakan Kode Order resmi dari web.',
      guardrailAlert: 'NO_ORDER_ID',
      rawText: text
    };
  }

  // 2. Extract Customer Name
  const nameMatch = text.match(/(?:Nama|Customer|Nama\s*Pembeli)[\s:*]+([^\n\r]+)/i);
  const customerName = nameMatch ? nameMatch[1].replace(/[*_~]/g, '').trim() : 'Kakak';

  // 3. Extract WhatsApp / Phone Number
  const phoneMatch = text.match(/(?:WhatsApp|No\.?\s*WA|Telepon|HP|Phone)[\s:*]+([0-9+\-\s]+)/i);
  const phone = phoneMatch ? phoneMatch[1].replace(/[*_~]/g, '').trim() : '';

  // 4. Extract Delivery Address
  const addressMatch = text.match(/(?:Alamat(?:\s*Drop|\s*Pengiriman)?|Address)[\s:*]+([^\n\r]+)/i);
  const address = addressMatch ? addressMatch[1].replace(/[*_~]/g, '').trim() : '';

  // 5. Extract Total Tagihan
  const totalMatch = text.match(/(?:Total\s*Tagihan|TOTAL|Total\s*Bayar)[\s:*]+(?:Rp\.?\s*)?([0-9.,]+)/i);
  let total = 0;
  if (totalMatch) {
    const rawNum = totalMatch[1].replace(/\./g, '').replace(/,/g, '');
    total = Number(rawNum) || 0;
  }

  // 6. Extract Items List
  let items = [];
  const itemsBlockMatch = text.match(/(?:ITEM\s*YANG\s*DIBELI|ITEMS|PRODUK)[\s:*]+([\s\S]*?)(?:---|TOTAL|Total Tagihan)/i);
  if (itemsBlockMatch && itemsBlockMatch[1]) {
    items = itemsBlockMatch[1]
      .split('\n')
      .map(line => line.replace(/^[•\-\*]\s*/, '').replace(/[*_~]/g, '').trim())
      .filter(line => line.length > 0);
  }

  return {
    isValid: true,
    hasOrderId: true,
    orderId,
    customerName,
    phone,
    address,
    items,
    total,
    totalFormatted: formatRupiahNumber(total),
    rawText: text
  };
}

// ─── 4. Response Templates ──────────────────────────────────────────────────

/**
 * Phase 1: Instruksi Pembayaran
 */
export function generatePhase1Response(orderData) {
  const name = orderData.customerName || 'Pembeli';
  const orderId = cleanOrderId(orderData.orderId);
  const totalStr = orderData.totalFormatted || formatRupiahNumber(orderData.total || 0);

  return [
    `Halo Kak ${name}, terima kasih sudah berbelanja! 👋`,
    ``,
    `Berikut adalah rincian pembayaran untuk pesanan Anda:`,
    `📌 *Kode Order:* #${orderId}`,
    `💰 *Total Tagihan:* Rp ${totalStr}`,
    ``,
    `Silakan melakukan pembayaran ke salah satu rekening resmi kami:`,
    `🏦 *BCA:* ${OFFICIAL_PAYMENT_ACCOUNTS.BCA.accountNumber} a.n. ${OFFICIAL_PAYMENT_ACCOUNTS.BCA.accountName}`,
    `🏦 *Mandiri:* ${OFFICIAL_PAYMENT_ACCOUNTS.MANDIRI.accountNumber} a.n. ${OFFICIAL_PAYMENT_ACCOUNTS.MANDIRI.accountName}`,
    `📱 *QRIS:* ${OFFICIAL_PAYMENT_ACCOUNTS.QRIS.url}`,
    ``,
    `_Mohon kirimkan foto/screenshot bukti transfer ke chat ini agar pesanan dapat langsung diproses oleh tim gudang kami ya Kak._`
  ].join('\n');
}

/**
 * Phase 2: Verifikasi Pembayaran (Status -> PAID_PROCESSING)
 */
export function generatePhase2Response(orderData) {
  const name = orderData.customerName || 'Pembeli';
  const orderId = cleanOrderId(orderData.orderId);
  const totalStr = orderData.totalFormatted || formatRupiahNumber(orderData.total || 0);

  return [
    `Terima kasih Kak ${name}! Pembayaran sebesar *Rp ${totalStr}* untuk pesanan *#${orderId}* telah kami verifikasi secara resmi. ✅`,
    ``,
    `📦 *Status Pesanan:* Diproses Tim Gudang (Packing & QC)`,
    `Kami akan mengirimkan nomor resi pengiriman begitu paket diserahkan ke pihak ekspedisi ya Kak.`
  ].join('\n');
}

/**
 * Phase 3: Notifikasi Pengiriman & Nomor Resi (Status -> SHIPPED)
 */
export function generatePhase3Response(shippingData) {
  const name = shippingData.customerName || 'Pembeli';
  const orderId = cleanOrderId(shippingData.orderId);
  const courier = shippingData.courier || 'J&T Express';
  const resi = shippingData.resiNumber || 'JT-' + Math.floor(100000 + Math.random() * 900000);
  const trackingLink = shippingData.trackingUrl || buildTrackingUrl(courier, resi);

  return [
    `Halo Kak ${name}, paket Anda sudah dikirim! 🚀`,
    ``,
    `📌 *Kode Order:* #${orderId}`,
    `🚚 *Ekspedisi:* ${courier}`,
    `🔢 *No. Resi:* ${resi}`,
    `🔗 *Lacak Paket:* ${trackingLink}`,
    ``,
    `Terima kasih telah bersabar menunggu!`
  ].join('\n');
}

/**
 * Phase 4: Follow-Up & Minta Ulasan (Status -> DELIVERED)
 */
export function generatePhase4Response(reviewData, customReviewUrl = null) {
  const name = reviewData.customerName || 'Pembeli';
  const orderId = cleanOrderId(reviewData.orderId);
  const reviewLink = reviewData.reviewUrl || customReviewUrl || buildReviewUrl(orderId, name);

  return [
    `Halo Kak ${name}! 👋`,
    ``,
    `Menurut catatan ekspedisi, paket *#${orderId}* sudah sampai di lokasi pengiriman nih. Semoga produknya mendarat dengan aman dan sesuai ekspektasi ya Kak!`,
    ``,
    `⭐ **Bantu Kami Memberikan Ulasan:**`,
    `Bolehkah minta waktunya 1 menit untuk memberikan ulasan & foto produk pada link berikut?`,
    `👉 ${reviewLink}`,
    ``,
    `Ulasan dari Kakak sangat berarti bagi workshop kami untuk terus berkarya. Terima kasih banyak ya Kak!`
  ].join('\n');
}

/**
 * Quick direct WhatsApp Web link generator
 */
export function createDirectWhatsAppUrl(phone, text) {
  const cleanPhone = cleanPhoneNumber(phone) || CONFIG.ADMIN_WHATSAPP;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// ─── 5. Conversational CS Virtual Assistant Engine (Simulator) ──────────────

/**
 * Processes incoming chat from buyer and responds in persona as "CS Online Store"
 * strictly upholding all guardrails and workflow phases.
 */
export function handleCustomerMessage(incomingText, sessionContext = {}) {
  const text = (incomingText || '').trim();
  const lower = text.toLowerCase();

  // Guardrail 1: Check for unofficial payment requests or strange account inquiries
  const askingOtherBanks = /rekening\s*(lain|bni|bri|dana|ovo|gopay|shopeepay|pribadi)/i.test(lower);
  if (askingOtherBanks) {
    return {
      phase: 'GUARDRAIL_TRIGGERED',
      response: [
        `Halo Kak! Mohon maaf demi keamanan transaksi, kami *hanya menerima pembayaran ke rekening resmi toko* yang terdaftar:`,
        ``,
        `🏦 *BCA:* 123-456-7890 a.n. Toko Saya`,
        `🏦 *Mandiri:* 098-765-4321 a.n. Toko Saya`,
        `📱 *QRIS:* ${OFFICIAL_PAYMENT_ACCOUNTS.QRIS.url}`,
        ``,
        `Kami tidak pernah memberikan nomor rekening selain rekening resmi di atas ya Kak. Terima kasih! 🙏`
      ].join('\n'),
      context: sessionContext
    };
  }

  // Phase 2: Payment proof notification / transfer confirmation
  const isPaymentProof = /transfer|bukti|sudah\s*bayar|lunas|struk|nota|qris|tf|berikut\s*bukti|screenshoot|screenshot/i.test(lower);
  if (isPaymentProof) {
    const activeOrderId = (text.match(/#\s*(MSTZ-[0-9A-Z]+)/i) ? text.match(/#\s*(MSTZ-[0-9A-Z]+)/i)[1] : (sessionContext.orderId || 'MSTZ-9942'));
    const activeName = sessionContext.customerName || 'Kakak';
    const activeTotal = sessionContext.totalFormatted || '2.200.000';

    const phase2Msg = generatePhase2Response({
      customerName: activeName,
      orderId: activeOrderId,
      totalFormatted: activeTotal
    });

    return {
      phase: 'PHASE_2_PAYMENT_VERIFIED',
      response: phase2Msg,
      newStatus: 'PAID_PROCESSING',
      context: {
        ...sessionContext,
        orderId: activeOrderId,
        customerName: activeName,
        status: 'PAID_PROCESSING'
      }
    };
  }

  // Phase 3: Shipping / Resi inquiry
  const isResiInquiry = /resi|ongkir|kapan\s*dikirim|ekspedisi|tracking|lacak|paket\s*saya|status\s*paket/i.test(lower);
  if (isResiInquiry) {
    const activeOrderId = (text.match(/#\s*(MSTZ-[0-9A-Z]+)/i) ? text.match(/#\s*(MSTZ-[0-9A-Z]+)/i)[1] : (sessionContext.orderId || 'MSTZ-9942'));
    const activeName = sessionContext.customerName || 'Kakak';
    const courier = sessionContext.courier || 'J&T Express';
    const resiNumber = sessionContext.resiNumber || 'JT-992144';

    const phase3Msg = generatePhase3Response({
      customerName: activeName,
      orderId: activeOrderId,
      courier,
      resiNumber
    });

    return {
      phase: 'PHASE_3_SHIPPING_UPDATE',
      response: phase3Msg,
      newStatus: 'SHIPPED',
      context: {
        ...sessionContext,
        orderId: activeOrderId,
        customerName: activeName,
        status: 'SHIPPED'
      }
    };
  }

  // Phase 4: Delivery confirmation / Request review
  const isDelivered = /sampai|diterima|mendarat|paket\s*tiba|sudah\s*sampai/i.test(lower);
  if (isDelivered) {
    const activeOrderId = (text.match(/#\s*(MSTZ-[0-9A-Z]+)/i) ? text.match(/#\s*(MSTZ-[0-9A-Z]+)/i)[1] : (sessionContext.orderId || 'MSTZ-9942'));
    const activeName = sessionContext.customerName || 'Kakak';

    const phase4Msg = generatePhase4Response({
      customerName: activeName,
      orderId: activeOrderId
    });

    return {
      phase: 'PHASE_4_REVIEW_REQUEST',
      response: phase4Msg,
      newStatus: 'DELIVERED',
      context: {
        ...sessionContext,
        orderId: activeOrderId,
        customerName: activeName,
        status: 'DELIVERED'
      }
    };
  }

  // Phase 1 / Web Order Detection:
  const isWebOrder = /format\s*pesanan|item\s*yang\s*dibeli|total\s*tagihan|alamat\s*drop|kode\s*order|order\s*baru/i.test(lower)
    || (lower.includes('order') && (lower.includes('mstz-') || lower.includes('pesan')));

  if (isWebOrder) {
    const parsed = parseIncomingOrder(text);

    // Guardrail 2: Reject if order has no official order ID from web
    if (!parsed.hasOrderId) {
      return {
        phase: 'REJECTED_NO_ORDER_ID',
        response: [
          `Halo Kak! 👋 Terima kasih sudah menghubungi kami.`,
          ``,
          `Mohon maaf, pesanan belum dapat kami proses karena *tidak menyertakan Kode Order resmi dari web*.`,
          ``,
          `Silakan menyelesaikan checkout terlebih dahulu melalui website kami untuk mendapatkan Kode Order (contoh: *#MSTZ-9942*), lalu kirimkan kembali format rinciannya ke sini ya Kak. Kami siap membantu! 🙏`
        ].join('\n'),
        context: sessionContext
      };
    }

    // Phase 1: Process incoming valid web order
    const phase1Msg = generatePhase1Response(parsed);
    return {
      phase: 'PHASE_1_ORDER_INSTRUCTION',
      response: phase1Msg,
      orderData: parsed,
      context: {
        ...sessionContext,
        orderId: parsed.orderId,
        customerName: parsed.customerName,
        total: parsed.total,
        totalFormatted: parsed.totalFormatted,
        phone: parsed.phone,
        status: 'PENDING'
      }
    };
  }

  // Default polite CS greeting & assistance
  return {
    phase: 'GENERAL_GREETING',
    response: [
      `Halo Kak! Selamat datang di layanan WhatsApp *MUSTAZ CRAFT*! 👋`,
      ``,
      `Ada yang bisa kami bantu seputar produk pet helm kustom, pesanan web, atau tracking pengiriman hari ini?`,
      ``,
      `_Jika ingin mengonfirmasi pesanan, silakan kirimkan format pesan order terstruktur dari website kami yang memuat Kode Order ya Kak._`
    ].join('\n'),
    context: sessionContext
  };
}
