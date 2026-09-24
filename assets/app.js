"use strict";

/* ===========================================================
   KARGOS

   Two pages, one engine. The home page takes a lane; the
   results page answers it with the providers who sail it.

   Sailings are generated from the published weekly rotations
   in data.js relative to today, so the board never goes stale.
   =========================================================== */

/* ---------- small helpers ---------- */

const $ = function (sel, root) { return (root || document).querySelector(sel); };
const $$ = function (sel, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(sel));
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

/* ---------- dates ---------- */

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONF = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const WD = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const DAY = 864e5;
const TODAY = (function () { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const WINDOW_DAYS = 21;

function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function diffDays(a, b) { return Math.round((b - a) / DAY); }
function fmtD(d) { return String(d.getDate()).padStart(2, "0") + " " + MON[d.getMonth()]; }
function fmtDT(d) {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ", " + fmtD(d);
}
function iso(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function fromIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ---------- the sailing set ---------- */

const SAILS = [];
SERVICES.forEach(function (s) {
  let first = addDays(TODAY, -7);
  while (first.getDay() !== s.wd) first = addDays(first, 1);
  for (let w = 0; w < 13; w++) {
    const base = addDays(first, 7 * w);
    SAILS.push({
      svc: s,
      w: w,
      vessel: s.vessels[w % s.vessels.length],
      voy: s.mode === "road" ? "T" + (s.vb + w) : (s.vb + 2 * w) + s.br,
      dates: s.rot.map(function (r) { return addDays(base, r[1]); })
    });
  }
});

/* ---------- forgiving port matching ---------- */

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = [];
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/* LOCODE, three-letter tail, name, alias, then typo. */
function scorePort(p, q) {
  const raw = String(q || "");
  const codes = raw.toUpperCase().match(/\b[A-Z]{5}\b/g) || [];
  for (let i = 0; i < codes.length; i++) if (codes[i] === p.code) return 100;

  const qn = norm(raw);
  if (!qn) return 0;
  const flat = qn.replace(/ /g, "").toUpperCase();
  if (flat === p.code) return 100;
  if (flat.length === 3 && p.code.slice(2) === flat) return 94;

  let best = 0;
  const names = [[norm(p.name), true]];
  (p.aliases || []).forEach(function (a) { names.push([norm(a), false]); });

  for (let i = 0; i < names.length; i++) {
    const nm = names[i][0], primary = names[i][1];
    if (nm === qn) best = Math.max(best, primary ? 98 : 93);
    else if (qn.length >= 2 && nm.indexOf(qn) === 0) best = Math.max(best, primary ? 86 : 80);
    else if (qn.length >= 3 && nm.indexOf(qn) > -1) best = Math.max(best, 64);
    else if (qn.length >= 4) {
      const d = Math.min(lev(qn, nm), lev(qn, nm.slice(0, qn.length)));
      if (d <= 1) best = Math.max(best, primary ? 74 : 68);
      else if (d <= 2 && qn.length >= 6) best = Math.max(best, 56);
    }
  }
  if (norm(p.country) === qn) best = Math.max(best, 62);
  return best;
}

function rankPorts(text, only) {
  const pool = PORTS.filter(function (p) {
    if (only === "pk") return p.region === "Pakistan";
    if (only === "out") return p.region !== "Pakistan";
    return true;
  });
  if (!String(text || "").trim()) return pool.slice(0, 8);
  return pool.map(function (p) { return { p: p, s: scorePort(p, text) }; })
    .filter(function (x) { return x.s >= 56; })
    .sort(function (a, b) { return b.s - a.s; })
    .slice(0, 8)
    .map(function (x) { return x.p; });
}

function resolvePort(text, only) {
  const hits = rankPorts(text, only);
  if (!String(text || "").trim()) return null;
  return hits.length ? hits[0] : null;
}

/* ---------- the sailing window ---------- */

function monthIdx(w) {
  if (!w || w.length < 3) return -1;
  for (let i = 0; i < MONF.length; i++) if (MONF[i].indexOf(w) === 0) return i;
  return -1;
}

const WHEN_PRESETS = [
  { key: "", label: "Any date", hint: "Next 3 weeks" },
  { key: "this-week", label: "This week", hint: "Up to Sunday" },
  { key: "next-week", label: "Next week", hint: "Monday to Sunday" },
  { key: "2w", label: "Next 2 weeks", hint: "14 days" },
  { key: "6w", label: "Next 6 weeks", hint: "42 days" }
];

/* Whatever is in the Sailing field becomes a window. Unparsed text
   falls back to the default, and the chip above the board says so. */
function parseWhen(text) {
  const def = { from: TODAY, to: addDays(TODAY, WINDOW_DAYS - 1), label: "Next 3 weeks", key: "" };
  const t = norm(text);
  if (!t) return def;

  const day = fromIso(text);
  if (day) return { from: day, to: day, label: fmtD(day), key: iso(day) };

  const dow = TODAY.getDay();
  if (t === "today") return { from: TODAY, to: TODAY, label: "Today", key: "today" };
  if (t === "tomorrow") { const x = addDays(TODAY, 1); return { from: x, to: x, label: "Tomorrow", key: "tomorrow" }; }
  if (t === "this week") return { from: TODAY, to: addDays(TODAY, (7 - dow) % 7 || 6), label: "This week", key: "this-week" };
  if (t === "next week") {
    const s = addDays(TODAY, (8 - dow) % 7 || 7);
    return { from: s, to: addDays(s, 6), label: "Next week", key: "next-week" };
  }
  if (t === "this month") {
    return { from: TODAY, to: new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0), label: "This month", key: "this-month" };
  }

  let m = t.match(/^(?:next|within|in)? ?(\d{1,2}) ?(d|day|days|w|wk|week|weeks)$/);
  if (m) {
    const n = +m[1], wk = m[2].charAt(0) === "w";
    return { from: TODAY, to: addDays(TODAY, n * (wk ? 7 : 1) - 1),
             label: "Next " + plural(n, wk ? "week" : "day"), key: m[1] + (wk ? "w" : "d") };
  }

  m = t.match(/^([a-z]+)$/);
  if (m && monthIdx(m[1]) >= 0) {
    const mo = monthIdx(m[1]);
    let y = TODAY.getFullYear();
    if (new Date(y, mo + 1, 0) < TODAY) y++;
    return { from: new Date(y, mo, 1), to: new Date(y, mo + 1, 0), label: MON[mo] + " " + y, key: t };
  }

  m = t.match(/^(\d{1,2}) ([a-z]+)$/);
  if (m && monthIdx(m[2]) >= 0) {
    const d = new Date(TODAY.getFullYear(), monthIdx(m[2]), +m[1]);
    d.setHours(0, 0, 0, 0);
    if (d < addDays(TODAY, -180)) d.setFullYear(d.getFullYear() + 1);
    return { from: d, to: d, label: fmtD(d), key: iso(d) };
  }

  return def;
}

/* ---------- search ---------- */

function findSails(q) {
  const rows = [];
  const originCodes = q.origin ? [q.origin] : PK;
  const win = q.win;

  SAILS.forEach(function (dep) {
    const rot = dep.svc.rot;
    for (let i = 0; i < rot.length - 1; i++) {
      if (originCodes.indexOf(rot[i][0]) < 0) continue;
      const etd = dep.dates[i];
      if (etd < win.from || etd > win.to) continue;

      let j = rot.length - 1;
      if (q.dest) {
        j = -1;
        for (let k = i + 1; k < rot.length; k++) if (rot[k][0] === q.dest) { j = k; break; }
        if (j < 0) continue;
      }

      const eta = dep.dates[j];
      const cut = addDays(etd, -dep.svc.cut);
      const hm = dep.svc.cutH.split(":");
      cut.setHours(+hm[0], +hm[1], 0, 0);

      const via = [];
      for (let k = i + 1; k < j; k++) via.push(rot[k][0]);
      const calls = [];
      for (let k = i; k <= j; k++) calls.push({ code: rot[k][0], date: dep.dates[k] });

      FIRMS.forEach(function (c) {
        if (c.svcs.indexOf(dep.svc.id) < 0) return;
        rows.push({
          key: dep.svc.id + "-" + dep.w + "-" + i + "-" + j + "-" + c.id,
          firm: c, svc: dep.svc, vessel: dep.vessel, voy: dep.voy,
          from: rot[i][0], to: rot[j][0], etd: etd, eta: eta,
          days: diffDays(etd, eta), via: via, calls: calls,
          direct: via.length === 0,
          term: i === 0 ? dep.svc.term : "Transship",
          cut: cut,
          cargo: c.cargo.filter(function (x) { return dep.svc.cargo.indexOf(x) > -1; })
        });
      });
    }
  });
  return rows;
}

function applyFilters(rows, f) {
  const now = new Date();
  return rows.filter(function (x) {
    if (f.direct && !x.direct) return false;
    if (f.maxDays && x.days > f.maxDays) return false;
    if (f.term && x.term !== f.term) return false;
    if (f.cargo && x.cargo.indexOf(f.cargo) < 0) return false;
    if (f.via && x.via.indexOf(f.via) < 0) return false;
    if (f.notVia && x.via.indexOf(f.notVia) > -1) return false;
    if (f.day && iso(x.etd) !== f.day) return false;
    if (x.cut < addDays(now, -1)) return false;
    return true;
  });
}

function byType(rows, typeKey) {
  const t = TYPES.find(function (x) { return x.key === typeKey; });
  if (!t || !t.match) return rows;
  return rows.filter(function (r) { return r.firm.type === t.match; });
}

function sortRows(rows, key) {
  const out = rows.slice();
  if (key === "etd") out.sort(function (a, b) { return a.etd - b.etd || a.days - b.days; });
  else if (key === "transit") out.sort(function (a, b) { return a.days - b.days || a.etd - b.etd; });
  else if (key === "direct") out.sort(function (a, b) { return (b.direct - a.direct) || a.days - b.days || a.etd - b.etd; });
  else if (key === "cutoff") out.sort(function (a, b) { return a.cut - b.cut; });
  else {
    /* Best fit: soonest away wins, but a direct call and a verified
       provider are worth a day each. */
    const score = function (r) {
      return diffDays(TODAY, r.etd) + r.days - (r.direct ? 1 : 0) - (r.firm.verified ? 1 : 0) - (r.firm.featured ? 1 : 0);
    };
    out.sort(function (a, b) { return score(a) - score(b) || a.etd - b.etd; });
  }
  return out;
}

function routingsOf(rows) {
  const map = {};
  rows.forEach(function (r) {
    const codes = r.calls.map(function (c) { return c.code; });
    const k = codes.join(">");
    if (!map[k]) map[k] = { key: k, codes: codes, n: 0, min: r.days, max: r.days, direct: r.direct };
    else { map[k].min = Math.min(map[k].min, r.days); map[k].max = Math.max(map[k].max, r.days); }
    map[k].n++;
  });
  return Object.keys(map).map(function (k) { return map[k]; })
    .sort(function (a, b) { return a.min - b.min || b.n - a.n; });
}

/* Indicative sample rates, derived from the transit so they stay
   consistent between the drawer and the compare table. */
function ratesOf(r) {
  const base = 280 + r.days * 58 + (r.direct ? 60 : 0);
  const round = function (n) { return Math.round(n / 25) * 25; };
  return { d20: round(base), d40: round(base * 1.62), r40: round(base * 2.35) };
}
function money(n) { return "$" + n.toLocaleString("en-US"); }

/* ---------- state ---------- */

const state = {
  view: "home",
  origin: "",
  dest: "",
  whenText: "",
  win: parseWhen(""),
  filters: { direct: false, maxDays: 0, term: "", cargo: "", via: null, notVia: null, day: null },
  type: "all",
  sort: "recommended",
  ov: "board",
  focus: null,
  picks: [],
  filtersOpen: false
};

function activeFilterCount() {
  const f = state.filters;
  let n = 0;
  if (f.direct) n++;
  if (f.maxDays) n++;
  if (f.term) n++;
  if (f.cargo) n++;
  if (f.via) n++;
  if (f.notVia) n++;
  if (f.day) n++;
  return n;
}

function clearFilters() {
  state.filters = { direct: false, maxDays: 0, term: "", cargo: "", via: null, notVia: null, day: null };
}

/* ---------- palettes ---------- */

const PALETTES = [
  { key: "harbour", name: "Harbour" },
  { key: "graphite", name: "Graphite" },
  { key: "forest", name: "Forest" },
  { key: "terracotta", name: "Terracotta" },
  { key: "ink", name: "Ink" }
];
const PAL_KEY = "kargos.palette";

function currentPalette() {
  return document.documentElement.getAttribute("data-palette") || "harbour";
}
function paletteAt(offset) {
  const i = PALETTES.findIndex(function (p) { return p.key === currentPalette(); });
  return PALETTES[(Math.max(i, 0) + offset + PALETTES.length) % PALETTES.length];
}
function setPalette(key) {
  document.documentElement.setAttribute("data-palette", key);
  try { localStorage.setItem(PAL_KEY, key); } catch (e) { /* private window: not persisting is fine */ }
}
(function initPalette() {
  let saved = null;
  try { saved = localStorage.getItem(PAL_KEY); } catch (e) { /* ignore */ }
  if (saved && PALETTES.some(function (p) { return p.key === saved; })) setPalette(saved);
})();

/* ---------- the URL ---------- */

function writeUrl(replace) {
  let hash = "#/";
  if (state.view === "results") {
    const q = [];
    if (state.origin) q.push("from=" + state.origin);
    if (state.dest) q.push("to=" + state.dest);
    if (state.whenText) q.push("when=" + encodeURIComponent(state.whenText));
    if (state.sort !== "recommended") q.push("sort=" + state.sort);
    if (state.type !== "all") q.push("type=" + state.type);
    hash = "#/search" + (q.length ? "?" + q.join("&") : "");
  }
  if (location.hash === hash) return;
  if (replace) history.replaceState(null, "", hash);
  else history.pushState(null, "", hash);
}

function readUrl() {
  const h = location.hash || "#/";
  if (h.indexOf("#/search") !== 0) {
    state.view = "home";
    return;
  }
  state.view = "results";
  const qs = h.slice(h.indexOf("?") + 1);
  const params = {};
  if (h.indexOf("?") > -1) {
    qs.split("&").forEach(function (pair) {
      const bits = pair.split("=");
      params[bits[0]] = decodeURIComponent(bits.slice(1).join("=") || "");
    });
  }
  state.origin = PORT[params.from] && PORT[params.from].region === "Pakistan" ? params.from : "";
  state.dest = PORT[params.to] ? params.to : "";
  state.whenText = params.when || "";
  state.win = parseWhen(state.whenText);
  state.sort = ["recommended", "etd", "transit", "direct", "cutoff"].indexOf(params.sort) > -1 ? params.sort : "recommended";
  state.type = TYPES.some(function (t) { return t.key === params.type; }) ? params.type : "all";
}

/* ===========================================================
   PIECES
   =========================================================== */

const MARK = '<svg viewBox="0 0 44 44" fill="none" aria-hidden="true">' +
  '<rect x="2" y="9" width="40" height="26" rx="4" fill="var(--accent)"></rect>' +
  '<path d="M11 14v16M18 14v16M25 14v16M32 14v16" stroke="var(--brand)" stroke-width="2.6" stroke-linecap="round"></path></svg>';

function topnav(hideMark) {
  const next = paletteAt(1);
  const now = PALETTES.find(function (p) { return p.key === currentPalette(); }) || PALETTES[0];
  return '<nav class="topnav" aria-label="Top">' +
    '<span class="' + (hideMark ? "topnav__hidden" : "") + '">' +
      '<a class="wordmark" aria-label="KARGOS home" href="#/">' +
        '<span style="width:30px;height:30px;display:block">' + MARK + "</span>" +
        '<span class="wide">KARGOS</span></a></span>' +
    '<span class="topnav__grow"></span>' +
    '<a class="topnav__link" href="#/search">Sailings</a>' +
    '<a class="topnav__link topnav__link--wide" href="#/search?type=nvocc">Providers</a>' +
    '<button type="button" class="theme" data-palette-next="' + next.key + '"' +
      ' title="Palette: ' + now.name + '. Switch to ' + next.name + '."' +
      ' aria-label="Colour palette, currently ' + now.name + '. Switch to ' + next.name + '.">' +
      '<span class="theme__swatches" aria-hidden="true">' +
        '<span class="theme__dot theme__dot--brand"></span>' +
        '<span class="theme__dot theme__dot--accent"></span></span>' +
      '<span class="theme__name">' + now.name + "</span></button>" +
    '<a class="pill pill--ghost" href="#/search">Sign in</a>' +
    "</nav>";
}

function capsuleHtml(sticky) {
  const originLabel = state.origin ? PORT[state.origin].name + " · " + state.origin : "";
  const destLabel = state.dest ? PORT[state.dest].name + " · " + state.dest : "";
  const seg = function (id, label, placeholder, value, mod) {
    return '<div class="cap__seg' + (mod || "") + '">' +
      '<label for="cap-' + id + '">' + label + "</label>" +
      '<input id="cap-' + id + '" data-field="' + id + '" placeholder="' + placeholder + '"' +
      ' spellcheck="false" autocomplete="off" role="combobox" aria-expanded="false"' +
      ' aria-controls="cap-' + id + '-list" aria-autocomplete="list" value="' + esc(value) + '">' +
      '<div class="cap__list" id="cap-' + id + '-list" role="listbox" hidden></div>' +
      "</div>";
  };
  return '<form class="cap' + (sticky ? " cap--sticky" : "") + '" role="search" autocomplete="off" novalidate>' +
    seg("origin", "From", "Port, city or LOCODE", originLabel || "Karachi, all ports") +
    '<span class="cap__sep"></span>' +
    seg("destination", "To", "Anywhere", destLabel) +
    '<span class="cap__sep"></span>' +
    seg("when", "Sailing", "Any date", state.whenText, " cap__seg--when") +
    '<button class="cap__go" type="submit">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>Search</button>' +
    "</form>";
}

/* Split-flap text, as on a departure board. */
function flaps(text, delay) {
  const chars = String(text).toUpperCase().split("");
  return '<span class="flaps" aria-label="' + esc(text) + '">' + chars.map(function (c, i) {
    const gap = c === " " ? " flap--gap" : "";
    return '<span class="flap' + gap + '" style="animation-delay:' + (delay + i * 28) + 'ms" aria-hidden="true">' +
      (c === " " ? "&nbsp;" : esc(c)) + "</span>";
  }).join("") + "</span>";
}

function footer() {
  return '<footer class="footer">' +
    "<span>&copy; KARGOS, Karachi. Sailings from Karachi, Port Qasim and Gwadar.</span>" +
    '<nav aria-label="Footer">' +
      '<a href="#/search">Sailings</a>' +
      '<a href="#/search?type=line">Lines</a>' +
      '<a href="#/search?type=nvocc">NVOCCs</a>' +
    "</nav></footer>";
}

/* ===========================================================
   HOME
   =========================================================== */

function nextDepartures(n) {
  const rows = [];
  SAILS.forEach(function (dep) {
    const rot = dep.svc.rot;
    if (PK.indexOf(rot[0][0]) < 0) return;
    const etd = dep.dates[0];
    if (etd < TODAY) return;
    rows.push({
      etd: etd,
      vessel: dep.vessel,
      to: rot[rot.length - 1][0],
      term: dep.svc.term,
      op: FIRM[dep.svc.op].name,
      from: rot[0][0],
      svc: dep.svc
    });
  });
  rows.sort(function (a, b) { return a.etd - b.etd; });
  return rows.slice(0, n);
}

function laneHref(from, to) {
  return "#/search?from=" + from + "&to=" + to;
}

function homeHtml() {
  const deps = nextDepartures(6);

  const board = '<section class="dboard" aria-label="Next departures">' +
    '<header class="dboard__head">' +
      '<span class="dboard__title">Next out of Pakistan</span>' +
      '<span class="dboard__meta mono">ETD · VESSEL · FOR · TERMINAL</span>' +
    "</header><ol class=\"dboard__rows\">" +
    deps.map(function (d, i) {
      const step = i * 90;
      return "<li>" +
        '<a class="dboard__row" href="' + laneHref(d.from, d.to) + '">' +
          '<span class="dboard__etd">' + flaps(fmtD(d.etd), step) + "</span>" +
          '<span class="dboard__vessel">' + flaps(d.vessel, step + 60) + "</span>" +
          '<span class="dboard__for">' + flaps(d.to, step + 120) +
            "<small>" + esc(PORT[d.to].name) + "</small></span>" +
          '<span class="dboard__term mono">' + esc(d.term) + "</span>" +
          '<span class="dboard__op">' + esc(d.op) + "</span>" +
        "</a></li>";
    }).join("") +
    "</ol><footer class=\"dboard__foot\">" +
      '<a class="dboard__all" href="#/search">Every sailing</a>' +
      '<span class="sample-note">Sample schedule, generated from weekly rotations.</span>' +
    "</footer></section>";

  /* Every origin/destination pair the rotations actually serve. */
  const lanes = {};
  SERVICES.forEach(function (s) {
    for (let i = 0; i < s.rot.length - 1; i++) {
      if (PK.indexOf(s.rot[i][0]) < 0) continue;
      for (let j = i + 1; j < s.rot.length; j++) {
        const a = s.rot[i][0], b = s.rot[j][0];
        const region = PORT[b].region;
        (lanes[region] = lanes[region] || {})[a + ">" + b] = { a: a, b: b };
      }
    }
  });

  let laneCount = 0;
  const laneGrid = REGIONS.filter(function (r) { return lanes[r]; }).map(function (region) {
    const list = Object.keys(lanes[region]).map(function (k) { return lanes[region][k]; });
    laneCount += list.length;
    return '<div class="home__region">' +
      '<span class="home__regionname mono">' + esc(region) + "</span><ul>" +
      list.map(function (l) {
        return "<li><a href=\"" + laneHref(l.a, l.b) + "\">" +
          esc(PORT[l.a].name) + " to " + esc(PORT[l.b].name) + "</a></li>";
      }).join("") + "</ul></div>";
  }).join("");

  const railRun = FIRMS.map(function (c) {
    return '<a class="rail__co" href="#/search?type=' + typeKeyOf(c.type) + '">' +
      '<i class="wide" style="background:' + TONES[c.tone] + '">' + esc(c.id) + "</i>" + esc(c.name) + "</a>";
  }).join("");

  return '<div class="home">' + topnav(true) +
    '<main class="home__main">' +
      '<header class="home__hero">' +
        '<div class="heromark" aria-label="KARGOS">' + MARK + '<span class="wide">KARGOS</span></div>' +
        '<h1 class="home__line">Search Pakistan&#39;s shipping industry in one place.</h1>' +
      "</header>" +
      capsuleHtml(false) +
      '<p class="home__try">Try ' +
        '<span><button type="button" data-try="PKKHI|CNSHA">Karachi to Shanghai</button>, </span>' +
        '<span><button type="button" data-try="PKBQM|SAJED">Port Qasim to Jeddah</button> or </span>' +
        '<span><button type="button" data-try="PKGWD|UZTAS">Gwadar to Tashkent</button></span>' +
      "</p>" +
      '<div class="home__below">' + board +
        '<section class="home__lanes"><h2 class="ruled">Lanes</h2>' +
          '<div class="home__lanegrid">' + laneGrid + "</div>" +
          '<a class="home__alllanes" href="#/search">All ' + laneCount + " lanes and " + PORTS.length + " ports</a>" +
        "</section>" +
        '<section class="home__rail" aria-label="Listed on KARGOS">' +
          '<h2 class="ruled">Listed on KARGOS</h2>' +
          '<div class="rail"><div class="rail__track" style="animation-duration:72s">' +
            '<div class="rail__run">' + railRun + "</div>" +
            '<div class="rail__run" aria-hidden="true">' + railRun + "</div>" +
          "</div></div>" +
        "</section>" +
        '<p class="sample-note home__note">Every company, sailing and rate on KARGOS is sample data.</p>' +
      "</div>" +
    "</main>" + footer() + "</div>";
}

function typeKeyOf(typeName) {
  const t = TYPES.find(function (x) { return x.match === typeName; });
  return t ? t.key : "all";
}

/* ===========================================================
   RESULTS
   =========================================================== */

function laneTitle() {
  const a = state.origin ? state.origin.slice(2) : "KHI+BQM+GWD";
  const b = state.dest ? state.dest : "ANYWHERE";
  return '<b class="wide">' + esc(a) + "</b>" +
    '<svg width="52" height="14" viewBox="0 0 64 16" aria-hidden="true">' +
      '<path d="M2 8h56" stroke="currentColor" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round"></path>' +
      '<path d="M54 3l6 5-6 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>' +
    "</svg>" +
    '<b class="wide">' + esc(b) + "</b>";
}

function resultsShellHtml() {
  return '<div class="home">' + topnav(false) +
    '<div class="res__bar"><div class="page">' + capsuleHtml(true) +
      '<div class="res__row" id="resRow"></div>' +
    "</div></div>" +
    '<main class="page res" id="resMain"></main>' +
    footer() + "</div>";
}

function rowHtml() {
  const f = state.filters;
  const n = activeFilterCount();
  const tokens = [];
  if (f.direct) tokens.push(["direct", "Direct calls only"]);
  if (f.maxDays) tokens.push(["maxDays", "Under " + plural(f.maxDays, "day")]);
  if (f.term) tokens.push(["term", f.term]);
  if (f.cargo) tokens.push(["cargo", f.cargo]);
  if (f.via) tokens.push(["via", "Via " + PORT[f.via].name]);
  if (f.notVia) tokens.push(["notVia", "Not via " + PORT[f.notVia].name]);
  if (f.day) tokens.push(["day", "Sails " + fmtD(fromIso(f.day))]);

  return '<button type="button" class="res__filters' + (state.filtersOpen ? " is-open" : "") + '"' +
      ' aria-expanded="' + state.filtersOpen + '" aria-controls="filter-panel">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M4 6h16M7 12h10M10 18h4"></path></svg>Filters' +
      (n ? '<span class="res__badge">' + n + "</span>" : "") +
    "</button>" +
    tokens.map(function (t) {
      return '<span class="res__token">' + esc(t[1]) +
        '<button type="button" data-drop="' + t[0] + '" aria-label="Remove ' + esc(t[1]) + '">&#10005;</button></span>';
    }).join("") +
    (n > 1 ? '<button type="button" class="res__clear" data-clear="1">Clear all</button>' : "") +
    '<label class="res__sort"><span class="sr">Sort results</span><select id="sortSel">' +
      [["recommended", "Best fit"], ["etd", "Earliest sailing"], ["transit", "Fastest transit"],
       ["direct", "Direct calls first"], ["cutoff", "Cut-off soonest"]].map(function (o) {
        return '<option value="' + o[0] + '"' + (state.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") +
    "</select></label>";
}

function filterPanelHtml(rows) {
  const f = state.filters;
  const vias = {};
  rows.forEach(function (r) { r.via.forEach(function (c) { vias[c] = (vias[c] || 0) + 1; }); });
  const viaCodes = Object.keys(vias).sort(function (a, b) { return vias[b] - vias[a]; }).slice(0, 6);

  const chip = function (attr, val, label, on, count) {
    return '<button type="button" class="chip" data-' + attr + '="' + esc(val) + '" aria-pressed="' + !!on + '">' +
      esc(label) + (count != null ? '<span class="chip__count">' + count + "</span>" : "") + "</button>";
  };

  return '<div class="fpanel" id="filter-panel">' +
    '<div class="fpanel__group"><span class="eyebrow">Routing</span><div class="fpanel__opts">' +
      chip("set-direct", "1", "Direct only", f.direct) +
      viaCodes.map(function (c) { return chip("set-via", c, "Via " + PORT[c].name, f.via === c, vias[c]); }).join("") +
      (f.notVia ? chip("set-notvia", f.notVia, "Not via " + PORT[f.notVia].name, true) : "") +
    "</div></div>" +
    '<div class="fpanel__group"><span class="eyebrow">Transit</span><div class="fpanel__opts">' +
      [5, 7, 10, 14, 21].map(function (d) { return chip("set-days", d, "Under " + d + "d", f.maxDays === d); }).join("") +
    "</div></div>" +
    '<div class="fpanel__group"><span class="eyebrow">Load terminal</span><div class="fpanel__opts">' +
      TERMINALS.map(function (t) { return chip("set-term", t, t, f.term === t); }).join("") +
    "</div></div>" +
    '<div class="fpanel__group"><span class="eyebrow">Cargo</span><div class="fpanel__opts">' +
      CARGOS.map(function (c) { return chip("set-cargo", c, c, f.cargo === c); }).join("") +
    "</div>" +
    '<p class="fpanel__note">Cut-offs shown are the terminal gate-in, not the documentation cut-off.</p>' +
    "</div></div>";
}

/* ---------- the departures timeline ---------- */

function timelineHtml(rows) {
  const days = [];
  for (let d = new Date(state.win.from); d <= state.win.to && days.length < WINDOW_DAYS; d = addDays(d, 1)) {
    days.push(new Date(d));
  }
  const counts = {};
  rows.forEach(function (r) {
    const k = iso(r.etd);
    counts[k] = (counts[k] || 0) + 1;
  });

  const total = rows.length;
  const span = days.length
    ? fmtD(days[0]) + " to " + fmtD(days[days.length - 1])
    : "no window";

  return '<div class="tl">' +
    '<div class="tl__head"><b>' + plural(total, "sailing") + "</b><small>" + span + "</small>" +
      (state.filters.day ? '<button type="button" class="tl__clear" data-drop="day">Show every day</button>' : "") +
    "</div>" +
    '<div class="tl__days">' + days.map(function (d, i) {
      const k = iso(d);
      const n = counts[k] || 0;
      const shown = Math.min(n, 4);
      let boxes = "";
      for (let b = 0; b < shown; b++) {
        boxes += '<span class="tl__box' + (b % 2 ? " tl__box--alt" : "") +
          '" style="animation-delay:' + (i * 20 + b * 40) + 'ms"></span>';
      }
      if (n > shown) boxes += '<span class="tl__more">+' + (n - shown) + "</span>";
      return '<button type="button" class="tl__day" data-day="' + k + '"' +
        ' aria-pressed="' + (state.filters.day === k) + '"' + (n ? "" : " disabled") +
        ' aria-label="' + fmtD(d) + ", " + plural(n, "sailing") + '">' +
        '<span class="tl__stack">' + boxes + "</span>" +
        '<span class="tl__wd">' + WD[d.getDay()] + "</span>" +
        '<span class="tl__n">' + String(d.getDate()).padStart(2, "0") + "</span></button>";
    }).join("") + "</div></div>";
}

/* ---------- the route map ---------- */

const CW = 1000, CASP = 0.52, CH = CW * CASP;

function fitProj(ports) {
  let loMin = Infinity, loMax = -Infinity, laMin = Infinity, laMax = -Infinity;
  ports.forEach(function (p) {
    loMin = Math.min(loMin, p.lon); loMax = Math.max(loMax, p.lon);
    laMin = Math.min(laMin, p.lat); laMax = Math.max(laMax, p.lat);
  });
  const padLo = Math.max((loMax - loMin) * 0.12, 5);
  const padLa = Math.max((laMax - laMin) * 0.18, 5);
  loMin -= padLo; loMax += padLo; laMin -= padLa; laMax += padLa;

  let spanLo = loMax - loMin, spanLa = laMax - laMin;
  /* Equirectangular, so grow the narrow axis rather than stretch the plot. */
  if (spanLa / spanLo < CASP) {
    const want = spanLo * CASP, mid = (laMin + laMax) / 2;
    laMin = mid - want / 2; laMax = mid + want / 2; spanLa = want;
  } else {
    const want = spanLa / CASP, mid = (loMin + loMax) / 2;
    loMin = mid - want / 2; loMax = mid + want / 2; spanLo = want;
  }
  return {
    x: function (lon) { return ((lon - loMin) / spanLo) * CW; },
    y: function (lat) { return ((laMax - lat) / spanLa) * CH; },
    b: { loMin: loMin, loMax: loMax, laMin: laMin, laMax: laMax }
  };
}

function ticks(min, max) {
  const span = max - min;
  const steps = [2, 5, 10, 20, 30, 45];
  let step = 60;
  for (let i = 0; i < steps.length; i++) if (span / steps[i] <= 7) { step = steps[i]; break; }
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) out.push(v);
  return out;
}

function arc(a, b, pr) {
  const x1 = pr.x(a.lon), y1 = pr.y(a.lat), x2 = pr.x(b.lon), y2 = pr.y(b.lat);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bow = Math.min(len * 0.15, 54);
  return "M" + x1.toFixed(1) + " " + y1.toFixed(1) +
    " Q" + (mx - (dy / len) * bow).toFixed(1) + " " + (my + (dx / len) * bow).toFixed(1) +
    " " + x2.toFixed(1) + " " + y2.toFixed(1);
}

function mapSvg(routings, opts) {
  const o = opts || {};
  const seen = {};
  routings.forEach(function (r) {
    r.codes.forEach(function (c, i) {
      if (!PORT[c]) return;
      if (!seen[c]) seen[c] = { p: PORT[c], hub: false };
      if (i === 0 || i === r.codes.length - 1) seen[c].hub = true;
    });
  });
  const pts = Object.keys(seen).map(function (k) { return seen[k]; });
  if (!pts.length) return "";

  const pr = fitProj(pts.map(function (x) { return x.p; }));
  const focus = o.focus ? PORT[o.focus] : null;
  const k = focus ? 2.4 : 1;
  const tx = focus ? CW / 2 - k * pr.x(focus.lon) : 0;
  const ty = focus ? CH / 2 - k * pr.y(focus.lat) : 0;

  let svg = '<svg class="rmap__svg" viewBox="0 0 ' + CW + " " + CH + '" role="img" aria-label="Route map">' +
    '<g class="rmap__zoom" style="transform:translate(' + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + k + ')">' +
    '<g class="rmap__grid" aria-hidden="true">';
  ticks(pr.b.loMin, pr.b.loMax).forEach(function (lon) {
    svg += '<line x1="' + pr.x(lon).toFixed(1) + '" y1="0" x2="' + pr.x(lon).toFixed(1) + '" y2="' + CH + '"></line>';
  });
  ticks(pr.b.laMin, pr.b.laMax).forEach(function (lat) {
    svg += '<line x1="0" y1="' + pr.y(lat).toFixed(1) + '" x2="' + CW + '" y2="' + pr.y(lat).toFixed(1) + '"></line>';
  });
  svg += "</g>";

  routings.forEach(function (r, ri) {
    for (let i = 0; i < r.codes.length - 1; i++) {
      const a = PORT[r.codes[i]], b = PORT[r.codes[i + 1]];
      if (!a || !b) continue;
      const cls = "rmap__leg" + (r.direct ? " is-direct" : "") +
        (o.lit && o.lit !== r.key ? " is-dim" : "") + (o.lit === r.key ? " is-lit" : "");
      svg += '<path class="' + cls + '" pathLength="1" d="' + arc(a, b, pr) + '"' +
        (r.color ? ' style="stroke:' + r.color + ';animation-delay:' + (ri * 70 + i * 50) + 'ms"'
                 : ' style="animation-delay:' + (ri * 70 + i * 50) + 'ms"') + "></path>";
    }
  });

  pts.forEach(function (x) {
    const p = x.p;
    const cls = "rmap__port" + (x.hub ? " is-endpoint" : "") +
      (state.filters.via === p.code ? " is-via" : "") +
      (state.filters.notVia === p.code ? " is-notvia" : "") +
      (o.focus === p.code ? " is-focus" : "");
    svg += '<g class="' + cls + '" transform="translate(' + pr.x(p.lon).toFixed(1) + " " +
      pr.y(p.lat).toFixed(1) + ") scale(" + (1 / k).toFixed(3) + ')">' +
      (o.pick === false ? "" :
        '<rect class="rmap__hit" x="-15" y="-15" width="30" height="30" data-port="' + p.code +
        '" role="button" tabindex="0" aria-label="' + esc(p.name) + '"></rect>') +
      '<circle class="rmap__dot" cx="0" cy="0" r="' + (x.hub ? 5 : 3.6) + '"></circle>' +
      '<text class="rmap__label" x="0" y="-10">' + esc(p.code.slice(2)) + "</text>" +
      "</g>";
  });

  return svg + "</g></svg>";
}

function routeMapHtml(rows) {
  const routings = routingsOf(rows);
  if (!routings.length) return '<div class="rmap rmap--empty">No routing to draw yet.</div>';

  const focus = state.focus ? PORT[state.focus] : null;
  const panel = focus
    ? '<div class="rmap__panel">' +
        '<span class="rmap__who"><b>' + esc(focus.name) + "</b><small>" + focus.code + " · " + esc(focus.country) + "</small></span>" +
        '<span class="rmap__acts">' +
          '<button type="button" class="chip" data-set-via="' + focus.code + '" aria-pressed="' + (state.filters.via === focus.code) + '">Route via</button>' +
          '<button type="button" class="chip" data-set-notvia="' + focus.code + '" aria-pressed="' + (state.filters.notVia === focus.code) + '">Avoid</button>' +
        "</span>" +
        '<button type="button" class="rmap__back" data-unfocus="1">Zoom out</button>' +
      "</div>"
    : '<p class="rmap__hint">Press a port to zoom in, then route through it or avoid it. Positions are real; coastlines are not drawn.</p>';

  return '<div class="ov__map">' +
    '<div class="rmap">' + mapSvg(routings, { focus: state.focus }) + panel + "</div>" +
    '<div><span class="eyebrow">Routings</span><ul class="ov__routings">' +
      routings.slice(0, 8).map(function (r) {
        const label = r.direct ? "Direct"
          : r.codes.slice(1, -1).map(function (c) { return PORT[c] ? PORT[c].name : c; }).join(", ");
        return "<li><b>" + esc(label) + "</b><small>" +
          (r.min === r.max ? plural(r.min, "day") : r.min + " to " + r.max + " days") +
          ", " + plural(r.n, "sailing") + "</small></li>";
      }).join("") +
    "</ul></div></div>";
}

/* ---------- provider panels ---------- */

/* A routing has to fit one line on a panel, so past two calls it counts. */
function viaLabel(r) {
  if (r.direct) return "Direct";
  if (r.via.length <= 2) return "Via " + r.via.map(function (v) { return v.slice(2); }).join(" ");
  return "Via " + plural(r.via.length, "call");
}

function cutClass(r) {
  const now = new Date();
  if (r.cut < now) return " is-closed";
  return diffDays(TODAY, r.cut) <= 2 ? " is-urgent" : "";
}

function cardsHtml(rows) {
  const byFirm = {};
  rows.forEach(function (r) {
    (byFirm[r.firm.id] = byFirm[r.firm.id] || []).push(r);
  });
  const ids = Object.keys(byFirm).sort(function (a, b) {
    return (FIRM[b].featured - FIRM[a].featured) ||
      (FIRM[b].verified - FIRM[a].verified) ||
      byFirm[b].length - byFirm[a].length;
  });

  const cards = ids.map(function (id) {
    const c = FIRM[id];
    const list = byFirm[id].slice(0, 3);
    const all = byFirm[id];
    const fastest = Math.min.apply(null, all.map(function (r) { return r.days; }));
    const directs = all.filter(function (r) { return r.direct; }).length;

    return '<article class="co">' +
      '<div class="co__bar" style="background:' + TONES[c.tone] + '">' +
        '<span class="co__mono">' + esc(c.id) + "</span>" +
        '<span class="co__id">' +
          '<a class="co__name" href="#/search?type=' + typeKeyOf(c.type) + '">' + esc(c.name) + "</a>" +
          '<span class="co__sub mono">' + esc(c.type.toUpperCase()) + (c.verified ? " · VERIFIED" : "") + "</span>" +
        "</span>" +
        (c.featured ? '<span class="co__flag">FEATURED</span>' : "") +
      "</div>" +
      '<p class="co__pitch">' + esc(c.pitch) + "</p>" +
      '<ul class="co__sailings">' + list.map(function (r) {
        const picked = state.picks.some(function (p) { return p.key === r.key; });
        const full = !picked && state.picks.length >= 3;
        return "<li>" +
          '<button type="button" class="co__sailing" data-open="' + r.key + '">' +
            '<span class="co__etd mono">' + fmtD(r.etd) + "</span>" +
            '<span class="co__vessel">' + esc(r.vessel) +
              "<small>" + (state.dest ? viaLabel(r) : "For " + esc(PORT[r.to].name)) +
              ", " + plural(r.days, "day") + ", " + esc(r.term) + "</small></span>" +
            '<span class="co__cut' + cutClass(r) + '">' +
              (r.cut < new Date() ? "Closed" : fmtD(r.cut)) + "</span>" +
          "</button>" +
          '<label class="co__compare"><input type="checkbox" data-pick="' + r.key + '"' +
            (picked ? " checked" : "") + (full ? " disabled" : "") +
            ' aria-label="Compare ' + esc(r.vessel) + ' ' + esc(r.voy) + '">' +
            "<span>Compare</span></label>" +
          "</li>";
      }).join("") + "</ul>" +
      '<div class="co__foot">' +
        '<span class="co__price"><b>' + plural(fastest, "day") + "</b>" +
          "<small>fastest, " + (directs ? directs + " direct" : "all transship") + "</small></span>" +
        '<a class="pill pill--quiet" href="#/search?type=' + typeKeyOf(c.type) + '">All sailings</a>' +
      "</div></article>";
  }).join("");

  const promo = '<article class="co co--promo">' +
    '<p class="co__promoline">Move cargo out of Karachi?</p>' +
    '<p class="co__promobody">List your sailings on KARGOS and shippers will find them while they are still bookable.</p>' +
    '<div class="co__foot"><a class="pill pill--solid" href="#/search">List your company</a></div>' +
    "</article>";

  return '<div class="cards">' + cards + promo + "</div>";
}

function emptyHtml(anyBefore) {
  return '<div class="dir__empty">' +
    "<b>" + (anyBefore ? "Nothing survives those filters." : "Nothing sails that lane in this window.") + "</b>" +
    "<p>" + (anyBefore
      ? "There are sailings on this lane. Drop a filter to get them back."
      : "Try a wider window, or one of the ports these services actually call at.") + "</p>" +
    '<div class="fpanel__opts">' +
      (anyBefore ? '<button type="button" class="chip" data-clear="1">Clear filters</button>' : "") +
      '<button type="button" class="chip" data-when="6w">Search the next 6 weeks</button>' +
      '<button type="button" class="chip" data-anywhere="1">Anywhere</button>' +
    "</div></div>";
}

/* ---------- compare tray ---------- */

function trayHtml() {
  if (!state.picks.length) return "";
  return '<div class="tray">' +
    '<span class="tray__count">' + state.picks.length + " of 3 picked</span>" +
    '<ul class="tray__list">' + state.picks.map(function (r) {
      return "<li>" +
        '<span class="tray__mono" style="background:' + TONES[r.firm.tone] + '">' + esc(r.firm.id) + "</span>" +
        '<span class="tray__what"><b>' + esc(r.vessel) + "</b><small>" + fmtD(r.etd) + " · " + esc(r.voy) + "</small></span>" +
        '<button type="button" data-unpick="' + r.key + '" aria-label="Remove ' + esc(r.vessel) + '">&#10005;</button></li>';
    }).join("") + "</ul>" +
    '<div class="tray__acts">' +
      '<button type="button" class="pill pill--quiet" data-clearpicks="1">Clear</button>' +
      '<button type="button" class="pill pill--solid" data-compare="1"' +
        (state.picks.length < 2 ? " disabled" : "") + ">Compare " + state.picks.length + "</button>" +
    "</div></div>";
}

/* ===========================================================
   RENDER
   =========================================================== */

let lastView = null;

function render() {
  const root = $("#root");

  if (state.view === "home") {
    if (lastView !== "home") {
      root.innerHTML = homeHtml();
      lastView = "home";
    }
    document.title = "KARGOS — every sailing out of Pakistan";
    return;
  }

  if (lastView !== "results") {
    root.innerHTML = resultsShellHtml();
    lastView = "results";
  }

  const found = findSails({ origin: state.origin, dest: state.dest, win: state.win });
  const kept = applyFilters(found, state.filters);
  const typed = byType(kept, state.type);
  const rows = sortRows(typed, state.sort);

  const firms = {};
  rows.forEach(function (r) { firms[r.firm.id] = 1; });
  const firmCount = Object.keys(firms).length;

  $("#resRow").innerHTML = rowHtml();

  const counts = {};
  TYPES.forEach(function (t) {
    const set = {};
    byType(kept, t.key).forEach(function (r) { set[r.firm.id] = 1; });
    counts[t.key] = Object.keys(set).length;
  });

  const main = $("#resMain");
  main.innerHTML =
    (state.filtersOpen ? filterPanelHtml(found) : "") +
    '<div class="res__head"><h1 class="res__lane">' + laneTitle() + "</h1>" +
      '<p class="res__sub">' + plural(firmCount, "provider") + ", " + esc(state.win.label.toLowerCase()) +
      (state.dest ? "" : ", every destination") +
      (rows.length ? "" : ' · <span class="res__note">nothing found</span>') + "</p></div>" +
    '<section class="ov" aria-label="Overview">' +
      '<div class="ov__switch" role="tablist" aria-label="Overview view">' +
        '<button type="button" role="tab" class="ov__tab" data-ov="board" aria-selected="' + (state.ov === "board") + '">Departures</button>' +
        '<button type="button" role="tab" class="ov__tab" data-ov="map" aria-selected="' + (state.ov === "map") + '">Route map' +
          '<span class="ov__count">' + routingsOf(kept).length + "</span></button>" +
      "</div>" +
      (state.ov === "board" ? timelineHtml(applyFilters(found, Object.assign({}, state.filters, { day: null })))
                            : routeMapHtml(kept)) +
    "</section>" +
    '<div class="res__tabs" role="tablist" aria-label="Provider type">' +
      TYPES.map(function (t) {
        return '<button type="button" role="tab" class="chip" data-type="' + t.key + '"' +
          ' aria-selected="' + (state.type === t.key) + '">' + esc(t.label) +
          '<span class="chip__count">' + counts[t.key] + "</span></button>";
      }).join("") +
    "</div>" +
    (rows.length ? cardsHtml(rows) : emptyHtml(found.length > 0)) +
    '<p class="sample-note res__foot">Sailings are generated from published weekly rotations, so the board never goes stale. ' +
      "Every company, vessel, cut-off and rate here is sample data.</p>" +
    trayHtml();

  document.title = state.dest
    ? "KARGOS — " + PORT[state.origin || "PKKHI"].name + " to " + PORT[state.dest].name
    : "KARGOS — sailings out of Pakistan";

  indexRows();
}

/* ---------- the sailing drawer ---------- */

let drawerRow = null;

function openDrawer(row) {
  drawerRow = row;
  const d = $("#drawer");
  const r = row;
  const left = diffDays(TODAY, r.cut);
  const closed = r.cut < new Date();
  const rates = ratesOf(r);
  const quotesOnly = r.firm.type === "Forwarder" || r.firm.type === "Customs agent";

  d.innerHTML = '<div class="sheet">' +
    '<div class="sheet__head">' +
      '<span class="sheet__mono" style="background:' + TONES[r.firm.tone] + '">' + esc(r.firm.id) + "</span>" +
      '<span class="sheet__title"><b>' + esc(r.vessel) + "</b><span>" + esc(r.voy) + " · " + esc(r.svc.name) + "</span></span>" +
      '<button type="button" class="sheet__x" data-close="1" aria-label="Close">&#10005;</button>' +
    "</div>" +
    '<div class="sheet__cut' + (closed ? " is-closed" : (left <= 2 ? " is-urgent" : "")) + '">' +
      '<span class="eyebrow">Gate-in cut-off</span>' +
      "<b>" + fmtDT(r.cut) + "</b>" +
      "<span>" + (closed ? "Closed" : (left === 0 ? "Closes today" : plural(left, "day") + " left")) +
        " · " + esc(r.term === "Transship" ? "transshipment call" : r.term) + "</span>" +
    "</div>" +
    '<div class="sheet__legs"><span class="eyebrow">Routing</span><ul class="legs">' +
      r.calls.map(function (c, i) {
        const isFirst = i === 0, isLast = i === r.calls.length - 1;
        return '<li class="' + (isFirst ? "is-origin" : (isLast ? "is-dest" : "")) + '">' +
          '<span class="legs__code mono">' + esc(c.code) + "</span>" +
          '<span class="legs__name"><b>' + esc(PORT[c.code].name) + "</b><small>" + fmtD(c.date) + "</small></span>" +
          '<span class="legs__tag">' + (isFirst ? "Load" : (isLast ? "Discharge" : "Call")) + "</span></li>";
      }).join("") +
    "</ul></div>" +
    '<p class="sheet__meta">' + (r.direct ? "Direct call" : plural(r.via.length, "transshipment")) +
      " · " + plural(r.days, "day") + " port to port · " +
      (r.svc.mode === "road" ? "road haulage" : "weekly service") +
      " · " + esc(r.cargo.join(", ") || "Dry") + "</p>" +
    (quotesOnly
      ? '<div class="sheet__rates sheet__rates--quote"><b>Quoted per shipment</b>' +
        "<p>" + esc(r.firm.name) + " arranges this sailing rather than publishing a box rate. Ask for a quote with your cargo details.</p></div>"
      : '<div class="sheet__rates"><div class="sheet__ratehead"><span class="eyebrow">Indicative rate</span>' +
        "<small>sample data, all-in, ex works excluded</small></div>" +
        '<div class="ratetable">' +
          "<div><span>20&#39; DRY</span><strong>" + money(rates.d20) + "</strong></div>" +
          "<div><span>40&#39; DRY</span><strong>" + money(rates.d40) + "</strong></div>" +
          "<div><span>40&#39; REEFER</span><strong>" +
            (r.cargo.indexOf("Reefer") > -1 ? money(rates.r40) : "n/a") + "</strong></div>" +
        "</div></div>") +
    '<div class="sheet__actions">' +
      '<button type="button" class="pill pill--solid" data-close="1">Request booking</button>' +
      '<button type="button" class="pill pill--quiet" data-pickthis="' + r.key + '">' +
        (state.picks.some(function (p) { return p.key === r.key; }) ? "In compare" : "Add to compare") + "</button>" +
    "</div></div>";

  if (!d.open) d.showModal();
}

/* ---------- compare ---------- */

const CMP_ROWS = [
  ["Provider", null, function (r) { return [r.firm.name, r.firm.type]; }],
  ["Routing", null, function (r) {
    return [r.calls.map(function (c) { return PORT[c.code].name; }).join(" → "),
            r.direct ? "Direct call" : plural(r.via.length, "transshipment")];
  }],
  ["Transshipments", "min", function (r) { return [r.direct ? "None" : String(r.via.length), "", r.via.length]; }],
  ["Transit", "min", function (r) { return [plural(r.days, "day"), "", r.days]; }],
  ["Departs", "min", function (r) { return [fmtD(r.etd), r.term, +r.etd]; }],
  ["Arrives", "min", function (r) { return [fmtD(r.eta), "", +r.eta]; }],
  ["Cut-off", "max", function (r) {
    const left = diffDays(TODAY, r.cut);
    return [fmtDT(r.cut), left < 0 ? "Closed" : (left === 0 ? "Closes today" : plural(left, "day") + " left"), left];
  }],
  ["Service", null, function (r) { return [r.svc.name, r.svc.mode === "road" ? "Road haulage" : "Weekly"]; }],
  ["Cargo", null, function (r) { return [r.cargo.join(", ") || "Dry", ""]; }],
  ["20&#39; dry, indicative", "min", function (r) {
    const v = ratesOf(r).d20;
    return [money(v), "sample rate", v];
  }]
];

const CMP_COLORS = ["var(--brand)", "var(--brand-2)", "var(--accent)"];

function openCompare() {
  const picks = state.picks;
  if (picks.length < 2) return;

  const same = picks.every(function (r) { return r.vessel === picks[0].vessel && r.voy === picks[0].voy; });

  const routings = picks.map(function (r, i) {
    return {
      key: r.key,
      codes: r.calls.map(function (c) { return c.code; }),
      direct: r.direct,
      color: CMP_COLORS[i % CMP_COLORS.length]
    };
  });

  let table = '<table class="cmp__table"><thead><tr><th><span class="sr">Attribute</span></th>' +
    picks.map(function (r, i) {
      return '<th><span class="cmp__vessel"><span class="cmp__mono" style="background:' + TONES[r.firm.tone] + '">' +
        esc(r.firm.id) + "</span><b>" + esc(r.vessel) + "</b><small>" + esc(r.voy) + "</small></span></th>";
    }).join("") + "</tr></thead><tbody>";

  CMP_ROWS.forEach(function (row) {
    const cells = picks.map(function (r) { return row[2](r); });
    let win = -1;
    if (row[1]) {
      const nums = cells.map(function (c) { return c[2]; });
      const ok = nums.every(function (n) { return typeof n === "number" && isFinite(n); });
      if (ok && new Set(nums).size > 1) {
        const target = row[1] === "min" ? Math.min.apply(null, nums) : Math.max.apply(null, nums);
        win = nums.indexOf(target);
      }
    }
    table += "<tr><th>" + row[0] + "</th>" + cells.map(function (c, i) {
      return "<td" + (i === win ? ' class="is-best"' : "") + ">" +
        '<span class="cmp__value">' + esc(c[0]) + "</span>" +
        (c[1] ? "<small>" + esc(c[1]) + "</small>" : "") +
        (i === win ? '<span class="cmp__flag">Best</span>' : "") + "</td>";
    }).join("") + "</tr>";
  });
  table += "</tbody></table>";

  $("#cmp").innerHTML = '<div class="cmp__sheet">' +
    '<div class="cmp__head"><div><h2>Compare sailings</h2>' +
      "<p>" + plural(picks.length, "sailing") + " on " +
      (state.dest ? esc(PORT[state.origin || picks[0].from].name) + " to " + esc(PORT[state.dest].name)
                  : "your search") + "</p></div>" +
      '<button type="button" class="cmp__x" data-closecmp="1" aria-label="Close">&#10005;</button></div>' +
    (same ? '<p class="cmp__same"><b>Same sailing, different providers.</b> All of these are ' +
      esc(picks[0].vessel) + " " + esc(picks[0].voy) + ", so the schedule is identical. What differs is who you book with.</p>" : "") +
    '<div class="cmp__body">' +
      '<div class="cmp__map"><div class="rmap">' + mapSvg(routings, { pick: false }) + "</div>" +
        '<ul class="cmp__legend">' + picks.map(function (r, i) {
          return '<li><span class="cmp__swatch" style="background:' + CMP_COLORS[i % CMP_COLORS.length] + '"></span>' +
            "<span><b>" + esc(r.vessel) + "</b><small>" + esc(r.firm.name) + " · " + plural(r.days, "day") + "</small></span></li>";
        }).join("") + "</ul></div>" +
      '<div class="cmp__scroll">' + table + "</div>" +
    "</div>" +
    '<div class="cmp__foot"><button type="button" class="pill pill--solid" data-closecmp="1">Close</button>' +
      '<span class="sample-note cmp__note">Rates and cut-offs are sample data.</span></div>' +
    "</div>";

  const dlg = $("#cmp");
  if (!dlg.open) dlg.showModal();
}

/* ===========================================================
   THE CAPSULE
   =========================================================== */

const capDraft = { origin: null, destination: null, when: null };

function fieldOnly(field) {
  return field === "origin" ? "pk" : (field === "destination" ? "out" : null);
}

function closeLists() {
  $$(".cap__list").forEach(function (l) { l.hidden = true; });
  $$(".cap__seg input").forEach(function (i) { i.setAttribute("aria-expanded", "false"); });
}

function optionsFor(field, text) {
  if (field === "when") {
    const presets = WHEN_PRESETS.map(function (p) {
      return { code: "", name: p.label, sub: p.hint, value: p.label === "Any date" ? "" : p.label };
    });
    const parsed = parseWhen(text);
    if (text && parsed.key !== "" ) {
      presets.unshift({ code: "SET", name: parsed.label, sub: fmtD(parsed.from) + " to " + fmtD(parsed.to), value: text });
    }
    return presets;
  }
  const list = rankPorts(text, fieldOnly(field)).map(function (p) {
    return { code: p.code, name: p.name, sub: p.country + (p.terms ? " · " + p.terms.join(", ") : ""), value: p.code };
  });
  const any = field === "origin"
    ? { code: "PK", name: "Karachi, all ports", sub: "Karachi, Port Qasim and Gwadar", value: "" }
    : { code: "ANY", name: "Anywhere", sub: "Every destination these services reach", value: "" };
  /* Typing means you want a port, so the best match keeps the cursor
     and the catch-all drops to the bottom. */
  if (String(text || "").trim()) list.push(any);
  else list.unshift(any);
  return list;
}

function openList(field) {
  const input = $('[data-field="' + field + '"]');
  const box = $("#cap-" + field + "-list");
  const text = capDraft[field] == null ? "" : capDraft[field];
  const opts = optionsFor(field, text);
  box.innerHTML = opts.map(function (o, i) {
    return '<button type="button" role="option" aria-selected="false" data-pick-opt="' + esc(o.value) + '"' +
      (i === 0 ? ' class="is-cursor"' : "") + ">" +
      (o.code ? '<span class="cap__code mono">' + esc(o.code) + "</span>" : "") +
      '<span class="cap__opt"><b>' + esc(o.name) + "</b><small>" + esc(o.sub) + "</small></span></button>";
  }).join("");
  box.hidden = false;
  input.setAttribute("aria-expanded", "true");
}

function commitOption(field, value) {
  if (field === "origin") state.origin = value;
  else if (field === "destination") state.dest = value;
  else { state.whenText = value; state.win = parseWhen(value); }
  capDraft[field] = null;
  closeLists();
  syncCapsule();
  runSearch();
}

function syncCapsule() {
  const o = $('[data-field="origin"]');
  const d = $('[data-field="destination"]');
  const w = $('[data-field="when"]');
  if (o) o.value = state.origin ? PORT[state.origin].name + " · " + state.origin : "Karachi, all ports";
  if (d) d.value = state.dest ? PORT[state.dest].name + " · " + state.dest : "";
  if (w) w.value = state.whenText;
}

function runSearch(replaceUrl) {
  state.view = "results";
  state.focus = null;
  writeUrl(replaceUrl);
  render();
  syncCapsule();
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* ===========================================================
   EVENTS
   =========================================================== */

document.addEventListener("click", function (e) {
  const t = e.target;

  const palette = t.closest("[data-palette-next]");
  if (palette) {
    setPalette(palette.getAttribute("data-palette-next"));
    lastView = null;
    render();
    return;
  }

  const try2 = t.closest("[data-try]");
  if (try2) {
    const bits = try2.getAttribute("data-try").split("|");
    state.origin = bits[0];
    state.dest = bits[1];
    state.whenText = "";
    state.win = parseWhen("");
    clearFilters();
    runSearch();
    return;
  }

  const opt = t.closest("[data-pick-opt]");
  if (opt) {
    const seg = opt.closest(".cap__seg");
    const input = $("input", seg);
    commitOption(input.getAttribute("data-field"), opt.getAttribute("data-pick-opt"));
    return;
  }

  if (!t.closest(".cap__seg")) closeLists();

  const filtersBtn = t.closest(".res__filters");
  if (filtersBtn) {
    state.filtersOpen = !state.filtersOpen;
    render();
    return;
  }

  const drop = t.closest("[data-drop]");
  if (drop) {
    const k = drop.getAttribute("data-drop");
    if (k === "direct") state.filters.direct = false;
    else if (k === "maxDays") state.filters.maxDays = 0;
    else if (k === "term" || k === "cargo") state.filters[k] = "";
    else state.filters[k] = null;
    render();
    return;
  }

  if (t.closest("[data-clear]")) { clearFilters(); render(); return; }

  const setDirect = t.closest("[data-set-direct]");
  if (setDirect) { state.filters.direct = !state.filters.direct; render(); return; }

  const setVia = t.closest("[data-set-via]");
  if (setVia) {
    const c = setVia.getAttribute("data-set-via");
    state.filters.via = state.filters.via === c ? null : c;
    if (state.filters.notVia === c) state.filters.notVia = null;
    render();
    return;
  }

  const setNot = t.closest("[data-set-notvia]");
  if (setNot) {
    const c = setNot.getAttribute("data-set-notvia");
    state.filters.notVia = state.filters.notVia === c ? null : c;
    if (state.filters.via === c) state.filters.via = null;
    render();
    return;
  }

  const setDays = t.closest("[data-set-days]");
  if (setDays) {
    const d = +setDays.getAttribute("data-set-days");
    state.filters.maxDays = state.filters.maxDays === d ? 0 : d;
    render();
    return;
  }

  const setTerm = t.closest("[data-set-term]");
  if (setTerm) {
    const v = setTerm.getAttribute("data-set-term");
    state.filters.term = state.filters.term === v ? "" : v;
    render();
    return;
  }

  const setCargo = t.closest("[data-set-cargo]");
  if (setCargo) {
    const v = setCargo.getAttribute("data-set-cargo");
    state.filters.cargo = state.filters.cargo === v ? "" : v;
    render();
    return;
  }

  const day = t.closest("[data-day]");
  if (day && !day.disabled) {
    const k = day.getAttribute("data-day");
    state.filters.day = state.filters.day === k ? null : k;
    render();
    return;
  }

  const ov = t.closest("[data-ov]");
  if (ov) { state.ov = ov.getAttribute("data-ov"); render(); return; }

  const type = t.closest("[data-type]");
  if (type) {
    state.type = type.getAttribute("data-type");
    writeUrl(true);
    render();
    return;
  }

  const port = t.closest("[data-port]");
  if (port) {
    const c = port.getAttribute("data-port");
    state.focus = state.focus === c ? null : c;
    render();
    return;
  }

  if (t.closest("[data-unfocus]")) { state.focus = null; render(); return; }

  const when = t.closest("[data-when]");
  if (when) {
    state.whenText = "6 weeks";
    state.win = parseWhen(state.whenText);
    syncCapsule();
    writeUrl(true);
    render();
    return;
  }

  if (t.closest("[data-anywhere]")) {
    state.dest = "";
    clearFilters();
    syncCapsule();
    writeUrl(true);
    render();
    return;
  }

  const open = t.closest("[data-open]");
  if (open) {
    const row = rowByKey(open.getAttribute("data-open"));
    if (row) openDrawer(row);
    return;
  }

  if (t.closest("[data-close]")) { $("#drawer").close(); return; }
  if (t.closest("[data-closecmp]")) { $("#cmp").close(); return; }

  const pickThis = t.closest("[data-pickthis]");
  if (pickThis) {
    togglePick(pickThis.getAttribute("data-pickthis"));
    $("#drawer").close();
    return;
  }

  const unpick = t.closest("[data-unpick]");
  if (unpick) { togglePick(unpick.getAttribute("data-unpick")); return; }

  if (t.closest("[data-clearpicks]")) { state.picks = []; render(); return; }
  if (t.closest("[data-compare]")) { openCompare(); return; }
});

document.addEventListener("change", function (e) {
  const pick = e.target.closest("[data-pick]");
  if (pick) { togglePick(pick.getAttribute("data-pick")); return; }
  if (e.target.id === "sortSel") {
    state.sort = e.target.value;
    writeUrl(true);
    render();
  }
});

document.addEventListener("input", function (e) {
  const field = e.target.getAttribute && e.target.getAttribute("data-field");
  if (!field) return;
  capDraft[field] = e.target.value;
  openList(field);
});

document.addEventListener("focusin", function (e) {
  const field = e.target.getAttribute && e.target.getAttribute("data-field");
  if (!field) return;
  capDraft[field] = "";
  e.target.select();
  openList(field);
});

document.addEventListener("keydown", function (e) {
  const field = e.target.getAttribute && e.target.getAttribute("data-field");
  if (field) {
    const box = $("#cap-" + field + "-list");
    const opts = box && !box.hidden ? $$("button", box) : [];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!opts.length) return;
      e.preventDefault();
      let i = opts.findIndex(function (o) { return o.classList.contains("is-cursor"); });
      i = e.key === "ArrowDown" ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
      opts.forEach(function (o, k) { o.classList.toggle("is-cursor", k === i); });
      opts[i].scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const cursor = opts.find(function (o) { return o.classList.contains("is-cursor"); });
      if (cursor) { cursor.click(); return; }
      /* No list open: take the text at face value. */
      if (field === "when") {
        state.whenText = e.target.value;
        state.win = parseWhen(state.whenText);
      } else {
        const p = resolvePort(e.target.value, fieldOnly(field));
        if (field === "origin") state.origin = p ? p.code : "";
        else state.dest = p ? p.code : "";
      }
      closeLists();
      syncCapsule();
      runSearch();
      return;
    }
    if (e.key === "Escape") { closeLists(); e.target.blur(); }
    return;
  }

  if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
    const first = $('[data-field="origin"]');
    if (first) { e.preventDefault(); first.focus(); }
  }
});

document.addEventListener("submit", function (e) {
  if (!e.target.closest(".cap")) return;
  e.preventDefault();
  ["origin", "destination", "when"].forEach(function (field) {
    const input = $('[data-field="' + field + '"]');
    if (!input || capDraft[field] == null) return;
    if (field === "when") {
      state.whenText = input.value;
      state.win = parseWhen(state.whenText);
    } else {
      const p = resolvePort(input.value, fieldOnly(field));
      if (field === "origin") state.origin = p ? p.code : "";
      else state.dest = p ? p.code : "";
    }
  });
  closeLists();
  syncCapsule();
  runSearch();
});

/* Clicking the backdrop closes a dialog. */
["drawer", "cmp"].forEach(function (id) {
  const dlg = $("#" + id);
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close();
  });
});

window.addEventListener("hashchange", function () {
  readUrl();
  render();
  syncCapsule();
});

/* ---------- lookups the handlers need ---------- */

let rowIndex = {};

function indexRows() {
  const found = findSails({ origin: state.origin, dest: state.dest, win: state.win });
  rowIndex = {};
  found.forEach(function (r) { rowIndex[r.key] = r; });
}

function rowByKey(key) {
  if (!rowIndex[key]) indexRows();
  return rowIndex[key];
}

function togglePick(key) {
  const at = state.picks.findIndex(function (p) { return p.key === key; });
  if (at > -1) state.picks.splice(at, 1);
  else if (state.picks.length < 3) {
    const r = rowByKey(key);
    if (r) state.picks.push(r);
  }
  render();
  if ($("#cmp").open) {
    if (state.picks.length < 2) $("#cmp").close();
    else openCompare();
  }
}

/* ---------- boot ---------- */

readUrl();
render();
syncCapsule();
