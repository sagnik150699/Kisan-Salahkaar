'use server';

import { generateCropRecommendations, type GenerateCropRecommendationsInput } from '@/ai/flows/generate-crop-recommendations';
import { identifyPestOrDisease, type IdentifyPestOrDiseaseInput } from '@/ai/flows/identify-pests-and-diseases';
import { getLocationDetails, type GetLocationDetailsInput } from '@/ai/flows/get-location-details';
import { getWeatherReport, type GetWeatherReportInput } from '@/ai/flows/get-weather-report';
import { textToSpeech, type TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { getMarketPrices, type GetMarketPricesInput } from '@/ai/flows/get-market-prices';
import { guessSoilType, type GuessSoilTypeInput } from '@/ai/flows/guess-soil-type';
import { followUpRemedyQuestion, type FollowUpRemedyQuestionInput } from '@/ai/flows/follow-up-remedy-question';


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

export async function handleGetWeatherReport(input: GetWeatherReportInput) {
    try {
        const result = await getWeatherReport(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get weather report.' };
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

export async function handleGuessSoilType(input: GuessSoilTypeInput) {
  try {
    const result = await guessSoilType(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to guess soil type.' };
  }
}

export async function handleFollowUpRemedyQuestion(input: FollowUpRemedyQuestionInput) {
  try {
    const result = await followUpRemedyQuestion(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get a follow-up answer.' };
  }
}
