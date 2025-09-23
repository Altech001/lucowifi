
'use server';

/**
 * @fileOverview A flow to handle new user membership signups.
 *
 * - membershipSignup - A function that handles the signup process.
 * - MembershipSignupInput - The input type for the membershipSignup function.
 * - MembershipSignupOutput - The return type for the membershipSignup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

const MembershipSignupInputSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  phoneNumber: z
    .string()
    .describe('The user\'s WhatsApp phone number, including the country code.'),
  username: z.string().describe('The desired username for the membership.'),
  password: z.string().describe('The desired password for the membership account.'),
  documentDataUri: z.string().describe('A data URI of the user\'s identification document.'),
});
export type MembershipSignupInput = z.infer<typeof MembershipSignupInputSchema>;

const MembershipSignupOutputSchema = z.object({
  success: z.boolean().describe('Whether the membership was successfully created and message sent.'),
  message: z.string().describe('A confirmation or error message.'),
});
export type MembershipSignupOutput = z.infer<typeof MembershipSignupOutputSchema>;

export async function membershipSignup(input: MembershipSignupInput): Promise<MembershipSignupOutput> {
  return membershipSignupFlow(input);
}

const sendWelcomeMessage = ai.defineTool(
  {
    name: 'sendWelcomeMessage',
    description: 'Sends a welcome message to a new member\'s WhatsApp number.',
    inputSchema: z.object({
      phoneNumber: z.string().describe('The WhatsApp number to send the message to.'),
      name: z.string().describe('The name of the new member.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ phoneNumber, name }) => {
    // In a real app, this would call a service like Twilio or Vonage
    console.log(`Sending welcome message to ${name} at ${phoneNumber}`);
    return {
      success: true,
      message: `Welcome message sent to ${phoneNumber}`,
    };
  }
);

const analyzeDocument = ai.defineTool(
    {
        name: 'analyzeDocument',
        description: 'Analyzes the uploaded document to verify the user\'s identity.',
        inputSchema: z.object({
            documentDataUri: z.string().describe("A data URI of the user's identification document."),
        }),
        outputSchema: z.object({
            isValid: z.boolean(),
            reason: z.string(),
        }),
    },
    async ({ documentDataUri }) => {
        // In a real app, this would use a document verification service or a more complex AI model.
        console.log('Analyzing document...');
        if (documentDataUri.length < 100) { // Simple check for placeholder
             return {
                isValid: false,
                reason: 'Document appears to be invalid or empty.',
            };
        }
        return {
            isValid: true,
            reason: 'Document appears to be valid.',
        };
    }
);

const saveMembershipApplication = ai.defineTool(
    {
        name: 'saveMembershipApplication',
        description: 'Saves a new membership application to the database.',
        inputSchema: MembershipSignupInputSchema,
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            applicationId: z.string().optional(),
        }),
    },
    async (application) => {
        try {
            const membershipsRef = ref(db, 'memberships');
            const newMembershipRef = push(membershipsRef);
            
            await set(newMembershipRef, {
                ...application,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });

            return {
                success: true,
                message: 'Application saved successfully.',
                applicationId: newMembershipRef.key!,
            };
        } catch (error) {
            console.error('Failed to save membership application:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown database error occurred.';
            return {
                success: false,
                message: `Failed to save application: ${errorMessage}`,
            };
        }
    }
);


const membershipSignupFlow = ai.defineFlow(
  {
    name: 'membershipSignupFlow',
    inputSchema: MembershipSignupInputSchema,
    outputSchema: MembershipSignupOutputSchema,
    tools: [sendWelcomeMessage, analyzeDocument, saveMembershipApplication],
  },
  async (input) => {

    const docAnalysis = await analyzeDocument({ documentDataUri: input.documentDataUri });
    if (!docAnalysis.isValid) {
        return {
            success: false,
            message: `Document verification failed: ${docAnalysis.reason}`,
        }
    }

    const saveResult = await saveMembershipApplication(input);
    if (!saveResult.success) {
        return {
            success: false,
            message: saveResult.message,
        }
    }
    
    // Call the tool to send a welcome message.
    const welcomeResult = await sendWelcomeMessage({
      phoneNumber: input.phoneNumber,
      name: input.name,
    });

    if (welcomeResult.success) {
      return {
        success: true,
        message: 'Membership pending approval. Welcome message sent.',
      };
    } else {
        // Even if welcome message fails, the application was saved.
        return {
            success: true, // The core task (saving) was successful
            message: 'Membership application saved, but failed to send welcome message.',
        }
    }
  }
);
