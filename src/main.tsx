import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";


const rootElement = document.getElementById("root");

// Create the root
const root = ReactDOM.createRoot(rootElement as HTMLElement);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
