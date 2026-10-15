# Incentify V12 deployment guide

## Local release gates
```powershell
cd "C:\Users\MYPC\Desktop\Incentify website\Incentify_Website_V12_Production"
npm install --include=dev --no-audit --no-fund
npm run verify:v12
npm run typecheck
npm run build
```

For local portal testing:
```powershell
$env:VITE_USE_MOCK_BACKEND="true"
npm run dev
```
Mock OTP: `123456`. Test `/portal?role=customer`, `/portal?role=partner`, and `/portal?role=admin`. Press the keyboard shortcut Ctrl+C to stop the dev server, then run:
```powershell
Remove-Item Env:VITE_USE_MOCK_BACKEND -ErrorAction SilentlyContinue
npm run build
```

## Backend
Follow `APPS_SCRIPT_V12.md`, then test at least one real email OTP before GitHub production deployment.

## GitHub
Repository: `https://github.com/Amoghchowdary/incentify-website.git`
```powershell
git status
git add -A
git commit -m "Deploy Incentify V12 hardened customer partner admin portal"
git push origin main
```
