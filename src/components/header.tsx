'use client';
import { useState, useEffect } from "react";
import { Leaf, Languages, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/context/i18n-provider";
import { languages } from "@/lib/i18n";
import { handleVoiceQuery } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { ExtractCropDetailsFromQueryOutput } from "@/ai/flows/extract-crop-details-from-query";

interface HeaderProps {
  onVoiceData: (data: ExtractCropDetailsFromQueryOutput) => void;
}

export function Header({ onVoiceData }: HeaderProps) {
  const { t, setLanguage, language } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          variant: 'destructive',
          title: 'Voice Error',
          description: `Could not understand audio. Please try again. Error: ${event.error}`,
        });
      };

      recognitionInstance.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsProcessing(true);
        const response = await handleVoiceQuery({ query: transcript });
        if (response.success && response.data) {
          onVoiceData(response.data);
          toast({
            title: 'Information Extracted',
            description: 'The form has been filled with the extracted information.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: response.error,
          });
        }
        setIsProcessing(false);
      };
      setRecognition(recognitionInstance);
    }
  }, [onVoiceData, toast]);

  const handleMicClick = () => {
    if (!recognition) {
      toast({
        variant: 'destructive',
        title: 'Voice Recognition Not Supported',
        description: 'Your browser does not support voice recognition.',
      });
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = language;
      recognition.start();
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-2">
        <Leaf className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">
          {t('title')}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Languages className="w-5 h-5" />
              <span className="sr-only">{t('changeLanguage')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.value}
                onSelect={() => setLanguage(lang.value)}
                className={lang.value === language ? "bg-accent" : ""}
              >
                {t(lang.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" onClick={handleMicClick} disabled={isProcessing || !recognition}>
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isListening ? <MicOff className="w-5 h-5 text-destructive" /> : <Mic className="w-5 h-5" />) }
          <span className="sr-only">{isListening ? 'Stop listening' : t('useVoice')}</span>
        </Button>
      </div>
    </header>
  );
}
