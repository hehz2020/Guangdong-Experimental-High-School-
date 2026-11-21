// Writes the 3D campus's lamps (LIT in src/street.js: every street, garden, canopy and room lamp the modules draw, as
// [x, z, radius of its pool of light, height]) to a JSON file, for build_world.py --lamps.
//
// usage: node minecraft/lamps.mjs <page url> <lamps.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
const sep = url.includes('?') ? '&' : '?';
await page.goto(url + sep + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0&time=12', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const lit = await page.evaluate(async () => {
  const m = await import(new URL('src/street.js', location.href).href);
  // the height a lamp without one is lit at, as src/lighting.js sets it
  return m.LIT.map(([x, z, r, y]) => [x, z, r, Number.isFinite(y) ? y : Math.min(9, Math.max(2.4, 0.62 * r)), Number.isFinite(y) ? 1 : 0]);
});
fs.writeFileSync(out, JSON.stringify(lit));
console.log(lit.length, 'lamps,', lit.filter(l => l[4]).length, 'with a height of their own');
await browser.close();
