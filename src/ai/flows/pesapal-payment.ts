
'use server';

import { ai } from '@/ai/genkit';
import { pesapalService, type PaymentRequest } from '@/lib/pesapal';
import { z } from 'genkit';

const PesapalPaymentInputSchema = z.object({
  amount: z.string(),
  description: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
});

type PesapalPaymentInput = z.infer<typeof PesapalPaymentInputSchema>;

const PesapalPaymentOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  redirectUrl: z.string().optional(),
});

type PesapalPaymentOutput = z.infer<typeof PesapalPaymentOutputSchema>;

export async function initiatePesapalPayment(input: PesapalPaymentInput): Promise<PesapalPaymentOutput> {
  return initiatePesapalPaymentFlow(input);
}

const initiatePesapalPaymentFlow = ai.defineFlow(
  {
    name: 'initiatePesapalPaymentFlow',
    inputSchema: PesapalPaymentInputSchema,
    outputSchema: PesapalPaymentOutputSchema,
  },
  async (input) => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
        }
        
        const merchantReference = `VoucherWave-${Date.now()}`;
        
        const paymentRequest: PaymentRequest = {
            id: merchantReference,
            currency: 'UGX',
            amount: parseFloat(input.amount),
            description: input.description,
            callback_url: `${baseUrl}/api/pesapal/callback`, 
            billing_address: {
                email_address: input.email,
                phone_number: input.phoneNumber,
                country_code: 'UG',
                first_name: 'VoucherWave', // Using placeholder names
                last_name: 'Customer',
            },
        };

        const paymentResponse = await pesapalService.submitOrderRequest(paymentRequest);

        if (paymentResponse.redirect_url) {
             return {
                success: true,
                message: 'Payment initiated. Redirecting...',
                redirectUrl: paymentResponse.redirect_url,
            };
        } else {
            return {
                success: false,
                message: paymentResponse.error?.message || 'Failed to get redirect URL from Pesapal.',
            }
        }
    } catch (error) {
        console.error('Pesapal payment initiation error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred.',
        };
    }
  }
);
