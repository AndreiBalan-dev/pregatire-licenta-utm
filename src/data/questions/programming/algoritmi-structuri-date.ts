import type { Question } from "@/data/types";

export const algoritmiStructuriDate: Question[] = [
  {
    id: 250,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următorul algoritm: 
for i = 1, n 
 
      
poz[i] = 1 
endfor 
for i = 1, n-1 
 
for j = i+1, n 
 
 
if x[j] < x[i] then poz[i] = poz[i] + 1 
 
 
 
 
         else poz[j] = poz[j] + 1 
    
 
endif 
 
endfor 
endfor  
Știind că datele de intrare sunt n = 7 și vectorul x = (9, 15, 23, 2, 5, 4, 8) care vor fi valorile 
vectorului poz la sfârșitul algoritmului?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(5, 6, 7, 1, 2, 3, 4)`,
      b: `(6, 5, 7, 1, 2, 3, 4)`,
      c: `(5, 6, 7, 1, 3, 2, 4)`,
      d: `(1, 2, 3, 4, 5, 6, 7)`,
    },
    correctAnswer: "a",
  },
  {
    id: 251,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următoarea funcție recursivă 
1)  int inaltime(NodArb *rad)  
2) // returneaza inaltimea unui arbore binar  
3) { 
4)  
if(rad == NULL) return 0; 
5)  
............................................................................................... 
6)  
return 1 + max(inaltime(rad->stang), inaltime(rad->drept)); 
7)  
 
8) } 
Ce instrucțiuni trebuie scrise în linia de cod 5) pentru ca funcția să returneze înălțimea unui arbore 
binar?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `instrucțiunea vidă`,
      b: `int inaltime =0;`,
      c: `else`,
      d: `else if(rad->stang == NULL && rad->drept == NULL) return 0;`,
    },
    correctAnswer: "a",
  },
  {
    id: 252,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următoarea funcție 
int cautare(int x[], int first, int last, int value)   
{   int mid; 
     if(first > last) return -1; 
     mid = (first + last) / 2;   
     if (x[mid] == value) return mid; 
     if(x[mid] < value) return cautare(x, mid + 1, last, value); 
     else return cautare(x, first, mid - 1, value);     
} 
Dacă vectorul x = (2, 4, 5, 8, 9, 15, 23), care va fi rezultatul apelării funcției cautare (x, 2, 6, 8) ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `2`,
      b: `-1`,
      c: `3`,
      d: `1`,
    },
    correctAnswer: "b",
  },
  {
    id: 253,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea în preordine a arborelui binar din Fig. 1 va afișa 
 
 
Fig. 1`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `10, 4, 1, 9, 21, 15, 28, 23`,
      b: `10, 4, 1, 9, 21, 15, 23, 28`,
      c: `10, 4, 1, 9, 23, 21, 28, 15`,
      d: `1, 4, 9, 10, 15, 21, 23, 28`,
    },
    correctAnswer: "a",
  },
  {
    id: 254,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea în inordine a arborelui binar din Fig. 1 va afișa`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1, 4, 9, 10, 15, 21, 28, 23`,
      b: `1, 4, 9, 10, 21, 23, 28, 15`,
      c: `1, 4, 9, 10, 15, 21, 23, 28`,
      d: `10, 4, 1, 9, 21, 15, 23, 28`,
    },
    correctAnswer: "d",
  },
  {
    id: 255,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea în postordine a arborelui binar din Fig. 1 va afișa`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1, 9, 4, 15, 23, 28, 21, 10`,
      b: `1, 4, 9, 10, 15, 21, 28, 23`,
      c: `1, 4, 9, 10, 15, 21, 23, 28`,
      d: `1, 9, 4, 15, 28, 23, 21, 10`,
    },
    correctAnswer: "c",
  },
  {
    id: 256,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ce returnează următoarea funcție dacă rad este pointer la rădăcina unui arbore binar nenul?  
int fct(NodArb *rad)  
{ 
 
if(rad == NULL)  return 0; 
 
return 1 + fct(rad->stang) + fct(rad->drept); 
}`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1`,
      b: `numărul de noduri ale arborelui.`,
      c: `0`,
      d: `numărul de noduri terminale ale arborelui`,
    },
    correctAnswer: "c",
  },
  {
    id: 257,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului Bubblesort (metoda bulelor) este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O(n2)`,
      b: `O (n)`,
      c: `O(n log n)`,
      d: `O(n3)`,
    },
    correctAnswer: "b",
  },
  {
    id: 258,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rău caz pentru algoritmul de sortare rapidă este cazul în care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul conține și elemente negative`,
      b: `vectorul nu este creat aleator`,
      c: `vectorul este deja sortat`,
      d: `toate elementele vectorului sunt pare`,
    },
    correctAnswer: "c",
  },
  {
    id: 259,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Câte comparații se fac dacă se folosește algoritmul de căutare secvențială pentru căutarea 
elementului 12 în vectorul (2, 3, 6, 9, 10, 25)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1`,
      b: `5`,
      c: `6`,
      d: `3`,
    },
    correctAnswer: "c",
  },
  {
    id: 260,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Câte comparații se fac dacă se folosește algoritmul de căutare binară pentru căutarea elementului 12 
în vectorul (2, 3, 6, 9, 10, 25)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `3`,
      b: `1`,
      c: `5`,
      d: `6`,
    },
    correctAnswer: "d",
  },
  {
    id: 261,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `O listă liniară în care inserările în lista se fac pe la un capăt, iar ștergerile pe la celălalt capăt se 
numește`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `arbore`,
      b: `vector`,
      c: `coadă`,
      d: `stivă`,
    },
    correctAnswer: "d",
  },
  {
    id: 262,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Care din următorii algoritmi au ordinul de complexitate O(n log n)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `sortarea prin inserare`,
      b: `sortarea prin selecție`,
      c: `Quicksort(sortarea rapidă).`,
      d: `Bubblesort (sortarea cu metoda bulelor)`,
    },
    correctAnswer: "d",
  },
  {
    id: 263,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rău caz pentru algoritmul de căutare secvențială este cazul în care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `elementul căutat este pe ultima poziție în listă`,
      b: `elementul căutat este la mijlocul listei`,
      c: `vectorul este ordonat crescator`,
      d: `elementul căutat este pe prima poziție în listă`,
    },
    correctAnswer: "b",
  },
  {
    id: 264,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Timpul de execuție al unui algoritm se măsoară în`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `numărul de milisecunde necesar executării.`,
      b: `numărul de instrucțiuni ale algoritmului`,
      c: `numărul de kilocteți necesari`,
      d: `numărul de operații cheie executate`,
    },
    correctAnswer: "c",
  },
  {
    id: 265,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de căutare binară este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O(log n)`,
      b: `O(n)`,
      c: `O(n log n)`,
      d: `O(n2)`,
    },
    correctAnswer: "b",
  },
  {
    id: 266,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `O problemă se poate rezolva prin trei algoritmi, unul cu ordinul de complexitate O(n), altul cu 
ordinul O(log n) și al treilea cu ordinul O(n log n). Care este cel mai bun? 

 
 
4`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel cu ordinul O(n)`,
      b: `cel cu ordinul O(log n)`,
      c: `cel cu ordinul O(n log n)`,
      d: `Toate sunt la fel.`,
    },
    correctAnswer: "a",
  },
  {
    id: 267,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următorul algoritm: 
for i = 1, n -1 
      index_min = i 
      for j =  i + 1, n 
            if x[index_min] > x[j] then index_min = j 
            endif 
      endfor 
      if i  index_min then  
                            temp=x[i] 
                            x[i]=x[index_min] 
                            x[index_min]=temp 
     endif 
endfor 
 
Care vor fi valorile vectorului x după terminarea pasului i = 3 știind că la intrare avem valorile n = 7 
și vectorul x = (9, 15, 23, 2, 5, 4, 8)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(2, 4, 5, 9, 23, 15, 8)`,
      b: `(2, 4, 5, 9, 15, 23, 8)`,
      c: `(2, 5, 9, 15, 23, 4, 8)`,
      d: `(2, 5, 9, 15, 4, 23, 8)`,
    },
    correctAnswer: "b",
  },
  {
    id: 268,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următorul algoritm. Care vor fi valorile vectorului x după terminarea pasului i = 5, știind că la 
intrare avem valorile n = 7 și x = (9, 15, 23, 2, 5, 4, 8)? 
for i = 2, n 
 
elem = x[i] 
            j = i -1 
 
while j >= 1 and  x[j] > x[i] 
 
 
j = j –1 
             endwhile 
 
pozitie = j +1 
 
for j= i, pozitie+1, -1 
 
 
x[j] = x[j -1] 
 
endfor 
 
x[pozitie] = elem 
endfor`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(2, 4, 5, 8, 9, 15, 23)`,
      b: `(2, 5, 9, 15, 4, 23, 8)`,
      c: `(2, 4, 5, 9, 15, 23, 8)`,
      d: `(2, 5, 9, 15, 23, 4, 8)`,
    },
    correctAnswer: "c",
  },
  {
    id: 269,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră următoarea secvență de operații într-o stivă: push(2), push(10), push(8), pop(), push(9), 
push(6), pop(), pop(), push(7), push(3), pop(), pop(), pop(), pop(). În ce ordine vor fi scoase din stivă 
elementele? (push = inserare, pop = ștergere)`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(6, 9, 3, 7, 8, 10, 2)`,
      b: `(2, 10, 8, 9, 6, 7, 3)`,
      c: `(3, 7, 6, 9, 8, 10, 2)`,
      d: `(8, 6, 9, 3, 7, 10, 2)`,
    },
    correctAnswer: "b",
  },
  {
    id: 270,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră următoarea secvență de operații într-o coadă: enqueue(2), enqueue(10), enqueue(8), 
dequeue(), enqueue(9), enqueue(6), dequeue(), dequeue(), enqueue(7), enqueue(3), dequeue(), 
dequeue(),dequeue(), dequeue(). În ce ordine vor fi scoase din coadă elementele? (enqueue = 
inserare, dequeue = ștergere)`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(2, 10, 8, 9, 6, 7, 3)`,
      b: `(6, 9, 3, 7, 8, 10, 2)`,
      c: `(8, 6, 9, 3, 7, 10, 2)`,
      d: `(3, 7, 6, 9, 8, 10, 2)`,
    },
    correctAnswer: "a",
  },
  {
    id: 271,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră următoarea funcție care caută o valoare dată într-o listă înlănțuită. val este variabila a 
cărei valoare este căutată, iar head este un pointer la capul listei în care se face căutarea. 
1) NOD *cauta(NOD *head, int val) 
2) { 
3)     NOD *iter = head; int gasit=0; 
4)     while (.......................) 
5)     { 
6)       if (iter -> info == val) gasit = 1; 
7)       else iter = iter -> link; 
8)      } 
9)     if(gasit) return iter; 
10)     else return NULL; 
11) } 
Cum trebuie completată linia de cod  4 astfel încât funcția să ruleze corect și să returneze un pointer la 
nodul cu valoarea căutată sau NULL dacă valoarea nu a fost găsită în listă?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `1) NOD *cauta(NOD *head, int val) 
2) { 
3)     NOD *iter = head; int gasit=0; 
4)     while (.......................) 
5)     { 
6)       if (iter -> info == val) gasit = 1; 
7)       else iter = iter -> link; 
8)      } 
9)     if(gasit) return iter; 
10)     else return NULL; 
11) } 
Cum trebuie completată linia de cod  4 astfel încât funcția să ruleze corect și să returneze un pointer la 
nodul cu valoarea căutată sau NULL dacă valoarea nu a fost găsită în listă?  
a. iter != NULL`,
      b: `gasit ==0`,
      c: `!gasit`,
      d: `iter!=NULL && !gasit`,
    },
    correctAnswer: "a",
  },
  {
    id: 272,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră următoarea funcție care are drept variabilă de intrare un pointer la capul unei liste 
înlănțuite nevide. Ce face această funcție?  
1) NOD   *fct(NOD *head) 
2) { 
3)      if (head == NULL)  return NULL; 
4)      head = head  -> link; 
5)      return head; 
6) }`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `returnează NULL`,
      b: `returnează un pointer la capul listei`,
      c: `returnează pointer la ultimul nod al listei`,
      d: `elimină primul nod al listei și returnează un pointer la noul cap al listei`,
    },
    correctAnswer: "a",
  },
  {
    id: 273,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rău caz pentru algoritmul de sortare prin selecție este cazul în care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel mai mare element al vectorului se află în prima poziție în vector`,
      b: `nu există un cel mai rău caz`,
      c: `vectorul este ordonat crescător`,
      d: `vectorul este ordonat descrescător`,
    },
    correctAnswer: "d",
  },
  {
    id: 274,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai bun caz pentru algoritmul de sortare prin metoda bulelor (Bubblesort) este cazul în care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `nu există un cel mai bun caz`,
      b: `cel mai mare element al vectorului se află în ultima poziție în vector`,
      c: `cel mai mic element al vectorului se află pe prima poziție în vector`,
      d: `vectorul este ordonat crescător`,
    },
    correctAnswer: "c",
  },
  {
    id: 275,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră lista înlănțuită cu elemente numere întregi din Fig. 2: 
 
Fig. 2 
Dată următoarea definiție a tipului de date ce corespunde unui nod al listei,  
struct NOD 
 { 
   
 
int info; 
   
 
NOD *link; 
 };`,
    code: `ce va afișa următoarea funcție, dacă este apelată prin print(HEAD)? 
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
      a: `3, 7, 5, 8, 2, 10`,
      b: `2, 8, 5, 7`,
      c: `10, 2, 8, 5, 7, 3`,
      d: `2, 8, 5, 7, 3`,
    },
    correctAnswer: "c",
  },
  {
    id: 276,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră lista înlănțuită cu elemente numere întregi din Fig. 2.  
Dată următoarea definiție a tipului de date ce corespunde unui nod al listei,  
struct NOD 
 { 
   
 
int info; 
   
 
NOD *link; 
 };`,
    code: `ce va afișa următoarea funcție, dacă este apelată prin print(HEAD)? 

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
      a: `2, 8, 5, 7`,
      b: `2, 8, 5, 7, 3, 10`,
      c: `10, 2, 8, 5, 7`,
      d: `10, 2, 8, 5, 7, 3`,
    },
    correctAnswer: "d",
  },
  {
    id: 277,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se consideră lista înlănțuită cu elemente numere întregi din Fig. 2.  
Dată următoarea definiție a tipului de date ce corespunde unui nod al listei,  
struct NOD 
 { 
   
 
int info; 
   
 
NOD *link; 
 };`,
    code: `ce va afișa următoarea funcție, dacă este apelată prin print(HEAD)? 
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
      c: `5, 7, 3`,
      d: `2, 8, 5, 7, 3`,
    },
    correctAnswer: "a",
  },
  {
    id: 278,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următoarea funcție  
Dacă vectorul x = (9, 15, 23, 25, 4, 5, 8), care va fi vectorul C la apelarea funcției interclasare (x, 0, 
3, 6, C)?`,
    code: `void interclasare(int x[], int prim, int mijloc, int  ultim, int C[]) 
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
      a: `0, 0, 0, 0, 0, 0, 0`,
      b: `9, 15, 23, 25, 4, 5, 8`,
      c: `4, 5, 8, 9, 15, 23, 25`,
      d: `9, 4, 15, 5, 23, 8, 25`,
    },
    correctAnswer: "c",
  },
  {
    id: 279,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următoarea funcție, care apelează funcția interclasare descrisă la exercițiul 29. 
La apelul funcției  mergesort(x, 0, 6) unde vectorul x = (9, 15, 23, 2, 4, 5, 8), de câte ori va fi apelată 
funcția mergesort (incluzând apelul inițial)?`,
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
      a: `13`,
      b: `7`,
      c: `1`,
      d: `3`,
    },
    correctAnswer: "c",
  },
  {
    id: 280,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de sortare prin inserare este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O(n2)`,
      b: `O(n3)`,
      c: `O (n)`,
      d: `O(n log n)`,
    },
    correctAnswer: "c",
  },
  {
    id: 281,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de căutare secvențială este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O(n2)`,
      b: `O(log n)`,
      c: `O (n)`,
      d: `O(n log n)`,
    },
    correctAnswer: "c",
  },
  {
    id: 282,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `O listă liniară în care inserările și ștergerile în lista se fac pe la un singur capăt se numește`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vector`,
      b: `coadă`,
      c: `arbore`,
      d: `stivă`,
    },
    correctAnswer: "d",
  },
  {
    id: 283,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Ordinul de complexitate a algoritmului de sortare prin selecție este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O (n)`,
      b: `O(n log n)`,
      c: `O(n3)`,
      d: `O(n2)`,
    },
    correctAnswer: "a",
  },
  {
    id: 284,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Se dă următoarea funcție în care front și rear sunt variabile globale și reprezintă pointeri la nodurile 
unei liste liniare reprezentate simplu înlănțuit, front la primul nod al listei, iar rear pointer la ultimul 
nod. 
Ce face această funcție?`,
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
      a: `Inserează un nod la sfârșitul listei.`,
      b: `Inserează un nod la începutul listei.`,
      c: `Șterge nodul de la sfârșitul listei.`,
      d: `Șterge nodul de la începutul listei.`,
    },
    correctAnswer: "b",
  },
  {
    id: 285,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai rău caz pentru algoritmul de sortare prin inserare este cazul în care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul este descrescător și se dorește sortarea lui în ordine crescătoare`,
      b: `vectorul este deja sortat`,
      c: `vectorul conține și elemente negative`,
      d: `vectorul conține elemente nule`,
    },
    correctAnswer: "b",
  },
  {
    id: 286,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Cel mai bun caz pentru algoritmul de sortare prin inserare este cazul în care`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `vectorul conține și elemente negative`,
      b: `vectorul este descrescător și se dorește sortarea lui în ordine crescătoare`,
      c: `vectorul nu este creat aleator`,
      d: `vectorul este deja sortat în ordinea dorită`,
    },
    correctAnswer: "d",
  },
  {
    id: 287,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Numărul minim de comparații între elementele unui vector cu n elemente care este sortat cu 
algoritmul de sortare prin inserare este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `log n.`,
      b: `n-1`,
      c: `n+1`,
      d: `n`,
    },
    correctAnswer: "d",
  },
  {
    id: 288,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Numărul minim de comparații între elementele unui vector cu n elemente care este sortat cu 
algoritmul de sortare prin metoda bulelor (Bubblesort)  este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `n log n.`,
      b: `n`,
      c: `n-1`,
      d: `n+1`,
    },
    correctAnswer: "c",
  },
  {
    id: 289,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Numărul maxim de comparații între elementele unui vector cu n elemente care este sortat cu 
algoritmul de sortare prin metoda bulelor (Bubblesort)  este`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `n!`,
      b: `n log n.`,
      c: `n(n-1)/2`,
      d: `n(n+1)/2`,
    },
    correctAnswer: "a",
  },
  {
    id: 290,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Câte comparații se fac dacă se folosește algoritmul de căutare secvențială pentru căutarea 
elementului 9 în vectorul (8, 3, 5, 9, 11, 2)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `5`,
      b: `3`,
      c: `4`,
      d: `6`,
    },
    correctAnswer: "d",
  },
  {
    id: 291,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Câte comparații se fac dacă se folosește algoritmul de căutare binară pentru căutarea elementului19 
în vectorul (1, 2, 3, 5, 8, 9, 19)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `5`,
      b: `3`,
      c: `O(log 7)`,
      d: `6`,
    },
    correctAnswer: "d",
  },
  {
    id: 292,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Dacă se aplicăm metoda bulelor (bubblesort) pentru sortarea vectorului x = (9, 15, 23, 25, 4, 8, 5), 
cum se va modifica vectorul x după prima parcurgere a sa?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `9, 4, 15, 5, 23, 8, 25`,
      b: `9, 15, 23, 25, 4, 5, 8`,
      c: `9, 15, 23, 4, 8, 5, 25`,
      d: `4, 5, 8, 9, 15, 23, 25`,
    },
    correctAnswer: "d",
  },
  {
    id: 293,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Dacă se aplicăm metoda bulelor (bubblesort) pentru sortarea vectorului x = (9, 15, 23, 25, 4, 8, 5), 
cum se va modifica vectorul x după două parcurgeri ale sale?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `9, 15, 23, 25, 4, 5, 8`,
      b: `9, 4, 15, 5, 23, 8, 25`,
      c: `9, 15, 4, 8, 5, 23, 25`,
      d: `4, 5, 8, 9, 15, 23, 25`,
    },
    correctAnswer: "d",
  },
  {
    id: 294,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Dacă se aplicăm sortarea prin inserare pentru sortarea vectorului x = (9, 15, 23, 25, 4, 8, 5), care este 
primul element al vectorului a cărui analiză va implica efectuarea de modificări asupra vectorului?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `23`,
      b: `15`,
      c: `4`,
      d: `25`,
    },
    correctAnswer: "b",
  },
  {
    id: 295,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Care din următoarele afirmații sunt adevărate?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `La aplicarea algoritmului de sortare rapidă se alege un element din listă, numit pivot și se 
rearanjează lista, prin interschimbări, inclusiv prin mutarea pivotului pe o altă poziție, astfel încât 
toate elementele mai mici decât pivotul să fie poziționate inaintea lui, iar toate elementele mai 
mari să fie poziționate după acesta.`,
      b: `La aplicarea algoritmului de sortare rapidă elementul din mijloc este mutat pe prima poziție.`,
      c: `La aplicarea algoritmului de sortare rapidă elementul de pe prima poziție este mutat pe poziția din mijloc.`,
      d: `La aplicarea algoritmului de sortare rapidă nu se alege niciun element pivot.`,
    },
    correctAnswer: "b",
  },
  {
    id: 296,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Care din următoarele afirmații sunt adevărate? 
 
 
Fig. 3`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Arborele din figura Fig. 3 este vid.`,
      b: `Arborele din figura Fig. 3 este un arbore binar de căutare.`,
      c: `Arborele din figura Fig. 3 nu este un arbore binar de căutare.`,
      d: `Arborele din figura Fig. 3 nu este un arbore binar.`,
    },
    correctAnswer: "a",
  },
  {
    id: 297,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in preordine a arborelui din Fig. 4 va afișa 
 
 
Fig. 4`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `50, +, 25, *, 3, 8, -, 3, /`,
      b: `/, +, 50, *, 25, 3, -, 8, 3`,
      c: `/, +, 50, *, 25, 3, 8, -, 3`,
      d: `/, 50, +, *, 3, 25, 8, -, 3`,
    },
    correctAnswer: "c",
  },
  {
    id: 298,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in inordine a arborelui din Fig. 4 va afișa`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `50, /, +, *, 25, 3, -, 8, 3`,
      b: `50, +, 25, *, 3, 8, -, 3, /`,
      c: `/, +, 50, *, 25, 3, 8, -, 3`,
      d: `50, +, 25, *, 3, /, 8, -, 3`,
    },
    correctAnswer: "c",
  },
  {
    id: 299,
    moduleId: "programming",
    subjectId: "algoritmi-structuri-date",
    text: `Parcurgerea in postordine a arborelui din Fig. 4 va afișa`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `50, +, 25, *, 3, 8, -, 3, /`,
      b: `/, 50, +, *, 3, 25, 8, -, 3`,
      c: `50, 25, 3, *, +, 8, 3, -, /`,
      d: `/, +, 50, *, 25, 3, -, 8, 3`,
    },
    correctAnswer: "c",
  },
];
