# modelatlas

An index of AI generative models and the companies behind them, with release dates and a dated log of every change.

Live: https://tomislavherman.github.io/modelatlas/

## Editing

Everything lives in `index.html`. No build step, no dependencies.

The page has two tabbed views. **Models** is the index of what exists, grouped
by company. **Changelog** is the flat, dated stream of what changed — newest
first, with the day and the kind of change in a gutter to the left of each
card rather than inside it.

Category, subcategory and search sit above the tabs and are shared, so
switching views keeps your question. The status row sits under the tabs and
belongs to its view: **New / Announced / Retired** for the model list, and
**Additions / Announcements / Retirements** for the changelog. The two sets
are the same three states named differently — adjectives for what a model is,
nouns for what a row records — and each view remembers its own selection.

- **Companies and models** — the `D` array. Each entry is `{c, r, f, n, u, m}`: company, region, founded, ownership, official site, models.
- **Changelog** — the `H` array. Each entry is `{t, y, c, n, k, x, u}`: type
  (`added` / `announced` / `retired`), day, company, model, tags, detail,
  link. `y` is the day the change landed in this page, `YYYY-MM-DD` — not the
  model's release date, so a model that shipped in 2024 can carry a 2026 entry
  recording when the atlas picked it up. `H` is append-only: entries are added
  at the top and never rewritten, and `k`/`x`/`u` are copied from the model
  card rather than referenced, so an entry keeps saying what the page said on
  the day. The two views deliberately disagree on counts — one shows state,
  the other shows history.
- **Models** — each is `{n, k, d, x, u}` and renders as three lines: `n` the
  model name or names, `d` the dates, `x` the detail note. Keep them separate —
  `d` is the only field the ordering and badge code reads, so a date belongs
  there and prose belongs in `x`. `x` may be `""`. `u` is optional; a model
  without one links to its company's `u` instead, and a company without `u`
  renders as plain text.
- **One card per version** — a card is one release, and a new version gets its
  own card rather than an arrow appended to the card already there. Badges are
  computed per card, so a version sharing a card with its successor could never
  be badged Retired on its own; splitting is what lets the page show DALL·E,
  Imagen and Suno v1 as switched off while their successors run. The one
  exception is two names with a single date between them, where splitting would
  mean inventing the second date — `MuseSteamer → MuseSteamer 2.0` on `2025`.
  `check.js` fails anything more than that.
- **Naming** — version names are spelled out in full: `Aleph` and `Aleph 2.0`,
  never a bare `2.0`. `/` marks sibling models released as one set on one date
  (`Aura 2 / Nova 3`), which do share a card.
- **Dates in `d`** — the lifecycle only: when it shipped, when later versions
  shipped, and when it dies. `2023 → Jun 2026`, `Dec 2024, EOL Sep 2026`.
  A feature that arrived on its own date is a detail, so it goes in `x`
  ("Audio added May 2026").
- **Ordering** — company cards run newest first, each ranked by the newest
  model it is currently showing, so filtering to Audio reorders the page around
  audio releases. Models inside a card run newest first too. Both use the same
  reading of the `d` line: the newest release date it names, skipping dates that
  follow a retirement word, since those are the end of a model's life rather
  than a release. Sora 2's `Sep 2025 – app closed Apr 2026, API ends Sep 2026`
  therefore sorts on September 2025. A bare year only tells us the year, so it
  is read as December of that year but never later than the current month; and
  where a bare year and an exact date land on the same month, the exact one
  comes first. A card showing no dated model sorts last.
- **Badges** — read off the `d` line, never typed into the data. A model gets at
  most one, and they are tested in this order:
  - **Retired**, when a retirement date the line names has already passed, or
    the line uses a retirement word with no date at all. A retirement still in
    the future leaves the model unbadged, because it is running until then.
  - **Announced**, when the line uses a word such as `announced`, `expected` or
    `planned`, or names a month still in the future. These are models with no
    shipped version yet.
  - **New**, when the line names an explicit month equal to the current month,
    September 2026 for this build. A bare year such as `2024 → 2026` carries no
    month and is never badged New.

  The current month is the `NOW` constant in `index.html`; move it forward
  whenever you recompile the page, and the three badges follow.

Category tags are `image`, `video`, `world`, `avatar`, `robotics`, `audio:speech` / `audio:music` / `audio:sfx`, and `text:chat` / `text:code` / `text:embed`. A model can carry several; the first one sets its colour. Chat and coding share the `text` base because most frontier models do both — one model is one card carrying both tags, not two cards.

Adding a model is one line in the relevant company's `m` array.

## Accuracy

Founding dates and ownership are the stable part. Model version numbers move monthly and some smaller entries are approximate — verify anything load-bearing against the vendor's own announcement.

Compiled 12 September 2026.
