import type { Question } from "@/data/types";

export const programarePython: Question[] = [
  {
    id: 51,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care dintre următoarele colecții de date din limbajul Python este imutabilă?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `listă`,
      b: `tuplu`,
      c: `mulțime`,
      d: `dicționar`,
    },
    correctAnswer: "a",
  },
  {
    id: 52,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Pentru ca instrucțiunea Python del t[1:4] să nu producă o eroare în momentul executării 
sale, variabila t trebuie să fie inițializată prin:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `t = (1, 2, 3, 4, 5)`,
      b: `t = "12345"`,
      c: `t = {1, 2, 3, 4, 5}`,
      d: `t = [1, 2, 3, 4, 5]`,
    },
    correctAnswer: "a",
  },
  {
    id: 53,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Pentru ca instrucțiunea Python t[1]=7 să nu producă o eroare în momentul executării sale, 
variabila t trebuie să fie inițializată prin:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `t = (1, 2, 3, 4, 5)`,
      b: `t = []`,
      c: `t = {1, 2, 3, 4, 5}`,
      d: `t = {1:1, 2:2}`,
    },
    correctAnswer: "a",
  },
  {
    id: 54,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care dintre următoarele expresii logice scrise în limbajul Python este adevărată dacă şi numai 
dacă numărul natural memorat în variabila 𝑥 este par și nu aparţine intervalului (10,20]?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `x <= 10 or x > 20 and x % 2 == 0`,
      b: `x <= 10 or x > 20 or x % 2 == 0`,
      c: `x <= 10 and x > 20 and x % 2 == 0`,
      d: `x < 10 or x >= 20 and x % 2 == 0`,
    },
    correctAnswer: "a",
  },
  {
    id: 55,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarele 5 expresii scrise în limbajul Python: (a+b)/2==m, (a+b)//2==m, 
a+b==2*m, (b-a)/2==m–a și a//2==m-b//2. Câte dintre ele sunt adevărate dacă şi numai 
dacă numărul real 𝑚 este egal cu media aritmetică a numerelor întregi 𝑎 și 𝑏?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `/2==m–a și a//2==m-b//2. Câte dintre ele sunt adevărate dacă şi numai dacă numărul real 𝑚 este egal cu media aritmetică a numerelor întregi 𝑎 și 𝑏? a) 2`,
      b: `3`,
      c: `4`,
      d: `5`,
    },
    correctAnswer: "a",
  },
  {
    id: 56,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care este valoarea expresiei 2024//7/5*100/5//7, scrisă în limbajul Python?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `165.22448979591840`,
      b: `162.85714285714286`,
      c: `162.0`,
      d: `165.0`,
    },
    correctAnswer: "a",
  },
  {
    id: 57,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care este valoarea expresiei 2**4*4**2//4**4*2**2, scrisă în limbajul Python?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4`,
      b: `64`,
      c: `0`,
      d: `8192`,
    },
    correctAnswer: "a",
  },
  {
    id: 58,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Se consideră următoarea secvenţă de instrucțiuni Python: 
 
t, a, b = 0, 2025, 9 
while a > b: 
    a, t = a-b, t+1 
Ce valori vor fi afișate pe ecran după executarea secvenței de mai sus?`,
    code: `print(t, a)`,
    codeLanguage: "python",
    options: {
      a: `Ce valori vor fi afișate pe ecran după executarea secvenței de mai sus? a) 225 9`,
      b: `224 0`,
      c: `225 0`,
      d: `224 9`,
    },
    correctAnswer: "a",
  },
  {
    id: 59,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care dintre următoarele secvenţe de instrucţiuni Python nu afişează valoarea 4210?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `s = 0 for i in range(4210): s += 1 print(s)`,
      b: `s = 4201 while s <= 4210: s += 1 print(s)`,
      c: `s = 9 for i in range(4): s = s // 2 print(s, end="")`,
      d: `L = [str(x*2) if x < 3 else '1' for x in range(4)] L.sort(reverse=True) print("".join(L))`,
    },
    correctAnswer: "a",
  },
  {
    id: 60,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
s = 0 
while n > 0: 
    if n % 10 > s: 
        s = n % 10 
    else: 

 
 
3 
 
        break 
    n = n // 10 
else: 
    s = 10 
Ce valoare se va afişa după executarea secvenţei de mai sus pentru 𝑛=  75321?`,
    code: `print(s)`,
    codeLanguage: "python",
    options: {
      a: `1`,
      b: `5`,
      c: `7`,
      d: `10`,
    },
    correctAnswer: "a",
  },
  {
    id: 61,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
s = 0 
while n > 0: 
    if n % 10 > s: 
        s = n % 10 
    else: 
        break 
    n = n // 10 
else: 
    s = 10 
Ce valoare se va afişa după executarea secvenţei de mai sus pentru 𝑛=  75521?`,
    code: `print(s)`,
    codeLanguage: "python",
    options: {
      a: `1`,
      b: `5`,
      c: `7`,
      d: `10`,
    },
    correctAnswer: "a",
  },
  {
    id: 62,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
x, y, t = 0, 1, 10 
while t > 0: 
    x, y, t = y, x+y, t-1 
Ce valori se vor afişa după executarea secvenţei de mai sus?`,
    code: `print(x, y)`,
    codeLanguage: "python",
    options: {
      a: `89 55`,
      b: `55 144`,
      c: `89 144`,
      d: `55 89`,
    },
    correctAnswer: "a",
  },
  {
    id: 63,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
    L = L[2:] + L[0:2] 
 
L = [1, 2, 3, 4, 5] 
f(L) 
Ce se va afişa pe ecran după executarea programului de mai sus?`,
    code: `def f(L): 
    L[0], L[1] = L[1], L[0] 
print(L)`,
    codeLanguage: "python",
    options: {
      a: `[2, 1, 3, 4, 5]`,
      b: `[3, 4, 5, 2, 1]`,
      c: `[1, 2, 3, 4, 5]`,
      d: `[3, 4, 5, 2, 1, 3]`,
    },
    correctAnswer: "a",
  },
  {
    id: 64,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
    L = L[2:] + L[0:2] 
    return L 
 
L = [1, 2, 3, 4, 5] 
L = f(L) 
Ce valori se vor afişa pe ecran după executarea programului de mai sus?`,
    code: `def f(L): 
    L[0], L[1] = L[1], L[0] 
print(L)`,
    codeLanguage: "python",
    options: {
      a: `[2, 1, 3, 4, 5]`,
      b: `[3, 4, 5, 2, 1]`,
      c: `[1, 2, 3, 4, 5]`,
      d: `[3, 4, 5, 2, 1, 3]`,
    },
    correctAnswer: "a",
  },
  {
    id: 65,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
Pentru ca programul să ruleze fără erori trebuie ca punctele de suspensie să nu fie înlocuite cu:`,
    code: `def f(L, x): 
    x[0] = 0 
    L += x 
 
L = [1, 2, 3, 4] 
x = ... 
f(L, x) 
print(L)`,
    codeLanguage: "python",
    options: {
      a: `{5}`,
      b: `{1:1, 2:2}`,
      c: `[1, 2, 3]`,
      d: `[[[1]]]`,
    },
    correctAnswer: "a",
  },
  {
    id: 66,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
Pentru ca programul să afișeze valoarea 5 trebuie ca punctele de suspensie să fie înlocuite cu:`,
    code: `def f(L, x): 
    x[0] = 0 
    L += x 
 
L = [0, 1, 2] 
x = ... 
f(L, x) 
print(len(L))`,
    codeLanguage: "python",
    options: {
      a: `{1:1, 2:2}`,
      b: `{0:[100, 200, 300], 1:[400, 500, 600, 700]}`,
      c: `[[[3], [4]]]`,
      d: `list({3, 3})`,
    },
    correctAnswer: "a",
  },
  {
    id: 67,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm o listă nevidă 𝐿 ale cărei elemente sunt liste nevide de numere întregi (de exemplu, 
𝐿 = [[10, 70, −100], [50], [1, 100, 70]). Care dintre următoarele expresii Python nu atribuie 
variabilei de tip întreg 𝑙𝑚𝑎𝑥 cel mai mare număr care apare în sublistele listei 𝐿 (pentru 
exemplul dat anterior acesta este 100)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `lmax = max(L)`,
      b: `lmax = max([max(r) for r in L])`,
      c: `lmax = max([sorted(r)[-1] for r in L])`,
      d: `lmax = max([x for r in L for x in r])`,
    },
    correctAnswer: "a",
  },
  {
    id: 68,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
s = input() 
while len(s) > 0: 
    s = s.replace(s[0], "") 
Pentru orice șir format doar din caractere ASCII introdus de la tastatură programul va afișa:`,
    code: `print(s)`,
    codeLanguage: "python",
    options: {
      a: `prima literă din șirul introdus de la tastatură`,
      b: `ultima literă din șirul introdus de la tastatură`,
      c: `șirul vid`,
      d: `șirul introdus de la tastatură fără prima literă`,
    },
    correctAnswer: "a",
  },
  {
    id: 69,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
s = input() 
t = "" 
Pentru orice șir format doar din litere mici ale alfabetului englez introdus de la tastatură 
secvența dată este echivalentă cu:`,
    code: `for x in range(ord("a"), ord("z")+1): 
    t += chr(x) * s.count(chr(x)) 
print(t) 

 
 
6`,
    codeLanguage: "python",
    options: {
      a: `s = input() t = sum([x*s.count(chr(x)) for x in range(ord("a"), ord("z")+1)]) print(t)`,
      b: `s = input() t = "" for x in set(sorted(set(s))): t += x * s.count(x) print(t)`,
      c: `print(sorted(input()))`,
      d: `print("".join(sorted(input())))`,
    },
    correctAnswer: "a",
  },
  {
    id: 70,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Dacă s="restaurare" și t="orchestrare", atunci valoarea expresiei s.find(t[4:7]) 
+ t.find(s[-4:-1]) este egală cu:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `8`,
      b: `-2`,
      c: `0`,
      d: `6`,
    },
    correctAnswer: "a",
  },
  {
    id: 71,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie 𝑠 un șir de caractere format din exact 10 litere mici din alfabetul englez și următoarele 4 
expresii de tip logic, scrise în limbajul Python: s[:5]*2==s, s.index(s[5:])==0, 
s[:5]==s[5:] și s.startswith(s[5:])+s.endswith(s[:5])==2. Câte dintre cele 4 
expresii sunt adevărate dacă și numai dacă șirul 𝑠 se poate obține prin concatenarea a două 
șiruri identice de lungime 5?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1`,
      b: `2`,
      c: `3`,
      d: `4`,
    },
    correctAnswer: "a",
  },
  {
    id: 72,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie 𝑡 un șir de caractere format din numere naturale nenule despărțite între ele prin spații și 
următoarele 4 expresii scrise în limbajul Python:  
 
• 
x=int("".join(sorted(t.split()))) 
• 
x=int("".join(sorted("".join(t.split())))) 
• 
x=int("".join(sorted("".join(t.split())))[::-1]) 
• 
x=int("".join(sorted(t)[::-1])) 
  
În câte dintre cele 4 expresii variabila 𝑥 va conține întotdeauna cel mai mare număr care se 
poate forma folosind toate cifrele tuturor numerelor din șirul 𝑡? 

 
 
7`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1`,
      b: `2`,
      c: `3`,
      d: `4`,
    },
    correctAnswer: "a",
  },
  {
    id: 73,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
s = "abcd" * 2 
L = list(s[:6]) 
L += s[4:] 
L[3:] = L[7:] 
s = "".join(L) 
Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `print(s)`,
    codeLanguage: "python",
    options: {
      a: `abc`,
      b: `abcabcd`,
      c: `abcbcd`,
      d: `abcaabcabcd`,
    },
    correctAnswer: "a",
  },
  {
    id: 74,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
s = "abcd" * 2 
L = list(s[:6]) 
L += [s[4:]] 
L[3:] = L[7:] 
s = "".join(L) 
Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `print(s)`,
    codeLanguage: "python",
    options: {
      a: `abc`,
      b: `abcabcd`,
      c: `abcbcd`,
      d: `abcaabcabcd`,
    },
    correctAnswer: "a",
  },
  {
    id: 75,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care dintre următoarele secvențe de inițializare nu va produce o listă 𝐿 formată doar din 
numere naturale pare?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `L = [x ** 2 for x in range(0, 21, 2)]`,
      b: `L = [x // 2 for x in range(0, 21, 4)]`,
      c: `L = [x // 2 for x in range(0, 21, 2)]`,
      d: `L = [x * 3 for x in range(20, 0, -2)]`,
    },
    correctAnswer: "a",
  },
  {
    id: 76,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarea secvenţă de instrucțiuni Python: 
 
Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `t = set([x for x in range(0, 21, 2)] * 2) 
u = [x for x in range(0, 31, 3)] * 3 
t = t.intersection(u) 
t.update(tuple(u)) 
print(len(t))`,
    codeLanguage: "python",
    options: {
      a: `5`,
      b: `11`,
      c: `26`,
      d: `37`,
    },
    correctAnswer: "a",
  },
  {
    id: 77,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următoarele 4 funcții scrise în limbajul Python:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `def sc1(n): return sum([int(x) for x in str(n)])`,
      b: `def sc2(n): d = {int(x): str(n).count(x) for x in str(n)} return sum([x * d[x] for x in d])`,
      c: `def sc3(n): s = 0 while n >= 10: s += n // 10 n %= 10 return s + n`,
      d: `def sc4(n): 
    L = [int(x) for x in str(n)] 
         while len(L) > 1: 
   x = L.pop() 
         
   y = L.pop() 
         
   L.append(x+y) 
    return L[0] 
 
Câte dintre cele 4 funcții definite anterior furnizează suma cifrelor numărului natural 𝑛 
transmis ca parametru? 
 
a) 1 
b) 2 
c) 3 
d) 4`,
    },
    correctAnswer: "a",
  },
  {
    id: 78,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa după rularea programului Python de mai jos? 
 
L = [(1,2), (3,4), (5,6)] 
t = tuple() 
for x in L: 
    t += x`,
    code: `print(t)`,
    codeLanguage: "python",
    options: {
      a: `((1,2), (3,4), (5,6))`,
      b: `((1, 3, 5), (2, 4, 6))`,
      c: `(9, 12)`,
      d: `(1, 2, 3, 4, 5, 6)`,
    },
    correctAnswer: "a",
  },
  {
    id: 79,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa după rularea programului Python de mai jos? 
 
L = [1]`,
    code: `for x in range(3): 
    L = L + [L] 
print(L)`,
    codeLanguage: "python",
    options: {
      a: `[1, 1, 1]`,
      b: `[[1], [1], [1]]`,
      c: `[[[[1]]]]`,
      d: `[1, [1], [1, [1]], [1, [1], [1, [1]]]]`,
    },
    correctAnswer: "a",
  },
  {
    id: 80,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa după rularea programului Python de mai jos? 
 
L = [1]`,
    code: `for x in range(3): 
    L = [L] 
print(L)`,
    codeLanguage: "python",
    options: {
      a: `[1, 1, 1]`,
      b: `[[1], [1], [1]]`,
      c: `[[[[1]]]]`,
      d: `[1, [1], [1, [1]], [1, [1], [1, [1]]]]`,
    },
    correctAnswer: "a",
  },
  {
    id: 81,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa după rularea programului Python de mai jos?`,
    code: `def test(L): 
L.sort() 
L.remove(L[0]) 
 
L = [5, 1, 4, 3, 6, 5, 1, 1, 7] 
L = test(L) 
print(L)`,
    codeLanguage: "python",
    options: {
      a: `None`,
      b: `[1, 1, 3, 4, 5, 5, 6, 7]`,
      c: `[3, 4, 5, 5, 6, 7]`,
      d: `[5, 1, 4, 3, 6, 5, 1, 1, 7]`,
    },
    correctAnswer: "a",
  },
  {
    id: 82,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie s și t două șiruri de caractere. Care este efectul instrucțiunii s, t = (t, s)[::-1]?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `șirurile s și t nu vor fi modificate`,
      b: `șirurile s și t vor fi interschimbate`,
      c: `eroare, deoarece șirurile de caractere sunt imutabile`,
      d: `șirul s va fi înlocuit cu oglinditul șirului t, iar șirul t cu oglinditul șirului s (oglinditul unui șir se obține parcurgând șirul de la sfârșit spre început)`,
    },
    correctAnswer: "a",
  },
  {
    id: 83,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
s = "101,Popescu,Ion,Mihai,9.50" 
x, *y, z = s.split(",") 
Ce se va afişa pe ecran după executarea programului dat?`,
    code: `print(x, y, z, sep=" -> ")`,
    codeLanguage: "python",
    options: {
      a: `101 -> 'PopescuIonMihai' -> 9.50`,
      b: `101 -> 'Popescu,Ion,Mihai' -> 9.50`,
      c: `101 -> ['Popescu', 'Ion', 'Mihai'] -> 9.50`,
      d: `101 -> 9.50`,
    },
    correctAnswer: "a",
  },
  {
    id: 84,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
s = "Ana are mere si pere verzi" 
t = "" 
while True: 
    x, *y, z = s.split() 
    t += " ".join([x, z]) + " " 
    if len(y) == 0: 
        break 
    s = " ".join(y) 
Ce se va afişa pe ecran după executarea programului dat?`,
    code: `print(t)`,
    codeLanguage: "python",
    options: {
      a: `Ana are verzi mere si pere`,
      b: `Ana verzi are pere mere si`,
      c: `Ana verzi pere are si mere`,
      d: `Ana are si mere verzi pere`,
    },
    correctAnswer: "a",
  },
  {
    id: 85,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care dintre următoarele afirmații referitoare la un dicționar din limbajul Python este adevărată?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `toate cheile unui dicționar trebuie să fie de același tip de date`,
      b: `cheile dintr-un dicționar pot fi de orice tip de date, inclusiv alte dicționare`,
      c: `dicționarele sunt imutabile`,
      d: `valorile dintr-un dicționar nu se accesează folosind indecșii lor`,
    },
    correctAnswer: "a",
  },
  {
    id: 86,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie lista L = [10, [3.14, True, [20, "test", 2.71]], "usor"]. Care dintre 
următoarele expresii poate fi utilizată pentru a elimina cuvântul "test" din lista L?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `L[1][2][1:2] = []`,
      b: `del L[1][2][2]`,
      c: `L[1][2].pop()`,
      d: `L[1][2][1] = ""`,
    },
    correctAnswer: "a",
  },
  {
    id: 87,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa după rularea programului Python de mai jos? 
 
d = {}`,
    code: `for i in range(2): 
    for j in range(3): 
        d[i], d[j] = j, i 
print(d)`,
    codeLanguage: "python",
    options: {
      a: `{0: 0, 1: 1, 2: 2}`,
      b: `{0: 1, 1: 2, 2: 1}`,
      c: `{0: 2, 1: 2, 2: 1}`,
      d: `{0: 2, 1: 2, 2: 2}`,
    },
    correctAnswer: "a",
  },
  {
    id: 88,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie următoarea funcție scrisă în limbajul Python: 
 
Dacă a și b sunt două variabile de tip numeric, atunci după executarea secvenței de instrucțiuni 
 
t = f(a, b) 
întotdeauna se va afișa:`,
    code: `def f(x, y): 
    return x-y, x+y 
 
print(t[1]-t[0])`,
    codeLanguage: "python",
    options: {
      a: `dublul valorii numărului a`,
      b: `dublul valorii numărului b`,
      c: `șirul de caractere obținut prin alipirea diferenței și sumei numerelor a și b`,
      d: `o eroare, deoarece funcția returnează două valori care nu pot fi stocate într-o singură variabilă`,
    },
    correctAnswer: "a",
  },
  {
    id: 89,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Care dintre următoarele structuri de date poate fi utilizată pentru cheile unui dicționar?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `un tuplu de liste`,
      b: `o listă de tupluri`,
      c: `un tuplu de tupluri`,
      d: `o mulțime de tupluri`,
    },
    correctAnswer: "a",
  },
  {
    id: 90,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa după rularea programului Python de mai jos? 
 
dct = {} 
dct['1'] = (1, 2) 

 
 
12 
 
dct['2'] = (2, 1) 
for x in dct:`,
    code: `print(dct[x][1], end="")`,
    codeLanguage: "python",
    options: {
      a: `(1,2)`,
      b: `(2,1)`,
      c: `12`,
      d: `21`,
    },
    correctAnswer: "a",
  },
  {
    id: 91,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Produsele dintr-un magazin online sunt caracterizate prin categorie, denumire, cantitate și preț 
unitar. De exemplu, un televizor se poate caracteriza prin următoarele informații: "Audio-
video", "Televizor Philips 32PHS6605/12", 10, 1500 RON. Care dintre următoarele structuri 
de date din limbajul Python permite actualizarea eficientă a cantității și prețului unitar pentru 
un anumit produs?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `o listă cu tupluri de forma (categorie, denumire, cantitate și preț unitar)`,
      b: `un dicționar cu intrări de forma categorie: {denumire: [cantitate, preț unitar]}`,
      c: `o listă cu șiruri de caractere de forma "categorie, denumire, cantitate și preț unitar"`,
      d: `un dicționar cu intrări de forma categorie: {denumire: (cantitate, preț unitar)}`,
    },
    correctAnswer: "a",
  },
  {
    id: 92,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
f = open("exemplu.txt") 
p = len(f.readline()) 
q = len(f.readlines()) 
r = len(f.read()) 
f.close() 
Dacă fișierul text "exemplu.txt" are conținutul 
Ana 
are 
mere 
si 
pere 
multe! 
atunci, după rularea programului de mai sus, se va afișa:`,
    code: `print(p + q + r)`,
    codeLanguage: "python",
    options: {
      a: `37`,
      b: `27`,
      c: `17`,
      d: `9`,
    },
    correctAnswer: "a",
  },
  {
    id: 93,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
f = open("exemplu.txt") 
s = t = u = 0 
while True: 
    aux = f.readline() 

 
 
13 
 
    if not aux: 
        break 
    u += 1 
    s += len(aux.split()) 
    t += sum([len(x) for x in aux.split()]) 
f.close() 
Dacă fișierul text "exemplu.txt" are conținutul 
Ana 
are mere verzi 
si pere 
multe! 
atunci, după rularea programului de mai sus, se va afișa:`,
    code: `print(u, s, t)`,
    codeLanguage: "python",
    options: {
      a: `4 7 27`,
      b: `4 7 26`,
      c: `4 10 30`,
      d: `5 10 27`,
    },
    correctAnswer: "a",
  },
  {
    id: 94,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
f = open("numere.txt") 
r = set() 
for aux in f: 
    s = sum([int(x) for x in aux.split()]) 
    r.add(s) 
Dacă fișierul text "numere.txt" are conținutul 
20 -10 10 
10 10 10 20 10 
20 20 -20 30 
50 
50 -80 70 -20 
atunci, după rularea programului de mai sus, se va afișa:`,
    code: `print(*sorted(r)) 
f.close()`,
    codeLanguage: "python",
    options: {
      a: `20 20 50 50 60`,
      b: `20 20 50 60`,
      c: `20 50 60`,
      d: `130`,
    },
    correctAnswer: "a",
  },
  {
    id: 95,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Considerăm următorul program Python: 
 
f = open("numere.txt") 
r = [] 
for aux in f: 
    t = max([x for x in aux.split()]) 

 
 
14 
 
    r.append(t) 
f.close() 
aux = "".join(sorted(r)) 
f = open("numere.txt", "a") 
f.write("\\n"+aux) 
f.close() 
 
Dacă fișierul text "numere.txt" are conținutul 
20 70 1100 
500 60 100 
1000 7 500 
atunci, după rularea programului de mai sus, ultima linie din fișierul numere.txt va fi:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `50010001100`,
      b: `500 1000 1100`,
      c: `60770`,
      d: `1100`,
    },
    correctAnswer: "a",
  },
  {
    id: 96,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa pe ecran după executarea programului Python de mai jos?`,
    code: `def f(a=2, b=3): 
      return a + b 
 
print(f(f(7)))`,
    codeLanguage: "python",
    options: {
      a: `11`,
      b: `12`,
      c: `13`,
      d: `o eroare, deoarece apelul funcției f conține un singur parametru efectiv`,
    },
    correctAnswer: "a",
  },
  {
    id: 97,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa pe ecran după executarea programului Python de mai jos?`,
    code: `def f(a=10, b=20): 
    return a + b 
 
print(f(f(30),f(50)))`,
    codeLanguage: "python",
    options: {
      a: `60`,
      b: `80`,
      c: `100`,
      d: `120`,
    },
    correctAnswer: "a",
  },
  {
    id: 98,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie următoarea funcție scrisă în limbajul Python: 
 
Dacă T este o listă cu elemente de tip numeric, atunci după executarea secvenței de instrucțiuni 
 
r = f(T) 
întotdeauna se vor afișa:`,
    code: `def f(L): 
    L = list(set(L)) 
    L.sort() 
    return L 
 

 
 
15 
 
print(r, T)`,
    codeLanguage: "python",
    options: {
      a: `valorile distincte (fără duplicate) din lista T în ordine crescătoare și apoi lista T inițială`,
      b: `valorile distincte (fără duplicate) din lista T în ordine crescătoare și apoi lista T inițială sortată crescător`,
      c: `valorile distincte (fără duplicate) din lista T într-o ordine oarecare și apoi lista T inițială sortată crescător`,
      d: `valorile distincte (fără duplicate) din lista T într-o ordine oarecare și apoi lista T inițială`,
    },
    correctAnswer: "a",
  },
  {
    id: 99,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Ce se va afișa pe ecran după executarea programului de mai jos?`,
    code: `def f(lst): 
    del lst[lst[2]] 
    return lst 
 
L = [x * x for x in range(5)] 
print(f(L))`,
    codeLanguage: "python",
    options: {
      a: `[0, 1, 9, 16]`,
      b: `[0, 1, 4, 9]`,
      c: `[0, 1, 4, 16]`,
      d: `[1, 4, 9, 16]`,
    },
    correctAnswer: "a",
  },
  {
    id: 100,
    moduleId: "programming",
    subjectId: "programare-python",
    text: `Fie următorul program scris în limbajul Python: 
 
După executarea programului de mai sus, pe ecran se va afișa:`,
    code: `def f(x, y): 
    return x & y, x | y 
 
t = f(0b101101, 0b111000) 
print(bin(t[1] ^ t[0]))`,
    codeLanguage: "python",
    options: {
      a: `0b10101`,
      b: `0b11100`,
      c: `0b101010`,
      d: `0b111101`,
    },
    correctAnswer: "a",
  },
];
