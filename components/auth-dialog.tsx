'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from './auth-provider';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (name.trim().length < 2) {
      setError('نام کاربری باید حداقل ۲ حرف باشد');
      return;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ حرف باشد');
      return;
    }
    setBusy(true);
    const err = tab === 'login' ? await login(name.trim(), password) : await register(name.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setName('');
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-5">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-extrabold text-gradient-warm">
            حساب کاربری زینگو
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-full bg-muted/60 p-1 text-sm font-bold">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`rounded-full py-2 transition-all ${
              tab === 'login' ? 'bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow' : 'text-muted-foreground'
            }`}
          >
            ورود
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`rounded-full py-2 transition-all ${
              tab === 'register' ? 'bg-gradient-to-l from-amber-500 to-rose-500 text-white shadow' : 'text-muted-foreground'
            }`}
          >
            ثبت‌نام
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام کاربری"
            maxLength={24}
            autoComplete="username"
            className="h-11 rounded-2xl"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور (حداقل ۶ حرف)"
            type="password"
            maxLength={72}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            className="h-11 rounded-2xl"
            dir="ltr"
          />
          {error && (
            <p className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 ring-1 ring-red-500/25">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-full bg-gradient-to-l from-amber-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:opacity-90"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tab === 'login' ? (
              <>
                <LogIn className="ml-2 h-4 w-4" />
                ورود به حساب
              </>
            ) : (
              <>
                <UserPlus className="ml-2 h-4 w-4" />
                ساخت حساب
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          با حساب کاربری، علاقه‌مندی‌ها در همه دستگاه‌ها ذخیره می‌شود
          <br />
          و نظرهایتان با نشان عضو ثبت می‌شود
        </p>
      </DialogContent>
    </Dialog>
  );
}
