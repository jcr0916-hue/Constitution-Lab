# Constitution Lab

**An interactive laboratory for how constitutions are designed and how they behave.**

Power is designed. Explore constitutions through interactive experiments: make decisions, change the rules, and discover the consequences.

- **Live site:** https://constitution-lab.fyi (Netlify — Hobby)
- **Repo:** https://github.com/jcr0916-hue/Constitution-Lab
- **Stable branch:** `main` — do not push unfinished work here
- **Working branch for this stage:** `feature/stage-1-lab-ui`

## What this is

Constitution Lab is an independent, interactive educational project. It is not limited to republics or representative democracies — it explores constitutional monarchies, Athenian-style direct democracy, republics, oligarchies, theocracies, mixed systems, and other constitutional arrangements.

It is not a historical-document viewer and not a conventional civics textbook.

## How the site works

- **Welcome → Experiment 01 → Main Lab** — the intended visitor journey. The welcome screen offers two actions: **Enter the Lab — Take Office** (morphs into the Norland experiment without a page reload) and **Skip to Main Lab**.
- **Main Lab (`home/`)** — hub for **Learning**, **Experiments**, and **Constitution Builder** (planned, not yet built). Honest labeling for unfinished sections.
- **Notes & sources (`notes/`)** — what is invented (Norland, characters, game scoring) vs what is historical (cited cases), plus related projects.

Existing routes (`explorer/head-of-government/`, redirects) remain functional.

## Current structure

```
index.html                               # Welcome + embedded Experiment 01 (Norland)
assets/tokens.css                        # Design tokens — Experimental Lab palette
assets/base.css                          # Shell layout, nav, footer
assets/welcome.css                       # Welcome hero + lightweight transition
home/index.html                          # Main Lab hub
notes/index.html                         # Method, sources, related projects
explorer/head-of-government/index.html   # Comparison view (5 executive answers)
explorer/head-of-government/data.json    # Structured model + draft compatibility rules
netlify.toml / _redirects / CNAME        # Hosting config
```

The welcome, experiment, Main Lab, and notes pages use the new shared design tokens. The separate head-of-government comparison page retains its existing standalone styling pending Stage 1B.

## Visual identity — Stage 1A

**Direction:** Experimental Lab — contemporary, intelligent, energetic, experimental.

**Palette (tokens):** Midnight navy `#101A30`, Deep blue `#182A49`, Electric cyan `#32D8E5`, Ultraviolet `#8668FF`, Warm orange `#FF9B54` (light reading surfaces inside).

**Typography:** Editorial serif for major headlines, clean sans-serif for UI/labels/navigation. System font fallbacks — no external font dependency.

Avoid parchment, faux seals, generic cybersecurity/neon looks, and excessive effects. Reduced-motion is respected.

## Testing locally

No build step. Open directly or serve the static files:

```bash
# any static server — examples:
python3 -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.

**What to check:** welcome renders → Enter opens Norland without reload → Skip goes to Main Lab → Main Lab sections link correctly → Norland decision paths + rewind + session resume still behave → keyboard nav → reduced-motion → mobile/desktop → existing URLs still work.

## Workflow

- **Branch-first development.** Work on feature branches; merge to `main` only on explicit approval.
- **Netlify Hobby discipline.** Avoid avoidable deploys and preview builds. Keep the site static; no paid services, databases, or external APIs.
- **Federated Republic** is a separate project — do not modify it and do not make it central to this lab's identity.

## Stage notes

Stage 1A scope: visual foundation and navigation only (welcome transition + Main Lab hub). The broader Norland visual re-skin is Stage 1B. No builder implementation in this stage.
