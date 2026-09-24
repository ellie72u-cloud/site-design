# KARGOS

A search front end for Pakistan's shipping industry: every shipping line, NVOCC,
forwarder and customs agent working out of Karachi, Port Qasim and Gwadar, and
the sailings they can put you on.

This is the working build of the KARGOS design assets. The two design artifacts
(`KARGOS — Home` and `KARGOS — Results panels`) were static snapshots with
`pointer-events: none` on everything; this repository is the same design with
the search engine behind it.

## Running it

No build step and no dependencies. Open `index.html`, or serve the folder:

```sh
npx http-server . -p 8080
```

## What is here

| File | What it holds |
| --- | --- |
| `index.html` | The shell: root node, the sailing drawer and the compare dialog. |
| `assets/kargos.css` | The design system exactly as exported from the design assets — five palettes, the component layer, the responsive rules. Not hand-edited. |
| `assets/data.js` | Ports, services and providers. |
| `assets/app.js` | The engine and the two pages. |

## The pages

**Home** takes a lane. One capsule (From / To / Sailing), a split-flap board of
the next departures out of Pakistan, the crawlable lane index by region, and the
providers listed on KARGOS.

**Results** answers it. A sticky capsule, filters and sort, then:

- **Departures** — a 21-day timeline; each day stacks one box per sailing and
  filters the results when pressed.
- **Route map** — the distinct routings drawn on real port positions. Press a
  port to zoom, then route through it or avoid it.
- **Provider panels** — one panel per company with its next three sailings,
  cut-off urgency, and a compare checkbox.
- **Drawer** — full call-by-call routing, gate-in cut-off, indicative rates.
- **Compare** — up to three sailings side by side, best value in each row
  flagged, with the routes drawn together.

The palette button in the masthead cycles Harbour, Graphite, Forest, Terracotta
and Ink, and remembers the choice.

Searches live in the URL (`#/search?from=PKKHI&to=AEJEA&sort=transit`), so a
result set can be linked and the back button works.

## The data

Ports, terminals and LOCODEs are real reference facts. PICT is deliberately
absent: its concession expired in June 2023 and KGTL took over the premises.

Everything else — companies, vessels, rotations, cut-offs and rates — is
invented for this prototype and labelled as sample data throughout the
interface. Sailings are generated from the weekly rotations relative to today,
so the board never goes stale, and cut-offs that have passed drop out of the
results by themselves.

## What it is not

There is no back end, no booking and no live schedule feed. Rates are derived
from transit time so that the drawer and the compare table agree; they are not
quotes.
