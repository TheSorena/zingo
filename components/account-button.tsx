'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, Heart, LogOut, Crown } from 'lucide-react';
import { useAuth } from './auth-provider';
import { AuthDialog } from './auth-dialog';

export const AVATAR_GRADIENTS = [
  'from-amber-500 to-rose-500',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-700',
  'from-orange-500 to-red-600',
];

export function avatarGradient(color: number): string {
  return AVATAR_GRADIENTS[Math.max(0, Math.min(4, color || 0))];
}

export function AccountButton() {
  const { user, loading, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (loading) {
    return <span className="h-9 w-9 animate-pulse rounded-full bg-muted/60" />;
  }

  if (!user) {
    return (
      <>
        <Button
          onClick={() => setDialogOpen(true)}
          variant="ghost"
          className="h-9 gap-1.5 rounded-full px-3 text-sm font-bold ring-1 ring-border/60 hover:bg-primary/10"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">ورود / ثبت‌نام</span>
        </Button>
        <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="حساب کاربری"
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(user.color)} text-sm font-extrabold text-white shadow-md shadow-primary/25 ring-1 ring-white/20 transition-transform hover:scale-105`}
        >
          {user.name.slice(0, 1)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-right">
          <span className="flex items-center gap-1.5 truncate text-sm font-bold">
            {user.name}
            {user.vip && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
          </span>
          <span className="block text-[11px] font-normal text-muted-foreground">
            {user.vip ? 'عضو ویژه زینگو' : 'عضو زینگو'}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            علاقه‌مندی‌های من
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            پروفایل و تنظیمات
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer text-red-400 focus:text-red-400"
        >
          <LogOut className="ml-2 h-4 w-4" />
          خروج از حساب
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
