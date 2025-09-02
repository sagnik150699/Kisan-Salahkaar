
'use server';
/**
 * @fileOverview An AI agent that guesses the soil type for a given location.
 *
 * - guessSoilType - A function that handles guessing the soil type.
 * - GuessSoilTypeInput - The input type for the guessSoilType function.
 * - GuessSoilTypeOutput - The return type for the guessSoilType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuessSoilTypeInputSchema = z.object({
  location: z.string().describe('The location to guess the soil type for.'),
});
export type GuessSoilTypeInput = z.infer<typeof GuessSoilTypeInputSchema>;

const SOIL_TYPES = ["Alluvial", "Black", "Red and Yellow", "Laterite", "Arid"] as const;

const GuessSoilTypeOutputSchema = z.object({
  soilType: z.enum(SOIL_TYPES).describe('The guessed soil type for the location.'),
});
export type GuessSoilTypeOutput = z.infer<typeof GuessSoilTypeOutputSchema>;


export async function guessSoilType(input: GuessSoilTypeInput): Promise<GuessSoilTypeOutput> {
  return guessSoilTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'guessSoilTypePrompt',
  input: {schema: GuessSoilTypeInputSchema},
  output: {schema: GuessSoilTypeOutputSchema},
  prompt: `You are an expert in Indian soil types. Given a location in India, guess the predominant soil type. If you are uncertain, make the best guess you can based on the available information.

The soil type must be one of the following: ${SOIL_TYPES.join(', ')}.

Location: {{{location}}}
`,
});

const guessSoilTypeFlow = ai.defineFlow(
  {
    name: 'guessSoilTypeFlow',
    inputSchema: GuessSoilTypeInputSchema,
    outputSchema: GuessSoilTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
