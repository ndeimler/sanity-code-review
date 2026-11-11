import { useState, useEffect } from "react";
import { fetchSearchResultsFromAPI, type Cat } from "./searchApiClient";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

/**
 * Search box for cat breeds.
 *
 * As the user types, the term is trimmed and (once it has MIN_CHARS characters)
 * sent to the cat API after a short debounce. The component shows a feedback
 * message (hint / loading / "You searched for ..."), then either the matching
 * breeds, "No hits", or an error message if the request failed.
 */
export function CatSearch() {
  const [hits, setHits] = useState<Cat[]>([]); // breeds returned for the current term
  const [loading, setLoading] = useState(false); // true while a search is pending or in flight
  const [error, setError] = useState<string | null>(null); // user-facing message if the request failed
  const [searchTerm, setSearchTerm] = useState(""); // raw input value

  // remove whitespace from the searched term
  const term = searchTerm.trim()
  const valid = term.length >= MIN_CHARS;

  // Runs whenever the term changes: resets state, then fires a debounced search.
  useEffect(() => {
    // Always start from a clean slate: no stale results or error.
    setHits([]);
    setError(null);

    // Too short to search: make sure we aren't left showing "Loading...".
    if (!valid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Lets the cleanup below cancel an in-flight request when the term changes.
    const controller = new AbortController();
    // debounce: only search once typing pauses for 300ms
    const timeout = setTimeout(() => {
      fetchSearchResultsFromAPI(term, controller.signal)
        .then((results) => {
          setHits(results);
          setLoading(false);
        })
        .catch((error) => {
          // Aborted by the cleanup (newer search started): not a real failure.
          if (error.name === "AbortError") return;
          console.error(error);
          setLoading(false);
          setError("Something went wrong while searching for cat breeds. Please try again.");
        })
    }, DEBOUNCE_MS);

    // Cleanup: cancel the pending timer and any in-flight request so stale
    // responses can't overwrite results for a newer term.
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm, valid]);

  return (
    <div className="cat-search">
      <div className="cat-search__input">
        <h2 id="cat-search-heading">Search for cat breed</h2>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-labelledby="cat-search-heading"
        />
      </div>
      <div className="cat-search__feedback" aria-live="polite">
        <p>
        {!valid
          ? "Type at least two characters to start searching"
          : loading
          ? "Loading..."
          : `You searched for ${term}`}
        </p>
      </div>
      <div className="cat-search__results">
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <ul>
            {hits.length > 0
              ? hits.map((hit, i) => <li key={`${hit.breed}-${i}`} className="cat-search__result"><span aria-hidden="true">🐈</span> {hit.breed}</li>)
              : valid && "No hits"}
          </ul>
        )}
      </div>
    </div>
  );
}
