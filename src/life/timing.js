// Average milliseconds of JavaScript per frame spent by the life modules (people, traffic, birds), for checks:
// window.__lifeMs() returns { name: { avg, max } } over the last 120 frames.
const T = {};
export function timed(name, fn) {
  const rec = T[name] = { sum: 0, n: 0, avg: 0, max: 0, peak: 0 };
  if (typeof window !== 'undefined') window.__lifeMs = () => Object.fromEntries(Object.entries(T).map(([k, v]) => [k, { avg: +v.avg.toFixed(3), max: +v.max.toFixed(2) }]));
  return (...a) => {
    const t0 = performance.now(); fn(...a); const d = performance.now() - t0;
    rec.sum += d; rec.n++; rec.peak = Math.max(rec.peak, d);
    if (rec.n >= 120) { rec.avg = rec.sum / rec.n; rec.max = rec.peak; rec.sum = 0; rec.n = 0; rec.peak = 0; } else if (!rec.avg) rec.avg = rec.sum / rec.n;
  };
}
