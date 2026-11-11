export interface Cat {
  breed: string;
  country: string;
  origin: string;
  "body type": string;
  coat: string;
  pattern: string;
}

// An empty query returns every cat (~100, ~15KB), so we fetch the list once and filter locally.
// shortcut: cached until page reload, add a TTL if the data can change while the page is open
let allCats: Promise<Cat[]> | null = null;

export function clearSearchCache() {
  allCats = null;
}

/** Starts (or reuses) the one shared request for the full list. Failures are not cached. */
export function prefetchCats(): Promise<Cat[]> {
  // Note: this API seems a bit unstable and sometimes it takes a long time to respond
  allCats ??= fetch("https://cat-api.sanity.build/cats?query=")
    .then((res) => {
      if (!res.ok) throw new Error(`Cat API request failed: ${res.status}`);
      return res.json() as Promise<Cat[]>;
    })
    .catch((error) => {
      allCats = null;
      throw error;
    });
  return allCats;
}

export async function fetchSearchResultsFromAPI(searchTerm: string, signal?: AbortSignal): Promise<Cat[]> {
  const cats = await prefetchCats();
  // the shared request ignores per-search signals, so honour a newer search here
  signal?.throwIfAborted();
  const key = searchTerm.toLowerCase();
  // only breed matches
  return cats.filter((cat) => cat.breed.toLowerCase().includes(key));
}
