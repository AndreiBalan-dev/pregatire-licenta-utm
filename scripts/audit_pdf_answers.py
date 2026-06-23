# -*- coding: utf-8 -*-
"""
Audit stored quiz answers against the PDF source of truth.

The PDF marks the correct option with RED font (not a "Răspuns:" text marker).
This script:
  1. Parses the PDF: for every question it captures the stem, the four options,
     which option is red (= correct), and the page's true subject (running header).
  2. Parses every src/data/questions/**/*.ts file (id, subjectId, text, options, correctAnswer).
  3. Matches each stored question to its PDF question by stem text (exact-normalized, then fuzzy).
  4. Flags: answer mismatches, PDF-multi-correct questions, cross-subject duplicates,
     and questions whose stored subject differs from the PDF section.

Read-only: prints a report and writes audit-report.md. It does NOT modify data files.
"""
import sys, re, os, glob, unicodedata, difflib
import fitz

sys.stdout.reconfigure(encoding="utf-8")

PDF = "Grile Licenta 2026.pdf"
DATA_GLOB = "src/data/questions"
REPORT = "audit-report.md"

# Subject running-headers as they appear at the top of each PDF page -> canonical subjectId.
HEADER_TO_SUBJECT = [
    ("FUNDAMENTELE PROGRAMĂRII", "fundamentele-programarii"),
    ("FUNDAMENTELE PROGRAMARII", "fundamentele-programarii"),
    ("PROGRAMARE ÎN PYTHON", "programare-python"),
    ("PROGRAMARE IN PYTHON", "programare-python"),
    ("PROGRAMARE ORIENTATĂ PE OBIECTE", "poo-cpp"),
    ("PROGRAMARE ORIENTATA PE OBIECTE", "poo-cpp"),
    ("METODE AVANSATE DE PROGRAMARE", "metode-avansate-java"),
    ("TEHNICI AVANSATE DE PROGRAMARE", "tehnici-avansate"),
    ("ALGORITMI ȘI STRUCTURI DE DATE", "algoritmi-structuri-date"),
    ("ALGORITMI SI STRUCTURI DE DATE", "algoritmi-structuri-date"),
    ("SISTEME DE GESTIUNE A BAZELOR DE DATE", "sgbd"),
    ("SISTEME DE OPERARE", "sgbd"),
    ("BAZE DE DATE", "baze-de-date"),
    ("REȚELE DE CALCULATOARE", "retele-calculatoare"),
    ("RETELE DE CALCULATOARE", "retele-calculatoare"),
    ("ADMINISTRAREA REȚELELOR", "administrarea-retelelor"),
    ("ADMINISTRAREA RETELELOR", "administrarea-retelelor"),
    ("CRIPTOGRAFIE", "criptografie"),
    ("TEHNOLOGII WEB", "tehnologii-web"),
    ("COMERT ELECTRONIC", "comert-electronic"),
    ("COMERȚ ELECTRONIC", "comert-electronic"),
    ("CLOUD COMPUTING", "cloud-computing"),
    ("INOVARE ȘI TRANSFORMARE DIGITALĂ", "inovare-transformare-digitala"),
    ("INOVARE SI TRANSFORMARE DIGITALA", "inovare-transformare-digitala"),
]
# Longest headers first so "SISTEME ... BAZELOR DE DATE" wins over "BAZE DE DATE".
HEADER_TO_SUBJECT.sort(key=lambda kv: -len(kv[0]))


def strip_diac(s):
    s = (s.replace("ş", "s").replace("Ş", "S").replace("ţ", "t").replace("Ţ", "T")
          .replace("ș", "s").replace("Ș", "S").replace("ț", "t").replace("Ț", "T"))
    nf = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nf if not unicodedata.combining(c))


def norm(s):
    s = strip_diac(s).lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


def is_red(color):
    r = (color >> 16) & 255
    g = (color >> 8) & 255
    b = color & 255
    return r > 120 and g < 100 and b < 100


def detect_subject(header_line):
    up = strip_diac(header_line).upper().lstrip()
    for header, sid in HEADER_TO_SUBJECT:
        if up.startswith(strip_diac(header).upper()):
            return sid
    return None


# ---------- 1. Parse the PDF ----------
doc = fitz.open(PDF)
stream = []  # ordered lines across whole doc: (text, red, subject)
current_subject = None
for pno in range(len(doc)):
    page = doc[pno]
    d = page.get_text("dict")
    page_lines = []
    for blk in d["blocks"]:
        for ln in blk.get("lines", []):
            spans = ln["spans"]
            txt = "".join(s["text"] for s in spans).rstrip()
            if not txt.strip():
                continue
            red = any(is_red(s.get("color", 0)) for s in spans if s["text"].strip())
            page_lines.append((txt, red))
    if page_lines:
        sub = detect_subject(page_lines[0][0])
        if sub:
            current_subject = sub
        for txt, red in page_lines:
            stream.append((txt, red, current_subject))

QNUM = re.compile(r"^\s*(\d{1,3})\.\s+(.+)")
OPT = re.compile(r"^\s*([a-dA-D])[.)]\s+(.*)")
HEADER_RE = re.compile(r"^\s*(" + "|".join(re.escape(strip_diac(h).upper()) for h, _ in HEADER_TO_SUBJECT) + r")")

pdf_questions = []
cur = None


def flush(c):
    if c and c["stem"].strip() and len(c["options"]) >= 2:
        pdf_questions.append(c)


for txt, red, sub in stream:
    if HEADER_RE.match(strip_diac(txt).upper()):
        continue  # running header noise
    mo = OPT.match(txt)
    mq = QNUM.match(txt)
    if mq and not mo:
        flush(cur)
        cur = {"num": int(mq.group(1)), "subject": sub, "stem": mq.group(2).strip(),
               "options": [], "_opt": None, "_state": "stem"}
        continue
    if cur is None:
        continue
    if mo:
        cur["_state"] = "opt"
        cur["_opt"] = {"letter": mo.group(1).lower(), "text": mo.group(2).strip(), "red": red}
        cur["options"].append(cur["_opt"])
        continue
    if cur["_state"] == "stem":
        cur["stem"] += " " + txt.strip()
    elif cur["_opt"] is not None:
        cur["_opt"]["text"] += " " + txt.strip()
        if red:
            cur["_opt"]["red"] = True
flush(cur)

# index by normalized stem
pdf_by_stem = {}
for q in pdf_questions:
    pdf_by_stem.setdefault(norm(q["stem"]), []).append(q)

print(f"PDF: parsed {len(pdf_questions)} questions across {len(doc)} pages.")


# ---------- 2. Parse the .ts data ----------
BLOCK = re.compile(r"\{\s*id:\s*(\d+),.*?correctAnswer:\s*\"([a-d])\",\s*\}", re.DOTALL)
data_questions = []
for path in glob.glob(os.path.join(DATA_GLOB, "**", "*.ts"), recursive=True):
    src = open(path, encoding="utf-8").read()
    for m in BLOCK.finditer(src):
        block = m.group(0)
        qid, correct = int(m.group(1)), m.group(2)
        subj = re.search(r'subjectId:\s*"([^"]+)"', block)
        text = re.search(r"text:\s*`(.*?)`,\s*\n\s*code:", block, re.DOTALL)
        codem = re.search(r"code:\s*`((?:\\.|[^`])*)`", block, re.DOTALL)
        opts = {}
        om = re.search(r"options:\s*\{(.*?)\n\s*\},", block, re.DOTALL)
        if om:
            # backtick-delimited value per option; no trailing-newline dependency (last option d has none)
            for L, val in re.findall(r"([a-d]):\s*`((?:\\.|[^`])*)`", om.group(1), re.DOTALL):
                opts[L] = val
        data_questions.append({
            "id": qid, "subject": subj.group(1) if subj else "?",
            "text": text.group(1) if text else "", "code": codem.group(1) if codem else "",
            "options": opts, "correct": correct, "file": os.path.relpath(path),
        })

print(f"DATA: parsed {len(data_questions)} questions from {DATA_GLOB}.")


# ---------- 3. Match + compare ----------
# Pre-normalize once (perf + reuse).
for q in pdf_questions:
    q["nstem"] = norm(q["stem"])  # PDF stem already includes any code lines (between number and options)
    q["nopts"] = [norm(o["text"]) for o in q["options"] if o["text"].strip()]
for dq in data_questions:
    # include code in the stem so sibling questions (identical options, different code) disambiguate
    dq["nstem"] = norm(dq["text"] + " " + dq.get("code", ""))
    dq["nopts"] = {L: norm(t) for L, t in dq["options"].items() if t.strip()}


def opt_overlap(dq, pq):
    """Avg best-match of each data option against the PDF options (0..1). Strong fingerprint."""
    if not dq["nopts"] or not pq["nopts"]:
        return 0.0
    tot = sum(max(ratio(dt, pt) for pt in pq["nopts"]) for dt in dq["nopts"].values())
    return tot / len(dq["nopts"])


def find_pdf(dq):
    """Match by exact stem if unique, else by option-set fingerprint (robust to near-identical stems)."""
    cands = pdf_by_stem.get(dq["nstem"])
    if cands and len(cands) == 1:
        pq = cands[0]
        return pq, ratio(dq["nstem"], pq["nstem"]), opt_overlap(dq, pq)
    best, bestkey, best_st, best_ov = None, -1.0, 0.0, 0.0
    for pq in pdf_questions:
        ov = opt_overlap(dq, pq)
        st = ratio(dq["nstem"], pq["nstem"])
        key = ov * 0.7 + st * 0.3
        if key > bestkey:
            best, bestkey, best_st, best_ov = pq, key, st, ov
    return best, best_st, best_ov


POS = ["a", "b", "c", "d"]
mismatches, multi_correct, unverified, subject_diff, missing_opt, ok = [], [], [], [], [], 0
order_ok_n, order_wrong = 0, []
for dq in data_questions:
    pq, st, ov = find_pdf(dq)
    # Require BOTH a good stem match and a good option-set match before trusting the comparison.
    if pq is None or st < 0.80 or ov < 0.72:
        unverified.append((dq, st, ov))
        continue
    # ORDER check: do stored options a,b,c,d line up with the PDF's option order (by text)?
    if len(pq["options"]) >= 4 and len(dq["nopts"]) >= 4:
        if all(ratio(dq["nopts"].get(POS[i], ""), norm(pq["options"][i]["text"])) > 0.80 for i in range(4)):
            order_ok_n += 1
        else:
            order_wrong.append(dq["id"])
    reds = [o for o in pq["options"] if o["red"]]
    if len(reds) == 0:
        unverified.append((dq, st, ov))
        continue
    if len(reds) > 1:
        multi_correct.append((dq, pq, [o["text"] for o in reds]))
        continue
    red_text = norm(reds[0]["text"])
    scored = sorted(((ratio(dq["nopts"].get(L, ""), red_text), L) for L in dq["nopts"]), reverse=True)
    if not scored:
        unverified.append((dq, st, ov))
        continue
    best_score, best_letter = scored[0]
    second = scored[1][0] if len(scored) > 1 else 0.0
    if best_score < 0.78:
        # The PDF's correct-answer text isn't clearly present among the data options (lost/garbled option).
        missing_opt.append((dq, pq, reds[0]["text"], best_score))
        continue
    if best_score - second < 0.08:
        # Two data options are near-equally close to the red text: can't trust which letter -> skip.
        unverified.append((dq, st, ov))
        continue
    if best_letter != dq["correct"]:
        mismatches.append((dq, pq, best_letter, reds[0]["text"], best_score))
    else:
        ok += 1
    if pq["subject"] and pq["subject"] != dq["subject"]:
        subject_diff.append((dq, pq["subject"]))

# ---------- 4. Cross-subject duplicates in the DATA ----------
def opts_match(a, b):
    av, bv = list(a["nopts"].values()), list(b["nopts"].values())
    if not av or not bv:
        return False
    tot = sum(max((ratio(x, y) for y in bv), default=0.0) for x in av)
    return tot / len(av) > 0.75


by_stem = {}
for dq in data_questions:
    key = dq["nstem"]
    if len(key) < 25:  # skip empty / trivial stems (code-only questions, generic fragments)
        continue
    by_stem.setdefault(key, []).append(dq)
dupes = []
for key, group in by_stem.items():
    subs = {d["subject"] for d in group}
    # true duplicate = same stem in >1 subject AND the options also match
    # (excludes the generic "care sunt adevarate?" stem that recurs with different options)
    if len(group) > 1 and len(subs) > 1 and all(opts_match(group[0], b) for b in group[1:]):
        pq = pdf_by_stem.get(key, [None])[0]
        dupes.append((group, pq["subject"] if pq else "?"))


# ---------- Report ----------
def short(s, n=90):
    s = " ".join(s.split())
    return s if len(s) <= n else s[:n] + "..."


lines = []
w = lines.append
w("# PDF answer audit\n")
w(f"- PDF questions parsed: **{len(pdf_questions)}**")
w(f"- Data questions parsed: **{len(data_questions)}**")
w(f"- Verified consistent with PDF red answer: **{ok}**")
w(f"- **Answer mismatches (high confidence): {len(mismatches)}**")
w(f"- Correct-answer text missing/garbled in data: **{len(missing_opt)}**")
w(f"- PDF marks multiple correct (data holds one): **{len(multi_correct)}**")
w(f"- Cross-subject duplicate questions: **{len(dupes)}**")
w(f"- Could not verify (stem/options not matched, or no red detected): **{len(unverified)}**\n")

w("## Answer mismatches (stored answer != PDF red answer)\n")
if not mismatches:
    w("_None._\n")
for dq, pq, should, redtext, conf in sorted(mismatches, key=lambda x: (x[0]["subject"], x[0]["id"])):
    w(f"- **id {dq['id']}** ({dq['subject']}) stored `{dq['correct']}`, PDF red => should be `{should}`  ")
    w(f"  - Q: {short(dq['text'], 80)}  ")
    w(f"  - PDF correct text: {short(redtext, 80)}  ")
    w(f"  - file: {dq['file']}\n")

w("## Correct-answer text missing or garbled in data\n")
w("_PDF's red answer text does not clearly match any stored option (likely lost/garbled during extraction)._\n")
if not missing_opt:
    w("_None._\n")
for dq, pq, redtext, sc in sorted(missing_opt, key=lambda x: (x[0]["subject"], x[0]["id"])):
    w(f"- **id {dq['id']}** ({dq['subject']}) stored `{dq['correct']}`, best option match only {sc:.2f}  ")
    w(f"  - Q: {short(dq['text'], 80)}  ")
    w(f"  - PDF correct text: {short(redtext, 80)}  ")
    w(f"  - file: {dq['file']}\n")

w("## Cross-subject duplicates (same question in >1 subject)\n")
if not dupes:
    w("_None._\n")
for group, pdf_sub in sorted(dupes, key=lambda x: x[0][0]["text"]):
    w(f"- Q: {short(group[0]['text'], 80)} — PDF section: **{pdf_sub}**  ")
    for d in group:
        flag = "  <-- matches PDF section" if d["subject"] == pdf_sub else ""
        w(f"  - id {d['id']} in `{d['subject']}` (stored correct `{d['correct']}`){flag}  ")
    w("")

w("## PDF marks MULTIPLE correct answers (single-answer model is lossy)\n")
if not multi_correct:
    w("_None._\n")
for dq, pq, reds in sorted(multi_correct, key=lambda x: x[0]["id"])[:60]:
    w(f"- id {dq['id']} ({dq['subject']}): {short(dq['text'],70)} — PDF reds: {len(reds)}  ")

w(f"\n## Unverified ({len(unverified)})\n")
w("_Stem not confidently matched to the PDF, or no red span detected on its page._")
w("These are not necessarily wrong; they just could not be auto-checked.\n")

open(REPORT, "w", encoding="utf-8").write("\n".join(lines))

# optional detailed dump: python audit_pdf_answers.py 269 323 258 353
debug_ids = {int(a) for a in sys.argv[1:] if a.isdigit()}
if debug_ids:
    dmap = {d["id"]: d for d in data_questions}
    for qid in debug_ids:
        dq = dmap.get(qid)
        print("\n" + "#" * 70)
        if not dq:
            print(f"id {qid}: not found in data")
            continue
        pq, score, ovr = find_pdf(dq)
        print(f"id {qid} ({dq['subject']}) stem={score:.2f} option-overlap={ovr:.2f}")
        print(f"  DATA stem: {short(dq['text'],110)}")
        for L in "abcd":
            mark = " <== stored correct" if L == dq["correct"] else ""
            print(f"    {L}) {short(dq['options'].get(L,''),95)}{mark}")
        if pq:
            print(f"  PDF  stem: {short(pq['stem'],110)}  [section={pq['subject']}]")
            for o in pq["options"]:
                mark = " <== RED (pdf correct)" if o["red"] else ""
                print(f"    {o['letter']}) {short(o['text'],95)}{mark}")
    print()

# console summary
print("\n" + "=" * 70)
print(f"  mismatches (high conf): {len(mismatches)}")
print(f"  ORDER ok (matches PDF): {order_ok_n}")
print(f"  ORDER wrong (matched):  {len(order_wrong)} {sorted(order_wrong)[:40]}")
print(f"  missing/garbled option: {len(missing_opt)}")
print(f"  duplicates:             {len(dupes)}")
print(f"  multi-correct PDF:      {len(multi_correct)}")
print(f"  unverified:             {len(unverified)}")
print(f"  verified OK:            {ok}")
print("=" * 70)
print(f"Full report written to {REPORT}\n")

# sanity-check the known constrangeri case
print("Sanity check — 'constrangeri' question:")
for dq in data_questions:
    if "despre constrangeri" in norm(dq["text"]):
        verdict = next((f"MISMATCH should be {s}" for d, p, s, rt, c in mismatches if d["id"] == dq["id"]), "OK / not flagged")
        print(f"  id {dq['id']} ({dq['subject']}) stored '{dq['correct']}' -> {verdict}")
