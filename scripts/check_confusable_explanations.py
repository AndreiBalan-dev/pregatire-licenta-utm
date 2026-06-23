# -*- coding: utf-8 -*-
"""For each near-identical question PAIR, flag suspicious explanations:
 - both explanations nearly identical (copy-paste -> at least one is likely wrong), or
 - the two questions have the SAME correctAnswer letter AND identical option at that letter but a
   different stem (often fine) -- we only hard-flag identical explanations.
Helps verify the 'de ce e corect' is right for the trap pairs."""
import sys, re, json, glob, difflib
sys.stdout.reconfigure(encoding="utf-8")

expl = {}
raw = open("src/data/explanations.ts", "rb").read().decode("utf-8")
for m in re.finditer(r'"(\d+)":\s*"((?:\\.|[^"])*)"', raw):
    expl[int(m.group(1))] = json.loads('"' + m.group(2) + '"')

pairs = []
report = open("confusables-report.md", encoding="utf-8").read() if glob.glob("confusables-report.md") else ""
for m in re.finditer(r"ids (\d+) & (\d+)\s+sim=([\d.]+)", report):
    pairs.append((int(m.group(1)), int(m.group(2)), float(m.group(3))))


def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


flagged = []
for a, b, sim in pairs:
    ea, eb = expl.get(a), expl.get(b)
    if not ea or not eb:
        continue
    # strip the structured "Corect: x" + bullet leaders so we compare the actual reasoning prose
    def prose(e):
        return "\n".join(l for l in e.split("\n") if not re.match(r"^\s*(Corect:|•)", l))
    er = ratio(prose(ea), prose(eb))
    if er > 0.93:
        ca = re.search(r"Corect:\s*([a-d])", ea)
        cb = re.search(r"Corect:\s*([a-d])", eb)
        flagged.append((a, b, sim, round(er, 3), ca.group(1) if ca else "?", cb.group(1) if cb else "?"))

print(f"checked {len(pairs)} confusable pairs")
print(f"pairs whose explanation PROSE is near-identical (review for copy-paste): {len(flagged)}")
for a, b, sim, er, ca, cb in sorted(flagged, key=lambda x: -x[3]):
    print(f"  ids {a} (Corect {ca}) & {b} (Corect {cb})  qsim={sim} explprose_sim={er}")
