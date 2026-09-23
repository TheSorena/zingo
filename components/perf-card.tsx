'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Zap, Gauge, Leaf, Check } from 'lucide-react';
import { usePerf, type PerfMode } from './perf-provider';

const options: { value: PerfMode; label: string; description: string; icon: typeof Zap }[] = [
  {
    value: 'auto',
    label: 'خودکار (پیشنهادی)',
    description: 'گوشی‌های ضعیف خودکار سبک می‌شوند',
    icon: Zap,
  },
  {
    value: 'high',
    label: 'کامل',
    description: 'همه افکت‌ها و انیمیشن‌ها روشن',
    icon: Gauge,
  },
  {
    value: 'low',
    label: 'سبک',
    description: 'بدون بلور و انیمیشن — روان‌ترین حالت',
    icon: Leaf,
  },
];

export function PerfCard() {
  const { mode, low, setMode } = usePerf();

  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
          عملکرد
          {low && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
              حالت سبک فعال است
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-base">
          اگر گوشی شما کند است یا افت فریم می‌بینید، حالت سبک را انتخاب کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = mode === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-right ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
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
  );
}
