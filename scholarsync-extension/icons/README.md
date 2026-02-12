# Extension Icons

Place icon files here:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

These icons will be displayed:
- icon16: Browser toolbar
- icon48: Extension management page
- icon128: Chrome Web Store

For now, you can use placeholder images or create custom icons with a design tool.

To generate placeholder icons quickly:
```bash
# Using ImageMagick (if installed)
convert -size 16x16 xc:#667eea icon16.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png
```

Or use an online tool like:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
