'use client';

import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { LoadingLink } from "./loading-link";

export function NavItems() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-4 space-x-reverse">
      {navItems.map((item) => (
        <LoadingLink
          key={item.href}
          href={item.href}
          className={`flex items-center space-x-2 space-x-reverse text-sm font-medium transition-colors hover:text-primary ${
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-primary" : ""}`} />
          <span>{item.title}</span>
        </LoadingLink>
      ))}
    </nav>
  );
} 