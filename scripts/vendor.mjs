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
  ['three/examples/jsm/math/Octree.js', 'three/addons/math/Octree.js'],                 // 3D collision
  ['three/examples/jsm/math/Capsule.js', 'three/addons/math/Capsule.js'],               // imported by Octree.js
  // post-processing (src/post.js; loaded only when ambient occlusion and bloom are on)
  ['three/examples/jsm/postprocessing/EffectComposer.js', 'three/addons/postprocessing/EffectComposer.js'],
  ['three/examples/jsm/postprocessing/Pass.js', 'three/addons/postprocessing/Pass.js'],                 // base class of every pass
  ['three/examples/jsm/postprocessing/ShaderPass.js', 'three/addons/postprocessing/ShaderPass.js'],     // imported by EffectComposer.js
  ['three/examples/jsm/postprocessing/MaskPass.js', 'three/addons/postprocessing/MaskPass.js'],         // imported by EffectComposer.js
  ['three/examples/jsm/postprocessing/RenderPass.js', 'three/addons/postprocessing/RenderPass.js'],
  ['three/examples/jsm/postprocessing/GTAOPass.js', 'three/addons/postprocessing/GTAOPass.js'],
  ['three/examples/jsm/postprocessing/UnrealBloomPass.js', 'three/addons/postprocessing/UnrealBloomPass.js'],
  ['three/examples/jsm/postprocessing/OutputPass.js', 'three/addons/postprocessing/OutputPass.js'],
  ['three/examples/jsm/shaders/CopyShader.js', 'three/addons/shaders/CopyShader.js'],                   // EffectComposer, GTAOPass, UnrealBloomPass
  ['three/examples/jsm/shaders/OutputShader.js', 'three/addons/shaders/OutputShader.js'],               // OutputPass
  ['three/examples/jsm/shaders/GTAOShader.js', 'three/addons/shaders/GTAOShader.js'],                   // GTAOPass
  ['three/examples/jsm/shaders/PoissonDenoiseShader.js', 'three/addons/shaders/PoissonDenoiseShader.js'], // GTAOPass
  ['three/examples/jsm/shaders/LuminosityHighPassShader.js', 'three/addons/shaders/LuminosityHighPassShader.js'], // UnrealBloomPass
  ['three/examples/jsm/math/SimplexNoise.js', 'three/addons/math/SimplexNoise.js'],                     // GTAOPass
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
