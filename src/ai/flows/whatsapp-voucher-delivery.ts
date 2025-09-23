
'use server';

/**
 * @fileOverview A flow to send voucher codes to a user's WhatsApp number.
 *
 * - sendWhatsappVoucher - A function that sends the voucher code to the WhatsApp number.
 * - SendWhatsappVoucherInput - The input type for the sendWhatsappVoucher function.
 * - SendWhatsappVoucherOutput - The return type for the sendWhatsappVoucher function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendWhatsappVoucherInputSchema = z.object({
  phoneNumber: z
    .string()
    .describe('The user phone number, including the country code.'),
  voucherCode: z.string().describe('The voucher code to be sent.'),
});
export type SendWhatsappVoucherInput = z.infer<typeof SendWhatsappVoucherInputSchema>;

const SendWhatsappVoucherOutputSchema = z.object({
  success: z.boolean().describe('Whether the message was successfully sent.'),
  message: z.string().describe('The message returned by the service.'),
});
export type SendWhatsappVoucherOutput = z.infer<typeof SendWhatsappVoucherOutputSchema>;

export async function sendWhatsappVoucher(input: SendWhatsappVoucherInput): Promise<SendWhatsappVoucherOutput> {
  return sendWhatsappVoucherFlow(input);
}


// Helper function to format phone number
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any spaces, dashes, or other non-digit characters, but keep the leading '+' if it exists
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 0, replace it with 256
  if (cleaned.startsWith('0')) {
    return '256' + cleaned.substring(1);
  }
  
  // If number starts with +, remove it and check length
  if (phoneNumber.startsWith('+')) {
      return cleaned;
  }
  
  // If it starts with 256, it's likely correct but missing the + which we dont need for this API
  if (cleaned.startsWith('256')) {
    return cleaned;
  }
  
  // For any other case, assume it's a local number needing the prefix
  return '256' + cleaned;
}

const sendWhatsappMessage = ai.defineTool(
  {
    name: 'sendWhatsappMessage',
    description: 'Sends a message to a given WhatsApp number using an external service.',
    inputSchema: z.object({
      phoneNumber: z
        .string()
        .describe('The WhatsApp number to send the message to, including the country code.'),
      message: z.string().describe('The message to send.'),
    }),
    outputSchema: z.object({
      success: z.boolean().describe('Whether the message was successfully sent.'),
      message: z.string().describe('The message returned by the service.'),
    }),
  },
  async ({ phoneNumber, message }) => {
      const url = 'https://lucosms-api.onrender.com/api/v1/client/send-sms';
      const apiKey = 'Luco_0gStE1K11IqewVsR9brZY76GfIK2rzve';

      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      console.log('Sending SMS to:', formattedNumber);
      console.log('Message content:', message);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({
            message: message,
            recipients: [formattedNumber]
          })
        });

        const data = await response.json();
        console.log('SMS API response:', data);

        if (!response.ok || data.status !== 'success') {
          console.error('SMS API error:', {
            status: response.status,
            statusText: response.statusText,
            body: data,
          });
           return {
            success: false,
            message: data.detail || `Failed to send SMS. API returned status ${response.status}.`,
          };
        }
        
        return {
          success: true,
          message: `Message successfully sent to ${phoneNumber}.`
        };

      } catch (error) {
        console.error('SMS sending error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
          success: false,
          message: `Failed to send message: ${errorMessage}`
        };
      }
  }
);

const sendWhatsappVoucherFlow = ai.defineFlow(
  {
    name: 'sendWhatsappVoucherFlow',
    inputSchema: SendWhatsappVoucherInputSchema,
    outputSchema: SendWhatsappVoucherOutputSchema,
    tools: [sendWhatsappMessage],
  },
  async ({ phoneNumber, voucherCode }) => {
    const message = `Your Luco WIFI voucher code is: ${voucherCode}`;

    // Directly call the tool for a more reliable result.
    const result = await sendWhatsappMessage({
      phoneNumber,
      message,
    });
    
    return result;
  }
);
