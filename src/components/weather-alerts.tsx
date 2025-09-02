'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudRain, Sun, ThermometerSnowflake } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";

export function WeatherAlerts() {
  const { t } = useI18n();

  const alerts = [
    {
      icon: <ThermometerSnowflake className="w-5 h-5 text-blue-500" />,
      text: t("weatherAlerts.frost"),
    },
    {
      icon: <CloudRain className="w-5 h-5 text-gray-500" />,
      text: t("weatherAlerts.rain"),
    },
    {
      icon: <Sun className="w-5 h-5 text-yellow-500" />,
      text: t("weatherAlerts.sun"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('weatherAlerts.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {alerts.map((alert, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1">{alert.icon}</div>
              <p className="text-sm">{alert.text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
