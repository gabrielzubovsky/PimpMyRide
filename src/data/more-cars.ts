import { ax, brake, CALIPERS, INTERIORS, paint, square, viewsFor } from './civics';
import type { AxleFitment, BrakeFitment, CarDef, EngineSpec, Fitment, ModelCredit, PaintColor } from './types';

// Ten more cars, one per marque, picked from a survey of downloadable
// Sketchfab models (see docs/sketchfab-cars.md). Every pick is CC Attribution,
// so it only needs crediting. scripts/fetch-sketchfab.mjs downloads them (free
// Sketchfab API token needed) and scripts/prepare-sketchfab.mjs prepares them;
// until a car's model is prepared, `prepared` stays unset and it draws as an
// outline. Each car's `source` credits its model (shown in the app). All dimensions, offsets and brake figures are
// approximate, from general knowledge, and need checking against a workshop
// manual or fitment guide before they are trusted — same spirit as the
// verified: false flags in the wheel catalogue.

/** Staggered setup: different wheel or tyre front and rear. */
/** What prepare-sketchfab.mjs changes, for the attribution. */
const CHANGES =
  "Scaled to the real car's size, turned to face forward, baked wheels, tyres and brakes removed, paint, glass and trim materials replaced, recompressed.";

const CC_BY = { licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0/' };

/** The uploader may not hold the rights to these: see CREDITS.md. */
const GAME_RIP = 'This looks like a re-uploaded video-game model, so the uploader may not hold the rights to license it.';
const REUPLOADER = 'This uploader has re-posted other people’s models, so the licence may not be theirs to give.';

const staggered = (id: string, name: string, note: string, front: AxleFitment, rear: AxleFitment): Fitment => ({
  id,
  name,
  note,
  front,
  rear,
});

interface SurveyCar {
  id: string;
  make: string;
  model: string;
  years: string;
  /** The Sketchfab model chosen for this car: title, author, licence and link. */
  source: ModelCredit;
  boltCount: number;
  pcdMm: number;
  offsetMm: { front: number; rear: number };
  /** Length, width, height, wheelbase, front track, rear track, in metres. */
  size: [number, number, number, number, number, number];
  front: BrakeFitment;
  rear: BrakeFitment;
  /** Rear- and mid-engined cars get the engine-bay camera at the tail. */
  engine: EngineSpec;
  weightKg: number;
  fitments: Fitment[];
  paints: PaintColor[];
  ride: { min: number; max: number };
  /**
   * Set once the Sketchfab model has been downloaded and prepared with
   * scripts/prepare-sketchfab.mjs, which names the materials 'paint', 'glass'
   * and (when the cabin has it) 'leather', and plants the wheel mounts.
   */
  prepared?: {
    /** z of the front and rear of the body, as prepare-sketchfab.mjs prints them. */
    ends: [number, number];
    leather?: boolean;
    /** False for a model without window glass. */
    glass?: boolean;
  };
  rhd?: boolean;
  /** Driver's eye position, when the model's seats sit away from the default. */
  eye?: [number, number, number];
}

function car(c: SurveyCar): CarDef {
  const [length, width, height, wheelbase, trackFront, trackRear] = c.size;
  const size = { length, width, height, wheelbase, trackFront, trackRear };
  const views = viewsFor(size, c.engine, { rhd: c.rhd, eye: c.eye }).map((v) =>
    v.id === 'engine' && c.engine.position !== 'front'
      ? {
          ...v,
          // Mirror the front-engined preset to the tail of the car.
          position: [0.9, 1.85, length / 2 + 0.5] as [number, number, number],
          target: [0, height * 0.55, wheelbase / 2 - 0.1] as [number, number, number],
          note: `Deck lid lifted away. The ${c.engine.name} is a stylised stand-in, sized from its layout and displacement.`,
        }
      : v,
  );
  return {
    id: c.id,
    make: c.make,
    model: c.model,
    years: c.years,
    modelUrl: c.prepared ? `/models/${c.id}.glb` : null,
    modelCredit: c.prepared ? c.source : undefined,
    nodes: c.prepared && {
      paint: ['paint'],
      glass: c.prepared.glass === false ? [] : ['glass'],
      leather: c.prepared.leather ? ['leather'] : [],
      mounts: { fl: 'mount_wheel_fl', fr: 'mount_wheel_fr', rl: 'mount_wheel_rl', rr: 'mount_wheel_rr' },
    },
    sizeM: size,
    factoryWheelId: 'oem-alloy',
    boltCount: c.boltCount,
    pcdMm: c.pcdMm,
    stockOffsetMm: c.offsetMm,
    brakes: { front: c.front, rear: c.rear },
    fitments: c.fitments,
    paints: c.paints,
    caliperColors: CALIPERS,
    leatherColors: INTERIORS,
    rideHeightMm: { min: c.ride.min, max: c.ride.max, step: 5 },
    lift: {
      heightM: 1.45,
      contactM: 0.12,
      runnerX: (trackFront / 2) * 0.78,
      runnerZ: 0,
      runnerLength: wheelbase * 0.55,
    },
    engine: c.engine,
    weightKg: c.weightKg,
    rhd: c.rhd,
    bodyEndsZ: c.prepared?.ends,
    views,
  };
}

/** Shorthand for a front-mounted, longitudinal engine. Specs from general knowledge. */
const frontLong = (e: Omit<EngineSpec, 'mounting' | 'position'>): EngineSpec => ({
  mounting: 'longitudinal',
  position: 'front',
  ...e,
});

export const MORE_CARS: CarDef[] = [
  car({
    id: 'toyota-supra-a80',
    make: 'Toyota',
    model: 'Supra (A80)',
    years: '1993 to 2002',
    source: {
      title: 'Toyota Supra MK IV (1994)',
      author: 'Martin Trafas',
      authorUrl: 'https://sketchfab.com/TinoD2',
      url: 'https://sketchfab.com/3d-models/toyota-supra-mk-iv-1994-eb9bb1eb41db431cb078088ae1ce45f8',
      ...CC_BY,
      changes: CHANGES,
    },
    prepared: { ends: [-2.235, 2.296] },
    rhd: true, // the model is a Japanese-market car
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 50, rear: 50 }, // approx
    size: [4.51, 1.81, 1.27, 2.55, 1.52, 1.53], // approx
    front: brake(323, 30, 4, 'behind'), // approx, twin-turbo spec
    rear: brake(324, 20, 2, 'ahead'), // approx
    ride: { min: -60, max: 20 },
    weightKg: 1570, // approx
    engine: frontLong({ name: '2JZ-GTE 3.0 twin-turbo I6', layout: 'inline', cylinders: 6, displacementL: 3.0, aspiration: 'twin-turbo', hp: 320, torqueNm: 427, coverHex: '#3a3c40' }),
    fitments: [
      staggered('stock', 'Stock size', 'Factory staggered 17s.', ax(17, 8, 50, 235, 45), ax(17, 9.5, 50, 255, 40)),
      staggered('18-street', 'Street 18s', 'Eighteens with a wider rear.', ax(18, 9, 35, 265, 35), ax(18, 10, 40, 285, 30)),
      staggered('19-show', 'Show 19s', 'Nineteens on a short sidewall.', ax(19, 9.5, 30, 255, 30), ax(19, 10.5, 35, 295, 25)),
    ],
    paints: [
      // Period A80 colours, swatches eyeballed. approx
      paint('super-white', 'Super White', '#eceae2'),
      paint('renaissance-red', 'Renaissance Red', '#b5121a'),
      paint('quicksilver', 'Quicksilver', '#b7babd', 'metallic'),
      paint('deep-jewel-green', 'Deep Jewel Green', '#12382e', 'metallic'),
      paint('royal-sapphire', 'Royal Sapphire Blue', '#1c2d5c', 'metallic'),
      paint('anthracite', 'Anthracite', '#17181c', 'metallic'),
    ],
  }),
  car({
    id: 'nissan-skyline-r34',
    make: 'Nissan',
    model: 'Skyline GT-R (R34)',
    years: '1999 to 2002',
    source: {
      title: '02\' Nissan Skyline R34 GT-R',
      author: 'DRIVER-FIRE',
      authorUrl: 'https://sketchfab.com/DRIVER-FIRE',
      url: 'https://sketchfab.com/3d-models/02-nissan-skyline-r34-gt-r-14bee030e5d847b7ad16be3a28459222',
      ...CC_BY,
      changes: CHANGES,
      unconfirmed: GAME_RIP,
    },
    prepared: { ends: [-2.295, 2.303] },
    rhd: true, // a Japanese-market car, like the real GT-R
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 30, rear: 30 }, // approx
    size: [4.6, 1.79, 1.36, 2.67, 1.48, 1.49], // approx
    front: brake(324, 30, 4, 'behind'), // approx, factory Brembo
    rear: brake(322, 22, 2, 'ahead'), // approx
    ride: { min: -55, max: 20 },
    weightKg: 1560, // approx
    engine: frontLong({ name: 'RB26DETT 2.6 twin-turbo I6', layout: 'inline', cylinders: 6, displacementL: 2.6, aspiration: 'twin-turbo', hp: 276, torqueNm: 392, coverHex: '#9c1218', crinkle: true }),
    fitments: [
      square('stock', 'Stock size', 'Factory square 18s.', ax(18, 9, 30, 245, 40)),
      square('nismo-18', 'Wide 18s', 'Wider square 18s, Nismo style.', ax(18, 9.5, 22, 265, 35)),
      square('19-street', 'Street 19s', 'Nineteens on a short sidewall.', ax(19, 9.5, 25, 265, 30)),
    ],
    paints: [
      // Period R34 colours, swatches eyeballed. approx
      paint('bayside-blue', 'Bayside Blue', '#1a5bb5', 'metallic'),
      paint('millennium-jade', 'Millennium Jade', '#9aa894', 'metallic'),
      paint('white-pearl', 'White Pearl', '#e9eae4', 'metallic'),
      paint('athlete-silver', 'Athlete Silver', '#b4b7bb', 'metallic'),
      paint('active-red', 'Active Red', '#b8161c'),
      paint('black-pearl', 'Black Pearl', '#0d0d10', 'metallic'),
    ],
  }),
  car({
    id: 'mazda-rx7-fd',
    make: 'Mazda',
    model: 'RX-7 (FD3S)',
    years: '1992 to 2002',
    source: {
      title: '1993_mazda_rx-7',
      author: '007',
      authorUrl: 'https://sketchfab.com/tangwang920',
      url: 'https://sketchfab.com/3d-models/1993-mazda-rx-7-8b828b5c888c43a1895228d48fe50c97',
      ...CC_BY,
      changes: CHANGES,
      unconfirmed: GAME_RIP,
    },
    prepared: { ends: [-2.045, 2.242] },
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 50, rear: 50 }, // approx
    size: [4.29, 1.76, 1.23, 2.43, 1.46, 1.46], // approx
    front: brake(294, 22, 4, 'behind'), // approx
    rear: brake(294, 18, 1, 'ahead'), // approx
    ride: { min: -55, max: 20 },
    weightKg: 1280, // approx
    engine: frontLong({ name: '13B-REW twin-rotor sequential twin-turbo', layout: 'rotary', cylinders: 2, displacementL: 1.3, aspiration: 'twin-turbo', hp: 255, torqueNm: 294, coverHex: '#26272a' }),
    fitments: [
      square('stock', 'Stock size', 'Factory square 16s.', ax(16, 8, 50, 225, 50)),
      staggered('spirit-17', 'Spirit R 17s', 'The late Spirit R setup.', ax(17, 8.5, 50, 235, 45), ax(17, 8.5, 50, 255, 40)),
      staggered('18-show', 'Show 18s', 'Deep-dish 18s under the arches.', ax(18, 9.5, 22, 245, 40), ax(18, 10.5, 20, 275, 35)),
    ],
    paints: [
      // Period FD colours, swatches eyeballed. approx
      paint('vintage-red', 'Vintage Red', '#a01622'),
      paint('competition-yellow', 'Competition Yellow Mica', '#d8b721', 'metallic'),
      paint('montego-blue', 'Montego Blue Mica', '#15213f', 'metallic'),
      paint('pure-white', 'Pure White', '#e9e8e0'),
      paint('silver-stone', 'Silver Stone', '#b6b9bd', 'metallic'),
      paint('brilliant-black', 'Brilliant Black', '#0f0f12'),
    ],
  }),
  car({
    id: 'subaru-impreza-gc8',
    make: 'Subaru',
    model: 'Impreza WRX STI (GC8)',
    years: '1992 to 2000',
    source: {
      title: 'Subaru Impreza WRX STi Version VI (GC8)',
      author: 'Mona x Supercars',
      authorUrl: 'https://sketchfab.com/Car2022',
      url: 'https://sketchfab.com/3d-models/subaru-impreza-wrx-sti-version-vi-gc8-457f01e7e8d14b088e3f092c1be9e75c',
      ...CC_BY,
      changes: CHANGES,
    },
    prepared: { ends: [-2.122, 2.237] },
    rhd: true, // a Japanese-market car
    boltCount: 5,
    pcdMm: 100,
    offsetMm: { front: 53, rear: 53 }, // approx
    size: [4.35, 1.69, 1.41, 2.52, 1.47, 1.47], // approx
    front: brake(294, 24, 4, 'behind'), // approx
    rear: brake(290, 18, 2, 'ahead'), // approx
    ride: { min: -60, max: 35 },
    weightKg: 1260, // approx
    engine: frontLong({ name: 'EJ20 2.0 turbo flat-four', layout: 'flat', cylinders: 4, displacementL: 2.0, aspiration: 'turbo', hp: 276, torqueNm: 353, coverHex: '#26272a' }),
    fitments: [
      square('stock', 'Stock size', 'Factory 16s.', ax(16, 7, 53, 205, 50)),
      square('sti-17', 'STI 17s', 'The later STI size, gold-wheel territory.', ax(17, 7.5, 53, 215, 45)),
      square('gravel-15', 'Gravel 15s', 'Small rally wheels on a tall tyre.', ax(15, 6.5, 48, 195, 60)),
    ],
    paints: [
      // Period GC8 colours, swatches eyeballed. approx
      paint('sonic-blue', 'Sonic Blue Mica', '#1a4f9c', 'metallic'),
      paint('feather-white', 'Feather White', '#eceae2'),
      paint('cool-gray', 'Cool Gray Metallic', '#9ea3a7', 'metallic'),
      paint('bright-red', 'Bright Red', '#b8161c'),
      paint('black-mica', 'Black Mica', '#101014', 'metallic'),
    ],
  }),
  car({
    id: 'bmw-m3-e30',
    make: 'BMW',
    model: 'M3 (E30)',
    years: '1986 to 1991',
    source: {
      title: '[FREE] BMW M3 E30',
      author: 'Martin Trafas',
      authorUrl: 'https://sketchfab.com/TinoD2',
      url: 'https://sketchfab.com/3d-models/free-bmw-m3-e30-ac3c7013434e403e8faff87948caf422',
      ...CC_BY,
      changes: CHANGES,
    },
    prepared: { ends: [-2.051, 2.276] },
    boltCount: 5,
    pcdMm: 120,
    offsetMm: { front: 25, rear: 25 }, // approx
    size: [4.36, 1.68, 1.37, 2.57, 1.41, 1.42], // approx
    front: brake(280, 25, 1, 'behind'), // approx
    rear: brake(282, 10, 1, 'ahead'), // approx
    ride: { min: -55, max: 25 },
    weightKg: 1200, // approx
    engine: frontLong({ name: 'S14 2.3 I4', layout: 'inline', cylinders: 4, displacementL: 2.3, aspiration: 'na', hp: 192, torqueNm: 230, coverHex: '#8f959b' }),
    fitments: [
      square('stock', 'Stock size', 'Factory 15-inch BBS cross-spokes.', ax(15, 7, 25, 205, 55)),
      square('evo-16', 'Evolution 16s', 'The Sport Evolution size.', ax(16, 7.5, 30, 225, 45)),
      square('17-period', 'Period 17s', 'Deep-dish 17s, touring-car look.', ax(17, 8, 20, 215, 40)),
    ],
    paints: [
      // Period E30 M3 colours, swatches eyeballed. approx
      paint('alpine-white', 'Alpine White', '#eceae3'),
      paint('zinnoberrot', 'Zinnoberrot', '#c2341f'),
      paint('lachssilber', 'Lachssilber', '#b9b5ae', 'metallic'),
      paint('macao-blue', 'Macao Blue', '#20264c', 'metallic'),
      paint('diamantschwarz', 'Diamantschwarz', '#15161c', 'metallic'),
    ],
  }),
  car({
    id: 'mercedes-190e',
    make: 'Mercedes-Benz',
    model: '190E (W201)',
    years: '1982 to 1993',
    source: {
      title: '1984 Mercedes 190E',
      author: 'Dave Love SketchFab',
      authorUrl: 'https://sketchfab.com/Tyler_Dave',
      url: 'https://sketchfab.com/3d-models/1984-mercedes-190e-dc0799500bc4478296514b25a6541282',
      ...CC_BY,
      changes: CHANGES,
    },
    prepared: { ends: [-2.1, 2.387], leather: true },
    boltCount: 5,
    pcdMm: 112,
    offsetMm: { front: 49, rear: 49 }, // approx
    size: [4.42, 1.68, 1.39, 2.67, 1.44, 1.42], // approx
    front: brake(284, 22, 1, 'behind'), // approx
    rear: brake(258, 9, 1, 'ahead'), // approx
    ride: { min: -55, max: 25 },
    weightKg: 1150, // approx
    engine: frontLong({ name: 'M102 2.3 I4', layout: 'inline', cylinders: 4, displacementL: 2.3, aspiration: 'na', hp: 130, torqueNm: 185, coverHex: '#8f959b' }),
    fitments: [
      square('stock', 'Stock size', 'Factory 15-hole alloys.', ax(15, 6, 49, 185, 65)),
      square('cosworth-16', 'Cosworth 16s', 'The 2.3-16 Evolution look.', ax(16, 7, 44, 205, 55)),
      square('17-amg', 'AMG-style 17s', 'Period monoblock style.', ax(17, 8, 35, 215, 40)),
    ],
    paints: [
      // Period W201 colours, swatches eyeballed. approx
      paint('blauschwarz', 'Blue-Black Metallic', '#14161f', 'metallic'),
      paint('astral-silver', 'Astral Silver', '#b6b9bd', 'metallic'),
      paint('signal-red', 'Signal Red', '#b01a18'),
      paint('smoke-silver', 'Smoke Silver', '#8b8d8a', 'metallic'),
      paint('arctic-white', 'Arctic White', '#e9e8e1'),
    ],
  }),
  car({
    id: 'porsche-911-964',
    make: 'Porsche',
    model: '911 Carrera (964)',
    years: '1989 to 1994',
    source: {
      title: '1989 Porsche 911 (964) Carrera 4',
      author: '007',
      authorUrl: 'https://sketchfab.com/tangwang920',
      url: 'https://sketchfab.com/3d-models/1989-porsche-911-964-carrera-4-22edb81d9ccf46c09a1add7a9ebda2c0',
      ...CC_BY,
      changes: CHANGES,
      unconfirmed: REUPLOADER,
    },
    prepared: { ends: [-2.033, 2.2], leather: true },
    boltCount: 5,
    pcdMm: 130,
    offsetMm: { front: 52, rear: 52 }, // approx
    size: [4.25, 1.65, 1.32, 2.27, 1.38, 1.37], // approx
    front: brake(298, 28, 4, 'behind'), // approx
    rear: brake(299, 24, 4, 'ahead'), // approx
    ride: { min: -40, max: 20 },
    weightKg: 1450, // approx
    engine: { name: 'M64 3.6 air-cooled flat-six', layout: 'flat', cylinders: 6, displacementL: 3.6, mounting: 'longitudinal', position: 'rear', aspiration: 'na', hp: 247, torqueNm: 310, airCooled: true, coverHex: '#1c1d20' },
    fitments: [
      staggered('stock', 'Stock size', 'Factory staggered 16s.', ax(16, 6, 52, 205, 55), ax(16, 8, 52, 225, 50)),
      staggered('cup-17', 'Cup 17s', 'The Cup wheel setup.', ax(17, 7.5, 55, 205, 50), ax(17, 9, 55, 255, 40)),
      staggered('18-threepiece', 'Three-piece 18s', 'Deep rear lips, outlaw style.', ax(18, 8, 50, 225, 40), ax(18, 9.5, 55, 265, 35)),
    ],
    paints: [
      // Period 964 colours, swatches eyeballed. approx
      paint('guards-red', 'Guards Red', '#c01318'),
      paint('grand-prix-white', 'Grand Prix White', '#eceae2'),
      paint('polar-silver', 'Polar Silver', '#b7babe', 'metallic'),
      paint('midnight-blue', 'Midnight Blue', '#121a30', 'metallic'),
      paint('rubystone-red', 'Rubystone Red', '#c84a6e'),
      paint('black-964', 'Black', '#0e0e11'),
    ],
  }),
  car({
    id: 'vw-golf-gti-mk1',
    make: 'Volkswagen',
    model: 'Golf GTI (Mk1)',
    years: '1976 to 1983',
    source: {
      title: 'Volkswagen Golf GTI 1976',
      author: 'geevisual55',
      authorUrl: 'https://sketchfab.com/geevisual55',
      url: 'https://sketchfab.com/3d-models/volkswagen-golf-gti-1976-4ab00bf79f2b413c8e89fb7ff5470249',
      ...CC_BY,
      changes: CHANGES,
    },
    prepared: { ends: [-2.006, 1.854] },
    // The model's front seats run from z −0.36 to about 0.3: sit the eye just
    // ahead of the headrest rather than inside it.
    eye: [-0.33, 1.08, -0.02],
    boltCount: 4,
    pcdMm: 100,
    offsetMm: { front: 38, rear: 38 }, // approx
    size: [3.82, 1.63, 1.39, 2.4, 1.39, 1.36], // approx
    front: brake(239, 10, 1, 'behind'), // approx
    rear: brake(180, 10, 1, 'ahead'), // approx, rear drums drawn as discs
    ride: { min: -60, max: 25 },
    weightKg: 810, // approx
    engine: { name: 'EA827 1.6 I4', layout: 'inline', cylinders: 4, displacementL: 1.6, mounting: 'transverse', position: 'front', aspiration: 'na', hp: 108, torqueNm: 140, coverHex: '#3a3c40' },
    fitments: [
      square('stock', 'Stock size', 'Factory 13s.', ax(13, 5.5, 38, 175, 70)),
      square('snowflake-14', 'Snowflake 14s', 'The later GTI alloy size.', ax(14, 6, 38, 185, 60)),
      square('bbs-15', 'Period 15s', 'Deep cross-spoke 15s, euro style.', ax(15, 7, 25, 195, 50)),
    ],
    paints: [
      // Period Mk1 colours, swatches eyeballed. approx
      paint('mars-red', 'Mars Red', '#b7241c'),
      paint('diamond-silver', 'Diamond Silver', '#b8bbbe', 'metallic'),
      paint('alpine-white', 'Alpine White', '#eae9e1'),
      paint('helios-blue', 'Helios Blue', '#28426e', 'metallic'),
      paint('black-mk1', 'Black', '#121214'),
    ],
  }),
  car({
    id: 'ford-mustang-1965',
    make: 'Ford',
    model: 'Mustang (first generation)',
    years: '1964 to 1966',
    // The first pick (Kristian LaGrange's convertible) paints everything from
    // one texture, so its paint and wheels can't be separated; this coupe can.
    source: {
      title: '1965 Ford Mustang',
      author: 'David_Holiday',
      authorUrl: 'https://sketchfab.com/David_Holiday',
      url: 'https://sketchfab.com/3d-models/1965-ford-mustang-7e93cc22b96a4788897a513374ef4486',
      ...CC_BY,
      changes: CHANGES + ' Hardtop coupe; no window glass in the model.',
    },
    prepared: { ends: [-2.233, 2.387], glass: false },
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 0, rear: 0 }, // approx
    size: [4.61, 1.73, 1.3, 2.74, 1.42, 1.42], // approx
    front: brake(251, 10, 1, 'behind'), // approx, the optional front discs
    rear: brake(254, 10, 1, 'ahead'), // approx, rear drums drawn as discs
    ride: { min: -50, max: 30 },
    weightKg: 1300, // approx
    engine: frontLong({ name: '289 V8 (4.7 L)', layout: 'v', cylinders: 8, displacementL: 4.7, bankAngleDeg: 90, aspiration: 'na', hp: 200, torqueNm: 383, coverHex: '#1f4fa8' }),
    fitments: [
      square('stock', 'Stock size', 'Factory 14s with hubcaps.', ax(14, 5, 0, 195, 75)),
      square('styled-15', 'Styled steel 15s', 'The GT look.', ax(15, 6, 0, 205, 70)),
      square('torq-15', 'Torq Thrust 15s', 'Wide five-spokes, period hot rod.', ax(15, 7, -6, 215, 65)),
    ],
    paints: [
      // Period 1965 colours, swatches eyeballed. approx
      paint('wimbledon-white', 'Wimbledon White', '#ece9df'),
      paint('rangoon-red', 'Rangoon Red', '#b6141c'),
      paint('caspian-blue', 'Caspian Blue', '#1d3a68', 'metallic'),
      paint('ivy-green', 'Ivy Green', '#1f3b2c', 'metallic'),
      paint('poppy-red', 'Poppy Red', '#d04a28'),
      paint('raven-black', 'Raven Black', '#111113'),
    ],
  }),
  car({
    id: 'lamborghini-countach',
    make: 'Lamborghini',
    // The 25th Anniversary is the 5000 QV restyled, same L503 V12. The first
    // pick (a 5000 QV by Randomness) has no colours or part names to work with.
    model: 'Countach 25th Anniversary',
    years: '1988 to 1990',
    source: {
      title: '1988 Lamborghini Countach',
      author: 'Dave Love SketchFab',
      authorUrl: 'https://sketchfab.com/Tyler_Dave',
      url: 'https://sketchfab.com/3d-models/1988-lamborghini-countach-6ecbd718252143b1a83875357d003592',
      ...CC_BY,
      changes: CHANGES,
    },
    prepared: { ends: [-2.135, 1.994], leather: true },
    boltCount: 5,
    pcdMm: 120,
    offsetMm: { front: 23, rear: -10 }, // approx
    size: [4.14, 2.0, 1.07, 2.45, 1.54, 1.61], // approx
    front: brake(300, 28, 4, 'behind'), // approx
    rear: brake(284, 22, 4, 'ahead'), // approx
    ride: { min: -30, max: 20 },
    weightKg: 1490, // approx
    engine: { name: 'L503 5.2 V12', layout: 'v', cylinders: 12, displacementL: 5.17, bankAngleDeg: 60, mounting: 'longitudinal', position: 'mid', gearbox: 'front', aspiration: 'na', hp: 449, torqueNm: 500, coverHex: '#26272a', crinkle: true },
    fitments: [
      staggered('stock', 'Stock size', 'Factory staggered 15s, huge rear tyres.', ax(15, 8.5, 23, 225, 50), ax(15, 12, -10, 345, 35)),
      staggered('17-modern', 'Modern 17s', 'Seventeens keeping the stagger.', ax(17, 9, 15, 245, 40), ax(17, 13, -5, 335, 35)),
    ],
    paints: [
      // Period Countach colours, swatches eyeballed. approx
      paint('rosso', 'Rosso', '#c01016'),
      paint('bianco', 'Bianco', '#eae9e2'),
      paint('giallo', 'Giallo', '#e7c31b'),
      paint('blu-tahiti', 'Blu Tahiti', '#1f4f9e', 'metallic'),
      paint('nero', 'Nero', '#0e0e11'),
    ],
  }),
];
