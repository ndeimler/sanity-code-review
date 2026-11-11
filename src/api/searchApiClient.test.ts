import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchSearchResultsFromAPI, clearSearchCache } from "./searchApiClient";

const cat = (breed: string) => ({ breed, country: "", origin: "", "body type": "", coat: "", pattern: "" });
const ALL = [cat("Siamese"), cat("Persian"), cat("Maine Coon")];

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
  it("keeps only cats whose breed contains the term (case-insensitive)", async () => {
    mockFetch({ ok: true, json: async () => ALL });
    const results = await fetchSearchResultsFromAPI("SIAM");
    expect(results.map((c) => c.breed)).toEqual(["Siamese"]);
  });

  it("fetches the full list once and reuses it for every search", async () => {
    const fn = mockFetch({ ok: true, json: async () => ALL });
    await fetchSearchResultsFromAPI("si");
    await fetchSearchResultsFromAPI("maine");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("https://cat-api.sanity.build/cats?query=");
  });

  it("shares one request between concurrent searches", async () => {
    const fn = mockFetch({ ok: true, json: async () => ALL });
    await Promise.all([fetchSearchResultsFromAPI("si"), fetchSearchResultsFromAPI("ma")]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("rejects with AbortError if the search was aborted while waiting", async () => {
    mockFetch({ ok: true, json: async () => ALL });
    const controller = new AbortController();
    const pending = fetchSearchResultsFromAPI("si", controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("throws on a non-2xx response and does not cache the failure", async () => {
    const fn = mockFetch({ ok: false, status: 500 });
    await expect(fetchSearchResultsFromAPI("siam")).rejects.toThrow("500");
    await expect(fetchSearchResultsFromAPI("siam")).rejects.toThrow("500");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
