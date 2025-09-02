import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from '@/context/i18n-provider';

export const metadata: Metadata = {
  title: 'Kisan Salahkaar',
  description: 'AI-powered agricultural advisor for Indian farmers.',
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
