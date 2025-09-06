'use server';
/**
 * @fileOverview An AI agent that gets market prices for crops in a given location.
 *
 * - getMarketPrices - A function that handles getting market prices.
 * - GetMarketPricesInput - The input type for the getMarketPrices function.
 * - GetMarketPricesOutput - The return type for the getMarketPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMarketPricesInputSchema = z.object({
  location: z.string().describe('The location to get market prices for.'),
});
export type GetMarketPricesInput = z.infer<typeof GetMarketPricesInputSchema>;

const MarketPriceSchema = z.object({
    crop: z.string().describe('The name of the crop.'),
    market: z.string().describe('The name of the nearby market.'),
    price: z.string().describe('The current price of the crop (e.g., "₹25/kg", "₹2,125/qtl").'),
});

const GetMarketPricesOutputSchema = z.object({
  prices: z.array(MarketPriceSchema),
});
export type GetMarketPricesOutput = z.infer<typeof GetMarketPricesOutputSchema>;


export async function getMarketPrices(input: GetMarketPricesInput): Promise<GetMarketPricesOutput> {
  return getMarketPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMarketPricesPrompt',
  input: {schema: GetMarketPricesInputSchema},
  output: {schema: GetMarketPricesOutputSchema},
  prompt: `You are a helpful assistant that provides current market prices for crops. Given a location, provide a list of 5 common crops with their prices at a nearby major market. Ensure the currency is in Indian Rupees, using the '₹' symbol.

Location: {{{location}}}

Example response for Bangalore:
{
  "prices": [
    { "crop": "Tomato", "market": "Bangalore (K.R. Market)", "price": "₹28/kg" },
    { "crop": "Onion", "market": "Bangalore (Yeshwanthpur)", "price": "₹22/kg" },
    { "crop": "Potato", "market": "Bangalore (K.R. Market)", "price": "₹20/kg" },
    { "crop": "Carrot", "market": "Bangalore (Yeshwanthpur)", "price": "₹45/kg" },
    { "crop": "Ragi", "market": "Bangalore (APMC)", "price": "₹3,200/qtl" }
  ]
}`,
});

const getMarketPricesFlow = ai.defineFlow(
  {
    name: 'getMarketPricesFlow',
    inputSchema: GetMarketPricesInputSchema,
    outputSchema: GetMarketPricesOutputSchema,
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
    const {output} = await prompt(input);
    return output!;
  }
);
