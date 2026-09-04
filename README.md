# modelatlas

An index of AI generative models — image, video, audio, world/3D, avatar, text and robotics — mapped to the companies behind them, with release dates.

Live: https://tomislavherman.github.io/modelatlas/

## Editing

Everything lives in `index.html`. No build step, no dependencies.

- **Companies and models** — the `D` array. Each entry is `{c, r, f, n, u, m}`: company, region, founded, ownership, official site, models.
- **Models** — each is `{n, k, d, x, u}` and renders as three lines: `n` the
  model name or names, `d` the dates, `x` the detail note. Keep them separate —
  `d` is the only field the ordering and badge code reads, so a date belongs
  there and prose belongs in `x`. `x` may be `""`. `u` is optional; a model
  without one links to its company's `u` instead, and a company without `u`
  renders as plain text.
- **Naming** — `→` marks a version progression and both sides are spelled out
  in full (`Aleph → Aleph 2.0`, not `Aleph → 2.0`), except where a product name
  prefixes bare version numbers (`Suno v1 → v5.5`). `/` marks sibling models
  released as a set (`Aura 2 / Nova 3`), not a progression.
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
    August 2026 for this build. A bare year such as `2024 → 2026` carries no
    month and is never badged New.

  The current month is the `NOW` constant in `index.html`; move it forward
  whenever you recompile the page, and the three badges follow.

Category tags are `image`, `video`, `world`, `avatar`, `robotics`, `audio:speech` / `audio:music` / `audio:sfx`, and `text:chat` / `text:code` / `text:embed`. A model can carry several; the first one sets its colour. Chat and coding share the `text` base because most frontier models do both — one model is one card carrying both tags, not two cards.

Adding a model is one line in the relevant company's `m` array.

## Accuracy

Founding dates and ownership are the stable part. Model version numbers move monthly and some smaller entries are approximate — verify anything load-bearing against the vendor's own announcement.

Compiled 4 September 2026.
