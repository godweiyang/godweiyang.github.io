# ============================================================
# Amenity scoring local service - one-click install for Windows
# Run in PowerShell (no admin required):
#   powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://godweiyang.com/medias/files/install_amenity_windows.ps1 | iex"
# Steps: stop old service -> download exe -> unblock (skip SmartScreen)
#        -> start once -> poll health on 127.0.0.1:17532.
# ============================================================
$ErrorActionPreference = 'Stop'
$Api    = 'http://127.0.0.1:17532'
$ExeUrl = 'https://godweiyang.com/medias/files/amenity_service.exe'
$Dir    = Join-Path $env:LOCALAPPDATA 'AmenityService'
$Exe    = Join-Path $Dir 'amenity_service.exe'

Write-Host '== Amenity service installer ==' -ForegroundColor Cyan

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

# 5) start it once (it self-registers the amenity:// protocol; single instance auto-takes over)
Write-Host 'Starting service...'
Start-Process -FilePath $Exe -WorkingDirectory $Dir

# 6) poll health for ~20s and verify this is the amenity service
$ok = $false
for ($i = 0; $i -lt 25; $i++) {
  Start-Sleep -Milliseconds 800
  try {
    $h = Invoke-RestMethod -Uri "$Api/api/health" -TimeoutSec 3
    if ($h -and $h.data -and $h.data.service -eq 'amenity-local') { $ok = $true; break }
  } catch { }
}

if ($ok) {
  Write-Host '[OK] Service is running at 127.0.0.1:17532.' -ForegroundColor Green
  Write-Host '     Back to https://godweiyang.com/amenity/ and click "Connect Beike".' -ForegroundColor DarkGray
  Write-Host "     Program dir: $Dir" -ForegroundColor DarkGray
} else {
  Write-Host "[WARN] Service not detected within 20s." -ForegroundColor Yellow
  Write-Host "       Double-click to run once: $Exe" -ForegroundColor Yellow
  Write-Host '       If SmartScreen blocks it, click "More info" -> "Run anyway".' -ForegroundColor Yellow
}
