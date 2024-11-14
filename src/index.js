import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");
const appRoot = createRoot(container);

appRoot.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
