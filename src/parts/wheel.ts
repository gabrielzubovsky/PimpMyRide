import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { INCH, MM } from '../units';
import { lathe, type ProfilePoint } from './lathe';

// Procedural wheel generator.
//
// A wheel is described by real-world specs (diameter and width in inches,
// offset in millimetres, bolt pattern) plus a design (how many spokes, what
// shape, how deep the lip). The generator turns that into meshes.
//
// Everything is built around the Y axis: Y is the axle, +Y is the outboard
// face you see from the side of the car, and y = 0 is the wheel centreline.
// Round parts (lip, barrel, hub) are lathed from 2D profiles. Spokes are bars
// swept along a path from the hub to the rim.

/** How the spokes are arranged. */
export type SpokeLayout =
  /** Single spokes running straight from hub to rim. */
  | { type: 'straight' }
  /** Pairs of spokes. The gap is the distance between the two spokes of a pair, at the hub and at the rim. */
  | { type: 'twin'; gapHubMm: number; gapRimMm: number }
  /**
   * Each spoke forks into a Y before it reaches the rim.
   * `splitAt` is where along the spoke it forks (0 = hub, 1 = rim).
   * `spread` is how far the two arms fan out, as a fraction of the angle
   * between neighbouring spokes (0.5 would make neighbouring arms touch).
   */
  | { type: 'split-y'; splitAt: number; spread: number };

export interface WheelDesign {
  /** Number of spokes, spoke pairs or Y spokes. */
  spokes: number;
  layout: SpokeLayout;
  /** Spoke width, measured around the wheel, at the hub and at the rim. */
  spokeWidthHubMm: number;
  spokeWidthRimMm: number;
  /** Spoke thickness, measured along the axle, at the hub and at the rim. */
  spokeDepthHubMm: number;
  spokeDepthRimMm: number;
  /**
   * Wanted lip depth: how far the spokes sit behind the outer edge of the rim.
   * A deep lip needs a low offset, so the real depth is limited by the space
   * left between the hub and the outer edge (see `WheelGeometry.lipDepthMm`).
   */
  lipDepthMm: number;
  /** Stepped lip, as on two- and three-piece wheels. */
  steppedLip: boolean;
  /** Number of assembly bolts around the face. 0 for one-piece wheels. */
  rivets: number;
  /**
   * Shapes how the spokes climb from the hub to the rim.
   * 1 is a straight line, above 1 curves inward for a concave face.
   */
  faceCurve: number;
  /** Diameter of the hub, the solid centre the spokes grow out of. */
  hubDiameterMm: number;
  capDiameterMm: number;
}

export interface WheelSpec {
  diameterIn: number;
  widthIn: number;
  /**
   * Offset (ET): distance from the wheel centreline to the face that bolts to
   * the car. Positive puts the mounting face toward the outside of the wheel,
   * which tucks the wheel further into the arch.
   */
  offsetMm: number;
  boltCount: number;
  /** Pitch circle diameter: the circle the wheel bolts sit on. */
  pcdMm: number;
  design: WheelDesign;
}

/** One geometry per material slot, so finishes can colour them separately. */
export interface WheelGeometry {
  /** Hub and spokes. */
  face: THREE.BufferGeometry;
  /** Outer lip. */
  lip: THREE.BufferGeometry;
  /** Inner barrel, seen through the spokes. */
  barrel: THREE.BufferGeometry;
  /** Wheel nuts and assembly bolts. */
  hardware: THREE.BufferGeometry;
  cap: THREE.BufferGeometry;
  /** Lip depth after fitting it into the space the offset allows. */
  lipDepthMm: number;
  /** How far the hub sits behind the outer end of the spokes. */
  concavityMm: number;
}

// Rim cross-section constants. These follow the standard "J" rim contour
// closely enough for a visual model.
const FLANGE_HEIGHT = 17.5 * MM; // how far the rim edge stands above the bead seat
const FLANGE_THICKNESS = 11 * MM;
const BARREL_WALL = 20 * MM; // bead seat radius to the inside surface of the barrel
const PAD_THICKNESS = 30 * MM; // metal between the mounting face and the hub front
const MIN_LIP = 12 * MM;

/** Radius of the inside of the barrel. Brakes have to fit within this. */
export function barrelInnerRadius(diameterIn: number): number {
  return (diameterIn * INCH) / 2 - BARREL_WALL;
}

export function buildWheel(spec: WheelSpec): WheelGeometry {
  const { design } = spec;
  const R = (spec.diameterIn * INCH) / 2; // bead seat radius
  const half = (spec.widthIn * INCH) / 2; // half the width between the flanges
  const tipR = R + FLANGE_HEIGHT;
  const rBarrel = R - BARREL_WALL;

  const yOut = half + FLANGE_THICKNESS; // outer edge of the wheel
  const yMount = spec.offsetMm * MM; // face that bolts to the car
  const yHub = Math.min(yMount + PAD_THICKNESS, yOut - MIN_LIP - 4 * MM); // front of the hub
  const room = yOut - yHub; // space between hub front and outer edge
  const lipDepth = THREE.MathUtils.clamp(design.lipDepthMm * MM, MIN_LIP, Math.max(MIN_LIP, room - 4 * MM));
  const yFace = yOut - lipDepth; // where the spokes meet the rim

  // --- Lip -----------------------------------------------------------------
  const stepped = design.steppedLip && lipDepth > 34 * MM;
  const lipProfile: ProfilePoint[] = [
    [tipR, yOut - FLANGE_THICKNESS],
    [tipR, yOut],
    [R + 3 * MM, yOut],
    [R - 3 * MM, yOut - 4 * MM],
  ];
  if (stepped) {
    const yStep = yOut - 14 * MM - (lipDepth - 14 * MM) * 0.5;
    lipProfile.push(
      [R - 9 * MM, yOut - 14 * MM],
      [R - 9 * MM, yStep + 2 * MM],
      [R - 11 * MM, yStep],
      [rBarrel, yStep],
      [rBarrel, yFace - 8 * MM],
    );
  } else {
    lipProfile.push([rBarrel, yOut - 14 * MM], [rBarrel, yFace - 8 * MM]);
  }
  const lip = lathe(lipProfile);

  // --- Barrel --------------------------------------------------------------
  const barrel = lathe([
    [rBarrel, yFace - 8 * MM],
    [rBarrel, -half + 30 * MM],
    [R - 8 * MM, -half + 6 * MM],
    [R - 4 * MM, -yOut],
    [tipR, -yOut],
    [tipR, -yOut + FLANGE_THICKNESS],
    [R, -half],
    [R, -half + 22 * MM],
    [R - 12 * MM, -half + 36 * MM],
    [R - 12 * MM, half - 36 * MM],
    [R, half - 22 * MM],
    [R, half],
  ]);

  // --- Face: hub, spokes, and the bolt ring on multi-piece wheels ------------
  const hubR = (design.hubDiameterMm * MM) / 2;
  const bevel = 4 * MM;
  const faceParts: THREE.BufferGeometry[] = [
    lathe([
      [0, yMount],
      [hubR, yMount],
      [hubR, yHub - bevel],
      [hubR - bevel, yHub],
      [0, yHub],
    ]),
  ];

  const ringWidth = 22 * MM;
  if (design.rivets > 0) {
    const rIn = rBarrel - ringWidth;
    faceParts.push(
      lathe([
        [rIn, yFace - 12 * MM],
        [rBarrel + 2 * MM, yFace - 12 * MM],
        [rBarrel + 2 * MM, yFace],
        [rIn + 3 * MM, yFace],
        [rIn, yFace - 3 * MM],
        [rIn, yFace - 12 * MM],
      ]),
    );
  }

  const spokeStart = hubR - 14 * MM;
  const spokeEnd = rBarrel + 4 * MM;
  const pitch = (Math.PI * 2) / design.spokes;
  const STEPS = 18;

  /** Samples one spoke bar. `at` maps progress t (0 hub, 1 rim) to a point in the wheel plane. */
  const bar = (
    at: (t: number, r: number) => { x: number; z: number },
    widthScale = 1,
    from = 0,
    to = 1,
  ) => {
    const path: BarPoint[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = from + ((to - from) * i) / STEPS;
      const r = THREE.MathUtils.lerp(spokeStart, spokeEnd, t);
      const { x, z } = at(t, r);
      path.push({
        x,
        z,
        y: yHub + (yFace - yHub) * Math.pow(t, design.faceCurve),
        width: THREE.MathUtils.lerp(design.spokeWidthHubMm, design.spokeWidthRimMm, t) * MM * widthScale,
        depth: THREE.MathUtils.lerp(design.spokeDepthHubMm, design.spokeDepthRimMm, t) * MM,
      });
    }
    return sweepBar(path);
  };

  for (let k = 0; k < design.spokes; k++) {
    const theta = k * pitch;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const layout = design.layout;

    if (layout.type === 'straight') {
      faceParts.push(bar((_, r) => ({ x: r * cos, z: r * sin })));
    } else if (layout.type === 'twin') {
      for (const side of [-1, 1]) {
        faceParts.push(
          bar((t, r) => {
            // Shift sideways, at right angles to the spoke direction.
            const shift = (side * THREE.MathUtils.lerp(layout.gapHubMm, layout.gapRimMm, t) * MM) / 2;
            return { x: r * cos - shift * sin, z: r * sin + shift * cos };
          }),
        );
      }
    } else {
      // Stem, then two arms that fan out toward the rim.
      faceParts.push(bar((_, r) => ({ x: r * cos, z: r * sin }), 1, 0, layout.splitAt + 0.04));
      for (const side of [-1, 1]) {
        faceParts.push(
          bar(
            (t, r) => {
              const u = (t - layout.splitAt) / (1 - layout.splitAt);
              const a = theta + side * layout.spread * pitch * u;
              return { x: r * Math.cos(a), z: r * Math.sin(a) };
            },
            0.82,
            layout.splitAt,
            1,
          ),
        );
      }
    }
  }
  const face = merge(faceParts);

  // --- Hardware: wheel nuts and assembly bolts ---------------------------------
  const hardwareParts: THREE.BufferGeometry[] = [];
  // Put the nuts between spokes when the counts line up, as real wheels do.
  const nutPhase = design.spokes % spec.boltCount === 0 ? pitch / 2 : 0;
  for (let i = 0; i < spec.boltCount; i++) {
    const a = nutPhase + (i * Math.PI * 2) / spec.boltCount;
    const r = (spec.pcdMm * MM) / 2;
    const nut = new THREE.CylinderGeometry(9.5 * MM, 10.5 * MM, 16 * MM, 6);
    nut.translate(r * Math.cos(a), yHub + 4 * MM, r * Math.sin(a));
    hardwareParts.push(nut);
  }
  for (let i = 0; i < design.rivets; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / design.rivets;
    const r = rBarrel - ringWidth / 2;
    const rivet = new THREE.CylinderGeometry(2.6 * MM, 3.6 * MM, 3 * MM, 10);
    rivet.translate(r * Math.cos(a), yFace + 1.5 * MM, r * Math.sin(a));
    hardwareParts.push(rivet);
  }
  const hardware = merge(hardwareParts);

  // --- Centre cap ------------------------------------------------------------
  const capR = (design.capDiameterMm * MM) / 2;
  const cap = lathe(
    [
      [capR, yHub - 1 * MM],
      [capR, yHub + 5 * MM],
      [capR - 4 * MM, yHub + 8 * MM],
      [0, yHub + 8 * MM],
    ],
    { segments: 48 },
  );

  return {
    face,
    lip,
    barrel,
    hardware,
    cap,
    lipDepthMm: lipDepth / MM,
    concavityMm: (yFace - yHub) / MM,
  };
}

export function disposeWheel(wheel: WheelGeometry) {
  wheel.face.dispose();
  wheel.lip.dispose();
  wheel.barrel.dispose();
  wheel.hardware.dispose();
  wheel.cap.dispose();
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts);
  if (!merged) throw new Error('Could not merge wheel geometry');
  for (const part of parts) part.dispose();
  return merged;
}

interface BarPoint {
  /** Position in the wheel plane. */
  x: number;
  z: number;
  /** Height of the front face of the bar. */
  y: number;
  width: number;
  depth: number;
}

/**
 * Sweeps a chamfered rectangular cross-section along a path to make a spoke.
 * The path lies in the wheel plane (XZ); the front face of the bar sits at each
 * point's y and the bar extends `depth` behind it. The two ends are left open
 * because they are buried in the hub and the barrel.
 */
function sweepBar(path: BarPoint[]): THREE.BufferGeometry {
  const n = path.length;
  const positions: number[] = [];
  const indices: number[] = [];

  // Sideways direction at each point: perpendicular to the path, in the wheel plane.
  const side = path.map((_, i) => {
    const a = path[Math.max(i - 1, 0)];
    const b = path[Math.min(i + 1, n - 1)];
    const tx = b.x - a.x;
    const tz = b.z - a.z;
    const len = Math.hypot(tx, tz) || 1;
    return { x: -tz / len, z: tx / len };
  });

  // Cross-section corners as [sideways, down from the front face], clockwise.
  const section = (p: BarPoint): Array<[number, number]> => {
    const w = p.width / 2;
    const c = Math.min(w * 0.55, p.depth * 0.4);
    return [
      [-w, -p.depth],
      [-w, -c],
      [-w + c, 0],
      [w - c, 0],
      [w, -c],
      [w, -p.depth],
    ];
  };
  const sections = path.map(section);
  const corners = sections[0].length;

  // Each side of the cross-section gets its own strip of vertices. Strips do not
  // share vertices with their neighbours, so the edges between them stay sharp
  // while the surface stays smooth along the length of the spoke.
  for (let j = 0; j < corners; j++) {
    const base = positions.length / 3;
    for (let i = 0; i < n; i++) {
      for (const corner of [j, (j + 1) % corners]) {
        const [a, b] = sections[i][corner];
        positions.push(path[i].x + a * side[i].x, path[i].y + b, path[i].z + a * side[i].z);
      }
    }
    for (let i = 0; i < n - 1; i++) {
      const a0 = base + i * 2;
      const b0 = a0 + 1;
      const a1 = a0 + 2;
      const b1 = a0 + 3;
      indices.push(a0, b0, a1, b0, b1, a1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
