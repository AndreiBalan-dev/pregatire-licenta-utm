# -*- coding: utf-8 -*-
"""
Reorder stored answer options into the PDF's original order (un-do the build-time shuffle).

Source of PDF order: reproduce extract_questions.py's own parser (same cleaning that produced the
data), capturing the PRE-shuffle option order. Each stored question is matched to its parsed
counterpart by option-set + stem; the permutation is applied to options + correctAnswer, and the
coupled explanation's structured "Corect:"/bullet lines are remapped (faithful port of the app's
remapExplanationForOrder). Prose letter mentions are left for manual fixing and reported.

HARD GATES (a question is skipped, left untouched, and reported if any fail):
  - clean 4-way bijection between stored and parsed option texts
  - the option-TEXT set is preserved (only letters move)
  - the correct answer keeps pointing at the SAME text

Dry-run by default (writes reorder-plan.md, changes nothing). Pass --apply to write files.
Files are CRLF; rewrites preserve newlines and every other field byte-for-byte.
"""
import sys, re, os, glob, json, random, unicodedata, difflib
import fitz

sys.stdout.reconfigure(encoding="utf-8")
APPLY = "--apply" in sys.argv
POSITION = ["a", "b", "c", "d"]

# ============================ extract_questions.py parser (faithful) ============================
doc = fitz.open("Grile Licenta 2026.pdf")
pages_text = [doc[i].get_text() for i in range(len(doc))]

subject_map = {
    "FUNDAMENTELE PROGRAMĂRII": ("fundamentele-programarii", "programming"),
    "FUNDAMENTELE PROGRAMARII": ("fundamentele-programarii", "programming"),
    "PROGRAMARE ÎN PYTHON": ("programare-python", "programming"),
    "PROGRAMARE IN PYTHON": ("programare-python", "programming"),
    "PROGRAMARE ORIENTATĂ PE OBIECTE": ("poo-cpp", "programming"),
    "PROGRAMARE ORIENTATA PE OBIECTE": ("poo-cpp", "programming"),
    "METODE AVANSATE DE PROGRAMARE": ("metode-avansate-java", "programming"),
    "TEHNICI AVANSATE DE PROGRAMARE": ("tehnici-avansate", "programming"),
    "ALGORITMI ȘI STRUCTURI DE DATE": ("algoritmi-structuri-date", "programming"),
    "ALGORITMI SI STRUCTURI DE DATE": ("algoritmi-structuri-date", "programming"),
    "BAZE DE DATE": ("baze-de-date", "databases"),
    "SISTEME DE GESTIUNE A BAZELOR DE DATE": ("sgbd", "databases"),
    "SISTEME DE OPERARE": ("sgbd", "databases"),
    "REȚELE DE CALCULATOARE": ("retele-calculatoare", "networks"),
    "RETELE DE CALCULATOARE": ("retele-calculatoare", "networks"),
    "ADMINISTRAREA REȚELELOR": ("administrarea-retelelor", "networks"),
    "ADMINISTRAREA RETELELOR": ("administrarea-retelelor", "networks"),
    "CRIPTOGRAFIE": ("criptografie", "networks"),
    "TEHNOLOGII WEB": ("tehnologii-web", "web"),
    "COMERT ELECTRONIC": ("comert-electronic", "web"),
    "COMERȚ ELECTRONIC": ("comert-electronic", "web"),
    "CLOUD COMPUTING": ("cloud-computing", "web"),
    "INOVARE ȘI TRANSFORMARE DIGITALĂ": ("inovare-transformare-digitala", "web"),
    "INOVARE SI TRANSFORMARE DIGITALA": ("inovare-transformare-digitala", "web"),
}


def detect_subject(page_text):
    first_lines = page_text[:300].upper()
    for header, info in subject_map.items():
        if header.upper() in first_lines:
            return info
    return None


subject_texts = {}
for i, text in enumerate(pages_text):
    info = detect_subject(text)
    if info:
        sid, mid = info
        subject_texts.setdefault(sid, {"text": "", "moduleId": mid})
        subject_texts[sid]["text"] += text + "\n"


def parse_questions(text, subject_id):
    """Faithful copy of extract_questions.py parse_questions, returning PRE-shuffle PDF order."""
    questions = []
    for header in subject_map:
        text = text.replace(header, "").replace(header.lower(), "")
    parts = re.split(r'\n\s*(\d+)\.\s+', text)
    i = 1
    while i < len(parts) - 1:
        q_num_str, q_body = parts[i], parts[i + 1]
        i += 2
        try:
            q_num = int(q_num_str)
        except ValueError:
            continue
        if q_num < 1 or q_num > 100:
            continue
        opt_match = None
        opt_start_pos = -1
        patterns = [
            (r'\n\s*a\)\s*(.*?)\n\s*b\)\s*(.*?)\n\s*c\)\s*(.*?)\n\s*d\)\s*(.*?)(?:\n\s*(?:Răspuns|$|\d+\.))', r'\na\)'),
            (r'\n?\s*a\)\s*(.*?)\s*\n\s*b\)\s*(.*?)\s*\n\s*c\)\s*(.*?)\s*\n\s*d\)\s*(.*?)$', r'a\)'),
            (r'\n\s*a\.\s*(.*?)\n\s*b\.\s*(.*?)\n\s*c\.\s*(.*?)\n\s*d\.\s*(.*?)(?:\n\s*(?:Răspuns|$|\d+\.))', r'\na\.'),
            (r'\n?\s*a\.\s*(.*?)\s*\n\s*b\.\s*(.*?)\s*\n\s*c\.\s*(.*?)\s*\n\s*d\.\s*(.*?)$', r'a\.'),
        ]
        for pattern, start_pattern in patterns:
            opt_match = re.search(pattern, q_body, re.DOTALL)
            if opt_match:
                m = re.search(r'\n\s*' + start_pattern, q_body)
                opt_start_pos = m.start() if m else (re.search(start_pattern, q_body).start() if re.search(start_pattern, q_body) else -1)
                break
        if not opt_match or opt_start_pos == -1:
            continue
        question_text = q_body[:opt_start_pos].strip()
        opts = [opt_match.group(k).strip() for k in range(1, 5)]

        def clean_option(o):
            o = re.sub(r'\n\s*\d{1,2}\s*$', '', o)
            o = re.sub(r'\n\s*Răspuns.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\n\s*Explicație.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\n\s*(\d{1,2})\s*\n', '\n', o)
            o = re.sub(r'([;{})\]]) \d{1,2} ([a-zA-Z{(])', r'\1 \2', o)
            o = re.sub(r';\s+\d{1,2}\s+}', '; }', o)
            o = re.sub(r'\s*/\s*DE CALCULATOARE', '', o, flags=re.IGNORECASE)
            o = re.sub(r'\s*/\s*PROGRAMĂRII', '', o, flags=re.IGNORECASE)
            o = re.sub(r'\s*/\s*PROGRAMARII', '', o, flags=re.IGNORECASE)
            for header in subject_map:
                o = o.replace(header, '').replace(header.upper(), '')
            o = re.sub(r'\s*Ce valori.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*Indicați ce se va.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*În care dintre.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*Ce operaţii.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*Ce operații.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'^[a-d]\)\s+', '', o)
            if len(o) < 200:
                o = ' '.join(o.split())
            return o.strip()

        opts = [clean_option(o) for o in opts]
        if not question_text or not opts[0] or not opts[1]:
            continue
        question_text = re.sub(r'\n{3,}', '\n\n', question_text).strip()
        question_text = re.sub(r'^\d{1,2}\s*\n', '', question_text)
        question_text = re.sub(r'\n\s*\d{1,2}\s*\n', '\n', question_text)
        questions.append({"num": q_num, "subject": subject_id, "stem": question_text, "pdf": opts})
    return questions


parsed = []
for sid, data in subject_texts.items():
    seen = set()
    for q in parse_questions(data["text"], sid):
        if q["num"] in seen:
            continue
        seen.add(q["num"])
        parsed.append(q)

# ============================ normalization ============================
def strip_diac(s):
    s = (s.replace("ş", "s").replace("Ş", "S").replace("ţ", "t").replace("Ţ", "T")
          .replace("ș", "s").replace("Ș", "S").replace("ț", "t").replace("Ț", "T"))
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def nstem(s):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", strip_diac(s).lower())).strip()


def nopt(s):
    return re.sub(r"\s+", " ", strip_diac(s).lower()).strip()


def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


for q in parsed:
    q["nstem"] = nstem(q["stem"])
    q["npdf"] = [nopt(o) for o in q["pdf"]]

# indexes for fast candidate lookup (avoid O(n*m) all-pairs)
from collections import defaultdict
parsed_by_stem = defaultdict(list)
prefix_index = defaultdict(set)
for pi, p in enumerate(parsed):
    if len(p["npdf"]) < 4:
        continue
    if len(p["nstem"]) >= 12:
        parsed_by_stem[p["nstem"]].append(pi)
    for o in p["npdf"]:
        if len(o) >= 4:
            prefix_index[o[:8]].add(pi)

# ============================ load stored data (with spans + raw vals) ============================
OPT_BLOCK_RE = re.compile(
    r"options:\s*\{\s*a:\s*`((?:\\.|[^`])*)`,\s*b:\s*`((?:\\.|[^`])*)`,"
    r"\s*c:\s*`((?:\\.|[^`])*)`,\s*d:\s*`((?:\\.|[^`])*)`,\s*\}", re.DOTALL)
QBLOCK_RE = re.compile(r"\{\r?\n\s+id:\s*(\d+),.*?\r?\n  \},", re.DOTALL)

stored = []  # {id, subject, file, block(text), block_start, opt_m(match), correct, correct_m, raw[4]}
file_text = {}
for path in glob.glob("src/data/questions/**/*.ts", recursive=True):
    raw = open(path, "rb").read().decode("utf-8")
    file_text[path] = raw
    for bm in QBLOCK_RE.finditer(raw):
        block = bm.group(0)
        qid = int(bm.group(1))
        om = OPT_BLOCK_RE.search(block)
        cm = re.search(r'correctAnswer:\s*"([a-d])"', block)
        if not om or not cm:
            continue
        subj = re.search(r'subjectId:\s*"([^"]+)"', block)
        stored.append({
            "id": qid, "subject": subj.group(1) if subj else "?", "file": path,
            "block_start": bm.start(), "block_end": bm.end(),
            "opt_start": bm.start() + om.start(), "opt_groups": [om.span(k) for k in range(1, 5)],
            "raw": [om.group(k) for k in range(1, 5)],  # raw a,b,c,d values (escapes preserved)
            "correct": cm.group(1), "correct_span": (bm.start() + cm.start(1), bm.start() + cm.end(1)),
            "nopts": {POSITION[k]: nopt(om.group(k + 1)) for k in range(4)},
            "nstem": "",  # filled below
        })

# stems (include CODE, because the extractor's PDF stem includes the code lines; this is
# what disambiguates sibling questions and matches code-heavy questions reliably)
id_text = {}
for path, raw in file_text.items():
    for m in re.finditer(r"id:\s*(\d+),.*?text:\s*`(.*?)`,\s*\r?\n\s*code:\s*(`(?:\\.|[^`])*`|undefined)", raw, re.DOTALL):
        code = m.group(3)
        code = code[1:-1] if code.startswith("`") else ""
        id_text[int(m.group(1))] = m.group(2) + " " + code
for s in stored:
    s["nstem"] = nstem(id_text.get(s["id"], ""))

# ============================ explanations ============================
EXPL_PATH = "src/data/explanations.ts"
expl_raw = open(EXPL_PATH, "rb").read().decode("utf-8")
explanations = {}
for m in re.finditer(r'"(\d+)":\s*"((?:\\.|[^"])*)"', expl_raw):
    explanations[int(m.group(1))] = json.loads('"' + m.group(2) + '"')


def remap_explanation(text, option_order):
    """Faithful port of src/lib/explanation.ts remapExplanationForOrder.
    option_order = old keys in new display order (e.g. ['c','a','b','d'])."""
    if not text or len(option_order) != 4:
        return text
    to_new = {}
    changed = False
    for i, orig in enumerate(option_order):
        to_new[orig] = POSITION[i]
        if orig != POSITION[i]:
            changed = True
    if not changed:
        return text
    lines = text.split("\n")
    bullet_pos = []
    out = []
    for i, line in enumerate(lines):
        c = re.match(r"^(\s*Corect:\s*)([a-d])(\b[\s\S]*)$", line)
        if c:
            out.append(f"{c.group(1)}{to_new.get(c.group(2), c.group(2))}{c.group(3)}")
            continue
        b = re.match(r"^(\s*•\s*)([a-d])(\s*-\s[\s\S]*)$", line)
        if b:
            bullet_pos.append(i)
            out.append(f"{b.group(1)}{to_new.get(b.group(2), b.group(2))}{b.group(3)}")
            continue
        out.append(line)
    if len(bullet_pos) > 1:
        def letter_of(l):
            m = re.match(r"^\s*•\s*([a-d])", l)
            return m.group(1) if m else "z"
        srt = sorted((out[p] for p in bullet_pos), key=letter_of)
        for k, p in enumerate(bullet_pos):
            out[p] = srt[k]
    return "\n".join(out)


PROSE_PATS = [
    r"`[a-d]`", r"\b[a-d]\)", r"\bvariant[ae]\s+[a-d]\b", r"\bvariantele\s+[a-d]\b",
    r"\bîn\s+[a-d]\b", r"\bIn\s+[a-d]\b", r"\b[a-d]\s+și\s+[a-d]\b",
    r"\bop[țt]iunea\s+[a-d]\b", r"\br[ăa]spunsul\s+[a-d]\b", r"\blitera\s+[a-d]\b",
    r"\bpunctul\s+[a-d]\b", r"\bcazul\s+[a-d]\b", r"\b[a-d]\s*-\s",
]


def prose_refs(text):
    """Conservative: any option-letter reference OUTSIDE the structured 'Corect:' header and
    '• x - ' bullet leaders. Over-flagging only costs coverage (the question is left as-is), so
    we err toward flagging."""
    refs = []
    for line in text.split("\n"):
        if re.match(r"^\s*Corect:\s*[a-d]\b", line):
            continue
        body = re.sub(r"^\s*•\s*[a-d]\s*-\s", "", line)  # strip bullet leader, scan its prose
        for pat in PROSE_PATS:
            if re.search(pat, body):
                refs.append(line.strip())
                break
    return refs


# ============================ match + compute permutation ============================
def opt_overlap(s_nopts, p_npdf):
    return sum(max(ratio(dt, pt) for pt in p_npdf) for dt in s_nopts.values()) / max(len(s_nopts), 1)


def find_parsed(s):
    # candidate set: exact-stem matches + any parsed sharing an option 8-char prefix
    cand = set(parsed_by_stem.get(s["nstem"], []))
    for o in s["nopts"].values():
        if len(o) >= 4:
            cand |= prefix_index.get(o[:8], set())
    if not cand:  # rare fallback: scan all
        cand = range(len(parsed))
    best, bk, bo, bs = None, -1, 0, 0
    for pi in cand:
        p = parsed[pi]
        if len(p["npdf"]) < 4:
            continue
        ov = opt_overlap(s["nopts"], p["npdf"])
        st = ratio(s["nstem"], p["nstem"])
        key = ov * 0.75 + st * 0.25
        if key > bk:
            best, bk, bo, bs = p, key, ov, st
    return best, bo, bs


changes = []      # {id, file, order, new_correct, raw_new[4], correct_span, opt_groups, opt_start, block_*}
identity = 0
unmatched = []
risky = []        # prose-ref questions among the changes
for s in stored:
    p, ov, st = find_parsed(s)
    if p is None or ov < 0.82 or st < 0.62:
        unmatched.append(s)
        continue
    # bijection: each PDF position -> the stored letter holding that text
    pos_to_letter = []
    used = set()
    ok = True
    for pt in p["npdf"]:
        bestL, bestr = None, -1
        for L, dt in s["nopts"].items():
            if L in used:
                continue
            r = ratio(dt, pt)
            if r > bestr:
                bestL, bestr = L, r
        if bestL is None or bestr < 0.78:
            ok = False
            break
        pos_to_letter.append(bestL)
        used.add(bestL)
    if not ok or len(set(pos_to_letter)) != 4:
        unmatched.append(s)
        continue
    if pos_to_letter == POSITION:
        identity += 1
        continue
    # new raw values: position i (letter POSITION[i]) gets the stored raw of pos_to_letter[i]
    li = {"a": 0, "b": 1, "c": 2, "d": 3}
    raw_new = [s["raw"][li[pos_to_letter[i]]] for i in range(4)]
    # new correct = position whose stored letter == old correct
    new_correct = POSITION[pos_to_letter.index(s["correct"])]
    # ---- GATES ----
    assert sorted(raw_new) == sorted(s["raw"]), f"id {s['id']}: option text set changed"
    assert raw_new[POSITION.index(new_correct)] == s["raw"][li[s["correct"]]], f"id {s['id']}: correct text moved"
    # SAFETY: do not reorder questions whose explanation references options by letter in PROSE.
    # Auto-remap can only fix the structured "Corect:"/bullet lines; prose would go stale. Leave as-is.
    if s["id"] in explanations and prose_refs(explanations[s["id"]]):
        risky.append(s["id"])
        unmatched.append(s)
        continue
    rec = {**s, "order": pos_to_letter, "new_correct": new_correct, "raw_new": raw_new}
    changes.append(rec)

# ============================ known-case sanity gates ============================
KNOWN = {269: "c", 323: "b", 258: "d", 260: "c", 373: "b"}  # expected correctAnswer after reorder
known_report = []
cmap = {c["id"]: c for c in changes}
for qid, exp in KNOWN.items():
    if qid in cmap:
        got = cmap[qid]["new_correct"]
    else:
        # unchanged (identity) or unmatched -> read current stored correct
        cur = next((s["correct"] for s in stored if s["id"] == qid), "?")
        got = cur + " (unchanged/identity)"
    known_report.append((qid, exp, got, str(got).startswith(exp)))

# ============================ output ============================
report = []
R = report.append
R("# Reorder-to-PDF plan\n")
R(f"- parsed PDF questions: {len(parsed)}")
R(f"- stored questions: {len(stored)}")
R(f"- already PDF order (identity): {identity}")
R(f"- **will reorder: {len(changes)}**")
R(f"- unmatched / left as-is: {len(unmatched)} (includes prose-ref exclusions below)")
R(f"- excluded for safety (explanation has prose letter refs): {len(risky)} -> {sorted(risky)}\n")
R("## Known-case sanity (expected correctAnswer after reorder)\n")
for qid, exp, got, ok in known_report:
    R(f"- id {qid}: expect `{exp}`, got `{got}`  {'OK' if ok else '*** MISMATCH ***'}")
R("\n## Sample reorders\n")
for c in changes[:8]:
    R(f"- id {c['id']} ({c['subject']}) order stored->pdf {c['order']}, correct {c['correct']}->{c['new_correct']}")
R("\n## Unmatched ids (left untouched)\n")
R(", ".join(str(s["id"]) for s in sorted(unmatched, key=lambda x: x["id"])) or "(none)")
open("reorder-plan.md", "w", encoding="utf-8").write("\n".join(report))

print("=" * 66)
print(f"  parsed PDF questions : {len(parsed)}")
print(f"  stored questions     : {len(stored)}")
print(f"  identity (no change) : {identity}")
print(f"  WILL REORDER         : {len(changes)}")
print(f"  unmatched/as-is      : {len(unmatched)}")
print(f"  excluded (prose refs): {sorted(risky)}")
print("-" * 66)
print("  known-case checks:")
for qid, exp, got, ok in known_report:
    print(f"    id {qid}: expect {exp}, got {got}   {'OK' if ok else '*** MISMATCH ***'}")
print("=" * 66)
if not all(ok for *_, ok in known_report):
    print("!! Known-case mismatch - NOT applying. Investigate before --apply.")
    sys.exit(1)

if not APPLY:
    print("DRY RUN. Wrote reorder-plan.md. Re-run with --apply to write files.")
    sys.exit(0)

# ============================ APPLY ============================
# 1) question files: splice option values + correctAnswer within each block (preserve everything else)
by_file = {}
for c in changes:
    by_file.setdefault(c["file"], []).append(c)
for path, recs in by_file.items():
    text = file_text[path]
    # apply from end to start so offsets stay valid
    edits = []  # (start, end, replacement)
    for c in recs:
        # option value splices (absolute offsets)
        for i in range(4):
            gs, ge = c["opt_groups"][i]
            abs_s = c["block_start"] + gs
            abs_e = c["block_start"] + ge
            edits.append((abs_s, abs_e, c["raw_new"][i]))
        # correctAnswer
        edits.append((c["correct_span"][0], c["correct_span"][1], c["new_correct"]))
    edits.sort(key=lambda e: e[0], reverse=True)
    for s_, e_, rep in edits:
        text = text[:s_] + rep + text[e_:]
    open(path, "wb").write(text.encode("utf-8"))
    print(f"  wrote {path}: {len(recs)} questions reordered")

# 2) explanations: bake structured remap for every reordered question that has one
new_expl = expl_raw
baked = 0
for c in changes:
    qid = c["id"]
    if qid not in explanations:
        continue
    baked_text = remap_explanation(explanations[qid], c["order"])
    if baked_text == explanations[qid]:
        continue
    pat = re.compile(r'("' + str(qid) + r'":\s*)"(?:\\.|[^"])*"')
    new_expl, n = pat.subn(lambda m, b=baked_text: m.group(1) + json.dumps(b, ensure_ascii=False), new_expl, count=1)
    if n:
        baked += 1
open(EXPL_PATH, "wb").write(new_expl.encode("utf-8"))
print(f"  baked {baked} explanation remaps into {EXPL_PATH}")
print("APPLIED. Re-run the audit + tests next. Left as-is (incl. prose-ref):", len(unmatched))
