import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تلویزیون زنده | Cinema Plus | سینما پلاس',
  description: 'Watch live TV channels from around Iran | تماشای کانال‌های تلویزیونی زنده از سراسر ایران',
  openGraph: {
    title: 'تلویزیون زنده | Cinema Plus | سینما پلاس',
    description: 'Watch live TV channels from around Iran | تماشای کانال‌های تلویزیونی زنده از سراسر ایران',
    images: [
      {
        url: '/tv.png',
        width: 1200,
        height: 630,
        alt: 'Cinema Plus - Modern Movie Application | سینما پلاس - اپلیکیشن مدرن فیلم و سریال',
      },
    ],
  },
  twitter: {
    title: 'تلویزیون زنده | Cinema Plus | سینما پلاس',
    description: 'Watch live TV channels from around Iran | تماشای کانال‌های تلویزیونی زنده از سراسر ایران',
    images: ["/tv.png"]
  },
};

export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 