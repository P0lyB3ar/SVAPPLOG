import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppOrg from "./AppOrg";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppOrg/>
  </StrictMode>,
);
