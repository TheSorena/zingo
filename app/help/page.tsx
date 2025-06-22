import { Command, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'راهنمای استفاده | Cinema Plus | سینما پلاس',
  description: 'How to use Cinema Plus | راهنمای استفاده از سینما پلاس',
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Command className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              سینما پلاس
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
          <h1 className="text-3xl font-bold mb-8 text-center">راهنمای استفاده از سینما پلاس</h1>

          {/* Help Image */}
          <div className="mb-8">
            <Image
              src="/help.jpg"
              alt="راهنمای استفاده"
              width={1200}
              height={300}
              className="w-full rounded-xl object-cover"
              priority
            />
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            {/* Question 1 */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">چرا تعداد فیلم‌ها و سریال‌ها در صفحه اصلی و سریال‌ها کم است؟</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما در صفحه اصلی و صفحه سریال‌ها فقط 30 مورد از جدیدترین فیلم‌ها و سریال‌ها را نمایش می‌دهیم. برای دسترسی به همه موارد، می‌توانید از قسمت جستجو استفاده کنید و عنوان فیلم، سریال، توضیحات، کارگردان یا بازیگر مورد نظر خود را جستجو کنید.
              </p>
            </div>

            {/* Question 2 */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">چگونه می‌توانم فیلم یا سریال مورد نظرم را پیدا کنم؟</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                شما می‌توانید از طریق:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>جستجوی نام فیلم یا سریال</li>
                <li>جستجوی نام کارگردان</li>
                <li>جستجوی نام بازیگران</li>
                <li>جستجو در توضیحات</li>
                <li>مشاهده جدیدترین‌ها در صفحه اصلی</li>
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
              </div>
            </div>

            {/* Question 5 - TV Channels */}
            <div className="bg-card/50 backdrop-blur p-6 rounded-xl border">
              <h2 className="text-xl font-semibold mb-4">راهنمای پیدا کردن شبکه‌های تلویزیونی</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  بعضی شبکه‌های ماهواره‌ای فارسی زبان ممکنه در کشورهای دیگه باشن.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  پس برای اینکه بدونید در کدوم کشور کانال مورد نظر شما وجود داره، اونو داخل اینترنت جستجو کنید و کشور مورد نظر رو انتخاب کنید و عنوان شبکه رو جستجو کنید.
                </p>
                <div className="bg-accent/50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2">مثال:</h3>
                  <p className="text-muted-foreground">
                    شبکه Persiana در فرانسه وجود دارد. چون دفتر مرکزی این شبکه اونجاست.
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