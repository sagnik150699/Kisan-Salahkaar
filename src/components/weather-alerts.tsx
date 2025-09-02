
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudFog, CloudRain, Sun, ThermometerSnowflake, Wind, Loader2 } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";
import { handleGetWeatherAlerts, handleLocationDetails } from '@/lib/actions';
import type { GetWeatherAlertsOutput } from '@/ai/flows/get-weather-alerts';
import { useToast } from '@/hooks/use-toast';

const iconMap: { [key: string]: React.ReactNode } = {
  'ThermometerSnowflake': <ThermometerSnowflake className="w-5 h-5 text-blue-500" />,
  'CloudRain': <CloudRain className="w-5 h-5 text-gray-500" />,
  'Sun': <Sun className="w-5 h-5 text-yellow-500" />,
  'Wind': <Wind className="w-5 h-5 text-gray-400" />,
  'CloudFog': <CloudFog className="w-5 h-5 text-gray-400" />,
};

export function WeatherAlerts() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<GetWeatherAlertsOutput['alerts']>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);

    const fetchAlertsForLocation = async (loc: string) => {
      const response = await handleGetWeatherAlerts({ location: loc });
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
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await handleLocationDetails({ latitude, longitude });

          if (response.success && response.data) {
            setLocation(response.data.location);
            await fetchAlertsForLocation(response.data.location);
          } else {
            setLoading(false);
            toast({
              variant: 'destructive',
              title: t('error.title'),
              description: response.error,
            });
          }
        },
        (error) => {
          console.error(error);
          setLoading(false);
          toast({
            variant: 'destructive',
            title: t('geolocationError.title'),
            description: t('geolocationError.description'),
          });
        }
      );
    } else {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: t('geolocationNotSupported.title'),
        description: t('geolocationNotSupported.description'),
      });
    }
  }, [t, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{location ? `${t('weatherAlerts.title')} for ${location}` : t('weatherAlerts.title')}</CardTitle>
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
