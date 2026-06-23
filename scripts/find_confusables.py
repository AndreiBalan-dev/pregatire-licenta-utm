# -*- coding: utf-8 -*-
"""
Detect 'confusable' questions: near-identical questions within a subject that differ only in small
ways (one operator in code, a swapped word, a different constant), AND answer options that differ
by a tiny token (e.g. `< ` vs `> `). These are the trap pairs students mix up.

Outputs confusables-report.md (human review) + confusables.json (id -> list of {relatedId, kind, note}).
Read-only analysis of the question data.
"""
import sys, re, json, glob, os, unicodedata, difflib
sys.stdout.reconfigure(encoding="utf-8")

ID_RE = re.compile(r"\r?\n  \{\r?\n    id:\s*(\d+),")
TEXT_RE = re.compile(r"text:\s*(?:`(.*?)`|\"((?:\\.|[^\"])*)\")\s*,\s*\r?\n\s*code:", re.DOTALL)
CODE_RE = re.compile(r"code:\s*(?:`((?:\\.|[^`])*)`|\"((?:\\.|[^\"])*)\"|undefined)", re.DOTALL)
OPT_RE = re.compile(r'([abcd]):\s*(?:`((?:\\.|[^`])*)`|"((?:\\.|[^"])*)")')


def grab(m, *groups):
    for g in groups:
        if m and m.group(g) is not None:
            return m.group(g)
    return ""


def norm(s):
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s


questions = []
for path in glob.glob("src/data/questions/**/*.ts", recursive=True):
    raw = open(path, "rb").read().decode("utf-8").replace("\r\n", "\n")
    subj = re.search(r'subjectId:\s*"([^"]+)"', raw).group(1)
    marks = [(m.start(), int(m.group(1))) for m in ID_RE.finditer(raw)]
    for i, (pos, qid) in enumerate(marks):
        blk = raw[pos: marks[i + 1][0] if i + 1 < len(marks) else len(raw)]
        text = grab(TEXT_RE.search(blk), 1, 2)
        code = grab(CODE_RE.search(blk), 1, 2)
        om = re.search(r"options:\s*\{(.*?)\n\s*\},", blk, re.DOTALL)
        opts = {}
        if om:
            for mm in OPT_RE.finditer(om.group(1)):
                opts[mm.group(1)] = mm.group(2) if mm.group(2) is not None else mm.group(3)
        cm = re.search(r'correctAnswer:\s*"([a-d])"', blk)
        questions.append({"id": qid, "subject": subj, "text": text, "code": code,
                          "opts": opts, "correct": cm.group(1) if cm else "?",
                          "sig": norm(text + " " + code)})


def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


def short_diff(x, y, n=70):
    """Return a tiny human note of how x differs from y (first differing run)."""
    sm = difflib.SequenceMatcher(None, x, y)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "equal":
            a = x[max(0, i1 - 12):i2 + 12]
            b = y[max(0, j1 - 12):j2 + 12]
            return f"...{a.strip()}...  vs  ...{b.strip()}..."
    return ""


# group by subject, compare pairs
from collections import defaultdict
bysub = defaultdict(list)
for q in questions:
    bysub[q["subject"]].append(q)

confus = defaultdict(list)
pairs = []
for subj, qs in bysub.items():
    for i in range(len(qs)):
        for j in range(i + 1, len(qs)):
            a, b = qs[i], qs[j]
            if not a["sig"] or len(a["sig"]) < 15:
                continue
            sim = ratio(a["sig"], b["sig"])
            if sim < 0.86 or a["sig"] == b["sig"] and a["opts"] == b["opts"]:
                continue
            # they are near-identical in stem/code. classify the difference.
            stem_sim = sim
            optset_a = sorted(norm(v) for v in a["opts"].values())
            optset_b = sorted(norm(v) for v in b["opts"].values())
            same_opts = optset_a == optset_b
            kind = "stem/code" if not same_opts or a["code"] != b["code"] else "options"
            if a["code"] and b["code"] and a["code"] != b["code"]:
                note = "cod aproape identic: " + short_diff(a["code"], b["code"])
            elif a["text"] != b["text"]:
                note = "enunt aproape identic: " + short_diff(a["text"], b["text"])
            else:
                note = "variante de raspuns aproape identice"
            pairs.append((subj, a["id"], b["id"], round(sim, 3), kind, note))
            confus[a["id"]].append({"relatedId": b["id"], "kind": kind, "note": note})
            confus[b["id"]].append({"relatedId": a["id"], "kind": kind, "note": note})

# also: answer options within ONE question that differ by a tiny token (e.g. < vs >)
near_opt_qs = []
for q in questions:
    vals = list(q["opts"].items())
    for i in range(len(vals)):
        for j in range(i + 1, len(vals)):
            (la, va), (lb, vb) = vals[i], vals[j]
            if va and vb and va != vb and ratio(va, vb) > 0.91 and abs(len(va) - len(vb)) <= 3 and min(len(va), len(vb)) >= 6:
                near_opt_qs.append((q["subject"], q["id"], la, lb, short_diff(va, vb)))
                break
        else:
            continue
        break

out = ["# Confusable questions (near-identical, small differences)\n",
       f"- near-identical question pairs (same subject): {len(pairs)}",
       f"- questions with two near-identical answer options: {len(near_opt_qs)}\n",
       "## Near-identical question pairs\n"]
for subj, a, b, sim, kind, note in sorted(pairs, key=lambda x: (x[0], -x[3])):
    out.append(f"- [{subj}] ids {a} & {b}  sim={sim} ({kind})")
    out.append(f"    {note}")
out.append("\n## Questions with two near-identical answer options (e.g. < vs >)\n")
for subj, qid, la, lb, d in sorted(near_opt_qs):
    out.append(f"- [{subj}] id {qid}: options {la}/{lb} nearly identical -> {d}")
open("confusables-report.md", "w", encoding="utf-8").write("\n".join(out))
json.dump({str(k): v for k, v in confus.items()}, open("confusables.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)

print(f"near-identical question pairs: {len(pairs)}")
print(f"questions with near-identical answer options: {len(near_opt_qs)}")
print(f"distinct questions flagged confusable (paired): {len(confus)}")
print("wrote confusables-report.md + confusables.json")

# ------------------------------------------------------------------ emit src/data/confusables.ts
qById = {q["id"]: q for q in questions}
opt_trap = {}  # id -> short diff between its two near-identical options
for subj, qid, la, lb, d in near_opt_qs:
    opt_trap.setdefault(qid, d)


def clean_snip(s, n=46):
    s = " ".join(s.split())
    return s[:n].strip()


def best_sibling(qid):
    # the highest-similarity sibling (for the note's specific diff)
    sibs = confus.get(qid, [])
    if not sibs:
        return None
    return sibs[0]


info = {}
for qid in sorted(set(confus) | set(opt_trap)):
    q = qById[qid]
    parts, search_q = [], None
    if qid in confus:
        if q["code"]:
            parts.append("Cod aproape identic cu alte întrebări. Atenţie la diferenţa mică din cod (un operator, o condiţie sau o valoare schimbată).")
        else:
            parts.append("Enunţ aproape identic cu alte întrebări. Verifică exact ce se cere (deseori diferă un singur cuvânt: min/max, prima/ultima, preordine/inordine/postordine).")
        base = (q["text"] or q["code"] or "").strip()
        search_q = clean_snip(base.split("\n")[0] if base else "", 42)
    if qid in opt_trap:
        parts.append("Două variante de răspuns sunt aproape identice şi diferă printr-un detaliu mic (de ex. un operator < / >, un semn sau o cifră). Compară-le cu atenţie înainte să alegi.")
    note = " ".join(parts)
    info[qid] = {"note": note, "search": search_q}


def ts_str(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


out_ts = [
    "// AUTO-GENERATED by scripts/find_confusables.py - do not edit by hand.",
    "// Maps a question id to a short 'confusable question' note for the highlighter feature.",
    "// A question is listed when it is near-identical to another (same subject) or has two",
    "// near-identical answer options that differ by a tiny token (e.g. < vs >).",
    "",
    "export interface ConfusableInfo {",
    "  /** Short note shown in the highlighter popup (Romanian). */",
    "  note: string;",
    "  /** Free-text query for the 'see similar questions' CTA (/cautare?q=...). Omitted when there is no useful sibling to compare. */",
    "  searchQuery?: string;",
    "}",
    "",
    "export const confusables: Record<number, ConfusableInfo> = {",
]
for qid in sorted(info):
    n = info[qid]
    if n["search"]:
        out_ts.append(f'  {qid}: {{ note: {ts_str(n["note"])}, searchQuery: {ts_str(n["search"])} }},')
    else:
        out_ts.append(f'  {qid}: {{ note: {ts_str(n["note"])} }},')
out_ts.append("};")
open("src/data/confusables.ts", "w", encoding="utf-8").write("\n".join(out_ts) + "\n")
print(f"wrote src/data/confusables.ts with {len(info)} entries")
