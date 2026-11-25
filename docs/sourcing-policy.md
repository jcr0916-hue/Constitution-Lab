# Sourcing policy for real-world echoes

Agreed with John on 2026-11-25. This applies to every real-world case the site shows: the builder's echoes, the cases in its "Watch for" notes, and the real cases in experiment debriefs.

## Two tiers of source

Each echo makes two kinds of claim, and each kind gets its own source.

1. **The rule.** What the constitution actually says. Link the clause itself on the [Constitute Project](https://www.constituteproject.org/), which is free, neutral and searchable by clause. Link to the article's anchor (for example `German_Federal_Republic_2014#s477` for Article 67 of the Basic Law), not just the whole constitution.
   - If Constitute doesn't hold the text, link the official text instead (for example legislation.gov.uk for the UK Parliament Acts, The National Archives for Magna Carta).
   - If the version on Constitute is older or newer than the moment the echo describes, say so in the link label (for example "text before the 2024 amendment").
   - Some cases have no written clause to link (ancient Athens, Rome, Venice, France in 1789). They carry an event source only.
2. **What happened.** The events under that rule. Cite an established reference:
   - Encyclopaedia Britannica;
   - government, parliamentary or electoral archives (the Bundestag, the House of Commons Library, Hansard, the National Archives of Australia, an electoral commission);
   - academic or research summaries (German History in Documents and Images, International IDEA, the Congressional Research Service).
   - For very recent events that reference works don't cover yet, a report from a major news organisation is acceptable until a better source exists.

**Wikipedia is a starting point, never a citation.** Use it to find the primary or reference source, then cite that.

## Where sources live

- Each echo in `builder/data.json` carries a `sources` list. Each entry has `kind` (`rule` or `event`), a short `label` and a `url`. Cases in `interaction_rules` use the same shape under `{ "label", "sources" }`.
- The builder shows the links under each echo. "Watch for" cases link to their first source.
- `notes/` reads the same file and lists every echo with its sources, so the notes page and the builder can't drift apart.

## Neutral wording

Sources back up facts. They don't license verdicts.

- An echo describes one rule and what happened under it, never a whole country or a visitor's design.
- No "worked" or "failed", no scores. Say what happened and let the reader weigh it.
- Echo text is our own one- or two-sentence summary. It must be something every linked source supports.

## What's invented

Anything the site makes up (Norland and its characters, the builder's generated countries, people, parties and results, game scoring and the seat model) is labelled as invented on the notes page. Invented material never gets a source link that could make it look real.

## Adding or changing an echo

1. Write the echo text.
2. Find the clause on Constitute and copy the anchor link from the article heading.
3. Find at least one event source from the list above. Check that it supports every fact in the echo text, including dates and numbers.
4. Add both to `sources` in `builder/data.json`. The notes page picks them up automatically.
