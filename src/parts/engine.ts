import type { EngineSpec } from '../data/types';
import { MM } from '../units';

// Procedural engine layout. Works out where the block, heads, manifolds and
// bolt-on parts sit from an engine's real specs: how many cylinders, how they
// are arranged and the displacement. The scene code (scene/EngineBay.tsx)
// draws boxes and tubes at these positions.
//
// Engine space, in metres:
//   origin  the middle of the crankshaft
//   +Y      up, with the cylinders standing on top of the crank
//   Z       along the crank; the pulley end is at -Z, the gearbox end at +Z
//   X       across the engine; on an inline engine intake is -X, exhaust +X
//
// Like the wheels it is close, not millimetre-perfect: a square engine (bore
// equal to stroke) is assumed, and the head and cover heights are typical
// values rather than per-engine measurements.

export type V3 = [number, number, number];

/** One row of cylinders with its head and cam cover. */
export interface Bank {
  /** Lean from vertical, in radians. Positive leans the top toward -X. */
  tilt: number;
  /** Cylinders in this bank. */
  cylinders: number;
  /** Where the bank sits along the crank (V and flat banks are staggered). */
  z: number;
}

export interface EngineLayout {
  boreMm: number;
  /** Centre-to-centre distance between neighbouring cylinders. */
  spacing: number;
  /** Length of the block along the crank, timing cover included. */
  length: number;
  /** Crank centre to the top of the block. */
  deck: number;
  /** Width of one bank of cylinders across its bores. */
  bankWidth: number;
  /** Thickness of the cylinder head and of the cam cover on top of it. */
  head: number;
  cover: number;
  /** Bottom of the sump, below the crank (negative). */
  sumpY: number;
  /** Top of the crankcase, where V and flat banks meet. */
  crankcaseTop: number;
  crankcaseWidth: number;
  banks: Bank[];
  /** Intake plenum: a tube running along the crank. */
  plenum: { at: V3; radius: number; length: number };
  /** Where intake air enters the engine: the throttle body. */
  throttle: V3;
  /** Exhaust ports per bank, where the manifold runners start. */
  ports: Array<{ at: V3; out: V3 }>;
  /** Where a turbo can hang off the exhaust: one spot per turbo, up to two. */
  turboSpots: V3[];
  /** Where a twin-screw supercharger sits, on top of the intake. */
  blowerSpot: V3;
  /** Crank pulley centre, at the front of the accessory drive. */
  pulley: V3;
  /** Half the overall width and the overall top, for fitting the bay. */
  halfWidth: number;
  top: number;
}

const HEAD = 0.11;
const COVER = 0.05;

/** Bore of one cylinder for a square engine of this displacement. */
export function boreMm(spec: Pick<EngineSpec, 'displacementL' | 'cylinders'>): number {
  const perCylinderMm3 = (spec.displacementL * 1e6) / spec.cylinders; // 1 L = 1e6 mm³
  // Swept volume = π/4 · bore² · stroke, and stroke = bore.
  return Math.cbrt((4 * perCylinderMm3) / Math.PI);
}

export function engineLayout(spec: EngineSpec): EngineLayout {
  if (spec.layout === 'rotary') return rotaryLayout(spec);

  const bore = boreMm(spec);
  const b = bore * MM;
  const spacing = b * 1.18;
  const deck = b * 2.6;
  const bankWidth = b * 1.45 + 0.03;
  const banked = spec.layout !== 'inline';
  const perBank = banked ? Math.ceil(spec.cylinders / 2) : spec.cylinders;
  const length = perBank * spacing + 0.12 + (banked ? spacing / 2 : 0);

  const half = banked ? ((spec.layout === 'flat' ? 180 : spec.bankAngleDeg ?? 90) * Math.PI) / 360 : 0;
  // V and flat banks are offset along the crank by half a cylinder, because
  // facing connecting rods share a crank pin.
  const stagger = banked ? spacing / 4 : 0;
  const banks: Bank[] = banked
    ? [
        { tilt: half, cylinders: perBank, z: -stagger },
        { tilt: -half, cylinders: perBank, z: stagger },
      ]
    : [{ tilt: 0, cylinders: perBank, z: 0 }];

  // Point `d` metres up a bank's axis, `x` across it.
  const onBank = (tilt: number, d: number, x = 0): V3 => [
    -Math.sin(tilt) * d + Math.cos(tilt) * x,
    Math.cos(tilt) * d + Math.sin(tilt) * x,
    0,
  ];

  const crankcaseTop = banked ? b * 1.1 : deck;
  const crankcaseWidth = banked ? b * 2.3 : bankWidth;
  const sumpY = -(b * 1.2 + 0.08);
  const headMid = deck + HEAD / 2;
  const headTop = deck + HEAD + COVER;

  let plenum: EngineLayout['plenum'];
  let ports: EngineLayout['ports'];
  let turboSpots: V3[];
  let blowerSpot: V3;

  if (!banked) {
    // Intake on -X, exhaust on +X.
    const px = -(bankWidth / 2 + 0.11);
    plenum = { at: [px, deck + 0.02, 0], radius: 0.05, length: length * 0.8 };
    ports = [{ at: [bankWidth / 2, headMid, 0], out: [1, 0, 0] }];
    const tx = bankWidth / 2 + 0.2;
    turboSpots =
      spec.aspiration === 'twin-turbo'
        ? [
            [tx, deck * 0.6, -length / 4],
            [tx, deck * 0.6, length / 4],
          ]
        : [[tx, deck * 0.6, 0]];
    blowerSpot = [px + 0.06, deck + 0.17, 0];
  } else {
    // Intake in the middle (in the vee, or on top of a flat engine); exhaust
    // leaves the outer side of each head.
    const veeTop = spec.layout === 'flat' ? crankcaseTop + 0.09 : Math.cos(half) * headTop - 0.02;
    plenum = { at: [0, veeTop, 0], radius: spec.layout === 'flat' ? 0.06 : 0.07, length: length * 0.75 };
    ports = banks.map((bank) => {
      const [x, y] = onBank(bank.tilt, headMid, 0);
      // Out of the side of the head that faces away from the vee.
      const side = Math.sign(x) || 1;
      const out: V3 =
        spec.layout === 'flat' ? [0, -1, 0] : [side * Math.cos(half), -Math.sin(half) * 0.4, 0];
      const portAt: V3 = spec.layout === 'flat' ? [x, y - bankWidth / 2, bank.z] : [x + side * (bankWidth / 2) * Math.cos(half), y - (bankWidth / 2) * Math.sin(half), bank.z];
      return { at: portAt, out };
    });
    turboSpots = banks.map((bank) => {
      const [x] = onBank(bank.tilt, headMid, 0);
      const side = Math.sign(x) || 1;
      return spec.layout === 'flat'
        ? ([side * (deck * 0.8), sumpY + 0.05, length * 0.35] as V3)
        : ([side * (Math.abs(x) + bankWidth / 2 + 0.16), deck * 0.15, 0] as V3);
    });
    blowerSpot = [0, veeTop + 0.1, 0];
  }

  // Overall extents, for fitting the bay around the engine.
  const reach = banks.map((bank) => {
    const [x, y] = onBank(bank.tilt, headTop, 0);
    return { x: Math.abs(x) + (bankWidth / 2) * Math.cos(bank.tilt), y: y + (bankWidth / 2) * Math.abs(Math.sin(bank.tilt)) };
  });
  const halfWidth = Math.max(...reach.map((r) => r.x), ...turboSpots.map((t) => Math.abs(t[0]) + 0.08)) + 0.04;
  const top = Math.max(...reach.map((r) => r.y), plenum.at[1] + plenum.radius);

  return {
    boreMm: bore,
    spacing,
    length,
    deck,
    bankWidth,
    head: HEAD,
    cover: COVER,
    sumpY,
    crankcaseTop,
    crankcaseWidth,
    banks,
    plenum,
    throttle: [plenum.at[0], plenum.at[1], -plenum.length / 2 - 0.03],
    ports,
    turboSpots,
    blowerSpot,
    pulley: [0, 0, -length / 2 - 0.03],
    halfWidth,
    top,
  };
}

/**
 * A Wankel rotary has no cylinders: each rotor spins in its own housing, and
 * the housings stack along the crank (the eccentric shaft). Very short and
 * low for its power, which is why the RX-7 could put it behind the front axle.
 */
function rotaryLayout(spec: EngineSpec): EngineLayout {
  const rotors = spec.cylinders;
  const housing = 80 * MM; // thickness of one rotor housing, roughly a 13B's
  const length = rotors * housing + 0.16; // plus end plates and front cover
  const deck = 0.17;
  const bankWidth = 0.34;
  const plenumY = deck + 0.12;
  return {
    boreMm: 0,
    spacing: housing,
    length,
    deck,
    bankWidth,
    head: 0,
    cover: 0,
    sumpY: -0.2,
    crankcaseTop: deck,
    crankcaseWidth: bankWidth,
    banks: [],
    plenum: { at: [-0.04, plenumY, 0], radius: 0.075, length: length * 0.9 },
    throttle: [-0.04, plenumY, -length * 0.45 - 0.05],
    // Peripheral exhaust ports, low on the +X side of each housing.
    ports: [{ at: [bankWidth / 2, -0.02, 0], out: [1, 0, 0] }],
    turboSpots:
      spec.aspiration === 'twin-turbo'
        ? [
            [bankWidth / 2 + 0.16, 0.02, -0.1],
            [bankWidth / 2 + 0.16, 0.15, 0.1],
          ]
        : [[bankWidth / 2 + 0.16, 0.06, 0]],
    blowerSpot: [-0.04, plenumY + 0.14, 0],
    pulley: [0, 0, -length / 2 - 0.03],
    halfWidth: bankWidth / 2 + 0.28,
    top: plenumY + 0.075,
  };
}

/** Rotation about Y that turns engine space into car space. */
export function engineYaw(spec: EngineSpec): number {
  if (spec.mounting === 'transverse') {
    // Turn the crank across the car. +X (exhaust) ends up facing the nose
    // (-z) or the firewall (+z).
    return (spec.exhaustFacing ?? 'front') === 'front' ? Math.PI / 2 : -Math.PI / 2;
  }
  const gearbox = spec.gearbox ?? (spec.position === 'rear' ? 'front' : 'rear');
  // Engine +Z is the gearbox end; car +z is the tail.
  return gearbox === 'rear' ? 0 : Math.PI;
}

/** Engine-space point to car space, given where the crank centre sits. */
export function toCar(p: V3, center: V3, yaw: number): V3 {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [center[0] + p[0] * c + p[2] * s, center[1] + p[1], center[2] - p[0] * s + p[2] * c];
}
