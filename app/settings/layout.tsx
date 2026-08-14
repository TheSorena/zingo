import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تنظیمات | Zingo | زینگو',
  description: 'Customize your Zingo experience | شخصی‌سازی تجربه زینگو',
  openGraph: {
    title: 'تنظیمات | Zingo | زینگو',
    description: 'Customize your Zingo experience | شخصی‌سازی تجربه زینگو',
  },
  twitter: {
    title: 'تنظیمات | Zingo | زینگو',
    description: 'Customize your Zingo experience | شخصی‌سازی تجربه زینگو',
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 