export interface Cat {
  breed: string;
  country: string;
  origin: string;
  "body type": string;
  coat: string;
  pattern: string;
}

const API_URL = import.meta.env.VITE_CAT_API_URL ?? "https://cat-api.sanity.build/cats";

export async function fetchSearchResultsFromAPI(searchTerm: string) {
  // Note: this API seems a bit unstable and sometimes it takes a long time to respond, especially
  // for broad searches
  return fetch(
    `${API_URL}?query=${encodeURIComponent(searchTerm)}`
  ).then((res) => {
    if (!res.ok) throw new Error(`Cat API request failed: ${res.status}`);
    return res.json();
  }).then((cats: Cat[]) =>
    // the API matches the query against every field, we only want breed matches
    cats.filter((cat) =>
      cat.breed.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
}
