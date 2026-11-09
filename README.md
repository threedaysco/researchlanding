# threedays.co

Landing page for Threedays: frontier AI for foundational industries.

Plain static site, no build step.

```
index.html     the whole page: markup, styles (in <style>, variables at the top) and SVG drawings
favicon.svg    3/D callout mark
```

Fonts load from Google Fonts: IBM Plex Sans, IBM Plex Mono, Barlow Semi Condensed and Archivo (expanded, 800) for the wordmark.

## Run locally

```
npx serve .
```

or just open `index.html` in a browser.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository.
3. Framework preset: **Other**. Leave the build command empty; output directory is the repository root.
4. Deploy, then add the `threedays.co` domain under **Settings → Domains**.

## Before launch

- Point the "Work with us", "Get in touch" and "License your data" buttons at a real destination (a `mailto:` address or a form). They currently scroll to the footer.
- Add a 1200×630 `og.png` for link previews and restore the `og:image` and `twitter:card` tags.
- Confirm the canonical URL (`https://threedays.co/`).
