# Mansi & Raghav — Wedding Invitation

A mobile-first wedding invitation website: a full-screen envelope that opens into the invite, scratch-to-reveal date with countdown, stacked event cards and a day-by-day timeline.

Plain static HTML/CSS/JS — no build step.

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/.

## Host on GitHub Pages

1. Repo **Settings → Pages**.
2. **Source:** Deploy from a branch. **Branch:** `main`, folder `/ (root)`. Save.
3. The site is published at `https://<username>.github.io/Di/` within a minute or two.

## Two invite links

- Bride's side: `/` shows **Mansi & Raghav** and **Kanodia & Singla Families**.
- Groom's side: `/raghav/` shows **Raghav & Mansi** and **Singla & Kanodia Families**. It redirects to `/?side=groom`, and a small script in `index.html` swaps the names, so both links always share the same page.

## Editing details

- Names, dates, events and venue: `index.html`.
- Countdown target: `app.js` (`target` date).
- Event photos: `assets/caricature-*.jpg`; envelope artwork: `art/`.
- Background music: `audio/wedding-instrumental.mp3` — "Indian Wedding" by India_Happy, from [Pixabay](https://pixabay.com/music/folk-indian-wedding-490659/) under the Pixabay Content License (free for use, no attribution required). Starts when the envelope is opened; the gold button toggles it.
