"use client";

import { Button } from "./ui/button";
import { Play } from "lucide-react";

export function WatchButton() {
  return (
    <Button
      onClick={() => {
        document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="w-full md:w-auto gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
      variant="ghost"
    >
      <Play className="h-4 w-4" />
      تماشای سریال
    </Button>
  );
} 