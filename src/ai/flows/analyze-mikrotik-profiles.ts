'use server';

/**
 * @fileOverview Analyzes Mikrotik profiles from a CSV file to suggest the most suitable voucher package.
 *
 * - analyzeMikrotikProfiles - A function that handles the analysis process.
 * - AnalyzeMikrotikProfilesInput - The input type for the analyzeMikrotikProfiles function.
 * - AnalyzeMikrotikProfilesOutput - The return type for the analyzeMikrotikProfiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMikrotikProfilesInputSchema = z.object({
  csvData: z
    .string()
    .describe(
      'The CSV data containing Mikrotik profile information.'
    ),
});
export type AnalyzeMikrotikProfilesInput = z.infer<
  typeof AnalyzeMikrotikProfilesInputSchema
>;

const AnalyzeMikrotikProfilesOutputSchema = z.object({
  suggestedPackage: z
    .string()
    .describe(
      'The name of the suggested voucher package based on the profile analysis.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the package suggestion, based on the profile characteristics.'
    ),
});
export type AnalyzeMikrotikProfilesOutput = z.infer<
  typeof AnalyzeMikrotikProfilesOutputSchema
>;

export async function analyzeMikrotikProfiles(
  input: AnalyzeMikrotikProfilesInput
): Promise<AnalyzeMikrotikProfilesOutput> {
  return analyzeMikrotikProfilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMikrotikProfilesPrompt',
  input: {schema: AnalyzeMikrotikProfilesInputSchema},
  output: {schema: AnalyzeMikrotikProfilesOutputSchema},
  prompt: `You are an expert in analyzing Mikrotik user profiles and recommending voucher packages.

  Based on the following CSV data of Mikrotik profiles:

  {{csvData}}

  Analyze the data and suggest the most suitable voucher package for these users. Provide a brief reasoning for your suggestion.
  Consider factors such as usage patterns, data consumption, and any other relevant information present in the profiles.
  Return the package name and the reasoning.
  `,
});

const analyzeMikrotikProfilesFlow = ai.defineFlow(
  {
    name: 'analyzeMikrotikProfilesFlow',
    inputSchema: AnalyzeMikrotikProfilesInputSchema,
    outputSchema: AnalyzeMikrotikProfilesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
