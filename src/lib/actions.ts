'use server';

import { generateCropRecommendations, type GenerateCropRecommendationsInput } from '@/ai/flows/generate-crop-recommendations';
import { identifyPestOrDisease, type IdentifyPestOrDiseaseInput } from '@/ai/flows/identify-pests-and-diseases';
import { getLocationDetails, type GetLocationDetailsInput } from '@/ai/flows/get-location-details';
import { getWeatherAlerts, type GetWeatherAlertsInput } from '@/ai/flows/get-weather-alerts';
import { textToSpeech, type TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { getMarketPrices, type GetMarketPricesInput } from '@/ai/flows/get-market-prices';


export async function handleCropRecommendation(input: GenerateCropRecommendationsInput) {
  try {
    const result = await generateCropRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get crop recommendations.' };
  }
}

export async function handlePestIdentification(input: IdentifyPestOrDiseaseInput) {
  try {
    const result = await identifyPestOrDisease(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to identify pest or disease.' };
  }
}

export async function handleLocationDetails(input: GetLocationDetailsInput) {
    try {
        const result = await getLocationDetails(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get location details.' };
    }
}

export async function handleGetWeatherAlerts(input: GetWeatherAlertsInput) {
    try {
        const result = await getWeatherAlerts(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get weather alerts.' };
    }
}

export async function handleTextToSpeech(input: TextToSpeechInput) {
  try {
    const result = await textToSpeech(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate audio.' };
  }
}

export async function handleGetMarketPrices(input: GetMarketPricesInput) {
  try {
    const result = await getMarketPrices(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get market prices.' };
  }
}
