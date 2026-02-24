# Pregatire Licenta UTM - Grile Informatica 2026

**[utmlearn.com](https://utmlearn.com)** - Platforma gratuita de pregatire pentru examenul de licenta la Facultatea de Informatica, Universitatea Tehnica a Moldovei (UTM).

715 de exercitii grila extrase din materialele oficiale de examen, organizate pe module si materii, cu tracking de progres si feedback instant.

## Functionalitati

- **715 grile** din 15 materii, organizate in 4 module
- **Practica pe categorii** - alege materiile si rezolva grile in ordine aleatoare
- **Feedback instant** - vezi raspunsul corect imediat dupa selectie
- **Progres local** - tot progresul se salveaza automat in browser
- **Salvare/incarcare** - genereaza o cheie unica si continua de pe alt dispozitiv
- **Revizuire** - filtreaza intrebarile gresite, corecte sau marcate
- **Statistici** - urmareste acuratetea pe fiecare modul si materie
- **Syntax highlighting** - cod C++, Java, Python, SQL, PHP cu evidentierea sintaxei
- **Dark/Light mode** - tema adaptabila
- **Mobile-first** - optimizat pentru telefon, tableta si desktop

## Module si Materii

| Modul | Materii | Grile |
|-------|---------|-------|
| **Programare** | Fundamentele Programarii, Programare Python, POO C++, Metode Avansate Java, Tehnici Avansate, Algoritmi si Structuri de Date | 304 |
| **Baze de Date** | Baze de Date, SGBD | 101 |
| **Retele** | Sisteme de Operare, Retele de Calculatoare, Criptografie | 158 |
| **Web** | Tehnologii Web, Comert Electronic, Cloud Computing, Inovare si Transformare Digitala | 152 |

## Stack Tehnic

- **Framework**: [Next.js 16](https://nextjs.org/) cu App Router si React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) cu CSS custom properties
- **Baza de date**: [Neon Postgres](https://neon.tech/) (doar pentru save/load)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Syntax Highlighting**: [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer)
- **Fonturi**: Syne (display), IBM Plex Sans (body), JetBrains Mono (code)
- **Deploy**: [Vercel](https://vercel.com/)
- **Domeniu**: [utmlearn.com](https://utmlearn.com)

## Dezvoltare Locala

```bash
# Cloneaza repository-ul
git clone https://github.com/AndreiBalan-Dev/pregatire-licenta-utm.git
cd pregatire-licenta-utm

# Instaleaza dependentele
npm install

# Creeaza fisierul de configurare
cp .env.example .env.local
# Adauga DATABASE_URL si IP_HASH_SALT in .env.local

# Porneste serverul de dezvoltare
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000) in browser.

## Structura Proiectului

```
src/
  app/                    # Rute Next.js (App Router)
    practica/             # Selectie materii + sesiune activa
    rezultate/            # Dashboard statistici
    revizuire/            # Revizuire intrebari gresite/marcate
    salveaza/             # Salveaza progresul (genereaza cheie)
    incarca/              # Incarca progres cu cheie
    despre/               # Pagina despre proiect
    api/save/             # API salvare sesiune
    api/load/             # API incarcare sesiune
  components/             # Componente React reutilizabile
    ui/                   # Button, Card, Badge, CodeBlock, etc.
    layout/               # Header, MobileNav, Container
    home/                 # HeroSection, ModuleGrid
    practice/             # QuestionCard, SubjectSelector, etc.
  data/                   # 715 intrebari in fisiere TypeScript statice
    questions/            # Organizate pe module si materii
  hooks/                  # useSession, useTheme, useTimer, etc.
  lib/                    # Utilitare, crypto, rate-limit, validare
  db/                     # Schema Drizzle + conexiune Neon
```

## Securitate

- Rate limiting pe API-uri (5 req/15min save, 10 req/5min load)
- HMAC-SHA256 pentru hashing IP-uri (fara stocare IP-uri brute)
- Content Security Policy (CSP) restrictiv
- Interogari parametrizate (Drizzle ORM - fara SQL injection)
- Validare input (max 500KB sesiune, format cheie sanitizat)
- Chei de salvare generate cu `crypto.randomBytes`

## Autor

**Balan Andrei Marian** - [@AndreiBalan-Dev](https://github.com/AndreiBalan-Dev)

## Licenta

Acest proiect este destinat exclusiv pregatirii studentilor UTM pentru examenul de licenta la Informatica. Intrebarile sunt extrase din materialele oficiale de examen UTM 2026.
