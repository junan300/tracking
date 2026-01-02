# Goal Tracker App 🎯

A beautiful, minimalist goal tracking app to visualize your progress.

## Quick Start (Fastest Way)

### Option 1: Run in Browser (30 seconds)
1. Double-click `index.html`
2. That's it! Your browser will open the app

### Option 2: Desktop App with Electron (5 minutes)

**Prerequisites:**
- Node.js installed (download from nodejs.org if you don't have it)

**Steps:**
1. Open Command Prompt in this folder
2. Run: `npm install`
3. Run: `npm start`

Your desktop app will launch!

**To create an .exe file:**
```bash
npm run build
```
The .exe will be in the `dist` folder.

## Features

- ✅ Track 5 preset goals (Deep Work, Exercise, Learning, Creative, Social)
- ✅ Beautiful animated charts
- ✅ Smooth transitions
- ✅ Data persists automatically (localStorage)
- ✅ Export your data as JSON
- ✅ One-click time logging

## Customizing Your Goals

Edit the `GOAL_PRESETS` array in `index.html`:

```javascript
const GOAL_PRESETS = [
    { id: 1, name: 'Your Goal', emoji: '🎯', color: '#667eea' },
    // Add more goals here
];
```

## Future Enhancements (Easy to Add)

- [ ] Add custom goals via UI
- [ ] Daily/weekly/monthly views
- [ ] Set goal targets
- [ ] Notifications/reminders
- [ ] More chart types (bar, line)
- [ ] Dark mode
- [ ] Export to CSV

## Tech Stack

- React (via CDN - no build needed)
- Chart.js (for graphs)
- Vanilla CSS with animations
- LocalStorage (data persistence)
- Electron (optional, for desktop app)

## Data Storage

Your data is stored in your browser's localStorage. It persists between sessions.
To backup: Click "Export Data" button.
