'use client';

import { Header } from "@/components/header";
import { CropRecommendation } from "@/components/crop-recommendation";
import { PestIdentification } from "@/components/pest-identification";
import { WeatherAlerts } from "@/components/weather-alerts";
import { MarketPrices } from "@/components/market-prices";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CropRecommendation />
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
