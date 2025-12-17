# PowerShell script to download all Quran pages
# Run this script to download mushaf images for offline use

$hafsDir = ".\assets\mushaf\hafs"
$warshDir = ".\assets\mushaf\warsh"

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path $hafsDir | Out-Null
New-Item -ItemType Directory -Force -Path $warshDir | Out-Null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Downloading Quran Mushaf Pages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Download Hafs pages (604 pages)
Write-Host "Downloading Hafs pages (1-604)..." -ForegroundColor Yellow
for ($i = 1; $i -le 604; $i++) {
    $paddedNum = $i.ToString().PadLeft(3, '0')
    $url = "https://www.mp3quran.net/api/quran_pages_arabic/1080/$paddedNum.png"
    $outputFile = "$hafsDir\$paddedNum.png"
    
    if (Test-Path $outputFile) {
        Write-Host "  Page $i already exists, skipping..." -ForegroundColor Gray
        continue
    }
    
    try {
        Write-Host "  Downloading Hafs page $i/604..." -ForegroundColor White -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $outputFile -UseBasicParsing
        Write-Host " Done!" -ForegroundColor Green
    } catch {
        Write-Host " Failed!" -ForegroundColor Red
    }
    
    # Small delay to be nice to the server
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "Downloading Warsh pages (1-604)..." -ForegroundColor Yellow
for ($i = 1; $i -le 604; $i++) {
    $url = "https://raw.githubusercontent.com/adelpro/open-mushaf-native/main/assets/mushaf-data/mushaf-elmadina-warsh-azrak/$i.png"
    $outputFile = "$warshDir\$i.png"
    
    if (Test-Path $outputFile) {
        Write-Host "  Page $i already exists, skipping..." -ForegroundColor Gray
        continue
    }
    
    try {
        Write-Host "  Downloading Warsh page $i/604..." -ForegroundColor White -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $outputFile -UseBasicParsing
        Write-Host " Done!" -ForegroundColor Green
    } catch {
        Write-Host " Failed!" -ForegroundColor Red
    }
    
    # Small delay to be nice to the server
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Download Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. The mushafImages.js file will be auto-generated" -ForegroundColor White
Write-Host "2. Restart your Expo app" -ForegroundColor White
