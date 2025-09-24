
import axios from 'axios';
import { CONFIG } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';


// Helper function to get the base URL for API calls within the server
function getBaseUrl() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get('orderTrackingId');

  if (!orderTrackingId) {
    return NextResponse.json({ error: 'orderTrackingId is required' }, { status: 400 });
  }

  try {
    const appBaseUrl = getBaseUrl();
    const tokenResponse = await axios.get(`${appBaseUrl}/api/pesapal/token`);
    const token = tokenResponse.data.token;

    const response = await axios.get(
      `${CONFIG.TRANSACTION_STATUS_URL}?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching transaction status:', error.message);
    return NextResponse.json({ error: 'Failed to fetch transaction status', details: error.response?.data || error.message }, { status: 500 });
  }
}
