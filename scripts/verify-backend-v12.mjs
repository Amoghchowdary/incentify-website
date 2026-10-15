import fs from "node:fs";

const source = fs.readFileSync("google-apps-script/Code.gs", "utf8");
const api = fs.readFileSync("src/lib/portal-api.ts", "utf8");
const checks = [];
const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); console.log(`${ok ? "PASS" : "FAIL"}: ${name}`); };

check("Backend version is 12.0.0", source.includes("const APP_VERSION = '12.0.0'"));
check("Portal schema version is 12", source.includes("const PORTAL_SCHEMA_VERSION = '12'"));
check("V12 bridge marker matches frontend", source.includes("INCENTIFY_PORTAL_V12") && api.includes("INCENTIFY_PORTAL_V12"));
check("OTP is hashed at rest", source.includes("hashPortalValue_('otp|'"));
check("OTP generator is derived from UUID + portal secret", source.includes("function generatePortalOtp_()") && source.includes("ensurePortalSecret_() + '|' + Utilities.getUuid()"));
check("Plain Math.random OTP generation is absent", !source.includes("Math.floor(100000 + Math.random()"));
check("Session token is hashed at rest", source.includes("hashPortalValue_('session|'"));
check("Expired sessions are revoked", source.includes("'Revoked': true") && source.includes("Session has expired."));
check("Session/user role mismatch is rejected", source.includes("Session role is invalid."));
check("Partner status is checked on lead submission", source.includes("Partner account is not active."));
check("Partner service access is enforced server-side", source.includes("isPartnerCatalogAllowed_(partnerId, 'SERVICE', serviceId)"));
check("Partner product access is enforced server-side", source.includes("isPartnerCatalogAllowed_(partnerId, 'PRODUCT', productId)"));
check("Duplicate partner leads are suppressed", source.includes("duplicateSince") && source.includes("duplicate: true"));
check("Lead conversion is concurrency protected", source.includes("This lead is being updated. Please retry."));
check("Lead conversion validates active service", source.includes("The lead service is no longer active."));
check("Lead conversion validates active partner", source.includes("The originating partner is not active."));
check("Assignment priority is allow-listed", source.includes("function normalizePriority_(value)"));
check("Assignment due date is validated", source.includes("function isValidIsoDate_(value)"));
check("Portal cleanup helper exists", source.includes("function cleanupExpiredPortalRecords()"));
check("Bridge script escapes line separators", source.includes("replace(/\\u2028/g") && source.includes("replace(/\\u2029/g"));
check("Bridge submission has immediate error handling", api.includes("[portal] bridge submission failed"));
check("Public lead schema remains V4", source.includes("const LEAD_SCHEMA_VERSION = '4'"));
check("No password authentication was added", !source.toLowerCase().includes("password hash") && !api.toLowerCase().includes("password"));

check("Partner workflow transition guard exists", source.includes("function isAllowedPartnerStatusTransition_") && source.includes("This workflow status transition is not allowed."));
check("Catalogue sort order rejects NaN", source.includes("function normalizeSortOrder_(value)"));
check("Inactive catalogue access grants are blocked", source.includes("Inactive catalogue items cannot be assigned to a partner."));
const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\nV12 backend verification failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log(`\nV12 backend verification passed: ${checks.length} checks.`);
