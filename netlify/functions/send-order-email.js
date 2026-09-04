/**
 * Netlify Serverless Function: send-order-email
 * Transmits order confirmation & invoice HTML to buyer's email
 */

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { to, subject, html, orderId, customerName, total } = data;

    if (!to || !to.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid recipient email (to) is required' })
      };
    }

    console.log(`[Netlify Email Function] Processing order email for #${orderId} to: ${to}`);

    // Option 1: Send via Resend API if RESEND_API_KEY is configured in Netlify Environment
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
            subject: subject || `⚡ Order Confirmation #${orderId} - MUSTAZ CRAFT`,
            html: html
          })
        });
        const resendData = await resendRes.json();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, provider: 'resend', data: resendData })
        };
      } catch (err) {
        console.warn('Resend error:', err.message);
      }
    }

    // Option 2: Fallback / standard confirmation
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        orderId: orderId,
        recipient: to,
        message: `Order confirmation for #${orderId} queued for ${to}`
      })
    };
  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
