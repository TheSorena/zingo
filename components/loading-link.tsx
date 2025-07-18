'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoading } from './loading-provider';
import { ComponentProps } from 'react';

type LoadingLinkProps = ComponentProps<typeof Link> & {
  skipLoading?: boolean;
};

export function LoadingLink({ 
  href, 
  onClick, 
  skipLoading = false, 
  children, 
  ...props 
}: LoadingLinkProps) {
  const pathname = usePathname();
  const { setIsLoading } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Skip loading if explicitly requested or if it's the same page
    if (skipLoading || pathname === href) {
      return;
    }

    // Skip loading for external links
    if (typeof href === 'string' && (href.startsWith('http') || href.startsWith('mailto'))) {
      return;
    }

    // Show loading state
    setIsLoading(true);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
} 