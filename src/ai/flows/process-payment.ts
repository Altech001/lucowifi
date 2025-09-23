
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
import type { ProcessPaymentInput, ProcessPaymentOutput } from '@/app/actions';


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
            ref: z.string(),
            username: z.string(),
            password: z.string(),
        }),
        outputSchema: z.custom<ProcessPaymentOutput>(),
    },
    async (payload) => {
        const url = 'https://hive-sooty-eight.vercel.app/process_payment';
        
        if (!payload.username || !payload.password) {
            const message = 'Payment provider credentials are not configured in environment variables.';
            console.error(message);
            return { success: false, message };
        }

        // IMPORTANT: Replace with your actual success and failure URLs.
        const successUrl = 'https://your_domain.com/payment/success';
        const failedUrl = 'https://your_domain.com/payment/failed';

        // Format amount to have two decimal places, e.g., "1000.00"
        const formattedAmount = parseFloat(payload.amount).toFixed(2);

        const body = {
            amount: formattedAmount,
            number: payload.number,
            refer: payload.ref,
            username: payload.username,
            password: payload.password,
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
                try {
                    // Try to parse as JSON first
                    const errorJson = JSON.parse(errorData);
                     return {
                        success: false,
                        message: `Payment provider returned an error: ${response.status} ${response.statusText}. Details: ${errorJson.message || errorData}`,
                    };
                } catch {
                     // If parsing fails, return the raw text
                     return {
                        success: false,
                        message: `Payment provider returned an error: ${response.status} ${response.statusText}. Details: ${errorData}`,
                    };
                }
            }

            const responseData = await response.json();

            // Check for both 'status' and 'success' keys in the response
            if (responseData.status === 'success' || responseData.success || responseData.message === 'Payment successful') {
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
    inputSchema: z.custom<ProcessPaymentInput>(),
    outputSchema: z.custom<ProcessPaymentOutput>(),
  },
  async (input) => {
    // Generate a unique reference for the transaction
    const ref = `luco-wifi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const result = await processPaymentTool({
        ...input,
        ref,
        username: input.username,
        password: input.password
    });
    
    return result;
  }
);
