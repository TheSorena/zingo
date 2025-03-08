'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Info, Check, ChevronRight, Lock } from "lucide-react";
import { motion, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";
import { toast, Toaster } from "sonner";

export default function PrivacyPage() {
  const router = useRouter();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollY = useMotionValue(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('privacy-accepted');
      if (accepted === 'true') {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }

    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      
      // Save to localStorage
      localStorage.setItem('privacy-accepted', 'true');

      // Show success toast
      toast.success('قوانین با موفقیت پذیرفته شد', {
        duration: 2000,
      });

      // Wait for 2.5 seconds before redirecting
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Redirect after delay
      router.replace('/');

    } catch (error) {
      console.error('Error saving acceptance:', error);
      toast.error('خطا در ذخیره‌سازی', {
        description: 'لطفاً دوباره تلاش کنید',
        duration: 3000,
      });
      // Reset on error
      localStorage.removeItem('privacy-accepted');
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const parallaxY = useTransform(
    scrollY,
    [0, 500],
    [0, -50]
  );

  return (
    <main className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary/30 z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <motion.div
          style={{ y: parallaxY }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-grid-primary/5" />
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
              opacity: [0.3, 0.5]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent bg-[size:100%_100%] bg-no-repeat"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background backdrop-blur-[1px]" />
      </div>
      
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-8 md:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-4xl"
        >
          <Card className="backdrop-blur-xl bg-background/95 border-2 shadow-2xl shadow-primary/5 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />

            <CardHeader className="text-center space-y-8 pb-10 px-6 md:px-8 lg:px-12 relative">
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 1
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-xl" />
                  <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner relative backdrop-blur-sm border border-primary/20">
                    <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary drop-shadow-lg" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-primary/20 border-dashed"
                    />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4 relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                    قوانین و حریم خصوصی
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg lg:text-xl text-muted-foreground/90">
                    لطفاً قبل از استفاده از سایت، قوانین زیر را مطالعه کنید
                  </CardDescription>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent className="space-y-10 px-6 md:px-8 lg:px-12 relative">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-10 text-right"
              >
                <div className="space-y-6">
                  <motion.div 
                    variants={item}
                    className="flex items-center gap-3 border-b pb-3 group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <Lock className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      قوانین و مقررات:
                    </h2>
                  </motion.div>
                  <ul className="space-y-4">
                    {[
                      'تمام فیلم ها و سریال ها بدون نیاز به خرید اشتراک می باشند.',
                      'تمامی محتوا بدون سانسور هستند. سانسور نمیکنیم، چون حق انتخاب با شماست.',
                      'این وبسایت نیازی به ثبت نام ندارد و شما می توانید آزادانه از آن استفاده کنید.',
                      'اشتراک گذاری لینک سایت و لینک دانلود فیلم ها برای دوستانتان کاملا مجاز است.',
                      'ما فقط اطلاعات مرورگر شما را ذخیره می کنیم.',
                      'امکان دانلود مستقیم فیلم‌ها و سریال‌ها با کیفیت‌های مختلف فراهم است.',
                      'امکان پخش آنلاین محتوا با VLC Player برای راحتی شما فراهم شده است.',
                      'تمامی فیلم‌ها و سریال‌ها دارای اطلاعات کامل مانند امتیاز IMDB، مدت زمان و ژانر هستند.',
                      'جستجوی پیشرفته برای یافتن سریع فیلم‌ها و سریال‌های مورد نظر شما.',
                      'دسترسی به تریلر و تیزر فیلم‌ها برای آشنایی بیشتر با محتوا.',
                      'به روز رسانی مداوم محتوا و اضافه شدن فیلم‌های جدید.',
                      'پشتیبانی از تمامی دستگاه‌ها و مرورگرها برای دانلود و پخش.',
                      'امکان کپی لینک‌های دانلود برای استفاده در دانلود منیجرها.'
                    ].map((text, index) => (
                      <motion.li 
                        key={index}
                        variants={item}
                        className="group flex items-start gap-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-500 border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                      >
                        <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-base md:text-lg text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">
                          {text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <motion.div variants={item} className="space-y-6">
                  <div className="flex items-center gap-3 border-b pb-3 group">
                    <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <Info className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      درباره سینما پلاس:
                    </h2>
                  </div>
                  <div className="space-y-4 text-base md:text-lg text-muted-foreground bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <p className="leading-relaxed">سینما پلاس یک پلتفرم پیشرفته استریم و دانلود فیلم و سریال است که با هدف ارائه محتوای با کیفیت و بدون محدودیت ایجاد شده است.</p>
                    <p className="leading-relaxed">ما با ارائه جدیدترین فیلم‌ها و سریال‌ها در کیفیت‌های مختلف، امکان دانلود مستقیم و پخش آنلاین، و رابط کاربری مدرن و زیبا، بهترین تجربه را برای شما فراهم می‌کنیم.</p>
                    <p className="leading-relaxed">تیم ما به طور مداوم در حال بروزرسانی محتوا، بهبود کیفیت خدمات و اضافه کردن قابلیت‌های جدید است.</p>
                    <p className="leading-relaxed">با امکاناتی مانند جستجوی پیشرفته، دسته‌بندی ژانرها، نمایش امتیازهای IMDB، و پشتیبانی از VLC Player، تجربه تماشای فیلم و سریال را برای شما لذت‌بخش‌تر کرده‌ایم.</p>
                    <p className="leading-relaxed">از اینکه سینما پلاس را انتخاب کرده‌اید، سپاسگزاریم.</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                variants={item}
                className="flex flex-col items-center gap-4 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-muted-foreground/80 text-center mb-2"
                >
                  با کلیک روی دکمه زیر، شما تمامی قوانین را مطالعه کرده و می‌پذیرید
                </motion.div>

                <Button 
                  size="lg"
                  onClick={handleAccept}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  disabled={isLoading}
                  className="relative group w-full sm:w-auto text-lg px-12 py-7 bg-primary hover:bg-primary/90 transition-all duration-500 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-foreground/10 via-primary-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 rounded-2xl bg-primary/50 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10" />
                  
                  <div className="relative flex items-center gap-2">
                    <motion.span
                      animate={{ x: isHovered && !isLoading ? -10 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10 font-semibold"
                    >
                      {isLoading ? 'در حال پردازش...' : 'قبول قوانین و ادامه'}
                    </motion.span>
                    {!isLoading && (
                      <motion.div
                        animate={{ 
                          x: isHovered ? 5 : -10,
                          opacity: isHovered ? 1 : 0,
                          scale: isHovered ? 1 : 0.8
                        }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary-foreground/50 to-transparent"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ 
                      scaleX: isHovered && !isLoading ? 1 : 0,
                      opacity: isHovered && !isLoading ? 1 : 0
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-xs text-muted-foreground/60 text-center mt-2"
                >
                  شما می‌توانید در هر زمان به این صفحه بازگردید
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Toaster component */}
      <Toaster richColors position="top-center" />
    </main>
  );
} 