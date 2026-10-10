import { CONFIG } from './config.js';
import { ACTIONS, buildPlan, exerciseHistory, e1rm, fmt, summarize, detectStagnation } from './engine.js';
import { lineChart, weekBars } from './chart.js';

const app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const huDate = (d, opts = { month: 'short', day: 'numeric' }) => new Date(d + 'T12:00:00').toLocaleDateString('hu-HU', opts);
const exName = (slug, fallback) => CONFIG.names?.[slug] || fallback;

let sessions = [];
let images = {};
let plan = null;
const state = { exercise: null, metric: 'e1rm', historyLimit: 15 };

function daysAgoText(n) {
  if (n <= 0) return 'ma';
  if (n === 1) return 'tegnap';
  return `${n} napja`;
}

function duration(sec) {
  if (!sec) return '';
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)} óra ${m % 60} perc` : `${m} perc`;
}

function cardioText(c) {
  return [c.name, duration(c.duration), c.distance ? `${fmt(c.distance)} km` : ''].filter(Boolean).join(', ');
}

/* ---------- Ma ---------- */

const SYMBOL = { increase: '↗', reps: '+', hold: '=', correction: '↘' };
const DUMBBELL = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="17" width="6" height="14" rx="2"/><rect x="36" y="17" width="6" height="14" rx="2"/><rect x="12" y="21" width="24" height="6" rx="2"/></svg>';

function thumb(slug) {
  const url = images[slug];
  return url
    ? `<img class="thumb" src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
    : `<span class="thumb placeholder">${DUMBBELL}</span>`;
}

function exerciseCard(ex) {
  const a = ACTIONS[ex.action];
  const rows = ex.sets.map((s) => {
    const dir = s.w > s.last.w ? 'up' : s.w < s.last.w ? 'down' : '';
    return `<li class="${dir}"><b>${fmt(s.w)}</b><small>kg</small><span class="x">×</span><b>${s.target}</b><small>ism.</small></li>`;
  }).join('');

  const notable = ex.sets.filter((s) => s.action !== 'reps');
  const multi = ex.sets.length > 1;
  let why = notable.map((s) => (multi ? `${s.idx + 1}. sorozat: ` : '') + s.reason).join(' ');
  if (!notable.length) {
    why = multi && !ex.sets[0].reason.startsWith('Súlyemelés')
      ? 'Minden sorozat a tartományban van: mindegyikben +1 ismétlés.'
      : ex.sets[0].reason;
  } else if (notable.length < ex.sets.length) why += ' A többi sorozatban +1 ismétlés.';

  const hist = exerciseHistory(sessions, ex.slug).slice(-4).reverse();
  const histRows = hist.map((h) => `<tr><td>${esc(huDate(h.date))}</td><td>${h.sets.map((s) => `${fmt(s.w)} × ${s.r}`).join(', ')}</td></tr>`).join('');
  const stag = ex.stagnation
    ? `<p class="flag">${ex.stagnation.sessions} alkalom óta nincs új csúcs (${esc(huDate(ex.stagnation.since))} óta). Javaslat a Haladás fülön.</p>` : '';

  return `<li class="card ex" data-action="${ex.action}">
    <div class="ex-main">
      ${thumb(ex.slug)}
      <div class="ex-body">
        <p class="ex-meta">${ex.sets.length} sorozat</p>
        <h2>${esc(ex.name)}</h2>
        <ol class="sets" aria-label="Célok sorozatonként">${rows}</ol>
        <p class="tag"><span aria-hidden="true">${SYMBOL[ex.action]}</span> ${esc(a.label)}</p>
      </div>
    </div>
    <details class="ex-more">
      <summary>Előzmények és indoklás</summary>
      <p class="why">${esc(why)}</p>
      ${stag}
      <table class="recent"><thead><tr><th>Dátum</th><th>Sorozatok (kg × ism.)</th></tr></thead><tbody>${histRows}</tbody></table>
    </details>
  </li>`;
}

function renderToday() {
  if (!plan) return renderEmpty();
  const sum = summarize(sessions);
  const lastSame = plan.template;
  const lastAny = sessions[sessions.length - 1];
  const sameDay = lastSame.title === plan.day;
  const totalSets = plan.exercises.reduce((a, e) => a + e.sets.length, 0);

  const intro = sameDay
    ? `Legutóbb ${esc(huDate(lastSame.date))} (${daysAgoText(sum.ago(lastSame.date))}). Utolsó edzés: ${esc(lastAny.title)}, ${esc(huDate(lastAny.date))}`
    : `Ehhez a naphoz még nincs korábbi edzés, ezért a legutóbbi edzésből indulok.`;

  const warm = plan.warmup?.length
    ? `<div class="card warmup"><span class="w-label">Bemelegítés</span> ${plan.warmup.map((c) => esc(cardioText(c))).join('; ')}</div>` : '';

  app.innerHTML = `
    <header class="hero">
      <p class="date">Következő edzés, ${esc(new Date().toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' }))}</p>
      <h1>${esc(plan.day)}</h1>
      <p class="sub">${intro}</p>
    </header>
    ${warm}
    <div class="list-head"><h2>Gyakorlatok</h2><span>${plan.exercises.length} gyakorlat, ${totalSets} sorozat</span></div>
    <ol class="ex-list">${plan.exercises.map(exerciseCard).join('')}</ol>
    <p class="foot">Súlylépcső és ismétléstartomány a <code>js/config.js</code> fájlban állítható. Adatok frissítve: ${esc(dataStamp())}.</p>`;

  app.querySelectorAll('img.thumb').forEach((img) => img.addEventListener('error', () => {
    const ph = document.createElement('span');
    ph.className = 'thumb placeholder';
    ph.innerHTML = DUMBBELL;
    img.replaceWith(ph);
  }, { once: true }));
}

/* ---------- Haladás ---------- */

const METRICS = {
  e1rm: { label: 'Becsült 1RM', unit: 'kg', val: (sets) => Math.max(...sets.map((s) => e1rm(s.w, s.r))) },
  top: { label: 'Legnagyobb súly', unit: 'kg', val: (sets) => Math.max(...sets.map((s) => s.w)) },
  volume: { label: 'Volumen', unit: 'kg', val: (sets) => sets.reduce((a, s) => a + s.w * s.r, 0) },
};

function exerciseIndex() {
  const map = new Map();
  for (const s of sessions) for (const e of s.exercises) {
    const m = map.get(e.slug) || { slug: e.slug, name: e.name, count: 0, last: s.date };
    m.count++; m.last = s.date; map.set(e.slug, m);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function renderProgress() {
  if (!sessions.length) return renderEmpty();
  const sum = summarize(sessions);
  const list = exerciseIndex();
  if (!state.exercise || !list.some((e) => e.slug === state.exercise)) state.exercise = list[0]?.slug;
  const hist = exerciseHistory(sessions, state.exercise);
  const metric = METRICS[state.metric];
  const points = hist.map((h) => ({ date: h.date, y: Math.round(metric.val(h.sets) * 10) / 10 }));

  const stuck = list
    .map((e) => ({ ...e, st: detectStagnation(exerciseHistory(sessions, e.slug), CONFIG.stagnationWindow || 4) }))
    .filter((e) => e.st);

  const recentRows = hist.slice(-5).reverse().map((h) => `<tr>
      <td>${esc(huDate(h.date))}</td>
      <td>${h.sets.map((s) => `${fmt(s.w)} × ${s.r}`).join(', ')}</td>
      <td class="num">${fmt(Math.round(metric.val(h.sets) * 10) / 10)}</td></tr>`).join('');

  const goldText = sum.golds ? ` A Lyfta ${sum.golds} arany rekordot jelzett.` : '';

  app.innerHTML = `
    <header class="hero compact">
      <h1>Haladás</h1>
      <p class="sub">Az elmúlt 4 hétben ${sum.count28} edzés, hetente átlagosan ${fmt(Math.round(sum.perWeek * 10) / 10)}.${goldText}</p>
    </header>
    <section class="panel">
      <h2>Edzések hetente</h2>
      ${weekBars(sum.weeks)}
    </section>
    <section class="panel">
      <h2><label for="ex-select">Gyakorlat</label></h2>
      <select id="ex-select">${list.map((e) => `<option value="${esc(e.slug)}"${e.slug === state.exercise ? ' selected' : ''}>${esc(exName(e.slug, e.name))} (${e.count})</option>`).join('')}</select>
      <div class="seg" role="group" aria-label="Mutató">
        ${Object.entries(METRICS).map(([k, m]) => `<button type="button" data-metric="${k}" aria-pressed="${k === state.metric}">${m.label}</button>`).join('')}
      </div>
      ${lineChart(points, metric.unit)}
      ${state.metric === 'e1rm' ? '<p class="note">A becsült 1RM az Epley-képletből számolt becslés, nem elvégzett emelés.</p>' : ''}
      <table class="recent"><thead><tr><th>Dátum</th><th>Sorozatok</th><th class="num">${esc(metric.label)}</th></tr></thead><tbody>${recentRows}</tbody></table>
    </section>
    <section class="panel">
      <h2>Megakadt gyakorlatok</h2>
      ${stuck.length ? `<ul class="stuck">${stuck.map((e) => `<li>
          <b>${esc(exName(e.slug, e.name))}</b>: ${e.st.sessions} alkalom óta (${esc(huDate(e.st.since))}) nincs jobb becsült 1RM a korábbi ${fmt(e.st.best)} kg-nál, és súlyt sem emeltél közben.
          Következő alkalommal próbáld meg az első sorozatot ugyanazon a súlyon 1–2 ismétléssel többre vinni, vagy a második sorozat súlyát csökkentsd egy lépcsővel, és több ismétlést csinálj. ${CONFIG.stagnationWindow || 4} alkalom után érdemes újra ránézni.
        </li>`).join('')}</ul>`
        : `<p class="muted">Nincs megakadt gyakorlat: mindegyiknél volt új csúcs vagy súlyemelés az utolsó ${CONFIG.stagnationWindow || 4} alkalomban (vagy még kevés hozzá az adat).</p>`}
    </section>`;

  app.querySelector('#ex-select').addEventListener('change', (e) => { state.exercise = e.target.value; renderProgress(); });
  app.querySelectorAll('[data-metric]').forEach((b) => b.addEventListener('click', () => { state.metric = b.dataset.metric; renderProgress(); }));
}

/* ---------- Előzmények ---------- */

const PR_TYPES = { 1: 'becsült 1RM', 2: 'súly', 3: 'volumen', 4: 'ismétlés' };
const PR_LEVEL = { 1: 'arany', 2: 'ezüst', 3: 'bronz' };

function renderHistory() {
  if (!sessions.length) return renderEmpty();
  const shown = [...sessions].reverse().slice(0, state.historyLimit);
  const items = shown.map((s) => {
    const prs = s.exercises.flatMap((e) => e.sets).filter((x) => x.pr?.some((p) => p.level === 1)).length;
    const exRows = s.exercises.map((e) => `<li><span>${esc(exName(e.slug, e.name))}</span><span class="sets-inline">${e.sets.map((x) => {
      const best = x.pr?.reduce((a, p) => (!a || p.level < a.level ? p : a), null);
      const title = x.pr?.map((p) => `${PR_LEVEL[p.level]} ${PR_TYPES[p.type]}`).join(', ');
      return `<span class="${best ? 'pr l' + best.level : ''}"${title ? ` title="Rekord: ${esc(title)}"` : ''}>${fmt(x.w)} × ${x.r}</span>`;
    }).join('')}</span></li>`).join('');
    const cardio = s.cardio.length ? `<p class="warmup small"><span>Kardió</span> ${s.cardio.map((c) => esc(cardioText(c))).join('; ')}</p>` : '';
    return `<li><details>
      <summary>
        <span class="h-date">${esc(huDate(s.date, { month: 'short', day: 'numeric', weekday: 'short' }))}</span>
        <span class="h-title">${esc(s.title)}</span>
        <span class="h-meta">${fmt(Math.round(s.volume))} kg${prs ? `, ${prs} arany` : ''}</span>
      </summary>
      ${cardio}
      <ul class="h-ex">${exRows}</ul>
    </details></li>`;
  }).join('');
  const more = sessions.length > state.historyLimit
    ? `<button type="button" class="more" id="more">Korábbi edzések (${sessions.length - state.historyLimit})</button>` : '';
  app.innerHTML = `
    <header class="hero compact">
      <h1>Előzmények</h1>
      <p class="sub">${sessions.length} edzés, ${esc(huDate(sessions[0].date, { year: 'numeric', month: 'short', day: 'numeric' }))} óta. A színes sorozatoknál rekordot jelzett a Lyfta.</p>
    </header>
    <ol class="history">${items}</ol>${more}`;
  app.querySelector('#more')?.addEventListener('click', () => { state.historyLimit += 20; renderHistory(); });
}

/* ---------- közös ---------- */

let generatedAt = null;
function dataStamp() {
  return generatedAt ? new Date(generatedAt).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ismeretlen';
}

function renderEmpty() {
  app.innerHTML = `<header class="hero compact"><h1>Még nincs edzésadat</h1>
    <p class="sub">A GitHub repóban nyisd meg az Actions fület, válaszd a „Lyfta szinkron” workflow-t, és indítsd el a Run workflow gombbal. Pár perc múlva frissítsd ezt az oldalt.</p></header>`;
}

function route() {
  const tab = (location.hash || '#ma').slice(1);
  document.querySelectorAll('.tabs a').forEach((a) => a.toggleAttribute('aria-current', a.dataset.tab === tab));
  if (tab === 'haladas') renderProgress();
  else if (tab === 'elozmenyek') renderHistory();
  else renderToday();
  window.scrollTo(0, 0);
}

async function init() {
  try {
    const res = await fetch('data/history.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = await res.json();
    if (doc.schemaVersion !== 1 || !Array.isArray(doc.sessions)) throw new Error('ismeretlen adatformátum');
    sessions = doc.sessions;
    images = doc.images || {};
    generatedAt = doc.generatedAt;
    plan = buildPlan(sessions, CONFIG);
  } catch (err) {
    app.innerHTML = `<header class="hero compact"><h1>Nem töltött be az adat</h1>
      <p class="sub">A data/history.json nem olvasható (${esc(err.message)}). Helyben futtatva indíts egy szervert a repó gyökerében: <code>python -m http.server 8000</code>.</p></header>`;
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}

init();
