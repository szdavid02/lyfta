// Natív SVG grafikonok, külső könyvtár nélkül.
import { fmt } from './engine.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const huDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });

function niceRange(min, max) {
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  return [Math.max(0, min - pad), max + pad];
}

export function lineChart(points, unit) {
  const W = 640, H = 240, L = 44, R = 16, T = 16, B = 30;
  if (points.length === 0) return '<p class="muted">Nincs még adat ehhez a gyakorlathoz.</p>';
  const xs = points.map((p) => Date.parse(p.date));
  const ys = points.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const [y0, y1] = niceRange(Math.min(...ys), Math.max(...ys));
  const sx = (x) => (x1 === x0 ? (L + W - R) / 2 : L + ((x - x0) / (x1 - x0)) * (W - L - R));
  const sy = (y) => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);

  let grid = '';
  for (let i = 0; i <= 3; i++) {
    const v = y0 + ((y1 - y0) * i) / 3;
    const y = sy(v);
    grid += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="grid"/>`;
    grid += `<text x="${L - 8}" y="${y + 4}" class="axis" text-anchor="end">${fmt(Math.round(v))}</text>`;
  }
  const first = points[0], last = points[points.length - 1];
  grid += `<text x="${L}" y="${H - 8}" class="axis">${esc(huDate(first.date))}</text>`;
  if (points.length > 1) grid += `<text x="${W - R}" y="${H - 8}" class="axis" text-anchor="end">${esc(huDate(last.date))}</text>`;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(xs[i]).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const dots = points.map((p, i) =>
    `<circle cx="${sx(xs[i]).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="${i === points.length - 1 ? 5 : 3.5}" class="${i === points.length - 1 ? 'dot last' : 'dot'}"><title>${esc(huDate(p.date))}: ${fmt(p.y)} ${esc(unit)}</title></circle>`).join('');

  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Grafikon, utolsó érték ${fmt(last.y)} ${esc(unit)}">${grid}<path d="${path}" class="line"/>${dots}</svg>`;
}

export function weekBars(weeks) {
  const W = 640, H = 120, B = 22, gap = 8;
  const max = Math.max(3, ...weeks.map((w) => w.count));
  const bw = (W - gap * (weeks.length - 1)) / weeks.length;
  const bars = weeks.map((w, i) => {
    const h = (w.count / max) * (H - B - 6);
    const x = i * (bw + gap);
    const label = new Date(w.start).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return `<g><rect x="${x}" y="${H - B - h}" width="${bw}" height="${Math.max(h, 2)}" rx="3" class="${w.count ? 'bar' : 'bar empty'}"><title>${esc(label)} hete: ${w.count} edzés</title></rect>${w.count ? `<text x="${x + bw / 2}" y="${H - B - h - 4}" text-anchor="middle" class="axis">${w.count}</text>` : ''}</g>`;
  }).join('');
  return `<svg viewBox="0 -12 ${W} ${H + 12}" class="chart bars" role="img" aria-label="Heti edzésszám az elmúlt 12 hétben">${bars}<text x="0" y="${H - 4}" class="axis">12 hete</text><text x="${W}" y="${H - 4}" class="axis" text-anchor="end">ez a hét</text></svg>`;
}
