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
  official site, models. Renders the **All** view, and the **Open weights**
  view, which is the same list narrowed to models carrying `o`.
- `H` — the changelog. `{t, y, f, c, n, k, x, u}`: type, the day the source
  did it, the day this page found out, company, model, tags, detail, link.
  Renders the **Changelog** view.

The page carried a third array once: an `R` list of acquisitions, spinouts,
investments and lawsuits between these companies, with an `EXTRA` map of names
that had no card of their own. That view and both its arrays were removed in
August 2026 and are not coming back. The tab bar returned in September 2026
for the changelog.

### The changelog: `{t, y, f, c, n, k, x, u}`

`H` is **append-only history** carrying two dates, and the difference between
them is the whole design:

- **`y` — the day the source did it**, which for each `t` is the day the
  *event in the row* happened, never a date in the future:
  - `added` — the day the model shipped.
  - `announced` — the day of the announcement, **not** the date it is expected
    to ship. `d` usually holds the expected date, so take the date in the
    announce clause, which is the first one on the line.
  - `retired` — the day the retirement was **announced**, not the day the
    switch is thrown. Sora 2 was announced on 24 Mar 2026 for a 24 Sep 2026
    shutdown, and the row belongs in March. A vendor's deprecation page is the
    place to find it; `d` only carries the effective date.

  It is only as precise as the source: `2026-09-22`, `2026-09` or `2026`.
  Never pad a month out to a day to make it look exact.
- **`f` — the day this page found out.** Always `YYYY-MM-DD`, always known.
  This is the order `H` is physically stored in, so appending is still a line
  at the top with nothing below it moving.

`y` was the only date until September 2026, and it meant `f`. A model released
in 2024 and noticed in 2026 was filed under 2026, so the changelog was sorted
by how late the atlas was rather than by what happened — Whisper sat above
models that shipped three years after it. Splitting the two fixed the order
and kept the audit trail: `f` still answers "when did the sweep catch this",
which is how a missed release gets spotted.

(`D` also has an `f`. There it is a company's founding year. Different array,
different field, no relation.)

**The view shows only rows pinned to a day.** `renderLog` drops anything whose
`y` is a month or a year: a vague row sitting beside exact ones reads as though
the two were equally known, and they are not. The entry stays in `H` and
reappears the moment someone sources its date.

That filter is strict — most rows are hidden — and the proportion is the point.
`check.js` prints it on every run, because a hidden row is a date nobody has
done the work on yet. For an `added` row that work is the `d`
backlog in `D`, which sharpens both views at once; for `announced` and
`retired` it is finding the day the vendor said so.

**`y` comes from a source, never from `f`.** If no source gives the day, write
the month and let the row hide. Six entries carried their filing date as `y`
after the September migration, because the model they name has no card left to
date them from — they now sit at month precision, which is the honest shape of
"we know the month this was filed and nothing more". A retirement whose
announcement date could not be sourced keeps the effective period the same way.
Do not promote either to a day without a source.

**A row wears a badge only when the badge says something the row does not.**
A changelog row already states its own date and its own kind, so the model's
current status is usually a restatement — and "New" is worse than that, since
it means "this month" and lands on rows dated years ago. Qwen3.8 shipped on 3
Aug and its card turned New again when the Max snapshot landed in September,
so the August row wore a New badge. `evBadge` now shows the badge only when
the card's state differs from what the row records, and never for New: a
release whose model has since been **retired** is worth flagging, and a
release whose card still reads Announced is a data bug worth seeing.

`t` is `added`, `announced` or `retired` in the data, and the page shows those
three as **Release**, **Announcement** and **Retirement** — nouns, where the
model list uses adjectives. "Release" rather than "Addition" since `y` started
meaning the day the vendor shipped: the row is the release itself, not this
page's filing of it. The data key stays `added`. That is the whole trick: the model list says what
a model *is* right now, and a changelog row *is* an addition, an announcement
or a retirement. The grammar tells a reader which of the two they are looking
at, so the words themselves can stay plain instead of reaching for synonyms.
An earlier pass used Listed / Slated / Ended to force the words apart and read
like nobody's English. Both sets share the three status colours, since they
are the same three states seen from different angles.

Singular beside a card, plural on the filter button: one row is an addition,
the button selects the additions.

The state names are display-only — `t` in the data stays `added` /
`announced` / `retired`, and that is what you write in `H`.

The day and the kind of change are drawn in a gutter to the **left of the
card**, not inside it, so the card holds only the model and nothing about the
change can be mistaken for a category tag. The changelog's filter buttons wear
the same dot-and-word marker for the same reason: the control looks like what
it selects. Under 560px the gutter folds into one line above the card.

The status row belongs to its view and sits under the tabs, so each view keeps
its own selection: filtering the model list to Retired does not filter the
changelog to Retirements. Category, subcategory and search sit above the tabs and
are shared, because "show me audio" means the same thing to both.

`n` names the version that changed, `c` the company (it must match a `c` in
`D`, and `check.js` enforces that). `k`, `x` and `u` are the model's tags,
detail and link **as they read on the day**, copied rather than referenced.
That duplication is deliberate: an entry is a record of what the page said at
the time, so it must not shift when the model card is later reworded, renamed
or split.

**Stored newest-`f` first; shown newest-`y` first.** `check.js` fails if the
array falls out of `f` order, and `renderLog` sorts by `y` for the view. Plain
descending string compare does it, so `2026-09-22` beats `2026-09`, which
beats `2026` — a vaguer date falls to the end of the period it names, the same
rule `d` follows.

So a new entry is still appended at the **top** of the array whatever date it
carries. Do not try to slot it in by `y`.

**Never rewrite or delete an entry.** A wrong entry is corrected by appending a
new one, the same way you would not rewrite a commit that is already pushed.
The one thing that legitimately edits `H` is a bug in how an entry was
generated on the day it was written, caught before it ships.

`y` and `f` were split across all 346 entries in September 2026. That was a
schema migration rather than a correction — every `f` kept the value its `y`
had, so nothing on the record was lost or reinterpreted. A migration on that
scale is the owner's call, not a run's.

`check.js` prints, without failing, every entry filed before the date it
carries (`f < y`). Most are a shutdown logged ahead of its effective date; the
rest are a card date and a log date that disagree, which is worth a look.

### A model is not a row

The two views are **not** one-to-one in either direction, and neither is a bug.

**One model, several rows.** A model earns a row for each thing that happens to
it: announced, then released when it ships, then retired when it is switched
off. Grok 4.7 has both an announcement and a release; several models have a
release and a retirement. That is the point of a changelog — the model list
says what a thing *is*, and the log says what has *happened* to it.

What is never right is the same (company, name, type) twice: one event logged
on two days. `check.js` fails on it, because a daily run appending to the top
of `H` is exactly how it would happen.

**One row, several models.** It runs the other way too, for entries written
before the September split, when one card carried a whole line. `Imagen →
Imagen 4` is a single row retiring two models that are separate cards today.
Some of those old names are shorthand that no longer expands — `DALL·E → 3`
means DALL·E and DALL·E 3, and `Suno v1 → v5.5` means Suno v5.5 — so matching a
card to its row by name alone will miss them. They are covered; they are just
written the way they were written, and `H` is not rewritten to tidy that up.

So the two counts will not agree and should not. State and history answer
different questions; `check.js` prints both if you want today's figures.

**Do not pin a live count in this file.** Anything that moves — badge totals,
row totals, how many dates are still vague — goes stale the week after it is
written, silently, because prose has no test. This file carried "12 Retired
badges against 9 retired entries" for weeks after the September split made it
14 and 11, and the sentence explaining the visible-row filter shipped saying
39 when it was 33. `check.js` prints every one of these on every run; cite it
instead. A count describing a past event is fine, because it cannot drift —
"the split moved 8 Retired badges to 12" is a fact about September.

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

Write `d` to the day when a source gives one — `22 Sep 2026`, not `Sep 2026`.
The card still prints `Sep 2026`; the day exists so that a month full of
releases orders correctly. See "How dates are read".

`d` holds the lifecycle and nothing else: when it shipped, when later versions
shipped, when it dies. `x` holds what it is and why it matters.

**`x` is at most 180 characters, and 160 is the size to aim for.** `check.js`
fails above 180. The GPT Image 2.5 card is the reference: one sentence on what
the model is, a second clause on the one thing that sets it apart, and
nothing else. Benchmark tables, pricing, rollout stages, the list of every
feature and the history of the announcement all go; a reader who wants them
follows the link. On a phone a 400-character `x` is a card taller than the
screen, and fifty of them were before September 2026.

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

### Open weights: `o`

A model whose weights can be downloaded carries `o`, and only those models
show in the **Open weights** tab. `{l, h, p}`, every key optional:

- `l` — the licence as the vendor names it: `Apache 2.0`, `MIT`, `CC BY-NC
  4.0`, `Tencent Hunyuan community`, `FLUX.1 dev non-commercial`. The tab's
  licence filter groups these by rule (`LGRP`): anything containing "apache",
  anything starting with "MIT", anything saying non-commercial or BY-NC, and
  the rest as **Vendor licence**. A new licence name needs no new button.
- `h` — the Hugging Face page for the weights, and `check.js` insists it is
  on huggingface.co. The tab's **On Hugging Face** filter is "has `h`".
- `p` — size in billions of parameters, or `[smallest, largest]` for a family
  shipped in several sizes (`Gemma 4` is `[5,31]`). The RAM filter turns the
  smallest size into gigabytes, and the card prints the same number, so the
  two can never disagree.
- `q` — **the width the vendor actually shipped**, in bits: 4, 8, 16 or 32.
  Read from the weights repository, never assumed. Absent means the repo had
  no safetensors index to read it from; the page then falls back to 16 and
  marks the card `16-bit?` rather than passing the guess off as known.

  `p` alone does not give a download size, which is what the page claimed
  until September 2026. A third of the catalogue does not ship at 16-bit:
  Kimi K2 is FP8, so its real download is 1026 GB and not the 2052 GB the
  page printed; Stable Diffusion is F32, so it is 3.6 GB and not 1.8. Both
  errors were invisible because `p` is right in each case — it is the
  multiplier that was wrong.

  Three sources, in this order, and they disagree often enough that the order
  matters: the repo's `config.quantization_config.quant_method` when it exists
  (gpt-oss says `mxfp4`, which nothing else reveals); then the real bytes per
  parameter, from the safetensors file sizes divided by the parameter count,
  but **only when it comes out below** what the dtype implies, since a repo
  that carries a text encoder its index does not count reads too high and a
  packed one reads correctly low; then the dominant dtype. The middle step is
  what catches Kimi K2.7 Code, whose weights are int4 packed into I32
  containers: the dtype says 32-bit and the files say 0.58 bytes per
  parameter, a sevenfold difference.

**The RAM control is a slider over `RAMF` plus a precision toggle.** The stops
are machines rather than round numbers — a laptop, a 4090, one H100, an
8-GPU node — and the last position is Unlimited, which is the default and is
the same `ram=0` "no filter" state the page starts in. The top numbered stop
is 2.5 TB rather than a tidier 2 TB because Kimi K2 needs 2052 GB at 16-bit
and 2048 would miss it by four gigabytes; above that the data is empty until
Kimi K3 at 5.5 TB, which is what Unlimited is for.

`QUANT` is the precision control, and the row is labelled **Weights**, not
RAM, because that is all any of these numbers are. **As shipped** is the
default and reads each model's own `q`, so the number on the card is the
download. The other three are written **If 16-bit / If 8-bit / If 4-bit**, and
the "If" is load-bearing: they are arithmetic, `p` times the width, and the
page has no idea whether a build at that width exists.

It often does not. Counting quantised derivatives on Hugging Face, a 4-bit
build exists for most text models and for a minority of everything else —
around one robotics model in eight, and neither of the two avatar models. So
the control asks a question instead of making a claim, and the tooltip carries
the two things the number cannot: that a build at that width may not exist,
and that weights are not the whole of it, since context and activations need
more on top. Do not reword those into a promise. Both feed `gb()`, which the filter and the card line
share, so the toggle visibly rewrites every size on the page — that is the
point, and it is why it sits inside the RAM row rather than somewhere else.
Under 560px it takes a second line **within that row**, indented to start
under the track, so the slider gets the full width instead of the ~90px left
over beside the buttons; it must stay in the row rather than become a fourth
filter, because it is not one.

Kimi K2 is 1026 GB as shipped, 2052 GB if you ran it at 16-bit and 513 GB at
4-bit, which is three different machines.

There is no 32-bit position, and that is deliberate: nine models *ship* at
F32, which **As shipped** already shows, but nobody chooses to run a model at
32-bit, so a position for it would only ever double a number for no reason.

Under 10 GB `gb()` keeps one decimal. At 4-bit a 0.5B model is a quarter of
what it was, and whole numbers printed "0 GB".

The filter row is **built once and then synced**, not re-rendered: rebuilding
`#ofilt` on every render would replace the range input mid-drag and drop the
thumb on the first input event. `syncOpen` pushes state onto the controls that
already exist.

`o:{}` with no keys is legitimate for a model the vendor calls open but whose
licence, page and size have not been verified (Llama 5 at the time of
writing). It shows in the tab as "licence not recorded" and matches no
licence, Hugging Face or RAM filter.

The values were read from the Hugging Face API (the `license` tag and the
`safetensors.total` count) in September 2026, not from memory. Verify a new
entry the same way; the HF licence tag is `other` for every vendor community
licence, and the real name is then in the model card's `license_name`.

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
date printed in the footer — bump both together or neither.

`RETIRED` strips any clause following a retirement word (`retired`, `EOL`,
`wind-down`, `closed`, `ends`, `discontinued`, `shut down`, `removed`) up to the
next comma. Everything downstream reads the stripped line.

**Why:** a retirement date is not a release. Without stripping, Sora 2's
`API ends Sep 2026` made it the newest OpenAI model on the page, above one
actually released in Jul 2026. If you add a new way of saying "this is going
away", add the word to `RETIRED` too — otherwise a future shutdown date reads
as a future *release* and wrongly earns the Announced badge.

`dates()` reads every remaining date at one of three precisions, which is what
`x` records:

| `x` | written | example | read as |
|---|---|---|---|
| 2 | day, month, year | `22 Sep 2026` | that day |
| 1 | month and year | `Sep 2026` | that month, day unknown |
| 0 | bare year, or a span like `2024–26` | `2026` | **January** of that year, so it sorts last within it |

**Write the day whenever a source gives one.** `d` is the only field ordering
reads, and a month is not precise enough to order a busy month: at the time
this changed, 65 models carried `Sep 2026`, so every one of them tied and fell
back to array order. That is why Claude Opus 5.5 did not lead the page on the day
it shipped. A day breaks the tie; nothing else does.

**The day is stored, not shown.** `dsp()` strips it for rendering, so a card
dated `22 Sep 2026` still prints `Sep 2026` and the page keeps one granularity
across four years. Do not add the day to `x` prose to make it visible.

A day counts only when a month follows it, so the stray digits in a line like
`Gen-3 2026` cannot be read as one. `check.js` rejects a day outside 1–31 and
a number sitting in front of a year with no month between them.

**Why January:** all a bare year tells us is the year, so it must not outrank
a model we *can* date inside that same year. January plus the precision
tie-break puts it below a dated January and above the December before it —
last among its own year's releases, and no lower.

It was read as December until September 2026, which did the exact opposite: a
bare `2024` scored December 2024 and outranked a real `15 Nov 2024`. Worse,
the cap at `NOW` that stopped a bare `2026` scoring a future December landed
every undated model of the current year on the current month, tied with the
models that really shipped there. Both faults are gone; the cap survives only
for a bare year still in the future.

The cost of the fix is that a bare year now sinks out of sight instead of
floating to the top, so the backlog stops nagging. `check.js` prints the
count for that reason — the page no longer shows you the problem.

`cmpDate` orders newest first, then the later day first, then the better
written date first — of two dates landing on one month, the one that named a
day, or named a month rather than a bare year, is the better evidence.

Ordering: company cards rank on the newest model **currently shown**, so
filtering to Audio reorders the page around audio releases. A card showing no
dated model sorts last.

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
