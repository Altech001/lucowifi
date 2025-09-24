
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const ipnData = await req.json();
    console.log('IPN Payload:', JSON.stringify(ipnData, null, 2));

    // In a real app, you would process this data, e.g., update an order in your database.
    // For this example, we just log it to a file.
    const logFile = path.join(process.cwd(), 'pin.json');
    await fs.appendFile(logFile, JSON.stringify(ipnData, null, 2) + '\n');

    return NextResponse.json({
      orderNotificationType: ipnData.orderNotificationType,
      orderTrackingId: ipnData.orderTrackingId,
      status: 'OK',
    });
  } catch (error: any) {
    console.error('Error handling IPN:', error.message);
    return NextResponse.json({ error: 'Error processing IPN', details: error.message }, { status: 500 });
  }
}
