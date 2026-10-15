# Incentify Website V12 — hardened production release

V12 consolidates the V11.1 TypeScript/SEO repair and V11.2 TanStack Router repair, then hardens the portal backend and partner workflow.

## Roles
- Customer: OTP login/registration, assigned services, workflow, documents, settings.
- Partner: OTP login/registration + admin approval, assigned catalogue, lead submission, workflow.
- Admin: OTP-only internal account, partner approvals, service/product catalogue, partner access, lead conversion, assignments and monitoring.

## Official integrations
- Apps Script Web App: `https://script.google.com/macros/s/AKfycbwrRfBn52M2yTiwz3yurnmaSgRWb407Ccw-eqUaMMC17i7c8Ezdo2tO5KTTXf_LK00LrQ/exec`
- GitHub repository: `Amoghchowdary/incentify-website`

## V12 reliability/security additions
- fixes all known V11 TypeScript route errors;
- preserves portal `noindex`;
- preserves partner approval notice after OTP verification;
- server-side enforcement of partner service/product permissions;
- duplicate partner-lead suppression;
- lock-protected/idempotent admin lead conversion;
- active partner/service/product checks before conversion;
- validated assignment priorities and ISO due dates;
- hashed OTP/session storage;
- UUID/secret-derived OTP generation rather than direct `Math.random`;
- session role-integrity check and expired-session revocation;
- portal maintenance cleanup helper.

No public lead form schema change was made: existing public lead capture remains schema V4.
