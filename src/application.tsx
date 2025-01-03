import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppApp from "./AppApp";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppApp/>
  </StrictMode>,
);
