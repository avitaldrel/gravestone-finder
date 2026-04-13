import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoResults } from "@/components/search/no-results";

describe("NoResults", () => {
  it("shows No flags found heading", () => {
    render(<NoResults query="Zzzznotfound" />);
    expect(screen.getByText("No flags found")).toBeDefined();
  });

  it("shows fallback guidance with spelling tips", () => {
    render(<NoResults query="Zzzznotfound" />);
    expect(screen.getByText(/alternate spellings/i)).toBeDefined();
  });

  it("shows link to /directory", () => {
    render(<NoResults query="Zzzznotfound" />);
    const link = screen.getByRole("link", {
      name: /browse the full directory/i,
    });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/directory");
  });
});
