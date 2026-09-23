import { cn } from '@/lib/utils';

interface SiteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Original zingo wordmark (pure CSS, no image assets).
 * Replaces the old fork logo everywhere on the site.
 */
export function SiteLogo({ className, size = 'md' }: SiteLogoProps) {
  const text =
    size === 'lg'
      ? 'text-3xl md:text-4xl'
      : size === 'sm'
        ? 'text-xl'
        : 'text-2xl md:text-3xl';
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        dir="ltr"
        aria-label="zingo"
        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-xl font-extrabold text-white shadow-lg shadow-primary/25 ring-1 ring-white/20 ${
          size === 'md' ? 'md:h-10 md:w-10' : ''
        }`}
        style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}
      >
        z
      </span>
      <span
        dir="ltr"
        className={`font-extrabold tracking-[0.18em] text-gradient-zingo ${text}`}
        style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}
      >
        zingo
      </span>
    </span>
  );
}
