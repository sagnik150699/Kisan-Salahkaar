'use server';
/**
 * @fileOverview An AI agent that extracts crop recommendation details from a natural language query.
 *
 * - extractCropDetailsFromQuery - A function that extracts location, soil type, and weather patterns.
 * - ExtractCropDetailsFromQueryInput - The input type for the function.
 * - ExtractCropDetailsFromQueryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCropDetailsFromQueryInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
});
export type ExtractCropDetailsFromQueryInput = z.infer<typeof ExtractCropDetailsFromQueryInputSchema>;

const ExtractCropDetailsFromQueryOutputSchema = z.object({
  location: z.string().describe('The city and district of the location. e.g. Mysore, Karnataka'),
  soilType: z.enum(['Alluvial', 'Black', 'Red and Yellow', 'Laterite', 'Arid']).describe('The type of soil on the farm.'),
  weatherPatterns: z
    .enum([
      'Tropical Monsoon',
      'Hot and Dry',
      'Mild Winter',
      'Semi-Arid',
      'Tropical Wet and Dry',
      'Humid Subtropical',
      'Mountain',
    ])
    .describe('The typical weather patterns for the location.'),
});
export type ExtractCropDetailsFromQueryOutput = z.infer<typeof ExtractCropDetailsFromQueryOutputSchema>;


export async function extractCropDetailsFromQuery(input: ExtractCropDetailsFromQueryInput): Promise<ExtractCropDetailsFromQueryOutput> {
    return extractCropDetailsFromQueryFlow(input);
}


const prompt = ai.definePrompt({
    name: 'extractCropDetailsPrompt',
    input: {schema: ExtractCropDetailsFromQueryInputSchema},
    output: {schema: ExtractCropDetailsFromQueryOutputSchema},
    prompt: `You are a helpful assistant. Given a user's query, extract the location, soil type, and weather pattern.

Query: {{{query}}}

The soil type must be one of: 'Alluvial', 'Black', 'Red and Yellow', 'Laterite', 'Arid'.
The weather pattern must be one of: 'Tropical Monsoon', 'Hot and Dry', 'Mild Winter', 'Semi-Arid', 'Tropical Wet and Dry', 'Humid Subtropical', 'Mountain'.`,
});


const extractCropDetailsFromQueryFlow = ai.defineFlow(
    {
        name: 'extractCropDetailsFromQueryFlow',
        inputSchema: ExtractCropDetailsFromQueryInputSchema,
        outputSchema: ExtractCropDetailsFromQueryOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
