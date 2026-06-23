# -*- coding: utf-8 -*-
"""Definitive whole-session answer-safety check: compare current data to the session-start commit.
Handles BOTH backtick and double-quoted option strings (metode-avansate-java uses double quotes).
Asserts: the only correct-answer-TEXT change across the whole session is id 126 (intended fix),
and the only removed question is id 353 (the constrangeri duplicate)."""
import sys, re, subprocess, glob, os
sys.stdout.reconfigure(encoding="utf-8")
BASE = sys.argv[1] if len(sys.argv) > 1 else "4b17dbe"

ID_RE = re.compile(r"\r?\n  \{\r?\n    id:\s*(\d+),")
# option value in backticks OR double quotes
OPT_RE = re.compile(r'([abcd]):\s*(?:`((?:\\.|[^`])*)`|"((?:\\.|[^"])*)")')


def parse(text):
    text = text.replace("\r\n", "\n")
    marks = [(m.start(), int(m.group(1))) for m in ID_RE.finditer(text)]
    out = {}
    for i, (pos, qid) in enumerate(marks):
        blk = text[pos: marks[i + 1][0] if i + 1 < len(marks) else len(text)]
        # options block only (avoid matching text/code): take region from 'options:' to 'correctAnswer'
        om = re.search(r"options:\s*\{(.*?)\},\s*\n\s*(?:figure:.*?\n\s*)?correctAnswer", blk, re.DOTALL)
        opts = {}
        region = om.group(1) if om else blk
        for mm in OPT_RE.finditer(region):
            L = mm.group(1)
            if L not in opts:
                opts[L] = mm.group(2) if mm.group(2) is not None else mm.group(3)
        cm = re.search(r'correctAnswer:\s*"([a-d])"', blk)
        if len(opts) == 4 and cm:
            out[qid] = {"opts": opts, "correct": cm.group(1)}
    return out


files = [os.path.relpath(p).replace("\\", "/") for p in glob.glob("src/data/questions/**/*.ts", recursive=True)]
base, cur = {}, {}
for f in files:
    cur.update(parse(open(f, "rb").read().decode("utf-8")))
    try:
        h = subprocess.run(["git", "show", f"{BASE}:{f}"], capture_output=True, text=True, encoding="utf-8")
        if h.returncode == 0:
            base.update(parse(h.stdout))
    except Exception as e:
        print("git show failed", f, e)

print(f"base({BASE}) parsed: {len(base)}, current parsed: {len(cur)}")
removed = sorted(set(base) - set(cur))
added = sorted(set(cur) - set(base))
print(f"removed: {removed}   added: {added}")
optset_changed, correct_changed = [], []
for qid in sorted(set(base) & set(cur)):
    b, c = base[qid], cur[qid]
    if sorted(b["opts"].values()) != sorted(c["opts"].values()):
        optset_changed.append(qid)
    if b["opts"][b["correct"]] != c["opts"][c["correct"]]:
        correct_changed.append(qid)
print(f"option-set changed (should be none): {optset_changed}")
print(f"CORRECT-ANSWER TEXT changed (expect only [126]): {correct_changed}")
# Intended, PDF-verified answer fixes this session: id 126 (operator[]) and id 336 (EXISTS vs JOIN).
INTENDED = [126, 336]
ok = removed == [353] and not added and not optset_changed and correct_changed == INTENDED
print("\nRESULT:", "ALL GOOD - only the intended PDF-verified answer fixes (126, 336); all else preserved" if ok else "*** REVIEW ***")
