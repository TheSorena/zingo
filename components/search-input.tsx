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
    <div className="relative">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${className} pl-4 pr-10 py-2 rounded-full bg-muted/50 focus:bg-muted focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
        onKeyDown={handleSearch}
      />
    </div>
  );
} 