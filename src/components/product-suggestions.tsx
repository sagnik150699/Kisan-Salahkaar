
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useI18n } from '@/context/i18n-provider';

interface Product {
  name: string;
  buyLink: string;
  imageUrl?: string;
  dataAiHint: string;
}

interface ProductSuggestionsProps {
  products: Product[];
}

export function ProductSuggestions({ products }: ProductSuggestionsProps) {
  const { t } = useI18n();

  return (
    <div className="w-full mt-4">
      <h4 className="font-semibold text-md mb-2">{t('whereToBuy')}</h4>
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {products.map((product, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/4">
              <div className="p-1 h-full">
                <Card className="overflow-hidden h-full">
                  <CardContent className="flex flex-col items-center justify-between p-2 h-full">
                    <div className="flex-shrink-0">
                      <Image
                        src={product.imageUrl || 'https://placehold.co/200x200/EEE/31343C?text=No+Image'}
                        alt={product.name}
                        width={100}
                        height={100}
                        data-ai-hint={product.dataAiHint}
                        className="rounded-md object-cover w-24 h-24"
                      />
                    </div>
                    <div className="flex-grow flex items-center mt-2">
                      <p className="text-xs font-medium text-center leading-tight line-clamp-3">
                        {product.name}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="mt-2 w-full flex-shrink-0"
                      variant="outline"
                    >
                      <a href={product.buyLink} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {t('buyNow')}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
