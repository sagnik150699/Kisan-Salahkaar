'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-recommendations.ts';
import '@/ai/flows/identify-pests-and-diseases.ts';
import '@/ai/flows/get-location-details.ts';
import '@/ai/flows/get-weather-alerts.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/get-market-prices.ts';
