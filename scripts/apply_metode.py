# -*- coding: utf-8 -*-
"""Apply PDF-order reorders to metode-avansate-java.ts (the ONLY file using DOUBLE-QUOTED option
strings). Order-only + answer-preserving, with explanation remap. Driven by order-map-metode.json.
Dry-run by default; --apply writes."""
import sys, re, json
sys.stdout.reconfigure(encoding="utf-8")
APPLY = "--apply" in sys.argv
POSITION = ["a", "b", "c", "d"]
FILE = "src/data/questions/programming/metode-avansate-java.ts"
EXPL = "src/data/explanations.ts"

amap = json.load(open("order-map-metode.json", encoding="utf-8"))


def remap_explanation(text, option_order):
    if not text or len(option_order) != 4:
        return text
    to_new, changed = {}, False
    for i, orig in enumerate(option_order):
        to_new[orig] = POSITION[i]
        if orig != POSITION[i]:
            changed = True
    if not changed:
        return text
    lines, bullet_pos, out = text.split("\n"), [], []
    for i, line in enumerate(lines):
        c = re.match(r"^(\s*Corect:\s*)([a-d])(\b[\s\S]*)$", line)
        if c:
            out.append(f"{c.group(1)}{to_new.get(c.group(2), c.group(2))}{c.group(3)}"); continue
        b = re.match(r"^(\s*•\s*)([a-d])(\s*-\s[\s\S]*)$", line)
        if b:
            bullet_pos.append(i); out.append(f"{b.group(1)}{to_new.get(b.group(2), b.group(2))}{b.group(3)}"); continue
        out.append(line)
    if len(bullet_pos) > 1:
        srt = sorted((out[p] for p in bullet_pos), key=lambda l: (re.match(r"^\s*•\s*([a-d])", l) or ["", "z"])[1])
        for k, p in enumerate(bullet_pos):
            out[p] = srt[k]
    return "\n".join(out)


raw = open(FILE, "rb").read().decode("utf-8")
expl_raw = open(EXPL, "rb").read().decode("utf-8")
# question block: id ... options{ a:"..",b:"..",c:"..",d:".." } ... correctAnswer:"x"
QBLOCK = re.compile(r"\{\r?\n\s+id:\s*(\d+),.*?\r?\n  \},", re.DOTALL)
OPTB = re.compile(
    r'(options:\s*\{\s*a:\s*")((?:\\.|[^"])*)(",\s*b:\s*")((?:\\.|[^"])*)(",\s*c:\s*")((?:\\.|[^"])*)(",\s*d:\s*")((?:\\.|[^"])*)("\s*,?\s*\})',
    re.DOTALL)

edits = []  # (abs_start, abs_end, replacement)
expl_edits = []
changed = 0
for bm in QBLOCK.finditer(raw):
    qid = int(bm.group(1))
    block = bm.group(0)
    if str(qid) not in amap:
        continue
    order = amap[str(qid)]["order"]
    if sorted(order) != ["a", "b", "c", "d"] or order == POSITION:
        continue  # identity or invalid -> skip
    om = OPTB.search(block)
    cm = re.search(r'correctAnswer:\s*"([a-d])"', block)
    if not om or not cm:
        print(f"  WARN id {qid}: option/correct parse failed, skipped")
        continue
    vals = {"a": om.group(2), "b": om.group(4), "c": om.group(6), "d": om.group(8)}
    correct = cm.group(1)
    li = {"a": 0, "b": 1, "c": 2, "d": 3}
    new_vals = [vals[order[i]] for i in range(4)]                      # position i gets data option order[i]
    new_correct = POSITION[order.index(correct)]                      # correct text moves to its new slot
    assert sorted(new_vals) == sorted(vals.values()), f"id {qid}: option set changed"
    assert new_vals[POSITION.index(new_correct)] == vals[correct], f"id {qid}: correct text moved"
    # splice option values (use group spans, absolute offsets)
    for k, gi in enumerate([2, 4, 6, 8]):
        gs, ge = bm.start() + om.start(gi), bm.start() + om.end(gi)
        edits.append((gs, ge, new_vals[k]))
    # correctAnswer
    cs = bm.start() + cm.start(1)
    edits.append((cs, bm.start() + cm.end(1), new_correct))
    # explanation remap
    em = re.search(r'("' + str(qid) + r'":\s*)"((?:\\.|[^"])*)"', expl_raw)
    if em:
        cur = json.loads('"' + em.group(2) + '"')
        baked = remap_explanation(cur, order)
        if baked != cur:
            expl_edits.append((qid, cur, baked))
    changed += 1
    print(f"  id {qid}: order {order}, correct {correct}->{new_correct}" + ("" if APPLY else "  [dry]"))

print(f"\n{changed} metode questions to reorder; {len(expl_edits)} explanation remaps")
if not APPLY:
    print("DRY RUN. pass --apply to write.")
    sys.exit(0)

# apply .ts edits (reverse offset order)
for s_, e_, rep in sorted(edits, key=lambda e: -e[0]):
    raw = raw[:s_] + rep + raw[e_:]
open(FILE, "wb").write(raw.encode("utf-8"))
# apply explanation edits
for qid, cur, baked in expl_edits:
    pat = re.compile(r'("' + str(qid) + r'":\s*)"(?:\\.|[^"])*"')
    expl_raw = pat.sub(lambda m, b=baked: m.group(1) + json.dumps(b, ensure_ascii=False), expl_raw, count=1)
open(EXPL, "wb").write(expl_raw.encode("utf-8"))
print(f"WROTE {FILE} and {EXPL}")
