/**
 * Vercel Serverless Function: midtrans-snap
 * Generates Midtrans Snap Transaction Token for In-App Checkout Modal
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
    const { orderId, grossAmount, items, customerDetails } = data;

    if (!orderId || !grossAmount) {
      return res.status(400).json({ error: 'orderId and grossAmount are required' });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('[Midtrans Snap] MIDTRANS_SERVER_KEY is missing in environment variables');
      return res.status(500).json({ error: 'MIDTRANS_SERVER_KEY is not configured in server environment' });
    }

    const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const snapUrl = isProd
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    // Base64 encode Server Key
    const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;

    // Prepare Customer Details
    const customer = customerDetails || {};
    const nameParts = (customer.name || 'Rider Mustaz').trim().split(' ');
    const firstName = nameParts[0] || 'Rider';
    const lastName = nameParts.slice(1).join(' ') || 'Mustaz';

    // Format item_details if provided
    let formattedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      formattedItems = items.map((item, idx) => ({
        id: String(item.id || `ITEM-${idx + 1}`).substring(0, 50),
        price: Math.round(Number(item.price || item.unitPrice || 0)),
        quantity: Math.max(1, parseInt(item.quantity || item.qty || 1, 10)),
        name: String(item.name || item.title || 'Pet Helm Part').substring(0, 50)
      }));

      // Sanity check: sum of items must equal grossAmount, or adjust single item
      const itemSum = formattedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      if (itemSum !== Math.round(Number(grossAmount))) {
        // Fallback to single lump sum item to prevent Midtrans item_details mismatch error
        formattedItems = [{
          id: String(orderId).substring(0, 50),
          price: Math.round(Number(grossAmount)),
          quantity: 1,
          name: `Pesanan MUSTAZ #${orderId}`.substring(0, 50)
        }];
      }
    } else {
      formattedItems = [{
        id: String(orderId).substring(0, 50),
        price: Math.round(Number(grossAmount)),
        quantity: 1,
        name: `Pesanan MUSTAZ #${orderId}`.substring(0, 50)
      }];
    }

    const payload = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: Math.round(Number(grossAmount))
      },
      item_details: formattedItems,
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: customer.email || 'customer@mustazcraft.com',
        phone: customer.phone || '08123456789',
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address: customer.address || 'Indonesia',
          phone: customer.phone || '08123456789'
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address: customer.address || 'Indonesia',
          phone: customer.phone || '08123456789'
        }
      },
      credit_card: {
        secure: true
      },
      expiry: {
        unit: 'hours',
        duration: 24
      }
    };

    console.log(`[Midtrans Snap] Creating transaction for #${orderId}, amount: ${grossAmount}`);

    const snapResponse = await fetch(snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const snapData = await snapResponse.json();

    if (!snapResponse.ok) {
      console.error('[Midtrans Snap API Error]', snapResponse.status, snapData);
      return res.status(snapResponse.status).json({
        error: snapData.error_messages ? snapData.error_messages.join(', ') : 'Midtrans API error',
        details: snapData
      });
    }

    return res.status(200).json({
      success: true,
      token: snapData.token,
      redirect_url: snapData.redirect_url,
      order_id: orderId
    });

  } catch (err) {
    console.error('[Midtrans Serverless Exception]:', err);
    return res.status(500).json({
      error: err.message || 'Internal Server Error'
    });
  }
}
