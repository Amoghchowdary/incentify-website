import fs from "node:fs";

const BACKEND = "https://script.google.com/macros/s/AKfycbwrRfBn52M2yTiwz3yurnmaSgRWb407Ccw-eqUaMMC17i7c8Ezdo2tO5KTTXf_LK00LrQ/exec";
const REPO = "Amoghchowdary/incentify-website";
const checks = [];
const check = (name, ok) => { checks.push({ name, ok: Boolean(ok) }); console.log(`${ok ? "PASS" : "FAIL"}: ${name}`); };
const read = (file) => fs.readFileSync(file, "utf8");

const packageJson = JSON.parse(read("package.json"));
const backend = read("src/config/backend.ts");
const gas = read("google-apps-script/Code.gs");
const workflow = read(".github/workflows/deploy-pages.yml");
const header = read("src/components/site-header.tsx");
const routeTree = read("src/routeTree.gen.ts");
const site = read("src/data/site.ts");

check("Package version is V12", packageJson.version === "12.0.0");
check("Official Apps Script deployment is embedded", backend.includes(BACKEND));
check("Backend env access uses index notation", backend.includes('import.meta.env["VITE_APPS_SCRIPT_URL"]'));
check("Apps Script backend is V12", gas.includes("const APP_VERSION = '12.0.0'"));
check("Portal schema is V12", gas.includes("const PORTAL_SCHEMA_VERSION = '12'"));
check("Database setup is present", gas.includes("function setupDatabase()"));
check("Production verification is present", gas.includes("function verifyProductionSetup()"));
check("Apps Script doGet exists", gas.includes("function doGet(e)"));
check("Apps Script doPost exists", gas.includes("function doPost(e)"));
check("Customer and partner portal navigation remains", header.includes("Customer Login") && header.includes("Partner Login"));
check("Portal route is included", routeTree.includes("/portal"));
check("Universal Pages workflow exists", workflow.includes("name: Deploy Incentify Website"));
check("Workflow deploys main", /branches:\s*\n\s*- main/.test(workflow));
check("Workflow uploads Pages artifact", workflow.includes("actions/upload-pages-artifact@v5"));
check("Workflow deploys Pages", workflow.includes("actions/deploy-pages@v5"));
check("GitHub repository target is documented", read("README_V12.md").includes(REPO));
check("Correct LinkedIn backlink is configured", site.includes("https://www.linkedin.com/in/incentify"));
check("Correct Instagram backlink is configured", site.includes("https://www.instagram.com/incentify_26_/"));
check("Official YouTube backlink is configured", site.includes("https://www.youtube.com/@incentifyofficial"));
check("Approved V8.3 hero image exists", fs.existsSync("public/images/business-support-hero-v8-3.png"));

const failed = checks.filter((item) => !item.ok);
if (failed.length) { console.error(`\nV12 deployment verification failed: ${failed.length} check(s).`); process.exit(1); }
console.log(`\nV12 deployment verification passed: ${checks.length} checks.`);
