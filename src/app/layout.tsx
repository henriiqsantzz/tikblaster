import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'ShadowAds - TikTok Ads Management',
  description: 'Gerencie e escale suas campanhas de TikTok Ads com facilidade',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ec4899" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="text-gray-800" style={{ backgroundColor: '#faf5f7' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
