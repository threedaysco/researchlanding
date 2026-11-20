# threedays.co

Landing page for Threedays: frontier AI for foundational industries.

Static site with one Vercel Function for the contact form. No build step.

```
index.html       the whole page: markup, styles (in <style>, variables at the top), SVG drawings and form script
api/contact.js   contact form endpoint (Vercel Function), emails each submission
favicon.svg      3/D callout mark
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

- Set up the contact form email (see below).
- Add a 1200×630 `og.png` for link previews and restore the `og:image` and `twitter:card` tags.
- Confirm the canonical URL (`https://threedays.co/`).

## Contact form

Submissions go to `POST /api/contact`, which emails them through [Resend](https://resend.com). Every contact button scrolls to the form and sets a topic (General, AI lab, Data partner) that appears in the email subject. Visitors can also write to hello@threedays.co directly.

Setup:

1. Create a Resend account and verify the `threedays.co` domain (Resend shows the DNS records to add).
2. Create an API key in Resend.
3. In Vercel → Settings → Environment Variables, add:
   - `RESEND_API_KEY`: the key
   - `CONTACT_FROM`: a sender on the verified domain, e.g. `Threedays <forms@threedays.co>`
   - `CONTACT_TO` (optional): where submissions go; defaults to `hello@threedays.co`
4. Redeploy.

Until those are set, the form tells visitors to email hello@threedays.co instead. Replies go straight to the sender (the email's reply-to is their address). A hidden field filters basic spam bots.

Local testing needs `vercel dev` (the function doesn't run under a plain static server).
