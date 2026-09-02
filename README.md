# JMBurdett Systems — website

Single-page marketing / credibility site for **JMBurdett Systems** (custom AI solutions).
Static HTML/CSS/JS, no build step. Deploys to Vercel.

## Structure
```
jackburdett-site/
├── index.html        # the whole site (self-contained: inline CSS + JS)
├── assets/
│   └── images/       # put real images here (headshot, GBSC logo, etc.)
├── vercel.json       # optional Vercel config
└── README.md         # this file
```

## Before it goes live — fill the placeholders
Search `index.html` for **`SWAP:`** and **`EDIT:`**.

- [ ] **Headshot** — replace the `.avatar` circle in the About section with a real photo (drop the file in `assets/images/`, e.g. `jack.jpg`, then swap the `<div class="avatar">` for `<img src="assets/images/jack.jpg" ...>`).
- [ ] **GBSC quote** — replace the badged *Placeholder* testimonial with the club owner's **real, granted** words. Do NOT publish a fabricated quote (UK CAP Code + DMCC 2024 fake-testimonial ban).
- [ ] **Booking link** — point every "Book a call" (`href="#book"`) at your Cal.com URL.
- [ ] **Contact email** — `hello@jmburdett.com` (confirm / keep).
- [ ] **Live demo URL** — the "Try a live demo" / "See it live" links point at the Modal Crowngate demo; update if that URL changes.

## Deploy (Vercel)
No build step. Either:
- Drag this folder into the Vercel dashboard, **or**
- Connect the repo and set the project root to this folder.

Then add your domain and point DNS at Vercel.

## Domain plan (Sept 2026)
Deploys to a dedicated **figurehead domain** (bought September). `jmburdett.com` stays the
**cold-email sender only** and 301-redirects to the figurehead domain (keeps cold-send reputation
isolated). A temporary `*.vercel.app` URL can preview/share it before then.

## Live demo
Property-assistant demo (Modal): https://jackburdett7-dev--lead-assistant-fastapi-app.modal.run/property-demo
