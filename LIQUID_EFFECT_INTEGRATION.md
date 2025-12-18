# Liquid Effect Integration Guide

This document explains how to integrate the transparent liquid effect and color palette into the FYCS Notes Hub website.

## Color Palette

The website now uses the following color palette:
- Primary Background: #FFF5E1 (Cream)
- Secondary Background: #EBC176 (Light Gold)
- Accent Color: #C48B28 (Gold)
- Text Color: #5A3C0B (Dark Brown)

These colors have been applied throughout the site's CSS files.

## Liquid Effect Implementation

The liquid effect is implemented using a third-party library from Three.js components. Here's how it works:

### How It Works

1. The liquid effect is added to all pages via the `liquid-effect.js` script
2. The script creates a canvas element and applies a WebGL-based liquid distortion effect
3. The effect uses a background image and applies dynamic distortions to create the liquid appearance

### Files Added

1. `assets/liquid-effect.js` - Main script that initializes the liquid effect
2. `components/ui/demo.html` - Demo page showing the liquid effect
3. `components/ui/liquid-effect-animation.tsx` - React component version (not used in this project)

### Integration Steps

The liquid effect has been integrated into all HTML pages by:

1. Adding the Montserrat font link in the `<head>` section:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
   ```

2. Including the liquid effect script before the closing `</body>` tag:
   ```html
   <script src="assets/liquid-effect.js"></script>
   ```

### Customization

To customize the liquid effect:

1. Modify the background image URL in `assets/liquid-effect.js`
2. Adjust the metalness and roughness values in the script
3. Change the displacement scale for more or less distortion

### Troubleshooting

If the liquid effect is not working:

1. Ensure the browser supports WebGL
2. Check that the CDN link to the Three.js components is accessible
3. Verify that the `liquid-effect.js` file is correctly loaded

## Browser Support

The liquid effect requires:
- Modern browser with WebGL support
- JavaScript enabled
- Access to external CDN resources

## Performance Considerations

The liquid effect uses WebGL which can be GPU intensive. On lower-end devices, the effect may impact performance. The effect is designed to automatically clean up when the page is unloaded.