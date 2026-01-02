# 🚀 Quick Setup Guide

## Files Overview

### Main Application Files
- **`index.html`** - The main application file (contains React app, CSS, and JavaScript)
- **`main.js`** - Electron desktop app wrapper
- **`package.json`** - Project configuration and dependencies

### Launcher Files
- **`launcher.bat`** - Double-click this to start the app (or use the desktop shortcut)
- **`create-shortcut.bat`** - Run this once to create a desktop shortcut
- **`create-shortcut.ps1`** - PowerShell script for shortcut creation

### Documentation
- **`README.md`** - Full project documentation
- **`INSTALL.md`** - Installation instructions
- **`SETUP.md`** - This file (quick setup guide)

## Quick Start Options

### Option 1: Desktop Shortcut (Easiest)
1. Double-click **`create-shortcut.bat`** (one-time setup)
2. A shortcut will appear on your desktop
3. Double-click the desktop shortcut anytime to launch the app

### Option 2: Direct Launcher
1. Double-click **`launcher.bat`** in this folder
2. The app will start immediately

### Option 3: Command Line
```bash
npm start
```

## For Sharing with Others

If you want to share this app with someone else:

1. **Share the entire folder** (including `node_modules`)
   - Easiest: Zip the entire folder and share it
   - They just need to double-click `launcher.bat` or run `create-shortcut.bat`

2. **Or share without node_modules** (they'll need Node.js):
   - Share the folder but exclude `node_modules`
   - They'll need to run `npm install` first, then use `launcher.bat`

3. **Build an .exe file** (best for distribution):
   ```bash
   npm run build
   ```
   - Creates a standalone `.exe` installer in the `dist` folder
   - Others can install it like any Windows program

## File Organization

All files are in the root directory for simplicity:
- Application code: `index.html`, `main.js`
- Configuration: `package.json`
- Launchers: `launcher.bat`, `create-shortcut.bat`, `create-shortcut.ps1`
- Documentation: `README.md`, `INSTALL.md`, `SETUP.md`
- Dependencies: `node_modules/` (auto-generated)

## Troubleshooting

**Shortcut doesn't work?**
- Make sure you're in the project folder when running `create-shortcut.bat`
- Try running it as Administrator if needed

**App won't start?**
- Make sure `node_modules` folder exists (run `npm install` if missing)
- Check that Node.js is installed: `node --version`

**Want to remove the shortcut?**
- Simply delete the "Goal Tracker.lnk" file from your desktop

