import { useState, useEffect } from "react";
import { fetchSearchResultsFromAPI, type Cat } from "../api/searchApiClient";

export const MIN_CHARS = 2;
export const DEBOUNCE_MS = 300;

/**
 * State and data fetching for the cat breed search.
 *
 * The raw input is trimmed and, once it has MIN_CHARS characters, sent to the
 * cat API after a debounce. Newer searches cancel older ones.
 */
export function useCatSearch() {
  const [hits, setHits] = useState<Cat[]>([]); // breeds returned for the current term
  const [loading, setLoading] = useState(false); // true while a search is pending or in flight
  const [error, setError] = useState<string | null>(null); // user-facing message if the request failed
  const [searchTerm, setSearchTerm] = useState(""); // raw input value

  // remove whitespace from the searched term
  const term = searchTerm.trim();
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
    // debounce: only search once typing pauses for DEBOUNCE_MS
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
        });
    }, DEBOUNCE_MS);

    // Cleanup: cancel the pending timer and any in-flight request so stale
    // responses can't overwrite results for a newer term.
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [term, valid]);

  return { searchTerm, setSearchTerm, term, valid, hits, loading, error };
}
