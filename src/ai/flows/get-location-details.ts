'use server';
/**
 * @fileOverview An AI agent that gets location and weather details from latitude and longitude.
 *
 * - getLocationDetails - A function that handles getting location and weather details.
 * - GetLocationDetailsInput - The input type for the getLocationDetails function.
 * - GetLocationDetailsOutput - The return type for the getLocationDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLocationDetailsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type GetLocationDetailsInput = z.infer<typeof GetLocationDetailsInputSchema>;

const GetLocationDetailsOutputSchema = z.object({
  location: z.string().describe('The city and district of the location. e.g. Mysore, Karnataka'),
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
export type GetLocationDetailsOutput = z.infer<typeof GetLocationDetailsOutputSchema>;

export async function getLocationDetails(input: GetLocationDetailsInput): Promise<GetLocationDetailsOutput> {
  return getLocationDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLocationDetailsPrompt',
  input: {schema: GetLocationDetailsInputSchema},
  output: {schema: GetLocationDetailsOutputSchema},
  prompt: `You are a helpful assistant. Given the latitude and longitude, determine the city/district and the general weather pattern for that location.

Latitude: {{{latitude}}}
Longitude: {{{longitude}}}

The weather pattern must be one of the following: 'Tropical Monsoon', 'Hot and Dry', 'Mild Winter', 'Semi-Arid', 'Tropical Wet and Dry', 'Humid Subtropical', 'Mountain'.`,
});

const getLocationDetailsFlow = ai.defineFlow(
  {
    name: 'getLocationDetailsFlow',
    inputSchema: GetLocationDetailsInputSchema,
    outputSchema: GetLocationDetailsOutputSchema,
    cache: {
      duration: 3600, // 1 hour
    },
    rateLimit: {
        key: 'user',
        queries: 20,
        per: 'minute',
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
