/**
 * Vercel Serverless Function: send-order-email
 * Transmits order confirmation & invoice HTML to buyer's email
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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = data.to || data.custEmail || data.email;
    const { subject, html, orderId, customerName, total } = data;

    if (!to || !to.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email (to) is required' });
    }

    console.log(`[Vercel Email Function] Processing order email for #${orderId} to: ${to}`);

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
            to: [to],
            subject: subject || `Order Confirmation #${orderId} - MUSTAZ CRAFT`,
            html: html
          })
        });
        const resendData = await resendRes.json();
        return res.status(200).json({ success: true, provider: 'resend', data: resendData });
      } catch (err) {
        console.warn('Resend error:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      provider: 'simulation',
      message: `Invoice simulation confirmed for Order #${orderId} to ${to}`,
      meta: { customerName, total, orderId, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
