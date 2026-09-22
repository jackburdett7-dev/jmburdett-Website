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
or parallax, and the background light is painted once. **The hero is type only:** "AI automation,
done for you." sized from the page width (9.6cqi, about 124px at 1440). The system map is gone, and
Jack rejected the Lead Assistant panel in the hero too. **Two pieces of motion stay because Jack
asked for them back:** the Lead Assistant panel beside Michael's quote (examples land in turn and
rotate on the tab timer; a tab click stops it) and the "What I build" rail, which pans sideways
as the page scrolls (the one pinned act, span 3.4).
Plus a short one-time fade as a section arrives (engine `data-sc-in`).

## Structure
```
jackburdett-site/
├── index.html           # the page
├── site.css             # page styles and tokens
├── site.js              # the still light-field (WebGL, painted once), the rotating Lead Assistant
│                        #   examples, header glass
├── scrollcraft.css/js   # engine from the scroll-craft skill (never edit per project): tokens,
│                        #   layout helpers, the services rail (pan act) and the section fade
├── assets/jack.jpg      # headshot
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
- The Lead Assistant **does not book calendar slots**: it answers, captures the details, confirms a
  callback with a reference, emails the customer and the business, and puts the lead on the
  dashboard. The four example scenes are labelled examples.
- **Follow-ups carry no hour claim.** The customer chase is due 48h after the enquiry but only sends
  once the firm has marked the lead "contacted", and the cron runs daily at 09:00 UTC (so 48 to
  72h). Hence "Followed up if she goes quiet after your call".
- Michael's quote is his approved wording, without the unverified "twice as many" line. "Over a
  third at weekends" is true (9 of 25, live Supabase, Sept 2026).
- No claims about what "most clients" do: there are two clients.
- The demo link was removed on 22 Sep (the demo page itself uses emoji icons and em dashes).
  Add it back only once the demo is cleaned up.
