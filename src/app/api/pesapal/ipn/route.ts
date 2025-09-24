
import { NextResponse } from 'next/server';
import { get, ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { sendWhatsappVoucher } from '@/ai/flows/whatsapp-voucher-delivery';

// This is a placeholder. You must implement a way to get the real status from Pesapal.
// In a real app, you would call `pesapalService.getTransactionStatus(orderTrackingId)`
async function confirmTransactionIsComplete(orderTrackingId: string): Promise<boolean> {
    // For now, we will trust the IPN, but in production you MUST verify.
    console.log(`[IPN] Verifying status for ${orderTrackingId}... In a real app, this would call Pesapal's status endpoint.`);
    return true; 
}


async function findAndAssignVoucher(packageSlug: string, customerPhoneNumber: string): Promise<string | null> {
  const vouchersRef = ref(db, `vouchers/${packageSlug}`);
  const snapshot = await get(vouchersRef);

  if (!snapshot.exists()) {
    console.error(`[IPN] No vouchers exist for package slug: ${packageSlug}`);
    return null;
  }

  const allVouchers = snapshot.val();
  const availableVoucherEntry = Object.entries(allVouchers).find(
      ([, voucher]: [string, any]) => !voucher.usedAt
  );

  if (!availableVoucherEntry) {
    console.error(`[IPN] All vouchers for package ${packageSlug} are sold out.`);
    return null;
  }

  const [voucherId, voucherData] = availableVoucherEntry as [string, { code: string }];
  const voucherCode = voucherData.code;

  const voucherRef = ref(db, `vouchers/${packageSlug}/${voucherId}`);
  await update(voucherRef, {
    usedAt: new Date().toISOString(),
    purchasedBy: customerPhoneNumber
  });

  console.log(`[IPN] Assigned voucher ${voucherCode} to ${customerPhoneNumber}`);
  return voucherCode;
}


export async function POST(request: Request) {
  try {
    const ipnData = await request.json();
    console.log('[IPN] Received Pesapal IPN:', JSON.stringify(ipnData, null, 2));

    const orderTrackingId = ipnData.OrderTrackingId;
    const orderMerchantReference = ipnData.OrderMerchantReference;
    
    if (!orderTrackingId || !orderMerchantReference) {
      console.error('[IPN] Received without OrderTrackingId or OrderMerchantReference');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify the payment status with Pesapal to confirm the notification is legitimate
    const isCompleted = await confirmTransactionIsComplete(orderTrackingId);
    
    if (isCompleted) {
        console.log(`[IPN] Payment for ${orderTrackingId} is confirmed as complete.`);
        
        // 2. Look up the pending order in your database using `orderMerchantReference`
        // This part is crucial and needs to be implemented. We will simulate it for now.
        // const pendingOrder = await getPendingOrder(orderMerchantReference);
        const pendingOrder = { 
            packageSlug: 'daily', // SIMULATED: You MUST fetch this from your DB
            customerPhoneNumber: '256712345678' // SIMULATED: You MUST fetch this from your DB
        };

        if (!pendingOrder) {
            console.error(`[IPN] Could not find a pending order for merchant reference: ${orderMerchantReference}`);
            // Still respond 200 so Pesapal doesn't keep sending the IPN
            return NextResponse.json({ status: 'OK', message: 'IPN received, but order not found.' });
        }

        // 3. Find an available voucher for the purchased package
        const voucherCode = await findAndAssignVoucher(pendingOrder.packageSlug, pendingOrder.customerPhoneNumber);

        if (voucherCode) {
            // 4. Send the voucher to the customer via WhatsApp
            await sendWhatsappVoucher({
                phoneNumber: pendingOrder.customerPhoneNumber,
                voucherCode: voucherCode
            });
            console.log(`[IPN] Successfully sent voucher ${voucherCode} to ${pendingOrder.customerPhoneNumber}`);
            
            // 5. Mark the pending order as completed in your DB
            // await markOrderAsCompleted(orderMerchantReference);

        } else {
            // CRITICAL: Handle the "sold out" case. Maybe email the admin.
            console.error(`[IPN] CRITICAL: Payment received for ${orderMerchantReference}, but no vouchers were available for package ${pendingOrder.packageSlug}. Manual intervention required.`);
        }

    } else {
        console.log(`[IPN] Payment for ${orderTrackingId} is not 'Completed'. Ignoring.`);
    }

    // Respond to Pesapal to acknowledge receipt
    return NextResponse.json({ 
        orderNotificationType: ipnData.orderNotificationType,
        orderTrackingId: ipnData.orderTrackingId,
        status: "OK" 
    });

  } catch (error) {
    console.error('[IPN] Handler error:', error);
    return NextResponse.json({ error: 'Failed to process IPN' }, { status: 500 });
  }
}
