const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Check if we're in dev mode (Vite dev server running) or production
const isDev = process.env.ELECTRON_DEV === 'true';
const distPath = path.join(__dirname, 'dist', 'index.html');
const hasDist = fs.existsSync(distPath);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#667eea',
        icon: path.join(__dirname, 'icon.ico')
    });

    if (isDev) {
        // In development mode with Vite dev server
        win.loadURL('http://localhost:5173');
        // Uncomment to open DevTools for debugging
        // win.webContents.openDevTools();
    } else if (hasDist) {
        // Production build exists, load from dist folder
        win.loadFile(distPath);
    } else {
        // No build found, show error
        win.loadURL('data:text/html,<html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h1>Build Required</h1><p>Please run <code>npm run build</code> first, or use <code>npm run electron:dev</code> for development.</p></body></html>');
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
