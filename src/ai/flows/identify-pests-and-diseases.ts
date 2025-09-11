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

const ProductSuggestionSchema = z.object({
    name: z.string().describe('The name of the product.'),
    buyLink: z.string().url().describe('The direct URL to purchase this product from a reputable Indian e-commerce site, prioritizing the link with the lowest price found.'),
    imageUrl: z.string().url().describe('The direct URL of the product\'s thumbnail image from the e-commerce page. If a real image URL cannot be found, use a placeholder from `https://picsum.photos/seed/{a random number}/200/200` as a fallback.'),
    dataAiHint: z.string().describe('One or two keywords for the product image, e.g., "neem oil".'),
});

const IdentifyPestOrDiseaseOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the plant issue, pest or disease. If the image is not a plant or is unclear, state that you can only analyze clear images of plants.'),
  organicRemedies: z.string().describe('Suggested organic remedies for the identified issue. If no plant is detected, state that remedies cannot be provided.'),
  inorganicRemedies: z.string().describe('Suggested inorganic or chemical remedies for the identified issue. If no plant is detected, state that remedies cannot be provided.'),
  suggestedOrganicProducts: z.array(ProductSuggestionSchema).describe('A list of up to 4 suggested organic products to buy for the remedies.'),
  suggestedInorganicProducts: z.array(ProductSuggestionSchema).describe('A list of up to 4 suggested inorganic products to buy for the remedies.'),
  disclaimer: z.string().describe('A friendly disclaimer stating that this is an AI-generated diagnosis and a local expert should be consulted for confirmation.'),
});
export type IdentifyPestOrDiseaseOutput = z.infer<typeof IdentifyPestOrDiseaseOutputSchema>;

export async function identifyPestOrDisease(input: IdentifyPestOrDiseaseInput): Promise<IdentifyPestOrDiseaseOutput> {
  return identifyPestOrDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPestOrDiseasePrompt',
  input: {schema: IdentifyPestOrDiseaseInputSchema},
  output: {schema: IdentifyPestOrDiseaseOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert in plant pathology. A farmer will provide a photo of a plant and you must diagnose the plant issue, pest or disease. Then, suggest both organic and inorganic (chemical) remedies.

For each remedy type (organic and inorganic), provide a list of up to 4 commercially available products that can be used. For each product, provide:
1. The product name (e.g., "Neem Oil Concentrate").
2. The direct purchase URL from a reputable Indian e-commerce site (like BigHaat, IFFCO BAZAR, Amazon.in, or Flipkart). You should try to find the link with the best price.
3. The direct URL for the product's thumbnail image from the purchase page. If you absolutely cannot find a real image URL, use a placeholder in the format 'https://picsum.photos/seed/{a random number}/200/200' as a last resort. Use a different random number for each placeholder.
4. A 'dataAiHint' with one or two keywords for the product (e.g., "neem oil", "pesticide bottle").

Finally, include a friendly disclaimer. The disclaimer should state that this is an AI-generated diagnosis and that for confirmation, consulting a local expert is recommended.

If the image is not a plant or is unclear, state that you can only analyze clear images of plants and cannot provide a diagnosis or remedies.

Photo: {{media url=photoDataUri}}
`,
});

const identifyPestOrDiseaseFlow = ai.defineFlow(
  {
    name: 'identifyPestOrDiseaseFlow',
    inputSchema: IdentifyPestOrDiseaseInputSchema,
    outputSchema: IdentifyPestOrDiseaseOutputSchema,
    rateLimit: {
      key: 'user',
      queries: 10,
      per: 'minute',
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
