'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bug, Leaf, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { handlePestIdentification } from '@/lib/actions';
import type { IdentifyPestOrDiseaseOutput } from '@/ai/flows/identify-pests-and-diseases';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export function PestIdentification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPestOrDiseaseOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setImageData(dataUrl);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageData) {
      toast({
        variant: 'destructive',
        title: 'No Image',
        description: 'Please upload an image first.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await handlePestIdentification({ photoDataUri: imageData });

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
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-6 h-6 text-primary" />
          Pest & Disease ID
        </CardTitle>
        <CardDescription>
          Upload a photo of an affected plant to get a diagnosis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="relative border-2 border-dashed border-border rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Plant preview"
              fill
              className="object-contain rounded-md"
            />
          ) : (
            <>
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Upload an image to get started
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="file-upload" className="flex-1">
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
             <span className="sr-only">Choose file</span>
          </label>
          <Button onClick={handleSubmit} disabled={loading || !imageData} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Diagnose Plant
          </Button>
        </div>
      </CardContent>
      {result && (
        <>
          <Separator className="my-0" />
          <CardFooter className="flex-col items-start gap-4 pt-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2"><Bug className="w-5 h-5"/>Diagnosis:</h3>
              <p className="text-sm text-foreground/80">{result.diagnosis}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2"><Leaf className="w-5 h-5"/>Organic Remedies:</h3>
              <p className="text-sm text-foreground/80">{result.organicRemedies}</p>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
