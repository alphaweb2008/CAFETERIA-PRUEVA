import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { registerServiceWorker, initInstallPrompt } from "./utils/pwa";

// Initialize PWA install prompt listener
initInstallPrompt();

// Register service worker
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
