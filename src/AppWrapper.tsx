// src/AppWrapper.tsx
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App"; // Ensure this path is correct

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
