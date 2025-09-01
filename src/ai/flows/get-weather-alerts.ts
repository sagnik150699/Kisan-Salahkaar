'use server';
/**
 * @fileOverview An AI agent that gets weather alerts for a location.
 *
 * - getWeatherAlerts - A function that handles getting weather alerts.
 * - GetWeatherAlertsInput - The input type for the getWeatherAlerts function.
 * - GetWeatherAlertsOutput - The return type for the getWeatherAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeatherAlertsInputSchema = z.object({
  location: z.string().describe('The location to get weather alerts for.'),
});
export type GetWeatherAlertsInput = z.infer<typeof GetWeatherAlertsInputSchema>;

const AlertSchema = z.object({
  icon: z.enum(['ThermometerSnowflake', 'CloudRain', 'Sun', 'Wind', 'CloudFog']),
  textKey: z.string().describe('A short descriptive key for the alert.'),
  time: z.string().describe('The time or time range for the alert (e.g., "Today, 9:00 PM", "Next 3 days").'),
});

const GetWeatherAlertsOutputSchema = z.object({
  alerts: z.array(AlertSchema),
  translations: z.record(z.string()).describe('A dictionary of translations for the textKeys in the language of the location.')
});
export type GetWeatherAlertsOutput = z.infer<typeof GetWeatherAlertsOutputSchema>;


export async function getWeatherAlerts(input: GetWeatherAlertsInput): Promise<GetWeatherAlertsOutput> {
  return getWeatherAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWeatherAlertsPrompt',
  input: {schema: GetWeatherAlertsInputSchema},
  output: {schema: GetWeatherAlertsOutputSchema},
  prompt: `You are a helpful assistant that provides weather alerts. Given a location, provide 3-4 relevant weather alerts for the next few days. For each alert, provide an icon, a descriptive textKey, and the time. The textKey should be a short, unique, camelCase identifier for the alert text. Also provide a dictionary of translations for these textKeys based on the language spoken in the given location.

Location: {{{location}}}

Example response for Bangalore:
{
  "alerts": [
    { "icon": "CloudRain", "textKey": "heavyRainWarning", "time": "Tomorrow, 2:00 PM" },
    { "icon": "Sun", "textKey": "highUvIndex", "time": "Next 3 days" },
    { "icon": "Wind", "textKey": "strongWinds", "time": "Today, 5:00 PM" }
  ],
  "translations": {
    "heavyRainWarning": "Heavy rain expected. Plan irrigation accordingly.",
    "highUvIndex": "Strong sun and high UV index.",
    "strongWinds": "Strong winds expected. Secure loose items."
  }
}`,
});

const getWeatherAlertsFlow = ai.defineFlow(
  {
    name: 'getWeatherAlertsFlow',
    inputSchema: GetWeatherAlertsInputSchema,
    outputSchema: GetWeatherAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
