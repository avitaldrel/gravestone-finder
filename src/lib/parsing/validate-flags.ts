import { z } from "zod";
import type { FlagInsert } from "@/lib/types/flag";
import type { ImportResult, ImportError } from "@/lib/types/import-result";
import { normalizeRowLabel } from "./normalize-row";
import { detectHeaders } from "./detect-headers";

/**
 * Zod schema for validating a single row of flag data.
 */
const flagRowSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .trim(),
  row: z
    .string()
    .min(1, "Row is required")
    .trim(),
  position: z.coerce
    .number()
    .int("Position must be a positive number")
    .positive("Position must be a positive number"),
});

/**
 * Checks whether a row is completely empty (all cells undefined, null, or blank strings).
 */
function isEmptyRow(row: unknown[]): boolean {
  if (row.length === 0) return true;
  return row.every(
    (cell) => cell == null || (typeof cell === "string" && cell.trim() === ""),
  );
}

/**
 * Validates and transforms raw spreadsheet rows into structured flag data.
 *
 * Pipeline:
 * 1. Detect headers in first row
 * 2. Skip header row if detected
 * 3. For each data row:
 *    a. Skip empty rows silently
 *    b. Validate with Zod schema
 *    c. Normalize row labels (numeric -> letter)
 *    d. Check for duplicate positions
 * 4. Return ImportResult with valid flags, errors, and warnings
 *
 * @param rawRows - Array of arrays from parseSpreadsheet
 * @returns ImportResult with valid FlagInsert[], errors, and warnings
 */
export function validateRows(rawRows: unknown[][]): ImportResult {
  const valid: FlagInsert[] = [];
  const errors: ImportError[] = [];
  const warnings: string[] = [];

  if (!rawRows || rawRows.length === 0) {
    return { valid, errors, warnings };
  }

  // Step 1: Detect headers
  const { hasHeaders, columnMap, unrecognized } = detectHeaders(rawRows[0]);
  const startRow = hasHeaders ? 1 : 0;

  // Step 2: Add warning for unrecognized columns (D-11)
  if (unrecognized.length > 0) {
    warnings.push(
      `Unrecognized columns ignored: ${unrecognized.join(", ")}. Only Name, Row, and Position columns are imported.`,
    );
  }

  // Step 3: Track seen positions for duplicate detection
  const seenPositions = new Set<string>();

  // Step 4: Process each data row
  for (let i = startRow; i < rawRows.length; i++) {
    const row = rawRows[i];

    // Skip empty rows silently
    if (!row || isEmptyRow(row)) {
      continue;
    }

    // Extract values using column map
    const rawName = row[columnMap.name];
    const rawRow = row[columnMap.row];
    const rawPosition = row[columnMap.position];

    // Convert values to strings for Zod parsing
    const input = {
      name: rawName != null ? String(rawName) : "",
      row: rawRow != null ? String(rawRow) : "",
      position: rawPosition != null ? rawPosition : "",
    };

    // 1-indexed row number for human-readable error messages
    const humanRowNum = i + 1;

    // Validate with Zod
    const result = flagRowSchema.safeParse(input);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => {
        // Zod coerce produces "Invalid input: expected number, received NaN" for
        // non-numeric strings. Replace with our user-friendly position message.
        if (
          issue.path.includes("position") ||
          (issue.code === "invalid_type" && issue.message.includes("NaN"))
        ) {
          return "Position must be a positive number";
        }
        return issue.message;
      });
      // Deduplicate messages (e.g., multiple position errors collapse to one)
      const uniqueIssues = [...new Set(issues)];
      errors.push({ row: humanRowNum, issues: uniqueIssues });
      continue;
    }

    // Normalize row label
    let rowLabel: string;
    try {
      rowLabel = normalizeRowLabel(result.data.row);
    } catch {
      errors.push({
        row: humanRowNum,
        issues: [`Invalid row identifier: "${result.data.row}"`],
      });
      continue;
    }

    const position = result.data.position;

    // Check for duplicate position
    const positionKey = `${rowLabel}-${position}`;
    if (seenPositions.has(positionKey)) {
      errors.push({
        row: humanRowNum,
        issues: [
          `Duplicate position: Row ${rowLabel}, Position ${position} already assigned`,
        ],
      });
      continue;
    }

    seenPositions.add(positionKey);

    // Add to valid results
    valid.push({
      name: result.data.name,
      row_label: rowLabel,
      position,
    });
  }

  return { valid, errors, warnings };
}
