import { describe, it, expect } from "vitest";
import { detectHeaders } from "../detect-headers";

describe("detectHeaders", () => {
  it("detects exact header names", () => {
    const result = detectHeaders(["Name", "Row", "Position"]);
    expect(result).toEqual({
      hasHeaders: true,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: [],
    });
  });

  it("detects headers case-insensitively", () => {
    const result = detectHeaders(["name", "row", "position"]);
    expect(result).toEqual({
      hasHeaders: true,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: [],
    });
  });

  it("identifies unrecognized columns (D-11)", () => {
    const result = detectHeaders([
      "Name",
      "Row",
      "Position",
      "Branch",
      "Notes",
    ]);
    expect(result).toEqual({
      hasHeaders: true,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: ["Branch", "Notes"],
    });
  });

  it("handles reordered columns", () => {
    const result = detectHeaders(["Position", "Name", "Row"]);
    expect(result).toEqual({
      hasHeaders: true,
      columnMap: { name: 1, row: 2, position: 0 },
      unrecognized: [],
    });
  });

  it("returns hasHeaders false when first row is data (no matching headers)", () => {
    const result = detectHeaders(["John Smith", "A", "1"]);
    expect(result).toEqual({
      hasHeaders: false,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: [],
    });
  });

  it("returns hasHeaders false when only 1 header matches", () => {
    const result = detectHeaders(["Name", "Rank", "Serial"]);
    expect(result).toEqual({
      hasHeaders: false,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: [],
    });
  });

  it("handles mixed case header names", () => {
    const result = detectHeaders(["NAME", "ROW", "POSITION"]);
    expect(result).toEqual({
      hasHeaders: true,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: [],
    });
  });

  it("handles empty first row", () => {
    const result = detectHeaders([]);
    expect(result).toEqual({
      hasHeaders: false,
      columnMap: { name: 0, row: 1, position: 2 },
      unrecognized: [],
    });
  });
});
