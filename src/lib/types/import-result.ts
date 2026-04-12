import type { FlagInsert } from "./flag";

export interface ImportError {
  row: number;
  issues: string[];
}

export interface ImportResult {
  valid: FlagInsert[];
  errors: ImportError[];
  warnings: string[];
}
