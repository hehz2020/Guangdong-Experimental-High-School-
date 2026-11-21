// Sun, moon, sky, ambient light, shadows and exposure driven by a time of day.
//
// What this module does
//   sky        one dome drawn in linear HDR (tone mapped like everything else): gradient by sun elevation, warm horizon
//              toward the sun, sun disc and glow, a few procedural clouds, stars and a moon after dusk
//   ambient    the same dome (without the sun disc and clouds, mostly desaturated, with a ground colour below the
//              horizon) is rendered into a small PMREM and used as scene.environment: shaded walls are lit by the
//              part of the sky and ground they face, and glass reflects it. Regenerated when the time changes, at
//              most every 0.35 s (0.8 s on phones) while the slider is dragged; in between only its intensity follows
//              the time. ?env=0 replaces it by a plain two-colour hemisphere light.
//   shadows    nested shadow boxes round the viewer ("cascades"): three directional lights that are the same sun, each
//              with a shadow map over a larger box (52 m, 182 m and 640 m across when walking: 2.5 cm, 9 cm and 31 cm
//              per texel at 2048; from the air the boxes grow up to 390 m, 640 m and 1040 m). A patch of one three.js
//              shader chunk (lights_fragment_begin) makes every lit material use the finest box that contains the
//              fragment and blend into the next one near its edge, so no material has to be set up one by one. The
//              scene is static, so a map is only drawn again when the viewer has left the inner part of its box or the
//              time has changed, and at most one map per frame; box centres snap to whole texels, so edges do not
//              crawl. If the chunk does not look as expected (another three.js release) one 300 m box is used.
//              ?cascades=1|2 for comparison.
//   interiors  a soft lamp above the viewer that is only on under a roof (building outlines of campus-data.js; weak by
//              day, the main light at night), a fixed lamp in the middle of the gymnasium hall, and a little more
//              exposure indoors by day
//   night      window glass glows (palette names glass*, and the glass materials of the builders), lamp materials get
//              brighter, unlit line materials are dimmed with the daylight
//   post       optional ambient occlusion and bloom (src/post.js), loaded only when wanted
//
// ASSUMED (choices of this module, not taken from any reference)
//   - Sun path: latitude 23.08 N and a fixed solar declination of +12 degrees (late April / mid August); solar time,
//     no equation of time. Sunrise comes out at about 5.65 h and sunset at about 18.35 h.
//   - All sky colours, the haze, the clouds (procedural noise, not weather), the star field (random, not a star map),
//     the city glow on the night horizon, and the moon: its place in the sky is fixed (south-east, 48 degrees up) and
//     has nothing to do with a date.
//   - Which windows glow after dusk, and how brightly: every glass surface glows, modulated by a smooth random pattern
//     per 3.9 m band (the storey height most buildings here are drawn with). Nothing is known about which rooms are lit.
//   - Indoor light: there are no real room lights. One lamp follows the viewer under a roof (1.25 m above the eye, 2 m
//     in the new teaching building), and in the gymnasium a lamp hangs in the middle of the hall. Colour and strength
//     are chosen by eye. "Under a roof" means inside the outline of a solid item of campus-data.js and below its height,
//     so open galleries count as indoors and the plaza canopy and covered walkways do not; builders can add covered
//     places of their own (ctx.indoor in world/index.js), which are checked first.
//   - Glass is recognised by material name (glass, teal, clere, curtain, ribbon, pane, window) or, for materials the
//     builders left unnamed, by being smooth (roughness up to 0.3); lamps by a strong, nearly white emissive colour.
//   - Exposure per time of day and the indoor boost are chosen by eye.
import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';

const RAD = Math.PI / 180;
const LAT = 23.08 * RAD;                               // Guangzhou
const DECL = 12 * RAD;                                 // solar declination used for the sun path; a choice, not data
const MOON_DIR = new THREE.Vector3(-Math.sin(-40 * RAD) * Math.cos(48 * RAD), Math.sin(48 * RAD), Math.cos(-40 * RAD) * Math.cos(48 * RAD));   // toward the moon: south-east, 48 degrees up
const STOREY = 3.9;

// ---------------------------------------------------------------------------------------------------------------------
// keyframes over the sun's elevation in degrees
const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);            // linear working colour times a multiplier
//            elevation  zenith                 horizon toward the sun   horizon away from it     glow round the sun
const SKY_KEYS = [
  [-18, col(0x0d1326, 1.0), col(0x46363a, 1.0), col(0x33333f, 1.0), col(0x000000, 0)],          // night: city glow on the horizon
  [-9, col(0x0e1a3e, 1.0), col(0x55394a, 1.0), col(0x202b4a, 1.0), col(0x503040, 0.4)],
  [-4, col(0x17306a, 1.0), col(0xd0683a, 0.9), col(0x2c3e6e, 1.0), col(0xff8040, 0.7)],         // civil twilight
  [0, col(0x2452a0, 1.0), col(0xff9a4a, 1.35), col(0x7088bc, 0.9), col(0xff9040, 1.3)],         // sunrise and sunset
  [6, col(0x2b62bd, 1.1), col(0xffc888, 1.5), col(0x9db9e0, 1.1), col(0xffb060, 1.5)],          // golden hour
  [16, col(0x2a66c6, 1.25), col(0xe6e6e0, 1.5), col(0xb4d0ee, 1.3), col(0xffe2b0, 1.3)],
  [40, col(0x2864c8, 1.35), col(0xc6dcf2, 1.5), col(0xbcd8f2, 1.45), col(0xfff0d0, 1.2)],
];
//            elevation  colour of the sunlight   intensity
const SUN_KEYS = [[-2.5, col(0xff6a30), 0], [0, col(0xff7a3c), 0.8], [4, col(0xff9a55), 2.0], [10, col(0xffc890), 2.9], [22, col(0xffe6c4), 3.4], [45, col(0xfff3e0), 3.6], [80, col(0xfff6ea), 3.7]];
const EXPOSURE_KEYS = [[-18, 1.8], [-9, 1.6], [-4, 1.45], [0, 1.35], [6, 1.12], [16, 0.82], [40, 0.66]];
const MOON_LIGHT = col(0x9fb6e8), MOON_INTENSITY = 0.4, ENV_GAIN = 1.3;

/** Interpolates a keyframe table [[x, a, b, ...], ...]; numbers and THREE.Color entries; out gets the mixed entries. */
function sample(keys, x, out) {
  let i = 0; while (i < keys.length - 2 && x > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1], k = THREE.MathUtils.clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
  for (let j = 1; j < a.length; j++) {
    if (a[j].isColor) (out[j - 1] || (out[j - 1] = new THREE.Color())).copy(a[j]).lerp(b[j], k);
    else out[j - 1] = a[j] + (b[j] - a[j]) * k;
  }
  return out;
}
const smooth = (x, lo, hi) => THREE.MathUtils.smoothstep(x, lo, hi);

// ---------------------------------------------------------------------------------------------------------------------
// shadow cascades: shader side
//
// three.js lights a fragment by every directional light in turn. Here the directional lights that cast shadows are one
// and the same sun seen through shadow boxes of growing size (index 0 the smallest), so the loop over them only collects
// the shadow and the sun is added once. A fragment takes the first box it lies in; the last eighth of a box fades into
// the next one, and beyond the last box there is no shadow. Directional lights without a shadow are added as usual.
const CASCADE_CHUNK = /* glsl */`
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;

	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0

		DirectionalLightShadow directionalLightShadow;
		float cascadeLit = 1.0;
		float cascadeFree = 1.0;
		float cascadeWeight;
		vec3 cascadeCoord;

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {

			cascadeCoord = vDirectionalShadowCoord[ i ].xyz / vDirectionalShadowCoord[ i ].w;
			cascadeWeight = cascadeFree * clamp( min( min( cascadeCoord.x, 1.0 - cascadeCoord.x ), min( cascadeCoord.y, 1.0 - cascadeCoord.y ) ) * 14.0 - 0.15, 0.0, 1.0 );

			if ( cascadeWeight > 0.0 ) {

				directionalLightShadow = directionalLightShadows[ i ];
				cascadeLit -= cascadeWeight * ( 1.0 - getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) );
				cascadeFree -= cascadeWeight;

			}

		}
		#pragma unroll_loop_end

		directionalLight = directionalLights[ 0 ];
		getDirectionalLightInfo( directionalLight, directLight );
		directLight.color *= ( directLight.visible && receiveShadow ) ? cascadeLit : 1.0;
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

		#pragma unroll_loop_start
		for ( int i = NUM_DIR_LIGHT_SHADOWS; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];
			getDirectionalLightInfo( directionalLight, directLight );
			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

		}
		#pragma unroll_loop_end

	#else

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			directionalLight = directionalLights[ i ];
			getDirectionalLightInfo( directionalLight, directLight );
			RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

		}
		#pragma unroll_loop_end

	#endif

#endif

`;
let chunkPatched = null;
/** Replaces the directional-light block of the shared shader chunk. False if this three.js build does not look as expected. */
function patchDirectionalChunk() {
  if (chunkPatched !== null) return chunkPatched;
  const src = THREE.ShaderChunk.lights_fragment_begin || '';
  const a = src.indexOf('#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )'), b = src.indexOf('#if ( NUM_RECT_AREA_LIGHTS > 0 )');
  const ok = a >= 0 && b > a && src.slice(a, b).includes('getShadow( directionalShadowMap[ i ]') && !src.slice(a, b).includes('NUM_SPOT') &&
    (THREE.ShaderChunk.shadowmap_pars_fragment || '').includes('vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ]');
  if (ok) THREE.ShaderChunk.lights_fragment_begin = src.slice(0, a) + CASCADE_CHUNK.trimStart() + src.slice(b);
  return (chunkPatched = ok);
}

// ---------------------------------------------------------------------------------------------------------------------
// sky dome
const SKY_VERTEX = 'varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }';
const SKY_FRAGMENT = /* glsl */`
#include <common>
#include <dithering_pars_fragment>
varying vec3 vDir;
uniform vec3 zenith, horizonSun, horizonAway, glow, sunDir, moonDir, groundCol, cloudLit, cloudDark;
uniform float sunDisc, stars, moonAmt, cloudCover, cloudShift, envMode;
float hash13( vec3 p ) { p = fract( p * 0.1031 ); p += dot( p, p.zyx + 31.32 ); return fract( ( p.x + p.y ) * p.z ); }
float hash12( vec2 p ) { vec3 q = fract( vec3( p.xyx ) * 0.1031 ); q += dot( q, q.yzx + 33.33 ); return fract( ( q.x + q.y ) * q.z ); }
float vnoise( vec2 p ) {
	vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( hash12( i ), hash12( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash12( i + vec2( 0.0, 1.0 ) ), hash12( i + vec2( 1.0, 1.0 ) ), f.x ), f.y );
}
float fbm( vec2 p ) {
	float s = 0.0, a = 0.5;
	for ( int i = 0; i < CLOUD_OCTAVES; i ++ ) { s += a * vnoise( p ); p = p * 2.07 + vec2( 17.3, 9.1 ); a *= 0.5; }
	return s;
}
void main() {
	vec3 d = normalize( vDir );
	float h = d.y;
	// the warm horizon colour is strongest toward the sun and fades to a cooler one on the far side
	float toward = pow( 0.5 + 0.5 * dot( normalize( d.xz + 1e-5 ), normalize( sunDir.xz + 1e-5 ) ), 1.5 );
	vec3 hz = mix( horizonAway, horizonSun, toward );
	vec3 c = mix( hz, zenith, pow( smoothstep( -0.02, 0.8, h ), 0.45 ) );
	if ( stars > 0.0 && h > 0.0 ) {
		vec3 p = d * 170.0, id = floor( p ), f = fract( p ) - 0.5;
		float r = hash13( id );
		c += vec3( 0.85, 0.92, 1.0 ) * ( step( 0.9955, r ) * smoothstep( 0.34, 0.06, length( f ) ) * stars * ( 0.35 + 0.65 * fract( r * 61.0 ) ) * smoothstep( 0.0, 0.3, h ) );
	}
	#if CLOUD_OCTAVES > 0
	if ( h > 0.015 && cloudCover < 0.99 ) {
		float n = fbm( d.xz / ( h + 0.2 ) * 0.85 + cloudShift );
		float cover = smoothstep( cloudCover, cloudCover + 0.28, n ) * smoothstep( 0.015, 0.22, h );
		c = mix( c, mix( cloudLit, cloudDark, smoothstep( cloudCover + 0.12, cloudCover + 0.55, n ) ), cover * 0.88 );
	}
	#endif
	float s = max( dot( d, sunDir ), 0.0 );
	c += glow * ( pow( s, 8.0 ) * 0.22 + pow( s, 90.0 ) * 0.55 );
	if ( envMode < 0.5 ) {
		c += glow * ( sunDisc * smoothstep( 0.99982, 0.99993, s ) );
		float m = max( dot( d, moonDir ), 0.0 );
		c += vec3( 0.8, 0.88, 1.0 ) * ( moonAmt * ( smoothstep( 0.99988, 0.99994, m ) * 2.2 + pow( m, 900.0 ) * 0.12 ) );
		c = mix( c, hz * 0.82, smoothstep( 0.0, -0.18, h ) );                 // below the horizon: haze
	} else {
		// for the ambient capture: skylight is taken mostly as its brightness (a saturated blue sky would tint every
		// shaded wall and every room blue), and the ground reflects light upward
		c = mix( vec3( dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ) ), c, 0.27 );
		c = mix( c, groundCol, smoothstep( 0.03, -0.05, h ) );
	}
	gl_FragColor = vec4( c, 1.0 );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <dithering_fragment>
}`;
function makeSky(uniforms, octaves) {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, dithering: true, uniforms,
    defines: { CLOUD_OCTAVES: octaves }, vertexShader: SKY_VERTEX, fragmentShader: SKY_FRAGMENT,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material);
  mesh.scale.setScalar(2800); mesh.frustumCulled = false; mesh.renderOrder = -1; mesh.name = 'sky';
  return mesh;
}

// ---------------------------------------------------------------------------------------------------------------------
// roofs: where the viewer is under cover (outlines and heights of campus-data.js)
function makeRoofs(extra = []) {
  const roofs = [];
  // covered places the builders declared (ctx.indoor in world/index.js): checked before the data outlines
  for (const d of extra) {
    let w = Infinity, e = -Infinity, n = Infinity, s = -Infinity;
    for (const [x, z] of d.pts) { w = Math.min(w, x); e = Math.max(e, x); n = Math.min(n, z); s = Math.max(s, z); }
    roofs.push({ pts: d.pts, w, e, n, s, height: d.top - 0.3, bottom: d.bottom, hall: null, tall: false });
  }
  for (const it of CAMPUS.items) {
    if (!it.solid || !(it.height > 3)) continue;
    const pts = it.shape === 'circle' ? Array.from({ length: 24 }, (_, i) => [it.cx + it.radius * Math.cos(i / 24 * 2 * Math.PI), it.cz + it.radius * Math.sin(i / 24 * 2 * Math.PI)]) : it.points;
    if (!pts || pts.length < 3) continue;
    let w = Infinity, e = -Infinity, n = Infinity, s = -Infinity;
    for (const [x, z] of pts) { w = Math.min(w, x); e = Math.max(e, x); n = Math.min(n, z); s = Math.max(s, z); }
    // one big room (gymnasium): a fixed lamp in the middle instead of one that follows the viewer
    const hall = it.style === 'gym' ? { x: (w + e) / 2, y: it.height * 0.6, z: (n + s) / 2, reach: Math.hypot(e - w, s - n) * 0.8, power: 5.5 } : null;
    roofs.push({ pts, w, e, n, s, height: it.height, hall, tall: it.style === 'new-building' });
  }
  return roofs;
}
function inside(pts, x, z) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}

// ---------------------------------------------------------------------------------------------------------------------
// materials of the builders: night glow of glass, brighter lamps, dimmed unlit lines
const isGlassName = n => /glass|teal|clere|curtain|ribbon|pane|window/i.test(n) && !/rail|water|sky/i.test(n);
const WINDOW_GLSL = /* glsl */`
	{
		float campusStorey = floor( vCampusPos.y / ${STOREY.toFixed(1)} + 0.03 );
		float campusAlong = ( vCampusPos.x * 0.83 + vCampusPos.z * 0.56 ) / 7.5 + campusStorey * 13.7;
		float campusA = fract( sin( floor( campusAlong ) * 12.9898 ) * 43758.5453 ), campusB = fract( sin( ( floor( campusAlong ) + 1.0 ) * 12.9898 ) * 43758.5453 );
		float campusF = fract( campusAlong );
		float campusRoom = mix( campusA, campusB, campusF * campusF * ( 3.0 - 2.0 * campusF ) );
		vec3 campusLit = campusWindowColor * ( campusWindowGlow * ( 0.16 + 0.84 * smoothstep( 0.3, 0.62, campusRoom ) ) * ( 0.65 + 0.35 * fract( sin( campusStorey * 78.233 ) * 43758.5453 ) ) );
		#ifdef USE_MAP
			campusLit *= 0.12 + 1.7 * diffuseColor.rgb;        // painted window bands: frames stay dark, curtains and panes light up
		#endif
		totalEmissiveRadiance += campusLit;
	}
`;

export function createLighting(scene, renderer, opts = {}) {
  const low = !!opts.lowPower, shadowsOn = opts.shadows !== false && !opts.plain;
  // Diagnostic switches read from the address: ?env=0 (no sky capture, plain hemisphere light instead), ?cascades=1|2|3.
  const query = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
  // opts.plain (the page's safe mode): stock three.js shaders only. No shadow maps (their shader chunk is patched here), no
  // window-glow patch, no sky capture, no post-processing.
  const plain = !!opts.plain;
  const useEnv = plain ? false : query.has('env') ? query.get('env') !== '0' : true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = shadowsOn;
  renderer.shadowMap.type = THREE.PCFShadowMap;      // hardware-filtered depth comparison, 5 taps (the soft variant no longer exists in this release)

  // ---- sky
  const U = {
    zenith: { value: new THREE.Color() }, horizonSun: { value: new THREE.Color() }, horizonAway: { value: new THREE.Color() }, glow: { value: new THREE.Color() },
    groundCol: { value: new THREE.Color() }, cloudLit: { value: new THREE.Color() }, cloudDark: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) }, moonDir: { value: MOON_DIR.clone() },
    sunDisc: { value: 0 }, stars: { value: 0 }, moonAmt: { value: 0 }, cloudCover: { value: 0.5 }, cloudShift: { value: 0 }, envMode: { value: 0 },
  };
  const sky = makeSky(U, low ? 3 : 4); scene.add(sky);
  // the same dome for the ambient capture: shares every uniform except envMode
  const envSky = makeSky({ ...U, envMode: { value: 1 } }, 0); envSky.scale.setScalar(50);
  const envScene = new THREE.Scene(); envScene.add(envSky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTarget = null, envDirty = true, envBuiltAt = -1e9, envLevel = 1, timeSetAt = -1e9, envBuilds = 0;

  // ---- lights
  // The hemisphere light must stay a direct child of the scene: the gymnasium's glass reads its intensity as "how much
  // daylight there is" (0..1). Its strength is therefore carried by its colours, not by its intensity.
  const hemi = new THREE.HemisphereLight(0x000000, 0x000000, 1); hemi.name = 'daylight'; scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.03); scene.add(ambient);
  const fill = new THREE.PointLight(0xffe8c8, 0, 34, 0.8); fill.name = 'indoor-lamp'; scene.add(fill);

  const cascadesOk = shadowsOn && patchDirectionalChunk();
  const N = !shadowsOn || !cascadesOk ? 1 : THREE.MathUtils.clamp(Math.round(Number(query.get('cascades')) || 3), 1, 3);
  const res = opts.shadowRes || (low ? 1024 : 2048);
  const BASE0 = 26, BASE_LAST = N > 1 ? 320 : 150;            // half sizes of the smallest and largest box on the ground, metres
  const suns = [], boxes = [];
  for (let i = 0; i < N; i++) {
    const l = new THREE.DirectionalLight(0xffffff, 0); l.name = 'sun-' + i; l.castShadow = shadowsOn;
    l.shadow.mapSize.set(res, res); l.shadow.autoUpdate = false; l.shadow.needsUpdate = true;
    scene.add(l); scene.add(l.target); suns.push(l);
    boxes.push({ u: 1e9, v: 1e9, r: 0, dirty: true, since: 0 });
  }
  const sun = suns[0];

  // ---- state
  const toSun = new THREE.Vector3(0, 1, 0), lightDir = new THREE.Vector3(0, 1, 0), LX = new THREE.Vector3(), LY = new THREE.Vector3();
  const K = [], S = [], tmpC = new THREE.Color(), tmpV = new THREE.Vector3(), fwd = new THREE.Vector3(), focus = new THREE.Vector3();
  let hours = 15, elDeg = 0, day = 1, night = 0, exposureTime = 0.7, sunPower = 0, depthMin = -800, depthMax = 800, bounds = null;
  let frame = 0, lastNow = 0, scale = 1, basisVersion = 0, viewer = null, indoor = 0, indoorTarget = 0, roofNow = null, lampPower = 0;
  const roofs = makeRoofs(opts.indoors || []);
  scene.fog = new THREE.Fog(0xffffff, 300, 3200);

  // ---- materials found in the scene
  const windowGlow = { value: 0 }, windowColor = { value: new THREE.Color(0xffc37a) };
  const seen = new Set(), lamps = [], unlit = [];
  function adopt(m) {
    if (!m || seen.has(m) || m === sky.material) return;
    seen.add(m);
    const name = m.name || '';
    // Glass: by palette name, or (materials the builders made without a name) anything smooth: roughness up to 0.3.
    if (!plain && m.isMeshStandardMaterial && !m.userData.campusWindow && (isGlassName(name) || (!name && m.roughness <= 0.3 && m.metalness <= 0.5))) {
      // window glass: an extra emissive term that only this module drives (the material's own emissive is left alone)
      m.userData.campusWindow = true;
      const before = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
      m.onBeforeCompile = (shader, r) => {
        if (before) before.call(m, shader, r);
        shader.uniforms.campusWindowGlow = windowGlow; shader.uniforms.campusWindowColor = windowColor;
        shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCampusPos;')
          .replace('#include <project_vertex>', '#include <project_vertex>\n\tvCampusPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vCampusPos;\nuniform float campusWindowGlow;\nuniform vec3 campusWindowColor;')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + WINDOW_GLSL);
      };
      m.customProgramCacheKey = () => key + '|campus-window';
      m.needsUpdate = true;
    } else if (m.isMeshStandardMaterial && m.userData.glow === undefined && !m.emissiveMap && !/sky/i.test(name) && m.emissive && m.emissiveIntensity * (m.emissive.r + m.emissive.g + m.emissive.b) > 1.5) {
      // lamp panels and light coves: strongly self-lit, nearly white
      lamps.push({ m, base: m.emissiveIntensity });
    } else if ((m.isLineBasicMaterial || m.isMeshBasicMaterial) && m.color) {
      unlit.push({ m, base: m.color.clone() });
    }
  }
  function scan() {
    scene.traverse(o => {
      if (o.material) { if (Array.isArray(o.material)) o.material.forEach(adopt); else adopt(o.material); }
      // tree trunks are thin but they anchor the crowns' shadows near the viewer
      if (o.isInstancedMesh && o.name === 'tree-trunks' && shadowsOn) o.castShadow = true;
    });
    applyMaterials();
  }
  function applyMaterials() {
    const lampGain = 1 + 1.1 * night;
    for (const l of lamps) l.m.emissiveIntensity = l.base * lampGain;
    const dim = 0.05 + 0.95 * day;
    for (const u of unlit) u.m.color.copy(u.base).multiplyScalar(dim);
  }

  // ---- time of day
  function setTime(h) {
    hours = ((h % 24) + 24) % 24;
    const H = (hours - 12) * 15 * RAD;
    const el = Math.asin(Math.sin(LAT) * Math.sin(DECL) + Math.cos(LAT) * Math.cos(DECL) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(LAT) - Math.tan(DECL) * Math.cos(LAT));   // from south, positive toward west
    toSun.set(-Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    elDeg = el / RAD;
    day = smooth(elDeg, -6, 10);                      // 0 at night, 1 in daylight
    night = 1 - smooth(elDeg, -9, -1);                // 1 once it is dark enough for lamps and lit windows
    const moon = smooth(-elDeg, 5, 11);

    // sky
    sample(SKY_KEYS, elDeg, K);
    U.zenith.value.copy(K[0]); U.horizonSun.value.copy(K[1]); U.horizonAway.value.copy(K[2]); U.glow.value.copy(K[3]);
    U.sunDir.value.copy(toSun); U.sunDisc.value = elDeg > -1.2 ? 26 : 0;
    U.stars.value = 1.1 * (1 - smooth(elDeg, -12, -4)); U.moonAmt.value = moon;
    U.cloudShift.value = hours * 0.045;
    // clouds: lit by the sun colour by day, by the horizon glow at dusk, nearly black against the night sky
    sample(SUN_KEYS, elDeg, S); sunPower = S[1];
    U.cloudLit.value.setScalar(1).lerp(S[0], 0.55).multiplyScalar(0.25 + 0.3 * sunPower).lerp(K[1], 0.35 * (1 - day)).lerp(tmpC.copy(K[2]).multiplyScalar(1.6), 1 - smooth(elDeg, -8, 2));
    U.cloudDark.value.copy(K[2]).lerp(K[0], 0.35).multiplyScalar(0.55 + 0.25 * day);
    // light bounced off the ground, for the ambient capture
    const skyGrey = 0.5 * (0.2126 * (K[0].r + K[2].r) + 0.7152 * (K[0].g + K[2].g) + 0.0722 * (K[0].b + K[2].b));
    U.groundCol.value.set(0.36, 0.35, 0.3).multiply(tmpC.copy(S[0]).multiplyScalar(sunPower * Math.max(Math.sin(el), 0) / Math.PI).addScalar(skyGrey * 0.8));
    scene.fog.color.copy(K[2]).lerp(K[1], 0.25);
    scene.fog.near = 300 - 120 * (1 - day);

    // sun or moon
    const moonUp = sunPower <= 0 && elDeg < -3.5;
    if (moonUp) lightDir.copy(MOON_DIR);
    else {                                             // never let the light graze the ground: shadows would stretch without end
      const e = Math.max(el, 4 * RAD);
      lightDir.set(-Math.sin(az) * Math.cos(e), Math.sin(e), Math.cos(az) * Math.cos(e));
    }
    for (const l of suns) { l.color.copy(moonUp ? MOON_LIGHT : S[0]); l.intensity = moonUp ? MOON_INTENSITY * moon : sunPower; }
    LX.set(0, 1, 0).cross(lightDir).normalize(); LY.copy(lightDir).cross(LX).normalize();
    basisVersion++;
    for (const b of boxes) b.dirty = true;

    // daylight signal for builders (see above) and a trace of flat light so that nothing is ever pure black
    hemi.intensity = Math.max(0.04, day);
    if (!useEnv) {                                     // no sky capture: the same two colours as a plain hemisphere light
      hemi.color.setScalar(skyGrey).lerp(tmpC.copy(K[0]).add(K[2]).multiplyScalar(0.5), 0.27).multiplyScalar(Math.PI * ENV_GAIN / hemi.intensity);
      hemi.groundColor.copy(U.groundCol.value).multiplyScalar(Math.PI * ENV_GAIN / hemi.intensity);
    }
    ambient.intensity = 0.02 + 0.03 * day;
    exposureTime = sample(EXPOSURE_KEYS, elDeg, [])[0];
    windowColor.value.set(0xffc37a);
    applyMaterials();
    envDirty = true; timeSetAt = performance.now();
    if (envTarget) scene.environmentIntensity = ENV_GAIN * skyLevel() / envLevel;
    return { hours, elevationDeg: +elDeg.toFixed(1), azimuthFromSouthDeg: +(az / RAD).toFixed(1) };
  }
  // brightness of the sky now, to rescale the ambient capture between two captures
  function skyLevel() { const z = U.zenith.value, a = U.horizonAway.value, g = U.groundCol.value; return 0.001 + z.r + z.g + z.b + a.r + a.g + a.b + 2 * (g.r + g.g + g.b); }
  function buildEnvironment(now) {
    const target = pmrem.fromScene(envScene, 0, 0.1, 100, { size: low ? 64 : 256 });
    scene.environment = target.texture; scene.environmentIntensity = ENV_GAIN;
    if (envTarget) envTarget.dispose();
    envTarget = target; envLevel = skyLevel(); envDirty = false; envBuiltAt = now; envBuilds++;
  }

  // ---- shadow boxes
  function sceneBounds() {
    // depth range of the shadow cameras: everything that can cast or receive, measured once
    const box = new THREE.Box3();
    for (const o of scene.children) if (o !== sky && !o.isLight) box.expandByObject(o);
    if (box.isEmpty()) box.set(new THREE.Vector3(-700, 0, -700), new THREE.Vector3(700, 60, 700));
    box.min.set(Math.max(box.min.x, -720), Math.max(box.min.y, -3), Math.max(box.min.z, -720));
    box.max.set(Math.min(box.max.x, 720), Math.min(Math.max(box.max.y, 30), 140), Math.min(box.max.z, 720));
    return box;
  }
  let boundsVersion = -1;
  function updateBoxes(camera) {
    if (!bounds) bounds = sceneBounds();
    if (boundsVersion !== basisVersion) {
      boundsVersion = basisVersion; depthMin = Infinity; depthMax = -Infinity;
      for (let i = 0; i < 8; i++) { const d = tmpV.set(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).dot(lightDir); depthMin = Math.min(depthMin, d); depthMax = Math.max(depthMax, d); }
    }
    // What the boxes are centred on: the viewer when walking; from the air the ground the camera looks at, with larger boxes.
    camera.getWorldDirection(fwd);
    const hgt = camera.position.y, air = smooth(hgt, 25, 55);
    let reach = 0;
    if (air > 0) reach = Math.min(fwd.y < -0.03 ? hgt / -fwd.y : 1e9, 2.5 * hgt) * air;
    focus.copy(camera.position).addScaledVector(fwd, reach);
    const want = 1 + air * (THREE.MathUtils.clamp(reach / 60, 1, 7.5) - 1);
    if (Math.abs(Math.log2(want / scale)) > 0.3) { scale = Math.pow(2, Math.round(Math.log2(want) * 2) / 2); if (scale > 7.5) scale = 7.5; }
    const r0 = BASE0 * scale, rLast = BASE_LAST + (scale - 1) * 31, u = focus.dot(LX), v = focus.dot(LY);
    let pick = -1, first = false;
    for (let i = 0; i < N; i++) {
      const b = boxes[i], r = N === 1 ? rLast : r0 * Math.pow(rLast / r0, i / (N - 1));
      if (b.r !== r || Math.abs(u - b.u) > 0.2 * r || Math.abs(v - b.v) > 0.2 * r) b.dirty = true;
      if (b.dirty) { b.want = r; if (!suns[i].shadow.map) first = true; if (pick < 0 || b.since < boxes[pick].since) pick = i; }
    }
    if (pick < 0) return;
    // one map per frame, the one that has waited longest; all of them the first time
    for (let i = 0; i < N; i++) {
      const b = boxes[i]; if (!b.dirty || !(first || i === pick)) continue;
      const l = suns[i], r = b.want, texel = 2 * r / res, cam = l.shadow.camera;
      b.r = r; b.u = Math.round(u / texel) * texel; b.v = Math.round(v / texel) * texel; b.dirty = false; b.since = frame;
      cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r; cam.near = 0.5; cam.far = depthMax - depthMin + 2; cam.updateProjectionMatrix();
      l.position.copy(LX).multiplyScalar(b.u).addScaledVector(LY, b.v).addScaledVector(lightDir, depthMax + 1);
      l.target.position.copy(l.position).sub(lightDir);
      l.updateMatrixWorld(); l.target.updateMatrixWorld();
      // Biases in metres, as a fixed number of texels, so the fine box keeps contact shadows and the coarse ones show no
      // acne. The filter reaches about 2.7 texels (radius, bilinear tap, half a texel); on a surface at angle a to the
      // light that is 2.7 * texel * tan(a) of depth, and an offset n along the normal gives n / cos(a): n = 3 texels
      // covers every angle, the small constant part covers surfaces that face the light.
      l.shadow.bias = -(0.012 + 0.7 * texel) / (cam.far - cam.near);
      l.shadow.normalBias = 0.012 + 3.0 * texel;
      l.shadow.radius = i === 0 ? 1.7 : 1.2;
      l.shadow.needsUpdate = true;
    }
  }

  // ---- post-processing (loaded on demand)
  const wantPost = !plain && (opts.post === true || (opts.post === undefined && !low));
  let post = null, postState = wantPost ? 'loading' : 'off', postEnabled = true;      // postEnabled: switched at run time by setPost()
  if (wantPost) {
    import('./post.js').then(m => { post = m.createPost(renderer, { antialias: opts.antialias !== false, lowPower: low }); postState = post ? 'on' : 'unavailable'; })
      .catch(err => { postState = 'failed: ' + (err && err.message); });
  }

  function render(sc, camera) {
    const now = performance.now(), dt = Math.min((now - lastNow) / 1000 || 0.016, 0.1); lastNow = now; frame++;
    // a frame is several render calls here (sky capture, shadow maps, post passes): count them all in renderer.info
    renderer.info.autoReset = false; renderer.info.reset();
    if (frame === 1 || frame % 240 === 0) scan();
    sky.position.copy(camera.position);
    if (shadowsOn) updateBoxes(camera);
    else { sun.position.copy(lightDir).multiplyScalar(500); sun.target.position.set(0, 0, 0); }

    // under a roof?
    const p = viewer || camera.position;
    if (viewer && frame % 6 === 1) {
      roofNow = null;
      for (const r of roofs) if (p.x > r.w && p.x < r.e && p.z > r.n && p.z < r.s && p.y < r.height + 0.3 && !(p.y < r.bottom) && inside(r.pts, p.x, p.z)) { roofNow = r; break; }
      indoorTarget = roofNow ? 1 : 0;
    }
    indoor += (indoorTarget - indoor) * (1 - Math.exp(-dt * 3.5));
    if (viewer && indoor > 0.004) {
      const hall = roofNow && roofNow.hall;
      if (hall) tmpV.set(hall.x, hall.y, hall.z); else tmpV.set(p.x, p.y + (roofNow && roofNow.tall ? 2.0 : 1.25), p.z);
      if (fill.position.distanceToSquared(tmpV) > 200 || lampPower < 0.01) fill.position.copy(tmpV); else fill.position.lerp(tmpV, 1 - Math.exp(-dt * 5));
      const power = hall ? hall.power : roofNow && roofNow.tall ? 0.9 : 1;        // the library's own surfaces already glow
      lampPower += (power - lampPower) * (1 - Math.exp(-dt * 4));
      fill.distance = hall ? hall.reach : roofNow && roofNow.tall ? 44 : 34;
      fill.intensity = indoor * lampPower * (1.1 + 4.4 * (1 - day));
    } else { fill.intensity = 0; lampPower = 0; }
    // lit windows are seen from outside; from inside a lit room the panes are mostly dark
    windowGlow.value = night * 1.5 * (1 - 0.75 * indoor);
    renderer.toneMappingExposure = exposureTime * (1 + 0.12 * indoor * day);

    if (useEnv && (envDirty && now - envBuiltAt > (low ? 800 : 350) || !envTarget)) buildEnvironment(now);

    if (postEnabled && post && post.render(sc, camera, { night, day, exposure: renderer.toneMappingExposure })) return;
    renderer.render(sc, camera);
  }

  // After a lost graphics context the shadow maps and the sky capture are empty: draw them again.
  renderer.domElement.addEventListener('webglcontextrestored', () => { for (const b of boxes) b.dirty = true; envDirty = true; envBuiltAt = -1e9; });

  // The boxes follow the camera handed to render(); follow() remains for callers of the earlier interface.
  function follow() {}
  function moveFill(x, y, z) { (viewer || (viewer = new THREE.Vector3())).set(x, y, z); }
  function resize(w, h) { if (post) post.resize(w, h); }

  setTime(hours);
  const api = {
    sun, suns, hemi, sky, ambient, fill, setTime, follow, moveFill, render, resize, getTime: () => hours,
    /** 0 by day, 1 once it is dark enough for lamps (the same measure the lit windows follow). */
    night: () => night,
    /** Switch post-processing off or back on while running (the page does this when frames are slow). True if it was in use. */
    setPost: on => { const was = postEnabled && wantPost; postEnabled = !!on; return was; },
    info: () => ({ hours, elevationDeg: +elDeg.toFixed(1), cascades: N, cascadesPatched: cascadesOk, shadowRes: res, boxes: boxes.map(b => +b.r.toFixed(1)), scale, post: postEnabled ? postState : 'switched off', envBuilds, indoor: +indoor.toFixed(2),
      materials: { windows: [...seen].filter(m => m.userData.campusWindow).map(m => m.name || '(unnamed)'), lamps: lamps.map(l => l.m.name), unlit: unlit.length, all: seen.size } }),
  };
  if (typeof location !== 'undefined' && /[?&]lightdebug=1/.test(location.search)) globalThis.__lighting = Object.assign({ scene, renderer }, api);
  return api;
}
