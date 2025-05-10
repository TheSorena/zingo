import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CountrySelectorProps {
  currentCountry: string;
  className?: string;
  isMainContainer?: boolean;
}

const countries = [
  { 
    code: 'ir',
    name: 'ایران',
    flag: 'ir',
    description: 'تماشای کانال‌های تلویزیونی زنده از ایران'
  },
  { 
    code: 'uk',
    name: 'بریتانیا',
    flag: 'gb',
    description: 'تماشای کانال‌های تلویزیونی زنده از بریتانیا'
  },
  { 
    code: 'us',
    name: 'ایالات متحده',
    flag: 'us',
    description: 'تماشای کانال‌های تلویزیونی زنده از ایالات متحده'
  }
];

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

export function CountrySelector({ currentCountry, className, isMainContainer = false }: CountrySelectorProps) {
  if (isMainContainer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              انتخاب منطقه
            </h1>
            <p className="text-muted-foreground text-lg">
              منطقه خود را برای تماشای کانال‌های تلویزیونی زنده انتخاب کنید
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {countries.map((country) => (
              <motion.div key={country.code} variants={item}>
                <Link href={`/tv?c=${country.code}`} className="block">
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:bg-accent transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/20 backdrop-blur-sm group-hover:from-background/60 group-hover:to-background/0 transition-all duration-300" />
                    
                    <div className="relative p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-16 h-16 overflow-hidden rounded-xl border-2 border-white/10">
                          <Image
                            src={`https://flagcdn.com/w160/${country.flag}.png`}
                            alt={country.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {country.name}
                          </h2>
                          <p className="text-muted-foreground">
                            {country.description}
                          </p>
                        </div>
                      </div>

                      <Button 
                        variant="outline"
                        className="w-full bg-background/50 backdrop-blur-sm border-white/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      >
                        مشاهده کانال‌ها
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Compact version for header
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {countries.map((country) => (
          <Link 
            key={country.code} 
            href={`/tv?c=${country.code}`}
          >
            <Button
              variant={currentCountry === country.code ? "default" : "ghost"}
              size="sm"
              className="flex items-center gap-2 text-sm"
            >
              <div className="relative w-4 h-4 overflow-hidden rounded-sm">
                <Image
                  src={`https://flagcdn.com/w40/${country.flag}.png`}
                  alt={country.name}
                  fill
                  className="object-cover"
                />
              </div>
              {country.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
} 