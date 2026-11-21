// What the people look like: build, height, skin, hair, clothes and what they carry. ALL IMAGINED: the school's real
// uniform is not known to this project. Chosen to be believable for a large senior high school in Guangzhou on a warm
// teaching day and kept consistent: a white short-sleeved polo with a navy collar and navy trousers or a navy pleated
// skirt for lessons; a white sports shirt with royal-blue sleeves and blue track trousers or shorts for sport. There is
// no crest, badge, name or lettering on anything. Staff wear ordinary clothes: teachers, a guard in a pale-blue shirt
// and a peaked cap, a cleaner in a blue smock, a gardener in khaki with a sun hat.
import { SLOT, NSLOT, V, A, bit } from './body.js';
import { skeleton } from './rig.js';

export function rng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pickOf = (r, list) => list[Math.floor(r() * list.length) % list.length];
const gauss = r => (r() + r() + r() - 1.5) * 1.15;
const mixHex = (a, b, t) => { const c = k => Math.round(((a >> k) & 255) + (((b >> k) & 255) - ((a >> k) & 255)) * t); return (c(16) << 16) | (c(8) << 8) | c(0); };
const jitter = (r, hex, k = 0.06) => { const f = 1 + (r() - 0.5) * 2 * k; const c = s => Math.max(0, Math.min(255, Math.round(((hex >> s) & 255) * f))); return (c(16) << 16) | (c(8) << 8) | c(0); };

// skin of southern China: light to tanned, warm
const SKIN = [0xf0d2b8, 0xeac4a4, 0xe2b996, 0xd9ac88, 0xcf9f7a, 0xc4916b, 0xb7845f];
const HAIR = [0x141110, 0x18130f, 0x1d1712, 0x231a13, 0x2b2018];
const NAVY = 0x1e2a48, WHITE = 0xf3f3ef, ROYAL = 0x2852b0;
const BAGS = [0x1c1d21, 0x22283a, 0x3a3d44, 0x1f3a32, 0x5a2430, 0xd99aa8, 0x8fb5d9, 0xcdbb9a, 0x2f4f8a, 0x6c6f74, 0xe6e2da];
const UMBRELLAS = [0x2a2a2e, 0xd96a8a, 0x7fb3d5, 0xf0c3cf, 0x4b5f8a, 0xe8d06a, 0x9fd0b8, 0xc8b6e0];
const SHOES_STUDENT = [0xf0f0ec, 0xf0f0ec, 0xe9e9e4, 0x2a2b2f, 0x8a8f96, 0xf0f0ec];
export const HEIGHT = sex => 1.728 + (1.627 - 1.728) * sex;          // head-top height of the reference bodies (body.js)

function base(r, sex, height, girth, skinIdx) {
  const pal = new Float32Array(NSLOT), skin = jitter(r, SKIN[Math.max(0, Math.min(SKIN.length - 1, skinIdx))], 0.035), hair = pickOf(r, HAIR);
  pal[SLOT.skin] = skin; pal[SLOT.hair] = hair; pal[SLOT.eye] = 0x1a1310; pal[SLOT.lip] = mixHex(skin, sex ? 0xb4605c : 0xa0645a, sex ? 0.42 : 0.3);
  pal[SLOT.sole] = 0xe6e4de; pal[SLOT.sock] = 0xf2f2ee; pal[SLOT.extra] = 0x1b1b1e; pal[SLOT.trim] = NAVY;
  return { pal, sex, height, girth, scale: height / HEIGHT(sex), sk: skeleton(sex) };
}
function hairMask(r, sex, adult) {
  if (!sex) { const k = r(); return bit(V.hairBase) | bit(V.nape) | (k < 0.55 ? bit(V.fringe) : 0); }
  const k = r();
  if (adult) return bit(V.hairBase) | (k < 0.4 ? bit(V.curtain) | (r() < 0.5 ? bit(V.fringe) : 0) : k < 0.75 ? bit(V.bun) : bit(V.ponytail));
  return bit(V.hairBase) | (k < 0.62 ? bit(V.ponytail) | (r() < 0.45 ? bit(V.fringe) : 0) : bit(V.curtain) | (r() < 0.7 ? bit(V.fringe) : 0));
}

/**
 * A person's appearance. role: 'student' | 'sport' | 'teacher' | 'guard' | 'cleaner' | 'gardener'. seed: any integer.
 * Returns { pal, mask, carry, sex, height, scale, girth, sk, role, umbrella }.
 */
export function dress(role, seed, opts = {}) {
  const r = rng(seed * 7919 + 17), adult = role !== 'student' && role !== 'sport';
  const sex = opts.sex ?? (role === 'guard' || role === 'gardener' ? (r() < 0.9 ? 0 : 1) : role === 'cleaner' ? (r() < 0.25 ? 0 : 1) : r() < 0.5 ? 0 : 1);
  const height = Math.max(sex ? 1.5 : 1.6, Math.min(sex ? 1.74 : 1.88, (sex ? 1.605 : 1.725) + gauss(r) * (sex ? 0.05 : 0.06) - (role === 'cleaner' ? 0.04 : 0)));
  const girth = Math.max(0.92, Math.min(1.16, 1 + gauss(r) * 0.04 + (adult ? 0.035 + 0.04 * r() : 0) - (sex ? 0.015 : 0)));
  const p = base(r, sex, height, girth, Math.floor(r() * (adult && role !== 'teacher' ? 7 : 5.2)));
  let mask = hairMask(r, sex, adult), carry = 0;
  const pal = p.pal, glasses = r() < (adult ? 0.4 : 0.55);
  if (glasses) { mask |= bit(V.glasses); pal[SLOT.extra] = pickOf(r, [0x1b1b1e, 0x1b1b1e, 0x3a2a20, 0x8d8f93, 0x2b2f3a]); }
  const shortSleeves = (top, sleeve = top) => { pal[SLOT.shirt] = top; pal[SLOT.sleeve] = sleeve; pal[SLOT.upperArm] = pal[SLOT.foreArm] = pal[SLOT.skin]; mask |= bit(V.sleeve); };
  const longSleeves = top => { pal[SLOT.shirt] = pal[SLOT.sleeve] = pal[SLOT.upperArm] = pal[SLOT.foreArm] = top; };
  const trousers = col => { pal[SLOT.pants] = pal[SLOT.thighLow] = pal[SLOT.shin] = pal[SLOT.skirt] = col; mask |= bit(V.cuffs); };
  const shorts = col => { pal[SLOT.pants] = pal[SLOT.skirt] = col; pal[SLOT.thighLow] = pal[SLOT.shin] = pal[SLOT.skin]; mask |= bit(V.shortsHem); };
  const skirt = (col, legs = pal[SLOT.skin]) => { pal[SLOT.pants] = pal[SLOT.skirt] = col; pal[SLOT.thighLow] = pal[SLOT.shin] = legs; mask |= bit(V.skirt); };
  switch (role) {
    case 'student': {
      shortSleeves(jitter(r, WHITE, 0.015)); pal[SLOT.trim] = pal[SLOT.shirt]; mask |= bit(V.collar);
      if (sex && r() < 0.62) skirt(jitter(r, NAVY, 0.04)); else trousers(jitter(r, NAVY, 0.04));
      pal[SLOT.shoe] = pickOf(r, SHOES_STUDENT); pal[SLOT.sole] = pal[SLOT.shoe] === 0x2a2b2f ? 0xdedcd6 : 0xf4f3ef;
      if (r() < 0.78) { carry |= bit(A.backpack); pal[SLOT.bag] = pickOf(r, BAGS); pal[SLOT.bagTrim] = mixHex(pal[SLOT.bag], 0x101010, 0.35); }
      break;
    }
    case 'sport': {
      shortSleeves(jitter(r, WHITE, 0.015), ROYAL); pal[SLOT.trim] = ROYAL; mask |= bit(V.collar);
      if (r() < 0.55) trousers(jitter(r, 0x24479e, 0.05)); else shorts(jitter(r, 0x24479e, 0.05));
      pal[SLOT.shoe] = pickOf(r, [0xf0f0ec, 0x2a2b2f, 0xe8e8e2, 0x3a5fa8, 0xd8463a, 0x9aa0a6]); pal[SLOT.sole] = 0xf0efea;
      break;
    }
    case 'teacher': {
      const top = sex ? pickOf(r, [0xf2f0ea, 0xbfd3e6, 0xe9c7cf, 0xd8d0e8, 0x7d8a9a, 0xe8dcc0, 0x2f3a4a]) : pickOf(r, [0xf2f0ea, 0xc3d6e8, 0x9fb3c8, 0xe0e0dc, 0x5b6b7d, 0xd8d2c2]);
      if (r() < 0.55) shortSleeves(top); else longSleeves(top);
      pal[SLOT.trim] = top; mask |= bit(V.collar);
      const bottom = pickOf(r, [0x1c1d21, 0x2c2e33, 0x3b3f47, 0x8a7a5e, 0x23304a, 0x55585e]);
      if (sex && r() < 0.45) skirt(bottom, r() < 0.4 ? 0x3a302c : pal[SLOT.skin]); else trousers(bottom);
      pal[SLOT.shoe] = pickOf(r, [0x141414, 0x2a1d16, 0x3b2a20, 0x1c1c1c, 0xd8d6d0]); pal[SLOT.sole] = mixHex(pal[SLOT.shoe], 0x000000, 0.3);
      const k = r();
      if (k < 0.45) { carry |= bit(A.books); pal[SLOT.item] = pickOf(r, [0x2f5f9e, 0xb8322a, 0xe0b830, 0x3f8a4c, 0xe8e4da]); pal[SLOT.item2] = 0xf2efe6; }
      else if (k < 0.7) { carry |= bit(A.folder); pal[SLOT.item] = pickOf(r, [0x2a4f8a, 0x1c1d21, 0x8a2f2b, 0xd9d4c8]); }
      else if (k < 0.85) { carry |= bit(A.shoulderBag); pal[SLOT.bag] = pickOf(r, [0x2a1d16, 0x141414, 0x6a4a34, 0x3a3d44]); pal[SLOT.bagTrim] = mixHex(pal[SLOT.bag], 0, 0.2); }
      break;
    }
    case 'guard': {
      shortSleeves(0xa9c1dc); pal[SLOT.trim] = 0x9ab3d0; mask |= bit(V.collar) | bit(V.cap); trousers(0x1d2433);
      pal[SLOT.extra] = 0x1a1f2b; pal[SLOT.trim] = 0x13161d; pal[SLOT.shoe] = 0x121212; pal[SLOT.sole] = 0x1c1c1c; mask &= ~bit(V.glasses);
      break;
    }
    case 'cleaner': {
      longSleeves(jitter(r, 0x3f78b8, 0.05)); pal[SLOT.trim] = pal[SLOT.shirt]; trousers(pickOf(r, [0x2b2f38, 0x3a3f4a, 0x1d2433])); mask |= bit(V.collar);
      if (r() < 0.6) { mask |= bit(V.hat); mask &= ~(bit(V.ponytail) | bit(V.curtain) | bit(V.fringe)); pal[SLOT.extra] = 0xd6c08a; }
      pal[SLOT.shoe] = 0x2a2b2f; pal[SLOT.sole] = 0x3a3a3a; carry |= bit(A.broom); pal[SLOT.item] = 0x9a7b4f; pal[SLOT.item2] = 0xb59a62; mask &= ~bit(V.glasses);
      break;
    }
    case 'gardener': {
      longSleeves(jitter(r, 0x7d7650, 0.05)); pal[SLOT.trim] = pal[SLOT.shirt]; trousers(0x4a4a3a); mask |= bit(V.collar) | bit(V.hat);
      mask &= ~(bit(V.ponytail) | bit(V.curtain) | bit(V.fringe) | bit(V.glasses)); pal[SLOT.extra] = 0xd9c48c; pal[SLOT.shoe] = 0x3a2e24; pal[SLOT.sole] = 0x2a2a2a;
      carry |= bit(A.can); pal[SLOT.item] = 0x3f8a5a; pal[SLOT.item2] = 0x3f8a5a;
      break;
    }
  }
  // things in the hand for walkers (the caller decides whether they are shown): a bottle, a phone, an umbrella against the sun
  pal[SLOT.bottle] = pickOf(r, [0x9fc8e6, 0xe6eef2, 0xe9a0b4, 0x8fd0a8, 0xb9bec2, 0xf0c95a, 0x3a3d44]);
  if (!pal[SLOT.item2]) pal[SLOT.item2] = 0x2a2c30;
  pal[SLOT.umbrella] = pickOf(r, UMBRELLAS); pal[SLOT.belt] = 0xe6e0d8;          // 'belt' slot carries the whites of the eyes
  const extras = { bottle: r() < 0.22, phone: r() < 0.12, umbrella: r() < (sex ? 0.22 : 0.05) };
  return { ...p, mask, carry, role, extras, seed };
}
