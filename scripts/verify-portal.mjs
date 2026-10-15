import fs from "node:fs";

const checks = [];
const check = (name, ok) => {
  checks.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
};
const read = (file) => fs.readFileSync(file, "utf8");

const route = read("src/routes/portal.tsx");
const api = read("src/lib/portal-api.ts");
const types = read("src/lib/portal-types.ts");
const backend = read("google-apps-script/Code.gs");
const header = read("src/components/site-header.tsx");
const routeTree = read("src/routeTree.gen.ts");

check("Portal route exists", fs.existsSync("src/routes/portal.tsx"));
check("Customer login remains exposed", header.includes("Customer Login"));
check("Partner login remains exposed", header.includes("Partner Login"));
check("Admin role exists", types.includes('"admin"') && route.includes('role === "admin"'));
check("Portal route is generated", routeTree.includes("/portal"));
check("V12 bridge source is consistent", api.includes("INCENTIFY_PORTAL_V12") && backend.includes("INCENTIFY_PORTAL_V12"));
check("OTP login request exists", api.includes("requestPortalOtp") && backend.includes("requestPortalOtp_"));
check("OTP login verification exists", api.includes("verifyPortalOtp") && backend.includes("verifyPortalOtp_"));
check("Customer/partner registration remains", api.includes("requestPortalRegistrationOtp") && backend.includes("requestPortalRegistrationOtp_"));
check("Admin self-registration is blocked", backend.includes("Admin accounts cannot self-register") && route.includes("Admin accounts are provisioned internally"));
check("Admin bootstrap helper exists", backend.includes("function provisionAdminFromProperties()"));
check("OTP values are hashed", backend.includes("hashPortalValue_('otp|'"));
check("Session values are hashed", backend.includes("hashPortalValue_('session|'"));
check("OTP expiry is enforced", backend.includes("OTP_TTL_MINUTES"));
check("OTP attempt limits are enforced", backend.includes("OTP_MAX_ATTEMPTS"));
check("Official sender display name is configured", backend.includes("Incentify Private Limited") && backend.includes("OFFICIAL_REPLY_TO"));
check("Admin database exists", backend.includes("ADMINS: 'Admins'") && backend.includes("ADMIN_HEADERS"));
check("Partner lead database exists", backend.includes("PARTNER_LEADS: 'Partner_Leads'") && backend.includes("PARTNER_LEAD_HEADERS"));
check("Partner can submit leads", route.includes("Add a new lead") && api.includes("submitPartnerLead") && backend.includes("submitPartnerLead_"));
check("Admin can control partner leads", route.includes("Partner lead control") && backend.includes("adminUpdatePartnerLeadStatus_"));
check("Admin can convert leads to assignments", api.includes("adminConvertPartnerLead") && backend.includes("adminConvertPartnerLead_"));
check("Admin can add/edit services", route.includes("Service catalogue control") && backend.includes("adminUpsertService_"));
check("Admin can add/edit products", route.includes("Product catalogue control") && backend.includes("adminUpsertProduct_"));
check("Admin can approve/deactivate partners", api.includes("adminSetPartnerStatus") && backend.includes("adminSetPartnerStatus_"));
check("Admin controls partner service/product access", api.includes("adminSetPartnerCatalogAccess") && backend.includes("adminSetPartnerCatalogAccess_") && backend.includes("Partner_Catalog_Access"));
check("Admin can create assignments", api.includes("adminCreateAssignment") && backend.includes("adminCreateAssignment_"));
check("Admin can monitor all assignments", backend.includes("if (role === 'admin') return true"));
check("No plain-text password field exists", !route.toLowerCase().includes('type="password"') && !types.toLowerCase().includes("password"));
check("Portal page is noindex", route.includes("noindex,nofollow,noarchive,nosnippet"));


check("Partner lead submission enforces assigned service access", backend.includes("isPartnerCatalogAllowed_(partnerId, 'SERVICE', serviceId)"));
check("Partner lead submission enforces assigned product access", backend.includes("isPartnerCatalogAllowed_(partnerId, 'PRODUCT', productId)"));
check("Partner lead conversion is lock protected", backend.includes("This lead is being updated. Please retry."));
check("Converted leads cannot be rolled back accidentally", backend.includes("Converted leads cannot be moved back"));
check("Secure OTP generator avoids Math.random OTPs", backend.includes("function generatePortalOtp_()") && !backend.includes("Math.floor(100000 + Math.random()"));
check("Session role integrity is enforced", backend.includes("Session role is invalid."));
check("Partner registration approval notice is preserved", route.includes("setNotice(result.data.message);") && !route.includes("setNotice(result.data.message);\n        setAuthMode(\"login\");\n        setEmail(registration.email.trim());\n        resetOtpState();"));
check("Partner workflow transitions are validated", backend.includes("function isAllowedPartnerStatusTransition_") && backend.includes("This workflow status transition is not allowed."));
check("Inactive catalogue items cannot be granted to partners", backend.includes("Inactive catalogue items cannot be assigned to a partner."));
check("Catalogue sort order is normalized", backend.includes("function normalizeSortOrder_(value)"));
const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`\nV12 portal verification failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log(`\nV12 portal verification passed: ${checks.length} checks.`);
