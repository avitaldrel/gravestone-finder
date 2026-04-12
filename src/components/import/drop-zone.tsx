"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { parseSpreadsheet } from "@/lib/parsing/parse-spreadsheet";
import { validateRows } from "@/lib/parsing/validate-flags";
import type { ImportResult } from "@/lib/types/import-result";

type DropZoneState = "idle" | "dragActive" | "processing" | "success" | "error";

interface DropZoneProps {
  onImportReady: (result: ImportResult) => void;
  isProcessing?: boolean;
  successCount?: number;
}

/**
 * DropZone (D-01, D-02)
 *
 * Drag-and-drop file upload component with visual state feedback.
 * Accepts CSV and Excel files up to 5MB.
 * On file drop, immediately parses and validates the file (D-02).
 *
 * T-01-09: File size limit at 5MB, file type restricted to spreadsheet formats.
 */
export function DropZone({
  onImportReady,
  isProcessing = false,
  successCount,
}: DropZoneProps) {
  const [state, setState] = useState<DropZoneState>(
    successCount !== undefined && successCount > 0 ? "success" : "idle",
  );
  const [message, setMessage] = useState("");
  const [importedCount, setImportedCount] = useState(successCount ?? 0);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Handle file rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorCode = rejection.errors[0]?.code;

        if (errorCode === "file-too-large") {
          setMessage("File is too large. Maximum file size is 5MB.");
        } else if (
          errorCode === "file-invalid-type"
        ) {
          setMessage(
            "Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls, .ods).",
          );
        } else {
          setMessage(rejection.errors[0]?.message ?? "File could not be accepted.");
        }
        setState("error");
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setState("processing");
      setMessage("Importing flag data...");

      try {
        // D-02: Immediate processing on file drop
        const rawRows = await parseSpreadsheet(file);
        const result = validateRows(rawRows);

        if (result.valid.length === 0 && result.errors.length > 0) {
          setMessage(
            "No valid flag data found in this file. Every row had errors. Review the error details below.",
          );
          setState("error");
          // Still notify parent so errors can be displayed
          onImportReady(result);
          return;
        }

        if (result.valid.length === 0 && result.errors.length === 0) {
          setMessage(
            "Could not find the required columns (Name, Row, Position). Make sure your file has these columns or download the sample template.",
          );
          setState("error");
          return;
        }

        setImportedCount(result.valid.length);
        // Parent handles persistence and may show dialog
        onImportReady(result);

        // Set success state if no errors
        if (result.errors.length === 0) {
          setState("success");
        } else {
          // Partial success -- revert to idle so summary shows
          setState("idle");
        }
      } catch {
        setMessage(
          "Could not read this file. Please check that it is a valid spreadsheet and try again.",
        );
        setState("error");
      }
    },
    [onImportReady],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isProcessing,
  });

  // Determine current visual state
  const currentState: DropZoneState = isProcessing
    ? "processing"
    : isDragActive
      ? "dragActive"
      : state;

  return (
    <div
      {...getRootProps()}
      className={`
        flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl p-6 text-center transition-colors
        ${
          currentState === "idle"
            ? "border-2 border-dashed border-border bg-muted/50"
            : currentState === "dragActive"
              ? "border-2 border-dashed border-primary bg-primary/5"
              : currentState === "processing"
                ? "border-2 border-solid border-primary bg-muted/50"
                : currentState === "success"
                  ? "border-2 border-solid border-emerald-600 bg-emerald-600/5"
                  : "border-2 border-solid border-destructive bg-destructive/5"
        }
      `}
    >
      <input {...getInputProps()} />

      {currentState === "idle" && (
        <>
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Drop your spreadsheet file here
            </p>
            <p className="text-sm font-normal text-muted-foreground">
              Drag and drop a CSV or Excel file, or click to browse. Accepts
              .csv, .xlsx, .xls, and .ods files.
            </p>
          </div>
        </>
      )}

      {currentState === "dragActive" && (
        <>
          <Upload className="h-8 w-8 text-primary" />
          <p className="text-sm font-semibold text-primary">
            Drop file to import
          </p>
        </>
      )}

      {currentState === "processing" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">
            Importing flag data...
          </p>
        </>
      )}

      {currentState === "success" && (
        <>
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-600">
            {importedCount} flags imported successfully
          </p>
        </>
      )}

      {currentState === "error" && (
        <>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-semibold text-destructive">{message}</p>
        </>
      )}
    </div>
  );
}
