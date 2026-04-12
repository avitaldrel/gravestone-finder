"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportSummaryProps {
  successCount: number;
  errorCount: number;
  warnings: string[];
}

/**
 * ImportSummary (D-03)
 *
 * Displays import results: success count, error count with badges,
 * and any warnings (e.g., unrecognized columns from D-11).
 */
export function ImportSummary({
  successCount,
  errorCount,
  warnings,
}: ImportSummaryProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-normal" role="alert">
          {errorCount === 0 ? (
            <>
              <Badge>{successCount}</Badge>
              <span>flags imported successfully</span>
            </>
          ) : (
            <>
              <Badge>{successCount}</Badge>
              <span>flags imported,</span>
              <Badge variant="destructive">{errorCount}</Badge>
              <span>errors found</span>
            </>
          )}
        </div>

        {warnings.length > 0 &&
          warnings.map((warning, idx) => (
            <Alert key={idx} className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {warning}
              </AlertDescription>
            </Alert>
          ))}
      </CardContent>
    </Card>
  );
}
