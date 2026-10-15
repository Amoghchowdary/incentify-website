# Incentify V12 changes

## Resolved errors
The errors Priya encountered were frontend TypeScript/TanStack Router type mismatches, not evidence of a failing Apps Script backend. V12 includes the earlier portal SEO/search typing fix and changes every category overview link to TanStack Router's generated `/$category/` route.

## Additional bugs fixed
1. Partner registration success message no longer disappears immediately after OTP verification.
2. Hidden iframe bridge reports immediate submission errors instead of waiting for a timeout.
3. Partner lead API now enforces the admin-assigned service and product catalogue server-side.
4. Duplicate partner leads submitted within ten minutes are suppressed.
5. Lead conversion is protected with a script lock and is idempotent.
6. Lost leads cannot be converted until re-qualified.
7. Converted leads cannot accidentally be moved back to an earlier status.
8. Conversion validates originating partner plus active service/product.
9. Assignment priority and due-date inputs are validated.
10. Expired sessions are revoked and session/user role integrity is checked.
11. OTP generation is derived from UUIDs + portal secret rather than a direct `Math.random` six-digit value.
12. Profile mobile updates are validated.
13. Production verification fails if the portal security secret is missing.
14. Added `cleanupExpiredPortalRecords()` maintenance helper.
