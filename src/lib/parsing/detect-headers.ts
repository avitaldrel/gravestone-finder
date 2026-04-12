/**
 * Header detection result.
 */
export interface HeaderDetectionResult {
  /** Whether the first row contains recognizable headers */
  hasHeaders: boolean;
  /** Maps logical column names to their 0-based index in the row */
  columnMap: Record<string, number>;
  /** Column names present in the header row that are not recognized */
  unrecognized: string[];
}

/** The three required column names (lowercase for matching). */
const KNOWN_HEADERS = ["name", "row", "position"] as const;

/** Default column order when no headers are detected. */
const DEFAULT_COLUMN_MAP: Record<string, number> = {
  name: 0,
  row: 1,
  position: 2,
};

/**
 * Detects whether the first row of spreadsheet data contains headers.
 *
 * Rules:
 * - If >= 2 of the known headers (Name, Row, Position) match (case-insensitive),
 *   treat as a header row.
 * - If < 2 match, assume the first row is data and use default column order.
 * - Unrecognized columns are collected and returned for D-11 warning.
 */
export function detectHeaders(firstRow: unknown[]): HeaderDetectionResult {
  if (!firstRow || firstRow.length === 0) {
    return {
      hasHeaders: false,
      columnMap: { ...DEFAULT_COLUMN_MAP },
      unrecognized: [],
    };
  }

  // Normalize cells to lowercase strings for matching
  const cells = firstRow.map((cell) =>
    cell != null ? String(cell).trim().toLowerCase() : "",
  );

  // Count how many known headers match and build column map
  const columnMap: Record<string, number> = {};
  const matchedIndices = new Set<number>();
  let matchCount = 0;

  for (const header of KNOWN_HEADERS) {
    const index = cells.indexOf(header);
    if (index !== -1) {
      columnMap[header] = index;
      matchedIndices.add(index);
      matchCount++;
    }
  }

  if (matchCount >= 2) {
    // Fill in any missing header with a default guess
    for (const header of KNOWN_HEADERS) {
      if (!(header in columnMap)) {
        columnMap[header] = DEFAULT_COLUMN_MAP[header];
      }
    }

    // Collect unrecognized column names (original casing from first row)
    const unrecognized: string[] = [];
    for (let i = 0; i < firstRow.length; i++) {
      if (!matchedIndices.has(i)) {
        const original = firstRow[i] != null ? String(firstRow[i]).trim() : "";
        if (original) {
          unrecognized.push(original);
        }
      }
    }

    return { hasHeaders: true, columnMap, unrecognized };
  }

  // Not enough matches -- assume first row is data
  return {
    hasHeaders: false,
    columnMap: { ...DEFAULT_COLUMN_MAP },
    unrecognized: [],
  };
}
