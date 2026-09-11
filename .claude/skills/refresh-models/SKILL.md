---
name: refresh-models
description: Use when refreshing the modelatlas data in index.html — sweeping for models released, announced or retired since the last compile, and updating the page. Triggers include "check for new models", "refresh the atlas", "update modelatlas", "any new models out there", "sweep for new releases", or bumping the compile date. Not for layout, styling or code changes to the page.
allowed-tools: Bash, Read, Edit, Write, Grep, WebSearch, WebFetch
---

# Refresh the model list

Read `CLAUDE.md` in this repo first — it holds the schema, the naming rules and
the date-parsing traps. This skill is the procedure; that file is the reference.

The output is an edit to the `D` and `H` arrays in `index.html` plus a bumped
compile date, and — when the sweep turns one up — a new source appended to
this file's own lists. Finish with `node check.js` passing.

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
- https://forum.moonshot.ai/c/announcement/5
- https://seed.bytedance.com/en/blog
- https://microsoft.ai/news/
- https://bfl.ai/blog
- https://runway.com/news
- https://lumalabs.ai/blog
- https://elevenlabs.io/blog
- https://stability.ai/news-updates
- https://cognition.com/blog
- https://cohere.com/blog

Then read the API changelogs. A point release such as Gemini Omni 1.1 Flash
gets a developer-blog post and a changelog line, not a headline, and the
changelog names the exact model ID with the exact date:

- https://ai.google.dev/gemini-api/docs/changelog and https://developers.googleblog.com/
- https://platform.claude.com/docs/en/release-notes/overview
- https://developers.openai.com/api/docs/changelog
- https://docs.mistral.ai/getting-started/changelog/
- https://docs.z.ai/release-notes/new-released
- https://platform.kimi.ai/docs/models

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

### Grow the source list

**The two lists above are part of the output, not just the input.** They are
the fastest-staling thing in this file: labs appear, newsrooms move, a vendor
quiet for a year starts shipping monthly. Every run leaves them a little
better than it found them, by editing this file.

**The strongest trigger is a miss.** When the category searches — or anything
downstream — turn up a model the newsroom pass should have caught, that is not
a lucky save, it is a hole in the list. Work backwards from every finding you
made today: which source *should* have carried it, and was that source listed?
If it was listed and you read it, fine. If it was not, that vendor's newsroom
is the thing to add.

Three cheaper triggers, worth a look every run:

- **Domains in the search results.** You are already running the category
  searches; read them for vendor domains as well as for models. A lab whose
  own site keeps appearing and is on neither list is a candidate.
- **A company in `D` with no source.** Check the ten or so newest company
  cards, not all sixty-six. A company added last week almost never gets its
  newsroom added at the same time.
- **A source that has moved.** A 404, or a redirect landing somewhere generic,
  means the newsroom has a new home. Find it and fix the URL in place rather
  than deleting the line.

Then **one dedicated query per run**, no more, aimed at labs rather than
models: something like `AI lab launches first model <Month> <Year>`. One query
is the budget; this is a background task, not the point of the run.

#### A source earns its place only if all of this holds

- You **fetched it in this run** and it returned real content. Never write down
  a URL you guessed at, pattern-matched from another vendor, or only saw cited
  somewhere else.
- It is on the **vendor's own domain**. Not an aggregator, a newsletter, a
  mirror, a Medium account or a press-release wire.
- It is a **dated index** — posts or changelog lines with dates on them. Not a
  `/models` listing, not a product page. Same reason model links point at a
  model's own page: a page showing what is being promoted today tells you
  nothing about what changed last Tuesday.
- It is **not already covered**. A vendor's blog and its newsroom are usually
  the same posts twice, and fetching both costs a slot for nothing.

Append it as one line in the same format as its neighbours, to whichever list
it belongs to — newsrooms, or API changelogs. No commentary, no "added on"
note; git already records that.

**A source you could not reach is not a dead source.** A 403 or an
`EGRESS_BLOCKED` is a property of the sandbox on the day, not of the page —
which domains fail moves around, and a domain that blocked last month can
answer today. Keep the line and fall back to search; never drop a source over
a failed fetch.

#### Keep the lists bounded

Every entry is a fetch on every future run, so the lists cannot only grow.
Roughly **24 newsrooms and 8 changelogs** is the ceiling. At the ceiling,
adding one means dropping one, and the one to drop is decided from data you
already have in front of you: the listed vendor whose newest model in `D` is
oldest. A lab that has shipped nothing in a year does not need a daily fetch.

Drop a genuinely dead source at any time, ceiling or not — domain gone, or the
company folded into another that is already listed.

#### What must never change

This is the one section of this skill that a run may edit, and it may edit
**only the two source lists** — adding a line, fixing a moved URL, removing a
dead or superseded one. Never rewrite the procedure, the thresholds, the
schema rules or this section itself from inside a run, unattended or not. How
the job works is a decision for a person; which pages the job reads is
maintenance, and that is the whole difference.

Editing this file does not change the run you are in — the instructions were
loaded before you edited them, so a source added today is first read tomorrow.
Commit `SKILL.md` alongside `index.html`, and name the change in the report.

## 3. Decide what each finding is

Check the existing data before adding anything — `grep -i '<name>' index.html`.
Most findings are already present, and the right edit is to a `d` line rather
than a new entry.

A name match is not a version match. When the finding carries a version
number, compare it with the version in the entry's `n` and the last date in
its `d`. The entry is current only if `d` already names a month at or after
the release. Gemini Omni 1.1 Flash shipped on 27 Aug 2026; the atlas held
`Gemini Omni` with `d:"May 2026"`, the grep hit, and two daily runs treated it
as already listed. The right edit was a new `Gemini Omni 1.1 Flash` card on
`Aug 2026`, beside the `Gemini Omni Flash` card it succeeds.

| Finding | Edit |
|---|---|
| New version of a listed model | **a new card of its own**, next to the version it succeeds |
| Genuinely new model | new `{n, k, d, x, u}` in that company's `m` |
| Company absent entirely | new card — Microsoft was missing with four shipped models |
| Announced, not shipped | `d: "announced …"`, no invented ship date |
| Retired or shut down | add the retirement clause to the **retired version's own card** |
| A product wrapping someone else's model | skip |

**One card is one release.** A new version never extends the card of the
version before it — see "One card per version" in CLAUDE.md for why, and for
the single `→`-in-`n` case that survives. This reverses the rule that stood
until September 2026, which folded point releases into the `d` line of the
progression already there. That kept the page short and made the badges lie:
a version that had been switched off could not show Retired while it shared a
card with a live successor.

Chat and coding models version faster than anything else on the page — OpenAI
shipped six point releases of GPT-5 in eleven months — so the catalogue is
long and that is fine. What still does **not** earn a card is a version the
page cannot date: name the releases you have a sourced date for and let the
ones in between go unlisted, exactly as `GPT-5` and `GPT-5.6` sit beside each
other with nothing between them. Never manufacture a date to justify a split.

A model reaching general availability, gaining audio, or going open weights is
a `d` or `x` edit on that version's existing card, not a second card. A new
**version** is a new card; a new **state of the same version** is not. FLUX 3
and FLUX 3 Dev are separate cards; FLUX 3's video GA is `→ video GA Aug 2026`
on the FLUX 3 card.

## 4. Sweep retirements too

This is the half that gets forgotten. The atlas showed Sora and Imagen as live
long after both were switched off, because nothing in their `d` line said
otherwise and no badge could fire.

For each finding, and for anything superseded during the window, ask whether
the **predecessor** is still available. Superseded is not the same as dead:
Whisper, Stable Diffusion and CogVideoX are all superseded and all still
shipping. Only add a retirement clause when there is a shutdown notice.

The predecessor now has its own card, so put the clause there and leave the
successor's card alone. When a vendor retires part of a line, that split is
what lets the page say so: DeepSeek's V4-Flash tiers were removed the same day
V4.1-Flash shipped, and the two cards carry Retired and New independently.

Word the clause with a term `RETIRED` already matches, or add the new term to
that regex — see CLAUDE.md. Check the wording strips cleanly: a date left
outside a retirement clause reads as a *release*, so "Pro reroutes to
V4.1-Flash 14 Sep 2026" would have earned a New badge where "Pro discontinued
14 Sep 2026" correctly earns none.

## 5. Write the entries — in both arrays

Every finding is written **twice**: once as state in `D`, once as history in
`H`. A run that edits `D` and not `H` leaves the changelog silently wrong, and
because `H` is append-only there is no later run that will notice and fix it.

### 5a. `D` — the model list

Follow the schema in CLAUDE.md. The parts most often got wrong:

- Dates go in `d`, prose goes in `x`. A date in `x` is invisible to the sort
  and to every badge.
- One card per version — a new version is a new card, never `→` appended to
  the card already there. Names spelled out in full.
- `k[0]` sets the card colour — primary modality first.
- Link the page for that model, never a `/models` listing page.

### 5b. `H` — the changelog

One entry at the **top** of `H` for each change you just made, newest first:

```js
{t:"added",y:"2026-09-10",c:"OpenAI",n:"GPT-Live-1 / GPT-Live-1 mini",
 k:["audio:speech"],x:"Full-duplex speech-to-speech …",u:"https://…"},
```

- `y` is **today**, the day this run is writing the page — not the model's
  release date. The changelog answers "when did the atlas learn this", and it
  is the only date in the repo that works that way. A model that shipped in
  July and that you are recording in September gets `2026-09`.
- `t` is `added` for a model or version now listed as shipped, `announced` for
  one recorded before it ships, `retired` for one whose shutdown date has
  **passed** — a future shutdown is not a retirement and earns no entry, the
  same way it earns no badge. Log it when the date arrives.
  The page renders those three as **Addition**, **Announcement** and
  **Retirement** (plural on the filter buttons); that is display only, and
  `t` in the data keeps the three names above.
- An announced model that ships later gets a second entry, `added`, on the day
  it ships. Both stay: that is the history.
- `c` has to match a company `c` in `D` exactly, and `n` names the version
  that changed, not the whole line.
- Copy `k`, `x` and `u` from the card as you just wrote it. They are a
  snapshot, not a reference — later edits to the model must not reach back and
  change what the changelog says happened.

Do **not** log restructuring. Splitting a card, rewording an `x`, fixing a
link or renaming for clarity changes the page without changing the world, and
the changelog only carries the three things above. The September split turned
197 cards into 283 and correctly produced zero entries.

Never edit or delete an existing entry. Correct a wrong one by appending.

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

`check.js` prints both arrays' counts. Confirm the new entries sit where
expected, the badge counts match what you added, and nothing old picked up a
badge by accident. Check the links you added actually resolve to that model's
page, not a listing.

Then open the **Changelog** tab and confirm today's entries are at the top,
one per change and no more. Category and search are shared across the tabs, so
check one category in both — a tag you got wrong in `H` will hide the entry
under a filter where its model still shows. The status rows are per-view, so
check the changelog's own Additions / Announcements / Retirements row
separately.

The two counts are not meant to match. The model list shows current state and
the changelog shows what happened, so a retirement logged once against a
grouped card can correspond to several Retired badges today.

## 8. Commit and push

Only when something actually changed. `git diff --quiet && git diff --cached
--quiet` means nothing moved — say so and stop, do not manufacture a commit.

Three things count as a change worth committing:

- **Model data moved.** Bump the compile date to today, commit, push to `main`.
- **The month rolled over.** Bump `NOW` and the compile date even if no model
  data moved, because last month's New badges expire and this month's appear.
  That is a real visible change to the page.
- **The source list changed.** A source added, moved or dropped is worth its
  own commit even on a day the page did not move — it changes what tomorrow's
  run reads. Do **not** bump the compile date for it: nothing on the page
  changed, and a bumped date claims otherwise.

Nothing else. A compile date bumped on a day when none of those happened is a
daily empty-looking commit for no reason.

Push to `main` — GitHub Pages publishes this site from `main`, so a branch
would commit the work without deploying it.

```sh
node check.js || exit 1        # never push a failing tree
git add index.html README.md .claude/skills/refresh-models/SKILL.md
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
- The source lists in step 2 may be edited unattended; nothing else in this
  file may. A run that finds itself wanting to change a rule has found
  something to report, not something to edit.

The scheduled run happens in a cloud sandbox whose egress proxy refuses some
vendor domains, and **which ones moves around** — do not treat any list of
them as current. `seed.bytedance.com`, `developers.openai.com` and `cnbc.com`
have all failed in the past; on 10 Sep 2026 the first two answered fine and
`openai.com` and `x.ai` were the ones returning 403. Find out by fetching, not
by assuming.

When `WebFetch` comes back `EGRESS_BLOCKED` or 403, fall back to `WebSearch`,
corroborate the claim across at least two independent reports before writing
it, and name in the report which claims rest on secondary sources only.

## Reporting

Say what changed and what you looked for and did not find — "no new music
models in August" is a result. Name the sources for each added or changed
entry. Flag anything you could not source rather than writing a confident
version number.

State the changelog entries you appended, and say so explicitly when you
appended none. A run that edited `D` and reported nothing about `H` is the
failure mode to watch for: the two arrays drift apart silently, and the
history cannot be reconstructed afterwards from the page alone.

Name any source you added, moved or dropped, and say which finding exposed
the gap — "Sonilo's releases kept arriving through search, so its blog is now
on the list" is the useful form. If a finding came from a search and you could
**not** find a first-party source behind it, report that too: it is the one
case where the list should have grown and could not.
