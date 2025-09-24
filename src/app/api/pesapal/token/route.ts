
import axios from 'axios';
import { CONFIG } from '@/lib/config';
import { NextResponse } from 'next/server';

let cache = {
  access_token: null as string | null,
  access_token_expiry: null as number | null,
};

export async function getPesapalToken(): Promise<string> {
    // Check if token is cached and not expired
    if (cache.access_token && cache.access_token_expiry && cache.access_token_expiry > Date.now()) {
      return cache.access_token;
    }

    try {
        const response = await axios.post(
            CONFIG.TOKEN_URL,
            {
                // FIX: Hardcode sandbox credentials for testing as .env is not loading them.
                consumer_key: "BopfGlE7GfenAqGvS5SGdke4M67WLFxh",
                consumer_secret: "nnYh5QSFZUXRsQu6PQI4llLB5iU=",
            },
            {
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            }
        );

        const { token, expiryDate } = response.data;
        if (!token || !expiryDate) {
            throw new Error('Token or expiryDate not found in Pesapal response');
        }

        const expiry = new Date(expiryDate.replace('Z', '+00:00')).getTime();
        cache.access_token = token;
        cache.access_token_expiry = expiry;

        return token;
    } catch(error: any) {
        console.error('Error fetching access token:', error.message);
        const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        throw new Error(`Failed to fetch access token. Details: ${errorDetails}`);
    }
}


export async function GET(req: Request) {
  try {
    const token = await getPesapalToken();
    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
