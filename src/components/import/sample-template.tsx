"use client";

import { Download } from "lucide-react";

/**
 * SampleTemplate (D-06)
 *
 * Download link for a sample CSV template with correct headers and example rows.
 * Displayed below the drop zone on the admin page.
 */
export function SampleTemplate() {
  return (
    <div className="flex flex-col gap-1">
      <a
        href="/templates/sample-flags.csv"
        download="sample-flags.csv"
        className="inline-flex items-center gap-1 text-sm font-normal text-primary underline-offset-4 hover:underline"
      >
        <Download className="h-4 w-4" />
        Download sample template
      </a>
      <p className="text-sm font-normal text-muted-foreground">
        Not sure about the format? Download a sample CSV with the correct
        columns.
      </p>
    </div>
  );
}
