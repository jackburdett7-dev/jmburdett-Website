# JMBurdett Systems · website

Single-page credibility site for **JMBurdett Systems** at **jmburdett.com** (the main domain for
now: site and client email). Static HTML/CSS/JS, no build step. Pushes to `main` auto-deploy on
Vercel.

## Where it is built
First built with the **scroll-craft** skill. The working copy, brief, build report and verification
screenshots live outside this repo, in `C:/Users/jackb/scrollcraft/builds/jmburdett/`
(`BRIEF.md` holds Jack's feedback verbatim; `BUILD-REPORT.md` what was verified). Edit and verify
there, then copy the package below into this folder and push.

**Since 22 Sep 2026 motion is deliberate and small.** Jack's standing rules: no over-the-top scroll
animation, no cursor animation, no em dashes, no emoji icons, no fake reviews, metrics or
counters, no vague hero text, no AI-sounding copy. So: no smooth-scroll, no pointer tilt, magnet
or parallax, and the background light is painted once.

**15 Oct 2026: websites only.** The business is now website design, build and upkeep for small
local organisations, with no AI services and no AI copy anywhere on the site. Don't add the Lead
Assistant, chatbots, automation or "AI" back. **The hero is type only:** "Your website, done for
you." sized from the page width (9.6cqi). Michael's quote and the Lead Assistant panel, demos and
how-it-works section are gone (all about the chatbot). In their place, **Recent work**: GBSC,
Littlefield and Alexander, each beside a screenshot of the live homepage (`assets/work-*.jpg`,
1440x900, captured 15 Oct with the GBSC chat widget hidden). The "What I do" rail still pans
sideways as the page scrolls (the one pinned act, span 3.4).
Plus a short one-time fade as a section arrives (engine `data-sc-in`).

## Structure
```
jackburdett-site/
├── index.html           # the page
├── site.css             # page styles and tokens
├── site.js              # the still light-field (WebGL, painted once), header glass (the old
│                        #   example and demo code is inert: its elements are gone)
├── scrollcraft.css/js   # engine from the scroll-craft skill (never edit per project): tokens,
│                        #   layout helpers, the services rail (pan act) and the section fade
├── assets/jack.jpg      # headshot
├── assets/work-*.jpg    # live-site screenshots for Recent work
├── og.png               # link-preview image, rendered from the hero at 1200x630
├── favicon.svg/.ico, apple-touch-icon.png   # the "J" mark, drawn as a shape (no font needed)
├── privacy.html         # UK GDPR privacy notice (Article 14), linked from the cold email signature
├── terms.html           # website terms + terms of business (mirrors the contract template,
│                        #   adds UK GDPR Art. 28 processor terms)
├── 404.html             # served by Vercel for missing paths
├── robots.txt, sitemap.xml
└── vercel.json          # www.jmburdett.com → jmburdett.com (308)
```

## Honesty rules the copy follows
- Only real, live sites in Recent work. Alexander's is a friend's site built unpaid: it says "a
  friend's", never "client".
- No claims about what "most clients" do beyond what is true (a club, a riding school, trades).
- No figures, no turnaround promises, no prices on the page.
- privacy.html and terms.html still describe the Lead Assistant and the AI providers on purpose:
  the GBSC chatbot is still live and those pages must stay accurate. Update them when it comes off.
