"use client";

import { useState, useEffect, useCallback } from "react";
import { DropZone } from "@/components/import/drop-zone";
import { SampleTemplate } from "@/components/import/sample-template";
import { ImportSummary } from "@/components/import/import-summary";
import { ErrorList } from "@/components/import/error-list";
import { ImportModeDialog } from "@/components/import/import-mode-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Flag } from "@/lib/types/flag";
import type { ImportResult } from "@/lib/types/import-result";

/**
 * Admin Page (D-07)
 *
 * Single admin page with import zone at top, summary below.
 * Handles the complete import flow:
 * 1. File drop -> parse -> validate (DropZone)
 * 2. If data exists -> show ImportModeDialog (D-13)
 * 3. POST to /api/flags/import with chosen mode
 * 4. Display results (ImportSummary, ErrorList, data table)
 */
export default function AdminPage() {
  const [existingFlags, setExistingFlags] = useState<Flag[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [pendingResult, setPendingResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | undefined>(
    undefined,
  );
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch existing flags on mount
  const fetchFlags = useCallback(async () => {
    try {
      const response = await fetch("/api/flags/import");
      if (response.ok) {
        const data = await response.json();
        setExistingFlags(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silently fail -- admin page still works, just won't show existing data
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  // Persist flags to Supabase via API route
  const persistFlags = async (
    result: ImportResult,
    mode: "replace" | "merge",
  ) => {
    setIsProcessing(true);
    setApiError(null);

    try {
      const response = await fetch("/api/flags/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flags: result.valid, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(
          data.error ??
            "Could not save flag data. Please check your internet connection and try again.",
        );
        return;
      }

      setSuccessCount(data.count);
      setImportResult(result);

      // Re-fetch to update the data table
      await fetchFlags();
    } catch {
      setApiError(
        "Could not save flag data. Please check your internet connection and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle import ready from DropZone
  const handleImportReady = (result: ImportResult) => {
    if (result.valid.length === 0) {
      // Only errors, no valid data -- show errors without persisting
      setImportResult(result);
      return;
    }

    if (existingFlags.length > 0) {
      // Data exists -- show dialog (D-13)
      setPendingResult(result);
      setShowModeDialog(true);
    } else {
      // No existing data -- import directly with replace mode
      persistFlags(result, "replace");
    }
  };

  // Dialog handlers
  const handleReplace = () => {
    setShowModeDialog(false);
    if (pendingResult) {
      persistFlags(pendingResult, "replace");
      setPendingResult(null);
    }
  };

  const handleMerge = () => {
    setShowModeDialog(false);
    if (pendingResult) {
      persistFlags(pendingResult, "merge");
      setPendingResult(null);
    }
  };

  const handleKeep = () => {
    setShowModeDialog(false);
    setPendingResult(null);
  };

  // Compute unique row count for data summary
  const uniqueRows = new Set(existingFlags.map((f) => f.row_label));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold leading-tight">
        Flag Data Import
      </h1>

      <div className="mt-6 flex flex-col gap-6">
        {/* Drop Zone (D-01, D-02) */}
        <DropZone
          onImportReady={handleImportReady}
          isProcessing={isProcessing}
          successCount={successCount}
        />

        {/* Sample Template (D-06) */}
        <SampleTemplate />

        <Separator />

        {/* API error display */}
        {apiError && (
          <div role="alert" className="text-sm text-destructive">
            {apiError}
          </div>
        )}

        {/* Import Summary (D-03) */}
        {importResult && (
          <ImportSummary
            successCount={importResult.valid.length}
            errorCount={importResult.errors.length}
            warnings={importResult.warnings}
          />
        )}

        {/* Error List (D-03) */}
        {importResult && importResult.errors.length > 0 && (
          <ErrorList errors={importResult.errors} />
        )}

        {/* Data Table or Empty State */}
        {existingFlags.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold leading-tight">
              Imported Flags
            </h2>
            <p className="text-sm text-muted-foreground">
              {existingFlags.length} flags across {uniqueRows.size} rows
            </p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>{flag.name}</TableCell>
                    <TableCell>{flag.row_label}</TableCell>
                    <TableCell>{flag.position}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          !importResult && (
            <div className="py-12 text-center">
              <h2 className="text-xl font-semibold leading-tight">
                No flag data imported yet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a CSV or Excel file with veteran names and field positions
                to get started.
              </p>
            </div>
          )
        )}
      </div>

      {/* Import Mode Dialog (D-13) */}
      <ImportModeDialog
        open={showModeDialog}
        onOpenChange={setShowModeDialog}
        existingCount={existingFlags.length}
        onReplace={handleReplace}
        onMerge={handleMerge}
        onKeep={handleKeep}
      />
    </main>
  );
}
