// Lyfta API válasz → tisztított, publikálható edzésadat.
// Szándékosan NEM kerül át: felhasználónév, testsúly, Lyfta azonosítók, képek URL-jei.

export function slugify(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

// "10:00" → 600, "1:02:30" → 3750
export function parseDuration(s) {
  if (!s) return null;
  const parts = String(s).split(':').map(Number);
  if (parts.some((p) => !Number.isFinite(p))) return null;
  const sec = parts.reduce((acc, p) => acc * 60 + p, 0);
  return sec > 0 ? sec : null;
}

// A Lyfta UTC-ben adja az időt ("2026-10-09 16:13:12"), helyi dátumra váltjuk.
export function localDateTime(raw, timeZone) {
  const d = new Date(String(raw).trim().replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

// record_type: 1 = becsült 1RM, 2 = max súly, 3 = sorozatvolumen, 4 = max ismétlés
// record_level: 1–3 (arany, ezüst, bronz)
function records(s) {
  const types = String(s.record_type ?? '').split(',').map(Number);
  const levels = String(s.record_level ?? '').split(',').map(Number);
  return types
    .map((type, i) => ({ type, level: levels[i] }))
    .filter((r) => r.type >= 1 && r.type <= 4 && r.level >= 1 && r.level <= 3);
}

export function transformWorkout(w, timeZone) {
  const dt = localDateTime(w.workout_perform_date, timeZone);
  if (!dt) return null;
  const title = String(w.title || 'Edzés').trim().slice(0, 80);
  const exercises = [];
  const cardio = [];

  for (const e of w.exercises || []) {
    const name = String(e.excercise_name ?? e.exercise_name ?? '').trim().slice(0, 80);
    if (!name) continue;
    const sets = [];
    let duration = 0;
    let distance = 0;
    for (const s of e.sets || []) {
      const reps = num(s.reps);
      if (reps && reps > 0) {
        const set = { w: num(s.weight) ?? 0, r: Math.round(reps) };
        const pr = records(s);
        if (pr.length) set.pr = pr;
        sets.push(set);
      } else {
        duration += parseDuration(s.duration) ?? 0;
        distance += num(s.distance) ?? 0;
      }
    }
    if (sets.length) exercises.push({ slug: slugify(name), name, sets });
    else if (duration || distance) {
      cardio.push({ name, duration: duration || null, distance: distance || null });
    }
  }

  if (!exercises.length && !cardio.length) return null;
  const volume = Math.round(
    exercises.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + s.w * s.r, 0), 0) * 10,
  ) / 10;
  return { date: dt.date, time: dt.time, title, volume, cardio, exercises };
}

export function transformAll(workouts, timeZone) {
  const sessions = workouts
    .map((w) => transformWorkout(w, timeZone))
    .filter(Boolean)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const seen = new Map();
  for (const s of sessions) {
    const base = `${s.date}-${slugify(s.title) || 'edzes'}`;
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    s.id = n === 1 ? base : `${base}-${n}`;
  }
  return sessions.map(({ id, ...rest }) => ({ id, ...rest }));
}
