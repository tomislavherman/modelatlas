# modelatlas

A single static page indexing generative media models and the companies behind
them. Everything lives in `index.html` — data, styles and script. No build step,
no dependencies, no framework. `README.md` is the human-facing summary of the
same rules; this file is the operational detail, including the traps.

Run `node check.js` after every data edit. It reads `index.html`, asserts the
invariants below, and prints every badged model so you can eyeball the result.

## Scope

Image, video, world/3D, avatar, audio (speech, music, sound effects), text
(chat, coding, embeddings) and robotics (vision-language-action models).

Text models were out of scope until August 2026 and are now in. What is still
out: anything that is not a model with a name and a release date — datasets,
inference chips, agent products that wrap someone else's model, fine-tunes of
an open-weights model by a company that did not train the base.

A company card exists for the company, not the product, so a company with no
model in any of these categories still gets a card with an empty `m: []`.

## The data

Two arrays near the top of the script block, one per view.

- `D` — companies. `{c, r, f, n, u, m}`: company, region, founded, ownership,
  official site, models. Renders the **Models** view.
- `H` — the changelog. `{t, y, c, n, k, x, u}`: type, day, company, model,
  tags, detail, link. Renders the **Changelog** view.

The page carried a third array once: an `R` list of acquisitions, spinouts,
investments and lawsuits between these companies, with an `EXTRA` map of names
that had no card of their own. That view and both its arrays were removed in
August 2026 and are not coming back. The tab bar returned in September 2026
for the changelog.

### The changelog: `{t, y, c, n, k, x, u}`

`H` is **append-only history**, and the one place in this repo where the date
is not a release date. `y` is the day the change landed *in this page*,
`YYYY-MM-DD`, which is why a model released in 2024 can carry a 2026 entry: it
records when the atlas learned of it, not when the vendor shipped it.

`t` is `added`, `announced` or `retired` in the data, but the page shows those
three as **Listed**, **Slated** and **Ended**. The rename is deliberate: the
model list's New / Announced / Retired describe what a model *is* right now,
and the changelog's three describe what happened to it on a day. Different
words mean a reader never has to work out which of the two they are reading.
Both sets share the three status colours, since they are the same three
states seen from different angles.

The state names are display-only — `t` in the data stays `added` /
`announced` / `retired`, and that is what you write in `H`.

The status row belongs to its view and sits under the tabs, so each view keeps
its own selection: filtering the model list to Retired does not filter the
changelog to Ended. Category, subcategory and search sit above the tabs and
are shared, because "show me audio" means the same thing to both.

`n` names the version that changed, `c` the company (it must match a `c` in
`D`, and `check.js` enforces that). `k`, `x` and `u` are the model's tags,
detail and link **as they read on the day**, copied rather than referenced.
That duplication is deliberate: an entry is a record of what the page said at
the time, so it must not shift when the model card is later reworded, renamed
or split.

Newest first, and `check.js` fails if the array falls out of order.

**Never rewrite or delete an entry.** A wrong entry is corrected by appending a
new one, the same way you would not rewrite a commit that is already pushed.
The one thing that legitimately edits `H` is a bug in how an entry was
generated on the day it was written, caught before it ships.

The counts in the two views will not agree, and should not. The model list
shows 12 Retired badges against 9 retired entries in the changelog, because
one retirement of a grouped card in August covered two versions that are
separate cards today. State and history answer different questions.

### A model: `{n, k, d, x, u}`

Renders as exactly three lines, which is the whole reason `d` and `x` are
separate fields:

```
n   FLUX 3            [badge]     name(s), with the badge appended
d   Jul 2026 → video GA Aug 2026  dates, mono type
x   One backbone for image, …     detail, body type, may be ""
```

`u` is optional. A model without one falls back to its company's `u`; a company
without `u` renders as plain text.

**`d` is the only field the ordering and badge code reads.** A date written into
`x` is invisible to every sort and every badge. `check.js` fails on a bare year
in `x` unless it is worded as a feature note ("Audio added May 2026").

`d` holds the lifecycle and nothing else: when it shipped, when later versions
shipped, when it dies. `x` holds what it is and why it matters.

### One card per version

**A card is one release.** A new version gets its own card. Never append
`→ NewVersion` to the card already there.

This was the other way round until September 2026: a point release extended
the `d` line of the progression already on the page. `GPT Image 1 / GPT Image
2 → GPT Image 2.5 Flare / GPT Image 2.5 Sunburst` was one card carrying three
generations and four dates on three lines. Two things were wrong with it. It
was unreadable — and, the reason it had to change, **a badge is computed per
card**, so a retired version sharing a card with a live successor could never
show Retired. DALL·E, Imagen and Suno v1 were all switched off and all
rendered as live. Splitting the catalogue moved 8 Retired badges to 12
without a single new fact.

`→` survives in `n` for exactly one case: two names with a **single** release
date between them, where splitting would mean inventing the second date.
Baidu's `MuseSteamer → MuseSteamer 2.0` on `d:"2025"` is the only one left.
`check.js` enforces the rest — two names in `n` plus two dates in `d` fails,
and three names fails regardless of dates.

`→` in **`d`** is untouched and still means what it always did: the lifecycle
of the one model on that card. `Sep 2025, app closed Apr 2026, API ends Sep
2026` is one model's life; `Aug 2026 → Flash Sep 2026` is one release growing
a tier.

- Both sides of a split spelled out in full: `Aleph` and `Aleph 2.0`, never a
  bare `2.0`. This applies to product names that prefix bare version numbers
  too — `Suno v1` and `Suno v5.5` are separate cards.
- `/` is unaffected: sibling models released **as one set, on one date**, stay
  on one card. `Aura 2 / Nova 3`, `GPT Image 2.5 Flare / GPT Image 2.5
  Sunburst`, `Claude Mythos 5.1 / Claude Fable 5.1`.

**Splitting adds no facts.** Redistribute the dates and prose that are already
there; where a detail plainly belongs to the newer version, it goes on the
newer card and the older one gets `x:""`. Do not invent a description, a
parameter count or a link for the older version to make its card look full.
A version-specific `u` follows its version; a line-level product page can sit
on both cards.

### Category tags

`image`, `video`, `world`, `avatar`, `robotics`, `audio:speech`,
`audio:music`, `audio:sfx`, `text:chat`, `text:code`, `text:embed`. A model can
carry several; **`k[0]` sets the card's colour**, so put the primary modality
first.

Chat and coding share the `text` base on purpose. Most frontier models do both,
and a shared base means GPT-5 is one card carrying `["text:chat","text:code"]`
rather than two cards in two colours. The same reasoning already applies to
video models that generate their own sound: `["video","audio:sfx"]`.

`robotics` is for models that output robot actions. Before August 2026 these
were tagged `world` for lack of anywhere better — FLUX-mimic is the example.

Each base tag may have a row of sub-filters under the main filter bar, defined
in `SUBF` keyed by base. Only `audio` and `text` have one; a base missing from
`SUBF` shows no sub row.

## How dates are read

`NOW` is the current month as `year*12+month`. It drives every badge and the
cap on bare years. `check.js` fails if `NOW` disagrees with the "Compiled …"
date printed in the header — bump both together or neither.

`RETIRED` strips any clause following a retirement word (`retired`, `EOL`,
`wind-down`, `closed`, `ends`, `discontinued`, `shut down`, `removed`) up to the
next comma. Everything downstream reads the stripped line.

**Why:** a retirement date is not a release. Without stripping, Sora 2's
`API ends Sep 2026` made it the newest OpenAI model on the page, above one
actually released in Jul 2026. If you add a new way of saying "this is going
away", add the word to `RETIRED` too — otherwise a future shutdown date reads
as a future *release* and wrongly earns the Announced badge.

`dates()` reads every remaining date. A month-qualified date is exact (`x:1`).
A bare year, or a span like `2024–26`, is imprecise (`x:0`): read as December of
that year but **capped at `NOW`**, because a shipped model cannot have shipped
in the future.

**Why the cap:** without it a bare `2026` scored December 2026 and outranked a
real `Aug 2026`, which put 17 vaguely-dated companies above precisely-dated
ones at the top of the page. `cmpDate` then breaks ties on precision, so an
exact date beats a bare year landing on the same month.

Ordering: company cards rank on the newest model **currently shown**, so
filtering to Audio reorders the page around audio releases. A card showing no
dated model sorts last (Anthropic).

## Badges

At most one per model, tested in this order by `badge()`:

| Badge | Condition |
|---|---|
| **Retired** | a retirement date in `d` has already passed, or a retirement word carries no date |
| **Announced** | `d` says `announced`/`expected`/`planned`/`preview`/`coming`/`waitlist`/`slated`, or names a month still in the future |
| **New** | `d` names an explicit month equal to `NOW` |

Because a badge is per card and a card is one version, a retirement lands on
exactly the version it retires. When a vendor switches off part of a line —
DeepSeek's V4-Flash tiers going while V4.1-Flash ships — the retirement clause
goes on the retired version's card and the successor's card stays clean.

Deliberate gaps, do not "fix" them without asking:

- A retirement **still in the future** gets no badge at all, because the model
  is still running. Nova Reel's `EOL Sep 2026` is bare on purpose. There is no
  Sunsetting badge; adding one has been discussed and deferred.
- A bare year is **never** New. `2024 → 2026` carries no month, and the New
  test requires an explicit one — this is checked separately from `dates()` so
  it stays correct if `NOW` ever lands in December.

## Links

Point at the page that documents **that model**, not a listing page. Vendor
`/models` index pages show whatever is currently being promoted, so they go
stale silently: four BFL models pointed at `bfl.ai/models` and all four landed
the reader on FLUX.2 Max. Prefer `bfl.ai/models/flux-3` over `bfl.ai/models`.

An HTTP 200 does not mean the link is right. To find dead links:

```sh
grep -o 'https://[^"]*' index.html | sort -u \
  | xargs -P 12 -I{} sh -c 'echo "$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 20 -A "Mozilla/5.0" "{}") {}"' \
  | grep -v '^200'
```

## Accuracy

Founding dates and ownership are the stable part. Version numbers
move monthly. Anything dated after the training cutoff must be verified against
a real source before it goes in — do not write a version number from memory.
