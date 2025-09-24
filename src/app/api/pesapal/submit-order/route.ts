
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '@/lib/config';
import { NextResponse } from 'next/server';

// Helper function to get the base URL for API calls within the server
function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // Fallback for Vercel environments
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Fallback for local development
    return 'http://localhost:9002';
}


export async function POST(req: Request) {
  const { amount, email, phone_number, first_name, last_name } = await req.json();

  try {
    const appBaseUrl = getBaseUrl();
    const tokenResponse = await axios.get(`${appBaseUrl}/api/pesapal/token`);
    const token = tokenResponse.data.token;

    const ipnResponse = await axios.post(`${appBaseUrl}/api/pesapal/register-ipn`);
    const ipn_id = ipnResponse.data.ipn_id;

    const response = await axios.post(
      CONFIG.SUBMIT_ORDER_URL,
      {
        id: uuidv4(),
        currency: 'UGX',
        amount,
        description: 'Payment for WIFI Voucher',
        callback_url: `${CONFIG.CALLBACK_BASE_URL}/payment-callback`,
        notification_id: ipn_id,
        billing_address: {
          email_address: email,
          phone_number,
          first_name,
          last_name,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json({
      message: 'Order initiated successfully',
      redirect_url: response.data.redirect_url,
      order_tracking_id: response.data.order_tracking_id,
    });
  } catch (error: any) {
    console.error('Error submitting order:', error.message);
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
    console.error('Full error details:', errorDetails);
    return NextResponse.json({ error: 'Failed to submit order', details: error.response?.data || error.message }, { status: 500 });
  }
}
