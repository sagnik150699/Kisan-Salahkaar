
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Bug, Leaf, Loader2, Upload, Crop, Volume2, StopCircle, Camera } from 'lucide-react';
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
import { handlePestIdentification, handleTextToSpeech } from '@/lib/actions';
import type { IdentifyPestOrDiseaseOutput } from '@/ai/flows/identify-pests-and-diseases';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useI18n } from '@/context/i18n-provider';
import { Label } from './ui/label';

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
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<IdentifyPestOrDiseaseOutput | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);
  const { toast } = useToast();
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      )
      reader.readAsDataURL(file);
      setResult(null);
      setCroppedImageData(null);
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
            setCroppedImageData(croppedDataUrl);
            toast({
                title: t('imageCropped.title'),
                description: t('imageCropped.description'),
            });
        } catch (error) {
            console.error('Cropping failed', error);
            toast({
                variant: 'destructive',
                title: t('croppingFailed.title'),
                description: t('croppingFailed.description'),
            });
        }
    }
  };


  const handleSubmit = async () => {
    const imageDataToSubmit = croppedImageData || imgSrc;
    if (!imageDataToSubmit) {
      toast({
        variant: 'destructive',
        title: t('noImage.title'),
        description: t('noImage.description'),
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await handlePestIdentification({ photoDataUri: imageDataToSubmit });

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
  };

  const handleReadAloud = async (text: string) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setLoadingAudio(false);
      return;
    }

    setLoadingAudio(true);
    const response = await handleTextToSpeech({ text });
    if (response.success && response.data && audioRef.current) {
        audioRef.current.src = response.data.audioDataUri;
        audioRef.current.play().catch(e => {
          console.error("Audio play failed", e)
          toast({
            variant: 'destructive',
            title: t('audioFailed.title'),
            description: t('audioFailed.description'),
          });
          setLoadingAudio(false);
        });
    } else {
        toast({
            variant: 'destructive',
            title: t('audioFailed.title'),
            description: response.error || t('audioFailed.description'),
        });
        setLoadingAudio(false);
    }
  };
  
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const onPlaying = () => {
        setIsPlaying(true);
        setLoadingAudio(false);
      };
      const onEnded = () => setIsPlaying(false);
      const onPause = () => setIsPlaying(false);

      audioElement.addEventListener('playing', onPlaying);
      audioElement.addEventListener('ended', onEnded);
      audioElement.addEventListener('pause', onPause);

      return () => {
        audioElement.removeEventListener('playing', onPlaying);
        audioElement.removeEventListener('ended', onEnded);
        audioElement.removeEventListener('pause', onPause);
      };
    }
  }, []);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-6 h-6 text-primary" />
          {t('pestIdentification.title')}
        </CardTitle>
        <CardDescription>
          {t('pestIdentification.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="relative border-2 border-dashed border-border rounded-lg p-4 text-center h-64 flex flex-col items-center justify-center">
         {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              className="max-h-full"
            >
              <Image
                ref={imgRef}
                src={imgSrc}
                alt={t('pestIdentification.cropAlt')}
                onLoad={onImageLoad}
                fill
                style={{ objectFit: 'contain' }}
              />
            </ReactCrop>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('pestIdentification.uploadPlaceholder')}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
           <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1 cursor-pointer"
            disabled={loading}
          />
          {imgSrc && (
             <Button onClick={handleCropImage} disabled={!completedCrop}>
                <Crop className="mr-2 h-4 w-4" />
                {t('cropImage')}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading || !imgSrc} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('diagnosePlant')}
          </Button>
        </div>
      </CardContent>
      {result && (
        <>
          <Separator className="my-0" />
          <CardFooter className="flex-col items-start gap-4 pt-6">
             <div className="w-full">
                <div className="flex items-center justify-between w-full">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Bug className="w-5 h-5"/>{t('diagnosis')}:</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReadAloud(`${t('diagnosis')}: ${result.diagnosis}. ${t('organicRemedies')}: ${result.organicRemedies}`)}
                        disabled={loadingAudio}
                        aria-label={t('readAloud')}
                    >
                        {loadingAudio ? <Loader2 className="animate-spin" /> : isPlaying ? <StopCircle /> : <Volume2 />}
                    </Button>
                </div>
                <p className="text-sm text-foreground/80">{result.diagnosis}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2"><Leaf className="w-5 h-5"/>{t('organicRemedies')}:</h3>
              <p className="text-sm text-foreground/80">{result.organicRemedies}</p>
            </div>
          </CardFooter>
        </>
      )}
      <audio ref={audioRef} className="hidden" />
    </Card>
  );
}


