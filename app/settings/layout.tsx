import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تنظیمات | Cinema Plus | تنظیمات | سینما پلاس',
  description: 'Customize your Cinema Plus experience | شخصی‌سازی تجربه سینما پلاس',
  openGraph: {
    title: 'تنظیمات | Cinema Plus | تنظیمات | سینما پلاس',
    description: 'Customize your Cinema Plus experience | شخصی‌سازی تجربه سینما پلاس',
  },
  twitter: {
    title: 'تنظیمات | Cinema Plus | تنظیمات | سینما پلاس',
    description: 'Customize your Cinema Plus experience | شخصی‌سازی تجربه سینما پلاس',
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 