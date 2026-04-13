import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchPage } from "@/components/search/search-page";
import type { Flag } from "@/lib/types/flag";

const TEST_FLAGS: Flag[] = [
  { id: 1, name: "John Smith", row_label: "A", position: 1, created_at: "" },
  { id: 2, name: "Jane Doe", row_label: "A", position: 2, created_at: "" },
  { id: 3, name: "Robert Johnson", row_label: "B", position: 1, created_at: "" },
  { id: 4, name: "Mary Smith", row_label: "B", position: 2, created_at: "" },
  { id: 5, name: "James Williams", row_label: "C", position: 1, created_at: "" },
  { id: 6, name: "Patricia Brown", row_label: "C", position: 2, created_at: "" },
];

function typeInSearch(value: string) {
  const input = screen.getByPlaceholderText(/search by veteran name/i);
  fireEvent.change(input, { target: { value } });
  act(() => {
    vi.advanceTimersByTime(250);
  });
}

describe("SearchPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no-data state when flags is empty", () => {
    render(<SearchPage flags={[]} />);
    expect(screen.getByText("Event setup in progress")).toBeDefined();
    expect(screen.queryByPlaceholderText(/search by veteran name/i)).toBeNull();
  });

  it("renders idle state with search bar when flags exist", () => {
    render(<SearchPage flags={TEST_FLAGS} />);
    expect(screen.getByText("Field of Flags")).toBeDefined();
    expect(screen.getByPlaceholderText(/search by veteran name/i)).toBeDefined();
    expect(screen.queryByText("No flags found")).toBeNull();
  });

  it("renders result cards when query matches", () => {
    render(<SearchPage flags={TEST_FLAGS} />);
    typeInSearch("Smith");

    expect(screen.getByText("John Smith")).toBeDefined();
    expect(screen.getByText("Mary Smith")).toBeDefined();
    expect(screen.getByText("Row A, Position 1")).toBeDefined();
    expect(screen.getByText("Row B, Position 2")).toBeDefined();
  });

  it("renders not-found state when query has no matches", () => {
    render(<SearchPage flags={TEST_FLAGS} />);
    typeInSearch("Zzzzzznotaname");

    expect(screen.getByText("No flags found")).toBeDefined();
    const link = screen.getByRole("link", {
      name: /browse the full directory/i,
    });
    expect(link.getAttribute("href")).toBe("/directory");
  });

  it("handles fuzzy matching in component", () => {
    render(<SearchPage flags={TEST_FLAGS} />);
    typeInSearch("Smth");

    expect(screen.getByText("John Smith")).toBeDefined();
  });
});
