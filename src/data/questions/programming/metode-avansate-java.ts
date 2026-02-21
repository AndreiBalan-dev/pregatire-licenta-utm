import type { Question } from "@/data/types";

export const metodeAvansateJava: Question[] = [
  {
    id: 151,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următoarea clasă Java: 
 
class C  
{ 
int a; 
float x; 
boolean b; 
} 
 
Stabiliţi care dintre următoarele linii de cod este corectă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `C ob = new C(1,1.0);`,
      b: `C ob = new C();`,
      c: `C ob = new C(1);`,
      d: `C ob = new C(1,1.0,true);`,
    },
    correctAnswer: "b",
  },
  {
    id: 152,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
class C 
{ 
 
public static int a=1; 
} 
 
După executarea programului, va fi afişată valoarea:`,
    code: `public class test  
{ 
    public static void main(String[] args)  
    { 
 
C ob=new C();  
 
C.a++; 
 
ob.a++; 
 
System.out.println(C.a); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `3`,
      b: `2`,
      c: `1`,
      d: `nicio valoare, se obține o eroare la executare.`,
    },
    correctAnswer: "a",
  },
  {
    id: 153,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
După executarea programului, va fi afişată valoarea:`,
    code: `class C{public static int a=1;} 
 
public class teste_grila  
{ 
    public static void main(String[] args)  
    { 
 
C ob1=new C();  
 
C ob2=new C(); 

ob1.a++; 
 
System.out.println(ob2.a); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `0;`,
      b: `2;`,
      c: `1;`,
      d: `nicio valoare, se obține o eroare la executare.`,
    },
    correctAnswer: "b",
  },
  {
    id: 154,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Un program Test scris în limbajul Java poate fi compilat folosind comanda:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `java Test.java`,
      b: `javac Test.class`,
      c: `javac Test`,
      d: `javac Test.java`,
    },
    correctAnswer: "d",
  },
  {
    id: 155,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Un program Test scris în limbajul Java şi compilat, poate fi rulat folosind comanda:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `javac Test.java`,
      b: `java Test`,
      c: `java Test.class`,
      d: `java Test.java`,
    },
    correctAnswer: "b",
  },
  {
    id: 156,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `În Java o clasă poate extinde:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel mult o interfaţă`,
      b: `oricâte clase`,
      c: `cel mult o clasă`,
      d: `oricâte interfeţe`,
    },
    correctAnswer: "c",
  },
  {
    id: 157,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `În Java o interfaţă poate extinde:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `cel mult o interfată`,
      b: `oricâte interfeţe`,
      c: `cel mult o clasă`,
      d: `oricâte clase`,
    },
    correctAnswer: "b",
  },
  {
    id: 158,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `În Java o clasă poate implementa:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `o clasă`,
      b: `oricâte clase`,
      c: `o interfaţă`,
      d: `oricâte interfeţe`,
    },
    correctAnswer: "d",
  },
  {
    id: 159,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
class A 
{ 
 
După executarea programului, se va afişa:`,
    code: `public A() { System.out.print("A"); } 

} 
 
class B extends A 
{ 
 
public B() { System.out.print("B"); } 
} 
 
class C extends B 
{ 
 
public C() { System.out.println("C"); } 
} 
 
public class test  
{ 
    public static void main(String[] args)  
    { 
 
C ob=new C(); 
 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `A B C`,
      b: `A`,
      c: `C B A`,
      d: `C`,
    },
    correctAnswer: "a",
  },
  {
    id: 160,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
class A 
{ 
 
public int x=1; 
 
public A() { x++; } 
} 
 
class B extends A 
{ 
 
public B() { x++; } 
} 
 
class C extends B 
{ 
 
public int x=1; 
 
public C() { x++; } 
} 
 
După executarea programului, se va afişa:`,
    code: `public class test  
{ 
    public static void main(String[] args)  
    { 
 
B b=new B();  
 
C c=new C(); 

System.out.println(b.x+" "+c.x); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `3 4`,
      b: `3 2`,
      c: `2 2`,
      d: `3 3`,
    },
    correctAnswer: "b",
  },
  {
    id: 161,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
class A 
{ 
 
int x=0; 
 
public A(int n) { x=n; } 
} 
 
class B extends A 
{ 
 
int x=1; 
 
public B(int n) { super(n); } 
 
} 
 
După executarea programului, se va afişa:`,
    code: `public class test  
{ 
    public static void main(String[] args)  
    { 
 
 
A a=new A(5); 
 
 
B b=new B(7); 
 
 
System.out.println(a.x+" "+b.x); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `05`,
      b: `51`,
      c: `57`,
      d: `01`,
    },
    correctAnswer: "b",
  },
  {
    id: 162,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
După executarea programului, se va afişa:`,
    code: `class A{ 
 
 
static void staticMethod() {  
 
 
 
System.out.println("Metoda statica"); 
 
 
} 
 
} 
 
public class Test{ 
 
 
public static void main(String[] args){ 

A a = null;  
 
 
a.staticMethod(); 
 
 
} 
 
}`,
    codeLanguage: "java",
    options: {
      a: `programul afișează mesajul Metoda statica`,
      b: `se obține la executare excepția java.lang.NullPointerException`,
      c: `nu se poate apela o metoda membră statică pentru un obiect null`,
      d: `se obține o eroare la compliare cauzată de faptul ca o metodă statică nu poate fi invocată folosind o referintă`,
    },
    correctAnswer: "a",
  },
  {
    id: 163,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Următorul program Java

class A
{
    int x=10;
    static int y=20;
}
class B extends A
{
    int x=30;
    static int y=40;
}

Afișează`,
    code: `public class Test
{
    public static void main(String[] args) {
        A ob = new B();
        System.out.println(ob.x+" "+ob.y);
    }
}`,
    codeLanguage: "java",
    options: {
      a: `10 20`,
      b: `eroare la executare`,
      c: `30 40`,
      d: `30 20`,
    },
    correctAnswer: "a",
  },
  {
    id: 164,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Care dintre următoarele afirmații este adevărată pentru o metodă Java de tip 
final?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `poate fi și suprascrisă și supraîncărcată`,
      b: `poate fi suprascrisă, dar nu poate fi supraîncărcată`,
      c: `nu poate fi nici suprascrisă și nici supraîncărcată`,
      d: `nu poate fi suprascrisă, dar poate fi supraîncărcată`,
    },
    correctAnswer: "d",
  },
  {
    id: 165,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Următorul program Java:

Afișează`,
    code: `public class Test {
    static void test(int a[]){
        a[0] = 100;
        a = new int[]{10,20,30,40,50};
        a[1] = 200;
        System.out.println(Arrays.toString(a));
    }
    public static void main(String[] args){
        int []v = {1,2,3,4,5,6,7};
        test(v);
        System.out.println(Arrays.toString(v));
    }
}`,
    codeLanguage: "java",
    options: {
      a: `[10, 200, 30, 40, 50]\n[1 2, 3, 4, 5, 6, 7]`,
      b: `[10, 200, 30, 40, 50]\n[100, 2, 3, 4, 5, 6, 7]`,
      c: `[10, 20, 30, 40, 50]\n[100, 2, 3, 4, 5, 6, 7]`,
      d: `[10, 20, 30, 40, 50]\n[100, 2, 3, 4, 5, 6, 7]`,
    },
    correctAnswer: "b",
  },
  {
    id: 166,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 
 
class C 
{ 
 
int a,b; 
 
 
public C(int x, int y){a=x; b=y;} 
 
 
După executarea programului, pe ecran se va afişa:`,
    code: `void f() 
 
{ 
 
 
if(a<b) { a++; b--; g(); } 
 
} 
 
 
void g()  
{ 
 
if(b>=a) { a++; b--; f(); }  
} 
 
 
void afisare() { System.out.println(a+" "+b);} 
} 
 
public class teste_grila 
{ 
    public static void main(String[] args) 

    { 
 
 
C ob = new C(2,10); 
 
 
ob.f(); ob.g(); 
 
 
ob.afisare(); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `5 7`,
      b: `6 6`,
      c: `2 10`,
      d: `7 5`,
    },
    correctAnswer: "d",
  },
  {
    id: 167,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 
 
class C 
{ 
 
static int x = 0; 
 
static int f() { return (++x)*(x--); } 
} 
 
După executarea programului, pe ecran se va afişa:`,
    code: `public class teste_grila 
{ 
    public static void main(String[] args) 
    { 
 
 
System.out.println(C.f()+" "+C.f()+" "+C.f()); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `1 1 1`,
      b: `1 2 3`,
      c: `1 2 6`,
      d: `0 0 0`,
    },
    correctAnswer: "a",
  },
  {
    id: 168,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 
 
class C 
{ 
 
static int x=0; 
 
După executarea programului, pe ecran se va afişa:`,
    code: `static void f() 
 
{ 
 
 
x = (++x)*(x--); 
 
 
System.out.print(x+" "); 
 
} 
} 
 
public class teste_grila 
{ 
    public static void main(String[] args) 

    { 
 
 
C.f();C.f();C.f(); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `0 0 0`,
      b: `1 4 25`,
      c: `2 4 16`,
      d: `1 -1 1`,
    },
    correctAnswer: "b",
  },
  {
    id: 169,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
class Fir implements Runnable{ 
    int x; 
    public Fir(int x){ 
        this.x = x; 
    } 
După executarea programului, poate fi afişat un număr format din:`,
    code: `public void run(){ 
        for (int i = 0; i < 10; i++) System.out.print(x); 
    } 
 
    public 
static 
void 
main(String 
args[]) 
throws 
InterruptedException{ 
        Fir obj1 = new Fir(1); 
        Fir obj2 = new Fir(2); 
        Thread t1 = new Thread(obj1); 
        Thread t2 = new Thread(obj2); 
        t1.start(); 
        t2.start(); 
        t2.join(); 
        System.out.print(3); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `10 cifre egale cu 1, 10 cifre egale cu 2 și o cifră egală cu 3, cifrele fiind în orice ordine posibilă`,
      b: `10 cifre egale cu 1, urmate de 10 cifre egale cu 2 și la sfârșit o cifră egală cu 3`,
      c: `10 cifre egale cu 1, 10 cifre egale cu 2 și o cifră egală cu 3, dar toate cifrele egale cu 1 sau 2 se vor afla înaintea cifrei 3`,
      d: `10 cifre egale cu 1, 10 cifre egale cu 2 și o cifră egală cu 3, dar toate cifrele egale cu 2 se vor afla înaintea cifrei 3`,
    },
    correctAnswer: "c",
  },
  {
    id: 170,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 
 
        sir = new Sir("Mihai"); 
    } 
    public String getSir(){ 
        return sir; 
    } 
} 
 
        Sir s = new Sir("Ion"); 
        Sir t = new Sir("Alex"); 
        s.modificaSir("Matei"); 
        t.modificaSir(new Sir("Dan")); 
        s.modificaSir(t); 
După executarea programului, va fi afişată valoarea:`,
    code: `class Sir{ 
    private String sir; 

    public Sir(String sir){ 
        this.sir = sir; 
    } 
    public void modificaSir(String sir){ 
        this.sir = sir; 
    } 
    public void modificaSir(Sir sir){ 
public class Test { 
    public static void main(String[] args){ 
        System.out.println(s.getSir() + " " + t.getSir()); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `Alex Dan`,
      b: `Matei Dan`,
      c: `Matei Alex`,
      d: `Dan Dan`,
    },
    correctAnswer: "c",
  },
  {
    id: 171,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `O subclasă Java a unei clase abstracte poate fi instanţiată numai dacă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `se foloseşte moştenirea multiplă;`,
      b: `suprascrie fiecare metodă declarată abstractă în superclasa sa şi furnizeaza implementări pentru toate acestea;`,
      c: `se foloseşte cuvantul cheie abstract;`,
      d: `subclasă abstractă nu poate fi instanţiată.`,
    },
    correctAnswer: "b",
  },
  {
    id: 172,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Care este rolul declaraţiilor import într-o sursă Java?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Permite referirea claselor fără utilizarea de prefixe;`,
      b: `Permite importul imaginilor folosite;`,
      c: `Elimină necesitatea declarării variabilelor;`,
      d: `Elimină apelurile directe ale funcţiilor fără clase.`,
    },
    correctAnswer: "a",
  },
  {
    id: 173,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 
După executarea programului, va fi afişată valoarea:`,
    code: `class Calcul_1{
    void calcul(int a, int b){
        System.out.print(a + b + " ");
    }
}

class Calcul_2 extends Calcul_1{ 
    void calcul(int a, int b){ 
        System.out.print(a - b + " "); 
    } 
} 
  
class Calcul_3 extends Calcul_2{ 
    void calcul(int a, int b){ 
        System.out.print(a * b + " "); 
    } 
} 
public class Test{     
    public static void main(String[] args){ 
        Calcul_1 x = new Calcul_3(); 
        x.calcul(1, 2); 
 
        Calcul_2 y = (Calcul_2) x; 
        y.calcul(3, 4);          
 
        Calcul_3 z = (Calcul_3) y; 
        z.calcul(5, 6); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `2 12 30`,
      b: `3 -1 30`,
      c: `3 7 11`,
      d: `2 7 11`,
    },
    correctAnswer: "a",
  },
  {
    id: 174,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Ce se afisează dacă se execută următorul cod Java:  
 
String s = new String( "Computer" ); 
if( s == "Computer" ) 
if( s.equals( "Computer" ) )`,
    code: `System.out.println( "Equal A" ); 
               System.out.println( "Equal B" );`,
    codeLanguage: "java",
    options: {
      a: `Eroare la complilare, deoarece operatorul == nu se poate aplica pentru tipul String`,
      b: `Se afisează mesajul "Equal A"`,
      c: `Se afisează mesajul "Equal B"`,
      d: `Se afişează ambele mesaje, "Equal A" , repsectiv "Equal B"`,
    },
    correctAnswer: "c",
  },
  {
    id: 175,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `În Java, metoda clone() a clasei Object`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Testează dacă obiectul specificat este o clonă a obiectului current`,
      b: `Creeaza şi returnează o copie a obiectului curent`,
      c: `Returneaza codul asociat constructorului implicit`,
      d: `Creeaza un obiect nou al clasei folosind constructorul implicit`,
    },
    correctAnswer: "b",
  },
  {
    id: 176,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java:  
 
Ce va afişa acesta la execuţie?`,
    code: `public class Asignare {  
public static void main(String args[]){ 
 
int a = 3;int b = (a = 2) * a;int c = b * (b = 5) ; 
System.out.println("a = " + a + ", b = " + b + ", c = " + 
c);}}`,
    codeLanguage: "java",
    options: {
      a: `a = 2, b = 4, c = 20`,
      b: `a = 2, b = 5, c = 20`,
      c: `a = 2, b = 5, c = 25`,
      d: `a = 3, b = 6, c = 30`,
    },
    correctAnswer: "b",
  },
  {
    id: 177,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Urmatorul subprogram Java:

Afişează:`,
    code: `int as=3, bs=2, cs=4;
System.out.print(((as < bs++) & (cs++ < bs)) + " ");
System.out.println(as + " " + bs + " " + cs);
System.out.print(((as < bs++) && (cs++ < bs++)) + " ");
System.out.println(as + " " + bs + " " + cs);`,
    codeLanguage: "java",
    options: {
      a: `Eroare la compilare: nu se poate aduna o valoare booleana cu un String;`,
      b: `Subprogramul se compilează şi la execuţie afisează: false 3 3 5 false 3 4 4`,
      c: `Subprogramul se compileaza şi la execuţie afisează: false 3 3 5 false 3 4 5`,
      d: `Subprogramul se compileaza şi la execuţie afisează: false 3 3 5 false 3 5 6`,
    },
    correctAnswer: "c",
  },
  {
    id: 178,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java:  
 
După executarea programului, pe ecran se va afişa:`,
    code: `public class test  
{  
public static void main(String args[])  
{  
int v[ ]={-2,4,-5,-6,0,2},suma=0,i;  
for(i=0;i<5;i++)  
if(v[i]<-2) suma+=v[i];  
System.out.println(suma);  
}  
}`,
    codeLanguage: "java",
    options: {
      a: `-7`,
      b: `-13`,
      c: `-11`,
      d: `0`,
    },
    correctAnswer: "c",
  },
  {
    id: 179,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Secvenţa uramatoare Java: 
 
   String sir = "Programare in Java, C++ este usoara" ; 
   String atom[]= sir.split(" ") ; 
Afisează:`,
    code: `public class test { 
public static void main(String args[]){ 
   System.out.println(atom.length) ;  
}}`,
    codeLanguage: "java",
    options: {
      a: `8`,
      b: `7`,
      c: `6`,
      d: `Eroare la compliare pentru ca nu se specifica numarul de elemente ale tabloului atom`,
    },
    correctAnswer: "c",
  },
  {
    id: 180,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Secvenţa uramatoare Java: 
 
   String sir = "Programare in Java, C++ este usoara" ; 
   String atom[]= sir.split(" ") ; 
Afisează:`,
    code: `public class test{ 
public static void main(String args[]){ 
   System.out.println(atom[0].length()) ;  
}}`,
    codeLanguage: "java",
    options: {
      a: `Eroare la compliare pentru ca nu se specifica numarul de elemente ale tabloului atom`,
      b: `6`,
      c: `10`,
      d: `9`,
    },
    correctAnswer: "c",
  },
  {
    id: 181,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Ce se va afişa la execuţia urmatorului program Java? 
interface I1{ 
float x=2.3f; 
}`,
    code: `public class Test implements I1{ 
public static void main(String [] args){ 
System.out.print(x+" "); 
x=6.7f; 
System.out.print(x); 
} 
}`,
    codeLanguage: "java",
    options: {
      a: `Va aparea eroare la compilare deoarece valoarea variabilei x nu se mai poate modifica;`,
      b: `La execuţie se va afişa: 2.3f 6.7f;`,
      c: `La execuţie se va afişa: 2.3f 2.3f;`,
      d: `La execuţie se va afişa: 2.3 6.7;`,
    },
    correctAnswer: "a",
  },
  {
    id: 182,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Urmatorul program Java: 
 
Afişează:`,
    code: `class C1{ 
int x=1; 
void f(int x){ 

this.x=x;} 
int getX_C1(){ 
return x;}} 
class C2 extends C1{ 
float x=5.0f; 
int f(int x){ 
super.f((int)x);} 
float getX_C2(){ 
return x;}} 
public class Test{ 
public static void main(String []args){ 
C2 obiect = new C2(); 
obiect.f(4); 
System.out.print(obiect.getX_C2() + " "); 
System.out.println(obiect.getX_C1());}}`,
    codeLanguage: "java",
    options: {
      a: `Programul este corect şi va afişa la execuţie 5 4;`,
      b: `Programul este correct şi va afişa la execuţie 4.0 4;`,
      c: `Va aparea eroare la compilare deoarece în clasa C2 s-a suprascris gresit atributul x din clasa C1;`,
      d: `Va aparea eroare la compilare deoarece metoda suprascrisă f() din clasa C2 intoarce un tip diferit de void;`,
    },
    correctAnswer: "d",
  },
  {
    id: 183,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `O subclasă Java a unei clase abstracte poate fi instanţiată numai dacă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Se foloseşte cuvantul cheie abstract;`,
      b: `Suprascrie fiecare metodă declarată abstractă în superclasa sa, şi furnizeaza implementari pentru toate acestea;`,
      c: `Se foloseşte moştenirea multiplă;`,
      d: `O subclasă abstractă nu poate fi instanţiată;`,
    },
    correctAnswer: "b",
  },
  {
    id: 184,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Urmatorul program Java: 
 
Afişează:`,
    code: `class C1{ 
int x=1; 
void f(int x){ 
this.x=x;} 
int getX_C1(){ 
return x;}} 
class C2 extends C1{ 
float x=5.0f; 
void f(int x){ 
super.f((int)x);} 
float getX_C2(){ 
return x;}} 
public class Test{ 
public static void main(String []args){ 
C2 obiect = new C2(); 
obiect.f(4); 
System.out.print(obiect.getX_C2() + " "); 

System.out.println(obiect.getX_C1());}}`,
    codeLanguage: "java",
    options: {
      a: `Programul este corect şi va afişa la execuţie 5.0 4;`,
      b: `Programul este correct şi va afişa la execuţie 4.0 4;`,
      c: `Va aparea eroare la compilare deoarece în clasa C2 s-a suprascris gresit atributul x din clasa C1;`,
      d: `Programul este correct şi va afişa la execuţie 5.0 5;`,
    },
    correctAnswer: "a",
  },
  {
    id: 185,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Tipurile referința în Java sunt:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `tabloul, clasa, interfața`,
      b: `clasa, interfata`,
      c: `int, flout, double, char, String`,
      d: `String si null`,
    },
    correctAnswer: "a",
  },
  {
    id: 186,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Secvența următoare:  
        String sir="Examen"; 
        sir.toUpperCase(); 
Afișează:`,
    code: `public class numar_43_nou { 
    public static void main(String args[]) 
    { 
        System.out.println(sir); 
    } 
 
}`,
    codeLanguage: "java",
    options: {
      a: `EXAMEN`,
      b: `Examen`,
      c: `eXamen`,
      d: `Examen`,
    },
    correctAnswer: "d",
  },
  {
    id: 187,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Secvența urătoare Java: 
        String sir1="Programare in Java"; 
        String sir2 =sir1.substring(4,8); 
Afișează:`,
    code: `public class numar_44_nou { 
    public static void main(String args[]) 
    { 
System.out.println(sir2.toUpperCase());    } 
}`,
    codeLanguage: "java",
    options: {
      a: `Java`,
      b: `rama`,
      c: `ogramare`,
      d: `RAMA`,
    },
    correctAnswer: "d",
  },
  {
    id: 188,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Secvența urătoare Java: 
Afișează:`,
    code: `public class Test { 
    public static void main(String args[]) 
    { 
 
int numar = 1;  
for (int x = 0; x < 4; x++)  
 
numar = numar << 1;  
 
System.out.println(numar);} 
}`,
    codeLanguage: "java",
    options: {
      a: `32`,
      b: `8`,
      c: `16`,
      d: `3`,
    },
    correctAnswer: "c",
  },
  {
    id: 189,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Secveţa uramatoare Java: 
 
 String sir = "Programare in Java, C++ este usoara" ; 
  String atom[]= sir.split("[ ,]") ; 
Afisează:`,
    code: `public class test { 
public static void main(String args[]){ 
  System.out.println(atom.length) ;  
}}`,
    codeLanguage: "java",
    options: {
      a: `Eroare la compliare pentru ca nu se specifica numarul de elemente ale tabloului atom`,
      b: `2`,
      c: `6`,
      d: `5`,
    },
    correctAnswer: "b",
  },
  {
    id: 190,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `O clasă Java declarată final`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `clasa nu poate fi instanțiată`,
      b: `orice cod exterior are acces la codul clasei`,
      c: `implementează o interfață`,
      d: `nu poate avea subclase`,
    },
    correctAnswer: "d",
  },
  {
    id: 191,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Compoziția în limbajul Java reprezintă`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `relație de tip IS-A`,
      b: `relație de tip Can Do`,
      c: `relație de tip HAS-A.`,
      d: `Nicio relație`,
    },
    correctAnswer: "c",
  },
  {
    id: 192,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
După executarea programului, va fi afişată valoarea:`,
    code: `class Tablou{ 
    int[] met(int []a){ 
        a[0] = -a[0]; 
        a = new int[a.length]; 
        a[0] = 1; 
        return a; 
    } 
} 
public class Test{ 
    public static void main(String[] args){ 
        int a[] = {1,2,3,4,5}; 
        int b[] = new Tablou().met(a); 
        int s = 0; 
        for(int i = 0; i < a.length; i++) s = s + a[i] + 
b[i]; 
        System.out.println(s); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `30`,
      b: `14`,
      c: `28`,
      d: `15`,
    },
    correctAnswer: "b",
  },
  {
    id: 193,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 
După executarea programului, va fi afişată valoarea:`,
    code: `class A{ 
    public int x = 1; 
    public A() { x++; } 
} 
class B extends A{ 
    public B() { x++; } 
} 
class C extends B{ 
    public int x = 1; 
    public C() {  x++; } 
} 
public class Test{ 
    public static void main(String[] args){ 
        B b = new B(); 
        C c = new C(); 
        System.out.println(b.x + " " + c.x); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `3 3`,
      b: `3 2`,
      c: `3 4`,
      d: `2 2`,
    },
    correctAnswer: "b",
  },
  {
    id: 194,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Considerăm următorul program Java: 

După executarea programului, va fi afişată valoarea:`,
    code: `class C1{ 
    int x = 1; 
    int f(int x) { return this.x + x; } 
    int f(int x, int y) { return this.x + y; } 
} 
class C2 extends C1{ 
    int f(int x) { return this.x; } 
} 
public class Test{ 
    public static void main(String[] args){ 
        C1 ob = new C2(); 
        System.out.println(ob.f(1) + ob.f(2,2)); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `3`,
      b: `6`,
      c: `5`,
      d: `4`,
    },
    correctAnswer: "d",
  },
  {
    id: 195,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `După executarea secvenței de cod  Java 
 
String s = "Examen", t = "Examen"; 
se va afişa:`,
    code: `if (s == t) System.out.print("A"); 
else System.out.print("B"); 
if (s.equals(t)) System.out.print("C"); 
else System.out.print("D");`,
    codeLanguage: "java",
    options: {
      a: `AD`,
      b: `BC`,
      c: `AC`,
      d: `BD`,
    },
    correctAnswer: "c",
  },
  {
    id: 196,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
 
După executarea programului, se va afişa:`,
    code: `class A { public int x = 0; } 
public class Test{ 
    public static A metoda() { 
        A a = new A(); 
        try{ 
            a.x += 1; 
            throw new NullPointerException(); 
        } catch(Exception e) { a.x += 2; } 
        finally { a.x += 3; } 
        return a; 
    } 
        public static void main(String[] args){ 
        A ob = metoda(); 
        System.out.println(ob.x); 
    } 

}`,
    codeLanguage: "java",
    options: {
      a: `6`,
      b: `3`,
      c: `4`,
      d: `Eroare la rulare (excepție NullPointerException netratată)`,
    },
    correctAnswer: "a",
  },
  {
    id: 197,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Precizați care dintre urmaătoarele afirmații sunt adevărate: 
I. o interfață poate să conțină câmpuri publice, statice și finale, respectiv metode 
statice si metode implicite cu implementare 
II. o înterfață poate fi instanțiată 
III. o clasă poate implementa mai multe interfețe 
IV. mai multe clase pot implementa aceeași interfață`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `I, II, IV`,
      b: `I, III, IV`,
      c: `II, III, IV`,
      d: `I, II, III, IV`,
    },
    correctAnswer: "b",
  },
  {
    id: 198,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
    public static String f(String x) { return x+"A"; } 
    public String g(String x) { return x+"B"; }  
} 
 
class B extends A { 
    public static String f(String x) { return x+"C"; } 
    public String g(String x) { return x+"D"; } 
} 
 
După executarea programului, se va afişa:`,
    code: `class A { 
 
public class Test { 
    public static void main(String[] args) { 
        A a = new B(); 
 
        System.out.println(a.f("A") + a.g("C")); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `AACD`,
      b: `ACCD`,
      c: `AACB`,
      d: `ACDC`,
    },
    correctAnswer: "a",
  },
  {
    id: 199,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Un fir de executare în Java se poate defini:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `printr-o instanță a clasei Runnable`,
      b: `printr-o instanță a clasei Object`,
      c: `printr-o instanță a clasei Thread`,
      d: `printr-o instanță a clasei Clone`,
    },
    correctAnswer: "c",
  },
  {
    id: 200,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Ce se va afișa dupa executarea următorului program Java: 
 
        m.put("a", null); 
        m.put("b", "JavaSE"); 
        m.put("c", "Python"); 
        m.put(null, "PHP"); 
        m.put(null, null);`,
    code: `public class Test { 
    public static void main(String[] args) { 
        HashMap m = new HashMap(); 

        System.out.println(m); 
 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `{null=null, a=null, b=JavaSE, c=Python}`,
      b: `{a=null, b=JavaSE, c=Python}`,
      c: `{null=PHP, a=null, b=JavaSE, c=Python}`,
      d: `Exepție la executare de tip NullPointerException`,
    },
    correctAnswer: "a",
  },
  {
    id: 201,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Ce se va afișa dupa executarea următorului program Java: 
        m.put("a", null); 
        m.put("b", "JavaSE"); 
        m.put("c", "Python"); 
        m.put(null, "PHP"); 
        m.put(null, null);`,
    code: `public class Test { 
    public static void main(String[] args) { 
        TreeMap m = new TreeMap(); 
        System.out.println(m); 
 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `{null=null, a=null, b=JavaSE, c=Python}`,
      b: `{a=null, b=JavaSE, c=Python}`,
      c: `{null=PHP, a=null, b=JavaSE, c=Python}`,
      d: `Exepție la executare de tip NullPointerException`,
    },
    correctAnswer: "d",
  },
  {
    id: 202,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java:

De câte ori va fi afișat mesajul Constructor, după executarea programului dat?`,
    code: `class Persoana implements Serializable {
    String nume;
    int varsta;
    public Persoana(String nume, int varsta) {
        this.nume = nume;
        this.varsta = varsta;
        System.out.println("Constructor");
    }
}
public class Test {
    public static void main(String[] args) throws Exception {
        ObjectOutputStream oos = new ObjectOutputStream(
            new FileOutputStream("persoana.ser"));
        Persoana p = new Persoana("Popescu Ion", 40), q = p;
        oos.writeObject(q);
        oos.close();
        ObjectInputStream ois = new ObjectInputStream(
            new FileInputStream("persoana.ser"));
        Persoana r = (Persoana)ois.readObject();
        ois.close();
    }
}`,
    codeLanguage: "java",
    options: {
      a: `niciodată`,
      b: `o dată`,
      c: `de două ori`,
      d: `de trei ori`,
    },
    correctAnswer: "b",
  },
  {
    id: 203,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie secvența următoare de cod (presupunem că în clasa Persoana sunt 
implementate corect metodele get și set pentru datele membre String nume și 
double salariu):  
 
listaPersoane.stream() 
.filter(p -> p.getNume().startsWith(""B"")) 
.filter(p -> p.getSalariu() > 2000) 
.map(Persoana::getNume) 
.sorted() 
.map(o -> o.toString()) 
.collect(Collectors.joining("","")); 
 
Ce va produce secvența de cod dată?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `șirul de caractere obținut prin concatenarea listei sortate a salariilor mai mari decât 2000 ale persoanelor ale căror nume începe cu B`,
      b: `șirul de caractere obținut prin concatenarea listei sortate a numelor persoanelor care încep cu B și cu salarii mai mari decât 2000`,
      c: `lungimea șirului de caractere produs prin concatenarea numelor persoanelor care încep cu B și cu salarii mai mari decât 2000`,
      d: `lista formată din persoanele ale căror nume care încep cu B și au salarii mai mari decât 2000`,
    },
    correctAnswer: "b",
  },
  {
    id: 204,
    moduleId: "programming",
    subjectId: "metode-avansate-java",
    text: `Fie următorul program Java: 
După executarea programului se va afișa:`,
    code: `class Super { 
    public static void print() { System.out.println("Super "); } 
} 
 
class Sub extends Super { 

    public static void print() { System.out.println("Sub"); } 
} 
 
public class Test { 
    public static void main(String args[]) { 
        Super p = new Sub(); 
        Sub q = new Sub(); 
        Super r = new Super(); 
        p.print(); 
        q.print(); 
        r.print(); 
    } 
}`,
    codeLanguage: "java",
    options: {
      a: `Sub Sub Sub`,
      b: `Sub Sub Super`,
      c: `Super Super Super`,
      d: `Super Sub Super`,
    },
    correctAnswer: "d",
  },
];
