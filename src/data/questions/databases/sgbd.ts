import type { Question } from "@/data/types";

export const sgbd: Question[] = [
  {
    id: 356,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un SGBD distribuit este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O mulţime de aplicaţii globale`,
      b: `O mulţime de SGBD-uri locale, independente, ce se execută în acelaşi timp`,
      c: `O mulţime de aplicaţii locale şi globale`,
      d: `Un software ce permite gestiunea unei BD distribuite şi face distribuţia trans- parentă utilizatorilor`,
    },
    correctAnswer: "d",
  },
  {
    id: 357,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `O tranzacţie este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O mulţime finită de operaţii coerente, executate de un SGBD, care manipulează datele unei baze de date`,
      b: `O unitate de program ce realizează citiri şi scrieri`,
      c: `O mulţime finită şi ordonată de operaţii de citire, scriere şi terminare`,
      d: `O serie finită de operaţii de modificare a datelor dintr-o bază de date ORACLE`,
    },
    correctAnswer: "a",
  },
  {
    id: 358,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Proprietatea de consistenţă a tranzacţiei constă din:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Transformarea unei stări consistente într-o stare consistentă`,
      b: `Izolarea tranzacţiilor în execuţie`,
      c: `Transparenţa`,
      d: `Eliminarea redundanţelor`,
    },
    correctAnswer: "a",
  },
  {
    id: 359,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `O bază de date distribuită se găseşte implementată numai:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Într-o reţea de calculatoare`,
      b: `Pe un calculator performant`,
      c: `Pe un laptop`,
      d: `Pe un calculator client`,
    },
    correctAnswer: "a",
  },
  {
    id: 360,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un SGBD paralel este:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Un SGBD ce se execută pe calculatoare cu mai multe procesoare şi medii de stocare, proiectate să execute o mulţime de operaţii în paralel, pentru o mare performanţă`,
      b: `Un program ce operează pe baza algoritmilor paraleli`,
      c: `O mulţime de SGBD locale independente în execuţie`,
      d: `Un SGBD ce execută in paralel operaţii de intrare / ieşire dintr-o bază de date`,
    },
    correctAnswer: "a",
  },
  {
    id: 361,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se dă tabelul 
STUDENT(CNP, Nume, Grupa, Adresa) 
şi următoarea secvenţă ce reprezintă o tranzacţie: 
CREATE table STUDENT_NOU ( CNP NUMBER, Nume VARCHAR(30)) 
UPDATE STUDENT_NOU SET Nume = 'Ionescu' 
Rollback to s2 
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
      a: `Nu putem să facem Rollback mai mult de o dată pe un punct de reluare`,
      b: `Nu avem linii în tabelă`,
      c: `Avem un student cu numele ‘Ionescu’`,
      d: `Ultimul UPDATE eşuează deoarece studentul cu CNP-ul 100 a fost şters`,
    },
    correctAnswer: "b",
  },
  {
    id: 362,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Când creaţi o bază de date Microsoft Sql Server, care sunt fişierele care trebuie create obligatoriu?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Un fişier de date primar şi un fişier de log`,
      b: `Un fişier de date primar, un fişier de date secundar şi un fişier de log`,
      c: `Un fişier de log primar`,
      d: `Un fişier de date primar`,
    },
    correctAnswer: "a",
  },
  {
    id: 363,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Când se determină accesul utilizator la obiecte particulare ale unei baze de date, cum se aplică permisiunile?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Permisiunile sunt cumulative, exceptând DENY`,
      b: `User, group role, fixed role, fixed server`,
      c: `Permisiunile se scad, exceptând permisiunile user specificate`,
      d: `User, fixed role, group role, fixed server`,
    },
    correctAnswer: "a",
  },
  {
    id: 364,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele afirmaţii nu este adevărată despre bazele de date Microsoft 
SQL Server?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Bazele de date pot avea dimensiuni restricţionate`,
      b: `Bazele de date pot creşte automat cu un procent`,
      c: `Bazele de date trebuie să fie în acelaşi "filegroup"`,
      d: `Bazele de date sunt grupate în "filegroups"`,
    },
    correctAnswer: "c",
  },
  {
    id: 365,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care grup de instrucţiuni se poate utiliza prin acordarea permisiunilor obiect?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `SELECT, UPDATE, INSERT, DELETE`,
      b: `SELECT, UPDATE, INSERT, CREATE`,
      c: `SELECT, EXECUTE, DELETE,CREATE`,
      d: `SELECT, EXECUTE, DELETE, INDEX`,
    },
    correctAnswer: "a",
  },
  {
    id: 366,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Aţi planificat ca Microsoft SQL Server 2000 să facă backups ale unei baze de date astfel: 
full backup la ora 2:00 a.m.; differential backups din 4 în 4 ore; transaction log 
backups la fiecare 30’. Sistemul cade la 11:24 a.m. După ce se face un full backup 
restore, câte backups transaction logs şi diferenţiale (numărul minim) trebuie 
restaurate pentru a avea pierderi minime în baza de date?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `2 differential, 2 log`,
      b: `1 differential, 2 log`,
      c: `2 differential, 1 log`,
      d: `1 differetial, 10 log`,
    },
    correctAnswer: "b",
  },
  {
    id: 367,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Pentru a preveni problemele ţinând de proprietarul obiectelor unei baze de date Microsoft SQL Server, ce rol ar trebui să fie asignat unui developer?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Db-owner`,
      b: `Db-creator`,
      c: `DBA`,
      d: `Db-manager`,
    },
    correctAnswer: "a",
  },
  {
    id: 368,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Rolul Public este un rol special fixat la nivelul unei baze de date Sql Server. Care dintre următoarele afirmaţii este adevărată despre el?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Poate fi şters`,
      b: `E conţinut în orice bază de date utilizator, inclusiv master, msdb, tempdb, model`,
      c: `E conţinut numai în bazele de date utilizator`,
      d: `Poate avea utilizatori, grupuri sau roluri asignate`,
    },
    correctAnswer: "b",
  },
  {
    id: 369,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre afirmaţiile următoare sunt adevărate?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Numai un index cluster poate fi creat pentru un tabel`,
      b: `Întotdeauna creaţi indecşii non-cluster înaintea creării oricărui index cluster`,
      c: `Indecşii cluster sunt mai mari decât cei non-cluster`,
      d: `Paginile intermediare ale indexului cluster sunt paginile de date ale tabelului`,
    },
    correctAnswer: "a",
  },
  {
    id: 370,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Trebuie să modificaţi un tabel din baza de date pe care aţi creat-o; mai mulţi utilizatori au primit permisiunile obiect SELECT, INSERT pentru acel tabel. Ce variantă ar trebui să executaţi pentru a modifica tabelul, fără a afecta permisiunile acordate?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `DROP TABLE urmat de CREATE TABLE`,
      b: `CREATE TABLE, cu noua configuraţie`,
      c: `ALTER TABLE`,
      d: `MOD TABLE`,
    },
    correctAnswer: "c",
  },
  {
    id: 371,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Când ştergeţi un tabel, ce obiecte din baza de date se şterg de asemenea?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Vederile care-l au ca tabel de bază`,
      b: `Procedurile stocate care-l utilizează`,
      c: `Declanşatorii creaţi pentru el`,
      d: `Funcţiile care-l utilizează`,
    },
    correctAnswer: "c",
  },
  {
    id: 372,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care sunt caracteristicile unei chei primare?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Forţează integritatea referenţială pentru o tabelă`,
      b: `Permite valori de tip null`,
      c: `Server-ul de baze de date permite mai multe chei primare pentru un tabel`,
      d: `La crearea ei, serverul construieşte automat o constrângere de domeniu`,
    },
    correctAnswer: "a",
  },
  {
    id: 373,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele afirmaţii sunt adevărate despre constrângeri?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Constrângerile la nivel de coloană se aplică pe anumite coloane sau combinaţii de coloane`,
      b: `Dacă nu se specifică un nume pentru constrângere, server-ul de baze de date oferă unul`,
      c: `Indecşii creaţi de constrângerile PRIMARY KEY şi UNIQUE KEY pot fi şterşi folosind instrucţiunea DROP INDEX`,
      d: `Constrângerile nu pot fi adăugate sau şterse dintr-o tabelă fără a afecta structura tabelei`,
    },
    correctAnswer: "b",
  },
  {
    id: 374,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Puteţi folosi o procedură stocată pentru a extrage informaţii din tabele de bază la care nu aveţi permisiuni de acces?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nu, pentru că nu aveţi permisiunile cerute pe tabele`,
      b: `Nu, dacă nu sunteţi membri sysadmin sau db-owner`,
      c: `Da, dacă aveţi permisiunea EXECUTE pentru procedura stocată`,
      d: `Da, dacă aţi creat declanşatori pentru fiecare tabel`,
    },
    correctAnswer: "c",
  },
  {
    id: 375,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă utilizatorul student crează o tabelă, cine poate interoga tabela?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Utilizatorii care au drept de SELECT pe tabelă`,
      b: `Numai administratorul bazei de date`,
      c: `Numai utilizatorul student`,
      d: `Toţi utilizatorii`,
    },
    correctAnswer: "a",
  },
  {
    id: 376,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Să se aleagă răspunsul corect:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Se poate crea un index ce conţine câmpuri din mai multe tabele`,
      b: `Când o tabelă e ştearsă, toţi indecşii asociaţi sunt şterşi`,
      c: `Întotdeauna se construieşte un index pe coloanele care se actualizează frecvent`,
      d: `Nu se recomandă crearea unui index pe coloanele folosite în joncţiuni`,
    },
    correctAnswer: "b",
  },
  {
    id: 377,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Comanda DROP VIEW vedere are ca efect:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Şterge înregistrările din tabela de bază`,
      b: `Şterge tabela de bază`,
      c: `Şterge tabela virtuală`,
      d: `Şterge înregistrările din tabela virtuală`,
    },
    correctAnswer: "c",
  },
  {
    id: 378,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Serverul Oracle/Microsoft de baze de date crează automat un index când:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Se defineşte o constrângere de tip CHECK`,
      b: `Se defineşte o constrângere de tip NOT NULL`,
      c: `Se defineşte o constrângere de tip FOREIGN KEY`,
      d: `Se defineşte o constrângere de tip PRIMARY KEY`,
    },
    correctAnswer: "d",
  },
  {
    id: 379,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se va crea un index pe o coloană când:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Coloana se utilizează frecvent în clauza WHERE sau într-un JOIN`,
      b: `Tabela este actualizată frecvent`,
      c: `Tabela este de dimensiuni mici`,
      d: `Coloana conţine un număr foarte mare de valori egale`,
    },
    correctAnswer: "a",
  },
  {
    id: 380,
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
      b: `Şterge doar înregistrarea curentă din tabela stoc`,
      c: `Şterge fizic tabela stoc`,
      d: `Şterge toate înregistrările din tabela stoc`,
    },
    correctAnswer: "a",
  },
  {
    id: 381,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele instrucţiuni este necesară pentru a defini începutul unei 
tranzacţii explicite în Microsoft Transact-SQL ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `END TRANSACTION`,
      b: `OPEN TRANSACTION`,
      c: `BEGIN TRANSACTION`,
      d: `INSERT TRANSACTION`,
    },
    correctAnswer: "c",
  },
  {
    id: 382,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce problemă de concurenţă apare când o tranzacţie citeşte datele necomise de o 
altă tranzacţie aflată în derulare?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Lost update`,
      b: `Nonrepeatable Read`,
      c: `Phantom Read`,
      d: `Dirty Read`,
    },
    correctAnswer: "d",
  },
  {
    id: 383,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele constrângeri poate fi făcută disable?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `PRIMARY KEY`,
      b: `UNIQUE`,
      c: `DEFAULT`,
      d: `CHECK`,
    },
    correctAnswer: "d",
  },
  {
    id: 384,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Trebuie să modificaţi o procedură stocată şi mai mulţi utilizatori au primit 
permisiunea de execuţie a  ei. Ce instrucţiune ar trebui să utilizaţi pentru a o modifica, 
fără a afecta permisiunile existente?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `MOD PROC`,
      b: `CREATE PROC`,
      c: `ALTER PROC`,
      d: `DROP PROC`,
    },
    correctAnswer: "c",
  },
  {
    id: 385,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Care dintre următoarele enumerări reprezintă un tip de integritate a datelor implementată de o constrângere din serverele relaţionale de baze de date?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Integritatea de atribut`,
      b: `Integritatea tipurilor de date`,
      c: `Integritatea nereferenţială`,
      d: `Integritatea entității`,
    },
    correctAnswer: "d",
  },
  {
    id: 386,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ce caracteristică este utilizată pentru a preveni conflictele de actualizare, astfel 
incât utilizatorii să nu poată citi sau modifica datele când alţi utilizatori le modifică?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Blocările`,
      b: `Permisiunile de tip UPDATE`,
      c: `Tranzacţiile`,
      d: `Interogările de tip SQL`,
    },
    correctAnswer: "a",
  },
  {
    id: 387,
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
      a: `ALTER VIEW dbo.Employee AS SELECT Name FROM dbo.HumanResources WHERE isEmployee = 1 WITH CHECK OPTION`,
      b: `ALTER VIEW dbo.Employee WITH ENCRYPTION AS SELECT Name FROM dbo.HumanResources WHERE isEmployee = 1`,
      c: `ALTER VIEW dbo.Employee WITH SCHEMABINDING AS SELECT Name FROM dbo.HumanResources WHERE isEmployee = 1`,
      d: `DENY ALL ON dbo.Employee TO public`,
    },
    correctAnswer: "b",
  },
  {
    id: 388,
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
      a: `Două înregistrări`,
      b: `O înregistrare`,
      c: `Niciuna`,
      d: `Trei înregistrări`,
    },
    correctAnswer: "a",
  },
  {
    id: 389,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un utilizator are permisiunile INSERT și UPDATE pe un tabel dintr-o bază de 
date, acordate prin rolul Public. El activează un rol aplicație pentru acea bază de 
avea utilizatorul pe tabel?`,
    code: `date, care permite numai permisiunea SELECT pe acel tabel. Ce permisiuni va`,
    codeLanguage: "sql",
    options: {
      a: `SELECT`,
      b: `INSERT, UPDATE`,
      c: `SELECT, INSERT, UPDATE`,
      d: `Nu are permisiuni`,
    },
    correctAnswer: "c",
  },
  {
    id: 390,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Funcțiile definite de utilizator pot returna:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `O valoare de tip caracter`,
      b: `Toate tipurile de date din celelalte opțiuni`,
      c: `Un set de înregistrări (de tip tabel)`,
      d: `O valoare numerică`,
    },
    correctAnswer: "b",
  },
  {
    id: 391,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Să se aleagă afirmaţia corectă:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Când se şterge o tabelă, indecşii asociaţi rămân până se şterge şi baza de date`,
      b: `Întotdeauna se construieşte un index pe atributele care se actualizează în mod frecvent`,
      c: `Se poate construi un index care conţine câmpuri din mai multe tabele`,
      d: `Pentru a obţine date ordonate dintr-o tabelă se pot folosi indecşi`,
    },
    correctAnswer: "d",
  },
  {
    id: 392,
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
      a: `Se iese din procedura stocată cu valoarea de retur 1`,
      b: `Procedura stocată continuă cu execuția 'Bloc i-ni SQL'`,
      c: `Se iese din procedura stocată fără o valoare de retur`,
      d: `Se iese din procedura stocată cu valoarea de retur 0`,
    },
    correctAnswer: "a",
  },
  {
    id: 393,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Se poate folosi acelaşi nume pentru mai multe tabele dintr-un server de baze de 
date ?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nu`,
      b: `Da, dacă aparţin aceleaşi scheme dintr-o bază de date`,
      c: `Da, dacă nu aparţin aceleaşi baze de date`,
      d: `Nu, dacă aparţin unor instanțe diferite`,
    },
    correctAnswer: "c",
  },
  {
    id: 394,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă utilizatorul "stud" crează o vedere, cine poate face interogări pe acea 
vedere?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Administratorul bazei de date`,
      b: `Numai utilizatorii care au permisiunea SELECT pe vedere`,
      c: `Utilizatorii care au permisiunea SELECT pe tabela din care extrage vederea datele`,
      d: `Numai utilizatorul "stud"`,
    },
    correctAnswer: "a",
  },
  {
    id: 395,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un index Microsoft SQL/Oracle Server poate fi şters de:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Numai de administratorul bazei de date`,
      b: `Proprietarul tabelei`,
      c: `Numai de proprietarul tabelei`,
      d: `Numai de administratorul de sistem gazda`,
    },
    correctAnswer: "b",
  },
  {
    id: 396,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Un administrator de bază de date poate:`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Şterge orice tabelă sistem`,
      b: `Șterge orice index creat pe o tabelă sistem`,
      c: `Şterge un utilizator al sistemului(pe care ruleaza serverul de baze de date)`,
      d: `Crea un utilizator de bază de date`,
    },
    correctAnswer: "d",
  },
  {
    id: 397,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Secvenţa de comenzi Microsoft SQL Server: 
SET IMPLICIT_TRANSACTIONS  OFF  
    
BEGIN TRANSACTION 
are ca efect:`,
    code: `DELETE FROM Tabel_sursa  
  ROLLBACK`,
    codeLanguage: "sql",
    options: {
      a: `Nu efectuează nicio ştergere`,
      b: `Şterge doar înregistrarea curentă din "Tabel_sursa"`,
      c: `Şterge toţi indecşii asociaţi tabelei "Tabel_sursa"`,
      d: `Şterge toate înregistrările din tabela "Tabel_sursa"`,
    },
    correctAnswer: "a",
  },
  {
    id: 398,
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
      a: `BEGIN TRANSACTION; DECLARE @success int; EXEC @success = webAnalysis; IF @success = 0 ROLLBACK;`,
      b: `BEGIN TRANSACTION; DECLARE @success int; EXEC @success = webAnalysis; COMMIT; IF @success = 0 ROLLBACK;`,
      c: `BEGIN TRANSACTION; DECLARE @success int; EXEC @success = webAnalysis; IF @success = 0 ROLLBACK; ELSE COMMIT;`,
      d: `DECLARE @success int; EXEC @success = webAnalysis; IF @success = 0 ROLLBACK; ELSE COMMIT;`,
    },
    correctAnswer: "c",
  },
  {
    id: 399,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă doriți să returnați o valoare dintr-o procedură stocată intr-un parametru, care 
tip de apel trebuie folosit?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `EXECUTE sp_nume 5`,
      b: `EXECUTE sp_nume @val`,
      c: `EXECUTE sp_nume 5 OUTPU`,
      d: `EXECUTE sp_nume @val OUTPUT`,
    },
    correctAnswer: "d",
  },
  {
    id: 400,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Dacă o linie dintr-un tabel s-a modificat de mai multe ori de la ultimul backup full 
al bazei de date, fişierul transaction log backup conţine numai ultimul set de valori 
pentru acea linie?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Nu, întotdeuna (indiferent de modelul de recovery ales)`,
      b: `Nu, dacă modelul de recovery este Full`,
      c: `Nu, dacă modelul de recovery este Simple`,
      d: `Da, dacă modelul de recovery este Full`,
    },
    correctAnswer: "b",
  },
  {
    id: 401,
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
      a: `CREATE INDEX name_index ON Employees (lastName);`,
      b: `ALTER INDEX id_index ON Employees (id, lastName);`,
      c: `CREATE INDEX id_name_index ON Employees (id) INCLUDE (lastName);`,
      d: `CREATE CLUSTERED INDEX name_index ON Employees (lastName);`,
    },
    correctAnswer: "a",
  },
  {
    id: 402,
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
      a: `CREATE INDEX expertise_index ON Contractors (expertise) WHERE lastUpdated > '20240101';`,
      b: `CREATE INDEX expertise_index ON Contractors(lastUpdated) INCLUDE (expertise);`,
      c: `CREATE INDEX expertise_index ON Contractors (lastUpdated, expertise);`,
      d: `CREATE INDEX expertise_index ON Contractors (expertise, lastUpdated);`,
    },
    correctAnswer: "a",
  },
  {
    id: 403,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ocazional doriți să limitați permisiunile unui user sau rol interzicând permisiunile la acel cont de securitate. Ce face interzicerea permisiunilor pe un anumit cont de securitate?`,
    code: undefined,
    codeLanguage: undefined,
    options: {
      a: `Asigură că un user sau rol moștenește permisiunile din oricare alt rol pe viitor`,
      b: `Dezactivează permisiunile dacă sunt moștenite din alt rol`,
      c: `Activează permisiunile dacă sunt moștenite din alt rol`,
      d: `Permisiunile nu sunt cumulative pentru un user sau un rol`,
    },
    correctAnswer: "b",
  },
  {
    id: 404,
    moduleId: "databases",
    subjectId: "sgbd",
    text: `Ați creat o vedere folosind comanda: 
CREATE VIEW dbo.AngajatiNoi 
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
      c: `INSERT INTO dbo. AngajatiNoi (Nume) VALUES ('Tonoiu Petre');`,
      d: `INSERT INTO dbo. AngajatiNoi (Nume, SalariuLunar, Data_Ang) VALUES ('Stan Remus’, 2500, '11/5/2020');`,
    },
    correctAnswer: "b",
  },
  {
    id: 405,
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
      a: `Acordați utilizatorului permisiunea SELECT pe coloanele Name, SalePrice, CurrentStock și NumberSold și permisiunea ALTER pe coloanele Name și SalePrice din tabela Products.`,
      b: `Acordați rolului Public permisiunea SELECT pe coloanele Name, SalePrice, CurrentStock și NumberSold și permisiunea ALTER pe coloanele Name și SalePrice din tabela Products.`,
      c: `Acordați utilizatorului permisiunile SELECT și ALTER pe vederea definită de 
instrucțiunea: CREATE VIEW dbo.CustomerProduct AS SELECT Name, 
SalePrice, (CurrentStock - NumberSold) AS AvailableStock FROM dbo.Products.`,
      d: `Acordați utilizatorului permisiunea ALTER pe vederea definită de instrucțiunea: 
CREATE VIEW dbo.CustomerProductSelect AS SELECT Name, SalePrice, 
(CurrentStock - NumberSold) AS AvailableStock FROM dbo.Products.`,
    },
    correctAnswer: "c",
  },
];
