// Average milliseconds of JavaScript per frame spent by the life modules (people, traffic, birds), for checks:
// window.__lifeMs() returns { name: { avg, max, run } }: avg and max over the last 120 frames, run = the average since
// the last window.__lifeMsReset() (for measuring one view).
const T = {};
export function timed(name, fn) {
  const rec = T[name] = { sum: 0, n: 0, avg: 0, max: 0, peak: 0, rs: 0, rn: 0 };
  if (typeof window !== 'undefined') {
    window.__lifeMs = () => Object.fromEntries(Object.entries(T).map(([k, v]) => [k, { avg: +v.avg.toFixed(3), max: +v.max.toFixed(2), run: v.rn ? +(v.rs / v.rn).toFixed(3) : null, frames: v.rn }]));
    window.__lifeMsReset = () => { for (const v of Object.values(T)) { v.rs = 0; v.rn = 0; } };
  }
  return (...a) => {
    const t0 = performance.now(); fn(...a); const d = performance.now() - t0;
    rec.sum += d; rec.n++; rec.peak = Math.max(rec.peak, d); rec.rs += d; rec.rn++;
    if (rec.n >= 120) { rec.avg = rec.sum / rec.n; rec.max = rec.peak; rec.sum = 0; rec.n = 0; rec.peak = 0; } else if (!rec.avg) rec.avg = rec.sum / rec.n;
  };
}
