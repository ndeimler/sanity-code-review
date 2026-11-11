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
