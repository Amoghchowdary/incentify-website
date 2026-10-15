import fs from "node:fs";
const read = (file) => fs.readFileSync(file, "utf8");
const root = read("src/routes/__root.tsx");
const site = read("src/data/site.ts");
const sitemap = read("scripts/generate-sitemap.mjs");
const checks = [
  ["Root language is en-IN", root.includes('<html lang="en-IN">')],
  ["Organization structured data exists", root.includes('"@type": "Organization"')],
  ["ProfessionalService structured data exists", root.includes('"@type": "ProfessionalService"')],
  ["Social sameAs exists", root.includes("sameAs")],
  ["LinkedIn canonical profile configured", site.includes("https://www.linkedin.com/in/incentify")],
  ["Instagram canonical profile configured", site.includes("https://www.instagram.com/incentify_26_/")],
  ["YouTube canonical profile configured", site.includes("https://www.youtube.com/@incentifyofficial")],
  ["Sitemap generator targets incentify.in", sitemap.includes("https://incentify.in")],
];
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log(`\nV12 SEO verification passed: ${checks.length} checks.`);
