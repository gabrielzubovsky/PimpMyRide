import type { AxleFitment, CarDef, Axle } from '../data/types';
import { tyreOuterRadius } from '../parts/tyre';
import { MM } from '../units';

// Stance: where the wheels sit and how the body sits over them. All of it is
// worked out from real fitment numbers, so changing the offset or tyre size
// moves things the way it would on the real car.

/** Where the factory wheel centre is on one axle, read from the model file. */
export interface AxleMount {
  /** Distance from the car's centreline to the wheel centreline. */
  halfTrack: number;
  y: number;
  z: number;
}

export interface AxleSetup {
  /** Distance from the car's centreline to the hub face the wheel bolts onto. */
  hubX: number;
  /** Height of the axle above the ground. */
  axleY: number;
  z: number;
  offsetM: number;
  tyreRadius: number;
  /** How far the body moves up or down at this axle compared with the model. */
  bodyDeltaY: number;
}

const TYRE_SQUASH = 3 * MM; // the tyre flattens slightly where it meets the ground

export function axleSetup(
  car: CarDef,
  mount: AxleMount,
  fitment: AxleFitment,
  axle: Axle,
  rideHeightMm: number,
): AxleSetup {
  const tyreRadius = tyreOuterRadius({ ...fitment.tyre, rimDiameterIn: fitment.diameterIn });
  const axleY = tyreRadius - TYRE_SQUASH;
  return {
    // The hub does not move when you change wheels. Find it from the factory
    // wheel: its centreline plus its offset.
    hubX: mount.halfTrack + car.stockOffsetMm[axle] * MM,
    axleY,
    z: mount.z,
    offsetM: fitment.offsetMm * MM,
    tyreRadius,
    // The body rides on the axles, so a taller tyre lifts it and a lower ride
    // height setting drops it.
    bodyDeltaY: axleY - mount.y + rideHeightMm * MM,
  };
}

/**
 * Height and nose-up/nose-down tilt of the body, from how far it has moved at
 * each axle. Lowering only the front, or fitting smaller front tyres, rakes
 * the car forward.
 */
export function bodyPose(front: AxleSetup, rear: AxleSetup): { y: number; pitch: number } {
  const slope = (front.bodyDeltaY - rear.bodyDeltaY) / (rear.z - front.z);
  return { y: front.bodyDeltaY + front.z * slope, pitch: Math.asin(slope) };
}

/** How far the body has moved up or down at a point along the car. */
export function bodyDeltaAt(pose: { y: number; pitch: number }, z: number): number {
  return pose.y - z * Math.sin(pose.pitch);
}
