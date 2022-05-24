import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { App } from "./initial";
// import { App } from "./completed";
// import { App } from "./completed-data";

let $root = document.getElementById("root");

ReactDOM.createRoot($root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
