import fs from "node:fs";

const EXPECTED_URL =
  "https://script.google.com/macros/s/AKfycbwrRfBn52M2yTiwz3yurnmaSgRWb407Ccw-eqUaMMC17i7c8Ezdo2tO5KTTXf_LK00LrQ/exec";

const backend = fs.readFileSync("src/config/backend.ts", "utf8");
if (!backend.includes(EXPECTED_URL)) {
  console.error("Production preflight failed: Incentify V12 official Apps Script endpoint is missing or changed.");
  process.exit(1);
}
if (backend.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
  console.error("Production preflight failed: backend placeholder is still present.");
  process.exit(1);
}
console.log("Production preflight passed: Incentify V12 official Apps Script endpoint is configured.");
