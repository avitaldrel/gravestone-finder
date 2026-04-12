import { read, utils } from "xlsx";

/**
 * Parses a spreadsheet file (CSV or Excel) into an array of arrays.
 *
 * Uses SheetJS to read the file and extract data from the first sheet.
 * Each inner array represents one row of data.
 *
 * @param file - A File object (from file input or drag-and-drop)
 * @returns Array of arrays containing the raw cell values
 * @throws Error with user-friendly message if the file cannot be parsed
 */
export async function parseSpreadsheet(file: File): Promise<unknown[][]> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(buffer), { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
    return rows;
  } catch {
    throw new Error(
      "Could not read this file. Please check that it is a valid spreadsheet and try again.",
    );
  }
}
