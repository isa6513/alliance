import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { Buffer } from "buffer";
import "./index.css";

if (typeof window !== "undefined") {
  // Expose Buffer globally for browser code that expects it
  (window as any).Buffer = Buffer;
}

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
