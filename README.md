# modelatlas

An index of AI generative models — image, video, audio, world/3D and avatar — mapped to the companies behind them, with release dates and the acquisitions, spinouts, investments and lawsuits that connect them. Built to take LLMs later.

Live: https://tomislavherman.github.io/modelatlas/

## Editing

Everything lives in `index.html`. No build step, no dependencies.

- **Companies and models** — the `D` array. Each entry is `{c, r, f, n, u, m}`: company, region, founded, ownership, official site, models.
- **Models** — each is `{n, k, d, u}`: name, category tags, date/note, and the page that best describes the model. `u` is optional; a model without one links to its company's `u` instead, and a company without `u` renders as plain text.
- **Relationships** — the `R` array: `{a, b, t, d, x}` — from, to, kind, date, description. Both endpoints are linked by name: the name is looked up in the companies of `D` first, then in the `EXTRA` map, which holds entities that have no card of their own (record labels, universities, investors) and short forms such as `BFL` or `Mistral`. An endpoint that matches neither stays plain text.

Category tags are `image`, `video`, `world`, `avatar`, and `audio:speech` / `audio:music` / `audio:sfx`. A model can carry several; the first one sets its colour.

Adding a model is one line in the relevant company's `m` array.

## Accuracy

Company relationships and founding dates are the stable part. Model version numbers move monthly and some smaller entries are approximate — verify anything load-bearing against the vendor's own announcement.

Compiled 21 August 2026.
