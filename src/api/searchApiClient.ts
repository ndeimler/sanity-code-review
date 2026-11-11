export interface Cat {
  breed: string;
  country: string;
  origin: string;
  "body type": string;
  coat: string;
  pattern: string;
}

// shortcut: unbounded in-memory cache that lives until page reload, add a TTL/size cap if this runs long-lived
const cache = new Map<string, Cat[]>();

export function clearSearchCache() {
  cache.clear();
}

export async function fetchSearchResultsFromAPI(searchTerm: string, signal?: AbortSignal): Promise<Cat[]> {
  const key = searchTerm.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  // Note: this API seems a bit unstable and sometimes it takes a long time to respond, especially
  // for broad searches
  return fetch(
    `https://cat-api.sanity.build/cats?query=${encodeURIComponent(searchTerm)}`,
    { signal }
  ).then((res) => {
    if (!res.ok) throw new Error(`Cat API request failed: ${res.status}`);
    return res.json();
  }).then((cats: Cat[]) => {
    // the API matches the query against every field, we only want breed matches
    const hits = cats.filter((cat) => cat.breed.toLowerCase().includes(key));
    // only successful responses are cached, so errors and aborts get retried
    cache.set(key, hits);
    return hits;
  })
}
