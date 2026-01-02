# 🚀 QUICK INSTALL GUIDE - Windows

## FASTEST WAY (No Installation Required)

1. Find the file `index.html` in this folder
2. **Double-click it**
3. Your default browser opens with the app running!

That's it! Your data saves automatically.

---

## DESKTOP APP (5 Minutes Setup)

### Step 1: Install Node.js (if you don't have it)
1. Go to https://nodejs.org
2. Download the "LTS" version (big green button)
3. Run installer, click Next > Next > Install
4. Restart your computer

### Step 2: Install the App
1. Open Command Prompt:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter

2. Navigate to this folder:
   ```
   cd C:\path\to\goal-tracker-app
   ```
   (Replace with actual path, or just drag the folder onto the cmd window)

3. Install dependencies:
   ```
   npm install
   ```
   Wait 2-3 minutes for download...

4. Run the app:
   ```
   npm start
   ```

### Step 3: Build .exe (Optional)
```
npm run build
```
Your .exe will be in the `dist` folder!

---

## Troubleshooting

**"npm is not recognized"**
- Node.js not installed. Do Step 1 above.

**App won't start**
- Make sure you ran `npm install` first
- Try closing and reopening Command Prompt

**Data not saving**
- In browser version: Check if cookies/storage is enabled
- In Electron version: Should work automatically

---

## What You Can Do Now

1. ✅ Click `index.html` to start tracking immediately
2. ✅ Click "+1 Hour" buttons to log time
3. ✅ Watch the chart update in real-time
4. ✅ Click "Export Data" to backup your progress

## Next Steps (Customization)

Want to change the goals? Open `index.html` in a text editor and find this section:

```javascript
const GOAL_PRESETS = [
    { id: 1, name: 'Deep Work', emoji: '🎯', color: '#667eea' },
    // Edit these or add new ones!
];
```

Change the names, emojis, or colors to match your goals!

---

Need help? The README.md has more details!
