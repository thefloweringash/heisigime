import React from "react";
import ReactDOM from "react-dom";
import { App } from "./app";

const container = document.getElementById("appcontainer");

if (!container) {
  throw new Error("Missing mount point: #appcontainer");
}

const getStateFromHash = (hash: string) => {
  if (!hash.startsWith("#")) {
    return "";
  }

  return decodeURIComponent(hash.substr(1));
};

const app = (
  <App
    initialState={getStateFromHash(window.location.hash)}
  />
);

if (container.firstChild) {
  ReactDOM.hydrate(app, container);
}
else {
  ReactDOM.render(app, container);
}
