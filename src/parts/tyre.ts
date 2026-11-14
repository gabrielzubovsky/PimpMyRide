import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { INCH, MM } from '../units';
import { lathe, smoothProfile, type ProfilePoint } from './lathe';

// Procedural tyre generator, built from the size printed on a real sidewall.
// "235/35 R20" means: 235 mm wide, sidewall height 35% of the width, for a
// 20 inch rim. Same axis convention as the wheel: Y is the axle.

export interface TyreSpec {
  /** Section width, the first number on the sidewall. */
  widthMm: number;
  /** Aspect ratio, the second number: sidewall height as a percentage of width. */
  aspect: number;
  rimDiameterIn: number;
  /** Width of the rim the tyre is mounted on. A wider rim stretches the tyre. */
  rimWidthIn: number;
}

/** Radius from the axle to the tread, in metres. */
export function tyreOuterRadius(spec: Pick<TyreSpec, 'widthMm' | 'aspect' | 'rimDiameterIn'>): number {
  return (spec.rimDiameterIn * INCH) / 2 + (spec.widthMm * MM * spec.aspect) / 100;
}

const FLANGE_HEIGHT = 17.5 * MM;
const FLANGE_THICKNESS = 11 * MM;

export function buildTyre(spec: TyreSpec): THREE.BufferGeometry {
  const R = (spec.rimDiameterIn * INCH) / 2;
  const sectionWidth = spec.widthMm * MM;
  const halfWidth = sectionWidth / 2;
  const height = (sectionWidth * spec.aspect) / 100; // sidewall height
  const outerR = R + height;
  const rimEdge = (spec.rimWidthIn * INCH) / 2 + FLANGE_THICKNESS;
  const tipR = R + FLANGE_HEIGHT;

  const treadHalf = sectionWidth * 0.42;
  const crown = 3.5 * MM; // the tread is slightly domed

  // Outboard sidewall, from the edge of the tread down to the rim.
  const sidewall: ProfilePoint[] = smoothProfile(
    [
      [outerR - crown, treadHalf],
      [outerR - height * 0.16, halfWidth * 0.965],
      [R + height * 0.52, halfWidth],
      [tipR + (height - FLANGE_HEIGHT) * 0.18, THREE.MathUtils.lerp(rimEdge, halfWidth, 0.45)],
      [tipR + 4 * MM, rimEdge + 2 * MM],
      [tipR + 0.5 * MM, rimEdge - 5 * MM],
    ],
    28,
  );
  const outboard = lathe(sidewall, { smooth: true });
  const inboard = lathe(
    sidewall.map(([r, y]) => [r, -y] as const).reverse(),
    { smooth: true },
  );

  // Tread, with four grooves running around the tyre.
  const grooveWidth = sectionWidth * 0.035;
  const grooveDepth = 6 * MM;
  const grooves = [-0.24, -0.075, 0.075, 0.24].map((f) => f * sectionWidth);
  const treadR = (y: number) => outerR - crown * (y / treadHalf) ** 2;

  const tread: ProfilePoint[] = [[treadR(-treadHalf), -treadHalf]];
  for (const y of grooves) {
    const a = y - grooveWidth / 2;
    const b = y + grooveWidth / 2;
    tread.push(
      [treadR(a), a],
      [treadR(a) - grooveDepth, a + 1 * MM],
      [treadR(b) - grooveDepth, b - 1 * MM],
      [treadR(b), b],
    );
  }
  tread.push([treadR(treadHalf), treadHalf]);

  const parts = [inboard, lathe(tread), outboard];
  const merged = mergeGeometries(parts);
  if (!merged) throw new Error('Could not merge tyre geometry');
  for (const part of parts) part.dispose();
  return merged;
}
