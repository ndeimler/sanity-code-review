import { useCatSearch } from "../hooks/useCatSearch";

/**
 * Search box for cat breeds. Shows a feedback message (hint / loading /
 * "You searched for ..."), then either the matching breeds, "No hits", or an
 * error message if the request failed. Data logic lives in `useCatSearch`.
 */
export function CatSearch() {
  const { searchTerm, setSearchTerm, term, valid, hits, loading, error } = useCatSearch();

  return (
    <div className="cat-search mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-6">
      <div className="cat-search__input flex flex-col gap-2">
        <h2 id="cat-search-heading" className="text-2xl font-semibold">
          Search for cat breed
        </h2>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-labelledby="cat-search-heading"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="cat-search__feedback text-sm text-gray-600" aria-live="polite">
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
          <p role="alert" className="text-red-600">{error}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {hits.length > 0
              ? hits.map((hit, i) => (
                  <li key={`${hit.breed}-${i}`} className="cat-search__result">
                    <span aria-hidden="true">🐈</span> {hit.breed}
                  </li>
                ))
              : valid && !loading && "No hits"}
          </ul>
        )}
      </div>
    </div>
  );
}
