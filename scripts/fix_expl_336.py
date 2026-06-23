# -*- coding: utf-8 -*-
"""Replace id 336's explanation (it justified the wrong answer d/JOIN); correct answer is c/EXISTS."""
import re, json

NEW = (
    "Corect: c\n\n"
    "Întrebarea cere o variantă echivalentă cu `salary > ANY (...)`. "
    "`EXISTS (SELECT * FROM Management WHERE salary < Employees.salary)` întoarce angajatul dacă există "
    "cel puţin un manager cu salariul mai mic decât al lui, adică salariul angajatului este mai mare decât "
    "al cel puţin unui manager. Este o semi-join: fiecare angajat apare o singură dată şi evaluarea se poate "
    "opri la prima potrivire.\n\n"
    "De ce nu celelalte:\n"
    "• a - `NOT salary < ALL(...)` revine la `>= ANY` (include şi egalitatea), deci nu e exact `> ANY`\n"
    "• b - `NOT EXISTS(... salary >= Employees.salary)` cere ca niciun manager să nu câştige cât sau mai mult, "
    "deci angajatul câştigă mai mult decât TOŢI managerii (`> ALL`), prea restrictiv\n"
    "• d - `JOIN ... ON Employees.salary > Management.salary` produce câte un rând pentru fiecare manager mai "
    "prost plătit, deci dublează numele angajaţilor; rezultatul diferă (ar fi nevoie de DISTINCT)"
)

path = "src/data/explanations.ts"
raw = open(path, "rb").read().decode("utf-8")
pat = re.compile(r'("336":\s*)"(?:\\.|[^"])*"')
new_raw, n = pat.subn(lambda m: m.group(1) + json.dumps(NEW, ensure_ascii=False), raw, count=1)
assert n == 1, f"expected 1 replacement, got {n}"
open(path, "wb").write(new_raw.encode("utf-8"))
print("Replaced id 336 explanation (Corect: d -> Corect: c)")
