'use server';

import { generateCropRecommendations, type GenerateCropRecommendationsInput } from '@/ai/flows/generate-crop-recommendations';
import { identifyPestOrDisease, type IdentifyPestOrDiseaseInput } from '@/ai/flows/identify-pests-and-diseases';

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
