// Optional post-processing for src/lighting.js: ambient occlusion and a restrained bloom.
//
//   scene -> [RenderPass, into a 4x multisampled half-float target when antialiasing is on]
//         -> [GTAOPass: ground-truth ambient occlusion, denoised, multiplied onto the image]
//         -> [UnrealBloomPass: only what is brighter than white after exposure: sun disc, glints, lamps, lit windows;
//             its input is capped so that a mirror-like glint of the sun or moon on glass cannot flare over half a facade]
//         -> [OutputPass: tone mapping with the renderer's exposure, sRGB]
//
// lighting.js loads this file only when post-processing is wanted (never on phones unless ?post=1), so the addon files
// below are not even requested otherwise. If the composer cannot be built or fails on its first frame, render() returns
// false for good and lighting.js draws the scene directly.
//
// ASSUMED: every number here (occlusion radius 0.7 m, its strength, bloom threshold, cap and strength) is chosen by eye.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createPost(renderer, opts = {}) {
  const gl = renderer.getContext();
  // half-float colour buffers are needed for the linear, unclamped image between the passes
  if (!renderer.capabilities.isWebGL2 && !(gl && typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)) return null;
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null;

  const samples = opts.antialias === false ? 0 : Math.min(4, gl.getParameter(gl.MAX_SAMPLES) || 0);
  const aoScale = 1;                                           // occlusion at full resolution: at half size thin legs and rails came out blotchy
  let composer = null, renderPass = null, gtao = null, bloom = null, forCamera = null, broken = false, frames = 0;
  const size = new THREE.Vector2(), bloomCap = { value: 8 }, aoBox = new THREE.Box3(), AO_RADIUS = 0.7;

  function build(scene, camera) {
    renderer.getDrawingBufferSize(size);
    const target = new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples });
    target.texture.name = 'post-buffer';
    composer = new EffectComposer(renderer, target);
    composer.setPixelRatio(1);                                 // sizes are handled here in device pixels
    renderPass = new RenderPass(scene, camera);
    gtao = new GTAOPass(scene, camera, Math.ceil(size.x * aoScale), Math.ceil(size.y * aoScale));
    const fullSize = GTAOPass.prototype.setSize;
    gtao.setSize = (w, h) => fullSize.call(gtao, Math.max(1, Math.ceil(w * aoScale)), Math.max(1, Math.ceil(h * aoScale)));
    gtao.updateGtaoMaterial({ radius: AO_RADIUS, distanceExponent: 1, thickness: 1, distanceFallOff: 1, scale: 1, samples: 16, screenSpaceRadius: false });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 12, radiusExponent: 2, rings: 2, samples: 16 });
    gtao.blendIntensity = 0.8;
    bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.22, 0.4, 2);
    // cap what goes into the bloom (the pass has no such setting): one line of its high-pass shader is replaced
    const hp = bloom.materialHighPassFilter, line = 'gl_FragColor = mix( outputColor, texel, alpha );';
    if (hp && hp.fragmentShader && hp.fragmentShader.includes(line) && hp.uniforms) {
      hp.uniforms.bloomCap = bloomCap;
      hp.fragmentShader = hp.fragmentShader.replace('void main()', 'uniform float bloomCap;\nvoid main()').replace(line, 'gl_FragColor = mix( outputColor, vec4( min( texel.rgb, vec3( bloomCap ) ), texel.a ), alpha );');
      hp.needsUpdate = true;
    }
    composer.addPass(renderPass); composer.addPass(gtao); composer.addPass(bloom); composer.addPass(new OutputPass());
    composer.setSize(size.x, size.y);
    forCamera = camera;
  }
  function dispose() {
    if (!composer) return;
    for (const p of composer.passes) if (p.dispose) p.dispose();
    composer.dispose();
    composer = null;
  }

  return {
    /** Draws the frame through the composer. False if that is not possible (the caller then renders directly). */
    render(scene, camera, state = {}) {
      if (broken) return false;
      try {
        if (!composer || forCamera !== camera || renderPass.scene !== scene) { dispose(); build(scene, camera); }
        const exposure = state.exposure || renderer.toneMappingExposure || 1, night = state.night || 0;
        // Occlusion only where its radius covers at least 3 pixels: farther away the samples fall inside one pixel and the
        // result is noise, which the denoiser spreads into blotches (seen from the air and in the top-down view).
        if (camera.isPerspectiveCamera) {
          const reach = THREE.MathUtils.clamp(AO_RADIUS * size.y / (2 * Math.tan(camera.fov * Math.PI / 360)) / 3, 15, 150);
          aoBox.min.copy(camera.position).subScalar(reach); aoBox.max.copy(camera.position).addScalar(reach);
          gtao.setSceneClipBox(aoBox); gtao.enabled = true;
        } else gtao.enabled = AO_RADIUS * size.y * (camera.zoom || 1) / Math.max(1e-6, camera.top - camera.bottom) >= 3;
        bloom.threshold = (1.3 + 0.5 * night) / exposure;      // "brighter than white" in scene units
        bloomCap.value = 3.5 * bloom.threshold;
        bloom.strength = 0.22 + 0.06 * night;
        composer.render();
        frames++;
        return true;
      } catch (err) {
        // only give up for good if the very first frames fail; a later exception is a bug that should be seen
        if (frames > 2) throw err;
        broken = true; dispose();
        renderer.setRenderTarget(null);
        return false;
      }
    },
    resize() { renderer.getDrawingBufferSize(size); if (composer) composer.setSize(size.x, size.y); },
    info: () => ({ samples, frames, broken, aoScale }),
  };
}
