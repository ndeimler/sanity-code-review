import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchSearchResultsFromAPI, clearSearchCache } from "./searchApiClient";

const cat = (breed: string) => ({ breed, country: "", origin: "", "body type": "", coat: "", pattern: "" });

function mockFetch(response: Partial<Response>) {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearSearchCache();
});

describe("fetchSearchResultsFromAPI", () => {
  it("url-encodes the term and passes the abort signal", async () => {
    const fn = mockFetch({ ok: true, json: async () => [] });
    const { signal } = new AbortController();
    await fetchSearchResultsFromAPI("maine coon", signal);
    expect(fn).toHaveBeenCalledWith(
      "https://cat-api.sanity.build/cats?query=maine%20coon",
      { signal }
    );
  });

  it("keeps only cats whose breed contains the term (case-insensitive)", async () => {
    mockFetch({ ok: true, json: async () => [cat("Siamese"), cat("Persian"), cat("Maine Coon")] });
    const results = await fetchSearchResultsFromAPI("SIAM");
    expect(results.map((c) => c.breed)).toEqual(["Siamese"]);
  });

  it("throws on a non-2xx response", async () => {
    mockFetch({ ok: false, status: 500 });
    await expect(fetchSearchResultsFromAPI("sia")).rejects.toThrow("500");
  });

  it("serves repeat searches (any casing) from cache without refetching", async () => {
    const fn = mockFetch({ ok: true, json: async () => [cat("Siamese")] });
    await fetchSearchResultsFromAPI("siam");
    const again = await fetchSearchResultsFromAPI("SIAM");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(again.map((c) => c.breed)).toEqual(["Siamese"]);
  });

  it("does not cache failures", async () => {
    const fn = mockFetch({ ok: false, status: 500 });
    await expect(fetchSearchResultsFromAPI("siam")).rejects.toThrow();
    await expect(fetchSearchResultsFromAPI("siam")).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
