$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Invoke-Gate([string]$Name, [string]$Command) {
  Write-Host "Running $Name" -ForegroundColor Cyan
  cmd /d /c $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE. Release blocked."
  }
}

Invoke-Gate "dependency install" "npm install --include=dev --no-audit --no-fund"
Invoke-Gate "source verification" "npm run verify:v12"

# TanStack Start regenerates src/routeTree.gen.ts during build/dev. Build first,
# then type-check the generated route tree so a stale committed routeTree cannot
# produce a false green result.
Invoke-Gate "production build and route generation" "npm run build"
Invoke-Gate "post-codegen typecheck" "npm run typecheck"
Invoke-Gate "post-codegen source verification" "npm run verify:v12"

Write-Host "All V12 routing-stability release gates passed." -ForegroundColor Green
Write-Host "Keep npm run dev running in its PowerShell window while testing localhost." -ForegroundColor Yellow
