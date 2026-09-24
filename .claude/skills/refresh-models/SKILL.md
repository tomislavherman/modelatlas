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
this file's own lists. A model whose weights can be downloaded also carries
`o` (licence, Hugging Face page, size), read from the weights repository and
never from memory. Finish with `node check.js` passing.

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

**On a quiet run, spend the time on the date backlog instead.** `node check.js`
prints how many models are still dated only to the year. Take the handful with
the newest bare year — those do the most damage, since a bare `2026` is capped
to the current month and outranks the models that really shipped there — and
resolve them the way step 2 describes. Two or three a run is the right size;
this is maintenance, not the point of the run. Say in the report which ones
you resolved and what the count moved from and to.

## 2. Sweep

### Newsrooms first

Fetch each of these pages directly, before any search, and read the entries
dated inside the window. Web search indexes lag a release by a day or more, so
a model announced yesterday is invisible to `WebSearch` and visible only on the
vendor's own page. These are the vendors that ship most often; any release
they make is in scope.

- https://www.anthropic.com/news
- https://openai.com/news/
- https://deepmind.google/blog/ and https://blog.google/innovation-and-ai/models-and-research/
- https://research.meta.ai/blog
- https://x.ai/news
- https://api-docs.deepseek.com/news/
- https://qwen.ai/blog
- https://forum.moonshot.ai/c/announcement/5
- https://seed.bytedance.com/en/blog
- https://www.minimax.io/blog
- https://www.tencent.com/newsroom/
- https://microsoft.ai/news/
- https://bfl.ai/blog
- https://runway.com/research
- https://elevenlabs.io/blog
- https://suno.com/blog
- https://sonilo.com/news
- https://cognition.com/blog
- https://www.inceptionlabs.ai/blog
- https://cohere.com/blog
- https://sakana.ai/blog/
- https://www.tavus.io/blog
- https://desertant.com/blog/
- https://www.worldlabs.ai/blog
- https://www.visko.ai/news
- https://www.recraft.ai/blog
- https://mistral.ai/news
- https://stability.ai/news-updates
- https://blogs.nvidia.com/blog/category/generative-ai/
- https://updates.midjourney.com
- https://www.krea.ai/blog
- https://lumalabs.ai/news
- https://pika.art/blog
- https://www.pixverse.ai/en/blog
- https://www.synthesia.io/blog
- https://www.heygen.com/blog
- https://www.hume.ai/blog
- https://cartesia.ai/blog
- https://blog.voyageai.com/
- https://skild.ai/blogs

Then read the API changelogs. A point release such as Gemini Omni 1.1 Flash
gets a developer-blog post and a changelog line, not a headline, and the
changelog names the exact model ID with the exact date:

- https://ai.google.dev/gemini-api/docs/changelog and https://developers.googleblog.com/
- https://platform.claude.com/docs/en/release-notes/overview
- https://developers.openai.com/api/docs/changelog
- https://docs.x.ai/developers/release-notes
- https://docs.z.ai/release-notes/new-released
- https://platform.vidu.com/docs/update
- https://www.kimi.com/code/docs/en/kimi-code/whats-new.html
- https://www.alibabacloud.com/help/en/model-studio/newly-released-models
- https://docs.qwencloud.com/changelog/models

Also read https://platform.claude.com/docs/en/about-claude/model-deprecations
for Anthropic retirement dates; it lists every model with its status, and
https://developers.openai.com/api/docs/deprecations for OpenAI's, which dates
each announcement and gives the shutdown date and replacement.

### Weights repositories

Open-weights releases often land on Hugging Face before, or instead of, a
blog post — a repository appears, and the announcement follows hours or days
later. The Hugging Face API is a dated index per organisation, so read it the
same way as a newsroom, one call per organisation:

```sh
for a in openai google facebook meta-llama meta-models ibm-granite nvidia \
  black-forest-labs stabilityai ideogram-ai krea Lightricks mistralai \
  Kwai-Kolors MiniMaxAI Wan-AI Qwen FunAudioLLM tencent zai-org inclusionAI \
  stepfun-ai internlm deepseek-ai moonshotai IFM thinkingmachines CohereLabs \
  Agnes-AI XiaomiRobotics XiaomiMiMo lerobot m-a-p desert-ant-labs avaturn-live poolside CompVis decart-ai robbyant Etched; do
  curl -s -A "Mozilla/5.0" "https://huggingface.co/api/models?author=$a&sort=createdAt&direction=-1&limit=8&expand[]=createdAt&expand[]=tags&expand[]=safetensors" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const m of JSON.parse(s))console.log(m.id,m.createdAt.slice(0,10),(m.tags||[]).filter(t=>t.startsWith("license:")).join(",")||"-",m.safetensors?.total?(m.safetensors.total/1e9).toFixed(1)+"B":"-")})'
done
```

Read the repositories created inside the window. Ignore quantised copies,
LoRAs, GGUF conversions and fine-tunes by other accounts; a first-party
repository for a model or version not in `index.html` is a finding. The same
call gives the three values `o` needs — see step 5a.

When huggingface.co is unreachable, ModelScope carries the Chinese labs'
repositories, usually the same day. Its listing is a name search rather than
an organisation feed, and its per-model page has the licence and the storage
size:

```sh
curl -s -X PUT -H "Content-Type: application/json" "https://www.modelscope.cn/api/v1/dolphin/models" \
  -d '{"PageSize":10,"PageNumber":1,"SortBy":"GmtModified","Target":"","Name":"deepseek-ai","SingleCriterion":[]}'
curl -s "https://www.modelscope.cn/api/v1/models/deepseek-ai/DeepSeek-V4.1-Flash"   # .Data.License, .Data.StorageSize, .Data.CreatedTime
```

A ModelScope page confirms that weights exist and what the licence is, but
`o.h` is still the Hugging Face page: leave `h` out when a model is on
ModelScope only, and say so in the report.

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

**Where an exact day comes from**, best first. Take the day from the first of
these that has one, and fall back to the month rather than inventing a day:

1. **The vendor's own dated changelog.** These date a model to the day by
   construction: `platform.claude.com` release notes, OpenAI's API changelog
   and deprecations page, `ai.google.dev`'s changelog, Alibaba Model Studio.
   One pass over these dated every Anthropic, OpenAI, Google and Alibaba
   release on the page.
2. **The announcement post's byline.** Most vendor blogs print the date on
   the post — Recraft, Midjourney, ElevenLabs, Runway and Synthesia all do.
3. **The weights repository.** `createdAt` from the Hugging Face API, which
   the loop in step 2 already returns. Use the **month**, not the day: a repo
   is often created a few days before the public announcement, and it dates
   the repo rather than the release. Only take the day when an announcement
   corroborates it.

**Use a vendor's changelog only for that vendor's own models.** A cloud
platform's changelog dates availability on that platform, not release:
Alibaba Model Studio lists Kimi K3 on 19 Aug where Moonshot announced it on
22 Jul, and DeepSeek V4.1-Flash three days after DeepSeek shipped it.

**A name match is not a version match here either.** Before taking a date
off a weights repo, check the repo is the version the card names. Four cards
are on a bare year for exactly this reason — `Wan (Wanxiang)` links a Wan2.2
repo, `CosyVoice` links CosyVoice2, and `π0` links a `lerobot` port rather
than Physical Intelligence's own.

### Grow the source list

**The three lists above — newsrooms, API changelogs and Hugging Face
organisations — are part of the output, not just the input.** They are the
fastest-staling thing in this file: labs appear, newsrooms move, a vendor
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
- **An `o.h` whose organisation is not in the loop.** Every Hugging Face page
  written into `index.html` names an organisation; if that organisation is
  missing from the shell loop above, add it. Write the name exactly as the URL
  spells it — `Qwen`, `CohereLabs`, `zai-org` — since the API is case-sensitive.

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
it belongs to — newsrooms, API changelogs, or the Hugging Face loop. No
commentary, no "added on" note; git already records that. For the loop the
test is simpler: the organisation exists (the API call above returns models)
and it is the vendor's own account, not a mirror or a quantiser.

**A source you could not reach is not a dead source.** A 403 or an
`EGRESS_BLOCKED` is a property of the sandbox on the day, not of the page —
which domains fail moves around, and a domain that blocked last month can
answer today. Keep the line and fall back to search; never drop a source over
a failed fetch.

#### Keep the lists bounded

Every entry is a fetch on every future run, so the lists cannot only grow.
Roughly **40 newsrooms, 8 changelogs and 40 Hugging Face organisations** is
the ceiling. At the ceiling,
adding one means dropping one, and the one to drop is decided from data you
already have in front of you: the listed vendor whose newest model in `D` is
oldest. A lab that has shipped nothing in a year does not need a daily fetch.

At 40 newsrooms a full pass is a lot of fetches, so **read them newest-first
and in batches**, and do not let a slow tail eat the run: the vendors at the
top of `D` ship weekly, the ones at the bottom ship twice a year. If the run
is going long, the changelogs in the next section are the higher-yield half —
they date a release to the day, which the newsrooms often do not.

Drop a genuinely dead source at any time, ceiling or not — domain gone, or the
company folded into another that is already listed.

#### What must never change

This is the one section of this skill that a run may edit, and it may edit
**only the three source lists** — adding a line or an organisation, fixing a
moved URL, removing a dead or superseded one. Never rewrite the procedure, the thresholds, the
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
| Weights published for a listed model | add `o` to that version's card, and `open weights <Mon YYYY>` in its `d` |
| A product wrapping someone else's model | skip |

A genuinely new model or version whose weights are downloadable gets `o` on
the day it is added, not later. Check every addition against Hugging Face
before writing it, even one found through a newsroom — the loop in step 2
only reads the organisations it knows about.

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
- **Date to the day whenever a source gives one** — `d:"22 Sep 2026"`. The
  card still prints `Sep 2026`; the day exists only so that a busy month
  orders correctly. Without it every release in a month ties and falls back
  to array order, which is why Claude Opus 5.5 sat mid-page on the day it
  shipped. Never guess a day to look precise: a wrong day is worse than an
  honest month, and `check.js` counts what is left rather than failing.
- **Never leave a new entry on a bare year.** A bare year is read as December
  and then capped at `NOW`, so a model written `2026` lands on the current
  month and outranks the ones that really shipped there. A month you can
  source beats a year you can. If the only date you can find is a year, say
  so in the report — that is a finding, not a default.
- `x` is at most 180 characters, and about 160 is right — `check.js` fails
  above the cap. Write what the model is and the one thing that sets it
  apart, then stop: no benchmark scores beyond one, no price, no rollout
  stages, no announcement history. Model it on the GPT Image 2.5 card in
  `index.html`. The changelog entry copies `x`, so a short card gives a short
  entry for free.
- One card per version — a new version is a new card, never `→` appended to
  the card already there. Names spelled out in full.
- `k[0]` sets the card colour — primary modality first.
- Link the page for that model, never a `/models` listing page.

#### `o` — open weights

`{l, h, p}`, every key optional, on any model whose weights can be
downloaded; the Open weights tab shows only cards that carry it. CLAUDE.md
has the field's rules. Every value is read from the repository, never typed
from memory:

```sh
curl -s -A "Mozilla/5.0" "https://huggingface.co/api/models/<org>/<repo>" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s),c=j.cardData||{};console.log("license:",c.license,"| name:",c.license_name,"| params:",j.safetensors?.total?(j.safetensors.total/1e9).toFixed(1)+"B":"none")})'
```

- `l` is the licence as the vendor names it. The tag is `apache-2.0`, `mit`,
  `cc-by-nc-4.0` and so on, written on the card as `Apache 2.0`, `MIT`,
  `CC BY-NC 4.0`. When the tag is `other`, the real name is `license_name`
  (`tencent-hunyuan-community`, `flux-1-dev-non-commercial-license`), written
  as `Tencent Hunyuan community`, `FLUX.1 dev non-commercial`. A modified MIT
  is `MIT (modified)`. No tag and no name means leave `l` out.
- `h` is the repository page, `https://huggingface.co/<org>/<repo>`. For a
  family in several sizes, link the largest first-party repository. Never a
  quantiser's copy, a GGUF conversion or a mirror.
- `p` is `safetensors.total` in billions, rounded to what the vendor says
  (`29.8B` on the API is `30`). A family in several sizes is
  `[smallest, largest]`. When the repository has no safetensors count — many
  diffusion and speech models ship `.pt` or `.pth` files — use the count the
  vendor states in the model card or announcement, and leave `p` out when
  nobody states one. Never estimate it.

A vendor that calls a model open but has not published the weights yet gets
`o:{}` (Llama 5 in September 2026) or `o:{l:"undecided"}` for an announced
release; the card then shows "licence not recorded" and no size. Fill the
keys in the run that finds the repository.

### 5b. `H` — the changelog

One entry at the **top** of `H` for each change you just made, newest first:

```js
{t:"added",y:"2026-09-10",f:"2026-09-11",c:"OpenAI",n:"GPT-Live-1 / GPT-Live-1 mini",
 k:["audio:speech"],x:"Full-duplex speech-to-speech …",u:"https://…"},
```

- **`y` is the day the event in the row happened**, written to whatever
  precision the source had: `2026-09-10`, `2026-09` or `2026`. Never pad a
  month out to a day, and never use a date in the future:
  - `added` — the day it shipped. A model that shipped in July and that you
    are recording in September gets `2026-07`, not today.
  - `announced` — the day of the announcement, not the expected ship date.
  - `retired` — the day the retirement was **announced**. The vendor's
    deprecation page carries it; the shutdown date itself goes in `d`, not
    here. Sora 2's row is dated 24 Mar 2026, the day OpenAI said so, not the
    24 Sep 2026 the API actually stopped.
- **Only rows dated to the day are shown.** A row you can date to the month is
  worth writing — it is still history — but it will not appear until someone
  pins the day. So when a source gives you a day, use it: that is the
  difference between an entry a reader sees and one they do not. `check.js`
  prints how many of the rows are visible.
- **`f` is today**, the day this run is writing the page, always a full
  `YYYY-MM-DD`. It is how a late catch stays visible: `y` says the vendor
  shipped in July, `f` says the atlas only noticed in September.
- The entry goes at the **top** of the array regardless of its `y`, because
  the array is stored in `f` order. The view sorts by `y` itself.
- `t` is `added` for a model or version now listed as shipped, `announced` for
  one recorded before it ships, `retired` for one whose shutdown date has
  **passed** — a future shutdown is not a retirement and earns no entry, the
  same way it earns no badge. Log it when the date arrives.
  The page renders those three as **Release**, **Announcement** and
  **Retirement** (plural on the filter buttons); that is display only, and
  `t` in the data keeps the three names above.
- An announced model that ships later gets a second entry, `added`, on the day
  it ships. Both stay: that is the history. A model collects a row per thing
  that happens to it — announced, released, retired — so several rows naming
  one model is right.
- **Never log the same event twice.** The same company, name and `t` appearing
  twice is one event recorded on two days, and `check.js` fails on it. This is
  the failure mode of a daily run: the sweep finds a model, does not recognise
  the row already at the top of `H`, and files it again. Grep `H` for the name
  before appending — the check will catch it, but after you have written it.
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
- the `"Compiled 25 Aug 2026 · "` string written into the footer

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

`check.js` prints both arrays' counts, the open-weights totals (models, on
Hugging Face, with a size) and a `dates:` line splitting the catalogue into
dates known to the day, to the month and to the bare year. **That last number
is a backlog, and it should fall or hold, never rise.** It rises only if this
run wrote a bare year, so if it did, go back and find the month. Confirm the new entries sit where expected, the
badge counts match what you added, and nothing old picked up a badge by
accident. Check the links you added actually resolve to that model's page,
not a listing.

Then open the **Open weights** tab. Every model you gave `o` should be there
with its licence, its size and RAM, and a Hugging Face link that lands on the
repository; a card missing one of the three means a key you left out. Press
the licence button that matches what you wrote and confirm the card stays —
the buttons group licence names by rule, and a name the rule cannot place
falls under Vendor.

Then open the **Changelog** tab and confirm today's entries are at the top,
one per change and no more, each wearing the same badge its card wears on the
**All** tab. Category and search are shared across the tabs, so check one
category in both — a tag you got wrong in `H` will hide the entry under a
filter where its model still shows. The status rows are per-view, so check the
changelog's own Additions / Announcements / Retirements row separately.

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

### Leave no branch behind

The scheduled run works on a branch named `claude/<something>`, and the
harness pushes that branch to origin as well as whatever you push yourself.
Nineteen of them had piled up by 18 September 2026, fifteen of them holding
nothing that was not already on `main`. So after the push to `main`, and on
every run whether or not anything changed, delete your own branch and any
earlier ones that are fully merged:

```sh
b=$(git symbolic-ref --short -q HEAD)
[ -n "$b" ] && [ "$b" != main ] && git push origin --delete "$b"
git fetch --prune -q
for r in $(git branch -r --format='%(refname:short)' | grep '^origin/claude/'); do
  [ "$(git rev-list --count origin/main..$r)" = 0 ] && git push origin --delete "${r#origin/}"
done
```

One branch at a time, as written: zsh does not split an unquoted variable
into words, so `git push origin --delete $list` sends the whole list as one
branch name and deletes nothing.

The merged test is the safeguard. A branch with a commit `main` does not have
is a run whose push to `main` failed, and its data exists nowhere else — four
such branches held Robostral Navigate and poolside's Laguna models that never
reached the page. Leave those alone and name them in the report, so a person
can decide whether to salvage or drop them.

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
- Never write an `o` key you did not read from a repository page. A model
  the announcement calls open but whose repository you could not reach gets
  `o:{}` and a line in the report, and the next run fills it in.
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

Name any `claude/*` branch on origin you left in place because it holds a
commit `main` does not, with the commit subject, so the data in it is not
forgotten.

State the changelog entries you appended, and say so explicitly when you
appended none. List every card that gained or changed `o`, with the repository
each value came from, and name any open-weights model left at `o:{}` because
its repository could not be read. A run that edited `D` and reported nothing about `H` is the
failure mode to watch for: the two arrays drift apart silently, and the
history cannot be reconstructed afterwards from the page alone.

Name any source you added, moved or dropped, and say which finding exposed
the gap — "Sonilo's releases kept arriving through search, so its blog is now
on the list" is the useful form. If a finding came from a search and you could
**not** find a first-party source behind it, report that too: it is the one
case where the list should have grown and could not.
