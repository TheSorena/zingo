'use client';

import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { LoadingLink } from "./loading-link";

export function NavItems() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <LoadingLink
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
            pathname === item.href
              ? "bg-primary/15 text-amber-400 ring-1 ring-primary/30"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </LoadingLink>
      ))}
    </nav>
  );
} 