# ⚠️ LEGAL_REVIEW_REQUIRED

**No document generated from these templates may reach a real client until a
German _Fachanwalt für Arbeitsrecht / IT-Recht_ has reviewed the template it was
generated from.** This is a hard rule from `CLAUDE.md` §4. It is not advice; it
is the condition on which the whole Werkvertrag positioning stands or falls — an
unreviewed contract that fails to establish a genuine _Werkvertrag_ recreates the
exact Scheinselbstständigkeit liability the product claims to remove.

## Status

| Template | Version | Reviewed | Reviewer | Date |
|---|---|---|---|---|
| `de/werkvertrag.v1.ts` | v1 | **NO** | — | — |

Until a row above says **YES**, every generated document renders with a visible
`ENTWURF · rechtlich ungeprüft` mark (see `draft` flag in the generator). Do not
remove that mark by default; clear it per-document only after the template is
reviewed and this table is updated.

## Rules for this directory

- **Legal text lives here, never inline in a component** (§11). Components render
  the structured document these files return; they do not contain clauses.
- **Templates are versioned and swappable.** Never edit a reviewed version in
  place — add `…v2.ts` and switch the active export. A reviewed version is a
  legal artefact; changing its text silently is how you ship an unreviewed clause
  under a "reviewed" label.
- **One locale per subdirectory** (`de/`, later `en/`). German legal documents
  are authored in German, not machine-translated (§6).
- **No time-based pricing anywhere** — no `Stundensatz`, `Tagessatz`, hours or
  days as a billing unit. Price is per delivered, accepted result (§1, §4). A
  test enforces this against the rendered output.

## What the generator does not do yet

- No compliance-dossier assembly (spec §4 "headline feature") — that is Phase 1
  item 8, and needs the ops dashboard (item 4) underneath it.
- No entity details: the Hyrde legal entity (§12 #2) is undecided, so the
  Auftragnehmer block renders a clearly-marked placeholder, not a real Rechtsträger.
