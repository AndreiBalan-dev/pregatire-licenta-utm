import type { Question } from "@/data/types";

export const tehniciAvansate: Question[] = [
  {
    id: 201,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Complexitatea minimă a unui algoritm care calculează numărul tuturor submulțimilor 
unei mulțimi cu 𝑛 elemente este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `𝒪(𝑛2)`,
      b: `𝒪(𝑛)`,
      c: `𝒪(2𝑛)`,
      d: `𝒪(𝑛!)`,
    },
    correctAnswer: "a",
  },
  {
    id: 202,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Complexitatea minimă a unui algoritm care afişează toate submulțimile unei mulțimi cu 
𝑛 elemente este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `𝒪(𝑛!)`,
      b: `𝒪(𝑛2)`,
      c: `𝒪(𝑛)`,
      d: `𝒪(2𝑛)`,
    },
    correctAnswer: "b",
  },
  {
    id: 203,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Complexitatea minimă a unui algoritm care calculează numărul modurilor în care pot fi 
aşezate n cărți pe un raft suficient de lung este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `𝒪(𝑛!)`,
      b: `𝒪(2𝑛)`,
      c: `𝒪(𝑛)`,
      d: `𝒪(𝑛2)`,
    },
    correctAnswer: "d",
  },
  {
    id: 204,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Complexitatea  minimă a unui algoritm care afişează toate modurile în care pot fi aşezate 
n cărți pe un raft suficient de lung este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `𝒪(𝑛!)`,
      b: `𝒪(𝑛2)`,
      c: `𝒪(𝑛)`,
      d: `𝒪(2𝑛)`,
    },
    correctAnswer: "b",
  },
  {
    id: 205,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm următorul program în limbajul C: 
 
Complexitatea algoritmului implementat în acest program este:`,
    code: `#include<stdio.h> 
int main() 
{ 
 
int i,j,n,a[101]; 
 
scanf("%d",&n); 
 
for(i=0;i<n;i++) scanf("%d",&a[i]); 
 
i=0; 
 
while((i<n)&&(a[i]<0)) i++; 
 
j=n-1; 
 
while((j>=0)&&(a[j]>=0)) j--; 
 
if(i>=j) printf("1"); 
 
else printf("0");  
   return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `𝑂(𝑛)`,
      b: `𝒪(𝑛2)`,
      c: `𝒪(log2 𝑛)`,
      d: `𝒪(𝑛3)`,
    },
    correctAnswer: "b",
  },
  {
    id: 206,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm următorul program în limbajul C: 
 
Complexitatea algoritmului implementat în acest program este:`,
    code: `#include<stdio.h> 
int main() 
{ 
 
int a[100],i,j,n,s; 
 
scanf("%d",&n); 
 
for(i=0;i<n;i++) scanf("%d",&a[i]); 
 
 
i = s = 0; 
 
while(i<n) 
 
{ 
 
   j=i+1; 
 
   while((j<=n) && (a[i]==a[j])) j++; 
 
   s++; 
 
   i=j; 
 
} 
 
printf("\\n\\n%d\\n" , s); 
 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `𝒪(log2 𝑛)`,
      b: `𝑂(𝑛)`,
      c: `𝒪(𝑛2)`,
      d: `𝒪(𝑛3)`,
    },
    correctAnswer: "c",
  },
  {
    id: 207,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm următorul program în limbajul C: 
 
Programul afişează:`,
    code: `#include<stdio.h> 
int main() 
{ 
 
int i,j,n,a[101]; 
 
scanf("%d",&n); 
 
for(i=0;i<n;i++) scanf("%d",&a[i]); 
 
i=0; 
 
while((i<n)&&(a[i]<0)) i++; 
 
j=n-1; 
 
while((j>=0)&&(a[j]>=0)) j--; 
 
if(i>=j) printf("1"); 
 
else printf("0");  

   return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `1 dacă şi numai dacă toate valorile din tabloul a sunt strict negative şi 0 altfel.`,
      b: `1 dacă şi numai dacă toate valorile din tabloul a sunt pozitive şi 0 altfel;`,
      c: `1 dacă şi numai dacă tabloul a este sortat crescător şi 0 altfel;`,
      d: `1 dacă şi numai dacă în tabloul a valorile negative se află înaintea celor pozitive şi 0 altfel;`,
    },
    correctAnswer: "c",
  },
  {
    id: 208,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm următorul program în limbajul C: 
 
Presupunând că tabloul 𝑎 este ordonat crescător, precizați ce afişează programul dat:`,
    code: `#include<stdio.h> 
int main() 
{ 
 
int a[100],i,j,n,s; 
 
scanf("%d",&n); 
 
for(i=0;i<n;i++) scanf("%d",&a[i]); 
 
 
i = s = 0; 
 
while(i<n) 
 
{ 
 
   j=i+1; 
 
   while((j<=n) && (a[i]==a[j])) j++; 
 
   s++; 
 
   i=j; 
 
} 
 
printf("\\n\\n%d\\n" , s); 
 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `lungimea maximă a unui subşir din tabloul 𝑎 format din valori egale.`,
      b: `numărul valorilor distincte din tabloul 𝑎;`,
      c: `lungimea maximă a unei secvenţe din tabloul 𝑎 formată din valori egale;`,
      d: `numărul secvenţelor strict crescătoare din tabloul 𝑎;`,
    },
    correctAnswer: "b",
  },
  {
    id: 209,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următoarea funcţie recursivă, scrisă în limbajul C: 
 
int F(int n) 
{  
if (n==0) return 0;   
else  
   
 if ((n%10)>F(n/10)) return n%10; 
     else return F(n/10);   
}  
 
Ce valoare va returna funcția după apelul 𝐹(38423)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4`,
      b: `3`,
      c: `2`,
      d: `8`,
    },
    correctAnswer: "b",
  },
  {
    id: 210,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următorul program în limbajul C: 
 
Ce afişează programul de mai sus?`,
    code: `#include<stdio.h> 
int F(int v[],int n)  
{    
 
if(n==0) return v[0];     
 
else      
 
 
if(v[n]<0) return F(v,n-1);       
 
 
else return v[n]+F(v,n-1);  
}   
int main() 
{ 
 
int i,v[10]; 
 
for(i=0;i<10;i++) 
 
 
if(i%2==0) v[i]=i; 
 
 
else v[i]=-i; 
 
printf("%d",F(v,9)); 
 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `0`,
      b: `20`,
      c: `-20`,
      d: `-5`,
    },
    correctAnswer: "c",
  },
  {
    id: 211,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următoarea funcţie recursivă, scrisă în limbajul C: 
 
int f(int n) 
{  
 
if (n==0) return 1;  
 
else return(((n%10)%2 == 0) && (f(n/10)!=0)); 
} 
 
Ce valoare va returna funcția după apelul 𝑓(6904)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4`,
      b: `0`,
      c: `9`,
      d: `6`,
    },
    correctAnswer: "a",
  },
  {
    id: 212,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următoarea funcţie recursivă, scrisă în limbajul C: 
 
int f(int x) 
{ 
if(x==0) return 0; 
   else return (f(x-1)+3*x-1); 
} 
 
Pentru ce valoare a parametrului 𝑥 funcția 𝑓 va întoarce valoarea 57?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6`,
      b: `5`,
      c: `10`,
      d: `8`,
    },
    correctAnswer: "b",
  },
  {
    id: 213,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următoarea funcţie recursivă, scrisă în limbajul C: 
 
int p(int n,int x) 
{ 
   if(x==n) return 1; 
   else 
     if(n%x==0) return 0; 
     else return p(n,x+1); 
} 
 
În urma apelului 𝑝(𝑛, 2) funcția va întoarce valoarea 1 dacă și numai dacă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `numărul natural 𝑛 este par;`,
      b: `numărul natural 𝑛 este prim;`,
      c: `numărul natural 𝑛 nu este prim;`,
      d: `numărul natural 𝑛 este impar.`,
    },
    correctAnswer: "a",
  },
  {
    id: 214,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Indicaţi care dintre următorii algoritmi nu se bazează pe tehnica de programare Divide et 
Impera:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `sortarea prin numărare.`,
      b: `sortarea prin interclasare;`,
      c: `sortarea rapidă;`,
      d: `căutarea binară;`,
    },
    correctAnswer: "c",
  },
  {
    id: 215,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Stabiliți care dintre următoarele metode de sortare se bazează pe tehnica de programare 
Divide et Impera:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `sortarea prin selecția minimului;`,
      b: `sortarea prin numărare.`,
      c: `sortarea prin interclasare;`,
      d: `Bubblesort;`,
    },
    correctAnswer: "d",
  },
  {
    id: 216,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Indicaţi care dintre următoarele metode de sortare nu are complexitatea 𝒪(𝑛log2 𝑛):`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `sortarea cu ansamble;`,
      b: `sortarea prin interclasare;`,
      c: `sortarea prin numărare.`,
      d: `sortarea rapidă;`,
    },
    correctAnswer: "d",
  },
  {
    id: 217,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm următoarele două funcții scrise în limbajul C: 
 
int a[100]; 
int max(int x,int y) 
{ 
 
if(x>y) return x; 
 
else return y; 
} 
int F(int p, int u) 
{ 
if(p==u) return a[p]; 
 
else 
 
{ 
 
 int m=(p+u)/2; 
 
 return max(F(p,m),F(m+1,u)); 
 
} 
} 
 
Ştiind că tabloul a este format din n numere naturale nenule, iar apelul subprogramului va 
fi 𝐹(0, 𝑛−1), precizați tehnica de programare utilizată în cadrul funcției 𝐹:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Greedy;`,
      b: `Divide et Impera.`,
      c: `backtracking;`,
      d: `programarea dinamică;`,
    },
    correctAnswer: "a",
  },
  {
    id: 218,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Fie 𝑣 un tablou unidimensional format din 1000000 de numere reale ordonate 
descrescător şi 𝑥 un număr real. Pentru a verifica dacă valoarea 𝑥 se găseşte sau nu în 
tabloul 𝑣, algoritmul de căutare binară va efectua:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel puţin 24 de comparaţii;`,
      b: `cel mult 24 de comparaţii;`,
      c: `nu se poate folosi algoritmul de căutare binară în acest caz.`,
      d: `exact 1000000 de comparaţii;`,
    },
    correctAnswer: "d",
  },
  {
    id: 219,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm următoarea funcție scrisă în limbajul C: 
 
int S(int a[], int p, int u) 
{ 
 
if(p>u) return 0; 
 
else 
 
{ 
 
 int m=(p+u)/2; 
 
 return a[m] + S(a,p,m-1) + S(a,m+1,u); 
 
} 
} 
 
Ştiind că tabloul a este format din n numere întregi, iar apelul subprogramului va fi 
𝑆(𝑎, 0, 𝑛−1), precizați ce va calcula funcția 𝑆:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `numărul valorilor pozitive din tabloul 𝑎;`,
      b: `valoarea elementului din mijlocul tabloului 𝑎;`,
      c: `suma valorilor din tabloul 𝑎.`,
      d: `dublul sumei valorilor din tabloul 𝑎;`,
    },
    correctAnswer: "b",
  },
  {
    id: 220,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Dacă ultima soluție afişată de algoritmul backtracking pentru generarea tuturor 
permutărilor mulțimii {1,2, … ,7} este 7,6,3,5,4,2,1, atunci următoarea soluție care va fi 
afişată este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `7,6,4,1,2,5,3`,
      b: `7,1,2,3,4,5,6`,
      c: `7,6,5,3,4,2,1`,
      d: `7,6,4,1,2,3,5`,
    },
    correctAnswer: "a",
  },
  {
    id: 221,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Dacă ultima soluție afişată de algoritmul backtracking pentru generarea tuturor 
permutărilor mulțimii {1,2,…,7} este 6,5,7,4,3,2,1, atunci următoarea soluție care va fi 
afişată este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6,7,5,4,3,2,1`,
      b: `6,7,1,2,3,4,5`,
      c: `7,6,1,2,3,4,5`,
      d: `7,1,2,3,4,5,6`,
    },
    correctAnswer: "d",
  },
  {
    id: 222,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Dacă ultima soluție afişată de algoritmul backtracking pentru generarea tuturor 
permutărilor mulțimii {1,2,…,7} este 6,7,4,5,3,2,1, atunci următoarea soluție care va fi 
afişată este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `6,1,2,3,4,5,7`,
      b: `6,5,7,1,2,3,4`,
      c: `6,7,5,1,2,3,4`,
      d: `7,1,2,3,4,5,6`,
    },
    correctAnswer: "d",
  },
  {
    id: 223,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Folosind tehnica de programare backtracking pentru a genera toate permutările mulțimii 
{1,2, . . . , 𝑛}, o soluție se memorează sub forma unui tablou unidimensional 𝑥1, 𝑥2, . . . , 𝑥𝑛. 
Dacă au fost deja generate valori pentru componentele 𝑥1, 𝑥2, . . . , 𝑥𝑘−1, iar pentru 
componenta 𝑥𝑘 (1 < 𝑘< 𝑛) au fost deja  testate  toate  valorile  posibile  şi nu a fost 
găsită  niciuna  convenabilă, atunci:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `se încearcă alegerea unei noi valori pentru 𝑥𝑘−1;`,
      b: `se încearcă alegerea unei noi valori pentru 𝑥1, oricare ar fi valoarea lui 𝑘;`,
      c: `se încearcă alegerea unei valori pentru componenta 𝑥𝑘+1.`,
      d: `se încheie algoritmul;`,
    },
    correctAnswer: "a",
  },
  {
    id: 224,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm ecuația 𝑎1𝑥1 + 𝑎2𝑥2 + ⋯+ 𝑎𝑛𝑥𝑛= 𝑦, unde 𝑎1, 𝑎2, … , 𝑎𝑛, 𝑦 sunt numere 
naturale nenule. Pentru a determina toate soluțiile ecuației de forma (𝑥1, 𝑥2, … , 𝑥𝑛), cu  
𝑥1, 𝑥2, … , 𝑥𝑛 numere naturale, se poate folosi direct algoritmul backtracking pentru:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `generarea combinărilor.`,
      b: `generarea permutărilor;`,
      c: `plata unei sume folosind 𝑛 tipuri de monede;`,
      d: `descompunerea unui număr natural ca sumă de numere naturale nenule;`,
    },
    correctAnswer: "b",
  },
  {
    id: 225,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Un algoritm optim care să afişeze toate subşirurile crescătoare de lungime maximă ale 
unui şir format din 𝑛 numere foloseşte:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `doar metoda Greedy.`,
      b: `doar metoda backtracking (se generează toate subşirurile şirului respectiv, iar pentru fiecare subşir se verifică dacă este crescător şi, respectiv, maximal);`,
      c: `mai întâi metoda programării dinamice pentru a determina lungimea maximă 𝑙𝑚𝑎𝑥 a 
unui subşir crescător al şirului dat şi apoi metoda backtracking pentru a genera toate 
subşirurile crescătoare de lungime 𝑙𝑚𝑎𝑥 ale şirului considerat;`,
      d: `doar metoda programării dinamice;`,
    },
    correctAnswer: "d",
  },
  {
    id: 226,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm că în Facultatea de Informatică sunt înscrişi 𝑛 studenți în anul III. Pentru a 
afişa toate grupele ce pot fi formate din câte 𝑝 studenți (𝑝≤𝑛) putem folosi algoritmul 
backtracking pentru:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `generarea combinărilor formate din p elemente ale unei mulțimi cu n elemente;`,
      b: `generarea aranjamentelor formate din n elemente ale unei mulțimi cu p elemente.`,
      c: `generarea aranjamentelor formate din p elemente ale unei mulțimi cu n elemente;`,
      d: `generarea permutărilor unei mulțimi cu p elemente;`,
    },
    correctAnswer: "c",
  },
  {
    id: 227,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Utilizând metoda backtracking, se generează toate descompunerile distincte ale numărului 
natural 𝑛= 10 ca sumă a cel puțin două numere naturale nenule. Care este ultima 
descompunere generată?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4 + 3 + 2 + 1`,
      b: `9 + 1`,
      c: `5 + 5`,
      d: `4 + 6`,
    },
    correctAnswer: "a",
  },
  {
    id: 228,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Utilizând metoda backtracking, se generează toate descompunerile distincte ale numărului 
natural 𝑛= 16 ca sumă a cel puțin două numere naturale nenule. Care este ultima 
descompunere generată?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `8 + 8`,
      b: `15 + 1`,
      c: `4 + 4 + 4 + 4`,
      d: `7 + 9`,
    },
    correctAnswer: "c",
  },
  {
    id: 229,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Fie 𝑆 o sumă de bani şi 𝑣1, 𝑣2, … , 𝑣𝑛 valorile a n tipuri de monede. Presupunând că din 
fiecare tip avem la dispoziţie un număr nelimitat de monede, pentru afişarea tuturor 
modalităţilor în care poate fi plătită suma 𝑆 folosind monede disponibile trebuie să 
utilizăm un algoritm bazat pe metoda:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Divide et Impera.`,
      b: `programării dinamice;`,
      c: `backtracking;`,
      d: `Greedy;`,
    },
    correctAnswer: "d",
  },
  {
    id: 230,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm  un rucsac cu ajutorul căruia putem transporta 66 kg şi 7 obiecte având 
greutățile 23, 10, 10,  25, 38, 7 şi 5 kg, iar câştigurile obținute prin transportul integral al 
fiecărui obiect la destinație sunt 69, 10, 30, 100, 19, 14 şi 50 RON. Ştiind că din orice 
obiect putem încărca şi numai o parte a sa, câştigul maxim pe care îl putem obține este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `250.5 RON`,
      b: `265 RON`,
      c: `255 RON`,
      d: `217 RON`,
    },
    correctAnswer: "a",
  },
  {
    id: 231,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm  un rucsac cu ajutorul căruia putem transporta 67 kg şi 7 obiecte având 
greutățile 10, 5, 20, 10, 20, 25 şi 21 kg, iar câştigurile obținute prin transportul integral al 
fiecărui obiect la destinație sunt 30, 40, 40, 10, 4, 50 şi 30 RON. Ştiind că din oricare 
obiect putem încărca şi numai o parte a sa, câştigul maxim pe care îl putem obține este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `163.7 RON`,
      b: `170 RON`,
      c: `114 RON`,
      d: `280 RON`,
    },
    correctAnswer: "c",
  },
  {
    id: 232,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Considerăm  un rucsac cu ajutorul căruia putem transporta 53 kg şi 7 obiecte având 
greutățile 10, 5, 18, 10, 8, 20 şi 40 kg, iar câştigurile obținute prin transportul integral al 
fiecărui obiect la destinație sunt 30, 40, 36, 10, 16, 10 şi 30 RON. Ştiind că din oricare 
obiect putem încărca şi numai o parte a sa, câştigul maxim pe care îl putem obține este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `121 RON`,
      b: `136.5 RON`,
      c: `133.5 RON`,
      d: `133 RON`,
    },
    correctAnswer: "d",
  },
  {
    id: 233,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Stabiliți care dintre următoarele propoziții referitoare la tehnica de programare Greedy 
sunt adevărate:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `găseşte toate soluțile unei probleme;`,
      b: `construieşte o soluție element cu element şi în cazul în care valoarea elementului curent nu verifică anumite condiții se renunță la acesta şi se revine la elementul anterior;`,
      c: `conduce la o soluție optimă doar în cazul în care s-a demonstrat matematic corectitudinea criteriului de selecție pe baza căruia un element din mulțimea inițială este adăugat în soluția problemei.`,
      d: `conduce întotdeauna la o soluție optimă;`,
    },
    correctAnswer: "d",
  },
  {
    id: 234,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `La un ghişeu stau la coadă 𝑛 persoane, numerotate cu 1,2, . . . , 𝑛. Cunoscând  timpii de 
servire 𝑡1, 𝑡2, … , 𝑡𝑛 ai celor 𝑛 persoane şi ştiind că pentru a servi o persoană 𝑘 trebuie 
servite persoanele 1,2, . . . , 𝑘−1 aflate înaintea sa, trebuie să determinăm un mod de 
rearanjare al persoanelor  la  coadă, astfel  încât  timpul  de  aşteptare  al  fiecărei  
persoane  să  fie  minim. Stabiliți care dintre următoarele variante de rezolvare a acestei 
probleme este corectă şi are o complexitate minimă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `se generează toate modurile în care pot fi rearanjate cele 𝑛 persoane la coadă şi pentru 
fiecare mod de rearanjare se calculează timpul total 𝑇 de servire al celor 𝑛 persoane, 
iar soluția este tabloul pentru care valoarea lui 𝑇 este minimă;`,
      b: `se generează toate modurile în care pot fi rearanjate cele 𝑛 persoane la coadă şi pentru 
fiecare mod de rearanjare se calculează într-un tablou timpii de servire, iar soluția este 
dată de tabloul minim în sens lexicografic;`,
      c: `se rearanjează persoanele în ordinea descrescătoare a timpilor de servire;`,
      d: `se rearanjează persoanele în ordinea crescătoare a timpilor de servire.`,
    },
    correctAnswer: "b",
  },
  {
    id: 235,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `La un ghişeu stau la coadă 7 persoane 𝑝1, 𝑝2, … , 𝑝7. Cunoscând timpii lor de servire 𝑡1 =
10, 𝑡2 = 6, 𝑡3 = 5, 𝑡4 = 7, 𝑡5 = 2, 𝑡6 = 8, 𝑡7 = 4 şi ştiind că pentru a servi o 
persoană trebuie servite, mai întâi, toate persoanele aflate înaintea sa, precizați care dintre 
următoarele modalități de rearanjare a persoanelor la coadă minimizează timpul mediu de 
așteptare:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `𝑝5, 𝑝7, 𝑝3, 𝑝2, 𝑝4, 𝑝6, 𝑝1`,
      b: `𝑝5, 𝑝7, 𝑝3, 𝑝4, 𝑝2, 𝑝6, 𝑝1`,
      c: `𝑝1, 𝑝6, 𝑝4, 𝑝2, 𝑝3, 𝑝5, 𝑝7`,
      d: `𝑝3, 𝑝7, 𝑝2, 𝑝1, 𝑝6, 𝑝4, 𝑝5`,
    },
    correctAnswer: "a",
  },
  {
    id: 236,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `La un ghişeu stau la coadă 7 persoane 𝑝1, 𝑝2, … , 𝑝7. Cunoscând timpii lor de servire 𝑡1 =
12,  𝑡2 = 6,  𝑡3 = 15,  𝑡4 = 15,  𝑡5 = 12,  𝑡6 = 8, 𝑡7 = 2 şi ştiind că pentru a servi o 
persoană trebuie servite, mai întâi, toate persoanele aflate înaintea sa, precizați care dintre 
următoarele modalități de rearanjare a persoanelor la coadă nu minimizează timpul mediu 
de așteptare:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `𝑝7, 𝑝2, 𝑝6, 𝑝1, 𝑝5, 𝑝4, 𝑝3`,
      b: `𝑝7, 𝑝2, 𝑝6, 𝑝5, 𝑝1, 𝑝4, 𝑝3`,
      c: `𝑝7, 𝑝2, 𝑝6, 𝑝5, 𝑝1, 𝑝3, 𝑝4`,
      d: `𝑝7, 𝑝6, 𝑝2, 𝑝5, 𝑝1, 𝑝4, 𝑝3`,
    },
    correctAnswer: "c",
  },
  {
    id: 237,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `În Aula Magna a Universității Titu Maiorescu din București se va organiza un festival de 
teatru care va dura o singură zi. Fiecare regizor a transmis organizatorului festivalului 
intervalul de timp în care se poate desfășura spectacolul său. Organizatorul festivalului 
dorește să programeze un număr maxim de spectacole. Știind că spectacolele nu se pot 
suprapune și că între oricare două spectacole consecutive nu există nicio pauză, stabiliți 
care dintre strategiile de planificare de tip Greedy de mai jos pot fi folosite de către 
organizatorul festivalului pentru a planifica un număr maxim de spectacole în Aula 
Magna în ziua respectivă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `se sortează spectacolele în ordinea crescătoare a duratei lor, se programează primul 
spectacol și apoi se consideră, pe rând, restul spectacolelor, un spectacol fiind 
programat doar dacă începe după ce se termină spectacolul programat anterior;`,
      b: `se sortează spectacolele în ordinea descrescătoare a orelor la care se termină, se 
programează primul spectacol și apoi se consideră, pe rând, restul spectacolelor, un 
spectacol fiind programat doar dacă începe după ce se termină spectacolul programat 
anterior.`,
      c: `se sortează spectacolele în ordinea crescătoare a orelor la care se termină, se 
programează primul spectacol și apoi se consideră, pe rând, restul spectacolelor, un 
spectacol fiind programat doar dacă începe după ce se termină spectacolul programat 
anterior;`,
      d: `se sortează spectacolele în ordinea crescătoare a orelor la care încep, se programează 
primul spectacol și apoi se consideră, pe rând, restul spectacolelor, un spectacol fiind 
programat doar dacă începe după ce se termină spectacolul programat anterior;`,
    },
    correctAnswer: "c",
  },
  {
    id: 238,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `În Aula Magna a Universității Titu Maiorescu din București se va organiza un festival de 
teatru care va dura o singură zi. Fiecare regizor a transmis organizatorului festivalului 
intervalul de timp [ℎℎ1: 𝑚𝑚1, ℎℎ2: 𝑚𝑚2] în care se poate desfășura spectacolul său. 
Știind că spectacolele nu se pot suprapune și între oricare două spectacole consecutive nu 
există nicio pauză, organizatorul festivalului s-a gândit să folosească o strategie de 
planificare de tip Greedy pentru a planifica un număr maxim de spectacole în cadrul 
festivalului. Considerând că 7 regizori au trimis intervalele de desfăşurare ale 
spectacolelor lor 𝑠1 = [08: 00,10: 30], 𝑠2 = [08: 30,09: 00], 𝑠3 = [16: 30,18: 00], 𝑠4 =
[10: 30,10: 45], 𝑠5 = [11: 00,17: 00], 𝑠6 = [11: 30,13: 00], 𝑠7 = [15: 15,16: 45], 
precizați care dintre variantele de mai jos reprezintă o planificare corectă, cu un număr 
maxim de spectacole:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `S1, S5`,
      b: `S1, S6, S7, S3`,
      c: `S2, S4, S6, S7`,
      d: `S1, S2, S4, S5, S6`,
    },
    correctAnswer: "d",
  },
  {
    id: 239,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `În Aula Magna a Universității Titu Maiorescu din București se va organiza un festival de 
teatru care va dura o singură zi. Fiecare regizor a transmis organizatorului festivalului 
intervalul de timp [ℎℎ1: 𝑚𝑚1, ℎℎ2: 𝑚𝑚2] în care se poate desfășura spectacolul său. 
Știind că spectacolele nu se pot suprapune și între oricare două spectacole consecutive nu 
există nicio pauză, organizatorul festivalului s-a gândit să folosească o strategie de 
planificare de tip Greedy pentru a planifica un număr maxim de spectacole în cadrul 
festivalului. Considerând că 7 regizori au trimis intervalele de desfăşurare ale 
spectacolelor lor 𝑠1 = [08: 00,10: 30], 𝑠2 = [08: 30,11: 00], 𝑠3 = [16: 30,18: 00], 𝑠4 =
[10: 30,10: 45], 𝑠5 = [11: 00,12: 00], 𝑠6 = [12: 30,16: 00], 𝑠7 = [17: 15,18: 45], 
precizați care dintre variantele de mai jos reprezintă o planificare corectă, cu un număr 
maxim de spectacole:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `S1, S5, S6, S3`,
      b: `S2, S5, S6, S3, S7`,
      c: `S1, S4, S5, S6, S7`,
      d: `S2, S4, S5, S6, S7`,
    },
    correctAnswer: "a",
  },
  {
    id: 240,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră un triunghi de numere întregi format din 𝑛 linii, astfel: prima linie conține 
un număr, a doua linie conține două numere,. . ., ultima linie conține 𝑛 numere. În acest 
triunghi se pot forma sume de numere întregi în felul următor:  
➢ se selectează numărul aflat pe prima linie; 
➢ la fiecare pas se selectează fie numărul aflat pe următoarea linie sub ultimul număr 
selectat, fie numărul aflat pe următoarea linie și o coloană la dreapta față de ultimul 
număr selectat, până când se ajunge pe ultima linie a triunghiului de numere. 
 
Un algoritm cu complexitate minimă care determină cea mai mare sumă ce se poate 
obține respectând regulile de mai sus folosește metoda:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `programării dinamice;`,
      b: `backtracking;`,
      c: `Greedy;`,
      d: `Divide et Impera.`,
    },
    correctAnswer: "c",
  },
  {
    id: 241,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următorul triunghi de numere întregi format din 𝑛= 4 linii:  
12
−20
50
180
14
16
 
 
În acest triunghi se pot forma sume de numere întregi în felul următor:  
➢ se selectează numărul aflat pe prima linie; 
➢ la fiecare pas se selectează fie numărul aflat pe următoarea linie sub ultimul număr 
selectat, fie numărul aflat pe următoarea linie și o coloană la dreapta față de ultimul 
număr selectat, până când se ajunge pe ultima linie a triunghiului de numere. 
 
Care este suma maximă ce poate fi obținută în triunghiul dat, respectând condițiile 
precizate mai sus?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `302`,
      b: `73`,
      c: `190`,
      d: `92`,
    },
    correctAnswer: "c",
  },
  {
    id: 242,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Se consideră următorul triunghi de numere întregi format din 𝑛= 4 linii:  
 
100
−12
−20
130
200
118
210
114
320
160
 
 
În acest triunghi se pot forma sume de numere întregi în felul următor:  
➢ se selectează numărul aflat pe prima linie; 
➢ la fiecare pas se selectează fie numărul aflat pe următoarea linie sub ultimul număr 
selectat, fie numărul aflat pe următoarea linie și o coloană la dreapta față de ultimul 
număr selectat, până când se ajunge pe ultima linie a triunghiului de numere. 
 
Care este suma maximă ce poate fi obținută în triunghiul dat, respectând condițiile 
precizate mai sus?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `402`,
      b: `518`,
      c: `608`,
      d: `428`,
    },
    correctAnswer: "b",
  },
  {
    id: 243,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Fie 𝑆 o sumă de bani şi 𝑣1, 𝑣2, … , 𝑣𝑛 valorile a n tipuri de monede (se presupune că din 
fiecare tip de monedă avem la dispoziţie un număr nelimitat de monede). Un algoritm 
optim care să determine numărul minim de monede cu care poate fi plătită suma 𝑆, 
folosind monede de tipurile date, folosește metoda:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Greedy;`,
      b: `programării dinamice;`,
      c: `Divide et Impera.`,
      d: `backtracking;`,
    },
    correctAnswer: "a",
  },
  {
    id: 244,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Precizați câte subșiruri strict crescătoare de lungime maximă conține tabloul 𝑣=
(12,18,17,11,10,16,17,26):`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `2`,
      b: `3`,
      c: `1`,
      d: `4`,
    },
    correctAnswer: "c",
  },
  {
    id: 245,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Precizați câte subșiruri strict crescătoare de lungime maximă conține tabloul 𝑣=
(21,18,13,19,21,16,16,17,26):`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `3`,
      b: `1`,
      c: `2`,
      d: `4`,
    },
    correctAnswer: "b",
  },
  {
    id: 246,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Indicați lungimea maximă a unui subșir strict crescător din tabloul 𝑣=
(12,18,17,11,10,26,17,26,19,28):`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `3`,
      b: `4`,
      c: `5`,
      d: `2`,
    },
    correctAnswer: "d",
  },
  {
    id: 247,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Indicați lungimea maximă a unui subșir strict crescător din tabloul 𝑣=
(18,14,5,4,8,15,12,19,16,22):`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `2`,
      b: `5`,
      c: `4`,
      d: `3`,
    },
    correctAnswer: "a",
  },
  {
    id: 248,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Având la dispoziție un număr nelimitat de monede cu valorile 5 RON, 4 RON, 3 RON și 
1 RON, precizați numărul minim de monede cu care poate fi plătită suma de 17 RON:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `4`,
      b: `3`,
      c: `5`,
      d: `6`,
    },
    correctAnswer: "a",
  },
  {
    id: 249,
    moduleId: "programming",
    subjectId: "tehnici-avansate",
    text: `Având la dispoziție un număr nelimitat de monede cu valorile 7 RON, 6 RON, 3 RON și 
2 RON, precizați numărul minim de monede cu care poate fi plătită suma de 19 RON:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `3`,
      b: `6`,
      c: `4`,
      d: `5`,
    },
    correctAnswer: "b",
  },
];
