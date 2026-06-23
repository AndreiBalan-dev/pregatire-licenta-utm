# -*- coding: utf-8 -*-
"""Completeness: per subject, compare the PDF's question numbers (1..N) to the stored question count.
Flags missing question numbers (questions in the PDF that may be absent from the data)."""
import sys, re, glob, unicodedata
import fitz
sys.stdout.reconfigure(encoding="utf-8")

RANGES = {
    "fundamentele-programarii": (3, 22), "programare-python": (23, 37), "poo-cpp": (38, 58),
    "metode-avansate-java": (59, 79), "tehnici-avansate": (80, 92), "algoritmi-structuri-date": (93, 104),
    "baze-de-date": (105, 115), "sgbd": (116, 126), "sisteme-de-operare": (127, 140),
    "retele-calculatoare": (141, 148), "criptografie": (149, 157), "tehnologii-web": (158, 165),
    "comert-electronic": (166, 172), "cloud-computing": (173, 174), "inovare-transformare-digitala": (175, 180),
}
FILE = {
    "fundamentele-programarii": "programming/fundamentele-programarii.ts", "programare-python": "programming/programare-python.ts",
    "poo-cpp": "programming/poo-cpp.ts", "metode-avansate-java": "programming/metode-avansate-java.ts",
    "tehnici-avansate": "programming/tehnici-avansate.ts", "algoritmi-structuri-date": "programming/algoritmi-structuri-date.ts",
    "baze-de-date": "databases/baze-de-date.ts", "sgbd": "databases/sgbd.ts",
    "sisteme-de-operare": "networks/sisteme-de-operare.ts", "retele-calculatoare": "networks/retele-calculatoare.ts",
    "criptografie": "networks/criptografie.ts", "tehnologii-web": "web/tehnologii-web.ts",
    "comert-electronic": "web/comert-electronic.ts", "cloud-computing": "web/cloud-computing.ts",
    "inovare-transformare-digitala": "web/inovare-transformare-digitala.ts",
}

doc = fitz.open("Grile Licenta 2026.pdf")
# question-number markers: a line that starts with "N." then a space then a letter (question text or option label).
QN = re.compile(r"^\s*(\d{1,3})\.\s+\S")

print(f"{'subject':30s} {'PDF q#range':>12s} {'PDF count':>9s} {'data':>5s}  missing-in-data?")
grand_missing = {}
for sid, (p0, p1) in RANGES.items():
    nums = set()
    for p in range(p0 - 1, p1):
        for line in doc[p].get_text().split("\n"):
            m = QN.match(line)
            if m:
                n = int(m.group(1))
                if 1 <= n <= 100:
                    nums.add(n)
    # PDF question numbers usually run 1..maxN contiguously; gaps in `nums` may be multi-line questions
    # whose number line didn't match. Use max as the expected count.
    maxn = max(nums) if nums else 0
    expected = set(range(1, maxn + 1))
    data_src = open(f"src/data/questions/{FILE[sid]}", "rb").read().decode("utf-8")
    data_count = len(re.findall(r"\n    id:\s*\d+,", data_src))
    # which PDF numbers are missing from the detected set (candidate missing questions)
    missing = sorted(expected - nums)
    flag = ""
    if data_count < maxn:
        flag = f"  <-- data has {data_count} but PDF goes up to {maxn} (possible {maxn - data_count} missing)"
    print(f"{sid:30s} {('1-'+str(maxn)):>12s} {len(nums):>9d} {data_count:>5d}{flag}")
    if data_count != maxn:
        grand_missing[sid] = (maxn, data_count, missing)

print("\nSubjects where data count != PDF max question number:")
for sid, (maxn, dc, missing) in grand_missing.items():
    print(f"  {sid}: PDF max={maxn}, data={dc}; PDF numbers not detected by scan: {missing[:20]}")
print("\n(Note: 'PDF numbers not detected' can be multi-line question numbers the line-scan missed,")
print(" not necessarily missing questions. Investigate subjects where data < PDF max.)")
