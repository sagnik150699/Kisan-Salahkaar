'use server';
/**
 * @fileOverview An AI agent that identifies pests and diseases in plants from images.
 *
 * - identifyPestOrDisease - A function that handles the plant pest and disease identification process.
 * - IdentifyPestOrDiseaseInput - The input type for the identifyPestOrDisease function.
 * - IdentifyPestOrDiseaseOutput - The return type for the identifyPestOrDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPestOrDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPestOrDiseaseInput = z.infer<typeof IdentifyPestOrDiseaseInputSchema>;

const IdentifyPestOrDiseaseOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the plant issue, pest or disease.'),
  organicRemedies: z.string().describe('Suggested organic remedies for the identified issue.'),
  inorganicRemedies: z.string().describe('Suggested inorganic or chemical remedies for the identified issue.'),
});
export type IdentifyPestOrDiseaseOutput = z.infer<typeof IdentifyPestOrDiseaseOutputSchema>;

export async function identifyPestOrDisease(input: IdentifyPestOrDiseaseInput): Promise<IdentifyPestOrDiseaseOutput> {
  return identifyPestOrDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPestOrDiseasePrompt',
  input: {schema: IdentifyPestOrDiseaseInputSchema},
  output: {schema: IdentifyPestOrDiseaseOutputSchema},
  model: 'googleai/gemini-1.5-pro',
  prompt: `You are an expert in plant pathology. A farmer will provide a photo of a plant and you must diagnose the plant issue, pest or disease. Then, suggest both organic and inorganic (chemical) remedies.

Photo: {{media url=photoDataUri}}
`,
});

const identifyPestOrDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyPestOrDiseaseFlow',
    inputSchema: IdentifyPestOrDiseaseInputSchema,
    outputSchema: IdentifyPestOrDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
