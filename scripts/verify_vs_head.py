# -*- coding: utf-8 -*-
"""
Verify that THIS SESSION's changes preserved every question's meaning vs git HEAD.

Invariants (HEAD = state at session start):
  - exactly one question removed: id 353 (the constrangeri duplicate)
  - no question added
  - for every surviving question: the SET of 4 option texts is unchanged
  - for every surviving question: the correct-answer TEXT (options[correctAnswer]) is unchanged
    (letters/order may differ - that's the reorder - but the *meaning* of "correct" must not)
"""
import sys, re, subprocess, glob, os
sys.stdout.reconfigure(encoding="utf-8")

# Segment by id: markers (robust to `},`-like content inside multi-line/code options).
ID_RE = re.compile(r"\r?\n  \{\r?\n    id:\s*(\d+),")
OPTBLOCK = re.compile(
    r"options:\s*\{\s*a:\s*`((?:\\.|[^`])*)`,\s*b:\s*`((?:\\.|[^`])*)`,"
    r"\s*c:\s*`((?:\\.|[^`])*)`,\s*d:\s*`((?:\\.|[^`])*)`,\s*\}", re.DOTALL)


def parse(text):
    out = {}
    text = text.replace("\r\n", "\n")  # normalize endings (git show=LF blob vs working tree=CRLF)
    marks = [(m.start(), int(m.group(1))) for m in ID_RE.finditer(text)]
    for i, (pos, qid) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(text)
        blk = text[pos:end]
        om = OPTBLOCK.search(blk)
        cm = re.search(r'correctAnswer:\s*"([a-d])"', blk)
        if not om or not cm:
            continue
        opts = {"a": om.group(1), "b": om.group(2), "c": om.group(3), "d": om.group(4)}
        out[qid] = {"opts": opts, "correct": cm.group(1)}
    return out


files = [os.path.relpath(p).replace("\\", "/") for p in glob.glob("src/data/questions/**/*.ts", recursive=True)]
head, cur = {}, {}
for f in files:
    cur.update(parse(open(f, "rb").read().decode("utf-8")))
    try:
        h = subprocess.run(["git", "show", f"HEAD:{f}"], capture_output=True, text=True, encoding="utf-8")
        if h.returncode == 0:
            head.update(parse(h.stdout))
    except Exception as e:
        print("git show failed for", f, e)

head_ids, cur_ids = set(head), set(cur)
removed = head_ids - cur_ids
added = cur_ids - head_ids
print(f"HEAD questions: {len(head)}, current: {len(cur)}")
print(f"removed ids: {sorted(removed)}")
print(f"added ids:   {sorted(added)}")

opt_set_changed, correct_text_changed = [], []
for qid in sorted(head_ids & cur_ids):
    h, c = head[qid], cur[qid]
    if sorted(h["opts"].values()) != sorted(c["opts"].values()):
        opt_set_changed.append(qid)
    if h["opts"][h["correct"]] != c["opts"][c["correct"]]:
        correct_text_changed.append(qid)

print(f"\noption-set changed (should be none): {len(opt_set_changed)} {opt_set_changed[:30]}")
print(f"CORRECT-ANSWER TEXT changed (should be none): {len(correct_text_changed)} {correct_text_changed[:30]}")

# ---- raw-block completeness check over ALL ids (incl. code-heavy ones OPTBLOCK can't parse) ----
def all_blocks(text):
    text = text.replace("\r\n", "\n")
    marks = [(m.start(), int(m.group(1))) for m in ID_RE.finditer(text)]
    blocks = {}
    for i, (pos, qid) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(text)
        blocks[qid] = text[pos:end]
    return blocks


head_b, cur_b = {}, {}
for f in files:
    cur_b.update(all_blocks(open(f, "rb").read().decode("utf-8")))
    h = subprocess.run(["git", "show", f"HEAD:{f}"], capture_output=True, text=True, encoding="utf-8")
    if h.returncode == 0:
        head_b.update(all_blocks(h.stdout))

all_removed = set(head_b) - set(cur_b)
all_added = set(cur_b) - set(head_b)
changed_blocks = sorted(qid for qid in (set(head_b) & set(cur_b)) if head_b[qid] != cur_b[qid])
# changed blocks that we could NOT meaning-check via OPTBLOCK (the risky ones to eyeball)
unparsed_changed = [qid for qid in changed_blocks if qid not in head]
print(f"\n[ALL-IDS] HEAD={len(head_b)} CUR={len(cur_b)} removed={sorted(all_removed)} added={sorted(all_added)}")
print(f"[ALL-IDS] blocks changed: {len(changed_blocks)} (expected = the reordered set)")
print(f"[ALL-IDS] changed blocks NOT meaning-verified by OPTBLOCK: {unparsed_changed or 'none'}")

ok = (removed == {353} and not added and not opt_set_changed and not correct_text_changed
      and all_removed == {353} and not all_added and not unparsed_changed)
print("\nRESULT:", "ALL GOOD - no meaning changed, only 353 removed + reorder" if ok else "*** REVIEW NEEDED ***")
sys.exit(0 if ok else 1)
