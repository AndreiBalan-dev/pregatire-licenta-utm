import type { Question } from "@/data/types";

export const algoritmiStructuriDate: Question[] = [
  {
    id: 255,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatorul algoritm. Stiind ca datele de intrare sunt n = 7 si vectorul x = (9, 15, 23, 2, 5, 4, 8) care vor fi valorile vectorului poz la sfarsitul algoritmului?`,
    code: `for i = 1, n
  poz[i] = 1
endfor
for i = 1, n-1
  for j = i+1, n
    if x[j] < x[i] then poz[i] = poz[i] + 1
             else poz[j] = poz[j] + 1
    endif
  endfor
endfor`,
    codeLanguage: undefined,
    options: {
      a: `(5, 6, 7, 1, 2, 3, 4)`,
      b: `(5, 6, 7, 1, 3, 2, 4)`,
      c: `(6, 5, 7, 1, 2, 3, 4)`,
      d: `(1, 2, 3, 4, 5, 6, 7)`,
    },
    correctAnswer: "b",
  },
  {
    id: 256,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatoarea functie recursiva. Ce instructiuni trebuie scrise in linia de cod 5) pentru ca functia sa returneze inaltimea unui arbore binar?`,
    code: `1)  int inaltime(NodArb *rad)
2) // returneaza inaltimea unui arbore binar
3) {
4)  if(rad == NULL) return 0;
5)  ...............................................................................................
6)  return 1 + max(inaltime(rad->stang), inaltime(rad->drept));
7)
8) }`,
    codeLanguage: "c",
    options: {
      a: `instructiunea vida`,
      b: `int inaltime =0;`,
      c: `else`,
      d: `else if(rad->stang == NULL && rad->drept == NULL) return 0;`,
    },
    correctAnswer: "d",
  },
  {
    id: 257,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatoarea functie. Daca vectorul x = (2, 4, 5, 8, 9, 15, 23), care va fi rezultatul apelarii functiei cautare (x, 2, 6, 8) ?`,
    code: `int cautare(int x[], int first, int last, int value)
{   int mid;
     if(first > last) return -1;
     mid = (first + last) / 2;
     if (x[mid] == value) return mid;
     if(x[mid] < value) return cautare(x, mid + 1, last, value);
     else return cautare(x, first, mid - 1, value);
}`,
    codeLanguage: "c",
    options: {
      a: `-1`,
      b: `2`,
      c: `3`,
      d: `1`,
    },
    correctAnswer: "c",
  },
  {
    id: 258,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in preordine a arborelui binar din Fig. 1 va afisa`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig1.png",
    options: {
      a: `10, 4, 1, 9, 21, 15, 28, 23`,
      b: `10, 4, 1, 9, 23, 21, 28, 15`,
      c: `1, 4, 9, 10, 15, 21, 23, 28`,
      d: `10, 4, 1, 9, 21, 15, 23, 28`,
    },
    correctAnswer: "d",
  },
  {
    id: 259,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in inordine a arborelui binar din Fig. 1 va afisa`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig1.png",
    options: {
      a: `10, 4, 1, 9, 21, 15, 23, 28`,
      b: `1, 4, 9, 10, 15, 21, 23, 28`,
      c: `1, 4, 9, 10, 15, 21, 28, 23`,
      d: `1, 4, 9, 10, 21, 23, 28, 15`,
    },
    correctAnswer: "b",
  },
  {
    id: 260,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in postordine a arborelui binar din Fig. 1 va afisa`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig1.png",
    options: {
      a: `1, 4, 9, 10, 15, 21, 23, 28`,
      b: `1, 4, 9, 10, 15, 21, 28, 23`,
      c: `1, 9, 4, 15, 28, 23, 21, 10`,
      d: `1, 9, 4, 15, 23, 28, 21, 10`,
    },
    correctAnswer: "c",
  },
  {
    id: 261,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ce returneaza urmatoarea functie daca rad este pointer la radacina unui arbore binar nenul?`,
    code: `int fct(NodArb *rad)
{
  if(rad == NULL)  return 0;
  return 1 + fct(rad->stang) + fct(rad->drept);
}`,
    codeLanguage: "c",
    options: {
      a: `0`,
      b: `1`,
      c: `numarul de noduri terminale ale arborelui`,
      d: `numarul de noduri ale arborelui.`,
    },
    correctAnswer: "d",
  },
  {
    id: 262,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului Bubblesort (metoda bulelor) este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O (n)`,
      b: `O(n2)`,
      c: `O(n log n)`,
      d: `O(n3)`,
    },
    correctAnswer: "b",
  },
  {
    id: 263,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rau caz pentru algoritmul de sortare rapida este cazul in care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul este deja sortat`,
      b: `vectorul nu este creat aleator`,
      c: `toate elementele vectorului sunt pare`,
      d: `vectorul contine si elemente negative`,
    },
    correctAnswer: "a",
  },
  {
    id: 264,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cate comparatii se fac daca se foloseste algoritmul de cautare secventiala pentru cautarea elementului 12 in vectorul (2, 3, 6, 9, 10, 25)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6`,
      b: `5`,
      c: `3`,
      d: `1`,
    },
    correctAnswer: "a",
  },
  {
    id: 265,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cate comparatii se fac daca se foloseste algoritmul de cautare binara pentru cautarea elementului 12 in vectorul (2, 3, 6, 9, 10, 25)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6`,
      b: `5`,
      c: `3`,
      d: `1`,
    },
    correctAnswer: "c",
  },
  {
    id: 266,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `O lista liniara in care inserarile in lista se fac pe la un capat, iar stergerile pe la celalalt capat se numeste`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `stiva`,
      b: `vector`,
      c: `coada`,
      d: `arbore`,
    },
    correctAnswer: "c",
  },
  {
    id: 267,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Care din urmatorii algoritmi au ordinul de complexitate O(n log n)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Bubblesort (sortarea cu metoda bulelor)`,
      b: `sortarea prin selectie`,
      c: `sortarea prin inserare`,
      d: `Quicksort(sortarea rapida).`,
    },
    correctAnswer: "d",
  },
  {
    id: 268,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rau caz pentru algoritmul de cautare secventiala este cazul in care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `elementul cautat este la mijlocul listei`,
      b: `elementul cautat este pe prima pozitie in lista`,
      c: `elementul cautat este pe ultima pozitie in lista`,
      d: `vectorul este ordonat crescator`,
    },
    correctAnswer: "c",
  },
  {
    id: 269,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Timpul de executie al unui algoritm se masoara in`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `numarul de kilocteti necesari`,
      b: `numarul de instructiuni ale algoritmului`,
      c: `numarul de operatii cheie executate`,
      d: `numarul de milisecunde necesar executarii.`,
    },
    correctAnswer: "c",
  },
  {
    id: 270,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de cautare binara este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O(n)`,
      b: `O(n2)`,
      c: `O(n log n)`,
      d: `O(log n)`,
    },
    correctAnswer: "d",
  },
  {
    id: 271,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `O problema se poate rezolva prin trei algoritmi, unul cu ordinul de complexitate O(n), altul cu ordinul O(log n) si al treilea cu ordinul O(n log n). Care este cel mai bun?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel cu ordinul O(n)`,
      b: `cel cu ordinul O(log n)`,
      c: `cel cu ordinul O(n log n)`,
      d: `Toate sunt la fel.`,
    },
    correctAnswer: "b",
  },
  {
    id: 272,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatorul algoritm. Care vor fi valorile vectorului x dupa terminarea pasului i = 3 stiind ca la intrare avem valorile n = 7 si vectorul x = (9, 15, 23, 2, 5, 4, 8)?`,
    code: `for i = 1, n -1
  index_min = i
  for j = i + 1, n
    if x[index_min] > x[j] then index_min = j
    endif
  endfor
  if i <> index_min then
    temp=x[i]
    x[i]=x[index_min]
    x[index_min]=temp
  endif
endfor`,
    codeLanguage: undefined,
    options: {
      a: `(2, 4, 5, 9, 15, 23, 8)`,
      b: `(2, 5, 9, 15, 23, 4, 8)`,
      c: `(2, 5, 9, 15, 4, 23, 8)`,
      d: `(2, 4, 5, 9, 23, 15, 8)`,
    },
    correctAnswer: "d",
  },
  {
    id: 273,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatorul algoritm. Care vor fi valorile vectorului x dupa terminarea pasului i = 5, stiind ca la intrare avem valorile n = 7 si x = (9, 15, 23, 2, 5, 4, 8)?`,
    code: `for i = 2, n
  elem = x[i]
  j = i -1
  while j >= 1 and x[j] > x[i]
    j = j - 1
  endwhile
  pozitie = j +1
  for j= i, pozitie+1, -1
    x[j] = x[j -1]
  endfor
  x[pozitie] = elem
endfor`,
    codeLanguage: undefined,
    options: {
      a: `(2, 4, 5, 9, 15, 23, 8)`,
      b: `(2, 5, 9, 15, 23, 4, 8)`,
      c: `(2, 5, 9, 15, 4, 23, 8)`,
      d: `(2, 4, 5, 8, 9, 15, 23)`,
    },
    correctAnswer: "b",
  },
  {
    id: 274,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera urmatoarea secventa de operatii intr-o stiva: push(2), push(10), push(8), pop(), push(9), push(6), pop(), pop(), push(7), push(3), pop(), pop(), pop(), pop(). In ce ordine vor fi scoase din stiva elementele? (push = inserare, pop = stergere)`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(2, 10, 8, 9, 6, 7, 3)`,
      b: `(3, 7, 6, 9, 8, 10, 2)`,
      c: `(8, 6, 9, 3, 7, 10, 2)`,
      d: `(6, 9, 3, 7, 8, 10, 2)`,
    },
    correctAnswer: "c",
  },
  {
    id: 275,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera urmatoarea secventa de operatii intr-o coada: enqueue(2), enqueue(10), enqueue(8), dequeue(), enqueue(9), enqueue(6), dequeue(), dequeue(), enqueue(7), enqueue(3), dequeue(), dequeue(),dequeue(), dequeue(). In ce ordine vor fi scoase din coada elementele? (enqueue = inserare, dequeue = stergere)`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(2, 10, 8, 9, 6, 7, 3)`,
      b: `(3, 7, 6, 9, 8, 10, 2)`,
      c: `(8, 6, 9, 3, 7, 10, 2)`,
      d: `(6, 9, 3, 7, 8, 10, 2)`,
    },
    correctAnswer: "a",
  },
  {
    id: 276,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera urmatoarea functie care cauta o valoare data intr-o lista inlantuita. val este variabila a carei valoare este cautata, iar head este un pointer la capul listei in care se face cautarea. Cum trebuie completata linia de cod 4 astfel incat functia sa ruleze corect si sa returneze un pointer la nodul cu valoarea cautata sau NULL daca valoarea nu a fost gasita in lista?`,
    code: `NOD *cauta(NOD *head, int val)
{
  NOD *iter = head; int gasit=0;
  while (.......................)
  {
    if (iter -> info == val) gasit = 1;
    else iter = iter -> link;
  }
  if(gasit) return iter;
  else return NULL;
}`,
    codeLanguage: "c",
    options: {
      a: `iter != NULL`,
      b: `!gasit`,
      c: `iter!=NULL && !gasit`,
      d: `gasit ==0`,
    },
    correctAnswer: "c",
  },
  {
    id: 277,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera urmatoarea functie care are drept variabila de intrare un pointer la capul unei liste inlantuite nevide. Ce face aceasta functie?`,
    code: `NOD *fct(NOD *head)
{
  if (head == NULL)  return NULL;
  head = head -> link;
  return head;
}`,
    codeLanguage: "c",
    options: {
      a: `returneaza NULL`,
      b: `returneaza un pointer la capul listei`,
      c: `elimina primul nod al listei si returneaza un pointer la noul cap al listei`,
      d: `returneaza pointer la ultimul nod al listei`,
    },
    correctAnswer: "c",
  },
  {
    id: 278,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rau caz pentru algoritmul de sortare prin selectie este cazul in care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul este ordonat descrescator`,
      b: `cel mai mare element al vectorului se afla in prima pozitie in vector`,
      c: `nu exista un cel mai rau caz`,
      d: `vectorul este ordonat crescator`,
    },
    correctAnswer: "c",
  },
  {
    id: 279,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai bun caz pentru algoritmul de sortare prin metoda bulelor (Bubblesort) este cazul in care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel mai mic element al vectorului se afla pe prima pozitie in vector`,
      b: `cel mai mare element al vectorului se afla in ultima pozitie in vector`,
      c: `nu exista un cel mai bun caz`,
      d: `vectorul este ordonat crescator`,
    },
    correctAnswer: "d",
  },
  {
    id: 280,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera lista inlantuita cu elemente numere intregi din Fig. 2. Data urmatoarea definitie a tipului de date ce corespunde unui nod al listei, ce va afisa urmatoarea functie, daca este apelata prin print(HEAD)?`,
    figure: "/figures/fig2.png",
    code: `struct NOD
{
  int info;
  NOD *link;
};

void print(NOD *head)
{
  NOD *iter=head;
  while(iter!=NULL)
  {
    cout << iter->info<<", ";
    iter=iter->link;
  }
}`,
    codeLanguage: "c",
    options: {
      a: `10, 2, 8, 5, 7, 3`,
      b: `3, 7, 5, 8, 2, 10`,
      c: `2, 8, 5, 7, 3`,
      d: `2, 8, 5, 7`,
    },
    correctAnswer: "a",
  },
  {
    id: 281,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera lista inlantuita cu elemente numere intregi din Fig. 2. Data urmatoarea definitie a tipului de date ce corespunde unui nod al listei, ce va afisa urmatoarea functie, daca este apelata prin print(HEAD)?`,
    figure: "/figures/fig2.png",
    code: `struct NOD
{
  int info;
  NOD *link;
};

void print(NOD *head)
{
  NOD *iter=head;
  while(iter->link !=NULL)
  {
    cout << iter->info<<", ";
    iter=iter->link;
  }
}`,
    codeLanguage: "c",
    options: {
      a: `10, 2, 8, 5, 7, 3`,
      b: `10, 2, 8, 5, 7`,
      c: `2, 8, 5, 7, 3, 10`,
      d: `2, 8, 5, 7`,
    },
    correctAnswer: "b",
  },
  {
    id: 282,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se considera lista inlantuita cu elemente numere intregi din Fig. 2. Data urmatoarea definitie a tipului de date ce corespunde unui nod al listei, ce va afisa urmatoarea functie, daca este apelata prin print(HEAD)?`,
    figure: "/figures/fig2.png",
    code: `struct NOD
{
  int info;
  NOD *link;
};

void print(NOD *head)
{
  NOD *iter=head;
  while(iter->link !=NULL)
  {
    iter=iter->link;
    if ((iter-> info)%2) cout << iter->info<<", ";
  }
}`,
    codeLanguage: "c",
    options: {
      a: `10, 2, 8, 5, 7, 3`,
      b: `10, 3, 7, 5, 8, 2`,
      c: `2, 8, 5, 7, 3`,
      d: `5, 7, 3`,
    },
    correctAnswer: "d",
  },
  {
    id: 283,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatoarea functie. Daca vectorul x = (9, 15, 23, 25, 4, 5, 8), care va fi vectorul C la apelarea functiei interclasare (x, 0, 3, 6, C)?`,
    code: `void interclasare(int x[], int prim, int mijloc, int ultim, int C[])
{
  // lista A: x[prim ..mijloc]
  // lista B: x[mijloc+1 ..ultim]
  // lista C: C[0.. ultim - prim]
  int iterA = prim, iterB = mijloc+1, iterC = 0;
  while (iterA <= mijloc && iterB <=ultim)
    if (x[iterA] < x[iterB])
      C[iterC ++]= x[iterA ++];
    else  C[iterC ++]= x[iterB ++];
  while (iterA <= mijloc)
    C[iterC ++]= x[iterA ++];
  while (iterB <= ultim)
    C[iterC ++]= x[iterB ++];
}`,
    codeLanguage: "c",
    options: {
      a: `4, 5, 8, 9, 15, 23, 25`,
      b: `0, 0, 0, 0, 0, 0, 0`,
      c: `9, 4, 15, 5, 23, 8, 25`,
      d: `9, 15, 23, 25, 4, 5, 8`,
    },
    correctAnswer: "a",
  },
  {
    id: 284,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatoarea functie, care apeleaza functia interclasare descrisa la exercitiul 29. La apelul functiei mergesort(x, 0, 6) unde vectorul x = (9, 15, 23, 2, 4, 5, 8), de cate ori va fi apelata functia mergesort (incluzand apelul initial)?`,
    code: `void mergesort(int x[], int prim, int ultim)
{
  if (prim < ultim)
  {
    int mijloc = (prim + ultim)/2;
    mergesort(x, prim, mijloc);
    mergesort(x, mijloc + 1, ultim);
    int C[ultim - prim +1];
    interclasare(x, prim, mijloc, ultim, C);
    for (int i = prim; i <= ultim; i++)
      x[i]=C[i-prim];
  }
}`,
    codeLanguage: "c",
    options: {
      a: `1`,
      b: `3`,
      c: `13`,
      d: `7`,
    },
    correctAnswer: "c",
  },
  {
    id: 285,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de sortare prin inserare este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O (n)`,
      b: `O(n2)`,
      c: `O(n log n)`,
      d: `O(n3)`,
    },
    correctAnswer: "b",
  },
  {
    id: 286,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de cautare secventiala este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O (n)`,
      b: `O(n2)`,
      c: `O(n log n)`,
      d: `O(log n)`,
    },
    correctAnswer: "a",
  },
  {
    id: 287,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `O lista liniara in care inserarile si stergerile in lista se fac pe la un singur capat se numeste`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `stiva`,
      b: `vector`,
      c: `coada`,
      d: `arbore`,
    },
    correctAnswer: "a",
  },
  {
    id: 288,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de sortare prin selectie este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O (n)`,
      b: `O(n2)`,
      c: `O(n log n)`,
      d: `O(n3)`,
    },
    correctAnswer: "b",
  },
  {
    id: 289,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se da urmatoarea functie in care front si rear sunt variabile globale si reprezinta pointeri la nodurile unei liste liniare reprezentate simplu inlantuit, front la primul nod al listei, iar rear pointer la ultimul nod. Ce face aceasta functie?`,
    code: `void fct(int a)
{
  nod *p = new nod;
  if (p != NULL)
  {
    p ->info = a;
    p ->link = NULL;
    if(rear!=NULL) rear->link=p;
    else front=p;
    rear = p;
  }
  else cout << "OVERFLOW"<<endl;
}`,
    codeLanguage: "c",
    options: {
      a: `Insereaza un nod la inceputul listei.`,
      b: `Insereaza un nod la sfarsitul listei.`,
      c: `Sterge nodul de la inceputul listei.`,
      d: `Sterge nodul de la sfarsitul listei.`,
    },
    correctAnswer: "b",
  },
  {
    id: 290,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rau caz pentru algoritmul de sortare prin inserare este cazul in care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul este deja sortat`,
      b: `vectorul contine elemente nule`,
      c: `vectorul este descrescator si se doreste sortarea lui in ordine crescatoare`,
      d: `vectorul contine si elemente negative`,
    },
    correctAnswer: "c",
  },
  {
    id: 291,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai bun caz pentru algoritmul de sortare prin inserare este cazul in care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul este deja sortat in ordinea dorita`,
      b: `vectorul nu este creat aleator`,
      c: `vectorul este descrescator si se doreste sortarea lui in ordine crescatoare`,
      d: `vectorul contine si elemente negative`,
    },
    correctAnswer: "a",
  },
  {
    id: 292,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Numarul minim de comparatii intre elementele unui vector cu n elemente care este sortat cu algoritmul de sortare prin inserare este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `n`,
      b: `n+1`,
      c: `n-1`,
      d: `log n.`,
    },
    correctAnswer: "c",
  },
  {
    id: 293,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Numarul minim de comparatii intre elementele unui vector cu n elemente care este sortat cu algoritmul de sortare prin metoda bulelor (Bubblesort) este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `n-1`,
      b: `n+1`,
      c: `n`,
      d: `n log n.`,
    },
    correctAnswer: "a",
  },
  {
    id: 294,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Numarul maxim de comparatii intre elementele unui vector cu n elemente care este sortat cu algoritmul de sortare prin metoda bulelor (Bubblesort) este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `n!`,
      b: `n(n+1)/2`,
      c: `n(n-1)/2`,
      d: `n log n.`,
    },
    correctAnswer: "c",
  },
  {
    id: 295,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cate comparatii se fac daca se foloseste algoritmul de cautare secventiala pentru cautarea elementului 9 in vectorul (8, 3, 5, 9, 11, 2)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6`,
      b: `5`,
      c: `3`,
      d: `4`,
    },
    correctAnswer: "d",
  },
  {
    id: 296,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cate comparatii se fac daca se foloseste algoritmul de cautare binara pentru cautarea elementului 19 in vectorul (1, 2, 3, 5, 8, 9, 19)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6`,
      b: `5`,
      c: `3`,
      d: `O(log 7)`,
    },
    correctAnswer: "c",
  },
  {
    id: 297,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Daca se aplicam metoda bulelor (bubblesort) pentru sortarea vectorului x = (9, 15, 23, 25, 4, 8, 5), cum se va modifica vectorul x dupa prima parcurgere a sa?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4, 5, 8, 9, 15, 23, 25`,
      b: `9, 15, 23, 4, 8, 5, 25`,
      c: `9, 4, 15, 5, 23, 8, 25`,
      d: `9, 15, 23, 25, 4, 5, 8`,
    },
    correctAnswer: "b",
  },
  {
    id: 298,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Daca se aplicam metoda bulelor (bubblesort) pentru sortarea vectorului x = (9, 15, 23, 25, 4, 8, 5), cum se va modifica vectorul x dupa doua parcurgeri ale sale?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4, 5, 8, 9, 15, 23, 25`,
      b: `9, 15, 4, 8, 5, 23, 25`,
      c: `9, 4, 15, 5, 23, 8, 25`,
      d: `9, 15, 23, 25, 4, 5, 8`,
    },
    correctAnswer: "b",
  },
  {
    id: 299,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Daca se aplicam sortarea prin inserare pentru sortarea vectorului x = (9, 15, 23, 25, 4, 8, 5), care este primul element al vectorului a carui analiza va implica efectuarea de modificari asupra vectorului?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `15`,
      b: `23`,
      c: `25`,
      d: `4`,
    },
    correctAnswer: "d",
  },
  {
    id: 300,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Care din urmatoarele afirmatii sunt adevarate?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `La aplicarea algoritmului de sortare rapida elementul din mijloc este mutat pe prima pozitie.`,
      b: `La aplicarea algoritmului de sortare rapida elementul de pe prima pozitie este mutat pe pozitia din mijloc.`,
      c: `La aplicarea algoritmului de sortare rapida se alege un element din lista, numit pivot si se rearanjeza lista, prin interschimbari, inclusiv prin mutarea pivotului pe o alta pozitie, astfel incat toate elementele mai mici decat pivotul sa fie pozitionate inaintea lui, iar toate elementele mai mari sa fie pozitionate dupa acesta.`,
      d: `La aplicarea algoritmului de sortare rapida nu se alege niciun element pivot.`,
    },
    correctAnswer: "c",
  },
  {
    id: 301,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Care din urmatoarele afirmatii sunt adevarate?`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig1.png",
    options: {
      a: `Arborele din figura Fig. 3 este vid.`,
      b: `Arborele din figura Fig. 3 nu este un arbore binar.`,
      c: `Arborele din figura Fig. 3 este un arbore binar de cautare.`,
      d: `Arborele din figura Fig. 3 nu este un arbore binar de cautare.`,
    },
    correctAnswer: "c",
  },
  {
    id: 302,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in preordine a arborelui din Fig. 4 va afisa`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig3.png",
    options: {
      a: `/, +, 50, *, 25, 3, 8, -, 3`,
      b: `/, 50, +, *, 3, 25, 8, -, 3`,
      c: `50, +, 25, *, 3, 8, -, 3, /`,
      d: `/, +, 50, *, 25, 3, -, 8, 3`,
    },
    correctAnswer: "d",
  },
  {
    id: 303,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in inordine a arborelui din Fig. 4 va afisa`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig3.png",
    options: {
      a: `/, +, 50, *, 25, 3, 8, -, 3`,
      b: `50, +, 25, *, 3, /, 8, -, 3`,
      c: `50, +, 25, *, 3, 8, -, 3, /`,
      d: `50, /, +, *, 25, 3, -, 8, 3`,
    },
    correctAnswer: "b",
  },
  {
    id: 304,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in postordine a arborelui din Fig. 4 va afisa`,
    code: undefined,
    codeLanguage: undefined,
    figure: "/figures/fig3.png",
    options: {
      a: `50, 25, 3, *, +, 8, 3, -, /`,
      b: `/, 50, +, *, 3, 25, 8, -, 3`,
      c: `50, +, 25, *, 3, 8, -, 3, /`,
      d: `/, +, 50, *, 25, 3, -, 8, 3`,
    },
    correctAnswer: "a",
  },
];
