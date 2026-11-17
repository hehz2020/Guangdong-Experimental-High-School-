// Generates src/campus-data.js (ground coordinates in metres) from data/measurements.json
// (raw image-space measurements). Run: npm run data
import { readFileSync, writeFileSync } from 'node:fs';

const M = JSON.parse(readFileSync('data/measurements.json', 'utf8'));
const mpp = M.image.metresPerPixel;
const [leanX, leanY] = M.image.lean.pxPerMetreOfHeight;      // roof displacement in px per metre of height
const leanSpread = 0.4;                                        // px per metre: half-width of the stated lean range

// Origin = centre of the running track.
const [iw, inn, ie, is] = M.track.infieldPx;
const [offE, offS] = M.track.centreOffsetFromInfieldCentreMetres;
const ox = (iw + ie) / 2 + offE / mpp, oy = (inn + is) / 2 + offS / mpp;
const r1 = v => Math.round(v * 10) / 10;
const toM = ([px, py]) => [r1((px - ox) * mpp), r1((py - oy) * mpp)];
const lonLat = (px, py) => [M.image.west + px * (M.image.east - M.image.west) / M.image.size[0], M.image.north - py * (M.image.north - M.image.south) / M.image.size[1]];

function bandToPolygon(line, depth) {
  const left = [], right = [], h = depth / 2;
  for (let i = 0; i < line.length; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    left.push([line[i][0] - dy / n * h, line[i][1] + dx / n * h]);
    right.push([line[i][0] + dy / n * h, line[i][1] - dx / n * h]);
  }
  return left.concat(right.reverse());
}

const items = M.items.map(it => {
  const h = it.height.metres;
  const leanH = it.surface === 'roof' ? (it.leanReferenceHeightMetres ?? h) : 0;
  const shift = ([px, py]) => [px - leanX * leanH, py - leanY * leanH];   // roof as seen -> ground position
  const out = {
    id: it.id, name: it.name, kind: it.kind, style: it.style,
    height: r1(h), heightBasis: it.height.basis,
    solid: it.solid ?? ['building', 'stand'].includes(it.kind), walkUnder: !!it.walkUnder,
    confidence: it.confidence, measuredBy: it.measuredBy,
    // plan accuracy: reading error plus the uncertainty of the oblique correction for this height
    positionAccuracyM: r1(Math.hypot(it.accuracyPx * mpp, leanSpread * leanH * mpp)),
    correctedForObliqueView: leanH > 0, notes: it.notes,
  };
  if (it.circlePx) {
    const [cx, cy, r] = it.circlePx, c = toM(shift([cx, cy]));
    Object.assign(out, { shape: 'circle', cx: c[0], cz: c[1], radius: r1(r * mpp) });
  } else {
    let px;
    if (it.rectPx) { const [w, n, e, s] = it.rectPx; px = [[w, n], [e, n], [e, s], [w, s]]; }
    else if (it.polygonPx) px = it.polygonPx;
    else if (it.bandPx) px = bandToPolygon(it.bandPx.centreline, it.bandPx.depth);
    else throw new Error('no geometry for ' + it.id);
    Object.assign(out, { shape: 'polygon', points: px.map(p => toM(shift(p))) });
  }
  return out;
});

const T = M.track, outerR = T.innerRadius + T.lanes * T.laneWidth;
const [olon, olat] = lonLat(ox, oy);
const CAMPUS = {
  generatedFrom: 'data/measurements.json by scripts/build-campus-data.mjs - do not edit by hand',
  frame: { units: 'metres', x: 'east', z: 'south', y: 'up', origin: { what: 'centre of the running track', lon: +olon.toFixed(6), lat: +olat.toFixed(6) } },
  caveats: {
    heights: M.assumptions.note,
    obliqueImage: M.image.lean.basis,
  },
  track: {
    cx: 0, cz: 0, longAxis: T.longAxis, straight: T.straight, innerRadius: T.innerRadius, lanes: T.lanes, laneWidth: T.laneWidth, outerRadius: r1(outerR),
    outer: { sizeX: r1(2 * outerR), sizeZ: r1(T.straight + 2 * outerR) },
    infield: { cx: r1(-offE), cz: r1(-offS), sizeX: r1((ie - iw) * mpp), sizeZ: r1((is - inn) * mpp) },
    features: T.features, basis: T.basis,
  },
  items,
};
writeFileSync('src/campus-data.js', '// GENERATED FILE. Source of truth: data/measurements.json. Regenerate with: npm run data\nexport const CAMPUS = ' + JSON.stringify(CAMPUS, null, 2) + ';\n');
console.log('origin pixel', ox.toFixed(1), oy.toFixed(1), '| lon/lat', olon.toFixed(6), olat.toFixed(6));
console.log('track outer', CAMPUS.track.outer, '| infield', CAMPUS.track.infield);
console.log(items.length + ' items; solid ' + items.filter(i => i.solid).length + ', corrected for oblique view ' + items.filter(i => i.correctedForObliqueView).length);
for (const i of items.filter(i => ['gym-main', 'plaza-canopy', 'slab-north', 'clock-tower', 'grandstand-roof'].includes(i.id)))
  console.log(' ', i.id, 'h', i.height, 'acc ±' + i.positionAccuracyM, i.shape === 'circle' ? [i.cx, i.cz] : JSON.stringify(i.points.slice(0, 2)) + '…');
