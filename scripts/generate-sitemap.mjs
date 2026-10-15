import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const servicesFile = path.join(root, "src", "data", "services.ts");
const publicDir = path.join(root, "public");
const source = fs.readFileSync(servicesFile, "utf8");

const categoriesSection = source.split("export const services:")[0] ?? "";
const categorySlugs = [...categoriesSection.matchAll(/\bslug:\s*"([^"]+)"/g)].map((m) => m[1]);
const serviceMatches = [...source.matchAll(/svc\("([^"]+)"\s*,\s*\{\s*\n?\s*slug:\s*"([^"]+)"/g)];
const servicePaths = serviceMatches.map((m) => `/${m[1]}/${m[2]}`);

const staticPaths = [
  "/",
  "/services",
  "/other-services",
  "/resources",
  "/about",
  "/contact",
  "/quote",
  "/consultation",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund-policy",
];

const allPaths = [...new Set([
  ...staticPaths,
  ...categorySlugs.map((slug) => `/${slug}`),
  ...servicePaths,
])].sort();

const baseUrl = "https://incentify.in";
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allPaths.flatMap((route) => [
    "  <url>",
    `    <loc>${baseUrl}${route}</loc>`,
    `    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>`,
    `    <priority>${route === "/" ? "1.0" : route.split("/").filter(Boolean).length === 1 ? "0.8" : "0.7"}</priority>`,
    "  </url>",
  ]),
  "</urlset>",
  "",
].join("\n");

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap.xml with ${allPaths.length} URLs.`);
