'use client';

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function SearchInput({ placeholder = "جستجوی فیلم و سریال...", defaultValue = "", className = "w-64" }: SearchInputProps) {
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="relative group">
      <Search className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
      <input
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${className} pl-4 pr-10 py-2.5 rounded-full bg-muted/50 border border-border/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm`}
        onKeyDown={handleSearch}
      />
    </div>
  );
} 