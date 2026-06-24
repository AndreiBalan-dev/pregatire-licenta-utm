# -*- coding: utf-8 -*-
"""
Merge the per-submodule agent outputs (<scratch>/confusable-out/*.json) into the final
src/data/confusables.ts. Defensive: every highlight mark is verified to be an EXACT substring of
the question's runtime option/stem text (dropped otherwise), and notes are de-dashed.

Usage:  python scripts/merge_confusables.py <scratch_dir> <out_ts_path>
"""
import sys, os, re, json, glob
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

SCRATCH = sys.argv[1]
OUT_TS = sys.argv[2] if len(sys.argv) > 2 else "src/data/confusables.ts"
OUT_DIR = os.path.join(SCRATCH, "confusable-out")
# Optional polished-notes override {id: note} from the notes-polish agent pass.
NOTES_OVERRIDE = {}
if len(sys.argv) > 3 and os.path.exists(sys.argv[3]):
    NOTES_OVERRIDE = {int(k): v for k, v in json.load(open(sys.argv[3], encoding="utf-8")).items()}

questions = json.load(open(os.path.join(SCRATCH, "questions.json"), encoding="utf-8"))
by_id = {q["id"]: q for q in questions}

LETTERS = ("a", "b", "c", "d")


def de_dash(s):
    return (s or "").replace("—", "-").replace("–", "-").replace("  ", " ").strip()


def valid_marks(marks, text):
    """Keep only marks that are non-empty exact substrings of text, deduped, capped."""
    out, seen = [], set()
    for m in marks or []:
        if isinstance(m, str) and m and m in text and m not in seen:
            seen.add(m)
            out.append(m)
    return out[:3]


stats = defaultdict(int)
dropped_marks = 0
kept = {}
notes_in = []  # for the notes-polish agent pass: [{id, note, protect:[verbatim literals]}]
files = sorted(glob.glob(os.path.join(OUT_DIR, "*.json")))
for f in files:
    try:
        data = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        print(f"  WARN  could not parse {os.path.basename(f)}: {e}")
        continue
    for e in data.get("entries", []):
        qid = e.get("id")
        if qid not in by_id:
            print(f"  WARN  {os.path.basename(f)}: id {qid} not a real question, skipped")
            continue
        q = by_id[qid]
        orig_note = de_dash(e.get("note", ""))
        if not orig_note:
            continue
        entry = {"note": de_dash(NOTES_OVERRIDE.get(qid, orig_note))}
        sq = (e.get("searchQuery") or "").strip()
        if sq:
            entry["searchQuery"] = de_dash(sq)
        oh = {}
        raw_oh = e.get("optionHighlights") or {}
        for k in LETTERS:
            before = raw_oh.get(k) or []
            good = valid_marks(before, q["options"].get(k, ""))
            dropped_marks += max(0, len([m for m in before if isinstance(m, str) and m]) - len(good))
            if good:
                oh[k] = good
        if oh:
            entry["optionHighlights"] = oh
        before = e.get("stemHighlights") or []
        sm = valid_marks(before, q["text"])
        dropped_marks += max(0, len([m for m in before if isinstance(m, str) and m]) - len(sm))
        if sm:
            entry["stemHighlights"] = sm
        protect = [m for v in oh.values() for m in v] + sm
        notes_in.append({"id": qid, "note": orig_note, "protect": protect})
        kept[qid] = entry
        stats["entries"] += 1
        if "optionHighlights" in entry:
            stats["with_option_marks"] += 1
        if "stemHighlights" in entry:
            stats["with_stem_marks"] += 1


def ts_str(s):
    return json.dumps(s, ensure_ascii=False)


def ts_arr(xs):
    return "[" + ", ".join(ts_str(x) for x in xs) + "]"


def ts_oh(oh):
    return "{ " + ", ".join(f"{k}: {ts_arr(v)}" for k, v in oh.items() if v) + " }"


out = [
    "// AUTO-GENERATED - confusable-question highlighter data.",
    "// Pipeline: scripts/dump_questions.mjs -> scripts/find_confusables.py (candidates) ->",
    "//           per-submodule agent verification -> scripts/merge_confusables.py (this file).",
    "// Every highlight mark is verified to be an exact substring of the question's runtime text.",
    "",
    "export interface ConfusableInfo {",
    "  /** Short note shown in the highlighter popup (Romanian). */",
    "  note: string;",
    "  /** Free-text query for the 'see similar questions' CTA (/cautare?q=...). */",
    "  searchQuery?: string;",
    "  /** Literal substrings to mark inside an answer option once the answer is revealed, keyed by the",
    "   *  option's own letter. Marks the tiny token distinguishing two near-identical options. */",
    "  optionHighlights?: { a?: string[]; b?: string[]; c?: string[]; d?: string[] };",
    "  /** Literal substrings to mark inside the question stem once revealed (the small diff vs a sibling). */",
    "  stemHighlights?: string[];",
    "}",
    "",
    "export const confusables: Record<number, ConfusableInfo> = {",
]
for qid in sorted(kept):
    e = kept[qid]
    fields = [f"note: {ts_str(e['note'])}"]
    if e.get("searchQuery"):
        fields.append(f"searchQuery: {ts_str(e['searchQuery'])}")
    if e.get("optionHighlights"):
        fields.append(f"optionHighlights: {ts_oh(e['optionHighlights'])}")
    if e.get("stemHighlights"):
        fields.append(f"stemHighlights: {ts_arr(e['stemHighlights'])}")
    out.append(f"  {qid}: {{ {', '.join(fields)} }},")
out.append("};")
open(OUT_TS, "w", encoding="utf-8").write("\n".join(out) + "\n")

# Side output for the notes-polish agent pass (input).
json.dump(notes_in, open(os.path.join(SCRATCH, "notes-in.json"), "w", encoding="utf-8"), ensure_ascii=False)

print(f"merged {len(files)} submodule files")
print(f"override notes applied: {sum(1 for n in notes_in if n['id'] in NOTES_OVERRIDE)}")
print(f"entries: {stats['entries']} | with option marks: {stats['with_option_marks']} | with stem marks: {stats['with_stem_marks']}")
print(f"marks dropped (not exact substrings): {dropped_marks}")
print(f"wrote {OUT_TS}")
