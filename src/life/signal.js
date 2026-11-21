// The signalled crossing on the main road (traffic.js draws it and drives the cars; people.js lets people wait at the
// kerb and cross on green). Both read the same clock: the page's elapsed seconds handed to every per-frame function.
// IMAGINED: the crossing, its place (the point of the main road nearest the middle of the campus) and its timings.
import { ROAD_LINES } from '../world/extras/landscape.js';

export const CYCLE = 64;
/** carsGo: cars may pass the stop line; walk: people may cross. Cars 0-40 s, all red 40-44, people 44-60, all red 60-64. */
export function signalAt(seconds) { const t = ((seconds % CYCLE) + CYCLE) % CYCLE; return { carsGo: t < 40, walk: t >= 44 && t < 60, t }; }

/** The crossing: centre (x, z), the road's direction u and the normal n (toward the campus, south-east). */
export function crossing() {
  const art = ROAD_LINES.find(r => r.kind === 'arterial'); if (!art) return null;
  const a = art.points[0], b = art.points[art.points.length - 1], d = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(d[0], d[1]), u = [d[0] / len, d[1] / len];
  const s = (60 - a[0]) * u[0] + (-60 - a[1]) * u[1];
  return { x: a[0] + u[0] * s, z: a[1] + u[1] * s, u, n: [-u[1], u[0]], s, a, len };
}

/** Pupils set down by cars at the gate: traffic.js pushes { x, z } (the kerb beside the car), people.js takes them. */
export const DROPS = [];
