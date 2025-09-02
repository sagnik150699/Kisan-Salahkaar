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
});
export type GetWeatherReportInput = z.infer<typeof GetWeatherReportInputSchema>;

const GetWeatherReportOutputSchema = z.object({
  temperature: z.string().describe('The current temperature in Celsius (e.g., "25°C").'),
  humidity: z.string().describe('The current humidity level (e.g., "60%").'),
  wind: z.string().describe('The current wind speed and direction (e.g., "15 km/h SW").'),
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

Location: {{{location}}}

Example response for Bangalore:
{
  "temperature": "28°C",
  "humidity": "55%",
  "wind": "12 km/h W",
  "forecast": "Partly cloudy with a chance of light rain in the evening."
}`,
});

const getWeatherReportFlow = ai.defineFlow(
  {
    name: 'getWeatherReportFlow',
    inputSchema: GetWeatherReportInputSchema,
    outputSchema: GetWeatherReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
