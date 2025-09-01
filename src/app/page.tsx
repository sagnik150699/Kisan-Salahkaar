'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from "@/components/header";
import { CropRecommendation } from "@/components/crop-recommendation";
import { PestIdentification } from "@/components/pest-identification";
import { WeatherAlerts } from "@/components/weather-alerts";
import { MarketPrices } from "@/components/market-prices";

const formSchema = z.object({
  location: z.string().min(2, { message: 'Location is required.' }),
  soilType: z.string().min(1, { message: 'Please select a soil type.' }),
  weatherPatterns: z.string().min(1, { message: 'Please select weather patterns.' }),
});

export type CropRecFormType = z.infer<typeof formSchema>;

export default function Home() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<CropRecFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      soilType: '',
      weatherPatterns: '',
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header form={form} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CropRecommendation
              form={form}
              onLocationSubmit={setLocation}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
          <div className="lg:row-span-2">
            <PestIdentification />
          </div>
          <div className="lg:col-span-1">
            <WeatherAlerts location={location} />
          </div>
          <div className="lg:col-span-1">
            <MarketPrices />
          </div>
        </div>
      </main>
    </div>
  );
}
