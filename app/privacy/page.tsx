'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function PrivacyPolicy() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy / سیاست حریم خصوصی</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Introduction / مقدمه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                This Privacy Policy explains how we collect, use, and protect your information when you use our service.
              </p>
              <p className="text-sm text-muted-foreground">
                این سیاست حریم خصوصی نحوه جمع‌آوری، استفاده و محافظت از اطلاعات شما را هنگام استفاده از خدمات ما توضیح می‌دهد.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information Collection / جمع‌آوری اطلاعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                We only collect necessary information to provide our services:
                - Browser type and version
                - Access timestamps
                - Download statistics
              </p>
              <p className="text-sm text-muted-foreground">
                ما فقط اطلاعات ضروری برای ارائه خدمات را جمع‌آوری می‌کنیم:
                - نوع و نسخه مرورگر
                - زمان‌های دسترسی
                - آمار دانلود
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security / امنیت داده‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                We implement security measures to protect your data:
                - HTTPS encryption
                - Secure download links
                - No personal data storage
              </p>
              <p className="text-sm text-muted-foreground">
                ما اقدامات امنیتی برای محافظت از داده‌های شما اجرا می‌کنیم:
                - رمزگذاری HTTPS
                - لینک‌های دانلود امن
                - عدم ذخیره‌سازی اطلاعات شخصی
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Downloads / دانلودها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                Our download system:
                - Uses secure HTTPS connections
                - Implements content security policies
                - Supports all modern browsers
                - No tracking or profiling
              </p>
              <p className="text-sm text-muted-foreground">
                سیستم دانلود ما:
                - از اتصالات امن HTTPS استفاده می‌کند
                - سیاست‌های امنیتی محتوا را اجرا می‌کند
                - از تمام مرورگرهای مدرن پشتیبانی می‌کند
                - بدون ردیابی یا نمایه‌سازی
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 