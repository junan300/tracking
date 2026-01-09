# Deployment Guide

## Web Deployment

Yes! The app can be deployed to the web. When you run `npm run dev`, it runs on localhost, and the build process creates static files that can be hosted anywhere.

### Quick Deploy Steps

1. **Build the app:**
   ```bash
   npm run build
   ```
   This creates a `dist` folder with all the static files.

2. **Deploy the `dist` folder** to any web hosting service:

### Deployment Options

#### Option 1: Netlify (Recommended - Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder to deploy
3. Or connect your GitHub repo and set build command: `npm run build` and publish directory: `dist`

#### Option 2: Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

#### Option 3: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
3. Run: `npm run deploy`

#### Option 4: Any Static Host
- Upload the contents of the `dist` folder to:
  - AWS S3 + CloudFront
  - Firebase Hosting
  - Surge.sh
  - Any web server (Apache, Nginx, etc.)

### Important Notes for Web Deployment

- **Data Storage**: The app uses `localStorage`, which means:
  - Data is stored in the user's browser
  - Data persists between sessions
  - Data is browser-specific (won't sync across devices)
  - Users can export/import their data as JSON files

- **No Backend Required**: This is a fully static app - no server needed!

- **Build Output**: The `dist` folder contains:
  - `index.html` - Main HTML file
  - `assets/` - Compiled CSS and JavaScript

### Testing the Build Locally

Before deploying, test the production build:
```bash
npm run build
npm run preview
```
This serves the built files locally so you can verify everything works.

## Desktop App Deployment

For distributing the desktop app:

```bash
npm run electron:build
```

This creates an installer in the `dist` folder that you can distribute.

---

**Version 2.1.0** - Modular structure ready for both web and desktop deployment! 🚀




