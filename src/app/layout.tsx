import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'TikBlaster - TikTok Ads Management',
  description: 'Manage and optimize your TikTok advertising campaigns with ease',
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
        <meta name="theme-color" content="#00e6a0" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-dark-500 text-gray-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
