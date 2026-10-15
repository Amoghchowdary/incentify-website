/**
 * Incentify production backend configuration.
 *
 * This is the official Google Apps Script Web App deployment used by the
 * public website and the V12 customer/partner/admin portal. The URL is public by
 * design; never place private Google credentials in browser code.
 */
const PASTE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwrRfBn52M2yTiwz3yurnmaSgRWb407Ccw-eqUaMMC17i7c8Ezdo2tO5KTTXf_LK00LrQ/exec";

const envUrl = import.meta.env["VITE_APPS_SCRIPT_URL"]?.trim();

export const APPS_SCRIPT_URL = (envUrl || PASTE_APPS_SCRIPT_URL).trim();

export const USE_MOCK_BACKEND = import.meta.env["VITE_USE_MOCK_BACKEND"] === "true";

export function isAppsScriptConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(
    APPS_SCRIPT_URL,
  );
}
