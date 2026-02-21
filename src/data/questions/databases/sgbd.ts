import type { Question } from "@/data/types";

export const sgbd: Question[] = [
  {
    id: 350,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un SGBD distribuit este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O mulţime de SGBD-uri locale, independente, ce se execută în acelaşi timp`,
      b: `Un software ce permite gestiunea unei BD distribuite şi face distribuţia trans- parentă utilizatorilor`,
      c: `O mulţime de aplicaţii locale şi globale`,
      d: `O mulţime de aplicaţii globale`,
    },
    correctAnswer: "a",
  },
  {
    id: 351,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `O tranzacţie este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O unitate de program ce realizează citiri şi scrieri`,
      b: `O mulţime finită şi ordonată de operaţii de citire, scriere şi terminare`,
      c: `O mulţime finită de operaţii coerente, executate de un SGBD, care manipulează datele unei`,
      d: `O serie finită de operaţii de modificare a datelor dintr-o bază de date ORACLE`,
    },
    correctAnswer: "a",
  },
  {
    id: 352,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Proprietatea de consistenţă a tranzacţiei constă din:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Eliminarea redundanţelor`,
      b: `Izolarea tranzacţiilor în execuţie`,
      c: `Transformarea unei stări consistente într-o stare consistentă`,
      d: `Transparenţa`,
    },
    correctAnswer: "a",
  },
  {
    id: 353,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `O bază de date distribuită se găseşte implementată numai:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Pe un calculator performant`,
      b: `Pe un calculator client`,
      c: `Într-o reţea de calculatoare`,
      d: `Pe un laptop`,
    },
    correctAnswer: "a",
  },
  {
    id: 354,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un SGBD paralel este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O mulţime de SGBD locale independente în execuţie`,
      b: `Un SGBD ce execută in paralel operaţii de intrare / ieşire dintr-o bază de date`,
      c: `Un program ce operează pe baza algoritmilor paraleli`,
      d: `Un SGBD ce se execută pe calculatoare cu mai multe procesoare şi medii de stocare, proiectate să execute o mulţime de operaţii în paralel, pentru o mare performanţă`,
    },
    correctAnswer: "a",
  },
  {
    id: 355,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se dă tabelul 
STUDENT(CNP, Nume, Grupa, Adresa) 
şi următoarea secvenţă ce reprezintă o tranzacţie: 
CREATE table STUDENT_NOU ( CNP NUMBER, Nume VARCHAR(30)) 
UPDATE STUDENT_NOU SET Nume = 'Ionescu' 
Rollback to s2 

 
 
2 
 
Care este rezultatul acestei tranzacţii pentru tabela STUDENT_NOU?`,
    code: `INSERT INTO STUDENT_NOU SELECT CNP, Nume from STUDENT 
Savepoint s1 
UPDATE STUDENT_NOU SET Nume = UPPER(Nume) 
Savepoint s2 
DELETE FROM STUDENT_NOU 
Rollback to s2 
DELETE FROM STUDENT_NOU WHERE CNP=100 
 UPDATE STUDENT_NOU SET Nume = 'Ionescu' WHERE CNP=100 
 Rollback`,
    codeLanguage: "sql",
    options: {
      a: `Avem un student cu numele ‘Ionescu’`,
      b: `Nu avem linii în tabelă`,
      c: `Nu putem să facem Rollback mai mult de o dată pe un punct de reluare`,
      d: `Ultimul UPDATE eşuează deoarece studentul cu CNP-ul 100 a fost şters`,
    },
    correctAnswer: "a",
  },
  {
    id: 356,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Când creaţi o bază de date Microsoft Sql Server, care sunt fişierele care trebuie 
create     
    obligatoriu?`,
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
    id: 357,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Când se determină accesul utilizator la obiecte particulare ale unei , 
cum se aplică permisiunile?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `User, fixed role, group role, fixed server`,
      b: `User, group role, fixed role, fixed server`,
      c: `Permisiunile sunt cumulative, exceptând DENY`,
      d: `Permisiunile se scad, exceptând permisiunile user specificate`,
    },
    correctAnswer: "a",
  },
  {
    id: 358,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele afirmaţii nu este adevărată despre bazele de date Microsoft 
SQL Server?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Bazele de date sunt grupate în “filegroups”`,
      b: `Bazele de date trebuie să fie în acelaşi “filegroup”`,
      c: `Bazele de date pot creşte automat cu un procent`,
      d: `Bazele de date pot avea dimensiuni restricţionate`,
    },
    correctAnswer: "a",
  },
  {
    id: 359,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care grup de instrucţiuni se poate utiliza prin acordarea permisiunilor obiect?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT, UPDATE, INSERT, CREATE`,
      b: `SELECT, EXECUTE, DELETE, INDEX`,
      c: `SELECT, UPDATE, INSERT, DELETE`,
      d: `SELECT, EXECUTE, DELETE,CREATE`,
    },
    correctAnswer: "a",
  },
  {
    id: 360,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Aţi planificat ca Microsoft SQL Server 2000 să facă backups ale unei  
astfel: 
full backup la ora 2:00 a.m.; differential backups din 4 în 4 ore; transaction log 
backups la fiecare 30’. Sistemul cade la 11:24 a.m. După ce se face un full backup 
restore, câte backups transaction logs şi diferenţiale (numărul minim) trebuie 
restaurate pentru a avea pierderi minime în baza de date?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `m.; differential backups din 4 în 4 ore; transaction log 
backups la fiecare 30’. Sistemul cade la 11:24 a.m. După ce se face un full backup 
restore, câte backups transaction logs şi diferenţiale (numărul minim) trebuie 
restaurate pentru a avea pierderi minime în baza de date? 
a. 1 differential, 2 log`,
      b: `1 differetial, 10 log`,
      c: `2 differential, 2 log`,
      d: `2 differential, 1 log`,
    },
    correctAnswer: "a",
  },
  {
    id: 361,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Pentru a preveni problemele ţinând de proprietarul obiectelor unei  
Microsoft SQL Server, ce rol ar trebui să fie asignat unui developer?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Db-owner 4 a. Nu, pentru că nu aveţi permisiunile cerute pe tabele`,
      b: `Nu, dacă nu sunteţi membri sysadmin sau db-owner`,
      c: `Da, dacă aveţi permisiunea EXECUTE pentru procedura stocată`,
      d: `Da, dacă aţi creat declanşatori pentru fiecare tabel`,
    },
    correctAnswer: "a",
  },
  {
    id: 362,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă utilizatorul student crează o tabelă, cine poate interoga tabela?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Numai utilizatorul student`,
      b: `Numai administratorul bazei de date`,
      c: `Utilizatorii care au drept de SELECT pe tabelă`,
      d: `Toţi utilizatorii`,
    },
    correctAnswer: "a",
  },
  {
    id: 363,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Să se aleagă răspunsul corect:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Când o tabelă e ştearsă, toţi indecşii asociaţi sunt şterşi`,
      b: `Întotdeauna se construieşte un index pe coloanele care se actualizează frecvent`,
      c: `Se poate crea un index ce conţine câmpuri din mai multe tabele`,
      d: `Nu se recomandă crearea unui index pe coloanele folosite în joncţiuni`,
    },
    correctAnswer: "a",
  },
  {
    id: 364,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Comanda DROP VIEW vedere are ca efect:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Şterge înregistrările din tabela virtuală`,
      b: `Şterge înregistrările din tabela de bază`,
      c: `Şterge tabela virtuală`,
      d: `Şterge tabela de bază`,
    },
    correctAnswer: "a",
  },
  {
    id: 365,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Serverul Oracle/Microsoft de  crează automat un index când:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Se defineşte o constrângere de tip PRIMARY KEY`,
      b: `Se defineşte o constrângere de tip NOT NULL`,
      c: `Se defineşte o constrângere de tip FOREIGN KEY`,
      d: `Se defineşte o constrângere de tip CHECK`,
    },
    correctAnswer: "a",
  },
  {
    id: 366,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se va crea un index pe o coloană când:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Coloana se utilizează frecvent în clauza WHERE sau într-un JOIN`,
      b: `Tabela este de dimensiuni mici`,
      c: `Coloana conţine un număr foarte mare de valori egale`,
      d: `Tabela este actualizată frecvent`,
    },
    correctAnswer: "a",
  },
  {
    id: 367,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Secvenţa de comenzi: 
             SET AUTOCOMMIT OFF 
 
are ca efect:`,
    code: `DELETE FROM stoc 
   
 ROLLBACK`,
    codeLanguage: "sql",
    options: {
      a: `Nu execută nici o ştergere`,
      b: `Şterge toate înregistrările din tabela stoc`,
      c: `Şterge doar înregistrarea curentă din tabela stoc`,
      d: `Şterge fizic tabela stoc`,
    },
    correctAnswer: "a",
  },
  {
    id: 368,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele instrucţiuni este necesară pentru a defini începutul unei 
tranzacţii explicite în Microsoft Transact-SQL ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `OPEN TRANSACTION`,
      b: `BEGIN TRANSACTION`,
      c: `INSERT TRANSACTION`,
      d: `END TRANSACTION`,
    },
    correctAnswer: "a",
  },
  {
    id: 369,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce problemă de concurenţă apare când o tranzacţie citeşte datele necomise de o 
altă tranzacţie aflată în derulare?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Lost update`,
      b: `Dirty Read`,
      c: `Nonrepeatable Read`,
      d: `Phantom Read`,
    },
    correctAnswer: "a",
  },
  {
    id: 370,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele constrângeri poate fi făcută disable?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `DEFAULT`,
      b: `CHECK`,
      c: `PRIMARY KEY`,
      d: `UNIQUE`,
    },
    correctAnswer: "a",
  },
  {
    id: 371,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Trebuie să modificaţi o procedură stocată şi mai mulţi utilizatori au primit 
permisiunea de execuţie a  ei. Ce instrucţiune ar trebui să utilizaţi pentru a o modifica, 
fără a afecta permisiunile existente?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `DROP PROC`,
      b: `CREATE PROC`,
      c: `ALTER PROC`,
      d: `MOD PROC`,
    },
    correctAnswer: "a",
  },
  {
    id: 372,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele enumerări reprezintă un tip de integritate a datelor 
implementată de o constrângere din serverele relaţionale de  ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Integritatea entității`,
      b: `Integritatea de atribut`,
      c: `Integritatea nereferenţială`,
      d: `Integritatea tipurilor de date`,
    },
    correctAnswer: "a",
  },
  {
    id: 373,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce caracteristică este utilizată pentru a preveni conflictele de actualizare, astfel 
incât utilizatorii să nu poată citi sau modifica datele când alţi utilizatori le modifică?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Tranzacţiile`,
      b: `Blocările`,
      c: `Interogările de tip SQL`,
      d: `Permisiunile de tip UPDATE`,
    },
    correctAnswer: "a",
  },
  {
    id: 374,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Aţi creat o vedere folosind comanda: 
CREATE VIEW dbo.Employee  
    WITH  ENCRYPTION  
trebui să folosiţi?`,
    code: `AS SELECT Name FROM dbo.HumanResources  
        WHERE isEmployee = 1  
        WITH CHECK OPTION 
Trebuie să împiedicaţi alţi utilizatori să copieze vederea. Ce instrucţiune ar`,
    codeLanguage: "sql",
    options: {
      a: `Ce instrucţiune ar trebui să folosiţi? a. ALTER VIEW dbo.Employee WITH ENCRYPTION AS SELECT Name FROM dbo.HumanResources 6 WHERE isEmployee = 1`,
      b: `DENY ALL ON dbo.Employee TO public`,
      c: `ALTER VIEW dbo.Employee AS SELECT Name FROM dbo.HumanResources WHERE isEmployee = 1 WITH CHECK OPTION`,
      d: `ALTER VIEW dbo.Employee WITH SCHEMABINDING AS SELECT Name FROM dbo.HumanResources WHERE isEmployee = 1`,
    },
    correctAnswer: "a",
  },
  {
    id: 375,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se dă secvența de cod următoare: 
PRINT ' Eroare în date!' 
COMMIT TRAN 
END CATCH 
Câte înregistrări ale dbo.tabel vor fi afișate de instrucțiunea SELECT?`,
    code: `CREATE TABLE dbo.tabel 
(ID int NOT NULL PRIMARY KEY) 
GO 
BEGIN TRY 
BEGIN TRAN 
INSERT INTO dbo.tabel VALUES(1) 
INSERT INTO dbo.tabel VALUES(2) 
INSERT INTO dbo.tabel VALUES(1) 
END TRY 
BEGIN CATCH 
SELECT * FROM dbo.tabel`,
    codeLanguage: "sql",
    options: {
      a: `O înregistrare`,
      b: `Două înregistrări`,
      c: `Trei înregistrări`,
      d: `Niciuna`,
    },
    correctAnswer: "a",
  },
  {
    id: 376,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un utilizator are permisiunile INSERT și UPDATE pe un tabel dintr-o bază de 
date, acordate prin rolul Public. El activează un rol aplicație pentru acea bază de 
avea utilizatorul pe tabel?`,
    code: `date, care permite numai permisiunea SELECT pe acel tabel. Ce permisiuni va`,
    codeLanguage: "sql",
    options: {
      a: `SELECT, INSERT, UPDATE`,
      b: `SELECT`,
      c: `INSERT, UPDATE`,
      d: `Nu are permisiuni`,
    },
    correctAnswer: "a",
  },
  {
    id: 377,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Funcțiile definite de utilizator pot returna:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O valoare numerică`,
      b: `O valoare de tip caracter`,
      c: `Un set de înregistrări (de tip tabel)`,
      d: `Toate tipurile de date din celelalte opțiuni`,
    },
    correctAnswer: "a",
  },
  {
    id: 378,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Să se aleagă afirmaţia corectă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Când se şterge o tabelă, indecşii asociaţi rămân până se şterge şi baza de date`,
      b: `Pentru a obţine date ordonate dintr-o tabelă se pot folosi indecşi`,
      c: `Întotdeauna se construieşte un index pe atributele care se actualizează în mod frecvent`,
      d: `Se poate construi un index care conţine câmpuri din mai multe tabele`,
    },
    correctAnswer: "a",
  },
  {
    id: 379,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Considerăm următorul fragment de cod SQL dintr-o procedură stocată. Ce se 
întâmplă dacă apare o eroare în timpul execuției instrucțiunii INSERT? 
... 
PRINT @Val 
IF @@error = 0 
RETURN 1 
ELSE 
RETURN 0 
 
… Bloc i-ni SQL …`,
    code: `INSERT INTO Tabela (Col1) VALUES (@Val)`,
    codeLanguage: "sql",
    options: {
      a: `Procedura stocată continuă cu execuția 'Bloc i-ni SQL'`,
      b: `Se iese din procedura stocată cu valoarea de retur 1`,
      c: `Se iese din procedura stocată cu valoarea de retur 0`,
      d: `Se iese din procedura stocată fără o valoare de retur`,
    },
    correctAnswer: "a",
  },
  {
    id: 380,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se poate folosi acelaşi nume pentru mai multe tabele dintr-un server de baze de 
date ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nu`,
      b: `Da, dacă nu aparţin aceleaşi`,
      c: `Da, dacă aparţin aceleaşi scheme dintr-o bază de date`,
      d: `Nu, dacă aparţin unor instanțe diferite`,
    },
    correctAnswer: "a",
  },
  {
    id: 381,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă utilizatorul “stud” crează o vedere, cine poate face interogări pe acea 
vedere?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Administratorul bazei de date`,
      b: `Utilizatorii care au permisiunea SELECT pe tabela din care extrage vederea datele`,
      c: `Numai utilizatorul “stud”`,
      d: `Numai utilizatorii care au permisiunea SELECT pe vedere`,
    },
    correctAnswer: "a",
  },
  {
    id: 382,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un index Microsoft SQL/Oracle Server poate fi şters de:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Proprietarul tabelei`,
      b: `Numai de proprietarul tabelei`,
      c: `Numai de administratorul bazei de date`,
      d: `Numai de administratorul de sistem gazda`,
    },
    correctAnswer: "a",
  },
  {
    id: 383,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un administrator de bază de date poate:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Crea un utilizator de bază de date`,
      b: `Şterge un utilizator al sistemului(pe care ruleaza serverul de )`,
      c: `Şterge orice tabelă sistem`,
      d: `Șterge orice index creat pe o tabelă sistem`,
    },
    correctAnswer: "a",
  },
  {
    id: 384,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Secvenţa de comenzi Microsoft SQL Server: 
SET IMPLICIT_TRANSACTIONS  OFF  
    
BEGIN TRANSACTION 

 
 
8 
 
are ca efect:`,
    code: `DELETE FROM Tabel_sursa  
  ROLLBACK`,
    codeLanguage: "sql",
    options: {
      a: `Şterge toate înregistrările din tabela “Tabel_sursa”`,
      b: `Şterge doar înregistrarea curentă din “Tabel_sursa”`,
      c: `Nu efectuează nicio ştergere`,
      d: `Şterge toţi indecşii asociaţi tabelei “Tabel_sursa”`,
    },
    correctAnswer: "a",
  },
  {
    id: 385,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Compania dumneavoastră utilizează o procedură stocată numită webAnalysis  
pentru a analiza informația de pe un Web site. Procedura întoarce 1 dacă analiza a 
avut loc cu succes și 0 dacă a existat o problemă. Dumneavoastră creați o 
interogare care execută un grup de operații de întreținere zilnice, incluzând 
procedura webAnalysis. Trebuie să comiteți modificările făcute de procedură, dacă 
analiza a înregistrat succes, fără să afectați execuția altor task-uri executate de 
interogare. Care set de instrucțiuni ar trebui să folosiți?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `BEGIN TRANSACTION; DECLARE @success int; EXEC @success = webAnalysis; IF @success = 0 ROLLBACK; ELSE COMMIT;`,
      b: `BEGIN TRANSACTION; DECLARE @success int; EXEC @success = webAnalysis; IF @success = 0 ROLLBACK;`,
      c: `BEGIN TRANSACTION; DECLARE @success int; EXEC @success = webAnalysis; COMMIT; IF @success = 0 ROLLBACK;`,
      d: `DECLARE @success int; EXEC @success = webAnalysis; IF @success = 0 ROLLBACK; ELSE COMMIT;`,
    },
    correctAnswer: "a",
  },
  {
    id: 386,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă doriți să returnați o valoare dintr-o procedură stocată intr-un parametru, care 
tip de apel trebuie folosit?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `EXECUTE sp_nume 5`,
      b: `EXECUTE sp_nume 5 OUTPU`,
      c: `EXECUTE sp_nume @val OUTPUT`,
      d: `EXECUTE sp_nume @val`,
    },
    correctAnswer: "a",
  },
  {
    id: 387,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă o linie dintr-un tabel s-a modificat de mai multe ori de la ultimul backup full 
al bazei de date, fişierul transaction log backup conţine numai ultimul set de valori 
pentru acea linie? 

 
 
9`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nu, întotdeuna (indiferent de modelul de recovery ales)`,
      b: `Nu, dacă modelul de recovery este Full`,
      c: `Nu, dacă modelul de recovery este Simple`,
      d: `Da, dacă modelul de recovery este Full`,
    },
    correctAnswer: "a",
  },
  {
    id: 388,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Baza de date folosită de dumneavoastră conține o tabelă numită Employees, care 
are o coloană de tip nvarchar(MAX) numită lastName.Aveți deja un index 
clustered numit id_index pe coloana id a tabelei. Unul dintre utilizatorii 
dumneavoastră reclamă timpii de interogare lungi obținuți când folosește coloana 
folosiți?`,
    code: `lastName în clauza WHERE a instrucțiunii SELECT. Ce instrucțiune ar trebui să`,
    codeLanguage: "sql",
    options: {
      a: `ALTER INDEX id_index ON Employees (id, lastName);`,
      b: `CREATE INDEX id_name_index ON Employees (id) INCLUDE (lastName);`,
      c: `CREATE CLUSTERED INDEX name_index ON Employees (lastName);`,
      d: `CREATE INDEX name_index ON Employees (lastName);`,
    },
    correctAnswer: "a",
  },
  {
    id: 389,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `O bază de date folosită de dumneavoastră include o tabelă numită Contractors. 
Aplicațiile folosesc frecvent următoarea instrucțiune pentru a accesa înregistrările 
actualizate după 1 ianuarie 2024:  
    AND lastUpdated > '20240101'; 
Trebuie să reduceți timpul necesar execuției acestei instrucțiuni. Care este soluția 
optimă pentru a obține acest deziderat?`,
    code: `SELECT id, name FROM Contractors 
    WHERE expertise = @searchWord`,
    codeLanguage: "sql",
    options: {
      a: `CREATE INDEX expertise_index ON Contractors (lastUpdated, expertise);`,
      b: `CREATE INDEX expertise_index ON Contractors(lastUpdated) INCLUDE (expertise);`,
      c: `CREATE INDEX expertise_index ON Contractors (expertise) WHERE lastUpdated > '20240101';`,
      d: `CREATE INDEX expertise_index 
    ON Constractors (expertise, lastUpdated); 
 
48 Ocazional doriți să limitați permisiunile unui user sau rol interzicând permisiunile 
la 
acel cont de securitate. Ce face interzicerea permisiunilor pe un anumit cont de 
securitate ? 
a. Asigură că un user sau rol moștenește permisiunile din oricare alt rol pe viitor 
b. Dezactivează permisiunile dacă sunt moștenite din alt rol 
c. Activează permisiunile dacă sunt moștenite din alt rol 
d. Permisiunile nu sunt cumulative pentru un user sau un rol`,
    },
    correctAnswer: "a",
  },
  {
    id: 390,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ați creat o vedere folosind comanda: 
CREATE VIEW dbo.AngajatiNoi 

 
 
10 
 
    AS SELECT 
        Nume, 
        SalariuLunar, 
        (SalariuLunar * 12) AS SalariuAnual, 
        Data_Ang 
            AND Data_Ang > '1/1/2024' 
    WITH CHECK OPTION; 
Trebuie să inserați o linie folosind această vedere. Ce instrucțiune ar trebui să folosiți?`,
    code: `FROM dbo.ResurseUmane 
        WHERE Nume IS NOT NULL`,
    codeLanguage: "sql",
    options: {
      a: `INSERT INTO dbo. AngajatiNoi (Nume, SalariuAnual, Data_Ang) VALUES ('Popa Ion', 50000, '3/12/2024');`,
      b: `INSERT INTO dbo. AngajatiNoi (Nume, SalariuLunar, Data_Ang) VALUES ('Mihnea George', 4000, '5/13/2024');`,
      c: `INSERT INTO dbo. AngajatiNoi (Nume, SalariuLunar, Data_Ang) VALUES ('Stan Remus’, 2500, '11/5/2020');`,
      d: `INSERT INTO dbo. AngajatiNoi (Nume) VALUES ('Tonoiu Petre');`,
    },
    correctAnswer: "a",
  },
  {
    id: 391,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ați creat o tabelă folosind instrucțiunea: 
Un utilizator necesită următoarele tipuri de acces: 
Trebuie să acordați permisiuni pentru a satisface aceste cerințe, fără a da permisiuni 
suplimentare sau a restricționa accesul. Ce ar trebui să faceți?`,
    code: `CREATE TABLE dbo.Products (ID int IDENTITY(1,1) NOT NULL, 
      
Name nvarchar(60) NOT NULL,  Cost decimal(10,2), 
SalePrice decimal(10,2),   CurrentStock bigint,   NumberSold bigint) 
- SELECT pe coloanele Name  și SalePrice; 
- SELECT pe stocul disponibil(diferența dintre CurrentStock și NumberSold ); 
- ALTER pe coloanele Name  și SalePrice.`,
    codeLanguage: "sql",
    options: {
      a: `Acordați utilizatorului permisiunile SELECT și ALTER pe vederea definită de 
instrucțiunea: CREATE VIEW dbo.CustomerProduct AS SELECT Name, 
SalePrice, (CurrentStock - NumberSold) AS AvailableStock FROM dbo.Products.`,
      b: `Acordați utilizatorului permisiunea SELECT pe coloanele Name, SalePrice, CurrentStock și NumberSold și permisiunea ALTER pe coloanele Name și SalePrice din tabela Products.`,
      c: `Acordați utilizatorului permisiunea ALTER pe vederea definită de instrucțiunea: 
CREATE VIEW dbo.CustomerProductSelect AS SELECT Name, SalePrice, 
(CurrentStock - NumberSold) AS AvailableStock FROM dbo.Products.`,
      d: `Acordați rolului Public permisiunea SELECT pe coloanele Name, SalePrice, 
CurrentStock și NumberSold și permisiunea ALTER  pe coloanele Name  și 
SalePrice din tabela Products. 
 

UNIVERSITATEA TITU MAIORESCU 
FACULTATEA DE INFORMATICĂ 
 
 
 
 
 
 
 
MODELE ÎNTREBĂRI EXAMEN LICENȚĂ 2026 
 
 
 
 
 
 
 
 
MODULUL 3  
 
Sisteme de operare  
Rețele de calculatoare  
Administrarea rețelelor de calculatoare 
Criptografie 

 
 
 
1 
 
Observatie: 
 
Semnul punct si virgula (;) de la sfarsitul variantelor si semnul punct (.) de la ultima varianta nu 
face parte din comanda.`,
    },
    correctAnswer: "a",
  },
  {
    id: 392,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce face comanda sed 's/Linux/UNIX/g' file.txt?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Înlocuiește primul cuvânt "Linux" din fiecare linie cu "UNIX".`,
      b: `Înlocuiește toate instanțele de "Linux" cu "UNIX" în fișierul file.txt.`,
      c: `Afișează conținutul fișierului file.txt fără modificări.`,
      d: `Șterge toate liniile care conțin "Linux".`,
    },
    correctAnswer: "b",
  },
  {
    id: 393,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Cum compilezi un program C folosind mai multe fișiere sursă?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `gcc -o program file1.c file2.c`,
      b: `gcc -c file1.c file2.c`,
      c: `gcc -shared file1.c file2.c -o program`,
      d: `make file1.c file2.c`,
    },
    correctAnswer: "a",
  },
  {
    id: 394,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce face comanda ping -c 4 google.com?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Ping continuu către google.com.`,
      b: `Trimite 4 pachete ICMP către google.com.`,
      c: `Verifică dacă portul 4 este deschis pe google.com.`,
      d: `Testează viteza conexiunii către google.com.`,
    },
    correctAnswer: "b",
  },
  {
    id: 395,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Cum afișezi toate variabilele de mediu?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `env`,
      b: `printenv`,
      c: `export -p`,
      d: `toate cele de mai sus`,
    },
    correctAnswer: "d",
  },
  {
    id: 396,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Cum execuți un script Bash în fundal?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `bash script.sh &`,
      b: `nohup bash script.sh`,
      c: `./script.sh &`,
      d: `toate cele de mai sus`,
    },
    correctAnswer: "d",
  },
  {
    id: 397,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Cum verifici utilizarea memoriei pe un sistem Linux?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `free -h`,
      b: `top`,
      c: `vmstat`,
      d: `toate cele de mai sus`,
    },
    correctAnswer: "d",
  },
  {
    id: 398,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce face comanda #!/bin/bash plasată în prima linie a unui script?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Definește directorul curent de lucru pentru script.`,
      b: `Specifică shell-ul care va interpreta scriptul.`,
      c: `Face scriptul executabil automat.`,
      d: `Afișează versiunea curentă de Bash.`,
    },
    correctAnswer: "b",
  },
  {
    id: 399,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Cum folosești comanda tar pentru a crea un fișier arhivă?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `tar -xvf archive.tar file1.txt`,
      b: `tar -cvf archive.tar file1.txt`,
      c: `tar -xvf file1.txt archive.tar`,
      d: `tar -cf archive.tar file1.txt`,
    },
    correctAnswer: "b",
  },
];
