'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Locate, Trees } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleCropRecommendation, handleLocationDetails } from '@/lib/actions';
import type { GenerateCropRecommendationsOutput } from '@/ai/flows/generate-crop-recommendations';
import type { ExtractCropDetailsFromQueryOutput } from '@/ai/flows/extract-crop-details-from-query';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { useI18n } from '@/context/i18n-provider';

const formSchema = z.object({
  location: z.string().min(2, { message: 'Location is required.' }),
  soilType: z.string().min(1, { message: 'Please select a soil type.' }),
  weatherPatterns: z.string().min(1, { message: 'Please select weather patterns.' }),
});

interface CropRecommendationProps {
  voiceData: ExtractCropDetailsFromQueryOutput | null;
}

export function CropRecommendation({ voiceData }: CropRecommendationProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [result, setResult] = useState<GenerateCropRecommendationsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      soilType: '',
      weatherPatterns: '',
    },
  });

  useEffect(() => {
    if (voiceData) {
      form.setValue('location', voiceData.location);
      form.setValue('soilType', voiceData.soilType);
      form.setValue('weatherPatterns', voiceData.weatherPatterns);
    }
  }, [voiceData, form]);

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await handleLocationDetails({ latitude, longitude });

          if (response.success && response.data) {
            form.setValue('location', response.data.location);
            form.setValue('weatherPatterns', response.data.weatherPatterns);
            toast({
              title: t('locationDetected.title'),
              description: t('locationDetected.description'),
            });
          } else {
            toast({
              variant: 'destructive',
              title: t('error.title'),
              description: response.error,
            });
          }
          setLoadingLocation(false);
        },
        (error) => {
          console.error(error);
          toast({
            variant: 'destructive',
            title: t('geolocationError.title'),
            description: t('geolocationError.description'),
          });
          setLoadingLocation(false);
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: t('geolocationNotSupported.title'),
        description: t('geolocationNotSupported.description'),
      });
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);

    const response = await handleCropRecommendation(values);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: response.error,
      });
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trees className="w-6 h-6 text-primary" />
          {t('cropRecommendation.title')}
        </CardTitle>
        <CardDescription>
          {t('cropRecommendation.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-end gap-2 mb-4">
                <Button type="button" variant="outline" onClick={handleGeoLocation} disabled={loadingLocation}>
                  {loadingLocation ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Locate className="mr-2 h-4 w-4" />
                  )}
                  {t('useMyLocation')}
                </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('location')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('location.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('soilType.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('soilType.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alluvial">{t('soilType.alluvial')}</SelectItem>
                        <SelectItem value="Black">{t('soilType.black')}</SelectItem>
                        <SelectItem value="Red and Yellow">{t('soilType.redAndYellow')}</SelectItem>
                        <SelectItem value="Laterite">{t('soilType.laterite')}</SelectItem>
                        <SelectItem value="Arid">{t('soilType.arid')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weatherPatterns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('weatherPatterns.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('weatherPatterns.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tropical Monsoon">{t('weatherPatterns.tropicalMonsoon')}</SelectItem>
                        <SelectItem value="Hot and Dry">{t('weatherPatterns.hotAndDry')}</SelectItem>
                        <SelectItem value="Mild Winter">{t('weatherPatterns.mildWinter')}</SelectItem>
                        <SelectItem value="Semi-Arid">{t('weatherPatterns.semiArid')}</SelectItem>
                         <SelectItem value="Tropical Wet and Dry">{t('weatherPatterns.tropicalWetAndDry')}</SelectItem>
                        <SelectItem value="Humid Subtropical">{t('weatherPatterns.humidSubtropical')}</SelectItem>
                        <SelectItem value="Mountain">{t('weatherPatterns.mountain')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('getRecommendations')}
            </Button>
          </form>
        </Form>
      </CardContent>
      {result && (
        <>
        <Separator className="my-4" />
        <CardFooter className="flex-col items-start gap-2">
            <h3 className="font-bold text-lg">{t('ourRecommendation')}</h3>
            <p className="text-sm text-foreground/80">{result.cropRecommendations}</p>
        </CardFooter>
        </>
      )}
    </Card>
  );
}
