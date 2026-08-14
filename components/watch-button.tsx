"use client";

import { Button } from "./ui/button";
import { Play } from "lucide-react";

export function WatchButton() {
  return (
    <Button
      onClick={() => {
        document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="w-full md:w-auto gap-2 bg-primary text-primary-foreground hover:bg-accent shadow-lg shadow-primary/25 transition-all duration-300"
      variant="default"
    >
      <Play className="h-4 w-4" />
      تماشای سریال
    </Button>
  );
} 