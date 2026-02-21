import type { Question } from "@/data/types";

export const pooCpp: Question[] = [
  {
    id: 100,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvența în limbajul C++: 
 
public: 
În momentul executării programului de mai sus:`,
    code: `class cls{ 
 
cls(){ cout<<"constructor";} 
cls(cls &c){cout<<"constructor de copiere";} 
}; 
int f(cls c){ return 1;} 
int main(){ 
cls c;  
f(c); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `constructorul de clasă se apelează de două ori, iar cel de copiere nicio dată;`,
      b: `constructorul de clasă se apelează o dată, iar cel de copiere nu se apelează;`,
      c: `constructorul de copiere se apelează o dată, iar cel de clasă nu se apelează;`,
      d: `constructorul de clasă şi cel de copiere se apelează fiecare câte o dată;`,
    },
    correctAnswer: "b",
  },
  {
    id: 101,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvența în limbajul C++: 
 
public:  
În momentul executării programului de mai sus:`,
    code: `class cls{ 
cls(){ cout<<"constructor";} 
cls(cls &c){cout<<"constructor de copiere";} 
}; 
int f(cls &c){ return 1;} 
int main(){ 
cls c;  
f(c); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `constructorul clasei se apelează o dată, iar cel de copiere nu se apelează nicio dată;`,
      b: `constructorul de copiere se apelează o dată, iar cel de clasă nu se apelează;`,
      c: `constructorul de clasă şi cel de copiere se apelează fiecare câte o dată;`,
      d: `constructorul clasei se apelează de două ori, iar cel de copiere nicio dată;`,
    },
    correctAnswer: "a",
  },
  {
    id: 102,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvența în limbajul C++: 
 
public: 
     
Declarațiile admise în acest caz sunt:`,
    code: `class C{ 
int a; 
virtual void metoda1()=0; 
     
virtual void metoda2()=0; 
}; 
 
int main(){ 
C *pob;       //declarația 1 
C ob;         //declarația 2 
C *vpob[5];   //declarația 3 

 (C++) 
 
2 
 
C vob[5];      //declarația 4 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `Declarațiile 2 și 4;`,
      b: `Declarațiile 1 si 3;`,
      c: `Declarațiile 1, 2 și 3.`,
      d: `Declarațiile 1 și 2;`,
    },
    correctAnswer: "d",
  },
  {
    id: 103,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie clasa  C++:  
  
 public :  
  
c (int , int ) ;  
 int det_a ( ) {return a ;}  
  
~c () ;  
};  
  
Semnul ~ are rolul :`,
    code: `class c {  
 int a, b ;`,
    codeLanguage: "cpp",
    options: {
      a: `de a nega logic rezultatul returnat de metoda c( );`,
      b: `de a nega pe biți rezultatul returnat de metoda c( );`,
      c: `de a preciza existența destructorului;`,
      d: `de a supraîncarca constructorul clasei;`,
    },
    correctAnswer: "b",
  },
  {
    id: 104,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Polimorfismul dinamic în limbajul C++ se realizează cu ajutorul:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `datelor si metodelor membre statice`,
      b: `claselor derivate`,
      c: `pointerilor și a funcțiilor virtuale`,
      d: `nu se poate realiza polimorfismul dinamic în limbajul C++`,
    },
    correctAnswer: "a",
  },
  {
    id: 105,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Secvenţa următoare în limbajul C++: 
 
public: 
int a; 
public:   
int b; 
afișează: 

 (C++) 
 
3`,
    code: `class c1{ 
c1(int y){ a=y;cout<<"constructor 1";} 
~c1(){cout<<"destructor 2";} 
}; 
class c2:public c1{ 
      c2(int y, int x):c1(y) { b=x; cout<<"constructor 2";} 
      ~c2(){cout<<"destructor 2";} 
}; 
int main(){  
c1 ob1(2); 
c2 ob2(2,3); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `constructor 1 constructor 2 destructor 2 destructor 1`,
      b: `constructor 1 constructor 1 constructor 2 destructor 2 destructor 1 destructor 1`,
      c: `constructor 1 constructor 2 constructor 1 destructor 1 destructor 2 destructor 1`,
      d: `constructor 1 constructor 1 constructor 2 destructor 2 destructor 1`,
    },
    correctAnswer: "a",
  },
  {
    id: 106,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public:  
public:  
Programul afișează:`,
    code: `#include <iostream.h> 
class B{ 
B(){cout<<"B()"<<endl;} 
~B(){cout<<"~B()"<<endl;} 
}; 
 
 
class D: public B{  
D(){cout<<"D()"<<endl;} 
~D(){cout<<"~D()"<<endl;} 
}; 
int main(){ 
B *b=new B();  
delete b; 
b=new D();   
delete b; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `B() ~B() D() ~B()`,
      b: `B() ~B() B() D() ~D()`,
      c: `B() ~B() B() D() ~B()`,
      d: `B() ~B() B() ~B()`,
    },
    correctAnswer: "b",
  },
  {
    id: 107,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie programul C++: 
 
public:  
public:  
Programul afișează: 

 (C++) 
 
4`,
    code: `#include <iostream.h> 
class B{  
B(){cout<<"B()"<<endl;} 
B(B &b){cout<<"B(B &b)"<<endl;} 
}; 
class D: public B{  
D(){cout<<"D()"<<endl;} 
D(D &d){cout<<"D(D &d)"<<endl;} 
}; 
int main(){ 
B b;  
B b1(b);  
D d;  
D d1(d); 
return 0;  
}`,
    codeLanguage: "c",
    options: {
      a: `B() B() B(B&b) B() D() B(B &b) D() B(B &b)`,
      b: `B() B(B&b) B() D() B(B &b) D(D &d)`,
      c: `B() B(B&b) D() B(B &b) D() B(B &b)`,
      d: `B() B(B&b) B() D() B() D(D &d)`,
    },
    correctAnswer: "b",
  },
  {
    id: 108,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie clasa C++ : 
 
public: 
float c (int, int) 
 
 
int get_a {return a;} 
 
 
c ();  
}; 
 
Declaraţia float c(int, int) ar putea corespunde unui constructor al clasei?`,
    code: `class c {  
int a,b;`,
    codeLanguage: "cpp",
    options: {
      a: `nu, deoarece crează ambiguitate;`,
      b: `nu, deoarece nu este de tip friend.`,
      c: `da, fiind o supraîncarcare a celui existent;`,
      d: `nu, deoarece constructorul nu are tip returnat;`,
    },
    correctAnswer: "c",
  },
  {
    id: 109,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvenţa următoare: 
 
public: 
persoana(int v=18){varsta=v;} 
persoana& operator++(int){varsta++; return *this;} 
int get_varsta(){return varsta;} 
}; 
Secvența afișează:`,
    code: `class persoana{ 
int varsta; 
int main(){ 
persoana p(20); 
cout<<p++.get_varsta(); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `18`,
      b: `21`,
      c: `20`,
      d: `19`,
    },
    correctAnswer: "b",
  },
  {
    id: 110,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Se consideră următoarea secvență de program C++: 
 
private: 
int x,y; 
public: 
B(int a,int b){ x=a;y=b; } 
B(const B &a){ x=a.x; y=a.y;} 
}; 
 

 (C++) 
În care dintre următoarele situații se realizează copierea unui obiect într-altul:`,
    code: `class B{`,
    codeLanguage: "cpp",
    options: {
      a: `B c2(0.0, 0,0);`,
      b: `B c4(1);`,
      c: `B c1, c3=c1;`,
      d: `{ x=a.x; y=a.y;} }; (C++)`,
    },
    correctAnswer: "d",
  },
  {
    id: 111,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public:  
cls(int x=7) { j=x; }  
static int imp(int k){ cls a; return i+k+a.j; } };  
int cls::i;  
Indicați ce se va afișa pe ecran  în urma executării programului:`,
    code: `#include<iostream.h>  
class cls {  
static int i;  
int j;  
int main()  
{ int k=5;  
cout<<cls::imp(k);  
return 0;  
}`,
    codeLanguage: "c",
    options: {
      a: `12`,
      b: `14`,
      c: `13`,
      d: `11`,
    },
    correctAnswer: "d",
  },
  {
    id: 112,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public: 
public: 
Indicați ce se va afișa pe ecran  în urma executării programului:`,
    code: `#include <iostream.h> 
class B{ 
virtual void f() { cout<<"B::f() ";} 
void g() { cout<<"B::g() ";} 
}; 
 
 
class D: public B{ 
void f() { cout<<"D::f() ";} 
void g() { cout<<"D::g() ";} 
}; 
int main(){ 
int i; 
B *a=new B(); 
B *b=new D();  
a->f(); b->f();  
a->g(); b->g(); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `B::f() D::f() B::g() D::g() (C++)`,
      b: `B::f() B::g() D::f() D::g()`,
      c: `B::f() D::f() B::g() B::g()`,
      d: `D::f() B::f() B::g() B::g() B::g()`,
    },
    correctAnswer: "d",
  },
  {
    id: 113,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public: 
public: 
public: 
Indicați ce se va afișa pe ecran  în urma executării programului:`,
    code: `#include <iostream.h> 
class B{ 
virtual void f() { cout<<"B::f() ";} 
void g() { cout<<"B::g() ";} 
}; 
 
 
class D1: public B{ 
void f() { cout<<"D1::f() ";} 
void g() { cout<<"D1::g() ";} 
}; 
class D2: public B{ 
void g() { cout<<"D2::g() ";} 
}; 
int main(){ 
int i; 
B *a=new B(); 
B *b=new D1();  
B *c=new D2(); 
a->f(); b->f(); c->f(); 
a->g(); b->g(); c->g(); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `B::f() D1::f() D::f() B::g() D1::g() D2::g()`,
      b: `B::f() D1::f() B::f() B::g() B::g() B::g()`,
      c: `D2::f() D1::f() B::f() B::g() B::g() B::g()`,
      d: `B::f() D1::f() B::f() B::g() D1::g() D2::g()`,
    },
    correctAnswer: "b",
  },
  {
    id: 114,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
public: 
Destructorul clasei:`,
    code: `#include 
class cls{ 
~cls(){cout<<"\\n Destructor";} 
}; 
int main(){ 
cls *po=new cls[3]; 
delete []po; 
}]`,
    codeLanguage: "c",
    options: {
      a: `se apelează de patru ori.`,
      b: `se apelează de trei ori;`,
      c: `se apelează o dată;`,
      d: `nu se apelează nicio dată;`,
    },
    correctAnswer: "d",
  },
  {
    id: 115,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 

 (C++) 
public: 
salariat (int v=20) {varsta =v;} 
operator int() { return varsta;} 
salariat& operator++(){varsta++; return *this;} 
salariat operator++ (int) { varsta++; return *this;} 
}; 
Programul afișează:`,
    code: `#include<iostream.h> 
class salariat{  
int varsta; 
int main(){  
salariat s(21); 
int a=s++, b=++s; 
cout<<a<<"   "<<b<<endl; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `22 23`,
      b: `21 22`,
      c: `20 21`,
      d: `20 22`,
    },
    correctAnswer: "c",
  },
  {
    id: 116,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public: 
float raza; 
Cerc(float r){raza=r;} 
float get_raza(){return raza;} 
Cerc operator++(){raza++; return *this;} 
Cerc operator--(){raza--; return *this;} 
}; 
Programul afișează:`,
    code: `#include <iostream.h> 
class Cerc{ 
int main(){  
Cerc c(3.5); 
cout<<(++(++c)).get_raza()<<" ";  
cout<<c.get_raza()<<" "; 
cout<<(--(--c)).get_raza()<<" "; 
cout<<c.get_raza()<<" "; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `3.5 4.5 2.5 3.5`,
      b: `5.5 4.5 2.5 3.5`,
      c: `5.5 4.5 2.5 2.5`,
      d: `2.5 5.5 4.5 3.5`,
    },
    correctAnswer: "a",
  },
  {
    id: 117,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvența de program C++: 
 
public:  
static int s; 
}; 

 (C++) 
int  C::s=0; 
int a=7; C::s=a;  
În secvența de mai sus, inițializarea lui s este:`,
    code: `#include <iostream.h> 
class C{ 
int main(){  
cout<<C::s; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `ilegală, deoarece nu există niciun obiect creat;`,
      b: `ilegală, deoarece s este inițializat în afara clasei;`,
      c: `ilegală, deoarece s este dublu definit, în clasă și în afara ei;`,
      d: `corectă, deoarece membri statici există înainte de a se crea obiecte din clasă.`,
    },
    correctAnswer: "a",
  },
  {
    id: 118,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvența C++: 
 
public: 
complex(double x=1.0,double y=6.80){re=x; im=y;} 
complex( const complex &u){re=u.re;im=u.im;} 
}; 
 
Precizaţi în ce situaţie se utilizează constructorul de copiere:`,
    code: `class complex{ 
double re; 
double im;`,
    codeLanguage: "cpp",
    options: {
      a: `complex z3(0.1,1.0);`,
      b: `complex z5(-0.1,28.7).`,
      c: `complex z1(5.2, 3.6);`,
      d: `complex z1(5.2, 3.6), z2=z1;`,
    },
    correctAnswer: "c",
  },
  {
    id: 119,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie secvența C++:  
 
public: 
public: 
public: 
public: 
public: 
Secvența afișează:`,
    code: `class A1{ 
A1(){cout << "A1 ";} 
}; 
class A2{ 
A2(){cout << "A2 ";} 
}; 
class AA1 : public A1, virtual public A2{ 
AA1(){cout << "AA1 ";} 
}; 
class AA2 : public A1, virtual A2{ 
AA2(){cout << "AA2 ";} 
}; 
class B : public AA1, virtual public AA2{ 
B(){cout << "B ";} 
}; 
int  main(){ 
B ob1; 
return 0; 
} 
 

 (C++) 
 
9`,
    codeLanguage: "cpp",
    options: {
      a: `A1 A2 AA2 A1 AA1 B`,
      b: `A1 A2 AA2 A1 B AA1`,
      c: `A2 A2 AA2 AA1 A1 B`,
      d: `A2 A1 AA2 A1 AA1 B`,
    },
    correctAnswer: "a",
  },
  {
    id: 120,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie programul C++: 
 
public: 
Cerc(float r){raza=r;} 
float get_raza(){return raza;} 
void operator++(){raza++;} 
}; 
public: 
Cilindru(float raza, float i):Cerc(raza){inaltime=i;} 
void operator++(){inaltime++;} 
float get_inaltime(){return inaltime;} 
}; 
Programul afișează:`,
    code: `#include <iostream.h> 
class Cerc{ 
float raza; 
class Cilindru : public Cerc{ 
float inaltime; 
int main(){ 
Cerc *pc; 
Cilindru c(2,6); 
pc=&c; 
++ *pc; 
cout<<pc->get_raza()<<" "<<c.get_inaltime()<<endl; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `{inaltime=i;} 
void operator++(){inaltime++;} 
float get_inaltime(){return inaltime;} 
}; 
int main(){ 
Cerc *pc; 
Cilindru c(2,6); 
pc=&c; 
++ *pc; 
cout<<pc->get_raza()<<" "<<c.get_inaltime()<<endl; 
return 0; 
} 
 
Programul afișează: 
 
a) 2   5`,
      b: `3 6`,
      c: `2 6`,
      d: `2 5`,
    },
    correctAnswer: "a",
  },
  {
    id: 121,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
out<<p.varsta<<"  "<<p.salariul; return out; 
} 
public: 
persoana(int v){varsta=v;salariul=0;} 
persoana(){varsta=0;salariul=0;} 
}; 
Programul afișează:`,
    code: `#include<ostream.h> 
class persoana{  
int varsta, salariul; 
friend ostream & operator<<(ostream &out,persoana p){ 
int main(){ 
persoana p(1);cout<<p; 
return 0; 
} 
 

 (C++) 
 
10`,
    codeLanguage: "c",
    options: {
      a: `1 1`,
      b: `0 1`,
      c: `1 0`,
      d: `0 0`,
    },
    correctAnswer: "c",
  },
  {
    id: 122,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie programul C++: 
 
      public: 
c(){}; 
c(const c&){}; 
void operator=(c&){}; 
}; 
Linia de cod c b=a; determină:`,
    code: `class c{  
int a; 
int main(){  
c a; 
c b=a; 
}`,
    codeLanguage: "c",
    options: {
      a: `executarea constructorului de copiere;`,
      b: `executarea metodei prin care se supraîncărcă operatorul =;`,
      c: `executarea atât a constructorului de copiere, cât și a metodei operator =;`,
      d: `o eroare, deoarece nu este permisă combinarea atribuirii cu o declarație;`,
    },
    correctAnswer: "a",
  },
  {
    id: 123,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public:  
Destructorul clasei:`,
    code: `#include<iostream.h> 
class cls{  
~cls(){cout<<"\\n Destructor";} 
}; 
int main(){ 
cls *po=new cls[3];  
delete []po; 
}`,
    codeLanguage: "c",
    options: {
      a: `nu se apelează nicio dată;`,
      b: `se apelează o dată;`,
      c: `se apelează de trei ori;`,
      d: `se apelează de patru ori.`,
    },
    correctAnswer: "a",
  },
  {
    id: 124,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `O funcție independentă declarată friend în domeniul public dintr-o clasă C++ și care 
primește ca parametru o referință la un obiect al clasei respective are acces:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `la membrii protected. (C++)`,
      b: `la membrii public și la cei protected;`,
      c: `la toți membrii;`,
      d: `doar la membrii declarați public;`,
    },
    correctAnswer: "d",
  },
  {
    id: 125,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public: 
A(int i, int j, int k){a[0]=i; a[1]=j; a[2]=k;} 
int& operator[](int i){return a[i];} 
}; 
Ce se poate afirma despre operator[]()?`,
    code: `#include<iostream.h> 
class A{ 
int a[3]; 
int main(){ 
A ob(1,2,3); cout<<ob[1]; 
ob[1]=25; cout<<ob[1]; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `produce supraîncărcarea unui operator unar;`,
      b: `este o funcţie membru oarecare a clasei A, care nu produce supraîncărcarea unui operator;`,
      c: `produce supraîncărcarea unei funcţii;`,
      d: `supraîncarcă operatorul [];`,
    },
    correctAnswer: "c",
  },
  {
    id: 126,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Considerăm următorul program C++: 
 
public: 
int x; 
C(int v) { x=v;} 
double operator+(C &c, double d){return c.x+d;} 
double operator+(double d, C &c){return c.x+d;} 
}; 
Stabiliți care dintre următoarele afirmații sunt adevărate:`,
    code: `#include<iostream.h> 
class C{ 
 
int main() { 
C c(5);  
cout<<2+c+3;  
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `supraîncărcările operator+() nu se justifică deoarece au același cod;`,
      b: `supraîncărcările operator + () trebuie să fie friend;`,
      c: `programul afișează 10;`,
      d: `supraîncărcările operator+() trebuie să returneze referințe.`,
    },
    correctAnswer: "b",
  },
  {
    id: 127,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie programul C++: 
 
public: 
int b; 
Selectaţi  afirmaţia corectă:`,
    code: `#include<iostream.h> 
class c1{ int a;}; 
class c2:public c1{ 
void scrie_a( ) { cout<<a; } 
}; 
int main(){  
c2 ob; ob.scrie_a(); 

 (C++) 
 
12 
 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `programul afișează valoarea lui a;`,
      b: `prin derivare publică, accesul la membrii moşteniţi devine public.`,
      c: `funcția scrie_a( ) nu are acces asupra unui membru privat;`,
      d: `derivarea publică este incorect realizată;`,
    },
    correctAnswer: "c",
  },
  {
    id: 128,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie programul următor C++: 
 
public: 
B(int i=10) { x=i;} 
int get_x() { return x; }  
}; 
public:  
 
D(int i):B(i){} 
 
D operator+(const D& a) {return x+a.x; }  
}; 
Programul afișează:`,
    code: `#include<iostream.h> 
class B{  
int x; 
class D: public B{  
int main(){  
D ob1(7), ob2(-12); 
cout<<(ob1+ob2).get_x(); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `{return x+a.x; } }; int main(){ D ob1(7), ob2(-12); cout<<(ob1+ob2).get_x(); return 0; } Programul afișează: a) eroare, clasa B nu poate fi moștenită de clasa D;`,
      b: `eroare, metoda operator nu are acces la un membru privat al clasei de bază;`,
      c: `eroare, operatorul + nu se poate aplica pentru tipuri abstracte de date.`,
      d: `programul afișează valoarea -5;`,
    },
    correctAnswer: "a",
  },
  {
    id: 129,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
Variantele care permit accesul la variabile pentru afișare sunt:`,
    code: `#include<iostream.h> 
class B1{int x;}; 
class B2{int y;}; 
class B3{int z;}; 
class B4{int t;}; 
class D: public B1, private B2, protected B3,B4 {public : int m;}; 
int main(){  
D d; 
cout<<d.m; 
//varianta 1 
cout<<d.x; 
//varianta 2 
cout<<d.y; 
//varianta 3 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `1+3;`,
      b: `1`,
      c: `1+2+3;`,
      d: `1+2; (C++)`,
    },
    correctAnswer: "a",
  },
  {
    id: 130,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Considerăm următorul program C++: 
 
public: 
 
 
operator int (){return nr_c;} 
 
 
vector(int); 
}; 
vector::vector(int n){ 
pe=new int[n]; nr_c=n; 
while(n--) pe[n]=n; 
} 
Programul afişează:`,
    code: `class vector{  
int * pe, nr_c; 
 
void f(int i){cout<<i<<endl;} 
int main(){  
vector x(10); 
f(x);   
return 0;  
}`,
    codeLanguage: "c",
    options: {
      a: `numerele de la 1 la 10`,
      b: `numerele de la 0 la 9`,
      c: `9`,
      d: `10`,
    },
    correctAnswer: "c",
  },
  {
    id: 131,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Considerăm următorul program C++: 
 
public: 
 
Declaraţiile admise:`,
    code: `class c{  
int a; 
  
 virtual void metoda1()=0; 
 
 virtual void metoda2(int)=0; 
}; 
int main{ 
 
c  *pob;  
//declaraţia 1 
 
c ob; 
 
//declaraţia 2 
 
c *vpob[3]; 
//declaraţia 3 
 
c vob[3]; 
//declaraţia 4 
 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `nici una`,
      b: `1+2+3+4`,
      c: `1+2;`,
      d: `1+3;`,
    },
    correctAnswer: "c",
  },
  {
    id: 132,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
                   
public:  
int x; 
B(int i=16) { x=i; } 
B f(B ob) { return x+ob.x; }  
}; 
public:  
D(int i=25) { x=i; } 
B f(B ob) { return x+ob.x+1; } 
Programul afişează:`,
    code: `#include<iostream.h> 
class B{  
class D: public B{  
void afisare(){ cout<<x; }  
}; 
int main(){  
B *p1=new D, *p2=new B, *p3=new B(p1->f(*p2)); 
cout<<p3->x; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `45`,
      b: `eroare, nu se poate instanţia un obiect al unei clase derivate printr-un pointer la un obiect de tip clasa de bază;`,
      c: `44`,
      d: `41`,
    },
    correctAnswer: "d",
  },
  {
    id: 133,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public:  
static int x; 
B() { x++; i=1; } 
~B() { x--; } 
static int get_x() { return x; } 
int get_i() { return i; } 

 (C++) 
}; 
int B::x; 
public:  
D() { x++; } 
~D() { x--; } 
}; 
int f(B *q){ return (q->get_i())+1;} 
Programul afişează:`,
    code: `#include<iostream.h> 
class B{  
int i; 
class D: public B{  
int main(){  
B *p=new B; 
cout<<f(p); 
delete p; 
p=new D; 
cout<<f(p); 
delete p; 
cout<<D::get_x(); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `programul afişează valoarea 221;`,
      b: `eroare, data membră statică x nu este iniţializată;`,
      c: `eroare, metoda get_x() nu poate fi declarată static;`,
      d: `programul afişează valoarea 220.`,
    },
    correctAnswer: "b",
  },
  {
    id: 134,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
Programul afişează:`,
    code: `#include <iostream.h> 
template<class T, class E> 
float f(T x, E y){ return x+y;} 
float g(int x, float y){ return x-y;} 
int main(){  
int a=5; 
float b=8.6; 
cout<<g(a,b); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `3`,
      b: `13.6`,
      c: `-3.6`,
      d: `eroare, parametrizarea clasei T este incorrect realizată`,
    },
    correctAnswer: "a",
  },
  {
    id: 135,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
Programul afişează:`,
    code: `#include <iostream.h> 
template<class T> 
int f(T x, T y){ return x+y;} 
int f(int x, int y){ return x-y;} 
int main(){  
int a=5; 
float b=8.6; 
cout<<f(a,b); 
return 0; 
} 
 

 (C++) 
 
16`,
    codeLanguage: "c",
    options: {
      a: `3.6`,
      b: `eroare, parametrizarea clasei T este incorrect realizată`,
      c: `-3`,
      d: `13.6`,
    },
    correctAnswer: "c",
  },
  {
    id: 136,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
public:  
B(int i=10) { x=i; } 
int get_x() { return x; }}; 
public:  
D(int i):B(i) {} 
D operator+(const D& a) {return x+a.x; }}; 
Indicați ce se va afișa pe ecran  în urma executării programului:`,
    code: `#include<iostream.h> 
class B{  
int x; 
class D: public B{  
int main() 
{ D ob1(7), ob2(-12); 
cout<<(ob1+ob2).get_x(); 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `-3`,
      b: `eroare, în clasa derivată D nu se poate accesa data membră privată x a clasei B`,
      c: `-4`,
      d: `{return x+a.x; }}; int main() { D ob1(7), ob2(-12); cout<<(ob1+ob2).get_x(); return 0; }`,
    },
    correctAnswer: "d",
  },
  {
    id: 137,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 
 
public:  
int x; 
B(int i=16) { x=i; } 
B f(B ob) { return x+ob.x; } }; 
public:  
D(int i=25) { x=i; } 
B f(B ob) { return x+ob.x+1; } 
Programul afişează:`,
    code: `#include<iostream.h> 
class B{  
class D: public B{  
void afisare(){ cout<<x; } }; 
int main() 
{  
B *p1=new D, *p2=new B, *p3=new B(p1->f(*p2)); 
cout<<p3->x; 
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `41`,
      b: `eroare, în clasa derivată D nu se poate accesa data membră x a clasei B`,
      c: `16`,
      d: `25`,
    },
    correctAnswer: "a",
  },
  {
    id: 138,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++: 

 (C++) 
public:  
int a;  
cls1() { a=7; }  
};  
public:  
int b;  
cls2(int i) { b=i; }  
cls2(cls1& x) { b=x.a; }  
};  
Programul afişează:`,
    code: `#include<iostream.h>  
class cls1{  
class cls2{  
int main(){  
cls1 x;  
cout<<x.a;  
cls2 y(x);  
cout<<y.b;  
return 0;  
}`,
    codeLanguage: "c",
    options: {
      a: `eroare, constructorul de copiere nu poate accesa o dată publică a clasei cls1`,
      b: `eroare, constructorul de copiere nu este corect definit`,
      c: `7 7`,
      d: `78`,
    },
    correctAnswer: "c",
  },
  {
    id: 139,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `O funcţie friend diferă de o metodă obişnuită a unei clase prin faptul că:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `nu poate accesa decât partea publică a obiectului;`,
      b: `se foloseşte doar pentru supraîncărcarea operatorilor;`,
      c: `nu se poate defini inline;`,
      d: `nu primeşte pointerul implicit la obiect this;`,
    },
    correctAnswer: "c",
  },
  {
    id: 140,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `O funcţie independentă declarată friend în domeniul private dintr-o clasă şi care primeşte 
ca parametru o referinţă la un obiect al clasei respective are acces:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `la membrii public şi protected;`,
      b: `la membrii private;`,
      c: `la toti membrii;`,
      d: `doar la membrii publici;`,
    },
    correctAnswer: "d",
  },
  {
    id: 141,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Fie următorul program C++:  
  
 public :  
  
c() {}  
  
c(const c&);  
 c& operator =(c&);};  
Programul:`,
    code: `#include <iostream>  
using namespace std;  
class c{  
 int a; 
c& c::operator=(c &c){ cout << endl << "copiere cu egal"; return c;}  
c::c(const c &c) { cout << endl << "Constructor de copiere"; }  

 (C++) 
 
18 
 
int main()  
{  
 c x,y=x;  
 c b=x; x=y;  
};`,
    codeLanguage: "c",
    options: {
      a: `apeleaza de doua ori operator=(), o data constructorul de copiere si o data constructorul implicit;`,
      b: `apeleaza de doua ori constructorul de copiere, o data operator=() si o data constructorul implicit;`,
      c: `apeleaza de trei ori supraincarcarea operatorului =;`,
      d: `apeleaza de trei ori constructorul de copiere, o data constructorul implicit;`,
    },
    correctAnswer: "a",
  },
  {
    id: 142,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `De câte ori este apelat destructorul clasei Persoana în programul urmãtor C++?  
  
public:  
Răspuns:`,
    code: `#include <iostream>  
using namespace std;  
class Persoana{  
Persoana() {cout<<"Constructor"<<endl;}  
~Persoana() {cout<<"Destructor"<<endl;}};  
int main(){  
Persoana** ppp;  
ppp = new Persoana*[5];  
for(int i=0; i<5; i++)  
ppp[i] = new Persoana();  
for(int i=0; i<5; i++)  
delete ppp[i];  
}`,
    codeLanguage: "c",
    options: {
      a: `7;`,
      b: `5;`,
      c: `10;`,
      d: `6;`,
    },
    correctAnswer: "c",
  },
  {
    id: 143,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `În programul urmãtor C++:  
  
public:  
Persoana(int v=0, char* n="Oarecare"):varsta(v){  
this->nume = new char[strlen(n)+1];  
strcpy(this->nume,n);  
Persoana p1, p2(20, "Gigel");  
Persoana p3 = p1;  
p3 = p2;  
Persoana p4 = p1;  
}  
  
Sunt apelate urmãtoarele:`,
    code: `#include <iostream>  
using namespace std;  
class Persoana{  
int varsta;  
char* nume;  
cout<<"Constructor"<<endl;}  
Persoana(Persoana& p){  
this->varsta = p.varsta;  
this->nume = new char[strlen(p.nume)+1];  
strcpy(this->nume, p.nume);  
cout<<"Constructor de copiere"<<endl;}  
void operator=(Persoana& p){  
this->varsta = p.varsta;  
delete[] this->nume;  

 (C++) 
 
19 
 
this->nume = new char[strlen(p.nume)+1];  
strcpy(this->nume, p.nume);  
cout<<"Operator="<<endl;}  
~Persoana(){ cout<<"Destructor"<<endl;}};  
  
int main()  
{`,
    codeLanguage: "c",
    options: {
      a: `constructor – de douã ori, constructor de copiere – o datã, operator= - de douã ori,`,
      b: `constructor – de douã ori, constructor de copiere – de douã ori, operator= - o datã,`,
      c: `constructor – de patru ori, constructor de copiere – o datã, destructor – de patru ori;`,
      d: `constructor – de trei ori, constructor de copiere - de douã ori, destructor de cinci ori;`,
    },
    correctAnswer: "c",
  },
  {
    id: 144,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Presupunem că în C++ clasa A este prietenă cu clasa B, iar clasa B este prietenă cu clasa 
C. Care dintre următoarele afirmații este adevărată?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Clasa B nu poate fi prietenă cu nicio altă clasă în afara clasei A.`,
      b: `Clasa C devine automat prietenă cu clasa A.`,
      c: `Clasa A devine automat prietenă cu clasa C`,
      d: `Relația de prietenie nu este tranzitivă, prin urmare clasa A nu este prietenă clasei C.`,
    },
    correctAnswer: "b",
  },
  {
    id: 145,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Se consideră programul următor C++: 
 public:     
~A(){i=10;}};   
int foo(){  i=3;     
A ob;     
return i; 
               }  
Programul următor afișează:`,
    code: `#include<iostream.h>   
int i;   
class A 
{ 
int main() 
{     
cout << foo() << endl;     
return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `2`,
      b: `0`,
      c: `1`,
      d: `3`,
    },
    correctAnswer: "d",
  },
  {
    id: 146,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Pentru ca secvența de mai jos să se execute fără erori, precizați care dintre implementările 
C++ de mai jos, ale unui operator de comparație, este corectă? 

 (C++) 
class Box 
{ 
        int capacity; 
     public: 
         Box(){} 
         Box(double capacity){ 
                this->capacity = capacity; 
              }};`,
    code: `int main() 
{ 
   Box b1(10); 
   Box b2 = Box(14); 
   if(b1 < b2) 
{ 
  cout<<"Box 2 has large capacity."; 
               
} 
  else{ 
  cout<<"Box 1 has large capacity."; 
              } 
  return 0; 
}`,
    codeLanguage: "c",
    options: {
      a: `bool operator<(Box b){return b1 > b2 ? true : false;}`,
      b: `bool operator<(Box b){return this->capacity < b.capacity ? true : false;}`,
      c: `bool operator<(Box b){ return this < b ? true : false;}`,
      d: `bool operator<(Box b){return this->capacity > b.capacity ? true : false;}`,
    },
    correctAnswer: "b",
  },
  {
    id: 147,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Supraîncărcarea unor operatori în C++ se poate realiza prin funcţii operator sau prin 
funcţii friend. Una dintre diferențele dintre aceste două posibilități constă în:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `obiectul returnat;`,
      b: `nu există nicio diferență`,
      c: `aritatea operatorului.`,
      d: `lista de parametri;`,
    },
    correctAnswer: "d",
  },
  {
    id: 148,
    moduleId: "programming",
    subjectId: "poo-cpp",
    text: `Precizați de câte ori se realizează mecanismul de suprascriere și de câte ori mecanismul 
de supraîncărcare în următoarele clase C++: 
protected: 
int salariu; 
public: 
 public: 
  cout<salariu<<" "<spor; 
} 
 

 (C++) 
  cout<salariu<<" "<spor<<" "<salariu + this->spor;`,
    code: `class Angajat { 
 void afiseazaSalariu() { 
   cout<salariu; 
} 
}; 
 
class Economist: public Angajat { 
 int spor; 
 void afiseazaSalariu() { 
 void afiseazaSalariu(int bonus) { 
  cout<<mesaj<<” ”<<aux; 
  return aux; 
} 
};`,
    codeLanguage: "c",
    options: {
      a: `două suprascrieri și o supraîncărcare`,
      b: `suprascriere și două supraîncărcări`,
      c: `trei suprascrieri și o supraîncărcare`,
      d: `suprascriere și o supraîncărcare`,
    },
    correctAnswer: "b",
  },
];
