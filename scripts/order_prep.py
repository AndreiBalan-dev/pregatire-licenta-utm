# -*- coding: utf-8 -*-
"""Merge agent order maps -> order-override.json (data-letter orders for the reorder script),
and report ANSWER discrepancies (agent's PDF red != stored correctAnswer) for manual review."""
import sys, re, json, glob
sys.stdout.reconfigure(encoding="utf-8")

import os
# Agent order maps. sisteme-de-operare orders are mostly correct (spot-checked vs PDF), but its
# RED reads were unreliable and id 670's order was wrong (data!=PDF options) — exclude 670.
mapfiles = ["order-map-py.json", "order-map-poo.json", "order-map-metode.json", "order-map-so.json", "order-map-batch2.json"]
maps = {}
for f in mapfiles:
    if os.path.exists(f):
        maps.update(json.load(open(f, encoding="utf-8")))
DROP = {"670"}  # known-bad agent order (its data options differ from the PDF)
for k in DROP:
    maps.pop(k, None)

# load stored correctAnswer + option texts per id
ID_RE = re.compile(r"\r?\n  \{\r?\n    id:\s*(\d+),")
OPT = re.compile(r"options:\s*\{\s*a:\s*`((?:\\.|[^`])*)`,\s*b:\s*`((?:\\.|[^`])*)`,\s*c:\s*`((?:\\.|[^`])*)`,\s*d:\s*`((?:\\.|[^`])*)`,\s*\}", re.DOTALL)
data = {}
for path in glob.glob("src/data/questions/**/*.ts", recursive=True):
    raw = open(path, "rb").read().decode("utf-8").replace("\r\n", "\n")
    marks = [(m.start(), int(m.group(1))) for m in ID_RE.finditer(raw)]
    for i, (pos, qid) in enumerate(marks):
        blk = raw[pos: marks[i + 1][0] if i + 1 < len(marks) else len(raw)]
        om = OPT.search(blk); cm = re.search(r'correctAnswer:\s*"([a-d])"', blk)
        if om and cm:
            data[qid] = {"opts": {L: om.group(k + 1) for k, L in enumerate("abcd")}, "correct": cm.group(1)}

override = {}
disc = []
nonident = 0
for sid, m in maps.items():
    qid = int(sid)
    order = m["order"]
    if sorted(order) == ["a", "b", "c", "d"]:
        override[sid] = order
        if order != ["a", "b", "c", "d"]:
            nonident += 1
    red = m.get("red", "?")
    if qid in data and red in "abcd" and red != data[qid]["correct"]:
        disc.append((qid, data[qid]["correct"], red,
                     " ".join(data[qid]["opts"][data[qid]["correct"]].split())[:60],
                     " ".join(data[qid]["opts"][red].split())[:60]))

json.dump(override, open("order-override.json", "w"), indent=0)
print(f"override entries: {len(override)} (non-identity orders: {nonident})")
print(f"\nANSWER discrepancies (agent PDF-red != stored correctAnswer) — REVIEW these {len(disc)}:")
for qid, stored, red, st_txt, red_txt in sorted(disc):
    print(f"  id {qid}: stored={stored} ('{st_txt}')  vs agent-red={red} ('{red_txt}')")
