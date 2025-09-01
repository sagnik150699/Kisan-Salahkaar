'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Bug, Leaf, Loader2, Upload, Crop } from 'lucide-react';
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
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function getCroppedImg(
  image: HTMLImageElement,
  crop: CropType,
  fileName: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    resolve(canvas.toDataURL('image/jpeg'));
  });
}

export function PestIdentification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPestOrDiseaseOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const { toast } = useToast();
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isCropping, setIsCropping] = useState(false);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setImageData(dataUrl);
        setResult(null);
        setIsCropping(true); // Enter cropping mode
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop)
  };

  const handleCropImage = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const croppedDataUrl = await getCroppedImg(
                imgRef.current,
                completedCrop,
                'cropped-plant.jpg'
            );
            setImagePreview(croppedDataUrl);
            setImageData(croppedDataUrl);
            setIsCropping(false);
            toast({
                title: 'Image Cropped',
                description: 'The image has been successfully cropped.',
            });
        } catch (error) {
            console.error('Cropping failed', error);
            toast({
                variant: 'destructive',
                title: 'Cropping Failed',
                description: 'Could not crop the image.',
            });
        }
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

    if(isCropping) {
        toast({
            variant: 'destructive',
            title: 'Crop in Progress',
            description: 'Please crop the image before diagnosing.',
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
        <div className="relative border-2 border-dashed border-border rounded-lg p-4 text-center h-64 flex flex-col items-center justify-center">
          {imagePreview && isCropping ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              className="max-h-full"
            >
              <Image
                ref={imgRef}
                src={imagePreview}
                alt="Plant to crop"
                onLoad={onImageLoad}
                fill
                style={{ objectFit: 'contain' }}
              />
            </ReactCrop>
          ) : imagePreview ? (
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
              disabled={loading}
            />
             <span className="sr-only">Choose file</span>
          </label>
          {isCropping && (
             <Button onClick={handleCropImage} disabled={!completedCrop}>
                <Crop className="mr-2 h-4 w-4" />
                Crop Image
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading || !imageData || isCropping} className="w-full sm:w-auto">
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
