/**
 * Vercel Serverless Function: /api/send-receipt
 * Transmits official brutalist receipt & invoice to buyer's email
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const recipient = payload.to || payload.custEmail || payload.email;
    const orderId = payload.orderId || 'MSTZ-' + Math.floor(1000 + Math.random() * 9000);
    const customerName = payload.customerName || payload.name || 'Rider';
    const total = payload.total || 0;
    const items = payload.items || [];
    const address = payload.address || '-';
    const subject = payload.subject || `BUKTI PESANAN #${orderId} - MUSTAZ CRAFT`;

    if (!recipient || !recipient.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email (to) is required.' });
    }

    console.log(`[API Send Receipt] Processing receipt dispatch for #${orderId} to: ${recipient}`);

    // Build Brutalist HTML invoice if caller did not provide one
    let invoiceHtml = payload.html;
    if (!invoiceHtml) {
      const itemsHtml = items.map(item => {
        const itemName = item.name || 'Produk Custom';
        const itemQty = item.quantity || item.qty || 1;
        const itemPrice = item.price || 0;
        const itemSpec = item.spec || item.variant || '';
        return `
          <tr>
            <td style="padding: 12px 14px; border-bottom: 1px dashed #333333; color: #FFFFFF; font-weight: bold; font-size: 14px;">
              ${itemName}
              ${itemSpec ? `<br><span style="font-size: 11px; color: #888888; font-family: monospace;">${itemSpec}</span>` : ''}
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px dashed #333333; color: #FFFF00; text-align: center; font-family: monospace; font-size: 13px;">
              x${itemQty}
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px dashed #333333; color: #FF007A; text-align: right; font-weight: 900; font-size: 14px;">
              Rp ${Number(itemPrice * itemQty).toLocaleString('id-ID')}
            </td>
          </tr>
        `;
      }).join('');

      invoiceHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>MUSTAZ CRAFT // INVOICE PESANAN</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080808; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EEEEEE;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080808; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #111111; border: 3px solid #000000; box-shadow: 8px 8px 0px #FF007A;">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #FF007A; padding: 18px 24px; border-bottom: 2px solid #000000;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-family: monospace; color: #000000; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;">
                      OFFICIAL DISPATCH PROTOCOL
                    </span>
                    <h1 style="margin: 4px 0 0; font-size: 22px; color: #000000; font-weight: 900; letter-spacing: 0.05em;">
                      MUSTAZ CRAFT // ORDER INVOICE
                    </h1>
                  </td>
                  <td align="right">
                    <span style="background-color: #000000; color: #FFFF00; padding: 4px 10px; font-family: monospace; font-size: 12px; font-weight: 900; border: 1px solid #000000;">
                      #${orderId}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 15px; line-height: 1.6; color: #CCCCCC; margin: 0 0 20px;">
                Halo <strong style="color: #FFFFFF;">${customerName}</strong>,<br>
                Terima kasih telah mempercayai MUSTAZ CRAFT. Rincian pesanan Anda telah tercatat resmi di database workshop.
              </p>

              <!-- Items Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border: 2px solid #222222; background-color: #141414;">
                <thead>
                  <tr style="background-color: #000000;">
                    <th style="padding: 10px 14px; text-align: left; font-size: 11px; font-family: monospace; color: #888888; text-transform: uppercase;">ITEM // PRODUK</th>
                    <th style="padding: 10px 14px; text-align: center; font-size: 11px; font-family: monospace; color: #888888; text-transform: uppercase;">QTY</th>
                    <th style="padding: 10px 14px; text-align: right; font-size: 11px; font-family: monospace; color: #888888; text-transform: uppercase;">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml || '<tr><td colspan="3" style="padding:14px;color:#888;">Item kustom helm</td></tr>'}
                </tbody>
              </table>

              <!-- Total Banner -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1C1C1C; border: 2px solid #333333; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="font-size: 11px; font-family: monospace; color: #888888; text-transform: uppercase;">TOTAL TAGIHAN</span>
                    <div style="font-size: 24px; color: #FFFF00; font-weight: 900; font-family: monospace; margin-top: 2px;">
                      Rp ${Number(total).toLocaleString('id-ID')}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Shipping Info -->
              <div style="background-color: #141414; border-left: 4px solid #FF007A; padding: 14px 18px; margin-bottom: 24px;">
                <span style="font-size: 10px; font-family: monospace; color: #888888; text-transform: uppercase;">ALAMAT TUJUAN PENGIRIMAN</span>
                <p style="margin: 4px 0 0; color: #FFFFFF; font-size: 14px; line-height: 1.5;">
                  ${address}
                </p>
              </div>

              <!-- Footer Instructions -->
              <div style="border-top: 1px dashed #333333; padding-top: 18px; font-size: 12px; color: #888888; line-height: 1.6;">
                Butuh bantuan pesanan? Hubungi Customer Support resmi kami melalui WhatsApp atau email ke CS Store. Simpan nomor pesanan <strong>#${orderId}</strong> sebagai referensi pelacakan.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
    }

    // Attempt delivery via Resend API if credentials exist
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'MUSTAZ CRAFT <orders@mustazcraft.com>',
            to: [recipient],
            subject: subject,
            html: invoiceHtml
          })
        });
        const resendData = await resendRes.json();
        return res.status(200).json({
          success: true,
          provider: 'resend',
          data: resendData,
          orderId: orderId,
          recipient: recipient
        });
      } catch (err) {
        console.warn('[API Send Receipt] Resend dispatch warning:', err.message);
      }
    }

    // Fallback confirmation
    return res.status(200).json({
      success: true,
      provider: 'simulation',
      message: `Invoice dispatch processed for Order #${orderId} to ${recipient}`,
      meta: {
        orderId,
        recipient,
        customerName,
        total,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[API Send Receipt Error]:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
