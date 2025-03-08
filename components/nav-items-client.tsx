'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

export function NavItems() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-4 space-x-reverse">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center space-x-2 space-x-reverse text-sm font-medium transition-colors hover:text-primary ${
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-primary" : ""}`} />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
} 