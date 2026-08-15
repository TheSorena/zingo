'use client';

import { SearchInput } from "@/components/search-input";
import { MobileNav } from "../../components/mobile-nav";
import { ThemeToggle } from "../../components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Settings, Sun, Moon, Monitor, Info, Share2, Command, Code2, Star, Search, Wrench, MessageCircle, Check} from "lucide-react";
import { useRouter } from "next/navigation";
import { NavItems } from "@/components/nav-items-client";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const developers = [
  {
    name: "شهباز تیم",
    role: "سازنده سایت",
    telegram: "https://t.me/ShahBaz_Team_ir",
  },
  {
    name: "سورنا",
    role: "برنامه‌نویس سایت",
    telegram: "https://t.me/ShahBaz_Team_ir",
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeOptions = [
    {
      value: "light",
      label: "حالت روشن",
      description: "استفاده از تم روشن",
      icon: Sun,
    },
    {
      value: "dark", 
      label: "حالت تاریک",
      description: "استفاده از تم تاریک",
      icon: Moon,
    },
    {
      value: "system",
      label: "تنظیمات سیستم",
      description: "تطبیق با تنظیمات سیستم عامل",
      icon: Monitor,
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/zingo-logo.png" alt="زینگو" className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-primary/20 ring-1 ring-primary/30 transition-transform group-hover:rotate-6" />
            <h1 className="text-2xl md:hidden lg:block md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              زینگو
            </h1>
          </Link>
          <div className="md:hidden flex items-center">
            <Link href="/search">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-6 w-6" />
              </Button>
            </Link>
          </div>
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
              <div className="space-y-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-right ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              isSelected ? 'text-primary' : 'text-foreground'
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Develooper Section */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                توسعه دهندگان
              </CardTitle>
              <CardDescription className="text-base">
                تیم توسعه دهندگان زینگو
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {developers.map((dev, index) => (
                <div key={dev.name} className="space-y-4">
                  {index > 0 && <Separator className="my-4" />}
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="font-semibold text-xl">{dev.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{dev.role}</p>
                      </div>
                      
                      {/* Social Icons */}
                      <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-border/50">
                        {dev.telegram && (
                          <a
                            href={dev.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-muted rounded-lg transition-colors shadow-sm min-w-fit"
                            title="Telegram"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Telegram</span>
                          </a>
                        )}
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
                    <h3 className="font-semibold text-lg">زینگو</h3>
                  </div>
                  <p className="text-muted-foreground">دانلود رایگان فیلم و سریال با کیفیت بالا و سریع و بدون سابقه حساب و هیچگونه هزینه ای و بدون سانسور.</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-1">نسخه</p>
                  <p className="text-sm text-primary">{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg 
                  className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                راهنمای استفاده
              </CardTitle>
              <CardDescription className="text-base">
                نحوه استفاده از زینگو
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">                
                <Link 
                  href="/help"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg 
                    className="w-5 h-5 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">مشاهده راهنمای کامل</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card className="group hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                مستندات API
              </CardTitle>
              <CardDescription className="text-base">
                راهنمای کامل API برای توسعه‌دهندگان
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Link 
                  href="/api-docs"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg 
                    className="w-5 h-5 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="font-medium">مشاهده مستندات API</span>
                </Link>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    دسترسی به مستندات کامل API شامل endpoints، parameters، و نمونه‌های کد برای فیلم‌ها، سریال‌ها، فصل‌ها و جستجو
                  </p>
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
                قوانین و مقررات استفاده از زینگو
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
                  href="https://t.me/ShahBaz_Team_ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="font-medium">تلگرام</span>
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
