"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ImportError } from "@/lib/types/import-result";

interface ErrorListProps {
  errors: ImportError[];
}

/**
 * ErrorList (D-03)
 *
 * Collapsible list of validation errors from an import.
 * Each item shows the row number and issue description.
 * Default open when errors exist.
 */
export function ErrorList({ errors }: ErrorListProps) {
  const [isOpen, setIsOpen] = useState(errors.length > 0);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div role="alert" className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-semibold"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Import Errors
        <Badge variant="destructive">{errors.length}</Badge>
      </button>

      {isOpen && (
        <ul className="ml-6 flex flex-col gap-1">
          {errors.map((error) =>
            error.issues.map((issue, issueIdx) => (
              <li
                key={`${error.row}-${issueIdx}`}
                className="text-sm text-destructive"
              >
                <span className="text-muted-foreground">
                  Row {error.row}:
                </span>{" "}
                {issue}
              </li>
            )),
          )}
        </ul>
      )}
    </div>
  );
}
