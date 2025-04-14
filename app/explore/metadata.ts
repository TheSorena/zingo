import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اکسپلور | Cinema Plus | سینما پلاس',
  description: 'مشاهده ویدیوها و تصاویر جذاب از فیلم‌ها و سریال‌های برتر',
  openGraph: {
    title: 'اکسپلور | Cinema Plus | سینما پلاس',
    description: 'مشاهده ویدیوها و تصاویر جذاب از فیلم‌ها و سریال‌های برتر',
    images: [
      {
        url: '/images/og-explore.jpg',
        width: 1200,
        height: 630,
        alt: 'Cinema Plus Explore',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اکسپلور | Cinema Plus | سینما پلاس',
    description: 'مشاهده ویدیوها و تصاویر جذاب از فیلم‌ها و سریال‌های برتر',
    images: ['/images/og-explore.jpg'],
  },
}; 