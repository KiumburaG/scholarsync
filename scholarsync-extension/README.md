# ScholarSync Chrome Extension

AI-powered Chrome extension for scholarship applications with form autofill and essay generation.

## Features

- **Smart Form Detection**: Automatically detects scholarship application forms
- **Auto-Fill**: Fills forms with your profile data in one click
- **Essay Detection**: Identifies essay prompts on scholarship pages
- **Profile Integration**: Syncs with your ScholarSync web profile
- **Secure Authentication**: JWT-based login with encrypted storage

## Development

### Prerequisites

- Node.js 16+
- Chrome browser

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode

Run with auto-rebuild on file changes:
```bash
npm run dev
```

Then reload the extension in Chrome after changes.

## Project Structure

```
src/
├── background/       # Background service worker
│   └── background.ts
├── content/          # Content scripts (runs on pages)
│   └── content.ts
├── popup/            # Extension popup UI
│   ├── popup.html
│   ├── popup.tsx
│   ├── popup.css
│   └── components/
│       ├── App.tsx
│       ├── Login.tsx
│       └── Dashboard.tsx
└── lib/              # Shared utilities
    ├── api.ts        # Backend API client
    └── formDetector.ts  # Form detection logic
```

## Usage

1. **Sign in**: Click the extension icon and log in with your ScholarSync account
2. **Navigate** to a scholarship website (e.g., Bold.org, Scholarships.com)
3. **Auto-fill**: The extension will detect forms and offer to auto-fill them
4. **Generate Essays**: Use the essay generator for application prompts

## Supported Sites

- Scholarships.com
- Fastweb.com
- Bold.org
- Cappex.com
- Niche.com
- And many more scholarship platforms

## Building for Production

```bash
npm run build
```

The production-ready extension will be in the `dist/` folder.

## Tech Stack

- TypeScript
- React 18
- Webpack 5
- Chrome Extension Manifest V3
- GraphQL (API communication)
