
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
        inputSchema: z.custom<ProcessPaymentInput>(),
        outputSchema: z.custom<ProcessPaymentOutput>(),
    },
    async (payload) => {
        const url = 'https://hive-sooty-eight.vercel.app/process_payment';
        
        if (!payload.username || !payload.password) {
            const message = 'Payment provider credentials are not configured in environment variables.';
            console.error(message);
            return { success: false, message };
        }

        // Use real, valid URLs as placeholders
        const successUrl = 'https://www.google.com/search?q=success';
        const failedUrl = 'https://www.google.com/search?q=failed';
        
        // Ensure amount is a string of an integer
        const formattedAmount = parseInt(payload.amount, 10).toString();

        const body = {
            amount: formattedAmount,
            number: payload.number,
            ref: payload.ref, // Corrected from 'refer'
            username: payload.username,
            password: payload.password,
            success: successUrl, // Corrected from 'success-re-url'
            failed: failedUrl,   // Corrected from 'failed-re-url'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            const responseDataText = await response.text();

            if (!response.ok) {
                 return {
                    success: false,
                    message: `Payment provider returned an error: ${response.status} ${response.statusText}. Details: ${responseDataText}`,
                };
            }

            try {
                const responseData = JSON.parse(responseDataText);
                
                // Extract transaction status and reference from nested XML if it exists
                let transactionStatus = 'UNKNOWN';
                let transactionReference = null;
                if (responseData.response && typeof responseData.response === 'string') {
                    const statusMatch = responseData.response.match(/<TransactionStatus>(.*?)<\/TransactionStatus>/);
                    if (statusMatch && statusMatch[1]) {
                        transactionStatus = statusMatch[1];
                    }
                    const refMatch = responseData.response.match(/<TransactionReference>(.*?)<\/TransactionReference>/);
                     if (refMatch && refMatch[1]) {
                        transactionReference = refMatch[1];
                    }
                }

                 if (responseData.message === 'Payment successful') {
                     return {
                        success: true,
                        message: responseData.message || 'Payment initiated successfully.',
                        data: { 
                            ...responseData, 
                            TransactionStatus: transactionStatus,
                            TransactionReference: transactionReference,
                        },
                    };
                } else {
                     return {
                        success: false,
                        message: responseData.message || 'Payment provider indicated failure.',
                        data: responseData,
                    };
                }
            } catch (jsonError) {
                 // Handle cases where the response is not valid JSON, but the request was successful (status 200)
                 return {
                    success: true,
                    message: 'Payment initiated. The response from the provider was not in a standard JSON format.',
                    data: responseDataText,
                };
            }

        } catch (error: any) {
            console.error('Failed to call payment API:', error);
            // Handle fetch-specific errors (e.g., network issues)
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
    const ref = `luco-wifi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const result = await processPaymentTool({
        ...input,
        ref,
    });
    
    return result;
  }
);
