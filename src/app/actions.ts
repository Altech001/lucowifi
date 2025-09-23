
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { sendWhatsappVoucher } from '@/ai/flows/whatsapp-voucher-delivery';
import { analyzeMikrotikProfiles } from '@/ai/flows/analyze-mikrotik-profiles';
import { membershipSignup } from '@/ai/flows/membership-signup';
import { sendBulkMessage, generateMessage } from '@/ai/flows/send-bulk-message';
import { promises as fs } from 'fs';
import path from 'path';
import { Package, Voucher } from '@/lib/definitions';
import { db } from '@/lib/firebase';
import { ref, set, push, update, remove, get, query, orderByChild, equalTo, limitToFirst } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import { getVoucherStatus, getAllVouchersWithPackageInfo, getMemberships } from '@/lib/database-data';
import { cookies } from 'next/headers';


const phoneSchema = z.string().min(10, { message: 'Phone number seems too short.' }).regex(/^(?:\+?256|0)\d{9}$/, { message: 'Please provide a valid Ugandan phone number.' });
const nameSchema = z.string().min(2, { message: 'Name must be at least 2 characters.' });

type ExistingVoucherInfo = {
    code: string;
    packageName: string;
    status: 'Active' | 'Expired' | 'Available';
    expiry: string | null;
}

type PurchaseState = {
    message: string;
    success: boolean;
    existingVouchers?: ExistingVoucherInfo[];
}

export async function purchaseVoucherAction(
  prevState: PurchaseState,
  formData: FormData
): Promise<PurchaseState> {
  const phoneNumber = formData.get('phoneNumber');
  const packageSlug = formData.get('packageSlug') as string;
  const forcePurchase = formData.get('forcePurchase') === 'true';


  const validation = phoneSchema.safeParse(phoneNumber);

  if (!validation.success) {
    return { message: validation.error.errors[0].message, success: false };
  }

  const validatedPhoneNumber = validation.data;

  // Check for existing active voucher, unless a force purchase is requested
  if (!forcePurchase) {
      const allVouchers = await getAllVouchersWithPackageInfo();
      const existingVouchers = allVouchers.filter(v => v.purchasedBy === validatedPhoneNumber);

      if (existingVouchers.length > 0) {
          const existingVouchersInfo = existingVouchers.map(v => {
              const { status, expiry } = getVoucherStatus(v, v.packageDurationHours);
              return {
                  code: v.code,
                  packageName: v.packageName,
                  status: status,
                  expiry: expiry,
              }
          }).sort((a,b) => (a.status === 'Active' ? -1 : 1)); // Show active ones first

          return {
              message: 'You already have purchased vouchers.',
              success: false,
              existingVouchers: existingVouchersInfo,
          }
      }
  }


  let voucherCode: string | null = null;
  let voucherId: string | null = null;
  let hasSucceeded = false;

  try {
    const vouchersRef = ref(db, `vouchers/${packageSlug}`);
    const snapshot = await get(vouchersRef);

    if (!snapshot.exists()) {
      return { message: 'Sorry, all vouchers for this package are currently sold out.', success: false };
    }

    const allVouchers = snapshot.val();
    
    // Find the first available voucher by filtering in code
    const availableVoucherEntry = Object.entries(allVouchers).find(
        ([id, voucher]: [string, any]) => !voucher.usedAt
    );

    if (!availableVoucherEntry) {
         return { message: 'Sorry, all vouchers for this package are currently sold out.', success: false };
    }

    voucherId = availableVoucherEntry[0];
    const voucherData: any = availableVoucherEntry[1];
    voucherCode = voucherData.code;

    const voucherRef = ref(db, `vouchers/${packageSlug}/${voucherId}`);
    await update(voucherRef, {
      usedAt: new Date().toISOString(),
      purchasedBy: validatedPhoneNumber
    });

    hasSucceeded = true;
    
  } catch (error) {
    console.error('Voucher purchase process failed:', error);
    return { message: 'An unexpected error occurred during your purchase.', success: false };
  }
  
  if (hasSucceeded && voucherCode) {
    try {
        const smsResult = await sendWhatsappVoucher({
            phoneNumber: validatedPhoneNumber,
            voucherCode: voucherCode
        });
        if (!smsResult.success) {
            // Even if SMS fails, the purchase was successful. We should log this.
            console.error(`Failed to send SMS to ${validatedPhoneNumber}: ${smsResult.message}`);
            // We can decide if we want to show a message to the user about the SMS failure.
            // For now, we will still redirect as the purchase is complete.
        }
    } catch(e) {
        console.error(`Critical error calling sendWhatsappVoucher flow for ${validatedPhoneNumber}`, e);
    }
    revalidatePath(`/admin`);
    redirect(`/voucher/${voucherCode}`);
  }

  // This should theoretically not be reached if everything works
  return { message: 'Failed to complete the purchase process.', success: false };
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

const fileSchema = z.instanceof(File).refine(file => file.size > 0, 'File is required.');

const membershipSchema = z.object({
  name: nameSchema,
  phoneNumber: phoneSchema,
  username: z.string().min(3, { message: 'Username must be at least 3 characters.'}),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.'}),
  document: fileSchema,
});

type MembershipState = {
    message: string;
    success: boolean;
    tempUsername?: string;
    tempPassword?: string;
}

// Helper to convert file to data URI
async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}


export async function createMembershipAction(
  prevState: MembershipState,
  formData: FormData
): Promise<MembershipState> {
  const rawFormData = {
    name: formData.get('name'),
    phoneNumber: formData.get('phoneNumber'),
    username: formData.get('username'),
    password: formData.get('password'),
    document: formData.get('document'),
  };

  const validation = membershipSchema.safeParse(rawFormData);

  if (!validation.success) {
    const error = validation.error.errors[0];
    const message = `${error.path.join('.')}: ${error.message}`;
    return { message, success: false };
  }

  const { name, phoneNumber, username, password, document } = validation.data;

  try {
    const documentDataUri = await fileToDataUri(document);

    const result = await membershipSignup({
      name,
      phoneNumber,
      username,
      password,
      documentDataUri,
    });

    if (result.success) {
      // Generate temporary credentials
      const tempUsername = `temp-${Math.random().toString(36).substring(2, 8)}`;
      const tempPassword = Math.random().toString(36).substring(2, 10);

      return {
        message: 'Signup successful! Your membership is pending approval.',
        success: true,
        tempUsername,
        tempPassword,
      }
    } else {
      return { message: result.message || 'Failed to create membership.', success: false };
    }
  } catch (error) {
    console.error('Membership signup failed:', error);
    return { message: 'An unexpected error occurred during membership signup.', success: false };
  }
}

type UploadVoucherState = {
  message: string;
  success: boolean;
  count?: number;
}

export async function uploadVouchersAction(
    prevState: UploadVoucherState,
    formData: FormData
): Promise<UploadVoucherState> {
    const file = formData.get('csvFile') as File | null;
    const packageSlug = formData.get('packageSlug') as string | null;

    if (!file || file.size === 0) {
        return { message: 'Please upload a valid CSV file.', success: false };
    }
    if (!packageSlug) {
        return { message: 'Package not specified.', success: false };
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        return { message: 'Invalid file type. Please upload a CSV file.', success: false };
    }

    const csvData = await file.text();
    const rows = csvData.split(/\r\n|\n/).filter(row => row.trim() !== '');
    
    if (rows.length === 0) {
        return { message: 'CSV file is empty.', success: false };
    }

    const header = rows.shift()!.split(',').map(h => h.trim().toLowerCase());
    
    // Support both 'vouchercode' and 'username' for Mikhmon exports
    const voucherCodeIndex = header.indexOf('vouchercode');
    const usernameIndex = header.indexOf('username');
    const codeIndex = voucherCodeIndex !== -1 ? voucherCodeIndex : usernameIndex;


    if (codeIndex === -1) {
        return { message: 'CSV must have a "voucherCode" or "username" column.', success: false };
    }
    
    const voucherCodes = rows.map(row => row.split(',')[codeIndex]?.trim()).filter(Boolean);
    const voucherCount = voucherCodes.length;
    
    if (voucherCount === 0) {
        return { message: 'No voucher codes found in the file.', success: false };
    }

    try {
        const vouchersRef = ref(db, `vouchers/${packageSlug}`);
        const newVouchers: { [key: string]: { code: string; createdAt: string; usedAt: null } } = {};
        
        voucherCodes.forEach(code => {
            const newVoucherRef = push(vouchersRef); // This just generates a key locally
            if(newVoucherRef.key) {
                newVouchers[newVoucherRef.key] = {
                    code: code,
                    createdAt: new Date().toISOString(),
                    usedAt: null // Explicitly set to null
                };
            }
        });
        
        await update(vouchersRef, newVouchers);

        revalidatePath(`/admin/vouchers/${packageSlug}`);
        revalidatePath(`/admin`);

        return {
            message: `${voucherCount} vouchers have been successfully uploaded and linked to the "${packageSlug}" package.`,
            success: true,
            count: voucherCount,
        }
    } catch (error) {
        console.error("Failed to upload vouchers to Realtime DB", error);
        return { message: 'Failed to save vouchers to the database.', success: false };
    }
}

type CreatePackageState = {
    message: string;
    success: boolean;
}

// Helper to generate a slug from a string
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};


export async function createPackageAction(prevState: CreatePackageState, formData: FormData): Promise<CreatePackageState> {
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;
    const details = formData.get('details') as string;
    const durationHours = formData.get('durationHours') as string;


    if (!name || !price || !description || !details || !durationHours) {
        return { message: 'All fields are required.', success: false };
    }
    
    const slug = generateSlug(name);
    
    // Split by newlines or commas, then trim whitespace and filter out empty strings.
    const detailsList = details.split(/[\n,]/).map(d => d.trim()).filter(d => d);


    const newPackage: Omit<Package, 'slug' | 'imageId'> = {
        name,
        price: parseInt(price, 10),
        description,
        details: detailsList,
        durationHours: parseInt(durationHours, 10),
    };
    
    // In a real app, you would probably want to assign a meaningful imageId
    const newPackageWithImage: Omit<Package, 'slug'> = {
        ...newPackage,
        imageId: 'gold-package' // Default image for new packages
    };

    try {
        const packageRef = ref(db, 'packages/' + slug);
        await set(packageRef, newPackageWithImage);
        revalidatePath('/admin');
        return { message: 'Package created successfully!', success: true };
    } catch (error) {
        console.error("Failed to write to Realtime DB", error);
        return { message: 'Failed to save the new package.', success: false };
    }
}

type CrudVoucherState = {
    message: string;
    success: boolean;
}

export async function addVoucherAction(prevState: CrudVoucherState, formData: FormData): Promise<CrudVoucherState> {
    const packageSlug = formData.get('packageSlug') as string;
    const voucherCode = formData.get('voucherCode') as string;

    if (!packageSlug || !voucherCode) {
        return { message: 'Package or voucher code is missing.', success: false };
    }

    try {
        const vouchersRef = ref(db, `vouchers/${packageSlug}`);
        const newVoucherRef = push(vouchersRef);
        await set(newVoucherRef, {
            code: voucherCode,
            createdAt: new Date().toISOString(),
            usedAt: null
        });

        revalidatePath(`/admin/vouchers/${packageSlug}`);
        revalidatePath('/admin');
        return { message: 'Voucher added successfully.', success: true };
    } catch(e) {
        console.error("Failed to add voucher", e);
        return { message: 'Failed to add voucher.', success: false };
    }
}

export async function updateVoucherAction(prevState: CrudVoucherState, formData: FormData): Promise<CrudVoucherState> {
    const packageSlug = formData.get('packageSlug') as string;
    const voucherId = formData.get('voucherId') as string;
    const voucherCode = formData.get('voucherCode') as string;
    const usedAt = formData.get('usedAt') as string; // Will be a date string or empty

     if (!packageSlug || !voucherId || !voucherCode) {
        return { message: 'Missing required fields.', success: false };
    }
    
    try {
        const voucherRef = ref(db, `vouchers/${packageSlug}/${voucherId}`);
        const snapshot = await get(voucherRef);
        if(!snapshot.exists()) {
            return { message: 'Voucher not found.', success: false };
        }

        const updates: Partial<Pick<Voucher, 'code'>> & { usedAt: string | null } = {
            code: voucherCode,
            // If usedAt is an empty string, set it to null to remove from DB.
            usedAt: usedAt || null, 
        };

        await update(voucherRef, updates);

        revalidatePath(`/admin/vouchers/${packageSlug}`);
        return { message: 'Voucher updated successfully.', success: true };

    } catch(e) {
        console.error("Failed to update voucher", e);
        return { message: 'Failed to update voucher.', success: false };
    }
}

export async function deleteVoucherAction(prevState: CrudVoucherState, formData: FormData): Promise<CrudVoucherState> {
     const packageSlug = formData.get('packageSlug') as string;
    const voucherId = formData.get('voucherId') as string;

    if (!packageSlug || !voucherId) {
        return { message: 'Package or voucher ID is missing.', success: false };
    }

    try {
        const voucherRef = ref(db, `vouchers/${packageSlug}/${voucherId}`);
        await remove(voucherRef);

        revalidatePath(`/admin/vouchers/${packageSlug}`);
        revalidatePath('/admin');
        return { message: 'Voucher deleted successfully.', success: true };

    } catch (e) {
        console.error("Failed to delete voucher", e);
        return { message: 'Failed to delete voucher.', success: false };
    }
}


export async function deletePackageAction(formData: FormData): Promise<void> {
    const packageSlug = formData.get('packageSlug') as string;

    if (!packageSlug) {
        console.error("Delete failed: Package slug is missing.");
        return;
    }

    try {
        // Delete the package itself
        const packageRef = ref(db, `packages/${packageSlug}`);
        await remove(packageRef);

        // Delete all associated vouchers
        const vouchersRef = ref(db, `vouchers/${packageSlug}`);
        await remove(vouchersRef);

    } catch (e) {
        console.error("Failed to delete package", e);
        // We can't return a message to the client directly in this pattern,
        // but revalidation will fail and the UI won't update, indicating an error.
    }

    revalidatePath('/admin');
}


type LoginState = {
    message: string;
    success: boolean;
    credentials?: {
        username: string;
        password?: string;
    }
};

export async function findMembershipAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const identifier = formData.get('identifier') as string;
    
    if (!identifier) {
        return { message: 'Username or phone number is required.', success: false };
    }

    try {
        const membershipsRef = ref(db, 'memberships');
        const snapshot = await get(membershipsRef);

        if (snapshot.exists()) {
            const allMemberships = snapshot.val();
            const foundEntry = Object.values(allMemberships).find(
                (member: any) => member.username === identifier || member.phoneNumber === identifier
            );

            if (foundEntry) {
                 const membershipData = foundEntry as any;
                 return {
                    message: 'Membership found.',
                    success: true,
                    credentials: {
                        username: membershipData.username,
                        password: membershipData.password,
                    }
                }
            }
        }
        
        return { message: 'No membership found with that username or phone number.', success: false };

    } catch(e) {
        console.error("Failed to query membership", e);
        return { message: 'An error occurred while searching for your membership.', success: false };
    }
}
    
type MembershipStatusState = {
  message: string;
  success: boolean;
};

export async function approveMembershipAction(
  membershipId: string
): Promise<MembershipStatusState> {
  if (!membershipId) {
    return { message: "Membership ID is missing.", success: false };
  }
  try {
    const membershipRef = ref(db, `memberships/${membershipId}`);
    await update(membershipRef, { status: 'approved' });
    revalidatePath('/admin/members');
    return { message: "Membership approved.", success: true };
  } catch (error) {
    console.error("Failed to approve membership", error);
    return { message: "Failed to approve membership.", success: false };
  }
}

export async function rejectMembershipAction(
  membershipId: string
): Promise<MembershipStatusState> {
  if (!membershipId) {
    return { message: "Membership ID is missing.", success: false };
  }
  try {
    const membershipRef = ref(db, `memberships/${membershipId}`);
    await update(membershipRef, { status: 'rejected' });
    revalidatePath('/admin/members');
    return { message: "Membership rejected.", success: true };
  } catch (error) {
    console.error("Failed to reject membership", error);
    return { message: "Failed to reject membership.", success: false };
  }
}

// Admin Login
type AdminLoginState = {
  message: string;
  success: boolean;
};

const ADMIN_PASSWORD = "Albertine";

export async function login(
  prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = formData.get('password');

  if (password === ADMIN_PASSWORD) {
    const cookieStore = cookies();
    cookieStore.set('luco-admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    redirect('/admin');
  }

  return { message: 'Invalid password. Please try again.', success: false };
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete('luco-admin-auth');
  redirect('/admin/login');
}


type PromotionActionState = {
  message: string;
  success: boolean;
}

export async function addPromotionAction(prevState: PromotionActionState, formData: FormData): Promise<PromotionActionState> {
    const code = formData.get('code') as string;
    const packageSlug = formData.get('packageSlug') as string;

    if (!code || !packageSlug) {
        return { message: 'Voucher code and package are required.', success: false };
    }
     if (packageSlug === 'monthly-membership') {
        return { message: 'Cannot create promotions for monthly memberships.', success: false };
    }

    try {
        const promotionsRef = ref(db, 'promotions');
        const newPromotionRef = push(promotionsRef);
        await set(newPromotionRef, {
            code,
            packageSlug,
            createdAt: new Date().toISOString(),
        });
        
        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { message: 'Promotion added successfully!', success: true };

    } catch (e) {
        console.error("Failed to add promotion", e);
        return { message: 'Failed to add promotion.', success: false };
    }
}

export async function deletePromotionAction(formData: FormData): Promise<PromotionActionState> {
    const promotionId = formData.get('promotionId') as string;

    if (!promotionId) {
        return { message: 'Promotion ID is missing.', success: false };
    }

    try {
        const promotionRef = ref(db, `promotions/${promotionId}`);
        await remove(promotionRef);

        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { message: 'Promotion deleted successfully.', success: true };
    } catch(e) {
        console.error("Failed to delete promotion", e);
        return { message: 'Failed to delete promotion.', success: false };
    }
}

export async function exportUserPhonesAction(): Promise<{ data: string, success: boolean, message: string }> {
    try {
        const allVouchers = await getAllVouchersWithPackageInfo();
        const memberships = await getMemberships();
        
        const voucherPhones = allVouchers
            .map(v => v.purchasedBy)
            .filter((p): p is string => !!p);
        
        const memberPhones = memberships.map(m => m.phoneNumber);

        const allPhones = [...new Set([...voucherPhones, ...memberPhones])];
        
        if (allPhones.length === 0) {
            return { data: '', success: false, message: 'No phone numbers found to export.' };
        }

        const csvHeader = 'phoneNumber\n';
        const csvRows = allPhones.join('\n');
        const csvContent = csvHeader + csvRows;

        return { data: csvContent, success: true, message: `${allPhones.length} phone numbers prepared for download.` };

    } catch(e) {
        console.error("Failed to export phone numbers", e);
        return { data: '', success: false, message: 'An unexpected error occurred during export.' };
    }
}

type ResendState = {
  message: string;
  success: boolean;
};

const resendSchema = z.object({
  phoneNumber: phoneSchema,
  voucherCode: z.string().min(1, 'Voucher code cannot be empty.'),
});

export async function resendVoucherAction(
  input: z.infer<typeof resendSchema>
): Promise<ResendState> {
  const validation = resendSchema.safeParse(input);

  if (!validation.success) {
    return { message: validation.error.errors[0].message, success: false };
  }
  
  const { phoneNumber, voucherCode } = validation.data;

  try {
    const result = await sendWhatsappVoucher({ phoneNumber, voucherCode });
    if (result.success) {
      return { message: `Voucher resent successfully to ${phoneNumber}.`, success: true };
    } else {
      return { message: result.message || 'An unknown error occurred while resending.', success: false };
    }
  } catch (error) {
    console.error("Resend voucher failed:", error);
    return { message: 'An unexpected server error occurred.', success: false };
  }
}

type BulkMessageState = {
    message: string;
    success: boolean;
    sentCount: number;
}

export async function sendBulkMessageAction(prevState: BulkMessageState, formData: FormData): Promise<BulkMessageState> {
    const message = formData.get('message') as string;
    if (!message) {
        return { message: 'Message content cannot be empty.', success: false, sentCount: 0 };
    }

    try {
        const result = await sendBulkMessage({ message });
        return {
            message: result.message,
            success: result.success,
            sentCount: result.sentCount,
        };
    } catch (e) {
        console.error('Failed to send bulk message:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown server error occurred.';
        return { message: errorMessage, success: false, sentCount: 0 };
    }
}

type GenerateMessageState = {
    message: string;
    success: boolean;
}

export async function generateAIMessageAction(messageType: string): Promise<GenerateMessageState> {
    if (!messageType) {
        return { message: 'Message type is required to generate content.', success: false };
    }
    try {
        const generatedMessage = await generateMessage({ messageType });
        if (generatedMessage) {
            return { message: generatedMessage, success: true };
        } else {
            return { message: 'AI failed to generate a message.', success: false };
        }
    } catch(e) {
        console.error("AI message generation failed:", e);
        return { message: 'An unexpected error occurred during AI generation.', success: false };
    }
}

    