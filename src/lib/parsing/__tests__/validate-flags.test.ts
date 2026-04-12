import { describe, it, expect } from "vitest";
import { validateRows } from "../validate-flags";
import type { ImportResult } from "@/lib/types/import-result";

describe("validateRows", () => {
  describe("valid data", () => {
    it("returns valid FlagInsert array for well-formed data with headers", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        ["Jane Doe", "B", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.valid[0]).toEqual({
        name: "John Smith",
        row_label: "A",
        position: 1,
      });
      expect(result.valid[1]).toEqual({
        name: "Jane Doe",
        row_label: "B",
        position: 2,
      });
    });

    it("normalizes numeric row identifiers", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "1", 3],
        ["Jane Doe", "2", 4],
      ];

      const result = validateRows(rawRows);

      expect(result.valid[0]).toEqual({
        name: "John Smith",
        row_label: "A",
        position: 3,
      });
      expect(result.valid[1]).toEqual({
        name: "Jane Doe",
        row_label: "B",
        position: 4,
      });
    });

    it("handles data without header row (assumes Name, Row, Position order)", () => {
      const rawRows: unknown[][] = [
        ["John Smith", "A", 1],
        ["Jane Doe", "B", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(2);
      expect(result.valid[0]).toEqual({
        name: "John Smith",
        row_label: "A",
        position: 1,
      });
    });
  });

  describe("error cases", () => {
    it("reports error for missing name", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["", "A", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].issues).toContain("Name is required");
    });

    it("reports error for missing row", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["Jane Doe", "", 3],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].issues).toContain("Row is required");
    });

    it("reports error for missing position", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["Robert Johnson", "B", ""],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].issues.some((i: string) => i.includes("Position"))).toBe(true);
    });

    it("reports error for non-numeric position", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", "abc"],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].issues.some((i: string) => i.includes("Position"))).toBe(true);
    });

    it("reports error for zero position", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 0],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].issues.some((i: string) => i.includes("Position"))).toBe(true);
    });

    it("reports error for negative position", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", -1],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].issues.some((i: string) => i.includes("Position"))).toBe(true);
    });

    it("uses 1-indexed row numbers in errors", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["Valid Person", "A", 1],
        ["", "B", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(3);
    });
  });

  describe("duplicate detection", () => {
    it("detects duplicate row+position combinations", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        ["Jane Doe", "A", 1],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].issues[0]).toContain("Duplicate position");
      expect(result.errors[0].issues[0]).toContain("Row A");
      expect(result.errors[0].issues[0]).toContain("Position 1");
    });
  });

  describe("empty row handling", () => {
    it("silently skips completely empty rows", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        [undefined, undefined, undefined],
        ["Jane Doe", "B", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("silently skips rows with all blank strings", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        ["", "", ""],
        ["Jane Doe", "B", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("silently skips truly empty arrays", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        [],
        ["Jane Doe", "B", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("warnings", () => {
    it("warns about unrecognized columns (D-11)", () => {
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position", "Branch", "Notes"],
        ["John Smith", "A", 1, "Army", "Some note"],
      ];

      const result = validateRows(rawRows);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain("Unrecognized columns ignored");
      expect(result.warnings[0]).toContain("Branch");
      expect(result.warnings[0]).toContain("Notes");
    });
  });

  describe("fixture integration", () => {
    it("processes sample-valid.csv data correctly (8 valid flags)", () => {
      // Simulates the parsed output from sample-valid.csv
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        ["Jane Doe", "A", 2],
        ["Robert Johnson", "B", 1],
        ["Mary Williams", "B", 2],
        ["James Brown", "C", 1],
        ["Patricia Davis", "C", 2],
        ["Michael Wilson", 1, 3],
        ["Linda Martinez", 2, 4],
      ];

      const result = validateRows(rawRows);

      expect(result.valid).toHaveLength(8);
      expect(result.errors).toHaveLength(0);
      // Numeric rows should be normalized
      expect(result.valid[6].row_label).toBe("A");
      expect(result.valid[7].row_label).toBe("B");
    });

    it("processes sample-with-errors.csv data (has errors)", () => {
      // Simulates the parsed output from sample-with-errors.csv
      const rawRows: unknown[][] = [
        ["Name", "Row", "Position"],
        ["John Smith", "A", 1],
        ["", "A", 2],        // missing name
        ["Jane Doe", "", 3],  // missing row
        ["Robert Johnson", "B", ""], // missing position
        ["Mary Williams", "B", 1],
        ["Valid Person", "C", 1],
        ["Another Valid", "C", 2],
      ];

      const result = validateRows(rawRows);

      expect(result.valid.length).toBeLessThan(7);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
