'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import Link from 'next/link';

export default function DownloadAppPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the popup
    const hasUserDismissed = localStorage.getItem('downloadAppDismissed');
    if (hasUserDismissed) return;

    // Check if user agent is Android but not the specific Firefox Mobile
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isAndroidTV = /(android tv|smarttv|googletv|androidtv)/.test(userAgent);
    const isSpecificFirefox = userAgent === "mozilla/5.0 (android 13; mobile; rv:109.0) gecko/20100101 firefox/115.0";

    if (isAndroid && !isSpecificFirefox && !isAndroidTV) {
      setShowPopup(true);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('downloadAppDismissed', 'true');
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center bg-background sm:bg-background/80 sm:backdrop-blur-sm">
      <div className="relative w-full sm:max-w-lg sm:mx-auto sm:rounded-lg sm:shadow-lg sm:m-4 bg-card sm:border">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col justify-center min-h-screen sm:min-h-0 space-y-6 p-6">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-2xl font-bold text-center">
              دانلود اپلیکیشن سینما پلاس
            </h2>
            <p className="text-center text-muted-foreground text-lg sm:text-base">
              برای تجربه بهتر و سریع‌تر، اپلیکیشن اندروید سینما پلاس را نصب کنید
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href="https://t.me/CinemaPlusApp"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-10 px-4 py-2 rounded-md transition-colors text-lg sm:text-base"
            >
              <Download className="h-5 w-5 sm:h-4 sm:w-4" />
              دانلود از تلگرام
            </a>
            
            <a
              href="https://cinemaplus-app.vercel.app/app/application-v1.3.apk"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 h-12 sm:h-10 px-4 py-2 rounded-md transition-colors text-lg sm:text-base"
            >
              <Download className="h-5 w-5 sm:h-4 sm:w-4" />
              دانلود مستقیم
            </a>

            <button
              onClick={handleDontShowAgain}
              className="text-base sm:text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              دیگر نمایش نده
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 