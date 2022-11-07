import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { App } from "./initial";
// import { App } from "./completed-data";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
