
'use client';

import { useState, useRef, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Loader2, Locate, Trees, Volume2, StopCircle, Send, Mic, MicOff } from 'lucide-react';
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
import { handleCropRecommendation, handleLocationDetails, handleTextToSpeech, handleGuessSoilType, handleFollowUpCropQuestion } from '@/lib/actions';
import type { GenerateCropRecommendationsOutput } from '@/ai/flows/generate-crop-recommendations';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { useI18n } from '@/context/i18n-provider';
import type { CropRecFormType } from '@/app/page';

interface ChatMessages {
  user: string;
  assistant: string;
}

interface FollowUpState {
  question: string;
  loading: boolean;
  messages: ChatMessages[];
}

const FollowUpChat = ({ recommendation }: { recommendation: string }) => {
    const { t, language } = useI18n();
    const { toast } = useToast();
    const [followUp, setFollowUp] = useState<FollowUpState>({ question: '', loading: false, messages: [] });
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const recognitionRef = useRef<any>(null);

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

        const response = await handleFollowUpCropQuestion({
            recommendation,
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
            audioRef.current.play().catch(err => {
                console.error("Audio play failed", err);
                toast({ variant: 'destructive', title: t('audioFailed.title'), description: t('audioFailed.description') });
                setLoadingAudio(false);
            });
        } else {
            toast({ variant: 'destructive', title: t('audioFailed.title'), description: response.error || t('audioFailed.description') });
            setLoadingAudio(false);
        }
    };

    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            const onPlaying = () => { setLoadingAudio(false); setIsPlaying(true); };
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
        <div className="w-full mt-4 space-y-4 rounded-md border p-4">
          <p className="text-sm text-foreground/80">{recommendation}</p>

          {followUp.messages.length > 0 && (
            <div className="space-y-4">
              {followUp.messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-semibold text-sm">{t('you')}: <span className="font-normal">{msg.user}</span></p>
                  <div className="flex items-start gap-2">
                    <p className="font-semibold text-sm">{t('assistant')}: <span className="font-normal">{msg.assistant}</span></p>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleReadAloud(msg.assistant)}
                        disabled={loadingAudio}
                        aria-label={t('readAloud')}
                    >
                        {loadingAudio ? <Loader2 className="animate-spin" /> : isPlaying ? <StopCircle /> : <Volume2 />}
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
              placeholder={t('followUp.placeholderRecommendation')}
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

interface CropRecommendationProps {
  form: UseFormReturn<CropRecFormType>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function CropRecommendation({ form, loading, setLoading }: CropRecommendationProps) {
  const { t, language } = useI18n();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<GenerateCropRecommendationsOutput | null>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);


  const handleGeoLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: t('geolocationNotSupported.title'),
        description: t('geolocationNotSupported.description'),
      });
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationResponse = await handleLocationDetails({ latitude, longitude });

          if (locationResponse.success && locationResponse.data) {
            const { location, weatherPatterns } = locationResponse.data;
            form.setValue('location', location);
            form.setValue('weatherPatterns', weatherPatterns);
            toast({
              title: t('locationDetected.title'),
              description: t('locationDetected.description'),
            });
            
            // Now guess the soil type
            await handleSoilTypeGuess(location);

          } else {
            toast({
              variant: 'destructive',
              title: t('error.title'),
              description: locationResponse.error,
            });
          }
        } catch (apiError) {
           console.error("API Error fetching location details:", apiError);
           toast({
              variant: 'destructive',
              title: t('error.title'),
              description: t('geolocationError.description'), // Generic API error
           });
        } finally {
            setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation Error:", error.message);
        toast({
          variant: 'destructive',
          title: t('geolocationError.title'),
          description: t('geolocationError.description'), // More specific error for permissions
        });
        setLoadingLocation(false);
      }
    );
  };

  const handleSoilTypeGuess = async (location: string) => {
    if (!location) return;
    try {
      const response = await handleGuessSoilType({ location });
      if (response.success && response.data) {
        const soilType = response.data.soilType;
        form.setValue('soilType', soilType);
         toast({
          title: t('soilTypeGuessed.title'),
          description: `${t('soilTypeGuessed.description')} ${t(`soilType.${soilType.toLowerCase().replace(/ and /g, 'And')}`)}`
        });
      } else {
        // Don't show an error toast if soil guess fails, it's a non-critical enhancement
        console.error("Failed to guess soil type:", response.error);
      }
    } catch (error) {
       console.error("Exception in handleSoilTypeGuess:", error);
    }
  };


  async function onSubmit(values: CropRecFormType) {
    setLoading(true);
    setResult(null);

    const response = await handleCropRecommendation({...values, language});

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
                      <Input
                        placeholder={t('location.placeholder')}
                        {...field}
                        onBlur={() => handleSoilTypeGuess(field.value)}
                      />
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
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-lg">{t('ourRecommendation')}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleReadAloud(result.cropRecommendations)}
                disabled={loadingAudio}
                aria-label={t('readAloud')}
              >
                {loadingAudio ? <Loader2 className="animate-spin" /> : isPlaying ? <StopCircle /> : <Volume2 />}
              </Button>
            </div>
            <FollowUpChat recommendation={result.cropRecommendations} />
        </CardFooter>
        </>
      )}
       <audio ref={audioRef} className="hidden" />
    </Card>
  );
}

    
