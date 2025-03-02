# GitHub Blank Link Chrome Extension

## Overview

GitHub Blank Link is a simple yet powerful Chrome extension designed for GitHub users. It automatically sets links on GitHub Pull Request and Issue pages to open in new tabs.

## Usage

After installation, the extension automatically runs on GitHub PR and Issue pages. You can customize settings by:

1. Clicking the extension icon in the Chrome toolbar
2. In the popup settings panel:
   - Check/uncheck "Open PR links in new tab" to enable/disable the feature on PR pages
   - Check/uncheck "Open Issue links in new tab" to enable/disable the feature on Issue pages
   - Enter CSS class names to exclude in the "Excluded Classes" field (comma-separated)
3. Click "Save Settings" to apply changes

## Setting Options

| Option | Description | Default |
|--------|-------------|---------|
| PR Links | Enable opening links in new tabs on Pull Request pages | Enabled |
| Issue Links | Enable opening links in new tabs on Issue pages | Enabled |
| Excluded Classes | Don't process links under these CSS class names (comma-separated) | AppHeader |
