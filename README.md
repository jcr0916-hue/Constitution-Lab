# Constitution Lab

**An interactive laboratory for how constitutions are designed and how they behave.**

Power is designed. Explore constitutions through interactive experiments: make decisions, change the rules, and discover the consequences.

- **Live site:** https://constitution-lab.fyi (Cloudflare Workers static assets)
- **Repo:** https://github.com/jcr0916-hue/Constitution-Lab
- **Stable branch:** `main` — do not push unfinished work here
- **Working branch for this stage:** `feature/stage-1-lab-ui`

## What this is

Constitution Lab is an independent, interactive educational project. It is not limited to republics or representative democracies — it explores constitutional monarchies, Athenian-style direct democracy, republics, oligarchies, theocracies, mixed systems, and other constitutional arrangements.

It is not a historical-document viewer and not a conventional civics textbook.

## How the site works

- **Welcome → Constitution Builder** — the welcome screen has one action, **Start your constitution**, which opens the builder (`builder/`).
- **Constitution Builder (`builder/`)** — phase 1: write three rules (who runs the government, the legislature, who chooses it), name the offices and bodies those rules create, then watch the government take office (seeded election, seat bars, coalition or appointment). "Watch for" notes and real-world echoes, no scores. Design: `docs/constitution-builder-design.md`.
- **Experiment 01 (`experiments/norland/`)** — the Norland bill-passing game, now reached from the Main Lab. Old `/#experiment` links redirect there.
- **Main Lab (`home/`)** — hub for **Learning**, **Experiments**, and the **Constitution Builder**.
- **Notes & sources (`notes/`)** — what is invented (Norland, characters, game scoring) vs what is historical (cited cases), plus the full list of builder echoes and their sources, read from `builder/data.json`. How cases are sourced: `docs/sourcing-policy.md`.

Existing routes (`explorer/head-of-government/`, redirects) remain functional.

## Current structure

```
index.html                               # Welcome → Start your constitution
builder/index.html, builder.js, builder.css, data.json  # Constitution Builder (levers, roles, name pools, rules, echoes)
experiments/norland/index.html           # Experiment 01 (Norland)
assets/tokens.css                        # Design tokens — Experimental Lab palette
assets/base.css                          # Shell layout, nav, footer
assets/welcome.css                       # Welcome hero + lightweight transition
home/index.html                          # Main Lab hub
notes/index.html                         # Method, sources, related projects
explorer/head-of-government/index.html   # Comparison view (5 executive answers)
explorer/head-of-government/data.json    # Structured model + draft compatibility rules
wrangler.jsonc / _redirects / _headers   # Hosting config (Cloudflare)
```

The welcome, experiment, Main Lab, notes, and head-of-government comparison pages now use the Experimental Lab design tokens. The comparison's underlying logic remains standalone and unchanged.

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

**What to check:** welcome renders → Start your constitution opens the builder → Draft, Form and Take office work for odd and non-democratic combinations → Experiment 01 still plays at `experiments/norland/` → Main Lab sections link correctly → Norland decision paths + rewind + session resume still behave → keyboard nav → reduced-motion → mobile/desktop → existing URLs still work.

## Workflow

- **Branch-first development.** Work on feature branches; merge to `main` only on explicit approval.
- **Free-tier discipline.** Avoid avoidable deploys and preview builds. Keep the site static; no paid services, databases, or external APIs.
- **Federated Republic** is a separate project — do not modify it and do not make it central to this lab's identity.

## Stage notes

Stage 1A scope: visual foundation and navigation only (welcome transition + Main Lab hub). The broader Norland visual re-skin is Stage 1B. No builder implementation in this stage.

## Stage 1B — Visual integration (feature branch only)

Norland reading and outcome cards now use cool, high-legibility surfaces rather than parchment beige. The head-of-government comparison page uses the shared navy/cyan/violet visual language and links directly to the introductory experiment. These are visual/navigation changes; the educational models, authored outcomes and scoring are unchanged. Browser-level responsive, interaction, contrast and keyboard testing remains required before production merge.
