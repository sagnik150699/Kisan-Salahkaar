import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, ThermometerSnowflake } from "lucide-react";

const alerts = [
  {
    icon: <ThermometerSnowflake className="w-5 h-5 text-blue-500" />,
    text: "Frost warning tonight. Cover sensitive plants.",
    time: "Today, 9:00 PM",
  },
  {
    icon: <CloudRain className="w-5 h-5 text-gray-500" />,
    text: "Heavy rain expected tomorrow afternoon. Plan irrigation accordingly.",
    time: "Tomorrow, 2:00 PM",
  },
  {
    icon: <Sun className="w-5 h-5 text-yellow-500" />,
    text: "Strong sun and high UV index for the next 3 days.",
    time: "Next 3 days",
  },
];

export function WeatherAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {alerts.map((alert, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1">{alert.icon}</div>
              <div>
                <p className="text-sm font-medium">{alert.text}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
