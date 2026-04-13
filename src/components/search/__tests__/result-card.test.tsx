import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard } from "@/components/search/result-card";

describe("ResultCard", () => {
  const flag = {
    id: 1,
    name: "John Smith",
    row_label: "B",
    position: 7,
    created_at: "",
  };

  it("displays veteran name", () => {
    render(<ResultCard flag={flag} />);
    expect(screen.getByText("John Smith")).toBeDefined();
  });

  it("displays location in Row X, Position Y format", () => {
    render(<ResultCard flag={flag} />);
    expect(screen.getByText("Row B, Position 7")).toBeDefined();
  });

  it("renders as a card without icons", () => {
    const { container } = render(<ResultCard flag={flag} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeNull();
  });
});
