'use client';

import { useState } from 'react';
import { Header } from "@/components/header";
import { CropRecommendation } from "@/components/crop-recommendation";
import { PestIdentification } from "@/components/pest-identification";
import { WeatherAlerts } from "@/components/weather-alerts";
import { MarketPrices } from "@/components/market-prices";
import type { ExtractCropDetailsFromQueryOutput } from '@/ai/flows/extract-crop-details-from-query';

export default function Home() {
  const [voiceData, setVoiceData] = useState<ExtractCropDetailsFromQueryOutput | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onVoiceData={setVoiceData} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CropRecommendation voiceData={voiceData} />
          </div>
          <div className="lg:row-span-2">
            <PestIdentification />
          </div>
          <div className="lg:col-span-1">
            <WeatherAlerts />
          </div>
          <div className="lg:col-span-1">
            <MarketPrices />
          </div>
        </div>
      </main>
    </div>
  );
}
