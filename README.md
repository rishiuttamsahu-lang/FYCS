# FYCS Notes Hub - Semester 2

This is a web-based platform for managing and accessing academic notes for FYCS (FY Computer Science) Semester 2 students.

## Features

- **User Authentication**: Secure login and signup system
- **Note Management**: Upload, view, and organize notes by subject
- **Admin Panel**: Dedicated interface for administrators to manage content
- **Responsive Design**: Mobile-friendly interface
- **Beautiful UI**: Modern glass-morphism design with custom color palette
- **Liquid Effect**: Transparent liquid animation background effect

## Color Palette

The website uses a warm, inviting color palette:
- Primary Background: #FFF5E1 (Cream)
- Secondary Background: #EBC176 (Light Gold)
- Accent Color: #C48B28 (Gold)
- Text Color: #5A3C0B (Dark Brown)

## Liquid Effect

The website features a transparent liquid animation effect on all pages. This effect:
- Uses WebGL technology for smooth performance
- Provides a dynamic, engaging background
- Is non-intrusive and doesn't affect content readability
- Automatically cleans up when navigating away from pages

For implementation details, see [LIQUID_EFFECT_INTEGRATION.md](LIQUID_EFFECT_INTEGRATION.md).

## File Structure

```
fycs-notes-hub-sem2/
├── assets/
│   ├── auth.js          # Authentication functions
│   ├── liquid-effect.js # Liquid animation effect
│   ├── mobile.css       # Mobile-specific styles
│   ├── notes.js         # Note management functions
│   ├── script.js        # General scripts
│   ├── style.css        # Main stylesheet
│   └── ui.js            # UI functions
├── components/
│   └── ui/
│       ├── demo.html
│       ├── liquid-effect-animation.tsx
│       └── liquid-demo.html
├── practical-notes/
│   ├── algo-practical.html
│   ├── oop-practical.html
│   ├── python.html
│   └── webdev.html
├── subjects/
│   ├── algo.html
│   ├── cc.html
│   ├── evs.html
│   ├── hindi.html
│   ├── hrm.html
│   ├── minor.html
│   ├── mm2.html
│   └── oop.html
├── admin.html
├── index.html
├── liquid-demo.html
├── LIQUID_EFFECT_INTEGRATION.md
├── login.html
└── signup.html
```

## Getting Started

1. Open `index.html` in a web browser
2. Sign up for a new account or log in with existing credentials
3. Explore notes organized by subject
4. Admin users can access the admin panel to upload and manage notes

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- JavaScript (ES6+)
- Three.js (for liquid effect)
- Web Storage API (localStorage)

## Browser Compatibility

The website works best in modern browsers that support:
- ECMAScript 6+
- CSS Grid and Flexbox
- localStorage API
- WebGL (for liquid effect)

## Contributing

This is an educational project. Contributions are welcome in the form of suggestions, bug reports, or feature requests.

## License

This project is for educational purposes only.