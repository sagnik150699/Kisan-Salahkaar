
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
  imageUrl: string;
  dataAiHint: string;
}

interface ProductSuggestionsProps {
  products: Product[];
}

export function ProductSuggestions({ products }: ProductSuggestionsProps) {
  const { t } = useI18n();
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const randomSeed = Math.floor(Math.random() * 1000) + 1;
    e.currentTarget.src = `https://picsum.photos/seed/${randomSeed}/200/200`;
  };

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
            <CarouselItem key={index} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4">
              <div className="p-1">
                <Card className="overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-between p-2 aspect-square">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={100}
                      height={100}
                      data-ai-hint={product.dataAiHint}
                      className="rounded-md object-cover w-24 h-24"
                      onError={handleImageError}
                    />
                    <p className="text-xs font-medium text-center mt-2 leading-tight h-8">
                      {product.name}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="mt-2 w-full"
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
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
}
