import fs from "node:fs";
import path from "node:path";

const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwrRfBn52M2yTiwz3yurnmaSgRWb407Ccw-eqUaMMC17i7c8Ezdo2tO5KTTXf_LK00LrQ/exec";
const LINKEDIN_URL = "https://www.linkedin.com/in/incentify";
const INSTAGRAM_URL = "https://www.instagram.com/incentify_26_/";
const YOUTUBE_URL = "https://www.youtube.com/@incentifyofficial";
const clientRoot = path.resolve("dist/client");

const required = [
  "index.html",
  "services/index.html",
  "other-services/index.html",
  "about/index.html",
  "contact/index.html",
  "consultation/index.html",
  "portal/index.html",
  "admin/index.html",
  "sitemap.xml",
  "robots.txt",
  "404.html",
];

const missing = required.filter((file) => !fs.existsSync(path.join(clientRoot, file)));
if (missing.length) {
  console.error("V12 static verification failed. Missing:");
  missing.forEach((file) => console.error(` - dist/client/${file}`));
  process.exit(1);
}

function walk(dir, extension) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, extension));
    else if (entry.isFile() && entry.name.endsWith(extension)) out.push(full);
  }
  return out;
}

const htmlFiles = walk(clientRoot, ".html");
if (htmlFiles.length < 80) {
  console.error(`V12 static verification failed: expected at least 80 HTML files, found ${htmlFiles.length}.`);
  process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(clientRoot, "index.html"), "utf8");
const portalHtml = fs.readFileSync(path.join(clientRoot, "portal/index.html"), "utf8");
const adminHtml = fs.readFileSync(path.join(clientRoot, "admin/index.html"), "utf8");
const robotsText = fs.readFileSync(path.join(clientRoot, "robots.txt"), "utf8");
const sitemapText = fs.readFileSync(path.join(clientRoot, "sitemap.xml"), "utf8");
const attrRefs = [...indexHtml.matchAll(/\b(?:href|src)=['"]([^'"]+)['"]/g)].map((m) => m[1]);
const cssRefs = attrRefs.filter((ref) => /\.css(?:\?|$)/.test(ref));
const jsRefs = attrRefs.filter((ref) => /\.js(?:\?|$)/.test(ref));

if (!cssRefs.length || !jsRefs.length) {
  console.error("V12 static verification failed: homepage CSS/JS references are incomplete.");
  process.exit(1);
}

for (const ref of [...cssRefs, ...jsRefs]) {
  if (!ref.startsWith("/assets/")) {
    console.error(`V12 static verification failed: unexpected root-domain asset path: ${ref}`);
    process.exit(1);
  }
  const local = path.join(clientRoot, ref.slice(1).split(/[?#]/, 1)[0]);
  if (!fs.existsSync(local)) {
    console.error(`V12 static verification failed: referenced asset does not exist: ${ref}`);
    process.exit(1);
  }
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (/\b(?:href|src|action)=['"]\/incentify(?:\/|['"])/.test(html)) {
    console.error(`V12 static verification failed: ${path.relative(clientRoot, file)} still contains /incentify/ deployment paths.`);
    process.exit(1);
  }
}

for (const link of [LINKEDIN_URL, INSTAGRAM_URL, YOUTUBE_URL]) {
  if (!indexHtml.includes(link.replaceAll("&", "&amp;")) && !indexHtml.includes(link)) {
    console.error(`V12 static verification failed: homepage is missing social backlink ${link}`);
    process.exit(1);
  }
}

if (!/noindex/i.test(portalHtml)) {
  console.error("V12 static verification failed: portal page must remain noindex.");
  process.exit(1);
}

if (!/noindex/i.test(adminHtml) || !adminHtml.includes('/portal?role=admin')) {
  console.error("V12 static verification failed: hidden admin entry must be noindex and route to admin OTP access.");
  process.exit(1);
}
if (!robotsText.includes("Disallow: /admin/")) {
  console.error("V12 static verification failed: /admin/ is not blocked in robots.txt.");
  process.exit(1);
}
if (sitemapText.includes("/admin")) {
  console.error("V12 static verification failed: hidden admin path must not be present in sitemap.xml.");
  process.exit(1);
}

const jsFiles = walk(path.join(clientRoot, "assets"), ".js");
const backendEmbedded = jsFiles.some((file) => fs.readFileSync(file, "utf8").includes(BACKEND_URL));
if (!backendEmbedded) {
  console.error("V12 static verification failed: official Apps Script endpoint is missing from the client bundle.");
  process.exit(1);
}

const portalBundleSignals = jsFiles.some((file) => {
  const source = fs.readFileSync(file, "utf8");
  return source.includes("INCENTIFY_PORTAL_V12") && source.includes("requestRegistrationOtp");
});
if (!portalBundleSignals) {
  console.error("V12 static verification failed: V12 portal registration/login code is missing from the client bundle.");
  process.exit(1);
}

console.log(`V12 static verification passed: ${htmlFiles.length} HTML files, root assets valid, public portal clean, hidden admin entry protected, backend embedded.`);
