// Checks the data in index.html. Run: node check.js
// No dependencies, no build step — it reads the page's own script block and
// asserts the invariants that the ordering and badge code depend on.
const fs = require("fs");

const html = fs.readFileSync(`${__dirname}/index.html`, "utf8");
// Everything from the first constant to the first piece of view state: the data
// and the date/badge helpers, with none of the DOM code that follows them.
const src = html.slice(html.indexOf("const KC="), html.indexOf("let view="));
// badge() picks its colours from the current theme, so the sandbox needs a
// matchMedia. It reports light; the label badge() returns is the same either way.
const evalPage = names =>
  new Function("matchMedia", `${src}; return {${names}}`)(() => ({ matches: false }));
const { D, H, NOW, badge, fresh, retired, dates } = evalPage("D,H,NOW,badge,fresh,retired,dates");

const TAGS = ["image", "video", "world", "avatar", "robotics",
  "audio:speech", "audio:music", "audio:sfx",
  "text:chat", "text:code", "text:embed"];
const label = d => (badge(d).match(/>(\w+)</) || [, ""])[1];
const month = v => ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][((v - 1) % 12) + 1];
const stamp = v => (v ? `${month(v)} ${Math.floor((v - 1) / 12)}` : "(undated)");

let failed = 0;
const check = (ok, msg) => { if (!ok) { failed++; console.error(`  FAIL  ${msg}`); } };

// A tag with no colour throws at render time, and a sub-filter button for a tag
// nothing carries is a button that always shows an empty page.
const { KC, KCD, SUB, SUBF } = evalPage("KC,KCD,SUB,SUBF");
for (const t of TAGS) {
  const [b, sub] = t.split(":");
  check(KC[b] && KCD[b], `tag "${t}": base "${b}" has no colour in KC/KCD`);
  check(!sub || SUB[sub], `tag "${t}": sub "${sub}" has no label in SUB`);
}
for (const [b, row] of Object.entries(SUBF)) {
  for (const [v] of row) check(v === b || TAGS.includes(v), `sub-filter "${v}" is not a tag any model can carry`);
}

// NOW drives every badge, so it has to agree with the date printed in the header.
const printed = html.match(/"Compiled (\d+) (\w+) (\d+) · "/);
check(printed, "header has no compile stamp");
if (printed) {
  const want = +printed[3] * 12 + ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(printed[2]);
  check(want === NOW, `NOW is ${stamp(NOW)} but the header says "Compiled ${printed[1]} ${printed[2]} ${printed[3]}" — bump both together`);
}

for (const co of D) {
  for (const m of co.m) {
    const at = `${co.c} / ${m.n}`;
    check(typeof m.x === "string", `${at}: no x field (use "" when there is no detail)`);
    check(m.k.length && m.k.every(t => TAGS.includes(t)), `${at}: bad category tag in ${JSON.stringify(m.k)}`);
    // d is the only field the ordering and badge code reads, so it must carry a date.
    check(/20\d\d|announced/.test(m.d), `${at}: d has no date and does not say "announced" — d="${m.d}"`);
    // A detail line is prose; a date in there is invisible to the sort and the badges.
    check(!/\b(19|20)\d\d\b/.test(m.x) || /\b(added|since|until|after|from)\b/i.test(m.x),
      `${at}: x names a year that nothing reads — move it to d, or word it as a feature note. x="${m.x}"`);
    if (m.u) check(m.u.startsWith("https://"), `${at}: link is not https — ${m.u}`);
    // Retired and Announced are contradictory; badge() picks one, so this catches bad data.
    check(!(retired(m.d) && fresh(m.d)), `${at}: reads as both Retired and New — d="${m.d}"`);
    // One card is one release. A card may name two versions across "→" only
    // when it has a single release date to hang them on (Baidu's MuseSteamer);
    // the moment the second version has a date of its own it needs its own
    // card, or its retirement can never be badged separately from the first's.
    const versions = m.n.split("→").length;
    check(versions <= 2, `${at}: names ${versions} versions — one card per version, at most one "→"`);
    check(versions === 1 || dates(m.d).length <= 1,
      `${at}: names two versions and dates both — split it into one card per version. d="${m.d}"`);
  }
}

// The changelog is append-only history: entries are never rewritten, so the
// only things worth asserting are that each one is well formed and that the
// array stays sorted newest first, which is the order the view renders in.
const EVT = ["added", "announced", "retired"];
const companies = new Set(D.map(co => co.c));
let prevDay = null;
for (const e of H) {
  const at = `changelog ${e.y} ${e.c} / ${e.n}`;
  check(EVT.includes(e.t), `${at}: type "${e.t}" is not one of ${EVT.join(" / ")}`);
  check(/^20\d\d-\d\d-\d\d$/.test(e.y), `${at}: date is not YYYY-MM-DD — "${e.y}"`);
  check(companies.has(e.c), `${at}: no company card named "${e.c}"`);
  check(e.n && typeof e.x === "string", `${at}: needs a model name and an x (use "")`);
  check(e.k.length && e.k.every(t => TAGS.includes(t)), `${at}: bad category tag in ${JSON.stringify(e.k)}`);
  if (e.u) check(e.u.startsWith("https://"), `${at}: link is not https — ${e.u}`);
  if (prevDay) check(e.y <= prevDay, `${at}: out of order — the changelog runs newest first`);
  prevDay = e.y;
}

const counts = {};
for (const co of D) for (const m of co.m) { const l = label(m.d) || "none"; counts[l] = (counts[l] || 0) + 1; }
const evc = H.reduce((a, e) => (a[e.t] = (a[e.t] || 0) + 1, a), {});

console.log(`${D.length} companies, ${D.reduce((a, c) => a + c.m.length, 0)} models, NOW = ${stamp(NOW)}`);
console.log(`badges: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`changelog: ${H.length} entries, ${new Set(H.map(e => e.y)).size} days, `
  + `${Object.entries(evc).map(([k, v]) => `${k} ${v}`).join(", ")}, newest ${H[0].y}`);
for (const co of D) for (const m of co.m) {
  const l = label(m.d);
  if (l) console.log(`  ${l.padEnd(9)} ${co.c} / ${m.n}  [${m.d}]`);
}

console.log(failed ? `\n${failed} problem(s)` : "\nall checks passed");
process.exit(failed ? 1 : 0);
