import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const emptyState = () => ({ cars: [], likes: [], favorites: [], views: [], follows: [] });

let writeChain = Promise.resolve();

async function ensureDb() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DB_FILE)) {
    await writeFile(DB_FILE, JSON.stringify(emptyState(), null, 2), 'utf-8');
  }
}

export async function readDb() {
  await ensureDb();
  const raw = await readFile(DB_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return emptyState();
  }
}

/**
 * Runs `mutator` with the current DB state and persists the returned state.
 * Calls are chained so concurrent requests never interleave writes.
 */
export function writeDb(mutator) {
  writeChain = writeChain.then(async () => {
    const state = await readDb();
    const next = await mutator(state);
    await writeFile(DB_FILE, JSON.stringify(next, null, 2), 'utf-8');
    return next;
  });
  return writeChain;
}
