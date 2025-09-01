'use server';

import { generateCropRecommendations, type GenerateCropRecommendationsInput } from '@/ai/flows/generate-crop-recommendations';
import { identifyPestOrDisease, type IdentifyPestOrDiseaseInput } from '@/ai/flows/identify-pests-and-diseases';
import { getLocationDetails, type GetLocationDetailsInput } from '@/ai/flows/get-location-details';
import { extractCropDetailsFromQuery, type ExtractCropDetailsFromQueryInput } from '@/ai/flows/extract-crop-details-from-query';


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

export async function handleVoiceQuery(input: ExtractCropDetailsFromQueryInput) {
    try {
        const result = await extractCropDetailsFromQuery(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to process voice query.' };
    }
}
