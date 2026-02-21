import type { Question } from "@/data/types";

export const bazeDeDate: Question[] = [
  {
    id: 301,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `O bază de date reprezintă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Un ansamblu de posturi de lucru, fişiere şi unităţi de prelucrare`,
      b: `Un ansamblu de articole secvenţiale accesate direct`,
      c: `Un ansamblu de înregistrări accesate în paralel`,
      d: `Un ansamblu integrat de înregistrări sau de fişiere interconectate în mod logic`,
    },
    correctAnswer: "a",
  },
  {
    id: 302,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Depozitul de date reprezintă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O colecţie de informaţii privind un sector dintr-o întreprindere sau o firmă`,
      b: `O bază de date împreună cu SGBD-ul asociat`,
      c: `O colecţie de date organizate secvenţial`,
      d: `O bază de date special concepută prin agregarea tuturor datelor dintr-o organizaţie sau întreprindere, în vederea sprijinirii procesului de luare a deciziilor`,
    },
    correctAnswer: "a",
  },
  {
    id: 303,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Nivelul fizic de abstractizare a datelor permite:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Proiectarea dicţionarului de date`,
      b: `Asigurarea securităţii datelor`,
      c: `Automatizarea operaţiilor de întreţinere şi dezvoltare a programelor`,
      d: `Descrierea structurii sub care datele se regăsesc pe suportul de memorare`,
    },
    correctAnswer: "a",
  },
  {
    id: 304,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Când se recomandă să se introducă datele într-o baza de date?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `După crearea fiecărei tabele în parte`,
      b: `După crearea tuturor tabelelor şi definirea restricţiilor`,
      c: `După crearea tuturor tabelelor`,
      d: `Oricând`,
    },
    correctAnswer: "a",
  },
  {
    id: 305,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Care dintre următoarele enunţuri caracterizează modelul relaţional?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Este singurul model în care structura datelor este definită prin normalizare`,
      b: `Asigură independenţa dintre date şi prelucrări`,
      c: `Este fundamentat pe teoria matematică a relaţiilor`,
      d: `Respectă restricţiile referenţiale`,
    },
    correctAnswer: "a",
  },
  {
    id: 306,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Intersecţia a două relaţii:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Are ca rezultat o relaţie cu un număr dublu de linii`,
      b: `Are ca rezultat o relaţie cu un număr de două ori mai mic de linii`,
      c: `Este o operaţie unară`,
      d: `Cere ca acestea sa aibă aceeaşi schemă`,
    },
    correctAnswer: "a",
  },
  {
    id: 307,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dă tabelul: 
ANGAJATI (CodAngaj, Nume, DataAngajare, Compartiment, Profesia, Salariu) 
Care dintre următoarele instrucţiuni (Transact) SQL permite afişarea numărului de salariaţi 
pentru fiecare compartiment care incepe cu litera "J"?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT COUNT(CodAngajat) AS Numar, Compartiment FROM ANGAJATI WHERE Compartiment LIKE ‘J%’ GROUP BY Compartiment`,
      b: `SELECT CodAngajat, Nume, Compartiment FROM ANGAJATI WHERE Nume LIKE ‘J%’`,
      c: `SELECT COUNT(CodAngajat) AS Numar, Nume, Compartiment FROM ANGAJATI WHERE Compartiment LIKE ‘J%’ GROUP BY Compartiment`,
      d: `SELECT CodAngajat, Nume, Compartiment FROM ANGAJATI 2 WHERE Compartiment LIKE ‘J%’`,
    },
    correctAnswer: "a",
  },
  {
    id: 308,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ce se va obţine prin următoarea interogare (Transact) SQL:`,
    code: `SELECT Nume FROM STUDENTI INNER JOIN LOCALIT 
ON STUDENTI.CodLoc=LOCALIT.CodLoc 
WHERE CodLoc IN 
(SELECT CodLoc FROM STUDENTI WHERE Nume = ‘Ionescu M Petre’) ?`,
    codeLanguage: "sql",
    options: {
      a: `Numele studenţilor asemănătoare cu Ionescu M Petre`,
      b: `Codul localităţii din care este studentul Ionescu M Petre`,
      c: `Numărul studenţilor care sunt din aceeaşi localitate cu Ionescu M Petre`,
      d: `Numele studenţilor care sunt din aceeaşi localitate cu Ionescu M Petre`,
    },
    correctAnswer: "a",
  },
  {
    id: 309,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dă următoarea instrucțiune (Transact) SQL: 
În urma execuţiei acestei interogări se obţin:`,
    code: `SELECT NrFactura 
FROM CLIENTI INNER JOIN FACTURIEMISE ON 
CLIENTI.CodClient=FACTURIEMISE.Codclient 
WHERE ValTot IN (100, 200)`,
    codeLanguage: "sql",
    options: {
      a: `Numai facturile emise cu valoare intre 100 şi 200, exclusiv capetele`,
      b: `Numai facturile emise cu valoare între 100 şi 200, inclusiv aceste valori`,
      c: `Numai facturile emise cu valoarea de 100 sau 200`,
      d: `Numai facturile emise cu valoare fie mai mică de 100, fie mai mare de 200`,
    },
    correctAnswer: "a",
  },
  {
    id: 310,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dă tabelul: 
CHITANTE (NrChitanta, Suma, Data, NrGhiseu ) 
Care dintre următoarele instrucţiuni (Transact) SQL are ca efect afişarea zilelor in care  
s-au emis cel puţin 3 chitanţe?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT Nrchitanta, Suma, Data FROM CHITANTE WHERE COUNT(NrChitanta)>=3`,
      b: `SELECT Nrchitanta, Suma, Data FROM CHITANTE HAVING COUNT(NrChitanta)>=3`,
      c: `SELECT COUNT(Data), COUNT(NrChitanta) FROM CHITANTE WHERE Data IS NULL`,
      d: `SELECT CHITANTE.Data FROM CHITANTE GROUP BY CHITANTE.Data HAVING 
COUNT(NrChitanta) >= 3 
 
11 Se dă tabelul: 
ANGAJATI (CodAngaj, Nume, DataAngajare, Compartiment, Profesia, Salariu) 
Care dintre următoarele instrucţiuni (Transact) SQL permite majorarea salariului cu 3% pentru 
salariaţii angajaţi în anul 2025? 
a. UPDATE Angajati SET Salariu = Salariu + 3% WHERE DataAngajare IN 2025 
b. UPDATE Salariu FROM Angajati SET Salariu=Salariu + 3%* Salariu  
     WHERE DataAngajare IN (‘1/1/2025’ , ‘31/12/2025’) 
c. UPDATE Angajati SET Salariu = Salariu*1.03 WHERE YEAR(DataAngajare)= 2025 
d. UPDATE Salariu FROM Angajati SET Salariu = Salariu * 1.03`,
    },
    correctAnswer: "a",
  },
  {
    id: 311,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dă entitatea ANGAJATI, cu următoarele atribute:  
ANGAJATI (CodAngaj, Nume, DataAngajare, Compartiment, Profesia, Salariu) 
Care dintre următoarele instrucţiuni (Transact) SQL permite ştergerea salariaţilor angajati înainte 
de începutul anului 2025, cu profesia "informatician"?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `DELETE FROM Angajati WHERE DataAngajare < ‘1/12/2024’ AND Profesia LIKE ‘%informatician%’`,
      b: `DELETE * FROM Angajati WHERE Profesia LIKE ‘informatician’ HAVING 3 YEAR(DataAngajare) < 2025`,
      c: `UPDATE Angajati SET CodAngaj = Null WHERE DataAngajare <’1/1/2025’ AND Profesia LIKE ‘%informatician%’`,
      d: `DELETE FROM Angajati WHERE DataAngajare < ’1/1/2025’ AND Profesia LIKE ‘%informatician%’`,
    },
    correctAnswer: "a",
  },
  {
    id: 312,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Care dintre urmatoarele comenzi SQL sunt destinate manipulării datelor?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `INSERT`,
      b: `CREATE TABLE`,
      c: `DROP TABLE`,
      d: `ROLLBACK`,
    },
    correctAnswer: "a",
  },
  {
    id: 313,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ce folosiți atunci când doriți să identificați în mod unic fiecare înregistrare a unui tabel?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Valoarea implicită a unui câmp special prevăzut`,
      b: `Cheia primară`,
      c: `O regulă de validare`,
      d: `Un filtru aplicat întregului set de înregistrări`,
    },
    correctAnswer: "a",
  },
  {
    id: 314,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Când creaţi o bază de date, care sunt fişierele care trebuie create obligatoriu?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Un fişier de date primar`,
      b: `Un fişier de date primar şi un fişier de log`,
      c: `Un fişier de date primar, un fişier de date secundar şi un fişier de log`,
      d: `Un fişier de log primar`,
    },
    correctAnswer: "a",
  },
  {
    id: 315,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Pentru o bază de date care stochează datele despre producțiile cinematografice românești, 
relația dintre entitățile ACTOR și FILM este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nu există`,
      b: `Este o relație unu la mai mulți (one to many)`,
      c: `Este o relație mai mulți la mai mulți (many to many)`,
      d: `Este o relație unu la unu (one to one)`,
    },
    correctAnswer: "a",
  },
  {
    id: 316,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Care este scopul utilizării unei interogări intr-o bază de date?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Afişează şi modifică relaţii dintre tabele`,
      b: `Modifică modul de stocare a datelor pe suporţii magnetici`,
      c: `Extrage şi analizează datele`,
      d: `Extrage date pentru a fi imprimate`,
    },
    correctAnswer: "a",
  },
  {
    id: 317,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Folosind relaţia cadru_did(cod, nume, graddid, data_ang, sal_neg, sal_merit), să se specifice 
care dintre următoarele exemple este corectă: 

 
 
4`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT avg(sal_neg) FROM cadru_did`,
      b: `SELECT graddid, sum(sal_neg) FROM cadru_did`,
      c: `SELECT graddid, sum(sal_neg), count(cod) FROM cadru_did GROUP BY data_ang`,
      d: `SELECT graddid, avg(sal_neg) FROM cadru_did WHERE avg(sal_neg) > 1800`,
    },
    correctAnswer: "a",
  },
  {
    id: 318,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Interogarea:`,
    code: `SELECT min(nume), sum(nume), count(*) 
      FROM tabela  
      WHERE  salariu = max(salariu)`,
    codeLanguage: "sql",
    options: {
      a: `Este greşită deoarece funcţia min() nu se foloseşte cu şiruri de caractere`,
      b: `Este corectă`,
      c: `Este greşită deoarece funcţia max() nu se foloseşte în clauza WHERE`,
      d: `Este greşită deoarece nu se foloseşte * în funcţia count()`,
    },
    correctAnswer: "a",
  },
  {
    id: 319,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se poate folosi acelaşi nume pentru mai multe tabele?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Da, dar să nu aparţină aceleeaşi`,
      b: `Da, dacă nu aparţin aceleeaşi scheme`,
      c: `Nu`,
      d: `Da, dar să nu aparţină aceleeaşi instanţe`,
    },
    correctAnswer: "a",
  },
  {
    id: 320,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ce tip de integritate cere ca toate liniile unui tabel să aibă un identificator unic, cunoscut 
ca cheie primara?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Integritatea de domeniu`,
      b: `Integritatea entităţii`,
      c: `Integritatea de coloană`,
      d: `Integritatea referenţială`,
    },
    correctAnswer: "a",
  },
  {
    id: 321,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Avem apriori o multitudine de restricţii, dată de o mulţime de dependenţe funcţionale  F. 
Aceasta este folosită la:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Normalizarea bazei de date`,
      b: `Crearea bazei de date`,
      c: `Crearea procedurilor de interogare`,
      d: `Construcţia algebrei relaţionale`,
    },
    correctAnswer: "a",
  },
  {
    id: 322,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Fie tabelul METEO(localit  varchar(30), tempmin numeric(3), tempmax numeric(4)). 
Să se stabilească în care dintre exemplele următoare se folosesc incorect operatorii aritmetici:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT localit, -tempmin minim, +tempmax maxim FROM meteo`,
      b: `SELECT localit, (tempmax-tempmin) diferenta FROM meteo`,
      c: `SELECT localit, (tempmax-tempmin)-1 FROM meteo`,
      d: `SELECT localit*2, tempmax*2 FROM meteo`,
    },
    correctAnswer: "a",
  },
  {
    id: 323,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Operatorul NOT nu se poate folosi cu:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Operatorul LIKE`,
      b: `Operatorul IS NULL`,
      c: `Operatorul >`,
      d: `Operatorul IN (lista)`,
    },
    correctAnswer: "a",
  },
  {
    id: 324,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Interogarea:`,
    code: `SELECT MIN (nume), SUM (nume), COUNT (*) 
FROM tabela 
WHERE salariu = MAX (salariu)`,
    codeLanguage: "sql",
    options: {
      a: `Este greşită deoarece funcţia MIN () nu se foloseşte cu şiruri de caractere`,
      b: `Este greşită deoarece nu se foloseşte * în funcţia COUNT()`,
      c: `Este incorecta deoarece funcţia SUM() nu se foloseşte cu şiruri de caractere`,
      d: `Este corectă deoarece funcţia MAX() se foloseşte în clauza WHERE`,
    },
    correctAnswer: "a",
  },
  {
    id: 325,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dau tabelele: 
PERSONAL(Marca, Numepren, Compart, Datasv, Salorar, Salorarco, Compart) 
PONTAJE(Marca, Data, Orelucrate, Oreco, Orenoapte, Oreabsnem) 
Ce afişează următoarea interogare?`,
    code: `SELECT ZILE1.Data AS Ziua 
FROM (SELECT Data FROM PONTAJE po INNER JOIN PERSONAL pe ON 
po.Marca=pe.Marca WHERE Numepren = 'Popescu') ZILE1 
INNER JOIN (SELECT Data FROM PONTAJE po INNER JOIN PERSONAL pe ON 
po.Marca =pe.Marca WHERE Numepren='Georgescu') ZILE2 
ON ZILE1.Data=ZILE2.Data`,
    codeLanguage: "sql",
    options: {
      a: `Angajatul care a lucrat mai multe zile`,
      b: `Numărul total de zile în care au lucrat cei doi angajaţi`,
      c: `Numărul de zile lucrate de fiecare angajat`,
      d: `Zilele în care au lucrat simultan cei doi angajaţi`,
    },
    correctAnswer: "a",
  },
  {
    id: 326,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dau tabelele: 
ANGAJATI(ID_Angajat, Nume, ID_Compart, Salariu) 
COMPARTIMENT (ID_Compart, Nume_Compart) 
şi următoarea interogare: 
Ce operaţii implementează această interogare?`,
    code: `SELECT a.ID_Angajat, a.Nume, c.ID_Compart, c. Nume_Compart 
FROM ANGAJATI a, COMPARTIMENT c 
WHERE a. ID_Compart = c. ID_Compart`,
    codeLanguage: "sql",
    options: {
      a: `ID_Angajat, a.Nume, c.ID_Compart, c. Nume_Compart FROM ANGAJATI a, COMPARTIMENT c WHERE a. ID_Compart = c. ID_Compart Ce operaţii implementează această interogare? a. Diferenţa, proiecţia şi join`,
      b: `Selecţia, intersecţia şi join`,
      c: `Intersecţia, proiecţia şi join`,
      d: `Selecţia, proiecţia şi join`,
    },
    correctAnswer: "a",
  },
  {
    id: 327,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Se dau tabelele: 
PERSONAL(Marca, Numepren, Compart, Datasv, Salorar, Salorarco, Compart) 
PONTAJE(Marca, Data, Orelucrate, Oreco, Orenoapte, Oreabsnem) 
Ce afişează următoarea interogare?`,
    code: `SELECT po1.Marca, pe1.Numepren, 
COUNT(DISTINCT po1.Data) AS Zile_Lucrate, 
COUNT(DISTINCT po2.Data) AS Zile_Lucrate_Comp 
FROM (PONTAJE po1 INNER JOIN PERSONAL pe1 ON po1.Marca=pe1.Marca), 
(PONTAJE po2 INNER JOIN PERSONAL pe2 ON po2.Marca=pe2.Marca) 
WHERE po1.Orelucrate > 0 AND po2.Orelucrate > 0 AND pe2.Numepren='Ionescu' 
GROUP BY po1.Marca, pe1.Numepren, po2.Marca 
HAVING COUNT (DISTINCT po1.Data)> COUNT(DISTINCT po2.Data)`,
    codeLanguage: "sql",
    options: {
      a: `Numărul de ore lucrate pentru toţi angajaţii, mai puţin pentru 'Ionescu'`,
      b: `Numărul angajaţilor care au aceleaşi zile lucrate cu 'Ionescu'`,
      c: `Angajaţii care lucrează în acelaşi timp cu 'Ionescu'`,
      d: `Angajaţii cu un număr de zile lucrate mai mare decât ale lui 'Ionescu'`,
    },
    correctAnswer: "a",
  },
  {
    id: 328,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `O bază de date distribuită este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O colecţie de date împărţită în mai multe fragmente`,
      b: `O colecţie de date împărţită în mai multe replici`,
      c: `O colecţie de date şi de scheme partajate şi interconectate logic, distribuite fizic pe calculatoarele unei reţele`,
      d: `O colecţie de fragmente mixte`,
    },
    correctAnswer: "a",
  },
  {
    id: 329,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Baza de date curentă include o tabelă numită Employees  cu următoarele coloane: 
- firstName,  care păstrează prenumele unui angajat; 
- lastName,  care păstrează numele unui angajat;  
- depID,  care păsrează  ID –ul departamentului în care lucrează angajaţii. 
Aţi cerut să se afişeze o listă cu angajaţii sortată descrescător după ID departament, apoi 
crescător după numele angajaţilor (prenume urmat de nume) în ordinea alfabetică.`,
    code: `Ce instrucţiune SELECT trebuie să folosiţi?`,
    codeLanguage: "sql",
    options: {
      a: `SELECT depID, (firstName + ' ' + lastName) AS 'Full Name' FROM Employees ORDER BY depID, lastName ASC`,
      b: `SELECT (firstName + ' ' + lastName) AS 'Full Name' FROM Employees ORDER BY depID DESC, 'Full Name'`,
      c: `SELECT lastName, (firstName + ' ' + lastName) AS 'Full Name' FROM Employees ORDER BY lastName, depID`,
      d: `SELECT (firstName + ' ' + lastName) AS 'Full Name' FROM Employees ORDER BY depID DESC, lastName`,
    },
    correctAnswer: "a",
  },
  {
    id: 330,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Datorită mutării activităţii comerciale din Germania în SUA, trebuie să schimbăm  
collation data pentru baza de date Adventure Works. După modificarea collation pentru această 
bază de date, ce ar mai trebui să faceţi?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nimic.`,
      b: `Ştergeţi indecşii şi constrângerile tabelelor existente pentru care collation cere să fie modificat. Modificaţi collation pentru coloanele acelor tabele.Recreaţi indecşii şi constrângerile.`,
      c: `Ştergeţi indecşii şi constrângerile pentru toate tabele existente din baza de date. Modificaţi collation pentru coloanele acelor tabele.Recreaţi indecşii şi constrângerile.`,
      d: `Modificaţi database collation şi selectaţi opţiunea auto-indexing.`,
    },
    correctAnswer: "a",
  },
  {
    id: 331,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ce se va obţine prin următoarea interogare (Transact) SQL: 
Petre’) ?`,
    code: `SELECT Nume FROM STUDENTI INNER JOIN LOCALIT ON 
STUDENTI.CodLoc=LOCALIT.CodLoc 
WHERE CodLoc NOT IN (SELECT CodLoc FROM STUDENTI WHERE Nume = ‘Ionescu M`,
    codeLanguage: "sql",
    options: {
      a: `Numele studenţilor asemănătoare cu 'Ionescu M Petre'`,
      b: `Codul localităţii din care este studentul 'Ionescu M Petre'`,
      c: `Numele studenţilor care nu sunt din aceeaşi localitate cu 'Ionescu M Petre'`,
      d: `Numărul studenţilor care nu sunt din aceeaşi localitate cu 'Ionescu M Petre'`,
    },
    correctAnswer: "a",
  },
  {
    id: 332,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Pentru a afişa numele angajaţilor care au un salariu mai mare decât al  cel puţin unui manager 
existent, ar trebui să folosiţi instrucţiunea: 
Trebuie să creaţi  o instrucţiune alternativă care să dea acelaşi rezultat şi care să se execute cel 
puţin la fel de rapid. 
Ce instrucţiune ar trebui să folosiţi ?`,
    code: `SELECT name FROM Employees 
      WHERE salary > ANY (SELECT salary FROM Management).`,
    codeLanguage: "sql",
    options: {
      a: `SELECT name FROM Employees WHERE NOT salary < ALL (SELECT salary FROM Management)`,
      b: `SELECT name FROM Employees WHERE NOT EXISTS (SELECT * FROM Management WHERE salary >= Employees.salary)`,
      c: `SELECT name FROM Employees WHERE EXISTS (SELECT * FROM Management WHERE salary < Employees.salary)`,
      d: `SELECT name FROM Employees JOIN Management ON Employees.salary > Management.salary`,
    },
    correctAnswer: "a",
  },
  {
    id: 333,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ce se va afişa în urma executării instrucţiunii SQL:`,
    code: `SELECT id_departament, MAX(data_angajare) 
FROM angajati 
GROUP BY id_departament`,
    codeLanguage: "sql",
    options: {
      a: `Afişează, pentru fiecare înregistrare în parte, valoarea maximă dintre data angajării şi id-ul departamentului`,
      b: `Afişează id departament şi, pentru acel id, data celei mai noi angajări`,
      c: `Afişează id departament şi, pentru pentru acel id, data celei mai vechi angajări`,
      d: `Afişează id departament cu cea mai nouă dată de angajare`,
    },
    correctAnswer: "a",
  },
  {
    id: 334,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Trebuie să creaţi o tabelă nouă şi să o populaţi cu aceste date folosind cel mai mic număr de 
instrucţiuni posibil.Ce ar trebui să faceţi ?`,
    code: `Aţi scris o instrucţiune SELECT complexă care afişează date din mai multe tabele.`,
    codeLanguage: "sql",
    options: {
      a: `Creaţi tabela şi apoi folosiţi instrucţiunea INSERT INTO ... SELECT FROM pentru a o popula.`,
      b: `Folosiţi o instrucţiune SELECT INTO pentru a crea şi popula tabela.`,
      c: `Folosiţi o instrucţiune SELECT INTO pentru a crea şi popula o tabelă temporară, apoi creaţi tabela permanentă din tabela temporară.`,
      d: `Creaţi tabela, apoi folosiţi o instrucţiune SELECT INTO pentru a o popula.`,
    },
    correctAnswer: "a",
  },
  {
    id: 335,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Firma la care lucraţi vinde echipamente de la fabricanţi  multipli care folosesc  ID-uri de 
produse similare şi este nevoie să se urmărească ID produs, ID fabricant, nume produs, preţ 
produs pentru fiecare piesă de echipament din tabela Products. Trebuie să vă asiguraţi că nu sunt 
permise intrări multiple pentru acelaţi produs. Ce instrucţiune ar trebui folosită ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `CREATE TABLE Products ( productID int PRIMARY KEY, manufacturerID int, productName varchar(50), price decimal(7,2))`,
      b: `CREATE TABLE Products ( productID int UNIQUE, 8 manufacturerID int PRIMARY KEY, productName varchar(50), price decimal(7,2))`,
      c: `CREATE TABLE Products ( productID int, manufacturerID int, productName varchar(50) PRIMARY KEY, price decimal(7,2))`,
      d: `CREATE TABLE Products ( productID int, manufacturerID int, productName varchar(50), price decimal(7,2), CONSTRAINT product_key PRIMARY KEY (productID, manufacturerID))`,
    },
    correctAnswer: "a",
  },
  {
    id: 336,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Comanda: 
simulează implementarea operatorilor relaţionali de:`,
    code: `SELECT DISTINCT codp, denp FROM Produse  
WHERE codp > 200 
ORDER BY cantp`,
    codeLanguage: "sql",
    options: {
      a: `Proiecţie şi joncţiune`,
      b: `Selecţie şi intersecţie`,
      c: `Proiecţie şi selecţie`,
      d: `Selecţie şi reuniune`,
    },
    correctAnswer: "a",
  },
  {
    id: 337,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Din categoria funcţiilor de grup face parte:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Funcţia COUNT( )`,
      b: `Funcţia LEN( )`,
      c: `Funcţia ROUND( )`,
      d: `Funcţia RTRIM( )`,
    },
    correctAnswer: "a",
  },
  {
    id: 338,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Dându-se tabelele Produse(codp, denp, pret ) şi Comenzi(nr_cda, codp, cant, data), 
instrucţiunile SELECT: 
AND  p.denp = 'Stilou'`,
    code: `SELECT * 
FROM comenzi c 
WHERE 'Stilou'=(SELECT denp FROM produse p WHERE  p.codp=c.codp) 
  şi 
SELECT c.nr_cda, c.codp, c.cant, c.data 
FROM comenzi c, produse p 
WHERE p.codp=c.codp`,
    codeLanguage: "sql",
    options: {
      a: `Sunt diferite`,
      b: `Sunt identice`,
      c: `Ar fi identice dacă în al doilea SELECT s-ar folosi operatorul OR şi nu AND`,
      d: `Ar fi identice dacă în primul SELECT s-ar folosi operatorul IN şi nu =`,
    },
    correctAnswer: "a",
  },
  {
    id: 339,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Comanda DROP nume_tabela este echivalentă cu comanda:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `DELETE FROM nume_tabela`,
      b: `TRUNCATE TABLE nume_tabela`,
      c: `ALTER TABLE nume_tabela DROP column all`,
      d: `Cu nici una`,
    },
    correctAnswer: "a",
  },
  {
    id: 340,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Folosind tabela cadru_did(cod, nume, graddid, data_ang, sal_neg, sal_merit), creată şi 
populată cu date, să se specifice care dintre exemplele următoare este corect:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT SUM(sal_neg) FROM cadru_did`,
      b: `SELECT graddid, SUM(sal_neg) FROM cadru_did`,
      c: `SELECT graddid, SUM(sal_neg) FROM cadru_did WHERE SUM(sal_neg) > 10000`,
      d: `SELECT graddid, SUM(sal_neg), COUNT(graddid) FROM cadru_did GROUP BY data_ang`,
    },
    correctAnswer: "a",
  },
  {
    id: 341,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Un utilizator a șters accidental o linie din tabela Produse, care conține o coloană IDENTITY 
numită  id. Când încercați să reinserați aceleași date care au fost în linia ștearsă,  primiți un 
mesaj de eroare. Ce ar trebui să faceți?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Puneți pe on proprietatea IDENTITY_INSERT folosind SQL Server Management Studio (SSMS) și apoi inserați linia.`,
      b: `Executați instrucțiunea SET IDENTITY_INSERT Produse ON și apoi inserați linia.`,
      c: `Ștergeți proprietatea IDENTITY pentru coloana id folosind SQL Server Management Studio (SSMS) și apoi inserați linia.`,
      d: `Reinițializați valoarea id cu cea a liniei șterse și apoi inserați linia.`,
    },
    correctAnswer: "a",
  },
  {
    id: 342,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `liniile din prima tabelă și numai liniile care îndeplinesc condiția din JOIN din a doua tabelă. 
Ce tip de JOIN ar trebui să folosiți?`,
    code: `Scrieți o instrucțiune SELECT care extrage date din două tabele. Trebuie să returnați toate`,
    codeLanguage: "sql",
    options: {
      a: `LEFT`,
      b: `RIGHT`,
      c: `INNER`,
      d: `FULL`,
    },
    correctAnswer: "a",
  },
  {
    id: 343,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Compania dumneavoastră are un număr de mașini care sunt folosite de angajați pentru o 
perioadă scurtă de timp. În acest scop aveți o tabelă numită Cars, care păstrează informații 
despre mașini și o tabelă numită  CarAssignments, care stochează mașinile asignate fiecărui 
angajat. Trebuie să creați o constrângere care să  vă asigure că toate valorile atribuite 
coloanei car_id  din tabela CarAssignments  corespund unei valori a coloanei id din tabela 
Cars. De asemenea, trebuie să vă asigurați că, dacă se șterge o linie din tabela Cars, se vor 
șterge și liniile din tabela  CarAssignments care o referențiază. Ce instrucțiune ar trebui 
folosită?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `ALTER TABLE CarAssignments ADD CONSTRAINT FK_car_id FOREIGN KEY (car_id) REFERENCES Cars (id) ON DELETE CASCADE;`,
      b: `ALTER TABLE CarAssignments ADD CONSTRAINT FK_car_id FOREIGN KEY (car_id) REFERENCES Cars (id) ON DELETE SET NULL;`,
      c: `ALTER TABLE CarAssignments ADD CONSTRAINT FK_car_id FOREIGN KEY (car_id) REFERENCES Cars (id);`,
      d: `ALTER TABLE CarAssignments ADD CONSTRAINT FK_car_id FOREIGN KEY (car_id) REFERENCES Cars (id) ON DELETE NO ACTION;`,
    },
    correctAnswer: "a",
  },
  {
    id: 344,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Compania dumneavoastră folosește tabela WebSites pentru a urmări informația despre 
traficul zilnic al mai multor Web sites. Tabela include și următoarele coloane: 

 
 
10 
 
- id,  care stochează ID  Web site; 
- hits,  care păstrează numărul de accesări ale site-ului din acea zi. 
Trebuie să afișați numărul mediu de accesări zilnice pentru fiecare  Web site. 
Ce instrucțiune ar trebui să folosiți?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT SUM(hits)/COUNT(id) FROM WebStats GROUP BY id;`,
      b: `SELECT COUNT(*), AVG(hits) FROM WebStats GROUP BY hits;`,
      c: `SELECT id, AVG(hits) FROM WebStats GROUP BY id;`,
      d: `SELECT AVG(hits) FROM WebStats;`,
    },
    correctAnswer: "a",
  },
  {
    id: 345,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ați creat tabela Angajati cu instrucțiunea: 
Se vor adăuga, apoi,  patru persoane: 
- ”Angajat unu” în  departamentul Sales; 
- “Angajat doi” în departamentul Sales; 
- “Angajat trei” în departamentul Marketing; 
- “Angajat patru” în departamentul HR. 
Trebuie să adăugați acești angajați tabelei Angajati folosind cea mai mică secvență de cod. Care 
interogare ar trebui executată în acest scop?`,
    code: `CREATE TABLE Angajati (nume varchar(20), departament varchar(20));`,
    codeLanguage: "sql",
    options: {
      a: `INSERT INTO Angajati (nume, departament) 
    VALUES (' Angajat unu’, 'Sales'); 
INSERT INTO Angajati (nume, departament) 
    VALUES (' Angajat doi', 'Sales'); 
INSERT INTO Angajati (nume, departament) 
    VALUES (' Angajat trei', 'Marketing'); 
INSERT INTO Angajati (nume, departament) 
    VALUES (' Angajat patru', 'HR');`,
      b: `INSERT INTO Angajati (nume, departament) VALUES (' Angajat unu', 'Sales'), (' Angajat doi', 'Sales'), (' Angajat trei', 'Marketing'), (' Angajat patru', 'HR');`,
      c: `INSERT INTO Angajati 
    VALUES (' Angajat unu', 'Sales'); 
INSERT INTO Angajati 
    VALUES (' Angajat doi', 'Sales'); 
INSERT INTO Angajati 
    VALUES (' Angajat trei', 'Marketing'); 
INSERT INTO Angajati 
    VALUES (' Angajat patru', 'HR');`,
      d: `INSERT INTO Angajati VALUES (' Angajat unu', 'Sales'), (' Angajat doi', 'Sales'), (' Angajat trei', 'Marketing'), (' Angajat patru', 'HR');`,
    },
    correctAnswer: "a",
  },
  {
    id: 346,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ce clauză trebuie adăugată după următoarea instrucţiune Transact SQL, pentru a fi corect 
executată?`,
    code: `SELECT id_departament , COUNT(id_angajat) 
FROM angajati 
GROUP BY id_departament`,
    codeLanguage: "sql",
    options: {
      a: `WHERE MAX (salariu) > 1500`,
      b: `HAVING salariu > 1500`,
      c: `ORDER BY salariu`,
      d: `HAVING MIN(salariu) > 1000`,
    },
    correctAnswer: "a",
  },
  {
    id: 347,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Ați creat tabela Angajati, în care păstrați informațiile despre angajații firmei unde lucrați, cu 
instrucțiunea: 
Trebuie să vă asigurați că angajații vor putea fi introduși în tabelă cu valoarea NULL în coloana 
nume, dar fără valori de tip NULL în coloanele telefon și email(simultan). Cum ar trebui să 
modificați coloanele tabelei?`,
    code: `CREATE TABLE Angajati ( nume varchar(50), telefon char(10), email varchar(20)).`,
    codeLanguage: "sql",
    options: {
      a: `Adăugați o constrângere CHECK (telefon IS NOT NULL OR email IS NOT NULL) pe coloana telefon.`,
      b: `Adăugați NOT NULL la coloanele telefon și email.`,
      c: `Adăugați NULL la coloana nume.`,
      d: `Adăugați constrângerea CHECK(telefon IS NOT NULL OR email IS NOT NULL) pe tabelă.`,
    },
    correctAnswer: "a",
  },
  {
    id: 348,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Avand tabelele cadrudid(cod(PK), nume, graddid, cod_fac_ang(FK)) și 
facultate(cod_fac(PK), denumire),instrucțiunea  
are ca rezultat al execuției:`,
    code: `SELECT c.graddid, COUNT (c.graddid) Numar 
FROM cadrudid c JOIN facultate f ON c.cod_fac_ang = f.cod_fac 
WHERE f.denumire IN ('drept', 'informatica') 
GROUP BY c.graddid`,
    codeLanguage: "sql",
    options: {
      a: `Este incorect scrisă, pentru că nu putem avea simultan clauzele JOIN si WHERE`,
      b: `Afișează , pentru profesorii angajați la facultățile de 'drept' și de 'informatica' , gradul didactic și numărul de profesori care au acel grad didactic`,
      c: `Afișează , pentru profesorii din universitate care predau la facultățile de 'informatica' și 'drept', gradul didactic și numărul de profesori care au acel grad didactic`,
      d: `Afișează numărul total de grade didactice ale profesorilor din facultățile de 'drept' și 'informatica' 3 b. Db-creator c. DBA d. Db-manager`,
    },
    correctAnswer: "a",
  },
  {
    id: 349,
    moduleId: "databases",
    subjectId: "baze-de-date",
    text: `Care dintre următoarele afirmaţii  sunt adevărate despre constrângeri?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Constrângerile la nivel de coloană se aplică pe anumite coloane sau combinaţii de coloane`,
      b: `Dacă nu se specifică un nume pentru constrângere, server-ul de oferă unul`,
      c: `Indecşii creaţi de constrângerile PRIMARY KEY şi UNIQUE KEY pot fi şterşi folosind instrucţiunea DROP INDEX`,
      d: `Constrângerile nu pot fi adăugate sau şterse dintr-o tabelă fără a afecta structura tabelei`,
    },
    correctAnswer: "a",
  },
];
