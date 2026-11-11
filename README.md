:heart_eyes_cat: catsearch
---
Find your favorite cat breed with `catsearch`

This is a component that provides a search field for looking up cat breeds based on user input.

How to run the demo:

        pnpm install
        pnpm dev
        
... and then open the browser on the URL you see in the console

Your task is to provide feedback to the person that wrote the code in this repository. Feel free to point out potential bugs, issues and areas of improvements, both in terms of functionality, but also provide feedback about how well the code is to read, reuse and how easy you think it will be to maintain in the future.

## Changes (minimum)

- **API error handling** (`searchApiClient.ts`): non-2xx responses now throw, so the component's `.catch` handles them instead of treating an error body as results. The search term is URL-encoded.
- **Breed-only matching** (`searchApiClient.ts`): the API matches the query against every field (country, origin, etc.), so results are filtered client-side to cats whose `breed` contains the term (case-insensitive).
- **Typing** (`CatSearch.tsx`): `useState<Cat[]>([])` fixes the `hit.breed` type error (state was inferred as `never[]`).
- **Stale results** (`CatSearch.tsx`): results are cleared when the search term drops below 2 characters.
- **Loading state** (`CatSearch.tsx`): "Loading..." is shown while a search is pending.
- **Debounce** (`CatSearch.tsx`): the API is called 300ms after the last keystroke instead of on every keystroke.
- **Whitespace** (`CatSearch.tsx`): leading whitespace is stripped from the input and the trimmed term is used for the length check and search. Inner spaces are kept because breed names contain them.
- **Accessibility** (`CatSearch.tsx`): the `<h2>` has an id and the input uses `aria-labelledby` to reference it.
- **List keys** (`CatSearch.tsx`): list items use `${hit.breed}-${index}` as `key`. The breed keeps keys stable, and the index suffix guarantees uniqueness if the API ever returns duplicate breeds.
- **Error state** (`CatSearch.tsx`): a failed request clears the results and shows an error message (`role="alert"`) instead of stale results or "No hits". The error is still logged to the console.
- **Null root element** (`main.tsx`): `getElementById("root")!` fixes the strict-mode type error.

## Improvements

- **Request cancellation** (`CatSearch.tsx`, `searchApiClient.ts`): each search uses an `AbortController`, aborted when the term changes or the component unmounts, so slow responses can't overwrite newer results. `fetchSearchResultsFromAPI` takes an optional `signal`.
- **Loading in feedback area** (`CatSearch.tsx`): "Loading..." now shows in the feedback message instead of the results list, and "No hits" is hidden while loading.
- **Error rendering** (`CatSearch.tsx`): on error the results area renders a `<p role="alert">` instead of a `<ul>`. The error handler also clears `loading`, which previously stayed `true` and hid the error.
- **Search input** (`CatSearch.tsx`): input is `type="search"`.
- **BEM class names** (`CatSearch.tsx`): `cat-search__input`, `__feedback`, `__results`, `__result`.
- **Explicit return type** (`searchApiClient.ts`): `fetchSearchResultsFromAPI` returns `Promise<Cat[]>`, so callers get typed results.
- **Error message** (`CatSearch.tsx`): wording now says the failure was while searching for cat breeds.
- **Readability** (`CatSearch.tsx`): added a component doc block, state comments, and notes on the effect, debounce and abort cleanup. Removed a stray `;` after `useEffect(() => {`.

## Advanced improvements

- **Tailwind CSS v4** (`vite.config.js`, `src/styles/index.css`): added via `@tailwindcss/vite`. `CatSearch` is centered (`mx-auto max-w-md min-h-screen`) with spacing, a styled input and muted feedback/error text. The BEM class names are kept as hooks.
- **Hook extracted** (`hooks/useCatSearch.ts`): all state, debounce, abort and error handling moved out of the component, which is now just markup. The effect depends on the trimmed `term`, so trailing whitespace no longer re-triggers a search. `MIN_CHARS` and `DEBOUNCE_MS` are exported.
- **Unit tests** (Vitest + Testing Library + jsdom, run with `pnpm test`):
  - `api/searchApiClient.test.ts`: URL encoding, abort signal, breed filtering, non-2xx throws.
  - `hooks/useCatSearch.test.ts`: min length, debounce, hits, error, abort on term change (fake timers).
  - `components/CatSearch.test.tsx`: hint, loading, hits, "No hits", error as `<p role="alert">` (hook mocked).
- **Directory layout**:

        src/
          api/          searchApiClient.ts (+ test)
          components/   CatSearch.tsx (+ test)
          hooks/        useCatSearch.ts (+ test)
          test/         setup.ts (jest-dom matchers)
          styles/       index.css (Tailwind entry)
          main.tsx
