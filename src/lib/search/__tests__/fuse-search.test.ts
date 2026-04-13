import { describe, it, expect } from "vitest";
import Fuse from "fuse.js";
import { FUSE_OPTIONS } from "@/lib/search/fuse-config";
import type { Flag } from "@/lib/types/flag";

const TEST_FLAGS: Flag[] = [
  { id: 1, name: "John Smith", row_label: "A", position: 1, created_at: "" },
  { id: 2, name: "Jane Doe", row_label: "A", position: 2, created_at: "" },
  { id: 3, name: "Robert Johnson", row_label: "B", position: 1, created_at: "" },
  { id: 4, name: "Mary Smith", row_label: "B", position: 2, created_at: "" },
  { id: 5, name: "James Williams", row_label: "C", position: 1, created_at: "" },
  { id: 6, name: "Patricia Brown", row_label: "C", position: 2, created_at: "" },
];

const fuse = new Fuse(TEST_FLAGS, FUSE_OPTIONS);

describe("Fuse.js search with FUSE_OPTIONS", () => {
  it("returns matching flags for exact name", () => {
    const results = fuse.search("John Smith");
    const names = results.map((r) => r.item.name);
    expect(names).toContain("John Smith");
  });

  it("handles typos: Smth -> Smith", () => {
    const results = fuse.search("Smth");
    const names = results.map((r) => r.item.name);
    expect(names.some((n) => n.includes("Smith"))).toBe(true);
  });

  it("handles typos: Jon -> John", () => {
    const results = fuse.search("Jon");
    const names = results.map((r) => r.item.name);
    expect(names.some((n) => n.includes("John"))).toBe(true);
  });

  it("finds all partial matches for Smith", () => {
    const results = fuse.search("Smith");
    const names = results.map((r) => r.item.name);
    expect(names).toContain("John Smith");
    expect(names).toContain("Mary Smith");
  });

  it("ranks results by match quality", () => {
    const results = fuse.search("Smith");
    expect(results.length).toBeGreaterThanOrEqual(2);
    // Scores are ascending (lower = better match), first result should be best
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score!).toBeGreaterThanOrEqual(results[i - 1].score!);
    }
  });

  it("returns nothing for single character", () => {
    const results = fuse.search("J");
    expect(results).toHaveLength(0);
  });

  it("returns all items for empty query (component filters this)", () => {
    const results = fuse.search("");
    expect(results).toHaveLength(TEST_FLAGS.length);
  });

  it("returns empty array for no match", () => {
    const results = fuse.search("Zzzznotaname");
    expect(results).toHaveLength(0);
  });
});
