// A school day for the people module. ALL IMAGINED: nothing here is the school's real timetable; it follows the usual
// shape of a Chinese senior high school with boarders and day pupils, kept simple and believable:
//   06:00 the guard and a cleaner, a few early runners; 06:40-07:35 arrival through the gate and from the dormitories;
//   lessons of 45 minutes from 08:00 with 10-minute breaks (crowds on the galleries and between the buildings); the long
//   break at 09:40 with exercises on the field; lunch at 11:50 in the dining hall, a quiet siesta; afternoon lessons with
//   PE classes on the track and the courts; sport after 16:45; dinner; evening study from 19:00 in lit classrooms; back
//   to the dormitories at 21:40; almost nobody after 22:00.
// The page's clock does not run by itself (the time is set with the slider), so a time gives a state: what is going on,
// how many people walk where per minute, how many sit, play or stand about.

// [start hour, end hour, period]
const PERIODS = [
  [0, 5.9, 'night'], [5.9, 6.65, 'dawn'], [6.65, 7.6, 'arrive'], [7.6, 8.0, 'reading'],
  [8.0, 8.75, 'class'], [8.75, 8.92, 'break'], [8.92, 9.67, 'class'], [9.67, 9.8, 'toField'], [9.8, 10.06, 'drill'], [10.06, 10.18, 'fromField'],
  [10.18, 10.93, 'class'], [10.93, 11.1, 'break'], [11.1, 11.85, 'class'], [11.85, 12.7, 'lunch'], [12.7, 13.95, 'siesta'],
  [13.95, 14.17, 'break'], [14.17, 14.92, 'class'], [14.92, 15.08, 'break'], [15.08, 15.83, 'class'], [15.83, 16.0, 'break'], [16.0, 16.75, 'class'],
  [16.75, 17.65, 'sport'], [17.65, 18.55, 'dinner'], [18.55, 19.0, 'dusk'], [19.0, 21.6, 'study'], [21.6, 22.15, 'home'], [22.15, 24.01, 'night'],
];
export function periodAt(h) { for (const p of PERIODS) if (h >= p[0] && h < p[1]) return { name: p[2], start: p[0], end: p[1], into: (h - p[0]) / (p[1] - p[0]) }; return { name: 'night', start: 22.15, end: 24, into: 0 }; }

// Named groups of places (ends of src/life/paths.js; expanded by people.js)
//   OUT: the far ends of the pavements outside the gate; TEACH: the stairs and doors of the teaching buildings;
//   DORM: dormitory doors; HALL: the dining hall; GYM: the gymnasium; COURTS: the basketball courts; FIELD: the field.
// streams: [from group, to group, people per minute, roles { student, sport, teacher }]
const S = (from, to, rate, roles = { student: 1 }) => ({ from, to, rate, roles });
const STATES = {
  night:     { streams: [S('TEACH', 'DORM', 0.15)], groups: 0, benches: 0, classes: 0, readers: 0, diners: 0, courts: 0, runners: 0, workers: ['guard'] },
  dawn:      { streams: [S('OUT', 'TEACH', 0.6, { teacher: 1 }), S('DORM', 'HALL', 4)], groups: 1, benches: 0.03, classes: 0, readers: 0, diners: 6, courts: 0, runners: 6, workers: ['guard', 'cleaner'] },
  arrive:    { streams: [S('OUT', 'TEACH', 26, { student: 0.92, teacher: 0.08 }), S('DORM', 'TEACH', 16), S('HALL', 'TEACH', 5), S('DORM', 'HALL', 4)], groups: 5, benches: 0.12, classes: 0.15, readers: 0, diners: 10, courts: 0, runners: 2, workers: ['guard', 'cleaner'] },
  reading:   { streams: [S('OUT', 'TEACH', 4), S('DORM', 'TEACH', 2)], groups: 1, benches: 0.03, classes: 0.8, readers: 0, diners: 0, courts: 0, runners: 0, workers: ['guard', 'cleaner'] },
  class:     { streams: [S('TEACH', 'TEACH', 1.2, { teacher: 0.6, student: 0.4 }), S('OUT', 'TEACH', 0.4, { teacher: 1 }), S('TEACH', 'GYM', 0.8, { sport: 1 })], groups: 0, benches: 0.02, classes: 0.75, readers: 6, diners: 0, courts: 2, pe: true, runners: 10, workers: ['guard', 'gardener'] },
  break:     { streams: [S('TEACH', 'TEACH', 30), S('TEACH', 'COURTS', 3), S('TEACH', 'HALL', 2)], galleries: 9, groups: 8, benches: 0.25, classes: 0.1, readers: 8, diners: 0, courts: 1, runners: 2, workers: ['guard', 'gardener'] },
  toField:   { streams: [S('TEACH', 'FIELD', 70)], galleries: 6, groups: 2, benches: 0.05, classes: 0, readers: 0, diners: 0, courts: 0, runners: 0, drill: 0.4, workers: ['guard'] },
  drill:     { streams: [], groups: 0, benches: 0, classes: 0, readers: 0, diners: 0, courts: 0, runners: 0, drill: 1, workers: ['guard'] },
  fromField: { streams: [S('FIELD', 'TEACH', 70)], galleries: 6, groups: 2, benches: 0.05, classes: 0, readers: 0, diners: 0, courts: 0, runners: 0, drill: 0.3, workers: ['guard'] },
  lunch:     { streams: [S('TEACH', 'HALL', 22), S('HALL', 'DORM', 12), S('TEACH', 'DORM', 8), S('TEACH', 'OUT', 3), S('HALL', 'TEACH', 4)], groups: 6, benches: 0.35, classes: 0.04, readers: 10, diners: 1, courts: 2, runners: 1, workers: ['guard', 'cleaner'] },
  siesta:    { streams: [S('DORM', 'TEACH', 1.5), S('TEACH', 'DORM', 1), S('OUT', 'TEACH', 0.4, { teacher: 1 })], groups: 1, benches: 0.12, classes: 0.05, readers: 14, diners: 0, courts: 1, runners: 0, workers: ['guard', 'cleaner'] },
  sport:     { streams: [S('TEACH', 'COURTS', 6, { sport: 0.6, student: 0.4 }), S('TEACH', 'DORM', 10), S('TEACH', 'FIELD', 4, { sport: 1 }), S('TEACH', 'OUT', 8), S('TEACH', 'GYM', 3, { sport: 1 })], galleries: 4, groups: 6, benches: 0.3, classes: 0.05, readers: 10, diners: 4, courts: 6, runners: 18, stand: 14, workers: ['guard', 'gardener'] },
  dinner:    { streams: [S('TEACH', 'HALL', 12), S('COURTS', 'HALL', 4, { sport: 1 }), S('DORM', 'HALL', 6), S('HALL', 'DORM', 8), S('TEACH', 'OUT', 3)], groups: 5, benches: 0.3, classes: 0.03, readers: 6, diners: 1, courts: 3, runners: 8, workers: ['guard'] },
  dusk:      { streams: [S('DORM', 'TEACH', 14), S('HALL', 'TEACH', 6), S('OUT', 'TEACH', 4)], groups: 4, benches: 0.15, classes: 0.4, readers: 6, diners: 2, courts: 2, runners: 5, workers: ['guard'] },
  study:     { streams: [S('TEACH', 'TEACH', 0.8, { student: 0.5, teacher: 0.5 }), S('TEACH', 'DORM', 0.3)], groups: 0, benches: 0.01, classes: 0.85, readers: 8, diners: 0, courts: 0, runners: 1, workers: ['guard'] },
  home:      { streams: [S('TEACH', 'DORM', 40), S('TEACH', 'OUT', 12, { student: 0.85, teacher: 0.15 })], galleries: 5, groups: 2, benches: 0, classes: 0.1, readers: 0, diners: 0, courts: 0, runners: 0, workers: ['guard'] },
};
/** The state at hour h: { period, ... } with counts scaled for the time within the period (crowds swell and ebb). */
export function stateAt(h) {
  const p = periodAt(h), s = STATES[p.name] || STATES.night;
  // arrivals peak in the middle of their window; breaks are busiest early; evening study empties toward its end
  const k = p.name === 'arrive' ? 0.35 + 0.9 * Math.sin(Math.PI * Math.min(1, p.into * 1.15)) : p.name === 'break' ? 1.2 - 0.6 * p.into : p.name === 'home' ? 1.2 - 0.8 * p.into : 1;
  return { period: p.name, into: p.into, k, ...s };
}
