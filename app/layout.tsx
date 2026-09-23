import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { LoadingProvider } from '@/components/loading-provider';
import { AuthProvider } from '@/components/auth-provider';

// Self-hosted + preloaded: no render-blocking webfont requests, works offline
const pinar = localFont({
  src: [
    { path: '../public/fonts/Pinar-Light.ttf', weight: '300' },
    { path: '../public/fonts/Pinar-Regular.ttf', weight: '400' },
    { path: '../public/fonts/Pinar-Medium.ttf', weight: '500' },
    { path: '../public/fonts/Pinar-SemiBold.ttf', weight: '600' },
    { path: '../public/fonts/Pinar-Bold.ttf', weight: '700' },
    { path: '../public/fonts/Pinar-ExtraBold.ttf', weight: '800' },
  ],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'zingo',
  description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
  manifest: '/manifest.json',
  themeColor: '#0a0a0b',
  keywords: ['movie', 'cinema', 'film', 'series', 'فیلم', 'سریال', 'سینما', 'زینگو'],
  authors: [{ name: 'Zingo' }],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: 'en_US',
    title: 'zingo',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
    siteName: 'zingo',
  },
  twitter: {
    card: 'summary',
    title: 'zingo',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className={pinar.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}