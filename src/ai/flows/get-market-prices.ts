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
  language: z.string().describe('The language for the response (e.g., "English", "Hindi").'),
});
export type GetMarketPricesInput = z.infer<typeof GetMarketPricesInputSchema>;

const MarketPriceSchema = z.object({
    crop: z.string().describe('The name of the crop.'),
    market: z.string().describe('The name of the nearby market.'),
    price: z.string().describe('The current price of the crop (e.g., "₹25/kg", "₹2,125/qtl", "₹২৫/কেজি"). The price must be formatted as a string including the currency symbol and unit, translated appropriately for the requested language.'),
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

The 'price' field in the output MUST be a string that includes the currency symbol and the unit (e.g., /kg, /qtl), and this entire string must be translated to the requested language.

IMPORTANT: You must provide your ENTIRE response, including crop names, market names, and fully formatted prices, in the following language: {{{language}}}

Location: {{{location}}}

Example response for Bangalore in Bengali (language: "Bengali"):
{
  "prices": [
    { "crop": "টমেটো", "market": "বেঙ্গালুরু (কে.আর. মার্কেট)", "price": "₹২৮/কেজি" },
    { "crop": "পেঁয়াজ", "market": "বেঙ্গালুরু (যಶವಂತಪುರ)", "price": "₹২২/কেজি" },
    { "crop": "আলু", "market": "বেঙ্গালুরু (কে.আর. মার্কেট)", "price": "₹২০/কেজি" },
    { "crop": "গাজর", "market": "বেঙ্গালুরু (যಶವಂತಪುರ)", "price": "₹৪৫/কেজি" },
    { "crop": "রাগি", "market": "বেঙ্গালুরু (এপিএমসি)", "price": "₹৩,২০০/কুইন্টাল" }
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
