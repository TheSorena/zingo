import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { LoadingProvider } from '@/components/loading-provider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'زینگو | Zingo',
  description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
  manifest: '/manifest.json',
  themeColor: '#0a0a0b',
  keywords: ['movie', 'cinema', 'film', 'series', 'فیلم', 'سریال', 'سینما', 'زینگو'],
  authors: [{ name: 'Zingo' }],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: 'en_US',
    title: 'زینگو | Zingo',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
    siteName: 'زینگو | Zingo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zingo - Modern Movie Application | زینگو - اپلیکیشن مدرن فیلم و سریال',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'زینگو | Zingo',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
    images: ['/og-image.png'],
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
  icons: [
    { rel: "icon", url: "/favicon.ico", type: "image/x-icon" },
    { rel: "icon", url: "/favicon.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/favicon.png" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}