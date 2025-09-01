'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";

const marketData = [
  { crop: "Tomato", market: "Bangalore", price: "₹25/kg" },
  { crop: "Onion", market: "Nashik", price: "₹18/kg" },
  { crop: "Potato", market: "Agra", price: "₹15/kg" },
  { crop: "Wheat", market: "Ludhiana", price: "₹2,125/qtl" },
  { crop: "Rice", market: "Karnal", price: "₹3,500/qtl" },
];

export function MarketPrices() {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          {t('marketPrices.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('marketPrices.crop')}</TableHead>
              <TableHead>{t('marketPrices.market')}</TableHead>
              <TableHead className="text-right">{t('marketPrices.price')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketData.map((item) => (
              <TableRow key={item.crop}>
                <TableCell className="font-medium">{item.crop}</TableCell>
                <TableCell>{item.market}</TableCell>
                <TableCell className="text-right">{item.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
