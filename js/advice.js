// Szabályalapú tanácsok az edzésnaplóból. Csak azt állítja, ami az adatokból látszik.
import { exerciseHistory, detectStagnation, e1rm, summarize } from './engine.js';

const CORE = /(crunch|plank|abdominal|leg-raise|side-bend|twist|hyperextension|ab-)/;
const LEG = /(squat|leg|lunge|calf|deadlift|glute|hip-|split|step-up|hack|sled|thrust)/;
const PULL = /(row|pulldown|pull|curl|reverse-fly|rear-delt|face-pull|shrug|chin)/;
const PUSH = /(press|fly|pushdown|triceps|dip|push|lateral-raise|front-raise|pec)/;

export function classify(slug) {
  if (CORE.test(slug)) return 'core';
  if (LEG.test(slug)) return 'leg';
  if (PULL.test(slug)) return 'pull';
  if (PUSH.test(slug)) return 'push';
  return 'other';
}

// Csereötletek: a teljesítmény nem vihető át egyik gépről a másikra,
// ezért induló súlyt nem adunk, csak óvatos kezdést javaslunk.
export const ALTERNATIVES = {
  'pulldown': [
    ['Lat pulldown szűk, V-markolattal', 'Más szögből húzol, a hát alsó része és a karok is jobban dolgoznak.'],
    ['Assisted pull-up (gépi húzódzkodás)', 'A testsúlyos húzódzkodás felé vezet, és jól mérhető a fejlődés.'],
  ],
  'straight-back-seated-row': [
    ['Dumbbell one arm row (egykezes evezés)', 'Oldalanként külön dolgozol, nagyobb a mozgástartomány.'],
    ['Chest supported T-bar row', 'A mellkas meg van támasztva, így a derék nem fárad, csak a hát.'],
  ],
  'lever-seated-row': [
    ['Cable seated row szűk markolattal', 'A kábel végig egyenletes terhelést ad, a végpontban is.'],
    ['Chest supported dumbbell row', 'Kézisúlyzóval mélyebbre engedhetsz, és nem csal a törzs.'],
  ],
  'lever-high-row': [
    ['Cable kneeling high row', 'Térdelve, kábellel ugyanezt a felülről lefelé húzást kapod, más ellenállásgörbével.'],
    ['Lat pulldown széles markolattal', 'Jól mérhető, egyszerű váltás, ha a gép foglalt.'],
  ],
  'lever-seated-reverse-fly': [
    ['Cable rear delt fly (keresztben, kábellel)', 'A hátsó váll a mozgás elején is terhelést kap.'],
    ['Face pull kötéllel', 'A hátsó vállat és a lapockazárókat együtt dolgoztatja, a vállízületnek is jót tesz.'],
  ],
  'lever-seated-shoulder-press': [
    ['Dumbbell seated shoulder press', 'Kézisúlyzóval a két oldal külön dolgozik, és stabilizálni is kell.'],
    ['Smith machine shoulder press', 'Stabil pálya, kis lépcsőkben könnyű emelni a súlyt.'],
  ],
  'seated-shoulder-press': [
    ['Lever seated shoulder press', 'Gépen biztonságosabb a nehezebb, kevesebb ismétléses munka.'],
    ['Arnold press', 'Forgatással a váll elülső és oldalsó része is dolgozik.'],
  ],
  'lever-lateral-raise': [
    ['Cable one arm lateral raise', 'Kábellel a mozgás alján is van terhelés, ahol a súlyzónál nincs.'],
    ['Dumbbell lateral raise, ülve', 'Ülve nehezebb lendületből csalni.'],
  ],
  'triceps-pushdown': [
    ['Cable overhead triceps extension', 'Fej fölött nyújtott helyzetben dolgozik a tricepsz hosszú feje.'],
    ['Rope pushdown (kötéllel)', 'A mozgás végén szét tudod húzni a kötelet, így teljesebb a feszítés.'],
  ],
  'lever-total-abdominal-crunch': [
    ['Cable kneeling crunch', 'Kábellel jól adagolható a súly, és nagy a mozgástartomány.'],
    ['Captain\'s chair leg raise', 'Az alsó hasat jobban dolgoztatja, mint a crunch.'],
  ],
  'lever-incline-chest-press': [
    ['Dumbbell incline bench press', 'Kézisúlyzóval mélyebbre engedhetsz, és mindkét oldal külön dolgozik.'],
    ['Smith machine incline press', 'Stabil pálya, a felső mellizomra pontosan beállítható a dőlésszög.'],
  ],
  'lever-chest-press': [
    ['Dumbbell bench press', 'Nagyobb mozgástartomány, több stabilizáló izom dolgozik.'],
    ['Lever incline chest press', 'A felső mell kap nagyobb hangsúlyt.'],
  ],
  'lever-seated-fly': [
    ['Cable standing fly', 'Kábellel végig egyenletes a terhelés, a záráskor is.'],
    ['Dumbbell fly, döntött padon', 'Nyújtott helyzetben erős inger a mellizomnak.'],
  ],
  'lever-pec-deck-fly': [
    ['Cable crossover alacsony csigáról', 'Alulról felfelé zárva a felső mellet célozza.'],
    ['Dumbbell fly, sík padon', 'Másfajta ellenállásgörbe, nyújtott helyzetben terhel.'],
  ],
  'biceps-curl': [
    ['EZ-rudas bicepsz', 'Kíméletesebb a csuklónak, és nagyobb súllyal is jól megy.'],
    ['Hammer curl', 'A brachialist és az alkar izmait is dolgoztatja, vastagabb kart ad.'],
  ],
  'close-grip-preacher-curl': [
    ['Dumbbell one arm preacher curl', 'Egykezesen nem tudja az erősebb kar kisegíteni a gyengébbet.'],
    ['Lever preacher curl', 'Gépen egyenletesebb a terhelés a mozgás tetején.'],
  ],
  'cable-one-arm-biceps-curl': [
    ['Dumbbell incline curl', 'Döntött padon a bicepsz nyújtott helyzetből indul.'],
    ['Cable bayesian curl (háttal a csigának)', 'Hátrébb húzott karral erősebb a nyújtás.'],
  ],
  'dumbbell-incline-curl': [
    ['Cable bayesian curl', 'Hasonló nyújtott helyzet, de a kábel végig terhel.'],
    ['Spider curl', 'Előre dőlve a mozgás tetején kap erős terhelést a bicepsz.'],
  ],
};

const LEG_IDEAS = 'például Lever Seated Leg Press, Lever Leg Extension, Lever Seated Leg Curl és Lever Standing Calf Raise';

function weeksBetween(a, b) {
  return (Date.parse(b) - Date.parse(a)) / (7 * 86400000);
}

export function buildAdvice(sessions, plan, cfg, today = new Date()) {
  const out = [];
  if (!sessions.length) return { items: out, swaps: [] };
  const sum = summarize(sessions, today);
  const todayStr = today.toISOString().slice(0, 10);
  const recent = sessions.filter((s) => sum.ago(s.date) < 28 && sum.ago(s.date) >= 0);

  // 1. Láb: az elmúlt 8 hét sorozataiból mennyi jutott lábra?
  const last8 = sessions.filter((s) => sum.ago(s.date) < 56 && sum.ago(s.date) >= 0);
  let legSets = 0, allSets = 0;
  for (const s of last8) for (const e of s.exercises) {
    allSets += e.sets.length;
    if (classify(e.slug) === 'leg') legSets += e.sets.length;
  }
  const legSessions = sessions.filter((s) => s.exercises.some((e) => classify(e.slug) === 'leg'));
  const lastLeg = legSessions[legSessions.length - 1];
  if (allSets && legSets / allSets < 0.15) {
    out.push({
      level: 'fontos',
      title: 'Hiányzik a lábedzés',
      text: `Az elmúlt 8 hét ${allSets} sorozatából ${legSets} volt lábgyakorlat`
        + (lastLeg ? `, az utolsó ${fmtDate(lastLeg.date)} ` : '. ')
        + `A láb a test legnagyobb izomcsoportja, kihagyva aránytalan lesz a fejlődés. Két lehetőség: vedd vissza a Has/Láb napot a rotációba (js/config.js, rotation), vagy tegyél 2 lábgyakorlatot a meglévő napok elejére, ${LEG_IDEAS}.`,
    });
  }

  // 2. Gyakoriság
  if (sum.perWeek < 2) {
    out.push({ level: 'tipp', title: 'Kevés edzés az elmúlt 4 hétben',
      text: `Hetente átlagosan ${fmtNum(sum.perWeek)} edzés volt. Egy izomcsoportot heti kétszer terhelni általában jobb, mint egyszer; a Hát/Váll ↔ Mell/Bicepsz váltással ehhez heti 4 alkalom kellene. Ha ez sok, már heti 3 is érezhetően segít.` });
  } else {
    out.push({ level: 'jó', title: 'Rendszeres vagy',
      text: `Az elmúlt 4 hétben hetente átlagosan ${fmtNum(sum.perWeek)} edzésed volt. Ezt tartsd meg, a fejlődés legnagyobb része ebből jön.` });
  }

  // 3. Egyensúly: sorozatszám izomcsoportonként (4 hét)
  const sets = { push: 0, pull: 0, arms: 0, leg: 0, core: 0 };
  for (const s of recent) for (const e of s.exercises) {
    const c = classify(e.slug);
    if (c in sets) sets[c] += e.sets.length;
    if (/curl/.test(e.slug)) sets.arms += e.sets.length;
  }
  if (sets.arms && sets.pull && sets.arms / sets.pull > 0.5) {
    out.push({ level: 'tipp', title: 'Sok a bicepszmunka a háthoz képest',
      text: `Az elmúlt 4 hétben ${sets.arms} sorozat bicepszgyakorlat és összesen ${sets.pull} húzó sorozat volt. A bicepsz a hátgyakorlatokban is dolgozik, ezért 2 bicepszgyakorlat is elég lehet. A felszabaduló időt érdemes lábra vagy egy plusz hátgyakorlatra fordítani.` });
  }
  if (sets.push && sets.pull) {
    const ratio = sets.push / sets.pull;
    if (ratio > 1.4) out.push({ level: 'tipp', title: 'Több a nyomás, mint a húzás',
      text: `${sets.push} nyomó és ${sets.pull} húzó sorozat az elmúlt 4 hétben. A vállak egészségéhez a húzás legyen legalább annyi, mint a nyomás: tegyél be egy evezést vagy face pullt.` });
  }

  // 4. Sorozatszám gyakorlatonként
  const exCounts = recent.flatMap((s) => s.exercises.map((e) => e.sets.length));
  const avgSets = exCounts.length ? exCounts.reduce((a, b) => a + b, 0) / exCounts.length : 0;
  if (avgSets && avgSets <= 2.2) {
    out.push({ level: 'tipp', title: 'Gyakorlatonként 2 sorozat',
      text: `Átlagosan ${fmtNum(avgSets)} sorozatot csinálsz egy gyakorlatból. Ha egy izomcsoport nem fejlődik, először ne gyakorlatot cserélj, hanem a napi 1–2 fő gyakorlatnál (pl. Pulldown, Incline Chest Press) adj hozzá egy harmadik sorozatot a második súlyával.` });
  }

  // 5. Megakadt gyakorlatok a mostani programban
  const programSlugs = new Set(cfg.rotation.flatMap((day) => {
    const t = [...sessions].reverse().find((s) => s.title === day);
    return t ? t.exercises.map((e) => e.slug) : [];
  }));
  const stuck = [];
  for (const slug of programSlugs) {
    const hist = exerciseHistory(sessions, slug);
    const st = detectStagnation(hist, cfg.stagnationWindow || 4);
    if (st) stuck.push({ slug, name: cfg.names?.[slug] || hist[hist.length - 1].name, st });
  }
  if (stuck.length) {
    out.push({ level: 'figyelj',
      title: stuck.length === 1 ? `${stuck[0].name}: megakadt` : `${stuck.length} gyakorlat megakadt`,
      text: `Ezeknél ${cfg.stagnationWindow || 4} alkalom óta nincs jobb becsült 1RM, és súlyt sem emeltél közben. Először ne cserélj: a következő alkalommal az első sorozatban ugyanazon a súlyon próbálj 1–2 ismétléssel többet. Ha 2–3 alkalom után sincs változás, jöhet a csere.`,
      list: stuck.map((x) => {
        const alt = ALTERNATIVES[x.slug]?.[0];
        return { name: x.name, detail: `${fmtDate(x.st.since)} óta, csúcs ${fmtNum(x.st.best)} kg${alt ? `. Csere: ${alt[0]}` : ''}` };
      }),
    });
  }

  // 6. Új csúcsok
  let records = 0;
  for (const slug of programSlugs) {
    const hist = exerciseHistory(sessions, slug);
    const best = (h) => Math.max(...h.sets.map((x) => e1rm(x.w, x.r)));
    const before = hist.filter((h) => sum.ago(h.date) >= 28);
    const inWindow = hist.filter((h) => sum.ago(h.date) < 28);
    if (before.length && inWindow.length && Math.max(...inWindow.map(best)) > Math.max(...before.map(best))) records++;
  }
  if (records) {
    out.push({ level: 'jó', title: `${records} gyakorlatban új csúcs`,
      text: `Az elmúlt 4 hétben ${records} gyakorlatban értél el a korábbiaknál jobb becsült 1RM-et. A progresszió működik, a fenti szabályokkal folytasd.` });
  }

  // 7. Táplálkozás
  out.push({ level: 'tipp', title: 'Fehérje minden étkezésre',
    text: 'Izomépítéshez a kutatások napi kb. 1,6–2,2 g fehérjét javasolnak testsúlykilogrammonként, 3–5 étkezésre elosztva. A Receptek fülön minden nap kapsz egy ebédet, vacsorát és nasit, ami ebben segít.' });

  const order = { fontos: 0, figyelj: 1, tipp: 2, 'jó': 3 };
  out.sort((a, b) => order[a.level] - order[b.level]);

  // Csereötletek a mostani program gyakorlataihoz
  const swaps = cfg.rotation.map((day) => {
    const t = [...sessions].reverse().find((s) => s.title === day);
    return { day, items: (t?.exercises || []).filter((e) => ALTERNATIVES[e.slug]).map((e) => ({ slug: e.slug, name: cfg.names?.[e.slug] || e.name, alts: ALTERNATIVES[e.slug] })) };
  }).filter((d) => d.items.length);

  return { items: out, swaps };
}

function fmtNum(n) {
  return String(Math.round(n * 10) / 10).replace('.', ',');
}
function fmtDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
}
