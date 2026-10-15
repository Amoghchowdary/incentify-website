# Apps Script V12 deployment

Use the existing official Incentify Apps Script project so the Web App continues to execute from the official Google account.

1. Replace the project's `Code.gs` with `google-apps-script/Code.gs` from V12.
2. Confirm Script Properties contain `PORTAL_ADMIN_EMAIL`, `PORTAL_ADMIN_NAME`, and optionally `PORTAL_ADMIN_PHONE`.
3. Run `setupDatabase()`. It reuses the existing database and repairs/adds required sheets automatically.
4. Run `provisionAdminFromProperties()` if the admin account has not already been provisioned. It is idempotent.
5. Run `verifyProductionSetup()`. Expect `ok: true`, `version: 12.0.0`, `portalSchemaVersion: 12`, and `portalSecretConfigured: true`.
6. Deploy -> Manage deployments -> Edit the existing Web App -> New version -> Deploy. Keep Execute as: Me and the same access setting used by the production public website.
7. Confirm the `/exec` endpoint remains:
   `https://script.google.com/macros/s/AKfycbwrRfBn52M2yTiwz3yurnmaSgRWb407Ccw-eqUaMMC17i7c8Ezdo2tO5KTTXf_LK00LrQ/exec`
8. Test a real OTP for customer, partner and admin.

Optional maintenance: run `cleanupExpiredPortalRecords()` periodically to remove old sessions/OTPs/completed registration rows.
