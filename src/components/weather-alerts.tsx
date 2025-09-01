'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudFog, CloudRain, Sun, ThermometerSnowflake, Wind, Loader2 } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";
import { handleGetWeatherAlerts } from '@/lib/actions';
import type { GetWeatherAlertsOutput } from '@/ai/flows/get-weather-alerts';
import { useToast } from '@/hooks/use-toast';

const iconMap: { [key: string]: React.ReactNode } = {
  'ThermometerSnowflake': <ThermometerSnowflake className="w-5 h-5 text-blue-500" />,
  'CloudRain': <CloudRain className="w-5 h-5 text-gray-500" />,
  'Sun': <Sun className="w-5 h-5 text-yellow-500" />,
  'Wind': <Wind className="w-5 h-5 text-gray-400" />,
  'CloudFog': <CloudFog className="w-5 h-5 text-gray-400" />,
};

interface WeatherAlertsProps {
  location: string;
}

export function WeatherAlerts({ location }: WeatherAlertsProps) {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<GetWeatherAlertsOutput['alerts']>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAlerts() {
      if (!location) return;

      setLoading(true);
      setAlerts([]);
      const response = await handleGetWeatherAlerts({ location });
      if (response.success && response.data) {
        setAlerts(response.data.alerts);
        setTranslations(response.data.translations);
      } else {
        toast({
          variant: 'destructive',
          title: t('error.title'),
          description: response.error,
        });
      }
      setLoading(false);
    }

    fetchAlerts();
  }, [location, t, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('weatherAlerts.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : alerts.length > 0 ? (
          <ul className="space-y-4">
            {alerts.map((alert, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1">{iconMap[alert.icon]}</div>
                <div>
                  <p className="text-sm font-medium">{translations[alert.textKey] || alert.textKey}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('weatherAlerts.noAlerts')}</p>
        )}
      </CardContent>
    </Card>
  );
}
