'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Thermometer, Droplets, Wind, CloudSun, Loader2 } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";
import { useToast } from '@/hooks/use-toast';
import { handleGetWeatherReport } from '@/lib/actions';
import type { GetWeatherReportOutput } from '@/ai/flows/get-weather-report';

interface WeatherReportProps {
  location: string;
}

export function WeatherReport({ location }: WeatherReportProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GetWeatherReportOutput | null>(null);

  const fetchWeatherReport = useCallback(async (currentLocation: string) => {
    if (!currentLocation) {
        setReport(null);
        return;
    };
    setLoading(true);
    setReport(null);
    const response = await handleGetWeatherReport({ location: currentLocation });

    if (response.success && response.data) {
      setReport(response.data);
    } else {
      setReport(null);
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: response.error,
      });
    }
    setLoading(false);
  }, [t, toast]);

  useEffect(() => {
    if (location) {
      fetchWeatherReport(location);
    } else {
      setReport(null);
    }
  }, [location, fetchWeatherReport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
            <CloudSun className="w-6 h-6" />
            {t('weatherReport.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : !report ? (
          <p className="text-sm text-center text-muted-foreground">{t('weatherReport.noData')}</p>
        ) : (
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-destructive" />
                      <div>
                          <p className="text-muted-foreground">{t('weatherReport.temperature')}</p>
                          <p className="font-semibold">{report.temperature}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <div>
                          <p className="text-muted-foreground">{t('weatherReport.humidity')}</p>
                          <p className="font-semibold">{report.humidity}</p>
                      </div>
                  </div>
                   <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 text-gray-500" />
                      <div>
                          <p className="text-muted-foreground">{t('weatherReport.wind')}</p>
                          <p className="font-semibold">{report.wind}</p>
                      </div>
                  </div>
              </div>
              <div>
                  <h4 className="font-semibold mb-1">{t('weatherReport.forecast')}</h4>
                  <p className="text-sm text-muted-foreground">{report.forecast}</p>
              </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
