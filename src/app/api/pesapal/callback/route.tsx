
import { NextRequest, NextResponse } from 'next/server';
import { pesapalService, PaymentStatus } from '@/lib/pesapal';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const merchantReference = searchParams.get('OrderMerchantReference');
  
  let status: PaymentStatus | null = null;
  let error: string | null = null;

  if (!orderTrackingId) {
    error = 'Payment session incomplete. Order Tracking ID is missing.';
  } else {
    try {
      status = await pesapalService.getTransactionStatus(orderTrackingId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unknown error occurred while verifying payment.';
    }
  }

  const statusDescription = status?.payment_status_description || 'Unknown';
  const isSuccess = statusDescription === 'Completed';

  // Redirect to a simple success or failure page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const redirectUrl = new URL(isSuccess ? '/payment-success' : '/payment-failure', baseUrl);
  
  redirectUrl.searchParams.set('status', statusDescription);
  if (merchantReference) {
    redirectUrl.searchParams.set('ref', merchantReference);
  }
  if (error) {
      redirectUrl.searchParams.set('error', error);
  }

  return NextResponse.redirect(redirectUrl.toString());
}
