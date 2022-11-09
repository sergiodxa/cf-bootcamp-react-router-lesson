import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";

// import { App } from "./initial";
// import { App } from "./completed-data";
import { App } from "./class-version";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
