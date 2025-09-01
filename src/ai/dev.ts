import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-recommendations.ts';
import '@/ai/flows/identify-pests-and-diseases.ts';
import '@/ai/flows/get-location-details.ts';
import '@/ai/flows/extract-crop-details-from-query.ts';
