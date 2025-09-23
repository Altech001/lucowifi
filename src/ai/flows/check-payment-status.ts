
'use server';

/**
 * @fileOverview A flow to check the status of a payment transaction.
 *
 * - checkPaymentStatus - A function that handles the status check.
 */

import {ai} from '@/ai/genkit';
import {CheckPaymentStatusInputSchema, CheckPaymentStatusOutputSchema, type CheckPaymentStatusInput, type CheckPaymentStatusOutput } from '@/lib/payment-definitions';

export async function checkPaymentStatus(input: CheckPaymentStatusInput): Promise<CheckPaymentStatusOutput> {
  return checkPaymentStatusFlow(input);
}


const checkPaymentStatusTool = ai.defineTool(
    {
        name: 'checkPaymentStatusTool',
        description: 'Checks the status of a payment with the payment provider.',
        inputSchema: CheckPaymentStatusInputSchema,
        outputSchema: CheckPaymentStatusOutputSchema,
    },
    async (payload) => {
        // This URL is an assumption. Replace with the actual status check URL if different.
        const url = 'https://hive-sooty-eight.vercel.app/check_status';
        
        const body = {
            trans_reference: payload.transactionReference,
            username: payload.username,
            password: payload.password,
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
                    status: 'ERROR',
                    message: `Status check failed: ${response.status} ${response.statusText}. Details: ${responseDataText}`,
                };
            }

            try {
                const responseData = JSON.parse(responseDataText);
                const transactionStatus = responseData.TransactionStatus || 'UNKNOWN';
                
                return {
                    success: true,
                    status: transactionStatus,
                    message: `Status: ${transactionStatus}`,
                    data: responseData,
                };

            } catch (jsonError) {
                 return {
                    success: false,
                    status: 'ERROR',
                    message: 'Status check failed: Could not parse JSON response from provider.',
                    data: responseDataText,
                };
            }

        } catch (error: any) {
            console.error('Failed to call payment status API:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown network error occurred.';
            return {
                success: false,
                status: 'ERROR',
                message: `Failed to check status: ${errorMessage}`,
            };
        }
    }
);


const checkPaymentStatusFlow = ai.defineFlow(
  {
    name: 'checkPaymentStatusFlow',
    inputSchema: CheckPaymentStatusInputSchema,
    outputSchema: CheckPaymentStatusOutputSchema,
  },
  async (input) => {
    const result = await checkPaymentStatusTool(input);
    return result;
  }
);
