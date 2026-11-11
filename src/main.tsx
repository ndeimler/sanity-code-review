import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { CatSearch } from "./components/CatSearch";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CatSearch />
  </StrictMode>
);
