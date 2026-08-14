"use client";

import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { LoadingLink } from "./loading-link";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 right-0 left-0 z-50 px-6">
      <div className="mx-auto max-w-md rounded-full border border-border/60 bg-background/85 shadow-2xl shadow-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="grid h-14 grid-cols-3">
          {navItems.map((item) => (
            <LoadingLink
              key={item.href}
              href={item.href}
              className="flex items-center justify-center"
            >
              <div
                className={`flex flex-col items-center gap-0.5 rounded-full px-5 py-1.5 transition-all duration-300 ${
                  pathname === item.href
                    ? "bg-gradient-to-l from-amber-500/20 to-rose-500/20 text-amber-400 ring-1 ring-primary/30"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon size={20} className="transition-transform hover:scale-110" />
                <span className="text-[11px] font-medium">{item.title}</span>
              </div>
            </LoadingLink>
          ))}
        </div>
      </div>
    </nav>
  );
}