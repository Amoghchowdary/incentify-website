import {
  APPS_SCRIPT_URL,
  isAppsScriptConfigured,
  USE_MOCK_BACKEND,
} from "@/config/backend";

/**
 * Single production integration point for every lead captured on the website.
 *
 * The frontend is statically hosted on GitHub Pages and sends submissions to a
 * Google Apps Script Web App. The Web App stores each request in Google Sheets.
 * Never place private API keys or Google credentials in browser code.
 */

export type LeadSource = "quote" | "contact" | "consultation" | "service-page";

export type LeadPayload = {
  source: LeadSource;
  fullName: string;
  phone: string;
  email: string;
  businessName?: string | undefined;
  businessType?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  service?: string | undefined;
  contactMethod?: string | undefined;
  contactTime?: string | undefined;
  preferredDate?: string | undefined;
  preferredTime?: string | undefined;
  companyWebsite?: string | undefined;
  message?: string | undefined;
  pagePath?: string | undefined;
  submittedAt: string;
};

export type LeadResult = { ok: true; reference: string } | { ok: false; error: string };

function createReference() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.getRandomValues(new Uint32Array(1))[0]?.toString(36).toUpperCase() ?? "000000";
  return `INC-${stamp}-${random.slice(-6).padStart(6, "0")}`;
}

function createSubmissionId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  const reference = createReference();

  if (USE_MOCK_BACKEND) {
    if (import.meta.env.DEV) console.info("[lead/mock] captured", { reference, ...payload });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ok: true, reference };
  }

  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      error:
        "The enquiry system is not configured yet. Please contact Incentify by phone, WhatsApp or email.",
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const body = {
      action: "lead",
      schemaVersion: 4,
      submissionId: createSubmissionId(),
      reference,
      companyWebsite: payload.companyWebsite ?? "", // honeypot: must remain empty
      pageUrl: window.location.href,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
      ...payload,
    };

    // Apps Script Web Apps are cross-origin from GitHub Pages. text/plain keeps
    // this a simple POST and no-cors lets the browser deliver it without an
    // OPTIONS preflight. The same reference is generated in the browser and
    // stored by Apps Script, so the visitor can quote it to the team later.
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
      redirect: "follow",
      keepalive: true,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    return { ok: true, reference };
  } catch (error) {
    if (import.meta.env.DEV) console.error("[lead] submission failed", error);
    return {
      ok: false,
      error:
        "We could not submit your request just now. Please try again, or contact Incentify by phone, WhatsApp or email.",
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
