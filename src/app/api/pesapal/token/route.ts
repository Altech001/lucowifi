
import axios from 'axios';
import { CONFIG } from '@/lib/config';
import { NextResponse } from 'next/server';

let cache = {
  access_token: null as string | null,
  access_token_expiry: null as number | null,
};

export async function GET(req: Request) {
  try {
    // Check if token is cached and not expired
    if (cache.access_token && cache.access_token_expiry && cache.access_token_expiry > Date.now()) {
      return NextResponse.json({ token: cache.access_token });
    }

    const response = await axios.post(
      CONFIG.TOKEN_URL,
      {
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
      },
      {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      }
    );

    const { token, expiryDate } = response.data;
    if (!token || !expiryDate) {
      throw new Error('Token or expiryDate not found');
    }

    const expiry = new Date(expiryDate.replace('Z', '+00:00')).getTime();
    cache.access_token = token;
    cache.access_token_expiry = expiry;

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Error fetching access token:', error.message);
    return NextResponse.json({ error: 'Failed to fetch access token', details: error.message }, { status: 500 });
  }
}
