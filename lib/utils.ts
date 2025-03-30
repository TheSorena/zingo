import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isChromeBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && !/Chromium/.test(navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
}

export function getDeviceType(): 'desktop' | 'android' | 'ios' | 'other' {
  if (typeof window === 'undefined') return 'other';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  
  return 'other';
}

export function getDownloadMessage(): string {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'android':
      return 'امکان دانلود مستقیم در مرورگر کروم وجود ندارد. لطفاً یکی از روش‌های زیر را انتخاب کنید:\n\n' +
             '۱. کپی لینک و استفاده در مرورگر Firefox\n' +
             '۲. کپی لینک و استفاده در برنامه ADM (Advanced Download Manager)\n' +
             '۳. کپی لینک و استفاده در برنامه‌های دانلود منیجر دیگر';
    case 'ios':
      return 'امکان دانلود مستقیم در مرورگر کروم وجود ندارد. لطفاً یکی از روش‌های زیر را انتخاب کنید:\n\n' +
             '۱. کپی لینک و استفاده در مرورگر Firefox\n' +
             '۲. کپی لینک و استفاده در مرورگر Safari\n' +
             '۳. کپی لینک و استفاده در برنامه‌های دانلود منیجر iOS';
    case 'desktop':
      return 'امکان دانلود مستقیم در مرورگر کروم وجود ندارد. لطفاً یکی از روش‌های زیر را انتخاب کنید:\n\n' +
             '۱. کپی لینک و استفاده در مرورگر Firefox\n' +
             '۲. کپی لینک و استفاده در نرم‌افزار IDM (Internet Download Manager)\n' +
             '۳. کپی لینک و استفاده در نرم‌افزار Motrix\n' +
             '۴. کپی لینک و استفاده در سایر دانلود منیجرها';
    default:
      return 'امکان دانلود مستقیم در مرورگر کروم وجود ندارد. لطفاً یکی از روش‌های زیر را انتخاب کنید:\n\n' +
             '۱. کپی لینک و استفاده در مرورگر Firefox\n' +
             '۲. کپی لینک و استفاده در برنامه‌های دانلود منیجر';
  }
}

export function encodeShareTitle(title: string): string {
  return Buffer.from(title).toString('base64');
}

export function decodeShareTitle(encodedTitle: string): string {
  try {
    return Buffer.from(encodedTitle, 'base64').toString();
  } catch (error) {
    return '';
  }
}

export function generateShareUrl(title: string, type: 'movie' | 'serie', id: string | number): string {
  const encodedTitle = encodeShareTitle(title);
  return `/share?t=${encodedTitle}&type=${type}&id=${id}`;
}
