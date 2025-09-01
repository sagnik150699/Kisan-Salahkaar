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
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const formSchema = z.object({
  location: z.string().min(2, { message: 'Location is required.' }),
  soilType: z.string().min(1, { message: 'Please select a soil type.' }),
  weatherPatterns: z.string().min(1, { message: 'Please select weather patterns.' }),
});

export function CropRecommendation() {
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
              title: 'Location Detected',
              description: 'Location and weather patterns have been filled in.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: response.error,
            });
          }
          setLoadingLocation(false);
        },
        (error) => {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Geolocation Error',
            description: 'Could not get your location. Please enter it manually.',
          });
          setLoadingLocation(false);
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
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
        title: 'Error',
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
          Crop Recommendations
        </CardTitle>
        <CardDescription>
          Get AI-powered crop suggestions based on your local conditions.
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
                  Use My Location
                </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (City/District)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mysore" {...field} />
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
                    <FormLabel>Soil Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a soil type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alluvial">Alluvial</SelectItem>
                        <SelectItem value="Black">Black (Cotton) Soil</SelectItem>
                        <SelectItem value="Red and Yellow">Red and Yellow Soil</SelectItem>
                        <SelectItem value="Laterite">Laterite Soil</SelectItem>
                        <SelectItem value="Arid">Arid Soil</SelectItem>
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
                    <FormLabel>Weather Patterns</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weather patterns" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tropical Monsoon">Tropical Monsoon</SelectItem>
                        <SelectItem value="Hot and Dry">Hot and Dry Summer</SelectItem>
                        <SelectItem value="Mild Winter">Mild, Wet Winter</SelectItem>
                        <SelectItem value="Semi-Arid">Semi-Arid</SelectItem>
                         <SelectItem value="Tropical Wet and Dry">Tropical Wet and Dry</SelectItem>
                        <SelectItem value="Humid Subtropical">Humid Subtropical</SelectItem>
                        <SelectItem value="Mountain">Mountain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Recommendations
            </Button>
          </form>
        </Form>
      </CardContent>
      {result && (
        <>
        <Separator className="my-4" />
        <CardFooter className="flex-col items-start gap-2">
            <h3 className="font-bold text-lg">Our Recommendation:</h3>
            <p className="text-sm text-foreground/80">{result.cropRecommendations}</p>
        </CardFooter>
        </>
      )}
    </Card>
  );
}
