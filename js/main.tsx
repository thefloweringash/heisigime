import React from "react";
import ReactDOM from "react-dom";
import { App } from "./app";

const container = document.getElementById("appcontainer");

if (!container) {
  throw new Error("Missing mount point: #appcontainer");
}

const app = <App initialState={window.location.hash} />;

if (container.firstChild) {
  ReactDOM.hydrate(app, container);
}
else {
  ReactDOM.render(app, container);
}
