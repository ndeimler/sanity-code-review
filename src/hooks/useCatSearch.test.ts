import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCatSearch, DEBOUNCE_MS } from "./useCatSearch";
import { fetchSearchResultsFromAPI } from "../api/searchApiClient";

vi.mock("../api/searchApiClient");
const fetchMock = vi.mocked(fetchSearchResultsFromAPI);
const cat = (breed: string) => ({ breed, country: "", origin: "", "body type": "", coat: "", pattern: "" });

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock.mockReset();
});
afterEach(() => vi.useRealTimers());

const type = (result: { current: ReturnType<typeof useCatSearch> }, value: string) =>
  act(() => result.current.setSearchTerm(value));

describe("useCatSearch", () => {
  it("does not search below the minimum length", () => {
    const { result } = renderHook(() => useCatSearch());
    type(result, "a");
    act(() => { vi.advanceTimersByTime(DEBOUNCE_MS); });
    expect(result.current.valid).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("debounces, then returns hits", async () => {
    fetchMock.mockResolvedValue([cat("Siamese")]);
    const { result } = renderHook(() => useCatSearch());
    type(result, " sia ");
    expect(result.current.loading).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => { await vi.advanceTimersByTimeAsync(DEBOUNCE_MS); });

    expect(fetchMock).toHaveBeenCalledWith("sia", expect.any(AbortSignal));
    expect(result.current.hits).toEqual([cat("Siamese")]);
    expect(result.current.loading).toBe(false);
  });

  it("sets an error and stops loading when the request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useCatSearch());
    type(result, "sia");
    await act(async () => { await vi.advanceTimersByTimeAsync(DEBOUNCE_MS); });
    expect(result.current.error).toMatch(/something went wrong/i);
    expect(result.current.loading).toBe(false);
  });

  it("aborts the previous request when the term changes", async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCatSearch());
    type(result, "sia");
    await act(async () => { await vi.advanceTimersByTimeAsync(DEBOUNCE_MS); });
    const signal = fetchMock.mock.calls[0][1] as AbortSignal;
    type(result, "siam");
    expect(signal.aborted).toBe(true);
  });
});
