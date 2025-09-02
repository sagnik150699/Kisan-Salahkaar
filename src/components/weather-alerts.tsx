'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudRain, Sun, ThermometerSnowflake, Wind, CloudFog, Loader2, BellDot } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";
import { useToast } from '@/hooks/use-toast';
import { handleGetWeatherAlerts } from '@/lib/actions';
import type { GetWeatherAlertsOutput } from '@/ai/flows/get-weather-alerts';

interface WeatherAlertsProps {
  location: string;
}

const iconMap = {
  ThermometerSnowflake: <ThermometerSnowflake className="w-5 h-5 text-blue-500" />,
  CloudRain: <CloudRain className="w-5 h-5 text-gray-500" />,
  Sun: <Sun className="w-5 h-5 text-yellow-500" />,
  Wind: <Wind className="w-5 h-5 text-green-500" />,
  CloudFog: <CloudFog className="w-5 h-5 text-purple-500" />,
};

export function WeatherAlerts({ location }: WeatherAlertsProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<GetWeatherAlertsOutput['alerts']>([]);
  const [translations, setTranslations] = useState<GetWeatherAlertsOutput['translations']>({});

  const fetchWeatherAlerts = useCallback(async (currentLocation: string) => {
    if (!currentLocation) {
        setAlerts([]);
        setTranslations({});
        return;
    };
    setLoading(true);
    const response = await handleGetWeatherAlerts({ location: currentLocation });

    if (response.success && response.data) {
      setAlerts(response.data.alerts);
      setTranslations(response.data.translations);
    } else {
      setAlerts([]);
      setTranslations({});
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: response.error,
      });
    }
    setLoading(false);
  }, [t, toast]);

  useEffect(() => {
    fetchWeatherAlerts(location);
  }, [location, fetchWeatherAlerts]);

  const renderedAlerts = useMemo(() => {
     if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }
    
    if (alerts.length === 0) {
      return <p className="text-sm text-center text-muted-foreground">{t('weatherAlerts.noAlerts')}</p>;
    }

    return (
      <ul className="space-y-4">
        {alerts.map((alert, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="mt-1">{iconMap[alert.icon] || <BellDot className="w-5 h-5" />}</div>
            <div>
                <p className="text-sm font-semibold">{translations[alert.textKey] || alert.textKey}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }, [alerts, translations, loading, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
            <BellDot className="w-6 h-6" />
            {t('weatherAlerts.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderedAlerts}
      </CardContent>
    </Card>
  );
}
