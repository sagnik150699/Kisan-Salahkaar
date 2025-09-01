'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, ThermometerSnowflake } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";

const alerts = [
  {
    icon: <ThermometerSnowflake className="w-5 h-5 text-blue-500" />,
    textKey: "weatherAlerts.frost",
    time: "Today, 9:00 PM",
  },
  {
    icon: <CloudRain className="w-5 h-5 text-gray-500" />,
    textKey: "weatherAlerts.rain",
    time: "Tomorrow, 2:00 PM",
  },
  {
    icon: <Sun className="w-5 h-5 text-yellow-500" />,
    textKey: "weatherAlerts.sun",
    time: "Next 3 days",
  },
];

export function WeatherAlerts() {
  const { t } = useI18n();

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
              <div>
                <p className="text-sm font-medium">{t(alert.textKey)}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
