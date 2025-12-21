# Start both backend and frontend development servers

Write-Host "Starting InDate Development Servers..." -ForegroundColor Green
Write-Host ""

# Start backend in a new window
Write-Host "Starting Backend Server (Port 3699)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; pnpm dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web'; pnpm dev"

Write-Host ""
Write-Host "✓ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3699" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
