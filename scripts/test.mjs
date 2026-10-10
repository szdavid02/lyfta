// Gyors tesztek szintetikus adatokkal. Futtatás: node scripts/test.mjs
import assert from 'node:assert/strict';
import { transformAll, localDateTime, parseDuration, slugify } from './lyfta.mjs';
import { buildPlan, nextDay, planExercise, inferStep, detectStagnation } from '../js/engine.js';
import { readFile } from 'node:fs/promises';

const cfg = { timezone: 'Europe/Budapest', rotation: ['Hát/Váll', 'Mell/Bicepsz'], repRanges: [[8, 12], [10, 15]], exercises: {}, names: {}, stagnationWindow: 4 };
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok', name); };

const set = (weight, reps, extra = {}) => ({ id: '1', weight: String(weight), reps: String(reps), rir: '', duration: '', distance: '', set_type_id: '0', is_completed: false, ...extra });
const workout = (date, title, exercises) => ({
  id: 999, title, body_weight: 70, workout_perform_date: date, user: { username: 'Teszt Elek' },
  exercises: [
    { exercise_id: 1, excercise_name: 'Run on Treadmill', exercise_type: 'distance_duration', sets: [{ weight: '', reps: '', duration: '10:00', distance: '1', is_completed: true }] },
    ...exercises.map(([name, sets]) => ({ exercise_id: 2, excercise_name: name, exercise_type: 'weight_reps', exercise_image: 'https://x/y.png', sets })),
  ],
});

test('UTC → budapesti dátum, éjfél körül is', () => {
  assert.deepEqual(localDateTime('2026-10-09 16:13:12', 'Europe/Budapest'), { date: '2026-10-09', time: '18:13' });
  assert.deepEqual(localDateTime('2026-10-09 22:30:00', 'Europe/Budapest'), { date: '2026-10-10', time: '00:30' });
  assert.deepEqual(localDateTime('2026-12-01 23:30:00', 'Europe/Budapest'), { date: '2026-12-02', time: '00:30' });
});

test('időtartam és slug', () => {
  assert.equal(parseDuration('10:00'), 600);
  assert.equal(parseDuration('1:02:30'), 3750);
  assert.equal(slugify('Lever Seated Shoulder Press'), 'lever-seated-shoulder-press');
  assert.equal(slugify('Hát/Váll'), 'hat-vall');
});

const raw = [
  workout('2026-09-01 16:00:00', 'Hát/Váll', [['Pulldown', [set(56, 12, { record_type: '1,3', record_level: '1,2' }), set(52, 13)]]]),
  workout('2026-09-05 16:00:00', 'Mell/Bicepsz', [['Biceps Curl', [set(32, 12), set(28, 14)]]]),
];

test('tisztítás: nincs név, testsúly, azonosító, kép', () => {
  const out = transformAll(raw, 'Europe/Budapest');
  const json = JSON.stringify(out);
  for (const bad of ['Teszt Elek', 'body_weight', 'exercise_id', 'https://', '"999"', 'username']) assert.ok(!json.includes(bad), bad);
  assert.equal(out[0].id, '2026-09-01-hat-vall');
  assert.deepEqual(out[0].cardio, [{ name: 'Run on Treadmill', duration: 600, distance: 1 }]);
  assert.deepEqual(out[0].exercises[0].sets[0], { w: 56, r: 12, pr: [{ type: 1, level: 1 }, { type: 3, level: 2 }] });
  assert.equal(out[0].volume, 56 * 12 + 52 * 13);
});

test('azonos napi edzések külön azonosítót kapnak', () => {
  const out = transformAll([raw[0], { ...raw[0], workout_perform_date: '2026-09-01 18:00:00' }], 'Europe/Budapest');
  assert.deepEqual(out.map((s) => s.id), ['2026-09-01-hat-vall', '2026-09-01-hat-vall-2']);
});

const sessions = transformAll(raw, 'Europe/Budapest');

test('rotáció: Mell/Bicepsz után Hát/Váll', () => {
  assert.equal(nextDay(sessions, cfg.rotation), 'Hát/Váll');
  assert.equal(nextDay(sessions.slice(0, 1), cfg.rotation), 'Mell/Bicepsz');
});

test('felső határ elérése → súlyemelés, tartományban → +1 ismétlés', () => {
  const p = planExercise(sessions, 'pulldown', cfg);
  assert.equal(p.sets[0].action, 'increase');
  assert.equal(p.sets[0].w, 60);
  assert.equal(p.sets[0].target, 8);
  assert.equal(p.sets[1].action, 'reps');
  assert.equal(p.sets[1].target, 14);
  assert.equal(p.action, 'increase');
});

test('egy gyenge alkalom → tartás, három egymás után → visszalépés', () => {
  const mk = (reps) => ({ date: '2026-09-01', title: 'A', cardio: [], exercises: [{ slug: 'x', name: 'X', sets: [{ w: 50, r: reps }] }] });
  assert.equal(planExercise([mk(10), mk(6)], 'x', cfg).action, 'hold');
  const three = planExercise([mk(10), mk(6), mk(7), mk(6)], 'x', cfg);
  assert.equal(three.action, 'correction');
  assert.equal(three.sets[0].w, 45);
});

test('súlylépcső becslése', () => {
  assert.equal(inferStep([{ sets: [{ w: 56 }, { w: 52 }, { w: 60 }] }]), 4);
  assert.equal(inferStep([{ sets: [{ w: 55 }, { w: 56 }] }]), 2.5);
  assert.equal(inferStep([{ sets: [{ w: 40 }] }]), 5);
  assert.equal(inferStep([], 3), 3);
});

test('megakadás: nincs új csúcs és súlyemelés sem', () => {
  const h = (w, r) => ({ date: '2026-09-01', sets: [{ w, r }] });
  assert.ok(detectStagnation([h(50, 10), h(50, 9), h(50, 10), h(50, 8), h(50, 9)], 4));
  assert.equal(detectStagnation([h(50, 10), h(50, 9), h(55, 7), h(55, 8), h(55, 8)], 4), null);
  assert.equal(detectStagnation([h(50, 10), h(50, 11)], 4), null);
});

test('üres előzmény → nincs terv', () => assert.equal(buildPlan([], cfg), null));

// a publikus history.json érvényes és nem tartalmaz tiltott mezőt
const doc = JSON.parse(await readFile(new URL('../data/history.json', import.meta.url), 'utf8'));
assert.equal(doc.schemaVersion, 1);
assert.ok(Array.isArray(doc.sessions));
const txt = JSON.stringify(doc);
for (const bad of ['username', 'body_weight', 'exercise_id', 'workout_perform_date', 'apilyfta.com']) assert.ok(!txt.includes(bad), `history.json: ${bad}`);

console.log(`\n${passed + 1} teszt rendben.`);
