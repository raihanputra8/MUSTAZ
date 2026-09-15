/**
 * Vercel Serverless Function: /api/midtrans-sync
 * Checks transaction status directly against Midtrans API and synchronizes with Supabase.
 */

export default async function handler(req, res) {
  // Allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return res.status(500).json({ error: 'MIDTRANS_SERVER_KEY is not configured on server' });
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const midtransBaseUrl = isProduction 
    ? 'https://api.midtrans.com/v2' 
    : 'https://api.sandbox.midtrans.com/v2';

  const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

  // Order IDs can come from query param (?orderId=...) or body ({ orderId } or { orderIds: [...] })
  let orderIds = [];
  if (req.query?.orderId) {
    orderIds = [req.query.orderId.trim()];
  } else if (req.body?.orderId) {
    orderIds = [req.body.orderId.trim()];
  } else if (Array.isArray(req.body?.orderIds)) {
    orderIds = req.body.orderIds.map(id => String(id).trim()).filter(Boolean);
  }

  if (orderIds.length === 0) {
    return res.status(400).json({ error: 'Parameter orderId or orderIds is required' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://hskggocaakmidbysrpnd.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_GiDVOZNX_cZFe79wO0fw5w_wsfgRyAi';

  const results = [];

  for (const rawId of orderIds) {
    // Strip leading '#' if present
    const orderId = rawId.replace(/^#/, '');

    try {
      const midtransRes = await fetch(`${midtransBaseUrl}/${encodeURIComponent(orderId)}/status`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      });

      const midtransData = await midtransRes.json();

      if (!midtransRes.ok || midtransData.status_code === '404') {
        results.push({
          orderId,
          success: false,
          synced: false,
          error: midtransData.status_message || 'Transaksi tidak ditemukan di Midtrans'
        });
        continue;
      }

      const txStatus = midtransData.transaction_status;
      const fraudStatus = midtransData.fraud_status;
      const paymentType = midtransData.payment_type || 'midtrans';

      let newStatus = null;
      let isPaid = false;

      if (txStatus === 'settlement') {
        newStatus = 'PAID_PROCESSING';
        isPaid = true;
      } else if (txStatus === 'capture') {
        if (fraudStatus === 'accept') {
          newStatus = 'PAID_PROCESSING';
          isPaid = true;
        } else if (fraudStatus === 'challenge') {
          newStatus = 'CHALLENGE';
        }
      } else if (['cancel', 'deny', 'expire'].includes(txStatus)) {
        newStatus = 'CANCELLED';
      } else if (txStatus === 'pending') {
        newStatus = 'PENDING_PAYMENT';
      }

      // Update in Supabase if status changed or is paid
      if (newStatus && supabaseUrl && supabaseKey) {
        try {
          // 1. Try direct PATCH
          const patchRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              status: newStatus,
              payment_status: txStatus,
              payment_type: paymentType,
              updated_at: new Date().toISOString()
            })
          });

          // 2. If blocked by RLS or fails, try secure RPC
          if (!patchRes.ok) {
            await fetch(`${supabaseUrl}/rest/v1/rpc/update_order_status_secure`, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                p_order_id: orderId,
                p_status: newStatus,
                p_payment_status: txStatus,
                p_payment_type: paymentType
              })
            }).catch(() => {});
          }
        } catch (dbErr) {
          console.warn(`[Midtrans Sync] Supabase update error for ${orderId}:`, dbErr.message);
        }
      }

      results.push({
        orderId,
        success: true,
        synced: true,
        status: newStatus || txStatus,
        isPaid,
        transactionStatus: txStatus,
        paymentType,
        grossAmount: midtransData.gross_amount,
        settlementTime: midtransData.settlement_time || midtransData.transaction_time
      });

    } catch (err) {
      console.error(`[Midtrans Sync] Error checking #${orderId}:`, err);
      results.push({
        orderId,
        success: false,
        error: err.message
      });
    }
  }

  return res.status(200).json({
    success: true,
    totalChecked: orderIds.length,
    results: results
  });
}
