'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { TrendingUp, Loader2 } from "lucide-react";
import { useI18n } from "@/context/i18n-provider";
import { handleGetMarketPrices } from '@/lib/actions';
import type { GetMarketPricesOutput } from '@/ai/flows/get-market-prices';
import { useToast } from '@/hooks/use-toast';

interface MarketPricesProps {
  location: string;
}

export function MarketPrices({ location }: MarketPricesProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<GetMarketPricesOutput['prices'] | null>(null);

  const fetchMarketPrices = useCallback(async (currentLocation: string) => {
    if (!currentLocation) return;
    setLoading(true);
    setMarketData(null);
    const response = await handleGetMarketPrices({ location: currentLocation });

    if (response.success && response.data) {
      setMarketData(response.data.prices);
    } else {
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
      fetchMarketPrices(location);
    }
  }, [location, fetchMarketPrices]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          {t('marketPrices.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {!loading && marketData && marketData.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('marketPrices.crop')}</TableHead>
                <TableHead>{t('marketPrices.market')}</TableHead>
                <TableHead className="text-right">{t('marketPrices.price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.crop}</TableCell>
                  <TableCell>{item.market}</TableCell>
                  <TableCell className="text-right">{item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         {!loading && (!marketData || marketData.length === 0) && (
          <p className="text-center text-muted-foreground">{t('marketPrices.noData')}</p>
        )}
      </CardContent>
    </Card>
  );
}
