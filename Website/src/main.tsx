import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import "@/index.css";
import "katex/dist/katex.min.css";
import "@/styles/doc-math.css";
import "@/styles/math-expand-button.css";
import "@/styles/doc-quiet-funding.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
