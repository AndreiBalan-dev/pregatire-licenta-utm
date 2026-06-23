# PDF answer audit

- PDF questions parsed: **708**
- Data questions parsed: **705**
- Verified consistent with PDF red answer: **433**
- **Answer mismatches (high confidence): 1**
- Correct-answer text missing/garbled in data: **15**
- PDF marks multiple correct (data holds one): **10**
- Cross-subject duplicate questions: **0**
- Could not verify (stem/options not matched, or no red detected): **246**

## Answer mismatches (stored answer != PDF red answer)

- **id 80** (programare-python) stored `c`, PDF red => should be `d`  
  - Q: Ce se va afișa după rularea programului Python de mai jos?  
  - PDF correct text: [1, [1], [1, [1]], [1, [1], [1, [1]]]]  
  - file: src\data\questions\programming\programare-python.ts

## Correct-answer text missing or garbled in data

_PDF's red answer text does not clearly match any stored option (likely lost/garbled during extraction)._

- **id 632** (cloud-computing) stored `d`, best option match only 0.64  
  - Q: Care sunt pricipalele servicii furnizate de AWS:  
  - PDF correct text: AWS IAM e) toate  
  - file: src\data\questions\web\cloud-computing.ts

- **id 577** (comert-electronic) stored `d`, best option match only 0.26  
  - Q: Dupa modul de stocare a caracteristicilor de securitate cardurile se impart in:  
  - PDF correct text: numai a) si b)  
  - file: src\data\questions\web\comert-electronic.ts

- **id 578** (comert-electronic) stored `c`, best option match only 0.38  
  - Q: Protocolul SET (Secure Electronic Transaction) asigură urmatoarele:  
  - PDF correct text: toate  
  - file: src\data\questions\web\comert-electronic.ts

- **id 604** (comert-electronic) stored `d`, best option match only 0.40  
  - Q: In raport cu sursa de acoperire a cheltuielilor cardurile se impart in:  
  - PDF correct text: numai b) si c)  
  - file: src\data\questions\web\comert-electronic.ts

- **id 605** (comert-electronic) stored `d`, best option match only 0.31  
  - Q: Cardurile cu microprocesor se impart in urmatoarele categorii:  
  - PDF correct text: numai a) si c) 6  
  - file: src\data\questions\web\comert-electronic.ts

- **id 668** (sisteme-de-operare) stored `c`, best option match only 0.22  
  - Q: Cum adaugi un utilizator în Linux?  
  - PDF correct text: toate cele de mai sus Răspuns corect: d) toate cele de mai sus Explicație: usera...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 670** (sisteme-de-operare) stored `a`, best option match only 0.16  
  - Q: Cum setezi permisiunea de executare pentru toate fișierele dintr-un director?  
  - PDF correct text: find . -type f -exec chmod +x {} \; Răspuns corect: d) find . -type f -exec chmo...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 674** (sisteme-de-operare) stored `b`, best option match only 0.16  
  - Q: Cum listezi toate procesele care aparțin unui anumit utilizator?  
  - PDF correct text: toate cele de mai sus Răspuns corect: d) toate cele de mai sus Explicație: ps -u...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 676** (sisteme-de-operare) stored `b`, best option match only 0.20  
  - Q: Care este comanda pentru a afișa tabela de rutare?  
  - PDF correct text: toate cele de mai sus Răspuns corect: d) toate cele de mai sus Explicație: route...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 681** (sisteme-de-operare) stored `b`, best option match only 0.22  
  - Q: Cum afișezi toate variabilele de mediu?  
  - PDF correct text: toate cele de mai sus 5 Răspuns corect: d) toate cele de mai sus Explicație: Toa...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 689** (sisteme-de-operare) stored `d`, best option match only 0.17  
  - Q: Cum verifici dacă un fișier există într-un script Bash?  
  - PDF correct text: a) și b) Răspuns corect: d) a) și b) Explicație: -e: Verifică dacă fișierul sau ...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 697** (sisteme-de-operare) stored `d`, best option match only 0.17  
  - Q: Cum verifici ce utilizatori sunt conectați în prezent?  
  - PDF correct text: toate cele de mai sus Răspuns corect: d) toate cele de mai sus Explicație: who: ...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 699** (sisteme-de-operare) stored `d`, best option match only 0.21  
  - Q: Cum afișezi procesele care utilizează cel mai mult CPU pe un sistem Linux?  
  - PDF correct text: toate cele de mai sus Răspuns corect: d) toate cele de mai sus Explicație: top ș...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 709** (sisteme-de-operare) stored `d`, best option match only 0.46  
  - Q: Cum vizualizezi primele 10 linii ale unui fișier denumit logfile.log?  
  - PDF correct text: a) și c) Răspuns corect: d) a) și c) Explicație: Atât head logfile.log cât și ca...  
  - file: src\data\questions\networks\sisteme-de-operare.ts

- **id 249** (tehnici-avansate) stored `c`, best option match only 0.40  
  - Q: Precizați câte subșiruri strict crescătoare de lungime maximă conține tabloul 𝑣=...  
  - PDF correct text: 3 13  
  - file: src\data\questions\programming\tehnici-avansate.ts

## Cross-subject duplicates (same question in >1 subject)

_None._

## PDF marks MULTIPLE correct answers (single-answer model is lossy)

- id 302 (algoritmi-structuri-date): Parcurgerea in preordine a arborelui din Fig. 4 va afisa — PDF reds: 2  
- id 304 (algoritmi-structuri-date): Parcurgerea in postordine a arborelui din Fig. 4 va afisa — PDF reds: 2  
- id 314 (baze-de-date): Se dă tabelul:\nCHITANTE (NrChitanta, Suma, Data, NrGhiseu)\nCare dint... — PDF reds: 2  
- id 338 (baze-de-date): Aţi scris o instrucţiune SELECT complexă care afişează date din mai mu... — PDF reds: 2  
- id 460 (retele-calculatoare): Serverul DHCP are rolul: — PDF reds: 2  
- id 466 (criptografie): Care este rolul blocului de criptare informațională? — PDF reds: 2  
- id 518 (tehnologii-web): Care este rolul tagului <keygen> din HTML 5? — PDF reds: 2  
- id 622 (cloud-computing): In AWS S3 durabilitatea fisierelor este de: — PDF reds: 2  
- id 627 (cloud-computing): Ce baze de date RDS sunt disponibile in AWS: — PDF reds: 2  
- id 628 (cloud-computing): Alarmele din serviciul CloudWatch indeplinesc urmatoarele actiuni: — PDF reds: 2  

## Unverified (246)

_Stem not confidently matched to the PDF, or no red span detected on its page._
These are not necessarily wrong; they just could not be auto-checked.
