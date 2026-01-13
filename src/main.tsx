import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { check } from "@tauri-apps/plugin-updater";

createRoot(document.getElementById("root")!).render(<App />);

async function checkForUpdates() {
  try {
    const update = await check();

    if (update?.available) {
      console.log("Update available:", update.version);
      // dialog + install handled automatically by Tauri
    } else {
      console.log("No update available");
    }
  } catch (err) {
    console.log("Failed to check updates:", err);
  }
}

checkForUpdates();
