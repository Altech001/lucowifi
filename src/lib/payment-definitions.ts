
'use server';
import { z } from 'zod';

export const CheckPaymentStatusInputSchema = z.object({
  transactionReference: z.string().describe('The transaction reference to check.'),
  username: z.string(),
  password: z.string(),
});
export type CheckPaymentStatusInput = z.infer<typeof CheckPaymentStatusInputSchema>;


export const CheckPaymentStatusOutputSchema = z.object({
    success: z.boolean(),
    status: z.string().describe("The status of the transaction, e.g., PENDING, SUCCESSFUL, FAILED."),
    message: z.string(),
    data: z.any().optional(),
});
export type CheckPaymentStatusOutput = z.infer<typeof CheckPaymentStatusOutputSchema>;
