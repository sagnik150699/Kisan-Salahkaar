'use server';
/**
 * @fileOverview Crop recommendation AI agent.
 *
 * - generateCropRecommendations - A function that handles the crop recommendation process.
 * - GenerateCropRecommendationsInput - The input type for the generateCropRecommendations function.
 * - GenerateCropRecommendationsOutput - The return type for the generateCropRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropRecommendationsInputSchema = z.object({
  location: z.string().describe('The location of the farm.'),
  soilType: z.string().describe('The type of soil on the farm.'),
  weatherPatterns: z.string().describe('The typical weather patterns for the location.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi").'),
});
export type GenerateCropRecommendationsInput = z.infer<typeof GenerateCropRecommendationsInputSchema>;

const GenerateCropRecommendationsOutputSchema = z.object({
  cropRecommendations: z.string().describe('The recommended crops for the given location, soil type, and weather patterns.'),
});
export type GenerateCropRecommendationsOutput = z.infer<typeof GenerateCropRecommendationsOutputSchema>;

export async function generateCropRecommendations(input: GenerateCropRecommendationsInput): Promise<GenerateCropRecommendationsOutput> {
  return generateCropRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCropRecommendationsPrompt',
  input: {schema: GenerateCropRecommendationsInputSchema},
  output: {schema: GenerateCropRecommendationsOutputSchema},
  model: 'googleai/gemini-1.5-pro',
  prompt: `You are an expert agricultural advisor. Based on the provided location, soil type, and weather patterns, recommend the best crops to plant.

Respond in the following language: {{{language}}}

Location: {{{location}}}
Soil Type: {{{soilType}}}
Weather Patterns: {{{weatherPatterns}}}

Give a short paragraph describing why you are recommending these crops.`,
});

const generateCropRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateCropRecommendationsFlow',
    inputSchema: GenerateCropRecommendationsInputSchema,
    outputSchema: GenerateCropRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
