import type { WheelDesign } from '../parts/wheel';

// Parts data is plain data, kept apart from the 3D code. A part describes a
// real product with real specs; the generators in src/parts turn those specs
// into meshes. This is the shape a parts database would serve later.

export type ViewId = 'exterior' | 'engine' | 'interior' | 'underside';
export type Axle = 'front' | 'rear';
export type Corner = 'fl' | 'fr' | 'rl' | 'rr';

/** How a painted or metal surface looks. All values run from 0 to 1. */
export interface Surface {
  color: string;
  /** 0 behaves like paint or plastic, 1 like bare metal. */
  metalness: number;
  /** 0 is a mirror, 1 is completely dull. */
  roughness: number;
  /** A glossy lacquer layer on top, like the clear coat on car paint. */
  clearcoat?: number;
}

export interface WheelFinish {
  id: string;
  name: string;
  face: Surface;
  lip: Surface;
  barrel: Surface;
  cap: Surface;
}

export interface WheelProduct {
  id: string;
  brand: string;
  model: string;
  construction: string;
  design: WheelDesign;
  finishes: WheelFinish[];
  /** Ids of the car's fitments this wheel is offered in. */
  fitments: string[];
  /** Ids of the cars this wheel belongs to. Missing means any car. */
  cars?: string[];
  /** Price per wheel. `null` for parts the car ships with. */
  priceUsdEach: number | null;
  /** False until the price and sizes have been checked against a seller. */
  verified: boolean;
}

export interface AxleFitment {
  diameterIn: number;
  widthIn: number;
  offsetMm: number;
  tyre: { widthMm: number; aspect: number };
}

/** A wheel and tyre size combination that fits a specific car. */
export interface Fitment {
  id: string;
  name: string;
  note: string;
  front: AxleFitment;
  rear: AxleFitment;
}

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  /** Finish this colour is normally sold in. */
  finish: PaintFinishId;
}

export type PaintFinishId = 'gloss' | 'metallic' | 'satin' | 'matte' | 'chrome';

export interface PaintFinish {
  id: PaintFinishId;
  name: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
}

export interface CameraView {
  id: ViewId;
  name: string;
  /** Where the camera sits and what it looks at, in metres. */
  position: [number, number, number];
  target: [number, number, number];
  /** Field of view in degrees. Wider inside the cabin, narrower outside. */
  fov: number;
  minDistance: number;
  maxDistance: number;
  /** Limits on tilting, in degrees from straight above (0) to straight below (180). */
  minPolar: number;
  maxPolar: number;
  /** Raise the car on the lift for this view. */
  lift?: boolean;
  /** Look around from a fixed spot instead of orbiting. */
  lookAround?: boolean;
  /** Shown on screen while this view is active. */
  note?: string;
}

export interface BrakeFitment {
  discDiameterMm: number;
  discThicknessMm: number;
  pistons: number;
  /** Which side of the axle the caliper sits on. */
  caliperSide: 'ahead' | 'behind';
}

export interface CarDef {
  id: string;
  make: string;
  model: string;
  years: string;
  /** Path to the car's GLB, or null while no 3D model has been sourced yet.
   *  A car without a model is drawn as a translucent outline instead. */
  modelUrl: string | null;
  credit: string;
  /** Overall size in metres. Drives the outline body and the camera framing. */
  sizeM: {
    length: number;
    width: number;
    height: number;
    wheelbase: number;
    trackFront: number;
    trackRear: number;
  };
  /** Id of the wheel the car ships with (see data/wheels.ts). */
  factoryWheelId: string;
  boltCount: number;
  pcdMm: number;
  /** Offset of the factory wheels. Used to work out where the hubs are. */
  stockOffsetMm: Record<Axle, number>;
  brakes: Record<Axle, BrakeFitment>;
  fitments: Fitment[];
  paints: PaintColor[];
  caliperColors: Array<{ id: string; name: string; hex: string }>;
  leatherColors: Array<{ id: string; name: string; hex: string }>;
  /** Limits for the ride height sliders, relative to stock. */
  rideHeightMm: { min: number; max: number; step: number };
  /** Names of the meshes and attachment points inside the model file.
   *  Only present when the car has a model. */
  nodes?: {
    paint: string[];
    glass: string[];
    leather: string[];
    /** The factory steering wheel mesh, hidden when an aftermarket one is fitted. */
    steering?: string;
    mounts: Record<Corner, string>;
  };
  lift: {
    /** How far the lift raises the car. */
    heightM: number;
    /** Height of the jacking points above the ground at stock ride height. */
    contactM: number;
    /** Sideways position of the two lift runners. */
    runnerX: number;
    runnerZ: number;
    runnerLength: number;
  };
  views: CameraView[];
}
