# Kill all node.exe processes
taskkill /F /IM node.exe
Write-Host "All Node.js processes have been terminated."

# Kill all ts-node-dev processes if any
taskkill /F /IM ts-node-dev.exe
Write-Host "All ts-node-dev processes have been terminated."
