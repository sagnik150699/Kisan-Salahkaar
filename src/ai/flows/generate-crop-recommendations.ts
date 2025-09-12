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
import type {GenerateOptions} from 'genkit';

const GenerateCropRecommendationsInputSchema = z.object({
  location: z.string().describe('The location of the farm.'),
  soilType: z.string().describe('The type of soil on the farm.'),
  weatherPatterns: z.string().describe('The typical weather patterns for the location.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi").'),
});
export type GenerateCropRecommendationsInput = z.infer<typeof GenerateCropRecommendationsInputSchema>;

const CropRecommendationSchema = z.object({
    crop: z.string().describe('The name of the recommended crop.'),
    reason: z.string().describe('A brief reason why this crop is recommended.'),
});

const GenerateCropRecommendationsOutputSchema = z.object({
  cropRecommendations: z.array(CropRecommendationSchema).describe('A list of recommended crops.'),
  introduction: z.string().describe('A short introductory paragraph describing why these crops are being recommended.'),
  disclaimer: z.string().describe('A friendly disclaimer stating that these are AI-generated suggestions and local experts should be consulted for critical decisions.'),
});
export type GenerateCropRecommendationsOutput = z.infer<typeof GenerateCropRecommendationsOutputSchema>;

const GenerateCropRecommendationsFlowOutputSchema = z.object({
    cropRecommendations: z.string().describe('The formatted string of recommended crops for the given location, soil type, and weather patterns.'),
});

export async function generateCropRecommendations(input: GenerateCropRecommendationsInput): Promise<{ cropRecommendations: string }> {
  return generateCropRecommendationsFlow(input);
}

const promptText = `You are an expert agricultural advisor. Your role is to assist with farming-related questions. If you receive irrelevant or non-agricultural input, provide a helpful message about your purpose.

Based on the provided location, soil type, and weather patterns, recommend the 3 best crops to plant.

For each crop, provide a brief reason for the recommendation. Also provide a short introductory paragraph explaining the overall recommendation.

Finally, include a friendly disclaimer. The disclaimer should state that these are AI-generated suggestions and that for critical decisions, consulting a local agricultural expert is recommended.

IMPORTANT: You must respond entirely in the following language: {{{language}}}

Location: {{{location}}}
Soil Type: {{{soilType}}}
Weather Patterns: {{{weatherPatterns}}}`;


const generateCropRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateCropRecommendationsFlow',
    inputSchema: GenerateCropRecommendationsInputSchema,
    outputSchema: GenerateCropRecommendationsFlowOutputSchema,
    cache: {
        duration: 3600, // 1 hour
    },
    rateLimit: {
      key: 'user',
      queries: 10,
      per: 'minute',
    },
  },
  async input => {
    
    const sharedConfig: GenerateOptions = {
      output: { schema: GenerateCropRecommendationsOutputSchema },
      prompt: {
        text: promptText,
        input,
      },
    };
    
    let response;
    try {
        response = await ai.generate({
            model: 'googleai/gemini-2.5-pro',
            ...sharedConfig,
        });
    } catch(e) {
        console.error("Gemini 2.5 Pro failed for generateCropRecommendations, falling back to Flash", e);
        response = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            ...sharedConfig,
        })
    }

    const output = response.output;
    if (!output) {
      throw new Error('No output from prompt');
    }
    
    const formattedRecommendations = `${output.introduction}\n\n${output.cropRecommendations.map(rec => `**${rec.crop}:** ${rec.reason}`).join('\n\n')}\n\n*${output.disclaimer}*`;
    
    return {
        cropRecommendations: formattedRecommendations,
    };
  }
);
