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
    buyLink: z.string().url().describe('A valid, working URL to a purchase or search results page for this product on a major Indian online retailer. The link must not be broken.'),
    imageUrl: z.string().url().describe("The direct URL of the product's thumbnail image from the e-commerce page. If a real image URL cannot be found, return an empty string.").optional(),
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
  model: 'googleai/gemini-1.5-pro',
  prompt: `You are an expert in plant pathology. A farmer will provide a photo of a plant and you must diagnose the plant issue, pest or disease. Then, suggest both organic and inorganic (chemical) remedies.

For each remedy type (organic and inorganic), provide a list of up to 4 commercially available products that can be used. For each product, you must provide:
1. The product name (e.g., "Neem Oil Concentrate").
2. A valid, working URL. To get this, search for the product on a major Indian online retailer and provide the URL of the **first search result**. This can be a product page or a search results page. **The most important rule is that the link MUST work and not lead to a "not found" page.**
3. The direct URL for the product's thumbnail image from the purchase or search page. This must be a full, valid image URL. If you absolutely cannot find a real image URL, you must return an empty string for the imageUrl.
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
