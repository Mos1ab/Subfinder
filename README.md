# SubFinder Browser Extension

A browser extension that adds convenient subtitle search buttons to popular anime, movie, and TV database websites.

## Features

- 🎬 **Wide Site Support**: Works on 11+ popular media database sites
- 🔍 **Smart Search**: Automatically fetches IMDb IDs using OMDb API for accurate subtitle matching
- ⚙️ **Customizable**: Choose between subdl.com or subsource.net as your subtitle provider
- 🎯 **One-Click Access**: Direct links to subtitle pages without manual searching

## Supported Websites

- **Anime**: MyAnimeList, AniList, Kitsu, Anime-Planet, Anime News Network, AniDB, LiveChart
- **Movies & TV**: IMDb, The Movie Database (TMDb), TheTVDB, Trakt

## Installation

### From Source
1. Download or clone this repository
2. Open your Chromium-based browser (Chrome, Edge, Brave, etc.)
3. Navigate to `chrome://extensions`
4. Enable **Developer mode** (toggle in top-right corner)
5. Click **Load unpacked** and select the extension folder

## Setup

1. Click the extension icon in your browser toolbar
2. Choose your preferred subtitle site (subdl or subsource)
3. **(Optional)** Add an OMDb API key for better results:
   - Get a free API key from [OMDb API](https://www.omdbapi.com/apikey.aspx)
   - Paste it into the extension settings
   - The extension works without an API key, but may have fewer successful matches
4. Click **Save**

## Usage

1. Visit any supported website (e.g., MyAnimeList, IMDb, TMDb)
2. Navigate to an anime, movie, or TV show page
3. Look for the **"Search on subdl/subsource"** button
4. Click to open subtitle search results in a new tab

The button appears automatically when an IMDb ID is found for the content.

## Permissions Explained

- **storage**: Saves your subtitle provider preference and OMDb API key locally
- **scripting**, **tabs**: Detects supported websites and injects the search button
- **host_permissions** (omdbapi.com): Makes API requests to fetch IMDb IDs

## Privacy

- All settings are stored locally in your browser
- Your OMDb API key never leaves your device (only used for direct API calls)
- No data collection or tracking

## Troubleshooting

**Button not appearing?**
- Ensure you're on a title/show page (not a list/directory page)
- Try refreshing the page
- Add an OMDb API key for better detection

**Wrong subtitle results?**
- The extension relies on IMDb ID matching; some titles may have multiple versions
- Try the alternative subtitle site in settings

## Development

Built with vanilla JavaScript for maximum compatibility and performance.

**Structure:**
- `manifest.json` - Extension configuration
- `background.js` - Service worker for tab management
- `main.js` - Content script that injects search buttons
- `popup/` - Settings interface (HTML, CSS, JS)
- `assets/` - Extension icons

## Credits

**Developer**: [mos1ab](https://github.com/mos1ab)

## License

This project is open source and available for personal use.

---

**Note**: This extension requires an active internet connection and relies on third-party APIs (OMDb) for optimal functionality.
