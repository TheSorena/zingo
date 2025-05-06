import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تلویزیون زنده | Cinema Plus | سینما پلاس',
  description: 'Watch live TV channels from around Iran | تماشای کانال‌های تلویزیونی زنده از سراسر ایران',
  openGraph: {
    title: 'تلویزیون زنده | Cinema Plus | سینما پلاس',
    description: 'Watch live TV channels from around Iran | تماشای کانال‌های تلویزیونی زنده از سراسر ایران',
  },
  twitter: {
    title: 'تلویزیون زنده | Cinema Plus | سینما پلاس',
    description: 'Watch live TV channels from around Iran | تماشای کانال‌های تلویزیونی زنده از سراسر ایران',
  },
};

export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 