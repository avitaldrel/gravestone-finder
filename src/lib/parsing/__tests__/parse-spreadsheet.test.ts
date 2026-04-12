import { describe, it, expect, vi } from "vitest";
import { parseSpreadsheet } from "../parse-spreadsheet";

// Mock xlsx module
vi.mock("xlsx", () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

import { read, utils } from "xlsx";

const mockedRead = vi.mocked(read);
const mockedSheetToJson = vi.mocked(utils.sheet_to_json);

function createMockFile(content: string, name = "test.csv"): File {
  const blob = new Blob([content], { type: "text/csv" });
  return new File([blob], name, { type: "text/csv" });
}

describe("parseSpreadsheet", () => {
  it("returns array of arrays from a valid CSV file", async () => {
    const mockRows = [
      ["Name", "Row", "Position"],
      ["John Smith", "A", 1],
      ["Jane Doe", "B", 2],
    ];

    mockedRead.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    } as never);
    mockedSheetToJson.mockReturnValue(mockRows);

    const file = createMockFile("Name,Row,Position\nJohn Smith,A,1\nJane Doe,B,2");
    const result = await parseSpreadsheet(file);

    expect(result).toEqual(mockRows);
    expect(mockedRead).toHaveBeenCalled();
    expect(mockedSheetToJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ header: 1 }),
    );
  });

  it("throws descriptive error on invalid/corrupt file", async () => {
    mockedRead.mockImplementation(() => {
      throw new Error("Bad file");
    });

    const file = createMockFile("corrupt data");
    await expect(parseSpreadsheet(file)).rejects.toThrow(
      "Could not read this file. Please check that it is a valid spreadsheet and try again.",
    );
  });

  it("reads the first sheet of a workbook", async () => {
    const sheet1 = { "!ref": "A1:C2" };
    const sheet2 = { "!ref": "A1:C2" };

    mockedRead.mockReturnValue({
      SheetNames: ["Data", "Summary"],
      Sheets: { Data: sheet1, Summary: sheet2 },
    } as never);
    mockedSheetToJson.mockReturnValue([["Name", "Row", "Position"]]);

    const file = createMockFile("data");
    await parseSpreadsheet(file);

    expect(mockedSheetToJson).toHaveBeenCalledWith(
      sheet1,
      expect.objectContaining({ header: 1 }),
    );
  });
});
