import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from '@/context/i18n-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://kisansalahkaar.codingliquids.com'),
  title: 'Kisan Salahkaar | AI Agricultural Advisor for Indian Farmers',
  description: 'Get AI-driven crop recommendations, pest and disease identification, real-time market prices, and localized weather reports to help Indian farmers make informed decisions. Your personal AI farming assistant.',
  keywords: ['kisan', 'agricultural advisor', 'ai farming', 'crop recommendation', 'pest identification', 'indian farmer', 'agriculture app', 'salahkaar', 'farming assistant'],
  openGraph: {
    title: 'Kisan Salahkaar | AI Agricultural Advisor',
    description: 'AI-powered farming assistant for crop recommendations, pest ID, market prices, and weather reports.',
    url: 'https://kisansalahkaar.codingliquids.com',
    siteName: 'Kisan Salahkaar',
    images: [
      {
        url: '/og-image.png', // It's good practice to have an Open Graph image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
   twitter: {
    card: 'summary_large_image',
    title: 'Kisan Salahkaar | AI Agricultural Advisor',
    description: 'AI-powered farming assistant for crop recommendations, pest ID, market prices, and weather reports.',
    images: ['/og-image.png'],
  },
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
