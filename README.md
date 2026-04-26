# Emily Joy — Professional Singer

Website for Emily Joy, a professional singer based in Louth, Lincolnshire, performing jazz, pop and soul for weddings, corporate events and private functions.

**Live site:** https://gregkaighin.github.io/emily-joy/

**Admin (gig management):** https://gregkaighin.github.io/emily-joy/admin.html

---

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- [Bootstrap 5.3.8](https://getbootstrap.com/) — layout and carousel components
- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [Raleway](https://fonts.google.com/specimen/Raleway) — Google Fonts
- [Font Awesome 6.5](https://fontawesome.com/) — icons
- [Formspree](https://formspree.io/) — booking form submissions
- [Firebase Firestore](https://firebase.google.com/products/firestore) — upcoming gigs data

---

## Project Structure

```
emily-joy/
├── index.html
├── admin.html             ← password-protected gig management page
├── favicon.svg
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   ├── hero-bg.jpg
│   ├── thumbnail.jpg
│   ├── emily-portrait-1.jpg
│   └── emily-portrait-1.webp
└── video/
    └── showreel.mp4        ← excluded from git (see .gitignore)
```

The showreel video is hosted as a [GitHub Release asset](https://github.com/GregKaighin/emily-joy/releases/tag/v1.0) to keep the repository lean.

---

## Setup

No build step required — plain HTML/CSS/JS.

To run locally, open `index.html` directly in a browser or serve with any static server:

```bash
npx serve .
```

---

## Booking Form

Form submissions are handled by [Formspree](https://formspree.io/). To use a dedicated form endpoint:

1. Create a free account at formspree.io
2. Create a new form and copy the form ID
3. Replace the endpoint in `js/main.js`:

```js
fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

---

## Deployment

Hosted on [GitHub Pages](https://pages.github.com/) from the `master` branch.

To deploy updates:

```bash
git add .
git commit -m "Your message"
git push
```

GitHub Pages rebuilds automatically on every push.

---

## Upcoming Gigs

Gig data is stored in [Firebase Firestore](https://console.firebase.google.com/project/emily-joy/firestore).

To manage gigs, visit the admin page:

```
https://gregkaighin.github.io/emily-joy/admin.html
```

- **First visit:** you will be prompted to set an admin password
- **Add a gig:** enter a date and venue, click Add
- **Delete a gig:** click Delete next to any gig in the list
- Past gigs are automatically hidden from the public page (filtered by date client-side)

---

## Updating Content

| What | Where |
|------|-------|
| Hero background image | `images/hero-bg.jpg` |
| Video thumbnail | `images/thumbnail.jpg` |
| Portrait photo | `images/emily-portrait-1.jpg` + `.webp` |
| Showreel video | Upload to GitHub Releases, update `<source src="...">` in `index.html` |
| Upcoming gigs | `https://gregkaighin.github.io/emily-joy/admin.html` |
| Contact details | `index.html` — contact section |
| Social media links | `index.html` — `.social-link` anchors in contact section |
| Colours / fonts | `css/style.css` — `:root` variables |
