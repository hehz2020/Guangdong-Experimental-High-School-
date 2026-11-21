// Draws the people: every frame the simulation hands over the people in view with a level of detail, a pose and a
// palette, and this module turns them into a handful of draw calls.
//
// Normal mode: one InstancedMesh per level of detail (near, middle, far) plus one for carried things, all sharing a
// float texture with one row per drawn person: 18 skin matrices (3 texels each) and 24 packed colours (6 texels). The
// shader (MeshStandardMaterial patched in onBeforeCompile) blends the two reference bodies, skins every vertex with two
// bones, hides variants the person does not wear and colours each slot. Lighting, fog and the shadows the people receive
// are three.js's own; the people cast no shadow (the shadow maps are redrawn only now and then, so a moving shadow would
// freeze) and get a soft contact shadow instead (people.js).
// Safe mode (?safe=1, stock shaders only): the nearest people are stock SkinnedMeshes (one draw call each, colours in a
// vertex colour per person), the others one merged mesh skinned on the CPU at the far level of detail.
import * as THREE from 'three';
import { NB } from './rig.js';
import { bodyGeometry, carriedGeometry, NSLOT, ROUGH } from './body.js';

export const ROW = 64;                         // texels per row: 18 bones x 3, then 6 texels of colours
const COL0 = NB * 3;
const BONE_FLOATS = NB * 12;

const VERT_HEAD = /* glsl */`
uniform highp sampler2D uLifeTex;
attribute vec3 aPosF;
attribute vec3 aNorF;
attribute vec4 aSkin;
attribute float aVar;
attribute vec4 aInfo;
varying float vLifeRough;
const float LIFE_ROUGH[ ${NSLOT} ] = float[ ${NSLOT} ]( ${ROUGH.map(r => r.toFixed(3)).join(', ')} );
mat4 lifeBone( int row, int b ) {
	vec4 a = texelFetch( uLifeTex, ivec2( b * 3, row ), 0 );
	vec4 c = texelFetch( uLifeTex, ivec2( b * 3 + 1, row ), 0 );
	vec4 d = texelFetch( uLifeTex, ivec2( b * 3 + 2, row ), 0 );
	return mat4( a.x, c.x, d.x, 0.0, a.y, c.y, d.y, 0.0, a.z, c.z, d.z, 0.0, a.w, c.w, d.w, 1.0 );
}
vec3 lifeColour( int row, int slot ) {
	vec4 t = texelFetch( uLifeTex, ivec2( ${COL0} + slot / 4, row ), 0 );
	int k = slot - ( slot / 4 ) * 4;
	float v = k == 0 ? t.x : ( k == 1 ? t.y : ( k == 2 ? t.z : t.w ) );
	vec3 c = vec3( floor( v / 65536.0 ), mod( floor( v / 256.0 ), 256.0 ), mod( v, 256.0 ) ) / 255.0;
	return pow( c, vec3( 2.2 ) );
}
`;
const VERT_SKIN = /* glsl */`
	int lifeRow = int( aInfo.x + 0.5 );
	float lifeSex = aInfo.y;
	int lifeMask = int( aInfo.z + 0.5 );
	int lifeVar = int( aVar + 0.5 );
	bool lifeOn = lifeVar == 0 || ( ( lifeMask >> ( lifeVar - 1 ) ) & 1 ) == 1;
	mat4 lifeM = lifeBone( lifeRow, int( aSkin.x + 0.5 ) ) * ( 1.0 - aSkin.z ) + lifeBone( lifeRow, int( aSkin.y + 0.5 ) ) * aSkin.z;
	int lifeSlot = int( aSkin.w + 0.5 );
	vColor.rgb *= lifeColour( lifeRow, lifeSlot );
	vLifeRough = LIFE_ROUGH[ lifeSlot ];
`;

function peopleMaterial(tex, name) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0, envMapIntensity: 0.85 });
  m.name = name; m.userData.noGrain = true;
  // The occlusion pass of post.js redraws the scene with a material of its own, which knows nothing of the skinning
  // here: it saw everyone in the rest pose and left a grey ghost beside each moving person. It leaves out cut-out
  // materials, so these are marked as such (nothing is ever cut: every alpha is 1).
  m.alphaTest = 0.01;
  m.onBeforeCompile = sh => {
    sh.uniforms.uLifeTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERT_HEAD)
      .replace('#include <color_vertex>', '#include <color_vertex>\n' + VERT_SKIN)
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = normalize( mat3( lifeM ) * mix( normal, aNorF, lifeSex ) );\n#ifdef USE_TANGENT\n\tvec3 objectTangent = vec3( tangent.xyz );\n#endif')
      .replace('#include <begin_vertex>', 'vec3 transformed = lifeOn ? ( lifeM * vec4( mix( position, aPosF, lifeSex ), 1.0 ) ).xyz : vec3( 0.0, -40.0, 0.0 );');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLifeRough;')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vLifeRough;');
  };
  m.customProgramCacheKey = () => 'life-people-skin';
  return m;
}

/** Root transform of a person into a column-major 4x4 at a[o]: position, heading (radians, 0 = facing +z), height scale, girth. */
export function rootMatrix(a, o, x, y, z, yaw, s, g) {
  const c = Math.cos(yaw), n = Math.sin(yaw), w = s * g;
  a[o] = c * w; a[o + 1] = 0; a[o + 2] = -n * w; a[o + 3] = 0;
  a[o + 4] = 0; a[o + 5] = s; a[o + 6] = 0; a[o + 7] = 0;
  a[o + 8] = n * w; a[o + 9] = 0; a[o + 10] = c * w; a[o + 11] = 0;
  a[o + 12] = x; a[o + 13] = y; a[o + 14] = z; a[o + 15] = 1;
}
const linear = v => Math.pow(v / 255, 2.2);

/**
 * caps: [near, middle, far] most people drawn at each level. Returns { group, begin(), draw(p, lod), end(), stats }.
 * p: { id, x, y, z, yaw, scale, girth, sex, mats (skin matrices from rig.fk, NB * 12 floats), pal (Float32Array NSLOT of packed
 * 0xRRGGBB), mask, carry }.
 */
export function createCrowd({ safe = false, caps = [16, 70, 220] } = {}) {
  return safe ? safeCrowd(caps) : shaderCrowd(caps);
}

function shaderCrowd(caps) {
  const rows = caps[0] + caps[1] + caps[2];
  const data = new Float32Array(ROW * rows * 4);
  const tex = new THREE.DataTexture(data, ROW, rows, THREE.RGBAFormat, THREE.FloatType);
  tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
  const group = new THREE.Group(); group.name = 'people';
  const meshes = [];
  const make = (geo, n, name) => {
    const im = new THREE.InstancedMesh(geo, peopleMaterial(tex, 'life-' + name), n);
    im.geometry = geo.clone();                                                   // own instanced attribute per mesh
    im.geometry.setAttribute('aInfo', new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4));
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.geometry.attributes.aInfo.setUsage(THREE.DynamicDrawUsage);
    im.count = 0; im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true; im.name = 'people-' + name;
    group.add(im); meshes.push(im); return im;
  };
  const lods = [make(bodyGeometry(0), caps[0], 'near'), make(bodyGeometry(1), caps[1], 'middle'), make(bodyGeometry(2), caps[2], 'far')];
  const carry = make(carriedGeometry(), caps[0], 'carried');
  let row = 0;
  const counts = [0, 0, 0];
  const stats = { drawn: [0, 0, 0], carried: 0, rows: 0 };
  function begin() { row = 0; counts[0] = counts[1] = counts[2] = 0; carry.count = 0; }
  function draw(p, lod) {
    if (counts[lod] >= caps[lod] || row >= rows) return false;
    const r = row++, base = r * ROW * 4;
    data.set(p.mats, base);
    data.set(p.pal, base + COL0 * 4);
    const im = lods[lod], i = counts[lod]++;
    rootMatrix(im.instanceMatrix.array, i * 16, p.x, p.y, p.z, p.yaw, p.scale, p.girth);
    const info = im.geometry.attributes.aInfo.array; info[i * 4] = r; info[i * 4 + 1] = p.sex; info[i * 4 + 2] = p.mask; info[i * 4 + 3] = 0;
    if (lod === 0 && p.carry) {
      const c = carry.count++; carry.instanceMatrix.array.set(im.instanceMatrix.array.subarray(i * 16, i * 16 + 16), c * 16);
      const ci = carry.geometry.attributes.aInfo.array; ci[c * 4] = r; ci[c * 4 + 1] = p.sex; ci[c * 4 + 2] = p.carry; ci[c * 4 + 3] = 0;
    }
    return true;
  }
  function end() {
    for (let k = 0; k < 3; k++) { lods[k].count = counts[k]; stats.drawn[k] = counts[k]; }
    stats.carried = carry.count; stats.rows = row;
    for (const im of meshes) { if (!im.count) continue; im.instanceMatrix.needsUpdate = true; im.geometry.attributes.aInfo.needsUpdate = true; }
    if (row) tex.needsUpdate = true;
  }
  return { group, begin, draw, end, stats, mode: 'shader' };
}

// ---- safe mode: stock materials only ------------------------------------------------------------------------------------
function safeCrowd(caps) {
  const group = new THREE.Group(); group.name = 'people';
  const near = Math.min(caps[0], 14), far = Math.min(caps[1] + caps[2], 90);
  const g0 = bodyGeometry(0), g2 = bodyGeometry(2), gc = carriedGeometry();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, metalness: 0 }); mat.name = 'life-people-safe';
  const mats = new Float32Array(NB * 12);
  // one stock skinned mesh per near person; its arrays are rebuilt when another person takes the slot
  const slots = [];
  const skinAttrs = geo => {
    const s = geo.attributes.aSkin.array, n = geo.attributes.position.count, idx = new Uint16Array(n * 4), w = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { idx[i * 4] = s[i * 4]; idx[i * 4 + 1] = s[i * 4 + 1]; w[i * 4] = 1 - s[i * 4 + 2]; w[i * 4 + 1] = s[i * 4 + 2]; }
    return [new THREE.Uint16BufferAttribute(idx, 4), new THREE.Float32BufferAttribute(w, 4)];
  };
  const [si0, sw0] = skinAttrs(g0), [sic, swc] = skinAttrs(gc);
  const makeSlot = (src, si, sw) => {
    const n = src.attributes.position.count, geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('skinIndex', si); geo.setAttribute('skinWeight', sw);
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(src.index.count), 1));
    const bones = Array.from({ length: NB }, () => new THREE.Bone());
    const skel = new THREE.Skeleton(bones, bones.map(() => new THREE.Matrix4()));
    const mesh = new THREE.SkinnedMesh(geo, mat); mesh.bindMode = THREE.DetachedBindMode; mesh.bind(skel, new THREE.Matrix4());
    mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; mesh.visible = false;
    const own = new Float32Array(NB * 12);
    skel.update = () => { const bm = skel.boneMatrices, mats = own; for (let b = 0; b < NB; b++) { const q = b * 12, o = b * 16;
      bm[o] = mats[q]; bm[o + 1] = mats[q + 4]; bm[o + 2] = mats[q + 8]; bm[o + 3] = 0; bm[o + 4] = mats[q + 1]; bm[o + 5] = mats[q + 5]; bm[o + 6] = mats[q + 9]; bm[o + 7] = 0;
      bm[o + 8] = mats[q + 2]; bm[o + 9] = mats[q + 6]; bm[o + 10] = mats[q + 10]; bm[o + 11] = 0; bm[o + 12] = mats[q + 3]; bm[o + 13] = mats[q + 7]; bm[o + 14] = mats[q + 11]; bm[o + 15] = 1; }
      if (skel.boneTexture) skel.boneTexture.needsUpdate = true; };
    group.add(mesh); return { mesh, skel, src, key: '', bm: own };
  };
  for (let i = 0; i < near; i++) slots.push(makeSlot(g0, si0, sw0));
  const carrySlots = []; for (let i = 0; i < 4; i++) carrySlots.push(makeSlot(gc, sic, swc));
  /** Fill a slot's arrays for one person (body shape, colours, variants). */
  function dress(slot, p, mask) {
    const src = slot.src, n = src.attributes.position.count, P = src.attributes.position.array, F = src.attributes.aPosF.array, N = src.attributes.normal.array, NF = src.attributes.aNorF.array;
    const g = slot.mesh.geometry, pos = g.attributes.position.array, nor = g.attributes.normal.array, col = g.attributes.color.array, ao = src.attributes.color.array, sk = src.attributes.aSkin.array, vr = src.attributes.aVar.array, s = p.sex;
    for (let i = 0; i < n * 3; i++) { pos[i] = P[i] + (F[i] - P[i]) * s; nor[i] = N[i] + (NF[i] - N[i]) * s; }
    for (let i = 0; i < n; i++) { const c = p.pal[sk[i * 4 + 3]] | 0, a = ao[i * 3]; col[i * 3] = linear(c >> 16 & 255) * a; col[i * 3 + 1] = linear(c >> 8 & 255) * a; col[i * 3 + 2] = linear(c & 255) * a; }
    const idx = g.index.array, sIdx = src.index.array; let m = 0;
    for (let i = 0; i < sIdx.length; i += 3) { const v = vr[sIdx[i]]; if (v && !((mask >> (v - 1)) & 1)) continue; idx[m++] = sIdx[i]; idx[m++] = sIdx[i + 1]; idx[m++] = sIdx[i + 2]; }
    g.setDrawRange(0, m);
    for (const k of ['position', 'normal', 'color']) g.attributes[k].needsUpdate = true; g.index.needsUpdate = true;
  }
  // the others: one merged mesh at the far level of detail, skinned here (positions only; normals turn with the person)
  const nv = g2.attributes.position.count, ni = g2.index.count;
  const fgeo = new THREE.BufferGeometry(), fpos = new Float32Array(far * nv * 3), fnor = new Float32Array(far * nv * 3), fcol = new Float32Array(far * nv * 3), fidx = new Uint32Array(far * ni);
  for (let k = 0; k < far; k++) for (let i = 0; i < ni; i++) fidx[k * ni + i] = g2.index.array[i] + k * nv;
  fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3).setUsage(THREE.DynamicDrawUsage)); fgeo.setAttribute('normal', new THREE.BufferAttribute(fnor, 3).setUsage(THREE.DynamicDrawUsage));
  fgeo.setAttribute('color', new THREE.BufferAttribute(fcol, 3).setUsage(THREE.DynamicDrawUsage)); fgeo.setIndex(new THREE.BufferAttribute(fidx, 1));
  const fmesh = new THREE.Mesh(fgeo, mat); fmesh.frustumCulled = false; fmesh.receiveShadow = true; fmesh.name = 'people-far-cpu'; group.add(fmesh);
  const P2 = g2.attributes.position.array, F2 = g2.attributes.aPosF.array, N2 = g2.attributes.normal.array, S2 = g2.attributes.aSkin.array, V2 = g2.attributes.aVar.array, A2 = g2.attributes.color.array;
  let used = 0, nearUsed = 0, carryUsed = 0;
  const stats = { drawn: [0, 0, 0], carried: 0, rows: 0 };
  function begin() { used = 0; nearUsed = 0; carryUsed = 0; }
  function draw(p, lod) {
    if (lod === 0 && nearUsed < near) {
      const slot = slots[nearUsed++], key = p.id + ':' + p.mask;
      if (slot.key !== key) { dress(slot, p, p.mask); slot.key = key; }
      slot.bm.set(p.mats); slot.skel.update();
      rootMatrix(slot.mesh.matrix.elements, 0, p.x, p.y, p.z, p.yaw, p.scale, p.girth); slot.mesh.matrixWorldNeedsUpdate = true; slot.mesh.visible = true;
      if (p.carry && carryUsed < carrySlots.length) { const cs = carrySlots[carryUsed++], ck = p.id + ':' + p.carry; if (cs.key !== ck) { dress(cs, p, p.carry); cs.key = ck; }
        cs.bm.set(slot.bm); cs.skel.update(); cs.mesh.matrix.copy(slot.mesh.matrix); cs.mesh.matrixWorldNeedsUpdate = true; cs.mesh.visible = true; }
      return true;
    }
    if (used >= far) return false;
    mats.set(p.mats);
    const k = used++, o = k * nv * 3, c = Math.cos(p.yaw), n = Math.sin(p.yaw), s = p.scale, w = s * p.girth, sx = p.sex;
    for (let i = 0; i < nv; i++) {
      const v = V2[i], on = !v || ((p.mask >> (v - 1)) & 1), j = i * 3, q = o + j;
      if (!on) { fpos[q] = p.x; fpos[q + 1] = -40; fpos[q + 2] = p.z; continue; }
      const x0 = P2[j] + (F2[j] - P2[j]) * sx, y0 = P2[j + 1] + (F2[j + 1] - P2[j + 1]) * sx, z0 = P2[j + 2] + (F2[j + 2] - P2[j + 2]) * sx;
      const b0 = S2[i * 4] * 12, b1 = S2[i * 4 + 1] * 12, t = S2[i * 4 + 2];
      let lx = 0, ly = 0, lz = 0;
      for (const [b, wt] of [[b0, 1 - t], [b1, t]]) { if (!wt) continue;
        lx += wt * (mats[b] * x0 + mats[b + 1] * y0 + mats[b + 2] * z0 + mats[b + 3]); ly += wt * (mats[b + 4] * x0 + mats[b + 5] * y0 + mats[b + 6] * z0 + mats[b + 7]); lz += wt * (mats[b + 8] * x0 + mats[b + 9] * y0 + mats[b + 10] * z0 + mats[b + 11]); }
      fpos[q] = p.x + (c * lx + n * lz) * w; fpos[q + 1] = p.y + ly * s; fpos[q + 2] = p.z + (-n * lx + c * lz) * w;
      fnor[q] = c * N2[j] + n * N2[j + 2]; fnor[q + 1] = N2[j + 1]; fnor[q + 2] = -n * N2[j] + c * N2[j + 2];
      const col = p.pal[S2[i * 4 + 3]] | 0, a = A2[j]; fcol[q] = linear(col >> 16 & 255) * a; fcol[q + 1] = linear(col >> 8 & 255) * a; fcol[q + 2] = linear(col & 255) * a;
    }
    return true;
  }
  function end() {
    for (let i = nearUsed; i < slots.length; i++) slots[i].mesh.visible = false;
    for (let i = carryUsed; i < carrySlots.length; i++) carrySlots[i].mesh.visible = false;
    fgeo.setDrawRange(0, used * ni);
    if (used) { fgeo.attributes.position.needsUpdate = true; fgeo.attributes.normal.needsUpdate = true; fgeo.attributes.color.needsUpdate = true; }
    fmesh.visible = used > 0;
    stats.drawn[0] = nearUsed; stats.drawn[1] = 0; stats.drawn[2] = used; stats.carried = carryUsed;
  }
  return { group, begin, draw, end, stats, mode: 'safe' };
}
