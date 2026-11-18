// Used by .github/workflows/windows-launcher.yml: loads the page served by the launcher in the machine's own Edge or
// Chrome (headless), waits until the world is built, reports what failed and what the console said, saves a picture.
// usage: node launcher/ci-load.mjs <page address> <picture.png>      (needs the npm package playwright-core)
import { chromium } from 'playwright-core';

const [url, shot] = process.argv.slice(2);
let browser = null;
for (const channel of ['msedge', 'chrome']) {
  try {
    browser = await chromium.launch({ channel, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    console.log('browser:', channel, browser.version());
    break;
  } catch (e) { console.log(channel, 'could not be started:', String(e.message).split('\n')[0]); }
}
if (!browser) { console.log('no browser to test with'); process.exit(2); }

const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
const t0 = Date.now();
// ?reveal=1: the sequence a person gets (the world switched on group by group behind the loading panel)
page.on('console', m => { if (/^\[load\]/.test(m.text()) && !/楼宇 ([2-9]|[1-3][0-9]) |周边 [2-6] /.test(m.text())) console.log(m.text()); });
await page.goto(url + '?time=9.2&reveal=1', { waitUntil: 'load' });
await page.waitForFunction(() => (window.__app && window.__app.drawn) || /失败/.test((document.getElementById('loading-main') || {}).textContent || ''), null, { timeout: 25 * 60000, polling: 500 });
const panel = await page.evaluate(() => { const p = document.getElementById('loading'); return p ? [document.getElementById('loading-main').textContent, document.getElementById('loading-step').textContent].join(' | ') : null; });
if (panel) { console.log('the page stopped on its loading panel:', panel); process.exit(1); }
const info = await page.evaluate(() => {
  const c = document.createElement('canvas'), g = c.getContext('webgl2') || c.getContext('webgl'), e = g && g.getExtension('WEBGL_debug_renderer_info');
  return { address: location.search, failed: __app.report.failed, built: __app.report.built.length, fallback: __app.report.fallback.length, render: __app.renderInfo(),
    graphics: g ? (e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'renderer not named') : 'no WebGL' };
});
console.log('ready after', Math.round((Date.now() - t0) / 1000), 's:', JSON.stringify(info));
await page.screenshot({ path: shot, timeout: 300000 });
console.log(errors.length ? 'console errors: ' + JSON.stringify(errors) : 'no console errors');
await browser.close();
if (info.failed.length || errors.length || /safe=1/.test(info.address)) process.exit(1);
