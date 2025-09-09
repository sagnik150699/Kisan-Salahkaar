import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from '@/context/i18n-provider';

export const metadata: Metadata = {
  title: 'Kisan Salahkaar | AI-Powered Farming Advisor',
  description: 'Get AI-driven crop recommendations, pest and disease identification, real-time market prices, and localized weather reports to help Indian farmers make informed decisions.',
  keywords: ['kisan', 'agricultural advisor', 'ai farming', 'crop recommendation', 'pest identification', 'indian farmer', 'agriculture app'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className="font-body antialiased">
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
