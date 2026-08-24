// Checks the data in index.html. Run: node check.js
// No dependencies, no build step — it reads the page's own script block and
// asserts the invariants that the ordering and badge code depend on.
const fs = require("fs");

const html = fs.readFileSync(`${__dirname}/index.html`, "utf8");
const src = html.slice(html.indexOf("const KC="), html.indexOf("let view="));
const { D, R, EXTRA, NOW, badge, fresh, retired } =
  new Function(`${src}; return {D,R,EXTRA,NOW,badge,fresh,retired}`)();

const TAGS = ["image", "video", "world", "avatar", "audio:speech", "audio:music", "audio:sfx"];
const label = d => (badge(d).match(/>(\w+)</) || [, ""])[1];
const month = v => ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][((v - 1) % 12) + 1];
const stamp = v => (v ? `${month(v)} ${Math.floor((v - 1) / 12)}` : "(undated)");

let failed = 0;
const check = (ok, msg) => { if (!ok) { failed++; console.error(`  FAIL  ${msg}`); } };

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
  }
}

// Connection endpoints render as plain text when the name matches nothing.
const known = new Set([...D.map(c => c.c), ...Object.keys(EXTRA)]);
for (const r of R) {
  for (const side of [r.a, r.b]) {
    for (const name of side.split(" / ")) {
      if (!known.has(name)) console.warn(`  note  connection endpoint "${name}" links nowhere — add it to EXTRA if it should`);
    }
  }
}

const counts = {};
for (const co of D) for (const m of co.m) { const l = label(m.d) || "none"; counts[l] = (counts[l] || 0) + 1; }

console.log(`${D.length} companies, ${D.reduce((a, c) => a + c.m.length, 0)} models, NOW = ${stamp(NOW)}`);
console.log(`badges: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
for (const co of D) for (const m of co.m) {
  const l = label(m.d);
  if (l) console.log(`  ${l.padEnd(9)} ${co.c} / ${m.n}  [${m.d}]`);
}

console.log(failed ? `\n${failed} problem(s)` : "\nall checks passed");
process.exit(failed ? 1 : 0);
