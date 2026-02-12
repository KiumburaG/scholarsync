#!/usr/bin/env python3
"""
Generate placeholder PNG icons for Chrome extension.
Requires: pillow (pip install pillow)
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Error: pillow library not found.")
    print("Install it with: pip3 install pillow")
    exit(1)

def create_icon(size, filename):
    """Create a simple icon with gradient background and 'S' text."""
    # Create image with purple gradient background
    img = Image.new('RGB', (size, size), '#667eea')
    draw = ImageDraw.Draw(img)

    # Try to use a system font, fall back to default if not available
    try:
        font_size = int(size * 0.5)
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
    except:
        font = ImageFont.load_default()

    # Draw 'S' in center
    text = 'S'
    # Get text size
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center text
    x = (size - text_width) // 2
    y = (size - text_height) // 2

    # Draw text
    draw.text((x, y), text, fill='white', font=font)

    # Save
    img.save(filename)
    print(f"Created {filename} ({size}x{size})")

if __name__ == '__main__':
    import os

    # Create icons directory if it doesn't exist
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)

    # Generate icons
    create_icon(16, 'icons/icon16.png')
    create_icon(48, 'icons/icon48.png')
    create_icon(128, 'icons/icon128.png')

    print("\n✓ All icons generated successfully!")
    print("Run 'npm run build' to copy them to the dist folder.")
