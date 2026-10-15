import fs from "node:fs";
import { spawnSync } from "node:child_process";

for (const script of [
  "scripts/verify-deployment.mjs",
  "scripts/verify-portal.mjs",
  "scripts/verify-backend-v12.mjs",
  "scripts/test-backend-pure-v12.mjs",
  "scripts/verify-seo.mjs",
]) {
  const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Category overview routes are index routes. TanStack's generated type spelling for
// those routes can change between code-generation passes (/ $category vs / $category/),
// while the public URL remains /<category>. Keep these overview links as normal
// same-origin hrefs so navigation is stable and independent of generated route types.
const categoryLinkChecks = [
  ["src/routes/index.tsx", /href=\{`\/\$\{service\.category\}`\}/],
  ["src/routes/services.tsx", /href=\{`\/\$\{category\.slug\}`\}/],
  ["src/routes/other-services.tsx", /href=\{`\/\$\{category\.slug\}`\}/],
  ["src/routes/resources.tsx", /href=\{`\/\$\{c\.slug\}`\}/],
  ["src/routes/$category.$service.tsx", /href=\{`\/\$\{category\.slug\}`\}/],
];

for (const [file, pattern] of categoryLinkChecks) {
  const source = fs.readFileSync(file, "utf8");
  if (!pattern.test(source)) {
    console.error(`FAIL: ${file} does not contain the stable category overview href.`);
    process.exit(1);
  }
  if (/to=["']\/\$category\/?["']/.test(source)) {
    console.error(`FAIL: ${file} still contains a generated-type-sensitive category overview Link.`);
    process.exit(1);
  }
}
console.log("PASS: Category overview links use stable public hrefs and no generated-type-sensitive index Links remain");

const portal = fs.readFileSync("src/routes/portal.tsx", "utf8");
if (!portal.includes('search["role"]') || !portal.includes('robots: "noindex,nofollow,noarchive,nosnippet"')) {
  console.error("FAIL: Portal TypeScript/SEO corrections are missing.");
  process.exit(1);
}
console.log("PASS: Portal TypeScript-safe search access and noindex metadata remain applied");

const adminEntry = fs.readFileSync("public/admin/index.html", "utf8");
const adminRoute = fs.readFileSync("src/routes/admin.tsx", "utf8");
const robots = fs.readFileSync("public/robots.txt", "utf8");
if (!portal.includes('(["customer", "partner"] as const)') || portal.includes('(["customer", "partner", "admin"] as PortalRole[])')) {
  console.error("FAIL: Admin login is still exposed in the public portal selector.");
  process.exit(1);
}
console.log("PASS: Public portal exposes only Customer Login and Partner Login");
if (!adminEntry.includes('noindex,nofollow,noarchive,nosnippet') || !adminEntry.includes('/portal?role=admin')) {
  console.error("FAIL: Hidden /admin/ entry is missing its noindex policy or admin redirect.");
  process.exit(1);
}
console.log("PASS: Hidden /admin/ entry routes to admin OTP access and is noindex");
if (!adminRoute.includes('createFileRoute("/admin")') || !adminRoute.includes('/portal?role=admin') || !adminRoute.includes('noindex,nofollow,noarchive,nosnippet')) {
  console.error("FAIL: Hidden /admin development route is missing, publicly indexable, or not redirecting to admin OTP access.");
  process.exit(1);
}
console.log("PASS: Hidden /admin development route is registered and noindex");
if (!robots.includes('Disallow: /admin/')) {
  console.error("FAIL: robots.txt does not disallow /admin/.");
  process.exit(1);
}
console.log("PASS: /admin/ is excluded from crawler access");

console.log("\nIncentify V12 routing-stability source verification passed.");
