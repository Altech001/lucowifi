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
    return {
      success: true,
      message: `Message sent successfully to ${input.phoneNumber}`,
    };
  }
);

const whatsappVoucherPrompt = ai.definePrompt({
  name: 'whatsappVoucherPrompt',
  tools: [sendWhatsappMessage],
  input: {schema: SendWhatsappVoucherInputSchema},
  prompt: `You are in charge of sending a voucher code to a user's WhatsApp number.

The voucher code is: {{{voucherCode}}}
The user's phone number is: {{{phoneNumber}}}

Ensure that the phone number includes the country code.

Use the sendWhatsappMessage tool to send the voucher code to the user's WhatsApp number.
`,
});

const sendWhatsappVoucherFlow = ai.defineFlow(
  {
    name: 'sendWhatsappVoucherFlow',
    inputSchema: SendWhatsappVoucherInputSchema,
    outputSchema: SendWhatsappVoucherOutputSchema,
  },
  async input => {
    const {voucherCode, phoneNumber} = input;

    const promptResult = await whatsappVoucherPrompt({
      voucherCode,
      phoneNumber,
    });

    // Extract the result from the tool call
    const toolCallResult = promptResult.toolCalls?.[0]?.result as SendWhatsappVoucherOutput | undefined;

    if (toolCallResult) {
      return toolCallResult;
    }

    return {
      success: false,
      message: 'Failed to send voucher code.',
    };
  }
);
