import { Module } from "./types";

export const modules: Module[] = [
  {
    id: "programming",
    name: "Programare",
    description: "Fundamentele programării, Python, C++, Java, algoritmi",
    color: "var(--color-module-programming)",
    subjects: [
      {
        id: "fundamentele-programarii",
        name: "Fundamentele Programării",
        moduleId: "programming",
        questionCount: 50,
        icon: "💻",
      },
      {
        id: "programare-python",
        name: "Programare în Python",
        moduleId: "programming",
        questionCount: 50,
        icon: "🐍",
      },
      {
        id: "poo-cpp",
        name: "Programare Orientată pe Obiecte (C++)",
        moduleId: "programming",
        questionCount: 49,
        icon: "⚙️",
      },
      {
        id: "metode-avansate-java",
        name: "Metode Avansate de Programare (Java)",
        moduleId: "programming",
        questionCount: 52,
        icon: "☕",
      },
      {
        id: "tehnici-avansate",
        name: "Tehnici Avansate de Programare",
        moduleId: "programming",
        questionCount: 49,
        icon: "🔧",
      },
      {
        id: "algoritmi-structuri-date",
        name: "Algoritmi și Structuri de Date",
        moduleId: "programming",
        questionCount: 50,
        icon: "📊",
      },
    ],
  },
  {
    id: "databases",
    name: "Baze de Date",
    description: "Baze de date relaționale, SQL, sisteme de operare",
    color: "var(--color-module-databases)",
    subjects: [
      {
        id: "baze-de-date",
        name: "Baze de Date",
        moduleId: "databases",
        questionCount: 49,
        icon: "🗄️",
      },
      {
        id: "sgbd",
        name: "Sisteme de Gestiune / Sisteme de Operare",
        moduleId: "databases",
        questionCount: 50,
        icon: "📦",
      },
    ],
  },
  {
    id: "networks",
    name: "Rețele și Securitate",
    description: "Rețele de calculatoare, criptografie",
    color: "var(--color-module-networks)",
    subjects: [
      {
        id: "retele-calculatoare",
        name: "Rețele de Calculatoare",
        moduleId: "networks",
        questionCount: 58,
        icon: "🌐",
      },
      {
        id: "criptografie",
        name: "Criptografie",
        moduleId: "networks",
        questionCount: 50,
        icon: "🔐",
      },
    ],
  },
  {
    id: "web",
    name: "Tehnologii Web",
    description: "Web, comerț electronic, cloud, inovare digitală",
    color: "var(--color-module-web)",
    subjects: [
      {
        id: "tehnologii-web",
        name: "Tehnologii Web",
        moduleId: "web",
        questionCount: 54,
        icon: "🌍",
      },
      {
        id: "comert-electronic",
        name: "Comerț Electronic",
        moduleId: "web",
        questionCount: 48,
        icon: "🛒",
      },
      {
        id: "cloud-computing",
        name: "Cloud Computing",
        moduleId: "web",
        questionCount: 14,
        icon: "☁️",
      },
      {
        id: "inovare-transformare-digitala",
        name: "Inovare și Transformare Digitală",
        moduleId: "web",
        questionCount: 30,
        icon: "🚀",
      },
    ],
  },
];

export const allSubjects = modules.flatMap((m) => m.subjects);

export function getModuleById(id: string) {
  return modules.find((m) => m.id === id);
}

export function getSubjectById(id: string) {
  return allSubjects.find((s) => s.id === id);
}
