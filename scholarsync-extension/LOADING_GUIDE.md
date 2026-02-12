# Loading ScholarSync Extension in Chrome

Follow these steps to load and test the ScholarSync Chrome extension:

## Step 1: Build the Extension

```bash
npm install
npm run build
```

This creates a `dist/` folder with all compiled files.

## Step 2: Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the `dist/` folder from this project
6. The ScholarSync extension should now appear in your extensions list

## Step 3: Pin the Extension

1. Click the puzzle piece icon in Chrome toolbar
2. Find "ScholarSync" in the list
3. Click the pin icon to keep it visible in the toolbar

## Step 4: Test the Extension

### Test Authentication:
1. Click the ScholarSync icon in toolbar
2. Enter your login credentials (email/password)
3. You should see your dashboard after successful login

### Test Form Detection:
1. Navigate to a scholarship website like:
   - https://bold.org
   - https://scholarships.com
   - http://localhost:3000 (if you have a test page)
2. The extension should automatically detect scholarship forms
3. A banner will appear if forms are detected

### Test Auto-Fill:
1. On a detected scholarship page, click the extension icon
2. Click "Auto-Fill Form" button
3. Your profile data should fill the form fields
4. Fields will highlight with a blue animation

### Test Essay Detection:
1. On a page with essay fields (textareas)
2. Click extension icon → "Detect Essays"
3. Should show detected essay prompts

## Troubleshooting

### Extension won't load:
- Make sure you selected the `dist/` folder, not the project root
- Check that `manifest.json` exists in `dist/`
- Verify icons exist: `dist/icons/icon16.png`, `icon48.png`, `icon128.png`

### "Errors" tab shows issues:
- Click on the error to see details
- Common issues:
  - Backend not running (start backend server first)
  - CORS issues (check backend CORS configuration)
  - Missing permissions in manifest.json

### Auto-fill not working:
- Make sure you're logged in
- Profile must be at least 40% complete
- Navigate to a supported scholarship site
- Check browser console for errors (F12 → Console)

### Content script not injecting:
- Check the site URL matches patterns in `manifest.json`
- Try reloading the extension (click refresh icon in chrome://extensions)
- Reload the webpage after loading/updating extension

## Development Tips

### Live Development:
```bash
npm run dev
```
This watches for file changes and rebuilds automatically.

After code changes:
1. Click the refresh icon on extension card in `chrome://extensions/`
2. Reload the webpage you're testing on

### View Console Logs:
- **Popup logs**: Right-click extension icon → Inspect popup
- **Background logs**: Click "Inspect views: background page" in chrome://extensions
- **Content script logs**: Regular browser console (F12) on the webpage

### Test on Local Page:
Create a test HTML form at http://localhost:3000 with fields like:
```html
<input name="firstName" placeholder="First Name">
<input name="lastName" placeholder="Last Name">
<input name="email" type="email" placeholder="Email">
<textarea name="essay" placeholder="Essay response..."></textarea>
```

## Required Backend Setup

The extension requires the ScholarSync backend to be running:

```bash
cd ../scholarsync-backend
npm run dev
```

Backend should be accessible at `http://localhost:4000/graphql`

## Next Steps

Once the extension is loaded and working:
1. Complete your profile in the web app (localhost:3000)
2. Test on real scholarship websites
3. Report any bugs or issues
4. Customize the appearance/behavior as needed

## Publishing to Chrome Web Store

When ready to publish:
1. Create production build: `npm run build`
2. Zip the `dist/` folder
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Pay one-time $5 developer fee (if first extension)
5. Upload ZIP and fill out listing details
6. Submit for review (typically 1-3 days)
