
'use server';

/**
 * @fileOverview A flow to process payments through a third-party provider.
 *
 * - processPayment - A function that handles the payment initiation.
 * - ProcessPaymentInput - The input type for the processPayment function.
 * - ProcessPaymentOutput - The return type for the processPayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessPaymentInputSchema = z.object({
  amount: z.string().describe('The amount to be paid.'),
  number: z.string().describe('The phone number of the payer.'),
});
export type ProcessPaymentInput = z.infer<typeof ProcessPaymentInputSchema>;

const ProcessPaymentOutputSchema = z.object({
  success: z.boolean().describe('Whether the payment was successfully initiated.'),
  message: z.string().describe('The message from the payment provider.'),
  data: z.any().optional().describe('Any additional data from the provider.'),
});
export type ProcessPaymentOutput = z.infer<typeof ProcessPaymentOutputSchema>;


export async function processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
  return processPaymentFlow(input);
}

const processPaymentTool = ai.defineTool(
    {
        name: 'processPaymentTool',
        description: 'Initiates a payment with the payment provider.',
        inputSchema: z.object({
            amount: z.string(),
            number: z.string(),
            refer: z.string(),
        }),
        outputSchema: ProcessPaymentOutputSchema,
    },
    async (payload) => {
        const url = 'https://hive-sooty-eight.vercel.app/process_payment';
        
        // IMPORTANT: Replace with your actual username and password, preferably from environment variables.
        const username = 'YOURUSERNAME'; 
        const password = 'YOURPASSWORD';

        // IMPORTANT: Replace with your actual success and failure URLs.
        const successUrl = 'https://your_domain.com/payment/success';
        const failedUrl = 'https://your_domain.com/payment/failed';

        const body = {
            amount: payload.amount,
            number: payload.number,
            refer: payload.refer,
            username: username,
            password: password,
            'success-re-url': successUrl,
            'failed-re-url': failedUrl,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                return {
                    success: false,
                    message: `Payment provider returned an error: ${response.status} ${response.statusText}. Details: ${errorData}`,
                };
            }

            const responseData = await response.json();

            // Based on typical API responses, you might need to adjust this logic.
            // Assuming the API returns a success flag or a specific status.
            if (responseData.status === 'success' || responseData.success) {
                 return {
                    success: true,
                    message: responseData.message || 'Payment initiated successfully.',
                    data: responseData,
                };
            } else {
                 return {
                    success: false,
                    message: responseData.message || 'Payment provider indicated failure.',
                    data: responseData,
                };
            }

        } catch (error) {
            console.error('Failed to call payment API:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown network error occurred.';
            return {
                success: false,
                message: `Failed to initiate payment: ${errorMessage}`,
            };
        }
    }
);


const processPaymentFlow = ai.defineFlow(
  {
    name: 'processPaymentFlow',
    inputSchema: ProcessPaymentInputSchema,
    outputSchema: ProcessPaymentOutputSchema,
  },
  async (input) => {
    // Generate a unique reference for the transaction
    const refer = `luco-wifi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const result = await processPaymentTool({ ...input, refer });
    
    return result;
  }
);
