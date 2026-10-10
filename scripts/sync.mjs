// Lehúzza az összes Lyfta edzést, és frissíti a data/history.json-t.
// Futtatás: LYFTA_API_KEY=... node scripts/sync.mjs
// Csak akkor ír fájlt, ha az edzésadat ténylegesen változott.

import { readFile, writeFile } from 'node:fs/promises';
import { CONFIG } from '../js/config.js';
import { transformAll } from './lyfta.mjs';

const KEY = process.env.LYFTA_API_KEY;
const BASE = process.env.LYFTA_BASE_URL || 'https://my.lyfta.app';
const OUT = new URL('../data/history.json', import.meta.url);
const PAGE_SIZE = 20;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(page, attempt = 1) {
  const url = `${BASE}/api/v1/workouts?limit=${PAGE_SIZE}&page=${page}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (res.status === 429 && attempt <= 3) {
    const wait = Number(res.headers.get('retry-after')) || 30;
    console.log(`Rate limit, várakozás ${wait} mp...`);
    await sleep(wait * 1000);
    return getPage(page, attempt + 1);
  }
  if (res.status === 401) throw new Error('A Lyfta elutasította az API kulcsot (401). Ellenőrizd a LYFTA_API_KEY secretet.');
  if (!res.ok) throw new Error(`Lyfta hiba: HTTP ${res.status}`);
  const body = await res.json();
  if (!body || body.status !== true || !Array.isArray(body.workouts)) {
    throw new Error('Váratlan Lyfta válasz: hiányzik a workouts lista.');
  }
  return body;
}

async function fetchAll() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const body = await getPage(page);
    all.push(...body.workouts);
    totalPages = Number(body.total_pages) || 1;
    page += 1;
    if (page <= totalPages) await sleep(1100);
  } while (page <= totalPages && page <= 200);
  return all;
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    return { sessions: [] };
  }
}

async function main() {
  if (!KEY) {
    console.log('::warning::Nincs LYFTA_API_KEY, a szinkron kimarad.');
    return;
  }
  const raw = await fetchAll();
  const sessions = transformAll(raw, CONFIG.timezone);
  const old = await readExisting();
  const oldCount = old.sessions?.length || 0;

  // Védőháló: ha hirtelen sokkal kevesebb edzés jön, ne írjuk felül az előzményt.
  if (oldCount > 5 && sessions.length < oldCount * 0.8 && process.env.FORCE !== '1') {
    throw new Error(`Gyanúsan kevés edzés (${sessions.length}, eddig ${oldCount}). Nem írom felül. FORCE=1 felülbírálja.`);
  }

  if (JSON.stringify(old.sessions) === JSON.stringify(sessions)) {
    console.log(`Nincs változás (${sessions.length} edzés).`);
    return;
  }
  const doc = { schemaVersion: 1, generatedAt: new Date().toISOString(), sessions };
  await writeFile(OUT, JSON.stringify(doc, null, 1) + '\n');
  console.log(`Frissítve: ${sessions.length} edzés (eddig ${oldCount}).`);
}

main().catch((err) => {
  console.error(`::error::${err.message}`);
  process.exit(1);
});
