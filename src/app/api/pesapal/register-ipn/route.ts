
import axios from 'axios';
import { CONFIG } from '@/lib/config';
import { NextResponse } from 'next/server';

let cache = { ipn_id: null as string | null };

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
  if (cache.ipn_id) {
    return NextResponse.json({ ipn_id: cache.ipn_id });
  }

  try {
    const appBaseUrl = getBaseUrl();
    const tokenResponse = await axios.get(`${appBaseUrl}/api/pesapal/token`);
    const token = tokenResponse.data.token;

    const response = await axios.post(
      CONFIG.IPN_REGISTER_URL,
      {
        url: `${CONFIG.CALLBACK_BASE_URL}/api/pesapal/ipn-webhook`,
        ipn_notification_type: 'POST',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const { ipn_id } = response.data;
    if (!ipn_id) {
      throw new Error('IPN ID not found');
    }

    cache.ipn_id = ipn_id;
    return NextResponse.json({ ipn_id });
  } catch (error: any) {
    console.error('Error registering IPN:', error.message);
    return NextResponse.json({ error: 'Failed to register IPN', details: error.response?.data || error.message }, { status: 500 });
  }
}
