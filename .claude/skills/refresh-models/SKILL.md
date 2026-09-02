---
name: refresh-models
description: Use when refreshing the modelatlas data in index.html — sweeping for models released, announced or retired since the last compile, and updating the page. Triggers include "check for new models", "refresh the atlas", "update modelatlas", "any new models out there", "sweep for new releases", or bumping the compile date. Not for layout, styling or code changes to the page.
allowed-tools: Bash, Read, Edit, Write, Grep, WebSearch, WebFetch
---

# Refresh the model list

Read `CLAUDE.md` in this repo first — it holds the schema, the naming rules and
the date-parsing traps. This skill is the procedure; that file is the reference.

The output is an edit to the `D` array in `index.html` plus a bumped compile
date. Finish with `node check.js` passing.

## 1. Establish the window

```sh
grep -o 'Compiled [0-9]* [A-Za-z]* [0-9]*' index.html   # last compile date
node check.js                                            # current counts, NOW, badges
```

The window starts the day **before** the compile date and ends today. The
compile date only says which day the last run happened, not what time. The
scheduled run fires at about 04:15 UTC, and vendors publish during US working
hours, so a model announced on the compile date was announced after that run
and is still unrecorded. Claude Fable 5.1 was announced on 1 Sep 2026; the run
that wrote "Compiled 1 Sep 2026" had finished twelve hours earlier, and the run
on 2 Sep treated 1 Sep as covered and missed it. `git log -1 --format=%cI`
gives the exact time the previous run committed if you want the precise start.

If the window is only a few days, expect one or two real changes — say so
rather than padding the result. But a short window is not a reason to skip the
newsroom pass below; a one-day window is exactly when the search engines have
not indexed the release yet.

## 2. Sweep

### Newsrooms first

Fetch each of these pages directly, before any search, and read the entries
dated inside the window. Web search indexes lag a release by a day or more, so
a model announced yesterday is invisible to `WebSearch` and visible only on the
vendor's own page. These are the vendors that ship most often; any release
they make is in scope.

- https://www.anthropic.com/news
- https://openai.com/news/
- https://deepmind.google/blog/ and https://blog.google/technology/ai/
- https://ai.meta.com/blog/
- https://x.ai/news
- https://mistral.ai/news
- https://api-docs.deepseek.com/news/
- https://qwen.ai/blog
- https://seed.bytedance.com/en/blog
- https://bfl.ai/blog
- https://runwayml.com/news
- https://lumalabs.ai/blog
- https://elevenlabs.io/blog
- https://stability.ai/news

Then read the API changelogs. A point release such as Gemini Omni 1.1 Flash
gets a developer-blog post and a changelog line, not a headline, and the
changelog names the exact model ID with the exact date:

- https://ai.google.dev/gemini-api/docs/changelog and https://developers.googleblog.com/
- https://platform.claude.com/docs/en/release-notes/overview
- https://platform.openai.com/docs/changelog
- https://docs.mistral.ai/getting-started/changelog/

Also read https://platform.claude.com/docs/en/about-claude/model-deprecations
for Anthropic retirement dates; it lists every model with its status.

When a page comes back `EGRESS_BLOCKED` or 403, run `WebSearch` for
`<vendor> releases` with that vendor's domain in `allowed_domains`, which
returns the vendor's own pages rather than aggregators.

If a fetched newsroom names a model that is not in `index.html`, that is a
finding regardless of what the category searches return. The category searches
exist to find the vendors this list does not name.

### Category searches

Search per category, not once overall. A single "new AI models" query returns
mostly chat models and misses every other category.

- image · video · world/3D · avatar · audio (speech, music, sfx)
- text (chat, coding, embeddings) · robotics (vision-language-action)
- one query for the current month's releases, one for retirements/shutdowns
- one query for announced-but-unshipped models

Then check the categories that returned nothing against a second phrasing
before concluding nothing shipped. Quiet months are real, but so are misses.

**Verify every date against a real source.** Anything after the training cutoff
cannot be written from memory. Vendor announcement pages and the vendor's own
docs beat aggregator blogs; aggregators disagree with each other on dates
(GPT Transcribe was reported as both 28 Jul and 5 Aug 2026).

## 3. Decide what each finding is

Check the existing data before adding anything — `grep -i '<name>' index.html`.
Most findings are already present, and the right edit is to a `d` line rather
than a new entry.

A name match is not a version match. When the finding carries a version
number, compare it with the version in the entry's `n` and the last date in
its `d`. The entry is current only if `d` already names a month at or after
the release. Gemini Omni 1.1 Flash shipped on 27 Aug 2026; the atlas held
`Gemini Omni` with `d:"May 2026"`, the grep hit, and two daily runs treated it
as already listed. The right edit was `Gemini Omni Flash → Gemini Omni 1.1
Flash` with `May 2026 → Aug 2026`.

| Finding | Edit |
|---|---|
| New version of a listed model | extend `d`: `Jul 2026` → `Jul 2026 → Aug 2026` |
| Genuinely new model | new `{n, k, d, x, u}` in that company's `m` |
| Company absent entirely | new card — Microsoft was missing with four shipped models |
| Announced, not shipped | `d: "announced …"`, no invented ship date |
| Retired or shut down | add the retirement clause to `d` |
| A product wrapping someone else's model | skip |

Chat and coding models version faster than anything else on the page. OpenAI
shipped six point releases of GPT-5 in eleven months. One entry per point
release would bury every other category, so a point release extends the `d`
line of the progression already there — `Aug 2025 → Jul 2026` — and the entry
names the endpoints rather than every version in between.

A model reaching general availability, gaining audio, or going open weights is
a `d` or `x` edit on the existing entry, not a second entry. A genuinely
separate model with its own name and weights is a new entry — FLUX 3 and
FLUX 3 Dev are separate; FLUX 3's video GA is not.

## 4. Sweep retirements too

This is the half that gets forgotten. The atlas showed Sora and Imagen as live
long after both were switched off, because nothing in their `d` line said
otherwise and no badge could fire.

For each finding, and for anything superseded during the window, ask whether
the **predecessor** is still available. Superseded is not the same as dead:
Whisper, Stable Diffusion and CogVideoX are all superseded and all still
shipping. Only add a retirement clause when there is a shutdown notice.

Word the clause with a term `RETIRED` already matches, or add the new term to
that regex — see CLAUDE.md.

## 5. Write the entries

Follow the schema in CLAUDE.md. The parts most often got wrong:

- Dates go in `d`, prose goes in `x`. A date in `x` is invisible to the sort
  and to every badge.
- Both sides of `→` spelled out in full.
- `k[0]` sets the card colour — primary modality first.
- Link the page for that model, never a `/models` listing page.

## 6. Bump the compile date

Update **both** together or `check.js` fails:

- `NOW` in the script (`2026*12+8` for August 2026)
- the `"Compiled 25 Aug 2026 · "` string in the header

Also update the "Compiled …" line at the bottom of `README.md`.

Bumping `NOW` silently expires last month's New badges. That is intended — the
badge means "this month" — but mention it, because the visible diff is larger
than the entries actually added.

## 7. Verify

```sh
node check.js
```

Then look at the page, since `check.js` cannot see layout:

```sh
python3 -m http.server 8731    # Chrome blocks file:// URLs
```

Confirm the new entries sit where expected, the badge counts match what you
added, and nothing old picked up a badge by accident. Check the links you added
actually resolve to that model's page, not a listing.

## 8. Commit and push

Only when something actually changed. `git diff --quiet && git diff --cached
--quiet` means nothing moved — say so and stop, do not manufacture a commit.

Two things count as a change worth committing:

- **Model data moved.** Bump the compile date to today, commit, push to `main`.
- **The month rolled over.** Bump `NOW` and the compile date even if no model
  data moved, because last month's New badges expire and this month's appear.
  That is a real visible change to the page.

Nothing else. A compile date bumped on a day when neither happened is a daily
empty-looking commit for no reason.

Push to `main` — GitHub Pages publishes this site from `main`, so a branch
would commit the work without deploying it.

```sh
node check.js || exit 1        # never push a failing tree
git add index.html README.md
git commit -m "feat: <what changed>"
git push origin HEAD:main
```

`HEAD:main` rather than `main` because the scheduled run gets a detached
checkout with no branch name, where plain `git push origin main` fails. It
does the same thing from a normal branch, so one command works either way.

Match the existing commit style: `feat:`, lowercase, one specific change named
in the subject rather than "update models".

## Unattended runs

A scheduled run has nobody to ask, so:

- Add only what you could source. An unsourced version number is worse than a
  missing one — leave it out and say so in the report.
- Never delete or rewrite an existing entry to resolve a contradiction between
  a source and the file. Leave the entry, and report the conflict.
- If the sweep is ambiguous — a model that might be a new entry or might be a
  version bump of a listed one — take the smaller edit and flag it.
- If `check.js` fails and the fix is not obvious, revert the working tree and
  report rather than pushing a guess.

The scheduled run happens in a cloud sandbox whose egress proxy blocks a
number of vendor domains — `seed.bytedance.com`, `developers.openai.com` and
`cnbc.com` have all failed. When `WebFetch` comes back `EGRESS_BLOCKED`, fall
back to `WebSearch`, corroborate the claim across at least two independent
reports before writing it, and name in the report which claims rest on
secondary sources only.

## Reporting

Say what changed and what you looked for and did not find — "no new music
models in August" is a result. Name the sources for each added or changed
entry. Flag anything you could not source rather than writing a confident
version number.
