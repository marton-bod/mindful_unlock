# Mindful Unlock PWA

A Progressive Web App that encourages mindful phone usage by adding a thoughtful pause before unlocking.

## Features

- 10-second countdown before unlocking
- Daily unlock counter with automatic reset
- Inspirational quotes to encourage mindfulness
- Works offline
- Installable as a standalone app
- Lock screen widget support (via iOS Shortcuts)

## Deployment

### Quick Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Clone it locally:
```bash
   git clone https://github.com/yourusername/mindful-unlock.git
   cd mindful-unlock
```

3. Add all the files from this package

4. Commit and push:
```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
```

5. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from main branch
   - Save

6. Your PWA will be live at:
   `https://yourusername.github.io/mindful-unlock`

### Alternative: Deploy to Netlify

1. Go to https://netlify.com
2. Drag and drop your project folder
3. Done! Get instant HTTPS URL

### Alternative: Deploy to Vercel

1. Go to https://vercel.com
2. Import your GitHub repo
3. Deploy with one click

## Usage for End Users

### Install as PWA (iOS):
1. Visit the URL in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon appears on home screen

### Install as PWA (Android):
1. Visit the URL in Chrome
2. Tap "Install app" when prompted
3. Or: Menu → "Add to Home Screen"

### Setup Lock Screen Widget (iOS):
1. Open Shortcuts app
2. Create new shortcut with "Open URLs"
3. Enter your PWA URL
4. Name it "Mindful Unlock"
5. Add shortcut to lock screen widget

## Local Development

Simply open `index.html` in a browser. No build process needed!

For testing service worker locally, you'll need HTTPS. Use:
```bash
npx http-server -S
```

## Customization

- Edit `app.js` to change countdown duration or add more quotes
- Edit `styles.css` to change colors and styling
- Edit `manifest.json` to change app name or theme color

## License

MIT - feel free to use and modify!