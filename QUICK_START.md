# Quick Start Guide

## Running the App

### Option 1: Web Version (Browser)
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

### Option 2: Desktop App (Electron)

**First time or after changes:**
```bash
npm run build
npm start
```

**For development with hot reload:**
```bash
npm run electron:dev
```

**Simple launcher:**
Double-click `launcher.bat` and choose your option.

## Important Notes

- **Double-clicking `index.html` no longer works** - The app now uses Vite and requires a build step or dev server.
- For the simplest experience, use `npm run dev` for web or `npm start` for desktop.
- The desktop app will automatically build if needed when you run `npm start`.

## Building for Production

**Web version:**
```bash
npm run build
```
Then serve the `dist` folder with any web server.

**Desktop app:**
```bash
npm run electron:build
```
Creates an installer in the `dist` folder.

