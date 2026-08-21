# modelatlas

An index of AI generative models — image, video, audio, world/3D and avatar — mapped to the companies behind them, with release dates and the acquisitions, spinouts, investments and lawsuits that connect them. Built to take LLMs later.

Live: https://tomislavherman.github.io/modelatlas/

## Editing

Everything lives in `index.html`. No build step, no dependencies.

- **Companies and models** — the `D` array. Each entry is `{c, r, f, n, m}`: company, region, founded, ownership, models.
- **Models** — each is `{n, k, d}`: name, category tags, date/note.
- **Relationships** — the `R` array: `{a, b, t, d, x}` — from, to, kind, date, description.

Category tags are `image`, `video`, `world`, `avatar`, and `audio:speech` / `audio:music` / `audio:sfx`. A model can carry several; the first one sets its colour.

Adding a model is one line in the relevant company's `m` array.

## Accuracy

Company relationships and founding dates are the stable part. Model version numbers move monthly and some smaller entries are approximate — verify anything load-bearing against the vendor's own announcement.

Compiled 21 August 2026.
