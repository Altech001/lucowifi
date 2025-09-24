
import axios from 'axios';
import { CONFIG } from '@/lib/config';
import { NextResponse } from 'next/server';
import { getPesapalToken } from '@/app/api/pesapal/token/route';

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

export async function registerIpn(): Promise<string> {
    if (cache.ipn_id) {
        return cache.ipn_id;
    }

    try {
        const token = await getPesapalToken();
        const appBaseUrl = getBaseUrl();

        const response = await axios.post(
            CONFIG.IPN_REGISTER_URL,
            {
                url: `${appBaseUrl}/api/pesapal/ipn-webhook`,
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
        return ipn_id;
    } catch (error: any) {
        console.error('Error registering IPN:', error.message);
        const errorDetails = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
        throw new Error(`Failed to register IPN. Details: ${errorDetails}`);
    }
}


export async function POST(req: Request) {
  try {
    const ipn_id = await registerIpn();
    return NextResponse.json({ ipn_id });
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
