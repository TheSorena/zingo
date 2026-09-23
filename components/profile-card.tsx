'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { User, LogOut, Check, Cloud } from 'lucide-react';
import { useAuth } from './auth-provider';
import { AuthDialog } from './auth-dialog';
import { AVATAR_GRADIENTS, avatarGradient } from './account-button';

export function ProfileCard() {
  const { user, loading, logout, setColor } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
          حساب کاربری
        </CardTitle>
        <CardDescription className="text-base">
          پروفایل، همگام‌سازی علاقه‌مندی‌ها و نظر دادن با نام verified
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 rounded-2xl bg-muted/60" />
          </div>
        ) : !user ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-muted/50 p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-7 w-7" />
            </span>
            <div className="flex-1 text-center sm:text-right">
              <p className="font-bold">وارد حساب شوید</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                علاقه‌مندی‌ها در همه دستگاه‌ها ذخیره می‌شود و نظرهایتان با نشان عضو ثبت می‌شود
              </p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="rounded-full bg-gradient-to-l from-amber-500 to-rose-500 px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:opacity-90"
            >
              ورود / ثبت‌نام
            </Button>
            <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-5">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(user.color)} text-xl font-extrabold text-white shadow-lg`}
              >
                {user.name.slice(0, 1)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-lg font-extrabold">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  عضو زینگو از {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
              <Button
                onClick={() => logout()}
                variant="ghost"
                size="sm"
                className="rounded-full text-red-400 hover:text-red-400 hover:bg-red-500/10 ring-1 ring-red-500/25"
              >
                <LogOut className="ml-1.5 h-4 w-4" />
                خروج
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold">رنگ پروفایل</p>
              <div className="flex items-center gap-2">
                {AVATAR_GRADIENTS.map((g, i) => (
                  <button
                    key={g}
                    onClick={() => setColor(i)}
                    aria-label={`رنگ ${i + 1}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${g} text-white transition-transform hover:scale-110 ${
                      user.color === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                  >
                    {user.color === i && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
              علاقه‌مندی‌های شما با این حساب همگام‌سازی می‌شود
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
