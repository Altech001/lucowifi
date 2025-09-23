
'use server';

/**
 * @fileOverview A flow to send bulk messages to all users.
 *
 * - sendBulkMessage - A function that sends a custom message to all users.
 * - SendBulkMessageInput - The input type for the sendBulkMessage function.
 * - SendBulkMessageOutput - The return type for the sendBulkMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllVouchersWithPackageInfo, getMemberships } from '@/lib/database-data';

// Re-using the tool from the voucher delivery flow to send messages
import { sendWhatsappVoucher } from './whatsapp-voucher-delivery';

const SendBulkMessageInputSchema = z.object({
  message: z.string().describe('The content of the message to be sent to all users.'),
  messageType: z.string().optional().describe('The type of message to generate, e.g., "promotional", "outage notification".'),
});
export type SendBulkMessageInput = z.infer<typeof SendBulkMessageInputSchema>;

const SendBulkMessageOutputSchema = z.object({
  success: z.boolean().describe('Whether the bulk message sending was successfully initiated.'),
  message: z.string().describe('A summary of the operation.'),
  sentCount: z.number().describe('The number of unique users the message was sent to.'),
});
export type SendBulkMessageOutput = z.infer<typeof SendBulkMessageOutputSchema>;

export async function sendBulkMessage(input: SendBulkMessageInput): Promise<SendBulkMessageOutput> {
  return sendBulkMessageFlow(input);
}

// A separate flow just for generating message content with AI
export async function generateMessage(input: {messageType: string}): Promise<string> {
    const { output } = await ai.generate({
        prompt: `Generate a short, friendly, and professional SMS message for a WIFI provider's customers. The message should be about: ${input.messageType}. Keep it concise and clear.`,
        model: 'googleai/gemini-2.5-flash',
    });
    return output?.text ?? '';
}

function formatPhoneNumberForApi(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0')) {
        return '+256' + cleaned.substring(1);
    }
    if (cleaned.startsWith('256')) {
        return '+' + cleaned;
    }
    if (!cleaned.startsWith('+256')) {
        return '+256' + cleaned;
    }
    return cleaned;
}

// The main flow for sending the bulk message
const sendBulkMessageFlow = ai.defineFlow(
  {
    name: 'sendBulkMessageFlow',
    inputSchema: SendBulkMessageInputSchema,
    outputSchema: SendBulkMessageOutputSchema,
  },
  async ({ message }) => {
    // 1. Get all unique phone numbers
    const allVouchers = await getAllVouchersWithPackageInfo();
    const memberships = await getMemberships();
    
    const voucherPhones = allVouchers
        .map(v => v.purchasedBy)
        .filter((p): p is string => !!p);
    
    const memberPhones = memberships.map(m => m.phoneNumber);
    const allUniquePhones = [...new Set([...voucherPhones, ...memberPhones])];

    if (allUniquePhones.length === 0) {
        return {
            success: false,
            message: 'No users found to send messages to.',
            sentCount: 0,
        };
    }
    
    // 2. Send the message to each unique number
    // We can't use the voucher-specific flow, so we need a generic message sending tool.
    // Let's create an ad-hoc function for this. In a larger app, this would be a shared tool.
    const sendMessage = async (phoneNumber: string, text: string) => {
        const url = 'https://lucosms-api.onrender.com/api/v1/client/send-sms';
        const apiKey = 'Luco_0gStE1K11IqewVsR9brZY76GfIK2rzve';

        const formattedNumber = formatPhoneNumberForApi(phoneNumber);

        try {
            await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'accept': 'application/json', 'X-API-Key': apiKey},
                body: JSON.stringify({ message: text, recipients: [formattedNumber] })
            });
            return true;
        } catch (error) {
            console.error(`Failed to send to ${phoneNumber}:`, error);
            return false;
        }
    };
    
    const sendPromises = allUniquePhones.map(phone => sendMessage(phone, message));
    
    await Promise.all(sendPromises);

    return {
      success: true,
      message: `Bulk message sending initiated for ${allUniquePhones.length} users.`,
      sentCount: allUniquePhones.length,
    };
  }
);
