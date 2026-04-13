"use client";

import type { Flag } from "@/lib/types/flag";
import { ResultCard } from "@/components/search/result-card";

interface SearchResultsProps {
  results: Array<{ item: Flag; score?: number }>;
}

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <div aria-live="polite" role="region">
      <span className="sr-only">
        {results.length} result{results.length !== 1 ? "s" : ""} found
      </span>
      <div className="flex flex-col gap-4">
        {results.map((result) => (
          <ResultCard flag={result.item} key={result.item.id} />
        ))}
      </div>
    </div>
  );
}
