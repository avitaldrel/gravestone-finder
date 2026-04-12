import { describe, it, expect } from "vitest";
import { normalizeRowLabel } from "../normalize-row";

describe("normalizeRowLabel", () => {
  describe("letter inputs", () => {
    it("returns uppercase A for 'A'", () => {
      expect(normalizeRowLabel("A")).toBe("A");
    });

    it("uppercases lowercase 'a' to 'A'", () => {
      expect(normalizeRowLabel("a")).toBe("A");
    });

    it("uppercases lowercase 'b' to 'B'", () => {
      expect(normalizeRowLabel("b")).toBe("B");
    });

    it("returns 'Z' for 'Z'", () => {
      expect(normalizeRowLabel("Z")).toBe("Z");
    });

    it("returns 'AA' for 'AA'", () => {
      expect(normalizeRowLabel("AA")).toBe("AA");
    });

    it("uppercases 'aa' to 'AA'", () => {
      expect(normalizeRowLabel("aa")).toBe("AA");
    });
  });

  describe("numeric inputs", () => {
    it("converts '1' to 'A'", () => {
      expect(normalizeRowLabel("1")).toBe("A");
    });

    it("converts '2' to 'B'", () => {
      expect(normalizeRowLabel("2")).toBe("B");
    });

    it("converts '26' to 'Z'", () => {
      expect(normalizeRowLabel("26")).toBe("Z");
    });

    it("converts '27' to 'AA'", () => {
      expect(normalizeRowLabel("27")).toBe("AA");
    });

    it("converts '3' to 'C'", () => {
      expect(normalizeRowLabel("3")).toBe("C");
    });

    it("converts numeric type input to letters", () => {
      expect(normalizeRowLabel(1)).toBe("A");
    });

    it("converts numeric 26 to 'Z'", () => {
      expect(normalizeRowLabel(26)).toBe("Z");
    });
  });

  describe("invalid inputs", () => {
    it("throws for empty string", () => {
      expect(() => normalizeRowLabel("")).toThrow("Invalid row identifier");
    });

    it("throws for '0'", () => {
      expect(() => normalizeRowLabel("0")).toThrow("Invalid row identifier");
    });

    it("throws for '-1'", () => {
      expect(() => normalizeRowLabel("-1")).toThrow("Invalid row identifier");
    });

    it("throws for special characters '@#$'", () => {
      expect(() => normalizeRowLabel("@#$")).toThrow("Invalid row identifier");
    });
  });

  describe("whitespace handling", () => {
    it("trims leading/trailing whitespace", () => {
      expect(normalizeRowLabel("  A  ")).toBe("A");
    });

    it("trims whitespace from numeric input", () => {
      expect(normalizeRowLabel(" 1 ")).toBe("A");
    });
  });
});
