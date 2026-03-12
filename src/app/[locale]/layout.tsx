import './globals.css';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Providers } from '@/components/layout/providers';
import { RootLayoutClient } from '@/components/layout/root-layout-client';


export const metadata: Metadata = {
  title: 'GolfGuiders - A better golfing experience',
  description: 'Your Guide to a Better Golfing Experience',
};


// Extract origins for resource hints (runs at build/render time on server)
const graphqlOrigin = process.env.NEXT_PUBLIC_GRAPHQL_URI
  ? new URL(process.env.NEXT_PUBLIC_GRAPHQL_URI).origin
  : null;
const aiApiOrigin = process.env.GOLFGUIDERS_GPT_URL
  ? new URL(process.env.GOLFGUIDERS_GPT_URL).origin
  : null;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect to GraphQL API — saves DNS+TCP+TLS (~100-300ms) on first query */}
        {graphqlOrigin && (
          <link rel="preconnect" href={graphqlOrigin} crossOrigin="anonymous" />
        )}
        {/* DNS prefetch for services used on specific pages */}
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        {aiApiOrigin && <link rel="dns-prefetch" href={aiApiOrigin} />}
        {/* Noto Color Emoji — renders newer emojis missing from Windows 10 Segoe UI Emoji */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'font-sans bg-background text-foreground'
        )}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <RootLayoutClient />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

