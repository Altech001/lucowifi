
import { NextResponse } from 'next/server';
import { pesapalService } from '@/lib/pesapal';

export async function POST(request: Request) {
  try {
    const ipnData = await request.json();
    console.log('Received Pesapal IPN:', ipnData);

    const orderTrackingId = ipnData.OrderTrackingId;
    
    if (!orderTrackingId) {
      console.error('IPN received without OrderTrackingId');
      return NextResponse.json({ error: 'Missing OrderTrackingId' }, { status: 400 });
    }

    // Verify payment status with Pesapal to confirm the notification is legitimate
    const status = await pesapalService.getTransactionStatus(orderTrackingId);
    
    // Log the confirmed status.
    // In a real app, you would update your database here based on the status.
    // e.g., if status.payment_status_description === 'Completed', mark the order as paid.
    console.log(`Confirmed payment status for ${orderTrackingId}:`, status);

    // Respond to Pesapal to acknowledge receipt
    return NextResponse.json({ status: 'success', message: 'IPN received and acknowledged' });

  } catch (error) {
    console.error('IPN handler error:', error);
    return NextResponse.json({ error: 'Failed to process IPN' }, { status: 500 });
  }
}
