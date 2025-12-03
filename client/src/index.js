import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import store from "./redux/store";
import { unregisterServiceWorker } from "./serviceWorkerRegistration";

// Unregister any existing service workers to prevent workbox errors
unregisterServiceWorker();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
