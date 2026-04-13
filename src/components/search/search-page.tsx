"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useDebounce } from "@/hooks/use-debounce";
import { FUSE_OPTIONS } from "@/lib/search/fuse-config";
import type { Flag } from "@/lib/types/flag";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { NoResults } from "@/components/search/no-results";
import { NoData } from "@/components/search/no-data";

interface SearchPageProps {
  flags: Flag[];
}

export function SearchPage({ flags }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

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
      <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6 sm:pt-24 md:pt-32">
        <NoData />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6 sm:pt-24 md:pt-32">
      <h1 className="text-center text-3xl font-semibold leading-tight">
        Field of Flags
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
    </div>
  );
}
