import { Command, Search, Send, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'راهنمای استفاده | Zingo | زینگو',
  description: 'How to use Zingo | راهنمای استفاده از زینگو',
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/zingo-logo.png" alt="زینگو" className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-primary/20 ring-1 ring-primary/30 transition-transform group-hover:rotate-6" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              زینگو
            </h1>
          </Link>
          <div className="flex items-center">
            <Link href="/search">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8 text-center">راهنمای استفاده از زینگو</h1>

          {/* Help Image */}
          <div className="mb-8">
            <Image
              src="/help.jpg"
              alt="راهنمای استفاده"
              width={1200}
              height={300}
              className="w-full rounded-3xl object-cover shadow-2xl shadow-primary/10 ring-1 ring-border/60"
              priority
            />
          </div>

          {/* About Zingo Team */}
          <div className="mb-8 relative overflow-hidden glass rounded-3xl border border-border/60 p-6 md:p-8 text-center">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-extrabold text-gradient-warm">تیم شهباز</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-5 max-w-xl mx-auto">
              سایت زینگو توسط تیم شهباز ساخته و مدیریت می‌شود. برنامه‌نویس سایت «سورنا» است. برای پیشنهادها، انتقادها و اطلاع از آپدیت‌های جدید، کانال تلگرام ما را دنبال کنید.
            </p>
            <a
              href="https://t.me/ShahBaz_Team_ir"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-amber-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:shadow-primary/40 active:scale-95"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-y-0 w-1/3 -left-1/3 bg-white/25 blur-md -skew-x-12 translate-x-0 transition-transform duration-700 group-hover:translate-x-[400%]" />
              </span>
              <Send className="h-4 w-4" />
              کانال تلگرام شهباز تیم
            </a>
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            {/* Question 1 - Updated for pagination */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">چگونه می‌توانم فیلم‌ها و سریال‌های بیشتری مشاهده کنم؟</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                در صفحه اصلی، هر بخش شامل صفحه‌بندی است که به شما امکان مشاهده فیلم‌ها و سریال‌های بیشتری را می‌دهد. برای دسترسی به صفحات بعدی:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>از دکمه‌های شماره صفحه (۱، ۲، ۳، ...) استفاده کنید</li>
                <li>با فلش‌های راست و چپ بین صفحات جابجا شوید</li>
                <li>هر صفحه شامل تا ۳۰ مورد جدید است</li>
                <li>برای دسترسی سریع، از قسمت جستجو استفاده کنید</li>
              </ul>
            </div>

            {/* New Question - How to use pagination */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">نحوه استفاده از صفحه‌بندی</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                سیستم صفحه‌بندی هوشمند ما به شما کمک می‌کند تا به راحتی بین صفحات مختلف حرکت کنید:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>صفحه فعلی:</strong> با رنگ پررنگ نشان داده می‌شود</li>
                <li><strong>صفحات مجاور:</strong> کلیک کنید تا به صفحه بعدی یا قبلی بروید</li>
                <li><strong>نقطه‌ها (...):</strong> نشان‌دهنده وجود صفحات بیشتر است</li>
                <li><strong>فلش‌ها:</strong> برای حرکت سریع به صفحه بعدی یا قبلی</li>
                <li><strong>بارگیری:</strong> هنگام تغییر صفحه، منتظر بمانید تا محتوا بارگیری شود</li>
              </ul>
              <div className="bg-accent/50 p-4 rounded-lg mt-4">
                <h3 className="font-medium mb-2">مثال:</h3>
                <p className="text-muted-foreground">
                  اگر در صفحه ۵ هستید، ممکن است صفحه‌بندی به این صورت باشد: ۱ ... ۴ ۵ ۶ ... ۱۲
                </p>
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">چگونه می‌توانم فیلم یا سریال مورد نظرم را پیدا کنم؟</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                شما می‌توانید از طریق چند روش مختلف محتوا پیدا کنید:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>جستجوی نام فیلم یا سریال</li>
                <li>جستجوی نام کارگردان</li>
                <li>جستجوی نام بازیگران</li>
                <li>جستجو در توضیحات</li>
                <li>مشاهده جدیدترین‌ها در صفحه اصلی</li>
                <li>گشت زدن در صفحات مختلف با استفاده از صفحه‌بندی</li>
              </ul>
            </div>

            {/* Question 3 */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">نحوه دانلود و تماشای فیلم‌ها و سریال‌ها</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                برای هر فیلم و سریال، گزینه‌های مختلفی برای دانلود و تماشا وجود دارد:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>دانلود مستقیم با کیفیت‌های مختلف</li>
                <li>پخش با VLC</li>
                <li>کپی لینک دانلود</li>
              </ul>
            </div>

            {/* Question 4 */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">مشکلات رایج</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">مشکل در دانلود با مرورگر کروم:</h3>
                  <p className="text-muted-foreground">
                    در صورت بروز مشکل در دانلود با کروم، می‌توانید لینک را کپی کرده و در مرورگر دیگری باز کنید یا از دانلود منیجر استفاده کنید.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">مشکل در پخش با VLC:</h3>
                  <p className="text-muted-foreground">
                    در صورت عدم کارکرد صحیح دکمه تماشا با VLC، می‌توانید لینک را کپی کرده و مستقیماً در VLC باز کنید.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">بارگیری کند صفحات:</h3>
                  <p className="text-muted-foreground">
                    هنگام تغییر صفحه، کمی صبر کنید تا محتوا بارگیری شود. اگر صفحه بارگیری نمی‌شود، صفحه را رفرش کنید.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="text-center mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 