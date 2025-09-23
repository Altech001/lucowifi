import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-mikrotik-profiles.ts';
import '@/ai/flows/whatsapp-voucher-delivery.ts';
import '@/ai/flows/membership-signup.ts';
import '@/ai/flows/send-bulk-message.ts';
import '@/ai/flows/process-payment.ts';
import '@/ai/flows/check-payment-status.ts';
import '@/ai/flows/pesapal-payment.ts';
