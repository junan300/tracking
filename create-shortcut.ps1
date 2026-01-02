# PowerShell script to create a desktop shortcut for Goal Tracker
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Goal Tracker.lnk"

try {
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = Join-Path $PSScriptRoot "start-app.bat"
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Goal Tracker - Track your time, achieve your goals"
    
    # Set icon if it exists
    $iconPath = Join-Path $PSScriptRoot "icon.ico"
    if (Test-Path $iconPath) {
        $Shortcut.IconLocation = $iconPath
    }
    
    $Shortcut.Save()
    
    Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "Location: $ShortcutPath" -ForegroundColor Cyan
    Write-Host "You can now launch Goal Tracker from your desktop." -ForegroundColor Green
} catch {
    Write-Host "Error creating shortcut: $_" -ForegroundColor Red
    Write-Host "Desktop path: $DesktopPath" -ForegroundColor Yellow
}
