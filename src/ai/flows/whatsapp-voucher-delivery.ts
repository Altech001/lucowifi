
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
  async input => {
    // Placeholder implementation for sending the WhatsApp message.
    // In a real application, this would integrate with a WhatsApp Business API provider.
    console.log(`Sending WhatsApp message to ${input.phoneNumber}: ${input.message}`);
    // Simulate a potential failure
    if (input.phoneNumber.includes('FAIL')) {
        return {
            success: false,
            message: `Simulated failure sending message to ${input.phoneNumber}`
        }
    }
    return {
      success: true,
      message: `Message sent successfully to ${input.phoneNumber}`,
    };
  }
);

const sendWhatsappVoucherFlow = ai.defineFlow(
  {
    name: 'sendWhatsappVoucherFlow',
    inputSchema: SendWhatsappVoucherInputSchema,
    outputSchema: SendWhatsappVoucherOutputSchema,
    tools: [sendWhatsappMessage],
  },
  async input => {
    const prompt = `
You are a helpful assistant for Luco WIFI.
A user has purchased a voucher. Your task is to send them their voucher code via WhatsApp.
The user's phone number is: ${input.phoneNumber}
The voucher code is: ${input.voucherCode}

Use the provided tool to send the WhatsApp message.
The message should be friendly and clear, stating "Your Luco WIFI voucher code is: [voucher code]".
`;

    const {output} = await ai.generate({
      prompt: prompt,
      history: [],
      tools: [sendWhatsappMessage],
    });

    // The model should call the tool. We need to find the tool call result.
    const toolResponse = output.history[1]?.toolResponse;

    if (toolResponse && toolResponse[0].output) {
      return toolResponse[0].output as SendWhatsappVoucherOutput;
    }
    
    // Fallback if the model fails to call the tool correctly.
    return {
        success: false,
        message: 'Failed to trigger WhatsApp message tool.'
    }
  }
);
