"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SearchBar({ value, onChange, disabled }: SearchBarProps) {
  return (
    <div className="relative">
      <label htmlFor="flag-search" className="sr-only">
        Search for a veteran&apos;s flag
      </label>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="flag-search"
        type="search"
        placeholder="Search by veteran name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        className="h-12 pl-10 text-base"
      />
    </div>
  );
}
