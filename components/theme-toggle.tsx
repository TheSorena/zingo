"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">تغییر تم</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px] rtl">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex flex-row-reverse">
          <span>روشن</span>
          <Sun className="mr-2 h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex flex-row-reverse">
          <span>تاریک</span>
          <Moon className="mr-2 h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex flex-row-reverse">
          <span>سیستم</span>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 