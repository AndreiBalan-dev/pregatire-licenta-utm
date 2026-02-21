import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'src/data/questions';

// Files in order with their expected question counts and new starting IDs
const files = [
  { path: 'programming/fundamentele-programarii.ts', startId: 1 },
  { path: 'programming/programare-python.ts', startId: null }, // auto-calculate
  { path: 'programming/poo-cpp.ts', startId: null },
  { path: 'programming/metode-avansate-java.ts', startId: null },
  { path: 'programming/tehnici-avansate.ts', startId: null },
  { path: 'programming/algoritmi-structuri-date.ts', startId: null },
  { path: 'databases/baze-de-date.ts', startId: null },
  { path: 'databases/sgbd.ts', startId: null },
  { path: 'networks/retele-calculatoare.ts', startId: null },
  { path: 'networks/criptografie.ts', startId: null },
  { path: 'web/tehnologii-web.ts', startId: null },
  { path: 'web/comert-electronic.ts', startId: null },
  { path: 'web/cloud-computing.ts', startId: null },
  { path: 'web/inovare-transformare-digitala.ts', startId: null },
];

let nextId = 1;

for (const file of files) {
  const fullPath = join(BASE, file.path);
  let content = readFileSync(fullPath, 'utf-8');

  const startId = file.startId ?? nextId;
  let currentId = startId;
  let count = 0;

  // Replace each `id: NUMBER` (in question objects) sequentially
  // Match pattern: `id: NUMBER,` or `id: NUMBER\n`
  content = content.replace(/(\bid:\s+)\d+/g, (match, prefix) => {
    const newId = currentId++;
    count++;
    return `${prefix}${newId}`;
  });

  writeFileSync(fullPath, content, 'utf-8');

  const endId = currentId - 1;
  console.log(`${file.path}: IDs ${startId}-${endId} (${count} questions)`);

  nextId = currentId;
}

console.log(`\nTotal questions: ${nextId - 1}`);
