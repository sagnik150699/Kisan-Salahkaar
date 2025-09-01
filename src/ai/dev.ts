import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-recommendations.ts';
import '@/ai/flows/identify-pests-and-diseases.ts';