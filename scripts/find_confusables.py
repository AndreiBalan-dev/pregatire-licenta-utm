# -*- coding: utf-8 -*-
"""
Detect 'confusable' questions and compute WHAT to highlight, for the highlighter feature.

Two kinds of trap:
  - option-trap : the correct answer is near-identical to a wrong answer; we mark the tiny
                  differing token inside BOTH (e.g. `<` vs `>`), shown only after the answer is revealed.
  - stem-pair   : two questions in the same subject have near-identical stems (prose) that differ
                  by a small bit (a word/number); we mark that bit inside the stem text.

Input is the RUNTIME question dump (scratch/questions.json from scripts/dump_questions.mjs) so the
marks are exact substrings of what the app renders - including the one double-quoted file.

Outputs:
  - src/data/confusables.ts        (the data the app imports: id -> ConfusableInfo)
  - <scratch>/confusable-candidates/<subject>.json  (per-submodule packets for the agent verification pass)
  - <scratch>/confusables-report.md (human glance)

Usage:  python scripts/find_confusables.py <scratch_dir>
"""
import sys, os, re, json, difflib
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

SCRATCH = sys.argv[1] if len(sys.argv) > 1 else "."
QPATH = os.path.join(SCRATCH, "questions.json")
CAND_DIR = os.path.join(SCRATCH, "confusable-candidates")
os.makedirs(CAND_DIR, exist_ok=True)

questions = json.load(open(QPATH, encoding="utf-8"))
by_id = {q["id"]: q for q in questions}

SUBJECT_NAMES = {
    "fundamentele-programarii": "Fundamentele Programării",
    "programare-python": "Programare în Python",
    "poo-cpp": "Programare Orientată pe Obiecte (C++)",
    "metode-avansate-java": "Metode Avansate de Programare (Java)",
    "tehnici-avansate": "Tehnici Avansate de Programare",
    "algoritmi-structuri-date": "Algoritmi și Structuri de Date",
    "baze-de-date": "Baze de Date",
    "sgbd": "Sisteme de Gestiune a Bazelor de Date",
    "sisteme-de-operare": "Sisteme de Operare",
    "retele-calculatoare": "Rețele de Calculatoare",
    "criptografie": "Criptografie",
    "tehnologii-web": "Tehnologii Web",
    "comert-electronic": "Comerț Electronic",
    "cloud-computing": "Cloud Computing",
    "inovare-transformare-digitala": "Inovare și Transformare Digitală",
}


def norm(s):
    return re.sub(r"\s+", " ", (s or "")).strip().lower()


def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


def diff_runs(a, b):
    """Differing character runs of a vs b. Returns (runs_in_a, runs_in_b, changed_a, changed_b)."""
    sm = difflib.SequenceMatcher(None, a, b)
    ra, rb, ca, cb = [], [], 0, 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        if i2 > i1:
            ra.append((i1, i2)); ca += i2 - i1
        if j2 > j1:
            rb.append((j1, j2)); cb += j2 - j1
    return ra, rb, ca, cb


def runs_to_marks(s, runs, ctx=4, maxlen=44, cap=3):
    """Turn differing runs into a few literal, exact-substring marks (run + small context)."""
    marks = []
    for (i1, i2) in runs:
        lo, hi = max(0, i1 - ctx), min(len(s), i2 + ctx)
        snippet = s[lo:hi].strip()
        if not snippet or len(snippet) > maxlen or "\n" in snippet or "\r" in snippet:
            snippet = s[i1:i2].strip()
        if snippet and len(snippet) <= maxlen and "\n" not in snippet and "\r" not in snippet and snippet in s:
            marks.append(snippet)
    out, seen = [], set()
    for m in marks:
        if m not in seen:
            seen.add(m); out.append(m)
    return out[:cap]


def clean_snip(s, n=46):
    return " ".join((s or "").split())[:n].strip()


# ----------------------------------------------------------------- option-traps
def best_decoy(q):
    """The wrong option most similar to the correct one: (key, ratio, text)."""
    correct = q["correctAnswer"]
    ct = q["options"].get(correct, "")
    best = None
    for k in "abcd":
        if k == correct:
            continue
        ot = q["options"].get(k, "")
        if not ot or not ct:
            continue
        r = ratio(ct, ot)
        if best is None or r > best[1]:
            best = (k, r, ot)
    return best


option_traps = {}  # id -> {decoyKey, ratio, optionHighlights}
for q in questions:
    correct = q["correctAnswer"]
    ct = q["options"].get(correct, "")
    bd = best_decoy(q)
    if not ct or not bd:
        continue
    dk, r, dt = bd
    if ct == dt:
        continue
    ra, rb, ca, cb = diff_runs(ct, dt)
    small = (ca + cb) <= max(12, int(0.25 * min(len(ct), len(dt))))
    if r >= 0.84 and small and min(len(ct), len(dt)) >= 8:
        ch = {}
        cm = runs_to_marks(ct, ra)
        dm = runs_to_marks(dt, rb)
        if cm:
            ch[correct] = cm
        if dm:
            ch[dk] = dm
        if ch:
            option_traps[q["id"]] = {"decoyKey": dk, "ratio": round(r, 3), "optionHighlights": ch}


# ----------------------------------------------------------------- stem pairs
bysub = defaultdict(list)
for q in questions:
    bysub[q["subjectId"]].append(q)

stem_sibs = defaultdict(list)   # id -> list of sibling ids
stem_marks = defaultdict(list)  # id -> marks in its stem text
pair_rows = []
for subj, qs in bysub.items():
    for i in range(len(qs)):
        for j in range(i + 1, len(qs)):
            a, b = qs[i], qs[j]
            sa = norm(a["text"] + " " + a["code"])
            sb = norm(b["text"] + " " + b["code"])
            if len(sa) < 15 or len(sb) < 15:
                continue
            sim = ratio(sa, sb)
            if sim < 0.86:
                continue
            if sa == sb and a["options"] == b["options"]:
                continue
            stem_sibs[a["id"]].append(b["id"])
            stem_sibs[b["id"]].append(a["id"])
            # mark the differing bit inside the prose stem (only when the prose itself differs)
            if a["text"] and b["text"] and a["text"] != b["text"]:
                ra, rb, ca, cb = diff_runs(a["text"], b["text"])
                if ca <= 60:
                    stem_marks[a["id"]] += runs_to_marks(a["text"], ra)
                if cb <= 60:
                    stem_marks[b["id"]] += runs_to_marks(b["text"], rb)
            pair_rows.append((subj, a["id"], b["id"], round(sim, 3)))


def dedupe(xs):
    out, seen = [], set()
    for x in xs:
        if x not in seen:
            seen.add(x); out.append(x)
    return out


# ----------------------------------------------------------------- build info per id
info = {}
ids = sorted(set(option_traps) | set(stem_sibs))
for qid in ids:
    q = by_id[qid]
    parts = []
    entry = {}
    if qid in stem_sibs:
        if q["code"]:
            parts.append("Cod aproape identic cu altă întrebare. Atenţie la diferenţa mică din cod (un operator, o condiţie sau o valoare schimbată).")
        else:
            parts.append("Enunţ aproape identic cu altă întrebare. Verifică exact ce se cere (deseori diferă un singur cuvânt).")
        base = (q["text"] or q["code"] or "").strip().split("\n")[0]
        entry["searchQuery"] = clean_snip(base, 42)
        sm = dedupe(stem_marks.get(qid, []))
        if sm:
            entry["stemHighlights"] = sm[:3]
    if qid in option_traps:
        parts.append("Două variante de răspuns sunt aproape identice şi diferă printr-un detaliu mic (de ex. un operator < / >, un semn sau o cifră). După ce răspunzi, diferenţa e marcată ca să o reţii.")
        entry["optionHighlights"] = option_traps[qid]["optionHighlights"]
    entry["note"] = " ".join(parts)
    info[qid] = entry


# ----------------------------------------------------------------- emit per-subject candidate packets
for subj, qs in bysub.items():
    cand = []
    for q in qs:
        if q["id"] in info:
            c = {"id": q["id"], "type": ("both" if (q["id"] in option_traps and q["id"] in stem_sibs)
                                          else "option-trap" if q["id"] in option_traps else "stem-pair")}
            if q["id"] in option_traps:
                c["decoyKey"] = option_traps[q["id"]]["decoyKey"]
            if q["id"] in stem_sibs:
                c["relatedIds"] = dedupe(stem_sibs[q["id"]])
            c.update({k: v for k, v in info[q["id"]].items()})
            cand.append(c)
    packet = {
        "subject": subj,
        "subjectName": SUBJECT_NAMES.get(subj, subj),
        "questions": [
            {"id": q["id"], "text": q["text"], "code": q["code"], "codeLanguage": q["codeLanguage"],
             "options": q["options"], "correctAnswer": q["correctAnswer"], "explanation": q["explanation"]}
            for q in qs
        ],
        "candidates": cand,
    }
    json.dump(packet, open(os.path.join(CAND_DIR, f"{subj}.json"), "w", encoding="utf-8"),
              ensure_ascii=False)


# ----------------------------------------------------------------- emit src/data/confusables.ts
def ts_str(s):
    # json.dumps yields a valid double-quoted string literal (escapes ", \, newlines, control
    # chars) that TypeScript accepts verbatim; ensure_ascii=False keeps diacritics readable.
    return json.dumps(s, ensure_ascii=False)


def ts_arr(xs):
    return "[" + ", ".join(ts_str(x) for x in xs) + "]"


def ts_opt_highlights(oh):
    inner = ", ".join(f"{k}: {ts_arr(v)}" for k, v in oh.items() if v)
    return "{ " + inner + " }"


out = [
    "// AUTO-GENERATED by scripts/find_confusables.py - do not edit by hand.",
    "// Rebuild: node --import ./scripts/register-alias.mjs scripts/dump_questions.mjs <scratch>/questions.json",
    "//          then python scripts/find_confusables.py <scratch>",
    "// Maps a question id to its 'confusable question' highlighter data.",
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
for qid in sorted(info):
    e = info[qid]
    fields = [f"note: {ts_str(e['note'])}"]
    if e.get("searchQuery"):
        fields.append(f"searchQuery: {ts_str(e['searchQuery'])}")
    if e.get("optionHighlights"):
        fields.append(f"optionHighlights: {ts_opt_highlights(e['optionHighlights'])}")
    if e.get("stemHighlights"):
        fields.append(f"stemHighlights: {ts_arr(e['stemHighlights'])}")
    out.append(f"  {qid}: {{ {', '.join(fields)} }},")
out.append("};")
open("src/data/confusables.ts", "w", encoding="utf-8").write("\n".join(out) + "\n")

# ----------------------------------------------------------------- report
rep = ["# Confusable questions\n",
       f"- option-traps (correct vs near-identical wrong option): {len(option_traps)}",
       f"- questions with near-identical sibling stems: {len(stem_sibs)}",
       f"- distinct questions flagged: {len(info)}\n"]
for subj in sorted(bysub):
    n = sum(1 for q in bysub[subj] if q["id"] in info)
    rep.append(f"- {subj}: {n} flagged")
open(os.path.join(SCRATCH, "confusables-report.md"), "w", encoding="utf-8").write("\n".join(rep))

print(f"option-traps: {len(option_traps)}")
print(f"stem-sibling questions: {len(stem_sibs)}")
print(f"distinct flagged: {len(info)}")
print(f"wrote src/data/confusables.ts ({len(info)} entries)")
print(f"wrote {len(bysub)} per-subject candidate packets to {CAND_DIR}")
