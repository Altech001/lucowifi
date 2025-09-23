
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
        // THIS IS A PLACEHOLDER - The correct URL for status checking is unknown.
        const url = 'https://hive-sooty-eight.vercel.app/CHECK_STATUS_URL_IS_UNKNOWN';
        
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
                // Handle HTTP errors like 404, 500 etc.
                if (response.status === 404) {
                    return {
                        success: false,
                        status: 'ERROR',
                        message: `Status check failed: The status check URL is incorrect (404 Not Found). Please configure the correct endpoint.`,
                    };
                }
                return {
                    success: false,
                    status: 'ERROR',
                    message: `Status check failed: ${response.status} ${response.statusText}. Details: ${responseDataText}`,
                };
            }

            try {
                // Try parsing as JSON first, as this is the most common success case.
                const responseData = JSON.parse(responseDataText);
                const transactionStatus = responseData.TransactionStatus || 'UNKNOWN';
                
                return {
                    success: true,
                    status: transactionStatus,
                    message: `Status: ${transactionStatus}`,
                    data: responseData,
                };

            } catch (jsonError) {
                 // If JSON parsing fails, the response might be XML or plain text.
                 // This is an unknown state, so we return an error.
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
