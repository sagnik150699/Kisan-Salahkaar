'use server';
/**
 * @fileOverview An AI agent that gets a weather report for a location.
 *
 * - getWeatherReport - A function that handles getting a weather report.
 * - GetWeatherReportInput - The input type for the getWeatherReport function.
 * - GetWeatherReportOutput - The return type for the getWeatherReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeatherReportInputSchema = z.object({
  location: z.string().describe('The location to get the weather report for.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi").'),
});
export type GetWeatherReportInput = z.infer<typeof GetWeatherReportInputSchema>;

const GetWeatherReportOutputSchema = z.object({
  temperature: z.string().describe('The current temperature in Celsius (e.g., "25°C", "২৫°C"). This value must be translated to the requested language script if appropriate.'),
  humidity: z.string().describe('The current humidity level (e.g., "60%", "৬০%"). This value must be translated to the requested language script if appropriate.'),
  wind: z.string().describe('The current wind speed and direction (e.g., "15 km/h SW", "১৫ কিমি/ঘন্টা দঃপঃ"). This value must be translated to the requested language script if appropriate.'),
  forecast: z.string().describe('A brief weather forecast for the next 24 hours.'),
});
export type GetWeatherReportOutput = z.infer<typeof GetWeatherReportOutputSchema>;


export async function getWeatherReport(input: GetWeatherReportInput): Promise<GetWeatherReportOutput> {
  return getWeatherReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWeatherReportPrompt',
  input: {schema: GetWeatherReportInputSchema},
  output: {schema: GetWeatherReportOutputSchema},
  prompt: `You are a helpful assistant that provides a concise weather report. Given a location, provide the current temperature, humidity, wind speed/direction, and a brief forecast.

IMPORTANT: You must provide your ENTIRE response in the following language, translating all values and text: {{{language}}}

Location: {{{location}}}

Example response for Bangalore in Bengali (language: "Bengali"):
{
  "temperature": "২৮°C",
  "humidity": "৫৫%",
  "wind": "১২ কিমি/ঘন্টা পঃ",
  "forecast": "আংশিক মেঘলা এবং সন্ধ্যায় হালকা বৃষ্টির সম্ভাবনা।"
}`,
});

const getWeatherReportFlow = ai.defineFlow(
  {
    name: 'getWeatherReportFlow',
    inputSchema: GetWeatherReportInputSchema,
    outputSchema: GetWeatherReportOutputSchema,
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
