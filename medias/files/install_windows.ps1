# ============================================================
# lolzjcx local service - one-click install/update for Windows
# No admin required. Run via:
#   powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://godweiyang.com/medias/files/install_windows.ps1 | iex"
# Steps: stop old service -> download exe -> unblock (skip SmartScreen)
#        -> start once -> poll health.
# ============================================================
$ErrorActionPreference = 'Stop'
$Api      = 'http://127.0.0.1:17530'
$ExeUrl   = 'https://godweiyang.com/medias/files/lolzjcx_service.exe'
$Dir      = Join-Path $env:LOCALAPPDATA 'Lolzjcx'
$Exe      = Join-Path $Dir 'lolzjcx_service.exe'

Write-Host '== lolzjcx local service installer ==' -ForegroundColor Cyan

# 1) stop the old service if it is running
try {
  Invoke-RestMethod -Method Post -Uri "$Api/api/shutdown" -TimeoutSec 4 | Out-Null
  Write-Host 'Old service stopped.'
  Start-Sleep -Seconds 1
} catch { Write-Host 'No running service, continue.' }

# 2) prepare install directory
New-Item -ItemType Directory -Force -Path $Dir | Out-Null

# 3) force TLS 1.2 and download
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }
Write-Host "Downloading service to: $Exe"
Invoke-WebRequest -Uri $ExeUrl -OutFile $Exe -UseBasicParsing

# 4) remove the Mark-of-the-Web so it runs without the SmartScreen prompt
Unblock-File -Path $Exe

# 5) start it once (it self-registers the lolzjcx:// protocol; single instance auto-takes over)
Write-Host 'Starting service...'
Start-Process -FilePath $Exe -WorkingDirectory $Dir

# 6) poll health for ~14s
$ok = $false
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Milliseconds 700
  try {
    $h = Invoke-RestMethod -Uri "$Api/api/health" -TimeoutSec 3
    if ($h -and $h.ok) { $ok = $true; break }
  } catch { }
}

if ($ok) {
  Write-Host '[OK] Service is running. Go back to the web page and query.' -ForegroundColor Green
  Write-Host "Program & account data dir: $Dir (data under data_lolzjcx)" -ForegroundColor DarkGray
} else {
  Write-Host "[WARN] Service not detected within 15s. Please double-click to run once: $Exe" -ForegroundColor Yellow
}
