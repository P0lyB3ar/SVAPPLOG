import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppDict from "./AppDict";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppDict />
  </StrictMode>,
);
