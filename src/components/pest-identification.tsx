
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Bug, Leaf, Loader2, Upload, Volume2, StopCircle, FlaskConical, Send, Mic, MicOff, FileUp } from 'lucide-react';
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
import { handlePestIdentification, handleTextToSpeech, handleFollowUpRemedyQuestion } from '@/lib/actions';
import type { IdentifyPestOrDiseaseOutput } from '@/ai/flows/identify-pests-and-diseases';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useI18n } from '@/context/i18n-provider';
import { ProductSuggestions } from './product-suggestions';

function getCroppedImg(
  image: HTMLImageElement,
  crop: CropType,
): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  const targetWidth = crop.width;
  const targetHeight = crop.height;
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = targetWidth * pixelRatio;
  canvas.height = targetHeight * pixelRatio;
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
    targetWidth,
    targetHeight
  );

  return new Promise((resolve) => {
    resolve(canvas.toDataURL('image/jpeg'));
  });
}

interface ChatMessages {
  user: string;
  assistant: string;
}

interface FollowUpState {
  question: string;
  loading: boolean;
  messages: ChatMessages[];
}

const RemedyChat = ({ diagnosis, remedy, remedyTitle }: { diagnosis: string, remedy: string, remedyTitle: string }) => {
    const { t, language } = useI18n();
    const { toast } = useToast();
    const [followUp, setFollowUp] = useState<FollowUpState>({ question: '', loading: false, messages: [] });
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recognitionRef = useRef<any>(null);
    const [activeAudio, setActiveAudio] = useState<string | null>(null);

     useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setFollowUp(prev => ({ ...prev, question: transcript }));
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                toast({ variant: "destructive", title: t('speechError.title'), description: t('speechError.description') });
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, [language, t, toast]);
    
    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            toast({ variant: "destructive", title: t('speechNotSupported.title'), description: t('speechNotSupported.description')});
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };


    const handleFollowUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!followUp.question.trim()) return;

        setFollowUp(prev => ({ ...prev, loading: true }));

        const response = await handleFollowUpRemedyQuestion({
            diagnosis,
            remedy,
            question: followUp.question,
            language,
        });

        if (response.success && response.data) {
            setFollowUp(prev => ({
                ...prev,
                loading: false,
                question: '',
                messages: [...prev.messages, { user: prev.question, assistant: response.data.answer }],
            }));
        } else {
            toast({
                variant: 'destructive',
                title: t('error.title'),
                description: response.error,
            });
            setFollowUp(prev => ({ ...prev, loading: false }));
        }
    };
    
    const handleReadAloud = async (text: string, audioId: string) => {
        if (isPlaying && activeAudio === audioId && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setLoadingAudio(false);
            setActiveAudio(null);
            return;
        }

        setLoadingAudio(true);
        setActiveAudio(audioId);
        const response = await handleTextToSpeech({ text });
        if (response.success && response.data && audioRef.current) {
            audioRef.current.src = response.data.audioDataUri;
            audioRef.current.play().catch(err => {
                console.error("Audio play failed", err);
                toast({ variant: 'destructive', title: t('audioFailed.title'), description: t('audioFailed.description') });
                setLoadingAudio(false);
                setActiveAudio(null);
            });
        } else {
            toast({ variant: 'destructive', title: t('audioFailed.title'), description: response.error || t('audioFailed.description') });
            setLoadingAudio(false);
            setActiveAudio(null);
        }
    };

    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            const onPlaying = () => { setLoadingAudio(false); setIsPlaying(true); };
            const onEnded = () => { setIsPlaying(false); setActiveAudio(null); };
            const onPause = () => { setIsPlaying(false); setActiveAudio(null);};
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
        <div className="w-full mt-2 space-y-4 rounded-md border p-4">
            <div className="flex items-start gap-2">
                <p className="text-sm text-foreground/80 flex-grow">{remedy}</p>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleReadAloud(remedy, 'initial-remedy')}
                    disabled={loadingAudio && activeAudio !== 'initial-remedy'}
                    aria-label={t('readAloud')}
                >
                    {(loadingAudio && activeAudio === 'initial-remedy') ? <Loader2 className="animate-spin" /> : (isPlaying && activeAudio === 'initial-remedy') ? <StopCircle /> : <Volume2 />}
                </Button>
            </div>

          {followUp.messages.length > 0 && (
            <div className="space-y-4">
              {followUp.messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-semibold text-sm">{t('you')}: <span className="font-normal">{msg.user}</span></p>
                  <div className="flex items-start gap-2">
                    <p className="font-semibold text-sm flex-grow">{t('assistant')}: <span className="font-normal">{msg.assistant}</span></p>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleReadAloud(msg.assistant, `msg-${index}`)}
                        disabled={loadingAudio && activeAudio !== `msg-${index}`}
                        aria-label={t('readAloud')}
                    >
                        {(loadingAudio && activeAudio === `msg-${index}`) ? <Loader2 className="animate-spin" /> : (isPlaying && activeAudio === `msg-${index}`) ? <StopCircle /> : <Volume2 />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
            <Input
              type="text"
              value={followUp.question}
              onChange={(e) => setFollowUp(prev => ({ ...prev, question: e.target.value }))}
              placeholder={t('followUp.placeholder')}
              className="flex-grow"
              disabled={followUp.loading}
            />
            <Button type="submit" size="icon" disabled={followUp.loading || !followUp.question.trim()}>
              {followUp.loading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
            <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} onClick={handleVoiceInput} disabled={followUp.loading} aria-label={isRecording ? t('stopRecording') : t('startRecording')}>
              {isRecording ? <MicOff /> : <Mic />}
            </Button>
          </form>
           <audio ref={audioRef} className="hidden" />
        </div>
    )
}


export function PestIdentification() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPestOrDiseaseOutput | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCrop(undefined) // Makes crop preview update between images.
      setResult(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      )
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

  const handleSubmit = async () => {
    if (!imgSrc) {
      toast({
        variant: 'destructive',
        title: t('noImage.title'),
        description: t('noImage.description'),
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    let imageDataToSubmit = imgSrc;
    if (completedCrop && imgRef.current && completedCrop.width > 0 && completedCrop.height > 0) {
      try {
        const croppedDataUrl = await getCroppedImg(
          imgRef.current,
          completedCrop
        );
        imageDataToSubmit = croppedDataUrl;
      } catch (error) {
        console.error('Cropping failed', error);
        toast({
            variant: 'destructive',
            title: t('croppingFailed.title'),
            description: t('croppingFailed.description'),
        });
        setLoading(false);
        return;
      }
    }


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
        <div className="relative border-2 border-dashed border-border rounded-lg p-4 text-center min-h-64 flex flex-col items-center justify-center">
         {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              className="max-h-[50vh] w-auto"
            >
              <Image
                ref={imgRef}
                src={imgSrc}
                alt={t('pestIdentification.cropAlt')}
                onLoad={onImageLoad}
                width={800}
                height={600}
                style={{ objectFit: 'contain', maxHeight: '50vh' }}
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

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-shrink-0"
            >
              <FileUp className="mr-2 h-4 w-4" />
              {t('chooseFile')}
            </Button>
            <span className="text-sm text-muted-foreground truncate">
              {fileName || t('noFileChosen')}
            </span>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !imgSrc}>
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
                        onClick={() => handleReadAloud(result.diagnosis)}
                        disabled={loadingAudio}
                        aria-label={t('readAloud')}
                    >
                        {loadingAudio ? <Loader2 className="animate-spin" /> : isPlaying ? <StopCircle /> : <Volume2 />}
                    </Button>
                </div>
                <p className="text-sm text-foreground/80 mt-1">{result.diagnosis}</p>
                 <p className="text-xs text-muted-foreground mt-2 italic">{result.disclaimer}</p>
            </div>
            <div className="w-full">
              <h3 className="font-bold text-lg flex items-center gap-2"><Leaf className="w-5 h-5"/>{t('organicRemedies')}:</h3>
              <RemedyChat diagnosis={result.diagnosis} remedy={result.organicRemedies} remedyTitle={t('organicRemedies')} />
              {result.suggestedOrganicProducts && result.suggestedOrganicProducts.length > 0 && (
                <ProductSuggestions products={result.suggestedOrganicProducts} />
              )}
            </div>
            <div className="w-full">
              <h3 className="font-bold text-lg flex items-center gap-2"><FlaskConical className="w-5 h-5"/>{t('inorganicRemedies')}:</h3>
              <RemedyChat diagnosis={result.diagnosis} remedy={result.inorganicRemedies} remedyTitle={t('inorganicRemedies')} />
               {result.suggestedInorganicProducts && result.suggestedInorganicProducts.length > 0 && (
                <ProductSuggestions products={result.suggestedInorganicProducts} />
              )}
            </div>
          </CardFooter>
        </>
      )}
       <audio ref={audioRef} className="hidden" />
    </Card>
  );
}
