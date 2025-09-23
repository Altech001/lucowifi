
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { sendWhatsappVoucher } from '@/ai/flows/whatsapp-voucher-delivery';
import { analyzeMikrotikProfiles } from '@/ai/flows/analyze-mikrotik-profiles';
import { membershipSignup } from '@/ai/flows/membership-signup';

const phoneSchema = z.string().min(10, { message: 'Phone number seems too short.' }).regex(/^\+[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number with country code.' });
const nameSchema = z.string().min(2, { message: 'Name must be at least 2 characters.' });

export async function purchaseVoucherAction(
  prevState: { message: string; success: boolean },
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  const phoneNumber = formData.get('phoneNumber');

  const validation = phoneSchema.safeParse(phoneNumber);

  if (!validation.success) {
    return { message: validation.error.errors[0].message, success: false };
  }

  const validatedPhoneNumber = validation.data;

  // Simulate voucher code generation
  const voucherCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    const result = await sendWhatsappVoucher({
      phoneNumber: validatedPhoneNumber,
      voucherCode,
    });

    if (result.success) {
      redirect(`/voucher/${voucherCode}`);
    } else {
      return { message: result.message || 'Failed to send voucher via WhatsApp.', success: false };
    }
  } catch (error) {
    console.error('WhatsApp delivery failed:', error);
    return { message: 'An unexpected error occurred during WhatsApp delivery.', success: false };
  }
}

type AnalysisState = {
  suggestion?: string;
  reasoning?: string;
  message?: string;
  success: boolean;
};

export async function analyzeProfileAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const file = formData.get('csvFile') as File | null;

  if (!file || file.size === 0) {
    return { message: 'Please upload a valid CSV file.', success: false };
  }

  if (file.type !== 'text/csv') {
    return { message: 'Invalid file type. Please upload a CSV file.', success: false };
  }

  const csvData = await file.text();

  try {
    const result = await analyzeMikrotikProfiles({ csvData });
    if (result.suggestedPackage && result.reasoning) {
      return {
        suggestion: result.suggestedPackage,
        reasoning: result.reasoning,
        success: true,
      };
    } else {
      return { message: 'Analysis failed to return a suggestion.', success: false };
    }
  } catch (error) {
    console.error('Profile analysis failed:', error);
    return { message: 'An unexpected error occurred during analysis.', success: false };
  }
}

const membershipSchema = z.object({
  name: nameSchema,
  phoneNumber: phoneSchema,
});

export async function createMembershipAction(
  prevState: { message: string; success: boolean },
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  const rawFormData = {
    name: formData.get('name'),
    phoneNumber: formData.get('phoneNumber'),
  };

  const validation = membershipSchema.safeParse(rawFormData);

  if (!validation.success) {
    return { message: validation.error.errors[0].message, success: false };
  }

  const { name, phoneNumber } = validation.data;

  try {
    const result = await membershipSignup({
      name,
      phoneNumber,
    });

    if (result.success) {
      redirect(`/membership/success?name=${encodeURIComponent(name)}`);
    } else {
      return { message: result.message || 'Failed to create membership.', success: false };
    }
  } catch (error) {
    console.error('Membership signup failed:', error);
    return { message: 'An unexpected error occurred during membership signup.', success: false };
  }
}
