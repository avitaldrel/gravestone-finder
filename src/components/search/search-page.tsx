"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { List } from "lucide-react";
import Fuse from "fuse.js";
import { useDebounce } from "@/hooks/use-debounce";
import { useDemo } from "@/contexts/demo-context";
import { FUSE_OPTIONS } from "@/lib/search/fuse-config";
import type { Flag } from "@/lib/types/flag";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { NoResults } from "@/components/search/no-results";
import { NoData } from "@/components/search/no-data";

interface SearchPageProps {
  flags: Flag[];
}

export function SearchPage({ flags: serverFlags }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const { isDemoActive, demoFlags } = useDemo();

  // Use demo flags when demo mode is active and no real data exists
  const flags = serverFlags.length > 0 ? serverFlags : isDemoActive ? demoFlags : [];

  const fuse = useMemo(() => new Fuse(flags, FUSE_OPTIONS), [flags]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return fuse.search(debouncedQuery);
  }, [fuse, debouncedQuery]);

  const hasFlags = flags.length > 0;
  const hasQuery = debouncedQuery.trim().length >= 2;
  const hasResults = results.length > 0;

  if (!hasFlags) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 sm:pt-12 md:pt-16">
        <NoData />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 sm:pt-12 md:pt-16">
      <h1 className="text-center text-3xl font-semibold leading-tight">
        Flag Finder
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Search for a veteran&apos;s flag by name
      </p>
      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <div className="mt-6">
        {hasQuery && hasResults && <SearchResults results={results} />}
        {hasQuery && !hasResults && <NoResults query={debouncedQuery} />}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <List className="h-4 w-4" />
          View Full Directory
        </Link>
      </div>
    </div>
  );
}
