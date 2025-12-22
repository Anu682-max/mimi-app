# Start InDate Development Servers

Write-Host "Starting InDate servers..." -ForegroundColor Cyan

# Kill existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start Backend
Write-Host "`nStarting Backend on port 3699..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\anulk\OneDrive\Desktop\date app\indate\backend'; Write-Host 'Backend Server' -ForegroundColor Green; pnpm dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\anulk\OneDrive\Desktop\date app\indate\web'; Write-Host 'Frontend Server' -ForegroundColor Green; pnpm dev" -WindowStyle Normal

Write-Host "`n✅ Servers are starting in separate windows!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3699" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
