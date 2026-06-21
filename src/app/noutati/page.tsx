"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/layout/Container";
import { APP_VERSION } from "@/lib/site-config";

type ChangeType = "feature" | "fix" | "improvement" | "docs";

interface Change {
  text: string;
  type: ChangeType;
}

interface Version {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

const typeConfig: Record<ChangeType, { label: string; color: string; bg: string }> = {
  feature: {
    label: "Nou",
    color: "#34D399",
    bg: "rgba(52, 211, 153, 0.1)",
  },
  fix: {
    label: "Fix",
    color: "#60A5FA",
    bg: "rgba(96, 165, 250, 0.1)",
  },
  improvement: {
    label: "Update",
    color: "#E8A631",
    bg: "rgba(232, 166, 49, 0.1)",
  },
  docs: {
    label: "Docs",
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.1)",
  },
};

const changelog: Version[] = [
  {
    version: "2.2.0",
    date: "21 Iunie 2026",
    title: "Reiei greselile fara sa pierzi sesiunea mare",
    changes: [
      { text: "Cand reiei greselile dupa un simulator sau o practica si tot mai ai de lucru, poti acum sa reiei direct sesiunea mare din care au venit (de exemplu toate cele 36 de grile din simulator), nu doar ultimul set mic de greseli", type: "feature" },
      { text: "Reiei dintr-un singur loc oricare set: doar greselile de acum, toate greselile initiale, sau sesiunea completa; butoanele se potrivesc singure dupa cate greseli ti-au mai ramas", type: "feature" },
      { text: "Cand iei 100% pe un set de greseli, primesti pe loc optiunea sa reiei toate greselile initiale sau toata sesiunea, nu doar setul mic pe care tocmai l-ai terminat", type: "improvement" },
      { text: "Pornesti o simulare noua direct din rezultat, dintr-un clic; la practica continui cu urmatorul lot, iar cand e ultimul scrie 'Ultimele X'", type: "improvement" },
    ],
  },
  {
    version: "2.1.2",
    date: "21 Iunie 2026",
    title: "Antrenament: materii amestecate si progres mai clar",
    changes: [
      { text: "Antrenament: cand alegi mai multe materii, intrebarile noi se amesteca acum intre materii si module de la inceput; inainte veneau toate dintr-un singur modul la rand", type: "fix" },
      { text: "Antrenament: pe langa cate ai stapanit, vezi acum si cate intrebari ai vazut, ca sa urmaresti mai bine progresul (o intrebare devine 'stapanita' dupa ce o nimeresti corect de mai multe ori)", type: "improvement" },
    ],
  },
  {
    version: "2.1.1",
    date: "20 Iunie 2026",
    title: "Bara de progres si selectia materiilor reparate",
    changes: [
      { text: "Bara de progres de pe cardurile Module (pagina principala) ramanea goala/neagra chiar si cand aveai progres; acum se umple corect si arata procentajul real", type: "fix" },
      { text: "Procentajul si numarul de 'rezolvate' de pe cardurile Module includ acum si raspunsurile din simulator si antrenament, exact ca la Practica si Rezultate; inainte numara doar practica", type: "fix" },
      { text: "Butonul 'Selecteaza tot' aparea de doua ori pe mobil cand alegeai materiile pentru practica; acum apare o singura data", type: "fix" },
    ],
  },
  {
    version: "2.1.0",
    date: "20 Iunie 2026",
    title: "Antrenament nelimitat cu algoritm care invata ce gresesti",
    changes: [
      { text: "Mod nou de Antrenament: alegi tot, un modul sau o singura materie si raspunzi in continuu, fara limita de intrebari, pana vrei tu sa te opresti", type: "feature" },
      { text: "Algoritmul tine minte de la o zi la alta: intrebarile gresite revin mai des, cele stiute revin mai rar (dar tot revin), ca sa exersezi unde stai mai prost", type: "feature" },
      { text: "Vezi cate intrebari ai stapanit din materiile alese si cat de bine raspunzi pe parcurs; la final poti relua doar greselile, cu deduplicare", type: "improvement" },
      { text: "Tot ce raspunzi la Antrenament intra in aceleasi statistici ca Practica si Simulatorul", type: "improvement" },
    ],
  },
  {
    version: "2.0.1",
    date: "19 Iunie 2026",
    title: "Aceleasi cifre la Practica si Rezultate",
    changes: [
      { text: "Progresul pe materie din pagina Practica include acum si raspunsurile din simulator, exact ca la Rezultate; inainte numara doar practica, asa ca simularile rulate nu se vedeau in 'rezolvate'", type: "fix" },
    ],
  },
  {
    version: "2.0.0",
    date: "18 Iunie 2026",
    title: "Pagina noua de Cautare",
    changes: [
      { text: "Pagina noua de Cautare: cauti in toate cele 715 intrebari dupa cuvinte, dupa variantele de raspuns sau dupa explicatie, fara sa conteze diacriticele (cauti 'sir' si gaseste si 'sir' cu diacritice)", type: "feature" },
      { text: "Toate filtrele intr-un singur loc: dupa materie sau modul, dupa cod si limbaj (C, C++, Python, Java, JavaScript, PHP, SQL), dupa figura, dupa explicatie, dupa raspunsul corect si dupa progresul tau (nerezolvate, corecte, gresite, marcate)", type: "feature" },
      { text: "Din rezultate pornesti pe loc ce ai filtrat: 'Exerseaza' cu feedback instant sau 'Simuleaza' cu scor la final; poti exersa si o singura intrebare", type: "feature" },
      { text: "Lucruri smart: 'Surprinde-ma' iti da 20 de intrebari la intamplare, 'Puncte slabe' alege automat materiile la care stai mai prost, iar linkul cautarii se poate copia si trimite cu tot cu filtre", type: "feature" },
      { text: "Pe telefon, Cautarea a luat locul lui 'Despre' in meniul de jos; pe desktop o gasesti prima in bara de sus", type: "improvement" },
      { text: "Scripturile bash din intrebarile de la Sisteme de Operare apar acum colorate intr-un bloc de cod, ca celelalte limbaje, nu ca text simplu", type: "fix" },
    ],
  },
  {
    version: "1.5.7",
    date: "18 Iunie 2026",
    title: "Feedback pe loc cand reiei greselile de la examen",
    changes: [
      { text: "Cand reiei greselile dupa un examen din simulator, acum vezi pe loc daca ai raspuns corect sau gresit, la fel ca la practica (inainte se comporta ca un simulator, fara feedback pana la final)", type: "fix" },
      { text: "Reluarea greselilor ramane exercitiu cu scor pe acuratete, nu nota /10", type: "improvement" },
    ],
  },
  {
    version: "1.5.6",
    date: "18 Iunie 2026",
    title: "Reia doar intrebarile rezolvate",
    changes: [
      { text: "Daca ai raspuns doar la o parte din sesiune (de exemplu 23 din 100), poti reface acum doar intrebarile rezolvate, fara cele la care nu ai ajuns", type: "feature" },
      { text: "In rezumatul sesiunii alegi intre: doar greselile, doar rezolvate (corecte si gresite) sau toata sesiunea", type: "improvement" },
    ],
  },
  {
    version: "1.5.5",
    date: "18 Iunie 2026",
    title: "Reia toata sesiunea din rezumat",
    changes: [
      { text: "La finalul unei sesiuni de practica poti reface acum toata sesiunea, nu doar greselile: acelasi set de intrebari, reluat de la inceput", type: "feature" },
      { text: "Butonul 'Refa toata sesiunea' apare in rezumat langa 'Refa greselile', si cand ai raspuns corect la tot", type: "improvement" },
    ],
  },
  {
    version: "1.5.4",
    date: "18 Iunie 2026",
    title: "Reia greselile pe materie sau modul",
    changes: [
      { text: "In pagina de Practica, la 'Reia ce ai de recuperat', alegi acum din ce materie sau modul reiei: greselile si intrebarile marcate se filtreaza separat", type: "feature" },
      { text: "Inainte reluai tot ce ai gresit din toate materiile deodata; acum te concentrezi pe o singura materie (de exemplu doar Java) sau pe un modul intreg", type: "improvement" },
      { text: "Filtrul apare doar cand ai de recuperat din mai multe materii si arata cate intrebari sunt in fiecare", type: "improvement" },
    ],
  },
  {
    version: "1.5.3",
    date: "16 Iunie 2026",
    title: "Alegi ordinea intrebarilor la practica",
    changes: [
      { text: "La practica poti alege acum ordinea intrebarilor: in ordine, nerezolvate intai sau aleatoriu", type: "feature" },
      { text: "Implicit intrebarile apar in ordine si cele pe care le-ai facut deja nu mai sunt sarite: inainte, daca aveai 13 din 50 facute, alea 13 nu mai apareau", type: "fix" },
      { text: "'Nerezolvate intai' ramane disponibil ca optiune, cand vrei sa incepi cu cele pe care nu le-ai facut", type: "improvement" },
    ],
  },
  {
    version: "1.5.2",
    date: "16 Iunie 2026",
    title: "Reia greselile direct din rezultat",
    changes: [
      { text: "La finalul unei sesiuni de practica, in rezumatul sesiunii poti reface pe loc doar intrebarile gresite, fara sa mai treci prin alta pagina", type: "feature" },
      { text: "La simulator, dupa examen, ai un buton nou care reia doar grilele gresite ca exercitiu, cu scor pe acuratete; 'Re-fa acest examen' ramane examenul complet cu nota /10", type: "feature" },
      { text: "Cand reiei, alegi ce reiei (doar gresite sau tot), daca schimbi ordinea intrebarilor si daca amesteci si raspunsurile", type: "improvement" },
    ],
  },
  {
    version: "1.5.1",
    date: "16 Iunie 2026",
    title: "Raspunsuri amestecate si reluarea greselilor",
    changes: [
      { text: "Poti amesteca acum si raspunsurile, nu doar ordinea intrebarilor, atat la practica cat si la simulator. Variantele apar mereu in alta ordine, ca sa inveti raspunsul corect, nu locul lui pe ecran", type: "feature" },
      { text: "Reia intr-o sesiune noua doar intrebarile gresite sau cele marcate: ca exercitiu cu explicatii, sau ca simulare fara feedback, cu scorul la final", type: "feature" },
      { text: "Pornesti reluarea din pagina Revizuire, pe filtrul activ (Gresite, Marcate, Toate), sau direct din pagina de Practica", type: "improvement" },
      { text: "Multumiri celor care au propus aceste idei. Tot ce ne scrieti ne ajuta sa imbunatatim platforma", type: "improvement" },
    ],
  },
  {
    version: "1.5.0",
    date: "14 Iunie 2026",
    title: "Explicatii la fiecare intrebare",
    changes: [
      { text: "Fiecare intrebare are acum o explicatie: apesi 'De ce e corect?' dupa ce raspunzi si vezi de ce e corect raspunsul si de ce nu celelalte variante", type: "feature" },
      { text: "Explicatiile apar peste tot unde se vede raspunsul corect: la practica, in simulator si in Revizuire", type: "feature" },
      { text: "Cele peste 700 de explicatii au fost generate cu AI si verificate independent, intrebare cu intrebare", type: "improvement" },
    ],
  },
  {
    version: "1.4.7",
    date: "14 Iunie 2026",
    title: "Istoricul examenelor, la vedere",
    changes: [
      { text: "Buton de istoric examene direct la finalul fiecarui examen si pe pagina de start a simulatorului, nu mai e ascuns doar in Rezultate", type: "feature" },
      { text: "Poti re-face acum orice examen din istoric cu exact aceleasi grile, nu doar ultimul examen dat", type: "feature" },
      { text: "Acelasi buton de istoric, consistent peste tot - de la el vezi nota, performanta pe module si review-ul complet al fiecarui examen anterior", type: "improvement" },
    ],
  },
  {
    version: "1.4.6",
    date: "1 Iunie 2026",
    title: "Amestecarea alege din toate intrebarile",
    changes: [
      { text: "Amestecarea ordinii din practica alege acum aleator din toate intrebarile disponibile, apoi pastreaza cate ai cerut. Inainte, daca aveai 58 de intrebari si cereai 25 amestecate, primeai mereu aceleasi prime 25, doar in alta ordine", type: "fix" },
      { text: "Cand combini mai multe materii cu amestecarea activata, intrebarile se amesteca peste toate materiile, nu doar din prima selectata", type: "fix" },
    ],
  },
  {
    version: "1.4.5",
    date: "12 Mai 2026",
    title: "Bookmark in simulator si revizuire unita",
    changes: [
      { text: "Marcheaza intrebari direct din simulator, sa le revizui mai tarziu. Marcajele se vad si in Revizuire", type: "feature" },
      { text: "Pagina Revizuire afiseaza acum greselile, raspunsurile corecte si marcajele din toate sursele: practica, simulator si examene anterioare", type: "feature" },
      { text: "Pop-up-urile se inchid cu click in afara ferestrei sau prin butonul X din colt", type: "fix" },
      { text: "Acelasi 'X' apare pe toate pop-up-urile pentru o experienta consistenta", type: "improvement" },
    ],
  },
  {
    version: "1.4.4",
    date: "12 Mai 2026",
    title: "Iconite noi, peste tot",
    changes: [
      { text: "Iconite curate, vectoriale, in loc de emoji pentru toate materiile. Arata clar pe orice ecran si la orice marime", type: "improvement" },
      { text: "Mici imbunatatiri de text pentru a fi mai natural si mai usor de citit", type: "improvement" },
    ],
  },
  {
    version: "1.4.3",
    date: "12 Mai 2026",
    title: "Istoric examene si statistici unite",
    changes: [
      { text: "Vezi acum istoricul tuturor examenelor anterioare. Apasa pe oricare ca sa vezi cum ai stat pe module sau review-ul complet", type: "feature" },
      { text: "Statisticile pe module includ si raspunsurile date in simulator, nu doar din practica. O imagine completa a progresului", type: "feature" },
      { text: "Pagina Revizuire iti arata si cate ai gresit la ultimul simulator, cu un click pe greseli", type: "feature" },
      { text: "Mesajele de la sfarsitul examenului sunt mai inteligente: nu mai zice 'cel mai bine ai stat la X' daca de fapt ai gresit la toate", type: "improvement" },
      { text: "Reluare exact de unde ai ramas dupa import: examenul si toate datele se pastreaza intacte", type: "improvement" },
    ],
  },
  {
    version: "1.4.2",
    date: "12 Mai 2026",
    title: "Simulatorul intra in Rezultate",
    changes: [
      { text: "Pagina Rezultate are acum o sectiune dedicata pentru simulator: nota ta, acuratete, timp si performanta pe fiecare modul", type: "feature" },
      { text: "Dintr-o privire vezi unde ai stat cel mai bine si ce modul ai de exersat mai mult dupa ultimul examen", type: "feature" },
      { text: "Daca nu ai dat inca un examen, primesti un buton clar care te invita sa incerci unul", type: "improvement" },
      { text: "Cheia ta de salvare include automat si examenul de simulator - vezi din preview ce contine cand incarci o cheie", type: "feature" },
      { text: "Marcarea 'sesiune repetata' apare acum si pe Rezultate, Salveaza si Incarca, nu doar pe Simulator", type: "improvement" },
    ],
  },
  {
    version: "1.4.1",
    date: "12 Mai 2026",
    title: "Mai mult control pe simulator",
    changes: [
      { text: "Optiune noua inainte de start: vezi daca raspunsul e corect sau gresit chiar in timpul examenului. Util cand inveti activ si vrei feedback imediat", type: "feature" },
      { text: "Alegerea ramane memorata, asa ca nu trebuie sa o reactivezi de fiecare data. O poti dezactiva oricand dupa ce termini un examen", type: "feature" },
      { text: "Buton 'Re-fa acest examen' - dupa ce termini, primesti aceleasi 36 de grile inca o data, ca sa-ti corectezi exact ce ai gresit", type: "feature" },
      { text: "Sub-optiune cand re-faci: amesteca ordinea intrebarilor, ca sa te concentrezi pe continut si sa nu memorezi pozitiile", type: "feature" },
      { text: "Cand re-faci un examen, vezi clar peste tot ca e o 'sesiune repetata' - inclusiv pe pagina de start si la rezultat", type: "improvement" },
    ],
  },
  {
    version: "1.4.0",
    date: "11 Mai 2026",
    title: "Simulator examen licenta",
    changes: [
      { text: "Simulator de examen cu 36 de grile, ca la examenul real (9 din fiecare modul)", type: "feature" },
      { text: "Vezi nota pe scala 1-10, cu sistemul oficial de notare (1p din oficiu + 0.25p per raspuns corect)", type: "feature" },
      { text: "Dupa submit poti revedea toate raspunsurile - vezi unde ai gresit si care era corect", type: "feature" },
      { text: "Performanta pe module si pe materii in parte, ca sa stii unde sa te concentrezi", type: "feature" },
      { text: "Continui de unde ai ramas - examenul se salveaza automat si nu se pierde la refresh", type: "feature" },
    ],
  },
  {
    version: "1.3.2",
    date: "8 Mai 2026",
    title: "Corectii la raspunsuri pozitionate",
    changes: [
      { text: "Raspunsurile de tip 'a) si c)' au fost rescrise sa contina textul real al variantelor, nu referinte la litere", type: "fix" },
      { text: "Variantele 'toate cele de mai sus' au fost mutate mereu la pozitia D pentru consistenta", type: "fix" },
    ],
  },
  {
    version: "1.3.1",
    date: "8 Aprilie 2026",
    title: "Figuri si pagina noutati",
    changes: [
      { text: "Figuri adaugate la intrebarile care necesita imagini", type: "feature" },
      { text: "Pagina Noutati cu istoricul tuturor actualizarilor", type: "feature" },
    ],
  },
  {
    version: "1.3.0",
    date: "24 Februarie 2026",
    title: "Imbunatatiri de design",
    changes: [
      { text: "Design nou pe pagina de sesiune practica", type: "improvement" },
      { text: "Imbunatatiri vizuale pe toata platforma", type: "improvement" },
      { text: "Efect glow pe cardurile de pe pagina principala reparat", type: "fix" },
      { text: "Mai multe corectii de bug-uri", type: "fix" },
    ],
  },
  {
    version: "1.2.0",
    date: "23 Februarie 2026",
    title: "Navigare mobil imbunatatita",
    changes: [
      { text: "Pagina Revizuire adaugata in navigarea mobila", type: "feature" },
      { text: "Butonul Salveaza vizibil acum si pe mobil in header", type: "feature" },
    ],
  },
  {
    version: "1.1.1",
    date: "22 Februarie 2026",
    title: "Corectii minore",
    changes: [
      { text: "Imbunatatiri pe componenta intrebarilor", type: "improvement" },
      { text: "Curatare cod", type: "improvement" },
    ],
  },
  {
    version: "1.1.0",
    date: "21 Februarie 2026",
    title: "Syntax highlighting si analytics",
    changes: [
      { text: "Syntax highlighting pentru codul din intrebari", type: "feature" },
      { text: "Syntax highlighting pentru variante de raspuns cu cod", type: "feature" },
      { text: "Vercel Web Analytics integrat", type: "feature" },
      { text: "Vercel Speed Insights integrat", type: "feature" },
      { text: "Imbunatatiri SEO - meta tags, Open Graph, structura", type: "improvement" },
      { text: "Imbunatatiri selector materii", type: "improvement" },
    ],
  },
  {
    version: "1.0.1",
    date: "21 Februarie 2026",
    title: "Corectii dupa lansare",
    changes: [
      { text: "Corectii la continutul intrebarilor si ID-uri", type: "fix" },
      { text: "Imbunatatiri SEO initiale", type: "improvement" },
      { text: "Fix-uri pe design ModuleCard", type: "fix" },
      { text: "Corectii multiple de stabilitate", type: "fix" },
      { text: "Fix-uri frontend generale", type: "fix" },
    ],
  },
  {
    version: "1.0.0",
    date: "21 Februarie 2026",
    title: "Lansare platforma",
    changes: [
      { text: "715 intrebari grila din materialele oficiale UTM", type: "feature" },
      { text: "4 module: Programare, Baze de Date, Retele, Tehnologii Web", type: "feature" },
      { text: "15 discipline acoperite", type: "feature" },
      { text: "Mod practica cu selectare materii si intrebari aleatorii", type: "feature" },
      { text: "Pagina rezultate cu statistici detaliate per materie", type: "feature" },
      { text: "Sistem salvare/incarcare sesiuni cu cheie unica", type: "feature" },
      { text: "Design responsive - mobil, tableta si desktop", type: "feature" },
      { text: "Mod intunecat si luminos", type: "feature" },
    ],
  },
];

export default function NoutatiPage() {
  return (
    <>
      <Header />
      <main className="relative py-8 pb-24 md:pb-8 overflow-hidden">
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <Container narrow className="relative">
          <div className="mb-10">
            <h1
              className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Noutati
            </h1>
            <p className="text-[var(--color-text-secondary)] animate-fade-in stagger-1">
              Toate actualizarile platformei, de la lansare pana acum.
            </p>
          </div>

          {/* Current version badge */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in stagger-1">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]"
              style={{ borderColor: "rgba(232, 166, 49, 0.3)" }}
            >
              Versiune curenta: v{APP_VERSION}
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-[var(--color-border)] hidden sm:block" />

            <div className="space-y-6">
              {changelog.map((release, i) => (
                <div
                  key={release.version}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-[22px] hidden sm:flex">
                    <div
                      className="w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: i === 0 ? "var(--color-accent)" : "var(--color-border-strong)",
                        background: i === 0 ? "var(--color-accent-muted)" : "var(--color-bg-primary)",
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: i === 0 ? "var(--color-accent)" : "var(--color-border-strong)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Version card */}
                  <div className="sm:ml-10">
                    <div
                      className="rounded-[var(--radius-xl)] border overflow-hidden"
                      style={{
                        borderColor: i === 0 ? "rgba(232, 166, 49, 0.3)" : "var(--color-border)",
                        background: "var(--color-bg-secondary)",
                      }}
                    >
                      {i === 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none rounded-[var(--radius-xl)]"
                          style={{
                            background: "radial-gradient(ellipse 60% 30% at 30% 0%, var(--color-accent), transparent)",
                            opacity: 0.05,
                          }}
                        />
                      )}

                      <div className="relative p-5">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="text-lg font-bold text-[var(--color-text-primary)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            v{release.version}
                          </span>
                          {i === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                          {release.version === "1.0.0" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-correct)] px-2 py-0.5 rounded-full" style={{ background: "rgba(52, 211, 153, 0.1)" }}>
                              Lansare
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {release.title}
                          </span>
                          <span className="text-xs text-[var(--color-text-tertiary)]">
                            {release.date}
                          </span>
                        </div>

                        {/* Changes */}
                        <div className="space-y-2">
                          {release.changes.map((change, j) => {
                            const config = typeConfig[change.type];
                            return (
                              <div
                                key={j}
                                className="flex items-start gap-2.5"
                              >
                                <div
                                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]"
                                  style={{ background: config.color }}
                                />
                                <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                  {change.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <MobileNav />
    </>
  );
}
