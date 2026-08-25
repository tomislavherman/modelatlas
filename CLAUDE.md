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

One array near the top of the script block.

- `D` — companies. `{c, r, f, n, u, m}`: company, region, founded, ownership,
  official site, models.

The page used to carry a second view listing the acquisitions, spinouts,
investments and lawsuits between these companies, held in an `R` array with an
`EXTRA` map of names that had no card of their own. That view and both arrays
were removed in August 2026. The page is the model list and nothing else, so
there is no tab bar either.

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

### Naming

- `→` is a version progression, **both sides spelled out in full**:
  `Aleph → Aleph 2.0`, not `Aleph → 2.0`. Exception: where a product name
  already prefixes bare version numbers, `Suno v1 → v5.5` is fine.
- `/` is sibling models released as a set, not a progression:
  `Aura 2 / Nova 3`, `GPT Image 1 / GPT Image 2`.

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
