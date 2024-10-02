// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./AppWrapper"; // Ensure this path is correct

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
