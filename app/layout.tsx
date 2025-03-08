import './globals.css';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import PrivacyCheck from './components/PrivacyCheck';

const vazirmatn = Vazirmatn({ subsets: ['arabic'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Cinema Plus | سینما پلاس',
  description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
  keywords: ['movie', 'cinema', 'film', 'series', 'فیلم', 'سریال', 'سینما'],
  authors: [{ name: 'Hossein Pira' }],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: 'en_US',
    title: 'Cinema Plus | سینما پلاس',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
    siteName: 'Cinema Plus | سینما پلاس',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cinema Plus - Modern Movie Application | سینما پلاس - اپلیکیشن مدرن فیلم و سریال',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cinema Plus | سینما پلاس',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
    images: ['/og-image.jpg'],
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
    { url: "/favicon.ico", type: "image/x-icon" },
    { url: "/favicon.png", type: "image/png" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={vazirmatn.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivacyCheck />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}