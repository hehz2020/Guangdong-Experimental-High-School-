// Rebuilds vendor/ from node_modules with an explicit list, so the repository ships only
// the third-party files the app actually imports. Run: npm install && npm run vendor
import { cpSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

const FILES = [
  // [source in node_modules, destination in vendor]
  ['three/build/three.module.js', 'three/three.module.js'],
  ['three/build/three.core.js', 'three/three.core.js'],        // three.module.js imports this
  ['three/LICENSE', 'three/LICENSE'],                           // MIT licence must travel with the copies
  ['three/examples/jsm/controls/PointerLockControls.js', 'three/addons/controls/PointerLockControls.js'],
];

if (!existsSync('node_modules/three')) { console.error('node_modules/three missing: run npm install first'); process.exit(1); }
rmSync('vendor', { recursive: true, force: true });
let bytes = 0;
for (const [from, to] of FILES) {
  mkdirSync(dirname('vendor/' + to), { recursive: true });
  cpSync('node_modules/' + from, 'vendor/' + to);
  bytes += statSync('vendor/' + to).size;
  console.log('vendored', to);
}
console.log(FILES.length + ' files, ' + (bytes / 1e6).toFixed(2) + ' MB');
