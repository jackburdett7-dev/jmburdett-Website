# JMBurdett Systems — website

Single-page credibility site for **JMBurdett Systems** at **jmburdett.com** (the main domain for
now: site and client email). Static HTML/CSS/JS, no build step. Pushes to `main` auto-deploy on
Vercel.

## Where it is built
Built with the **scroll-craft** skill. The working copy, brief, build report and verification
screenshots live outside this repo, in `C:/Users/jackb/scrollcraft/builds/jmburdett/`
(`BRIEF.md` holds Jack's feedback verbatim; `BUILD-REPORT.md` what was verified). Edit and verify
there, then copy the package below into this folder and push.

## Structure
```
jackburdett-site/
├── index.html        # the page (real HTML; scroll behaviour comes from data-sc-* attributes)
├── site.css          # page styles and tokens
├── site.js           # page behaviour: WebGL light-field, the self-drawing system map,
│                     #   the rotating Lead Assistant examples, keyboard parking, Lenis glide
├── scrollcraft.css   # scroll engine (from the scroll-craft skill; never edit per project)
├── scrollcraft.js    #   "
├── lenis.min.js      # smooth wheel scrolling, Lenis 1.3.26 (MIT)
├── assets/jack.jpg   # headshot (assets/images/ is the old site's copy)
├── og.png            # link-preview image, rendered from the hero
├── privacy.html      # UK GDPR privacy notice (Article 14) — linked from the cold email signature
├── robots.txt, sitemap.xml
└── vercel.json
```

## Honesty rules the copy follows
- The Lead Assistant **does not book calendar slots**: it answers, captures the details, confirms a
  callback with a reference, emails the customer and the business, puts the lead on the dashboard,
  and chases after 48 hours. The rotating panel's four scenes are labelled examples.
- GBSC figures are real (live Supabase, Sept 2026): 25 enquiries since the end of May, 18 in the
  evening or at a weekend. Michael's quote is his approved wording, without the unverified
  "twice as many" line.

## Live demo linked from the page
Accountancy demo (Modal): https://jackburdett7-dev--lead-assistant-fastapi-app.modal.run/accountants
