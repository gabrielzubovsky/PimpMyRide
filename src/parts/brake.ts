import * as THREE from 'three';
import { MM } from '../units';
import { lathe } from './lathe';

// Procedural brake generator: a disc, the hat that bolts it to the hub, and a
// caliper. Same axis convention as the wheel: Y is the axle, +Y is outboard,
// and y = 0 is the middle of the disc.

export interface BrakeSpec {
  discDiameterMm: number;
  discThicknessMm: number;
  /** Pistons in the caliper. More pistons means a longer caliper. */
  pistons: number;
  /** Distance from the middle of the disc out to the hub's mounting face. */
  hubFaceOffsetMm: number;
}

export interface BrakeGeometry {
  disc: THREE.BufferGeometry;
  hat: THREE.BufferGeometry;
  /** Centred on the +X direction. Rotate around Y to clock it on the disc. */
  caliper: THREE.BufferGeometry;
}

const PAD_HEIGHT = 62 * MM; // radial height of the friction surface
const CALIPER_OVERHANG = 20 * MM; // how far the caliper wraps past the disc edge

/** Radius the caliper reaches out to. The wheel barrel has to clear this. */
export function brakeOuterRadius(spec: Pick<BrakeSpec, 'discDiameterMm'>): number {
  return (spec.discDiameterMm * MM) / 2 + CALIPER_OVERHANG;
}

export function buildBrake(spec: BrakeSpec): BrakeGeometry {
  const rOut = (spec.discDiameterMm * MM) / 2;
  const rIn = rOut - PAD_HEIGHT;
  const t = (spec.discThicknessMm * MM) / 2;

  const disc = lathe([
    [rIn, -t],
    [rOut, -t],
    [rOut, t],
    [rIn, t],
    [rIn, -t],
  ]);

  const hatR = Math.min(rIn - 14 * MM, 92 * MM);
  const flange = rIn + 12 * MM;
  const hat = lathe([
    [0, -t - 2 * MM],
    [flange, -t - 2 * MM],
    [flange, t + 2 * MM],
    [hatR + 6 * MM, t + 2 * MM],
    [hatR, t + 8 * MM],
    [hatR, spec.hubFaceOffsetMm * MM],
    [0, spec.hubFaceOffsetMm * MM],
  ]);

  // Caliper: a slice of a ring that straddles the disc, extruded along the axle.
  const halfAngle = THREE.MathUtils.degToRad(spec.pistons >= 6 ? 33 : 25);
  const inner = rIn + 4 * MM;
  const outer = rOut + CALIPER_OVERHANG - 3 * MM;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, -halfAngle, halfAngle, false);
  shape.absarc(0, 0, inner, halfAngle, -halfAngle, true);
  shape.closePath();
  const thickness = spec.discThicknessMm * MM + 2 * 30 * MM;
  const bevel = 3 * MM;
  const caliper = new THREE.ExtrudeGeometry(shape, {
    depth: thickness - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 24,
  });
  // The shape is drawn in XY and extruded along Z. Centre it on the disc, then
  // tip it over so the extrusion runs along the axle (Y).
  caliper.translate(0, 0, -(thickness - bevel * 2) / 2);
  caliper.rotateX(-Math.PI / 2);

  return { disc, hat, caliper };
}

export function disposeBrake(brake: BrakeGeometry) {
  brake.disc.dispose();
  brake.hat.dispose();
  brake.caliper.dispose();
}
