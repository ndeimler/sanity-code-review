import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { fetchSearchResultsFromAPI, type Cat } from "./searchApiClient";

export function CatSearch() {
  const [valid, setValid] = useState(false);
  const [hits, setHits] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const searchTermOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    // leading whitespace is dropped; inner spaces stay because breeds like "Australian Mist" need them
    setSearchTerm(event.target.value.trimStart());
  }, []);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setValid(false);
      setHits([]);
      setLoading(false);
      return;
    }
    setValid(true);
    setLoading(true);
    let ignore = false;
    // debounce: only search once typing pauses for 300ms
    const timeout = setTimeout(() => {
      fetchSearchResultsFromAPI(term)
        .then((hits) => {
          if (!ignore) setHits(hits);
        })
        .catch((error) => {
          if (!ignore) console.error(error);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  return (
    <div>
      <h2 id="cat-search-heading">Search for cat breed</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={searchTermOnChange}
        aria-labelledby="cat-search-heading"
      />
      <div>
        {valid === false
          ? "Type at least two characters to start searching"
          : `You searched for ${searchTerm}`}
      </div>
      <div>
        {loading
          ? "Loading..."
          : hits.length > 0
          ? hits.map((hit, i) => <div key={i}>🐈 {hit.breed}</div>)
          : "No hits"}
      </div>
    </div>
  );
}
