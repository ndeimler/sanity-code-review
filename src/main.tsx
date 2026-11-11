import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { CatSearch } from "./components/CatSearch";
import { prefetchCats } from "./api/searchApiClient";

// start loading the cat list before the user types; a failure is retried on first search
prefetchCats().catch(() => {});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CatSearch />
  </StrictMode>
);
