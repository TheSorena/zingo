'use client';

import { SearchInput } from "@/components/search-input";
import { MobileNav } from "../../components/mobile-nav";
import { ThemeToggle } from "../../components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Settings, Sun, Moon, Monitor, Info, Share2, Command, Wrench, Github, Mail, Code2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { NavItems } from "@/components/nav-items-client";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const developers = [
  {
    name: "حسین پیرا",
    role: "طراح و مدیر سیستم",
    github: "https://github.com/code3-dev",
    email: "h3dev.pira@gmail.com",
  },
  {
    name: "محمد مهرابی راد",
    role: "طراح و مدیر سیستم",
    github: "https://github.com/MamdMehrabi",
    email: "mohammadmehrabi175@gmail.com",
  }
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Command className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <h1 className="text-2xl md:hidden lg:block md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Cinema Plus
            </h1>
          </Link>
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <NavItems />
            <SearchInput placeholder="جستجو..." />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 pb-24 md:pb-8 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">تنظیمات</h1>
        </div>

        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sun className="w-6 h-6 text-primary group-hover:rotate-45 transition-transform duration-300" />
                تنظیمات تم
              </CardTitle>
              <CardDescription className="text-base">
                تغییر ظاهر برنامه بین حالت روشن و تاریک
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="space-y-1.5">
                  <p className="font-medium">تم برنامه</p>
                  <p className="text-sm text-muted-foreground">
                    انتخاب بین حالت روشن، تاریک یا سیستم
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Developers Section */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                توسعه دهندگان
              </CardTitle>
              <CardDescription className="text-base">
                تیم توسعه‌دهنده سینما پلاس
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {developers.map((dev, index) => (
                <div key={dev.name} className="space-y-4">
                  {index > 0 && <Separator className="my-4" />}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dev.name}</h3>
                        <p className="text-sm text-muted-foreground">{dev.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={dev.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-background rounded-full transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                        <a
                          href={`mailto:${dev.email}`}
                          className="p-2 hover:bg-background rounded-full transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* App Information */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                اطلاعات برنامه
              </CardTitle>
              <CardDescription className="text-base">
                جزئیات و اطلاعات برنامه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">سینما پلاس</h3>
                  </div>
                  <p className="text-muted-foreground">دانلود رایگان فیلم و سریال</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-1">نسخه</p>
                  <p className="text-sm text-primary">1.0.0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg 
                  className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                اطلاعات قانونی
              </CardTitle>
              <CardDescription className="text-base">
                قوانین و مقررات استفاده از سینما پلاس
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Link 
                  href="/privacy"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg 
                    className="w-5 h-5 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">حریم خصوصی</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Share2 className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                شبکه‌های اجتماعی
              </CardTitle>
              <CardDescription className="text-base">
                ما را در شبکه‌های اجتماعی دنبال کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <a 
                  href="https://t.me/CinemaPlusApp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="font-medium">تلگرام</span>
                </a>
                <a 
                  href="https://instagram.com/cinemaplus_app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                  <span className="font-medium">اینستاگرام</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </main>
  );
} 
