"use client";

import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { LoadingLink } from "./loading-link";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 right-0 left-0 z-50 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="grid h-full grid-cols-4 mx-4 md:mx-6 lg:mx-8">
        {navItems.map((item) => (
          <LoadingLink 
            key={item.href} 
            href={item.href} 
            className="flex items-center justify-center"
          >
            <div className={`flex flex-col items-center transition-colors ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon size={20} className="transition-transform hover:scale-110" />
              <span className="text-xs mt-1">{item.title}</span>
            </div>
          </LoadingLink>
        ))}
      </div>
    </nav>
  );
} 