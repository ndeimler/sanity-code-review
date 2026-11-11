import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatSearch } from "./CatSearch";
import { useCatSearch } from "../hooks/useCatSearch";

vi.mock("../hooks/useCatSearch");

const state = (over: Partial<ReturnType<typeof useCatSearch>> = {}) =>
  vi.mocked(useCatSearch).mockReturnValue({
    searchTerm: "", setSearchTerm: vi.fn(), term: "", valid: false,
    hits: [], loading: false, error: null, ...over,
  });

describe("CatSearch", () => {
  it("shows the hint when the term is too short", () => {
    state();
    render(<CatSearch />);
    expect(screen.getByText(/at least two characters/i)).toBeInTheDocument();
  });

  it("shows loading in the feedback area", () => {
    state({ searchTerm: "sia", term: "sia", valid: true, loading: true });
    render(<CatSearch />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders hits", () => {
    state({ term: "sia", valid: true, hits: [{ breed: "Siamese" } as never] });
    render(<CatSearch />);
    expect(screen.getByRole("listitem")).toHaveTextContent("Siamese");
  });

  it("shows 'No hits' when valid with no results", () => {
    state({ term: "zzz", valid: true });
    render(<CatSearch />);
    expect(screen.getByText("No hits")).toBeInTheDocument();
  });

  it("renders the error as an alert paragraph instead of a list", () => {
    state({ term: "sia", valid: true, error: "Oops" });
    render(<CatSearch />);
    expect(screen.getByRole("alert").tagName).toBe("P");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
