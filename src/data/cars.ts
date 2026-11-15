import { CIVICS } from './civics';
import type { CarDef } from './types';

// Seed data for the first car. Dimensions marked "approx" are from memory and
// need checking against a workshop manual or a fitment guide before they are
// trusted. Paint swatches are eyeballed, not measured from paint codes.

export const FERRARI_458: CarDef = {
  // The source model is titled "458 Italia", but the body is the open-top
  // Spider: no roof, and twin buttresses behind the seats.
  id: 'ferrari-458-spider',
  make: 'Ferrari',
  model: '458 Spider',
  years: '2011 to 2015',
  modelUrl: '/models/ferrari-458-spider.glb',
  credit: 'Ferrari 458 Italia model by vicent091036, via the three.js examples',
  sizeM: { length: 4.53, width: 1.94, height: 1.21, wheelbase: 2.65, trackFront: 1.67, trackRear: 1.61 },
  factoryWheelId: 'ferrari-oem-20',

  boltCount: 5,
  pcdMm: 114.3,
  stockOffsetMm: { front: 42, rear: 49 }, // approx

  // Factory carbon-ceramic brakes.
  brakes: {
    front: { discDiameterMm: 398, discThicknessMm: 36, pistons: 6, caliperSide: 'behind' },
    rear: { discDiameterMm: 360, discThicknessMm: 32, pistons: 4, caliperSide: 'ahead' },
  },

  fitments: [
    {
      id: 'stock',
      name: 'Stock size',
      note: 'Same sizes as the factory wheels.',
      front: { diameterIn: 20, widthIn: 8.5, offsetMm: 42, tyre: { widthMm: 235, aspect: 35 } },
      rear: { diameterIn: 20, widthIn: 10.5, offsetMm: 49, tyre: { widthMm: 295, aspect: 35 } },
    },
    {
      id: 'wide-20',
      name: 'Wide 20s',
      note: 'Wider wheels on lower offsets, closer to the arches.',
      front: { diameterIn: 20, widthIn: 9, offsetMm: 32, tyre: { widthMm: 245, aspect: 35 } },
      rear: { diameterIn: 20, widthIn: 11, offsetMm: 45, tyre: { widthMm: 305, aspect: 30 } },
    },
    {
      id: 'staggered-21',
      name: '20 front, 21 rear',
      note: 'Larger rear wheels with a shorter sidewall.',
      front: { diameterIn: 20, widthIn: 9, offsetMm: 32, tyre: { widthMm: 245, aspect: 35 } },
      rear: { diameterIn: 21, widthIn: 12, offsetMm: 60, tyre: { widthMm: 325, aspect: 25 } },
    },
  ],

  paints: [
    { id: 'rosso-corsa', name: 'Rosso Corsa', hex: '#c8070c', finish: 'gloss' },
    { id: 'rosso-mugello', name: 'Rosso Mugello', hex: '#6e0a12', finish: 'gloss' },
    { id: 'giallo-modena', name: 'Giallo Modena', hex: '#f2bd00', finish: 'gloss' },
    { id: 'bianco-avus', name: 'Bianco Avus', hex: '#e9e9e4', finish: 'gloss' },
    { id: 'nero-daytona', name: 'Nero Daytona', hex: '#0d0d10', finish: 'metallic' },
    { id: 'grigio-silverstone', name: 'Grigio Silverstone', hex: '#4d5257', finish: 'metallic' },
    { id: 'argento-nurburgring', name: 'Argento Nürburgring', hex: '#b3b7bb', finish: 'metallic' },
    { id: 'blu-tour-de-france', name: 'Blu Tour de France', hex: '#152a5e', finish: 'metallic' },
    { id: 'blu-pozzi', name: 'Blu Pozzi', hex: '#0b1330', finish: 'gloss' },
    { id: 'verde-british', name: 'Verde British', hex: '#0e3324', finish: 'gloss' },
  ],

  caliperColors: [
    { id: 'yellow', name: 'Yellow', hex: '#f0c400' },
    { id: 'red', name: 'Red', hex: '#c20d12' },
    { id: 'black', name: 'Black', hex: '#111214' },
    { id: 'silver', name: 'Silver', hex: '#a9adb1' },
    { id: 'blue', name: 'Blue', hex: '#1a3f9e' },
  ],

  leatherColors: [
    { id: 'nero', name: 'Nero', hex: '#131313' },
    { id: 'cuoio', name: 'Cuoio', hex: '#8a4a22' },
    { id: 'rosso', name: 'Rosso', hex: '#7c0f12' },
    { id: 'beige', name: 'Beige', hex: '#b9a482' },
    { id: 'blu-scuro', name: 'Blu Scuro', hex: '#141c33' },
  ],

  rideHeightMm: { min: -60, max: 20, step: 5 },

  nodes: {
    paint: ['body_paint'],
    glass: ['glass'],
    leather: ['interior_leather', 'steering_leather'],
    steering: 'steering_leather',
    mounts: {
      fl: 'mount_wheel_fl',
      fr: 'mount_wheel_fr',
      rl: 'mount_wheel_rl',
      rr: 'mount_wheel_rr',
    },
  },

  lift: { heightM: 1.45, contactM: 0.15, runnerX: 0.66, runnerZ: 0.2, runnerLength: 1.5 },

  views: [
    {
      id: 'exterior',
      name: 'Exterior',
      position: [-4.5, 1.55, -5.6],
      target: [0, 0.55, 0.1],
      fov: 34,
      minDistance: 3.2,
      maxDistance: 10,
      minPolar: 15,
      maxPolar: 88,
    },
    {
      // Mid-engined: the engine sits behind the seats, under the rear glass.
      id: 'engine',
      name: 'Engine bay',
      position: [1.1, 2.15, 3.3],
      target: [0, 0.85, 1.0],
      fov: 38,
      minDistance: 1.4,
      maxDistance: 4,
      minPolar: 5,
      maxPolar: 80,
      note: 'The engine sits under this cover. This model has nothing built beneath it yet.',
    },
    {
      id: 'interior',
      name: 'Interior',
      // For a look-around view, position is the driver's head and target is
      // what they face at first.
      position: [-0.36, 1.0, 0.25],
      target: [-0.15, 0.84, -0.6],
      fov: 72,
      minDistance: 0.05,
      maxDistance: 0.05,
      minPolar: 35,
      maxPolar: 140,
      lookAround: true,
    },
    {
      id: 'underside',
      name: 'Underside',
      position: [2.2, 0.75, 3.1],
      target: [0, 1.5, 0.2],
      fov: 50,
      minDistance: 0.9,
      maxDistance: 4.6,
      minPolar: 92,
      maxPolar: 175,
      lift: true,
    },
  ],
};

export const CARS: CarDef[] = [FERRARI_458, ...CIVICS];
