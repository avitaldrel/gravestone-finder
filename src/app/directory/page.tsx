"use client";

import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlphaDirectory } from "@/components/directory/alpha-directory";
import { RowDirectory } from "@/components/directory/row-directory";
import { useDemo } from "@/contexts/demo-context";
import type { Flag } from "@/lib/types/flag";
import Link from "next/link";

/**
 * Directory Page (D-14, D-15)
 *
 * Displays all imported flags in two switchable views:
 * - Alphabetical: flags sorted A-Z by name with row/position
 * - By Row: flags grouped by row_label, sorted by position within each group
 *
 * Features:
 * - Print button triggers browser print dialog
 * - Print CSS shows both views, hides interactive elements
 * - Empty state guides user to import page
 * - Demo mode: shows demo flags when no real data exists
 */
export default function DirectoryPage() {
  const [serverFlags, setServerFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDemoActive, demoFlags } = useDemo();

  useEffect(() => {
    async function fetchFlags() {
      try {
        const response = await fetch("/api/flags/import");
        if (response.ok) {
          const data = await response.json();
          setServerFlags(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silently fail -- page will show empty state or demo data
      } finally {
        setIsLoading(false);
      }
    }
    fetchFlags();
  }, []);

  // Use server flags if available, otherwise demo flags if demo is active
  const flags = serverFlags.length > 0 ? serverFlags : isDemoActive ? demoFlags : [];

  // Compute stats
  const uniqueRows = new Set(flags.map((f) => f.row_label));

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold leading-tight">
            Flag Directory
          </h1>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  // Empty state
  if (flags.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold leading-tight">
          Flag Directory
        </h1>
        <div className="py-12 text-center">
          <h2 className="text-xl font-semibold leading-tight">
            No flag data available
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Flag data has not been imported yet. Visit the import page to upload
            a spreadsheet.
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Go to Import Page
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header row: title + print button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold leading-tight">
          Flag Directory
        </h1>
        <Button
          className="no-print"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Print Directory
        </Button>
      </div>

      {/* Data summary */}
      <p className="mt-2 text-sm text-muted-foreground">
        {flags.length} flags across {uniqueRows.size} rows
      </p>

      {/* Tabs for screen view -- hidden entirely in print */}
      <div className="no-print">
        <Tabs defaultValue="alphabetical" className="mt-6">
          <TabsList>
            <TabsTrigger value="alphabetical">Alphabetical</TabsTrigger>
            <TabsTrigger value="by-row">By Row</TabsTrigger>
          </TabsList>

          <TabsContent value="alphabetical">
            <div className="mt-4">
              <AlphaDirectory flags={flags} />
            </div>
          </TabsContent>

          <TabsContent value="by-row">
            <div className="mt-4">
              <RowDirectory flags={flags} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print-only: show both views regardless of active tab */}
      <div className="hidden print:block">
        <div className="mt-4">
          <h2 className="mb-4 text-xl font-semibold leading-tight">
            Alphabetical Listing
          </h2>
          <AlphaDirectory flags={flags} />
        </div>
        <div className="print-section-break mt-4">
          <h2 className="mb-4 text-xl font-semibold leading-tight">
            By Row Listing
          </h2>
          <RowDirectory flags={flags} />
        </div>
      </div>
    </main>
  );
}
