// Szabályalapú progresszió. Tiszta függvények: a böngésző és a tesztek is ezt használják.

export const ACTIONS = {
  increase: { label: 'Súlyemelés', short: 'Súly ↑' },
  reps: { label: 'Több ismétlés', short: 'Ism. +1' },
  hold: { label: 'Tartás', short: 'Tartás' },
  correction: { label: 'Visszalépés', short: 'Súly ↓' },
};

export const e1rm = (w, r) => (w > 0 && r > 0 ? w * (1 + r / 30) : 0);
const round1 = (n) => Math.round(n * 10) / 10;

export function exerciseHistory(sessions, slug) {
  const out = [];
  for (const s of sessions) {
    const ex = s.exercises.find((e) => e.slug === slug);
    if (ex) out.push({ date: s.date, title: s.title, sets: ex.sets, name: ex.name });
  }
  return out;
}

function rangeFor(cfg, slug, idx) {
  const ranges = cfg.exercises?.[slug]?.repRanges || cfg.repRanges;
  return ranges[Math.min(idx, ranges.length - 1)];
}

// Súlylépcső: a használt súlyok közti legkisebb különbség, 2,5 és 10 kg közé szorítva.
export function inferStep(hist, override) {
  if (override) return override;
  const ws = [...new Set(hist.flatMap((h) => h.sets.map((s) => s.w)).filter((w) => w > 0))].sort((a, b) => a - b);
  let min = Infinity;
  for (let i = 1; i < ws.length; i++) min = Math.min(min, ws[i] - ws[i - 1]);
  if (!Number.isFinite(min)) return ws[0] >= 30 ? 5 : 2.5;
  return Math.min(10, Math.max(2.5, round1(min)));
}

function planSet(last, idx, earlier, lo, hi, step) {
  const { w, r } = last;
  const base = { idx, last, w, target: lo };
  if (w === 0) {
    return { ...base, target: r + 1, action: 'reps', reason: 'Saját testsúly: egy ismétléssel több.' };
  }
  if (r >= hi) {
    return { ...base, w: round1(w + step), target: lo, action: 'increase',
      reason: `${fmt(w)} × ${r} elérte a felső határt (${hi}), jöhet ${fmt(round1(w + step))} kg.` };
  }
  if (r < lo) {
    // Hány korábbi alkalommal maradt ugyanezen a súlyon az alsó határ alatt (megszakítás nélkül)?
    let streak = 1;
    for (const h of [...earlier].reverse()) {
      const s = h.sets[idx];
      if (s && s.w === w && s.r < lo) streak++;
      else break;
    }
    if (streak >= 3) {
      return { ...base, w: round1(Math.max(0, w - step)), target: lo, action: 'correction',
        reason: `${streak}. alkalom ${lo} ismétlés alatt ezen a súlyon, egy lépcsővel lejjebb.` };
    }
    return { ...base, target: lo, action: 'hold',
      reason: `${fmt(w)} × ${r} az alsó határ (${lo}) alatt maradt, maradj ezen a súlyon.` };
  }
  const prev = earlier[earlier.length - 1]?.sets[idx];
  const reason = prev && prev.w < w
    ? `Súlyemelés után: ugyanezen a súlyon +1 ismétlés.`
    : `Tartományban vagy (${lo}–${hi}), jöhet +1 ismétlés.`;
  return { ...base, target: r + 1, action: 'reps', reason };
}

export function planExercise(sessions, slug, cfg) {
  const hist = exerciseHistory(sessions, slug);
  if (!hist.length) return null;
  const last = hist[hist.length - 1];
  const earlier = hist.slice(0, -1);
  const step = inferStep(hist, cfg.exercises?.[slug]?.step);
  const sets = last.sets.map((s, i) => {
    const [lo, hi] = rangeFor(cfg, slug, i);
    return planSet(s, i, earlier, lo, hi, step);
  });
  const acts = sets.map((s) => s.action);
  const action = acts.includes('increase') ? 'increase'
    : acts.includes('correction') ? 'correction'
      : acts.every((a) => a === 'hold') ? 'hold' : 'reps';
  return {
    slug, name: cfg.names?.[slug] || last.name, lastDate: last.date,
    step, action, sets, stagnation: detectStagnation(hist, cfg.stagnationWindow || 4),
  };
}

// A legutóbbi edzés címe alapján a forgórendben következő nap.
export function nextDay(sessions, rotation) {
  const last = sessions[sessions.length - 1];
  if (!last) return rotation[0] || null;
  const i = rotation.indexOf(last.title);
  if (i === -1) {
    const known = [...sessions].reverse().find((s) => rotation.includes(s.title));
    if (!known) return last.title;
    return rotation[(rotation.indexOf(known.title) + 1) % rotation.length];
  }
  return rotation[(i + 1) % rotation.length];
}

export function buildPlan(sessions, cfg, dayOverride = null) {
  if (!sessions.length) return null;
  const day = dayOverride || nextDay(sessions, cfg.rotation);
  const template = [...sessions].reverse().find((s) => s.title === day) || sessions[sessions.length - 1];
  return {
    day,
    template,
    warmup: template.cardio,
    exercises: template.exercises.map((e) => planExercise(sessions, e.slug, cfg)).filter(Boolean),
  };
}

// Megakadás: legalább `win` alkalom, nincs új csúcs becsült 1RM-ben, és súlyemelés sem volt közben.
export function detectStagnation(hist, win) {
  if (hist.length < win + 1) return null;
  const best = (h) => Math.max(...h.sets.map((s) => e1rm(s.w, s.r)));
  const top = (h) => Math.max(...h.sets.map((s) => s.w));
  const recent = hist.slice(-win);
  const before = hist.slice(0, -win);
  const bestBefore = Math.max(...before.map(best));
  const bestRecent = Math.max(...recent.map(best));
  const loadRaised = Math.max(...recent.map(top)) > Math.max(...before.map(top));
  if (bestRecent > bestBefore || loadRaised || bestBefore === 0) return null;
  return { since: recent[0].date, sessions: win, best: round1(bestBefore) };
}

export function summarize(sessions, today = new Date()) {
  const dayMs = 86400000;
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const ago = (d) => Math.round((t - Date.parse(d + 'T00:00:00Z')) / dayMs);
  const last28 = sessions.filter((s) => ago(s.date) < 28 && ago(s.date) >= 0);
  const golds = last28.flatMap((s) => s.exercises.flatMap((e) => e.sets))
    .filter((st) => st.pr?.some((p) => p.level === 1)).length;
  // Utolsó 12 hét, hétfővel kezdődő hetek
  const dow = (today.getDay() + 6) % 7;
  const weekStart = t - dow * dayMs;
  const weeks = Array.from({ length: 12 }, (_, i) => ({ start: weekStart - (11 - i) * 7 * dayMs, count: 0 }));
  for (const s of sessions) {
    const ms = Date.parse(s.date + 'T00:00:00Z');
    const w = weeks.find((x) => ms >= x.start && ms < x.start + 7 * dayMs);
    if (w) w.count++;
  }
  return { count28: last28.length, perWeek: last28.length / 4, golds, weeks, ago };
}

export function fmt(n) {
  return Number.isInteger(n) ? String(n) : String(round1(n)).replace('.', ',');
}
