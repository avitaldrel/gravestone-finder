"use client";

import { Search } from "lucide-react";
import Link from "next/link";

interface NoResultsProps {
  query: string;
}

export function NoResults({ query: _query }: NoResultsProps) {
  return (
    <div className="text-center">
      <Search className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-semibold leading-tight">
        No flags found
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t find a match for that name. Try searching by last name
        only, or check for alternate spellings.
      </p>
      <Link
        href="/directory"
        className="mt-3 inline-block text-sm text-primary hover:underline"
      >
        Browse the full directory
      </Link>
    </div>
  );
}
