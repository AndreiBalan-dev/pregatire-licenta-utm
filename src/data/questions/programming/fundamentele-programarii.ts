import type { Question } from "@/data/types";

export const fundamenteleProgramarii: Question[] = [
  {
    id: 1,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `În care dintre variantele de mai jos se declară un tablou unidimensional (vector) 𝑥 în care
se pot memora cel mult 100 de numere reale?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `x=float[100];`,
      b: `double x[100];`,
      c: `floating x[100];`,
      d: `real x(100);`,
    },
    correctAnswer: "b",
  },
  {
    id: 2,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele expresii logice este adevărată (are o valoare nenulă) dacă şi numai
dacă numărul real memorat în variabila 𝑥 nu aparţine intervalului (0,5]?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(x<=0)||(x>5)`,
      b: `(x<=0)&&(x>5)`,
      c: `(x<0)||(x>=5)`,
      d: `(x<=0)&&(x>5)`,
    },
    correctAnswer: "a",
  },
  {
    id: 3,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele expresii este adevărată (are o valoare nenulă) dacă şi numai dacă
numărul întreg memorat în variabila 𝑥 aparţine intervalului (1,6]?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `(x>=1)||(x<6)`,
      b: `(x>1)||(x<=6)`,
      c: `(x>1)&&(x<6)`,
      d: `(x>1)&&(x<=6)`,
    },
    correctAnswer: "d",
  },
  {
    id: 4,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `După executarea instrucțiunii  float x = 27/5*2/3*7; ce valoare va fi memorată în
variabila 𝑥?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `25.2`,
      b: `21.0`,
      c: `6.3`,
      d: `7.0`,
    },
    correctAnswer: "b",
  },
  {
    id: 5,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `După executarea instrucțiunii  float x = 55/17*5/8+48/5/8*15; ce valoare va fi
memorată în variabila 𝑥?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `17.022058`,
      b: `17.0`,
      c: `16.0`,
      d: `21.219914`,
    },
    correctAnswer: "c",
  },
  {
    id: 6,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Se consideră următoarea secvenţă de instrucțiuni:`,
    code: `int t=0,a=1234,b=10;
while(a>=b)
{
  a=a-b;
  t++;
}
printf("%d %d",t,a);`,
    codeLanguage: "c",
    options: {
      a: `124 4`,
      b: `123 4`,
      c: `123 5`,
      d: `124 3`,
    },
    correctAnswer: "b",
  },
  {
    id: 7,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvenţe de instrucţiuni afişează valoarea 654, ştiind că 𝑠 şi 𝑖 sunt
două variabile de tip întreg?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `s=0; for(i=0;i<=654;i++) s++; printf("%d",s);`,
      b: `s=651; while(s<=654) s++; printf("%d",s);`,
      c: `for(i=1;i<=3;i++) printf("%d",7-i);`,
      d: `s=7; while(s>=1) printf("%d",s-1);`,
    },
    correctAnswer: "c",
  },
  {
    id: 8,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvenţe de instrucţiuni afişează valoarea 5432, ştiind că 𝑠 şi 𝑖 sunt
două variabile de tip întreg?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `s=0; for(i=0;i<=5432;i++) s++; printf("%d",s);`,
      b: `s=5421; while(s<=5432) s++; printf("%d",s);`,
      c: `for(i=1;i<4;i++) printf("%d",6-i);`,
      d: `s=6; while(s>=3) printf("%d",--s);`,
    },
    correctAnswer: "d",
  },
  {
    id: 9,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvenţă de instrucțiuni:

Ştiind că variabilele 𝑠 şi 𝑛 sunt de tip întreg, ce valoare se va afişa după executarea secvenţei
de mai sus pentru 𝑛=93321?`,
    code: `s=0;
while(n>0)
{
  if(n%10>s) s=n%10;
  else s=10;
  n=n/10;
}
printf("%d",s);`,
    codeLanguage: "c",
    options: {
      a: `9`,
      b: `10`,
      c: `15`,
      d: `1`,
    },
    correctAnswer: "b",
  },
  {
    id: 10,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvenţe de instrucțiuni afişează câtul şi restul împărţirii numărului
natural 𝑎 la numărul natural nenul 𝑏?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int t=0; while(a>=b) { a=a-b; t++; } printf("%d %d",t,a);`,
      b: `int t=0; do { a=a-b; t++; }while(a>=b); printf("%d %d",t,a);`,
      c: `int t=0; while(a!=b) { a=a-b; t++; } printf("%d %d",t,b);`,
      d: `int t=0; while(a%b==0) { a=a-b; t++; } printf("%d %d",t,a);`,
    },
    correctAnswer: "a",
  },
  {
    id: 11,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Ce valoare se va afişa pe ecran după executarea programului de mai sus?`,
    code: `#include <stdio.h>
void sch(int a, int *b)
{
  int aux;
  aux = a;
  a = *b;
  *b = aux;
}

int main()
{
  int x = 1,y = 2;
  sch(x,&y);
  printf("%d",x+y);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `2`,
      b: `1`,
      c: `4`,
      d: `3`,
    },
    correctAnswer: "a",
  },
  {
    id: 12,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Ce valori se vor afişa pe ecran după executarea programului de mai sus?`,
    code: `#include <stdio.h>
void sch(char a, char *b)
{
  char aux;
  aux = a;
  a = *b;
  *b = aux;
}

int main()
{
  char x = '1',y = '2';
  sch(x,&y);
  printf("%c,%c",x,y);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `1,2`,
      b: `2,1`,
      c: `1,1`,
      d: `2,2`,
    },
    correctAnswer: "c",
  },
  {
    id: 13,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Ce valoare se va afişa pe ecran după executarea programului de mai sus?`,
    code: `#include <stdio.h>
void sch(int *a, int b)
{
  int aux;
  aux = *a;
  *a = b;
  b = aux;
}

int main()
{
  int x = 1,y = 2;
  sch(&x,y);
  printf("%d",x*y);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `3`,
      b: `2`,
      c: `4`,
      d: `1`,
    },
    correctAnswer: "c",
  },
  {
    id: 14,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Ce valori se vor afişa pe ecran după executarea programului de mai sus?`,
    code: `#include<stdio.h>
void f(int a,int *b)
{
  a++;
  *b=a;
  (*b)++;
}

void g(int *a,int b)
{
  b++;
  *a=b;
  (*a)++;
}

int main()
{
  int x=4, y=-2;
  f(x,&y);
  g(&x,y);
  printf("%d %d",x,y);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `4 8`,
      b: `8 8`,
      c: `8 6`,
      d: `6 6`,
    },
    correctAnswer: "c",
  },
  {
    id: 15,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvenţe de instrucţiuni atribuie variabilei de tip întreg 𝑚𝑎𝑥 cea
mai mare valoare din tabloul 𝑎, format din 𝑛 numere întregi?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `max=0; for(i=0;i<n;i++) if(a[i]>max) max=a[i];`,
      b: `max=a[0]; for(i=0;i<n;i++) if(a[i]>a[i+1]) max=a[i];`,
      c: `max=a[0]; for(i=0;i<n;i++) if(a[i]>max) max=a[i];`,
      d: `max=0; for(i=0;i<n;i++) if(a[i]<a[i+1]) max=a[i+1];`,
    },
    correctAnswer: "c",
  },
  {
    id: 16,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvenţă de instrucțiuni:

Cu ce expresie dintre cele de mai jos trebuie înlocuite punctele de suspensie din secvenţa
de instrucțiuni dată astfel încât aceasta să afişeze câte valori strict pozitive şi pare sunt în
tabloul 𝑎, format din 𝑛 numere întregi?`,
    code: `np=0;
for(i=0;i<n;i++)
  if(...) np++;
printf("%d",np);`,
    codeLanguage: "c",
    options: {
      a: `(a[i]>0)&&(a[i]%2!=0)`,
      b: `(a[i]>0)&&(a[i]%2==0)`,
      c: `(a[i]>0)||(a[i]%2!=0)`,
      d: `(a[i]>=0)||(a[i]%2==0)`,
    },
    correctAnswer: "b",
  },
  {
    id: 17,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care este valoarea expresiei strlen("programare")+strcmp("test","test")?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `10`,
      b: `14`,
      c: `18`,
      d: `"programaretesttest"`,
    },
    correctAnswer: "a",
  },
  {
    id: 18,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvenţă de instrucțiuni:

Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `char s[100];
strcpy(s,"");
strcat(s,"abcdefgh");
strcpy(s+2,s+4);
printf("%s %d" ,s,strlen(s));`,
    codeLanguage: "c",
    options: {
      a: `adefgh 6`,
      b: `abefgh 6`,
      c: `abfgh 5`,
      d: `abefgh 8`,
    },
    correctAnswer: "b",
  },
  {
    id: 19,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care din următoarele expresii de tip logic este adevărată (are o valoare nenulă) dacă şi
numai dacă şirul de caractere 𝑠, de lungime 10, este obţinut prin concatenarea a două şiruri
identice?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `strcmp(s,s+5)==0`,
      b: `s==strstr(s,s+5)`,
      c: `s==s+5`,
      d: `strcmp(s,strcat(s,s+5))==0`,
    },
    correctAnswer: "b",
  },
  {
    id: 20,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvenţă de instrucțiuni:

Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `char s[]="abcdabcd",c = 'c';
char *p = strchr(s,c);
printf("%d",p - s);`,
    codeLanguage: "c",
    options: {
      a: `cdabcd`,
      b: `6`,
      c: `cd`,
      d: `2`,
    },
    correctAnswer: "d",
  },
  {
    id: 21,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvenţă de instrucțiuni:

Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `char s[20];
strcpy(s,"abcdabcd");
strncat(s,s+2,3);
strcpy(s,s+4);
printf("%d",strlen(s));`,
    codeLanguage: "c",
    options: {
      a: `6`,
      b: `10`,
      c: `9`,
      d: `7`,
    },
    correctAnswer: "d",
  },
  {
    id: 22,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvenţă de instrucțiuni:

Ce se va afişa pe ecran după executarea secvenţei date?`,
    code: `char s[20];
strncpy(s,"abcdabcd",6);
s[6]='\\0';
strcat(s,s+4);
strcpy(s+3,s+6);
printf("%s",s);`,
    codeLanguage: "c",
    options: {
      a: `abcabab`,
      b: `abcdab`,
      c: `abcab`,
      d: `abcdabd`,
    },
    correctAnswer: "c",
  },
  {
    id: 23,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarele structuri:

Știind că variabila st este de tip Student, indicați instrucţiunea de mai jos prin care luna
naşterii studentului respectiv primește valoarea 12:`,
    code: `typedef struct
{
  int zi,luna,an;
}Data;

typedef struct
{
  char nume[30];
  Data data_nasterii;
  float media;
}Student;`,
    codeLanguage: "c",
    options: {
      a: `st->data_nasterii->luna=12;`,
      b: `st.data_nasterii.luna=12;`,
      c: `data_nasterii.luna=12;`,
      d: `st.luna=12;`,
    },
    correctAnswer: "b",
  },
  {
    id: 24,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarele structuri:

Știind că variabila st este de tip Student*, indicați instrucţiunea de mai jos prin care anul
naşterii studentului respectiv primește valoarea 1990:`,
    code: `typedef struct
{
  int zi,luna,an;
}Data;

typedef struct
{
  char nume[30];
  Data *data_nasterii;
  float media;
}Student;`,
    codeLanguage: "c",
    options: {
      a: `st->data_nasterii->an=1990;`,
      b: `st.data_nasterii.an=1990;`,
      c: `st.data_nasterii->an=1990;`,
      d: `st->data_nasterii.an=1990;`,
    },
    correctAnswer: "a",
  },
  {
    id: 25,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarele structuri:

Știind că variabila a este de tip Punct_3D, fiind folosită pentru a stoca coordonatele unui
punct în spațiu, indicați instrucţiunea de mai jos prin care toate cele 3 coordonate ale
punctului a se iniţializează cu valoarea 0:`,
    code: `typedef struct
{
  int x,y;
}Punct_2D;

typedef struct
{
  Punct_2D p;
  int z;
}Punct_3D;`,
    codeLanguage: "c",
    options: {
      a: `a.p.x = a.p.y = a.p.z = 0;`,
      b: `a.p.x = a.p.y = a.z = 0;`,
      c: `a.x = a.y = a.z = 0;`,
      d: `a.p = a.z = 0;`,
    },
    correctAnswer: "b",
  },
  {
    id: 26,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm tipul de date Punct, capabil să memoreze abscisa şi ordonata unui punct din
plan, şi tipul de date Segment, capabil să memoreze două puncte reprezentând
extremităţile unui segment din plan, definite astfel:

Care dintre următoarele expresii are o valoare nenulă dacă şi numai dacă variabila 𝑠 de tip
Segment memorează informații despre un segment vertical (aflat pe axa Oy sau paralel cu
axa Oy)?`,
    code: `typedef struct
{
  float x,y;
}Punct;

typedef struct
{
  Punct A,B;
}Segment;`,
    codeLanguage: "c",
    options: {
      a: `s.A == s.B`,
      b: `s.x == s.y`,
      c: `A.x == B.x`,
      d: `s.A.x == s.B.x`,
    },
    correctAnswer: "d",
  },
  {
    id: 27,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm tipul de date Punct, capabil să memoreze abscisa şi ordonata unui punct din
plan, şi tipul de date Segment, capabil să memoreze două puncte reprezentând
extremităţile unui segment din plan, definite astfel:

Care dintre următoarele funcții returnează lungimea segmentului transmis prin intermediul
parametrului s de tip Segment?`,
    code: `typedef struct
{
  float x,y;
}Punct;

typedef struct
{
  Punct A,B;
}Segment;`,
    codeLanguage: "c",
    options: {
      a: `double f(Segment s) { return pow(s.A.x-s.B.x,2)+pow(s.A.y-s.B.y,2); }`,
      b: `double f(Segment s) { return sqrt((s.A.x-s.B.x)+(s.A.y-s.B.y)); }`,
      c: `double f(Segment s) { return s.B-s.A; }`,
      d: `double f(Segment s) { return sqrt(pow(s.A.x-s.B.x,2)+pow(s.A.y-s.B.y,2)); }`,
    },
    correctAnswer: "d",
  },
  {
    id: 28,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm funcția int suma(int x,int y) care returnează suma numerelor întregi x
și y, precum și funcția int prod(int x,int y) care returnează produsul numerelor
întregi x și y. Știind că a, b și c sunt 3 variabile de tip întreg, care dintre expresiile de mai
jos atribuie variabilei t de tip întreg valoarea expresiei (a+b)*(a+c)+b*c?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `t = prod(suma(a,b),suma(a,c),prod(b,c));`,
      b: `t = suma(prod(suma(a,b),suma(a,c)),suma(b,c));`,
      c: `t = prod(suma(a,b),suma(a,c)+suma(b,c));`,
      d: `t = suma(prod(suma(a,b),suma(a,c)),prod(b,c));`,
    },
    correctAnswer: "d",
  },
  {
    id: 29,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm funcția int suma(int x,int y) care returnează suma numerelor întregi x
și y, precum și funcția int prod(int x,int y) care returnează produsul numerelor
întregi x și y. Știind că a, b și c sunt 3 variabile de tip întreg, care dintre expresiile de mai
jos atribuie variabilei t de tip întreg valoarea expresiei a*b+a*b*c?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `t = suma(prod(a,b),prod(a,b+c));`,
      b: `t = suma(prod(a,b),prod(a,b,c));`,
      c: `t = suma(prod(a,b),prod(a,b,c));`,
      d: `t = prod(prod(a,b),suma(1,c));`,
    },
    correctAnswer: "d",
  },
  {
    id: 30,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele funcții returnează suma cifrelor numărului natural n?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int f(int n) { int s=0; while(n!=0) { s=s+n%10; n=n/10; } return s; }`,
      b: `int f(int n) { int s=0; while(n!=0) { s=s+n/10; n=n%10; } return s; }`,
      c: `int f(int n) { int s=0; while(n!=0) { s=s+n%10; n=n/10; } }`,
      d: `int f(int n) { int s=0; while(n!=0) { s=n%10; n=n/10; } return s; }`,
    },
    correctAnswer: "a",
  },
  {
    id: 31,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele funcții poate fi folosită într-un program pentru a citi de la tastatură
un tablou unidimensional format din numere întregi?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `void citire(int v[],int n) { scanf("%d",&n); for(int i=0;i<n;i++) scanf("%d",&v[i]); }`,
      b: `void citire(int *v[],int *n) { scanf("%d",n); for(int i=0;i<*n;i++) scanf("%d",&v[i]); }`,
      c: `void citire(int *v[],int *n) { scanf("%d",&n); for(int i=0;i<n;i++) scanf("%d",&v[i]); }`,
      d: `void citire(int *v,int *n) { scanf("%d",n); for(int i=0;i<*n;i++) scanf("%d",v+i); }`,
    },
    correctAnswer: "d",
  },
  {
    id: 32,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele funcții nu returnează suma elementelor tabloului unidimensional
de numere întregi transmis ca parametru?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int suma(int v[],int n) { int s=0,k=0; while(k<n) s+=v[k++]; return s; }`,
      b: `int suma(int v[],int n) { int s=0,k=0; while(k++<n) s+=v[k]; return s; }`,
      c: `int suma(int v[],int n) { int s,k; for(k=s=0;k<n;s+=v[k++]); return s; }`,
      d: `int suma(int v[],int n) { int s=0; for(int k=n-1;k>=0;k--) s+=v[n-k-1]; return s; }`,
    },
    correctAnswer: "b",
  },
  {
    id: 33,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Funcția minmax primește prin parametrul de intrare v un tablou unidimensional format din
numere întregi, iar prin parametrul de intrare n primește numărul de elemente ale tabloului
v. Funcția trebuie să întoarcă prin doi parametri de ieșire, min și max, valoarea minimă și,
respectiv, valoarea maximă din tabloul v. Care dintre următoarele variante reprezintă un
antet corect al funcției minmax?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `void minmax(int v[],int n,int min,int max)`,
      b: `int minmax(int v[],int n,int min,int max)`,
      c: `void minmax(int v[],int n,int *min,int *max)`,
      d: `void minmax(int *v[],int *n,int *min,int *max)`,
    },
    correctAnswer: "c",
  },
  {
    id: 34,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie v un tablou unidimensional format din 100 de numere reale de tip double și numărul
natural k cuprins între 0 și 99. Care dintre următoarele expresii afișează adresa elementului
v[k]?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `printf("%p\\n",v+k);`,
      b: `printf("%p\\n",&v[99]+k-99);`,
      c: `printf("%p\\n",v+k*sizeof(double));`,
      d: `printf("%p\\n",&v[k]);`,
    },
    correctAnswer: "c",
  },
  {
    id: 35,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie 𝑣 un tablou unidimensional format din 100 de numere reale de tip double și 𝑝 o
variabilă de tip pointer către double în care este memorată adresa ultimului element al
tabloului 𝑣 (double *p=&v[99];). Care dintre următoarele expresii nu afișează numărul
de octeți pe care îi ocupă tabloul 𝑣 în memorie?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `printf("%d",(p-v+1)*sizeof(double));`,
      b: `printf("%d",100*sizeof(double));`,
      c: `printf("%d",p-v);`,
      d: `printf("%d",sizeof(v));`,
    },
    correctAnswer: "c",
  },
  {
    id: 36,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvențe de cod poate fi utilizată pentru a aloca dinamic un tablou
unidimensional 𝑎 format din 100 de numere întregi?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int *a = (int *)malloc(100);`,
      b: `int *a = (int *)malloc(100*sizeof(int));`,
      c: `int *a = (int *)malloc(100, sizeof(int));`,
      d: `int *a = (int *)calloc(100*sizeof(int));`,
    },
    correctAnswer: "b",
  },
  {
    id: 37,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvențe de cod poate fi utilizată pentru a aloca dinamic un tablou
bidimensional 𝑎 format din 10 de linii și 20 de coloane de numere întregi?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int **a = (int **)malloc(10); for(int i=0;i<10;i++) a[i]=(int *)malloc(20);`,
      b: `int **a = (int **)calloc(10*sizeof(int *),20*sizeof(int));`,
      c: `int *a = (int *)malloc(20*sizeof(int *)); for(int i=0;i<20;i++) a[i]=(int *)malloc(10*sizeof(int));`,
      d: `int **a = (int **)calloc(10,sizeof(int*)); for(int i=0;i<10;i++) a[i]=(int *)calloc(20,sizeof(int));`,
    },
    correctAnswer: "d",
  },
  {
    id: 38,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie 𝑎 un tabloul bidimensional pătratic de dimensiune 𝑛. Care dintre următoarele secvențe
de cod afișează elementele aflate pe diagonala principală a matricei 𝑎?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i==j) printf("%d ",a[i][j]);`,
      b: `for(int i=0;i<n;i++) printf("%d ",a[i,i]);`,
      c: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i+j==n-1) printf("%d ",a[i][j]);`,
      d: `for(int i=0;i<n;i++) printf("%d ",a[i][n-i-1]);`,
    },
    correctAnswer: "a",
  },
  {
    id: 39,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie 𝑎 un tabloul bidimensional pătratic de dimensiune 𝑛. Care dintre următoarele secvențe
de cod afișează elementele aflate pe diagonala secundară a matricei 𝑎?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i==j) printf("%d ",a[i][j]);`,
      b: `for(int i=0;i<n;i++) printf("%d ",a[i][i]);`,
      c: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i+j==n) printf("%d ",a[i][j]);`,
      d: `for(int i=0;i<n;i++) printf("%d ",a[i][n-i-1]);`,
    },
    correctAnswer: "d",
  },
  {
    id: 40,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie 𝑎 un tabloul bidimensional pătratic de dimensiune 𝑛. Care dintre următoarele secvențe
de cod afișează elementele triunghiului delimitat de prima coloană, diagonala principală și
ultima linie din matricea 𝑎?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i>=j) printf("%d ",a[i][j]);`,
      b: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i<=j) printf("%d ",a[i][j]);`,
      c: `for(int i=0;i<n;i++) for(int j=0;j<i;j++) printf("%d ",a[i][j]);`,
      d: `for(int i=0;i<n;i++) for(int j=i;j<n;j++) printf("%d ",a[i][j]);`,
    },
    correctAnswer: "a",
  },
  {
    id: 41,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie 𝑎 un tabloul bidimensional pătratic de dimensiune 𝑛. Care dintre următoarele secvențe
de cod afișează elementele triunghiului delimitat de diagonala principală, ultima coloană și
prima linie din matricea 𝑎?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i>=j) printf("%d ",a[i][j]);`,
      b: `for(int i=0;i<n;i++) for(int j=0;j<n;j++) if(i<j) printf("%d ",a[i][j]);`,
      c: `for(int i=0;i<n;i++) for(int j=0;j<=i;j++) printf("%d ",a[i][j]);`,
      d: `for(int i=0;i<n;i++) for(int j=i;j<n;j++) printf("%d ",a[i][j]);`,
    },
    correctAnswer: "d",
  },
  {
    id: 42,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Fie 𝑎 un tabloul bidimensional pătratic de dimensiune 𝑛. Care dintre următoarele secvențe
de cod afișează suma elementelor de pe fiecare linie a matricei 𝑎?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `for(int i=0;i<n;i++) { int s=0; for(int j=0;j<n;j++) { s=s+a[i][j]; printf("%d ",s); } }`,
      b: `int s=0; for(int i=0;i<n;i++) { for(int j=0;j<n;j++) { s=s+a[i][j]; printf("%d ",s); } }`,
      c: `int s=0; for(int i=0;i<n;i++) { for(int j=0;j<n;j++) s=s+a[i][j]; printf("%d ",s); }`,
      d: `for(int i=0;i<n;i++) { int s=0; for(int j=0;j<n;j++) s=s+a[i][j]; printf("%d ",s); }`,
    },
    correctAnswer: "d",
  },
  {
    id: 43,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele funcții returnează dimensiunea în octeți a unui fișier text a cărui
cale este transmisă prin parametrul de intrare 𝑛𝑓?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int nb(char *nf) { FILE *f=fopen(nf,"r"); fseek(f,0,SEEK_END); int n=ftell(f); fclose(f); return n; }`,
      b: `int nb(char *nf) { char c; FILE *f=fopen(nf,"r"); int n=0; while(fscanf(f,"%c",&c) == 1) n++; fclose(f); return n; }`,
      c: `int nb(char *nf) { FILE *f=fopen(nf,"r"); int n=sizeof(f); fclose(f); return n; }`,
      d: `int nb(char *nf) { char s[1001]; FILE *f=fopen(nf,"r"); int n=0; while(fgets(s,1000,f)) n++; fclose(f); return n; }`,
    },
    correctAnswer: "a",
  },
  {
    id: 44,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele funcții returnează numărul de linii dintr-un fișier text a cărui cale
este transmisă prin parametrul de intrare 𝑛𝑓 (se presupune că fișierul nu conține linii vide)?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int nr(char *nf) { char s[1001]; FILE *f=fopen(nf,"r"); int n=0; while(fscanf(f,"%s",s)==1) n++; fclose(f); return n; }`,
      b: `int nr(char *nf) { char c; FILE *f=fopen(nf,"r"); int n=0; while(fscanf(f,"%c",&c)==1) if(c=='\\n') n++; fclose(f); return n; }`,
      c: `int nr(char *nf) { FILE *f=fopen(nf,"r"); int n=sizeof(f); fclose (f); return n/sizeof(char *); }`,
      d: `int nr(char *nf) { char s[1001]; FILE *f=fopen(nf,"r"); int n=0; while(fgets(s,1000,f)) n++; fclose (f); return n; }`,
    },
    correctAnswer: "d",
  },
  {
    id: 45,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Știind ca lungimea maximă a unei linii din fișierul text test.txt este de 100 de caractere, ce
se va afișa după executarea programului de mai sus?`,
    code: `#include<stdio.h>
#include<string.h>

int main()
{
  FILE *f=fopen("test.txt","r");
  char s[101],t[101];
  while(fgets(s,100,f))
    strcpy(t,s);
  printf("%s",t);
  fclose(f);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `fiecare linie din fișier;`,
      b: `penultima linie din fișier;`,
      c: `ultimul caracter din fișier;`,
      d: `ultima linie din fișier.`,
    },
    correctAnswer: "d",
  },
  {
    id: 46,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Presupunând că fiecare dintre cele 5 șiruri care vor fi citite de la tastatură vor fi formate din
minim două caractere și maxim 10, stabiliți cu care dintre instrucțiunile de mai jos trebuie
înlocuite spațiile punctate din program astfel încât acesta să afișeze șirul format din ultimele
două caractere din fiecare dintre cele 5 șiruri citite:`,
    code: `#include<stdio.h>
#include<string.h>

int main()
{
  char s[21],aux[11];
  strcpy(s,"");
  for(int i=1;i<=5;i++)
  {
    printf("Sirul %d: ",i);
    gets(aux);
    ...
  }
  printf("%s",s);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `strcat(s,aux+9);`,
      b: `strcat(s,aux[strlen(aux)-1]);`,
      c: `strncat(s,aux,strlen(aux)-1);`,
      d: `strcat(s,aux+strlen(aux)-2);`,
    },
    correctAnswer: "d",
  },
  {
    id: 47,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Care dintre următoarele secvențe de cod afișează pe ecran șirul de numere 1 2 2 3 3 3
4 4 4 4 5 5 5 5 5?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `for(int i=1;i<=5;i++) for(int j=1;j<=5;j++) printf("%d",i);`,
      b: `for(int i=1;i<=5;i++) for(int j=1;j<=i;j++) printf("%d",i);`,
      c: `for(int i=1;i<=5;i++) for(int j=1;j<=i;j++) printf("%d",j);`,
      d: `for(int i=1;i<=4;i++) for(int j=i+1;j<=5;j++) printf("%d",i);`,
    },
    correctAnswer: "b",
  },
  {
    id: 48,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Stabiliți care dintre următoarele funcții întorc poziția primei valori strict pozitive din tabloul
𝑣 format din 𝑛 numere întregi sau -1 dacă tabloul nu conține nici un număr pozitiv:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `int p(int v[],int n) { int i,x=-1; for(i=0;i<n;i++) if(v[i]>0) x=i; return x; }`,
      b: `int p(int v[],int n) { int x=0; while(v[x]<=0) x++; return x-1; }`,
      c: `int p(int v[],int n) { int i,x=-1; for(i=0;i<n;i++) if((v[i]>0)&&(x<0)) x=i; return x; }`,
      d: `int p(int v[],int n) { int i; for(int i=0;i<n;i++) if (v[i]>0) return i; else return -1; }`,
    },
    correctAnswer: "c",
  },
  {
    id: 49,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următoarea secvență de cod:

Dacă valorile introduse pentru variabilele a și b vor fi două numere naturale nenule cu
proprietatea că a < b, atunci pe ecran se vor afișa:`,
    code: `int a, b, p=1;
scanf("%d %d", &a, &b);
while(p < a)
   p = p*2;
while(p <= b)
{
   printf("%d\\n", p);
   p = p*2;
}`,
    codeLanguage: "c",
    options: {
      a: `toate puterile lui 2 din intervalul [a,b];`,
      b: `toate puterile lui 2 din intervalul (a,b];`,
      c: `toate numerele pare din intervalul [a,b];`,
      d: `toate numerele pare din intervalul (a,b];`,
    },
    correctAnswer: "a",
  },
  {
    id: 50,
    moduleId: "programming",
    subjectId: "fundamentele-programarii",
    text: `Considerăm următorul program:

Ce valori vor fi afișate pe ecran după executarea programului de mai sus?`,
    code: `#include<stdio.h>

void p(int v[],int *n)
{
  int i,j,g;
  do
  {
    g=0;
    for(i=0;i<*n;i++)
      if(v[i]<0)
      {
        for(j=i;j<*n-1;j++) v[j]=v[j+1];
        (*n)--;
        g=1;
      }
  }
  while(g);
}

int main()
{
  int i,v[]={-1,2,-3,-4,5},n=5;
  p(v,&n);
  for(i=0;i<n;i++)
    printf("%d ",v[i]);
  return 0;
}`,
    codeLanguage: "c",
    options: {
      a: `–1 -3 -4`,
      b: `2 5`,
      c: `–1 2 -3 -4`,
      d: `2 -3 -4 5`,
    },
    correctAnswer: "b",
  },
];
