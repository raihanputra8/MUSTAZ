/**
 * Vercel Serverless Function: midtrans-notification
 * Webhook endpoint that receives payment status notifications from Midtrans
 */

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const notification = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type
    } = notification;

    if (!order_id || !signature_key) {
      return res.status(400).json({ error: 'Invalid payload: order_id and signature_key required' });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('[Midtrans Webhook] MIDTRANS_SERVER_KEY is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify SHA512 signature
    const signatureRaw = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto.createHash('sha512').update(signatureRaw).digest('hex');

    if (signature_key !== expectedSignature) {
      console.warn(`[Midtrans Webhook] Invalid signature for #${order_id}`);
      return res.status(403).json({ error: 'Signature mismatch' });
    }

    console.log(`[Midtrans Webhook] Notification verified for #${order_id}: status=${transaction_status}, type=${payment_type}`);

    let orderStatus = 'PENDING';
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        orderStatus = 'CHALLENGE';
      } else if (fraud_status === 'accept') {
        orderStatus = 'LUNAS (PAID)';
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = 'LUNAS (PAID)';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      orderStatus = 'CANCELLED';
    } else if (transaction_status === 'pending') {
      orderStatus = 'PENDING_PAYMENT';
    }

    // Update Supabase Database if Supabase URL and Key are available
    const supabaseUrl = process.env.SUPABASE_URL || 'https://hskggocaakmidbysrpnd.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey) {
      try {
        const updateUrl = `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}`;
        await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: orderStatus,
            payment_status: transaction_status,
            payment_type: payment_type || 'midtrans',
            updated_at: new Date().toISOString()
          })
        });
        console.log(`[Midtrans Webhook] Supabase updated #${order_id} -> ${orderStatus}`);
      } catch (dbErr) {
        console.warn('[Midtrans Webhook] Supabase update warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification received and processed',
      order_id,
      status: orderStatus
    });

  } catch (err) {
    console.error('[Midtrans Webhook Error]:', err);
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
