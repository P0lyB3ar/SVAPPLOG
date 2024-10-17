import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppDict from "./AppDict";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppDict />
  </StrictMode>,
);
