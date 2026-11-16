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

/**
 * The engine a car ships with, as plain specs. The engine-bay generator
 * (src/parts/engine.ts) sizes the block, heads and manifolds from these, the
 * same way the wheel generator works from diameter, width and offset.
 */
export interface EngineSpec {
  /** Engine code and size as people know it, e.g. "2JZ-GTE 3.0 twin-turbo I6". */
  name: string;
  /** Cylinder arrangement. Flat engines are boxers: two banks lying down. */
  layout: 'inline' | 'v' | 'flat' | 'rotary';
  /** Number of cylinders, or rotors for a rotary. */
  cylinders: number;
  displacementL: number;
  /** Angle between the two banks of a V engine, in degrees. */
  bankAngleDeg?: number;
  /** Crankshaft along the car (longitudinal) or across it (transverse). */
  mounting: 'longitudinal' | 'transverse';
  /** Ahead of the cabin, behind the cabin but ahead of the rear axle, or behind the rear axle. */
  position: 'front' | 'mid' | 'rear';
  aspiration: 'na' | 'turbo' | 'twin-turbo';
  /** Factory-claimed peak power and torque, at the crank. */
  hp: number;
  torqueNm: number;
  /** Air-cooled engines carry a big fan and no radiator. */
  airCooled?: boolean;
  /** Colour of the cam covers, the part people recognise first. */
  coverHex: string;
  /** Wrinkle-finish covers (Ferrari red, Honda Type R red) rather than smooth paint. */
  crinkle?: boolean;
  /**
   * Transverse engines only: which way the exhaust manifold faces. Most face
   * the radiator; Honda's K-series turned the engine round so it faces the firewall.
   */
  exhaustFacing?: 'front' | 'rear';
  /**
   * Longitudinal engines only: which end the gearbox bolts to. Defaults to the
   * rear for front- and mid-engined cars, and the front for rear-engined ones.
   * The Countach is the odd one out: its gearbox sits ahead of the engine.
   */
  gearbox?: 'front' | 'rear';
}

/**
 * Who made a car's 3D model and under what licence. Creative Commons
 * Attribution asks for the title, author, source, licence and a note of what
 * was changed, shown where the work is used, so the app displays this.
 */
export interface ModelCredit {
  title: string;
  author: string;
  authorUrl?: string;
  /** Where the model was published. */
  url: string;
  /** Short licence name, e.g. 'CC BY 4.0'. */
  licence: string;
  licenceUrl?: string;
  /** What was changed from the original. */
  changes: string;
  /** Set when the licence could not be confirmed: says why. */
  unconfirmed?: string;
}

export interface CarDef {
  id: string;
  make: string;
  model: string;
  years: string;
  /** Path to the car's GLB, or null while no 3D model has been sourced yet.
   *  A car without a model is drawn as a translucent outline instead. */
  modelUrl: string | null;
  /** Credit for the 3D model. Unset for cars drawn as an outline. */
  modelCredit?: ModelCredit;
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
  engine: EngineSpec;
  /** Factory kerb weight: ready to drive, fluids in, no driver. */
  weightKg: number;
  /** Right-hand drive: the steering wheel is on the right (+x). Left-hand drive when unset. */
  rhd?: boolean;
  /**
   * z of the front and rear of the body, for models centred between their
   * axles (overhangs differ front to rear). Unset means ±length / 2.
   */
  bodyEndsZ?: [number, number];
  /**
   * Where the engine bay sits in the model, for cars with a real model. Cars
   * drawn as outlines work this out from their dimensions instead.
   * `center` is the crankshaft centre. In the engine view, everything above
   * `clipY` and beyond `clipZ` (toward the engine's end of the car) is clipped
   * away, as if the bonnet or deck lid were lifted off.
   */
  engineBay?: {
    center: [number, number, number];
    clipY: number;
    clipZ: number;
    /** Inside width of the bay, in metres. */
    width: number;
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
