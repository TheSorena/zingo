import './globals.css';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import PrivacyCheck from './components/PrivacyCheck';
import DownloadAppPopup from './components/DownloadAppPopup';

const vazirmatn = Vazirmatn({ subsets: ['arabic'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Cinema Plus | سینما پلاس',
  description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
  manifest: '/manifest.json',
  themeColor: '#000000',
  keywords: ['movie', 'cinema', 'film', 'series', 'فیلم', 'سریال', 'سینما'],
  authors: [{ name: 'Hossein Pira' }],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: 'en_US',
    title: 'Cinema Plus | سینما پلاس',
    description: 'Modern Movie Application | اپلیکیشن مدرن فیلم و سریال',
    siteName: 'Cinema Plus | سینما پلاس',
    images: [
      {
        url: '/og-image.png',
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
      <head>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            {/* Google tag (gtag.js) */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
        {/* Native City Analytics */}
        <script
          data-host="https://analytics.nativecity.io"
          data-dnt="false"
          src="https://analytics.nativecity.io/js/script.js"
          id="ZwSg9rf6GA"
          async
          defer
        />
      </head>
      <body className={vazirmatn.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivacyCheck />
          <DownloadAppPopup />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
