import { CIVICS } from './civics';
import { MORE_CARS } from './more-cars';
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
  modelCredit: {
    title: 'Ferrari 458 Italia',
    author: 'vicent091036',
    // The original listing is disabled; the file comes from the three.js examples.
    url: 'https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6',
    licence: 'licence unconfirmed',
    changes: 'File from the three.js examples repository; wheels replaced with mount points, meshes renamed, recompressed.',
    unconfirmed: 'The Sketchfab listing is disabled, so its licence could not be checked.',
  },
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

  engine: {
    name: 'F136 FB 4.5 V8',
    layout: 'v',
    cylinders: 8,
    displacementL: 4.5,
    bankAngleDeg: 90,
    mounting: 'longitudinal',
    position: 'mid',
    aspiration: 'na',
    hp: 562, // 570 PS
    torqueNm: 540,
    coverHex: '#a01016',
    crinkle: true,
  },
  weightKg: 1505, // approx
  // The V8 sits behind the cabin, ahead of the rear axle. In the engine view
  // the rear deck is clipped away above and behind these limits so the bay
  // shows. Measured against the model, not the real car.
  engineBay: { center: [0, 0.42, 1.32], clipY: 0.78, clipZ: 0.98, width: 1.3 },

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
      note: 'Rear deck lifted away. The F136 V8 and its bay are stylised stand-ins, sized from the real engine.',
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

export const PORSCHE_992: CarDef = {
  id: 'porsche-992',
  make: 'Porsche',
  model: '911 Carrera 4S (992)',
  years: '2019 on',
  modelUrl: '/models/porsche-911-carrera-4s.glb',
  modelCredit: {
    title: '(FREE) Porsche 911 Carrera 4S',
    // The file's metadata names Karol Miklas; Sketchfab lists the model under Lionsharp Studios.
    author: 'Karol Miklas (Lionsharp Studios)',
    authorUrl: 'https://sketchfab.com/lionsharp',
    url: 'https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    changes: 'Turned to face forward, baked wheels, brakes and shadow removed, mount points added, recompressed. Exterior-only model.',
  },
  sizeM: { length: 4.52, width: 1.85, height: 1.3, wheelbase: 2.45, trackFront: 1.59, trackRear: 1.56 },
  factoryWheelId: 'oem-alloy',

  boltCount: 5,
  pcdMm: 130,
  stockOffsetMm: { front: 53, rear: 67 }, // approx

  brakes: {
    front: { discDiameterMm: 350, discThicknessMm: 34, pistons: 6, caliperSide: 'behind' },
    rear: { discDiameterMm: 350, discThicknessMm: 28, pistons: 4, caliperSide: 'ahead' },
  },

  fitments: [
    {
      id: 'stock',
      name: 'Stock staggered',
      note: 'The factory Carrera S setup: 20s front, 21s rear.',
      front: { diameterIn: 20, widthIn: 8.5, offsetMm: 53, tyre: { widthMm: 245, aspect: 35 } },
      rear: { diameterIn: 21, widthIn: 11.5, offsetMm: 67, tyre: { widthMm: 305, aspect: 30 } },
    },
    {
      id: 'square-20',
      name: 'Square 20s',
      note: 'Track-day square setup on wider fronts.',
      front: { diameterIn: 20, widthIn: 9.5, offsetMm: 46, tyre: { widthMm: 265, aspect: 35 } },
      rear: { diameterIn: 20, widthIn: 11, offsetMm: 60, tyre: { widthMm: 295, aspect: 30 } },
    },
  ],

  paints: [
    { id: 'guards-red', name: 'Guards Red', hex: '#c01118', finish: 'gloss' },
    { id: 'carrara-white', name: 'Carrara White Metallic', hex: '#e8e8e2', finish: 'metallic' },
    { id: 'gt-silver', name: 'GT Silver Metallic', hex: '#9fa3a7', finish: 'metallic' },
    { id: 'gentian-blue', name: 'Gentian Blue Metallic', hex: '#17295c', finish: 'metallic' },
    { id: 'racing-yellow', name: 'Racing Yellow', hex: '#e8c21a', finish: 'gloss' },
    { id: 'agate-grey', name: 'Agate Grey Metallic', hex: '#55585c', finish: 'metallic' },
    { id: 'jet-black', name: 'Jet Black Metallic', hex: '#0c0c0e', finish: 'metallic' },
  ],

  caliperColors: [
    { id: 'red', name: 'Red', hex: '#c20d12' },
    { id: 'black', name: 'Black', hex: '#111214' },
    { id: 'yellow', name: 'Yellow (ceramic)', hex: '#f0c400' },
    { id: 'white', name: 'White', hex: '#e8e8e4' },
    { id: 'silver', name: 'Silver', hex: '#a9adb1' },
  ],

  // The source model has no interior meshes, so these only drive the swatches.
  leatherColors: [
    { id: 'black', name: 'Black', hex: '#131313' },
    { id: 'bordeaux', name: 'Bordeaux Red', hex: '#5c1620' },
    { id: 'mojave-beige', name: 'Mojave Beige', hex: '#b4a284' },
  ],

  rideHeightMm: { min: -50, max: 20, step: 5 },

  nodes: {
    paint: ['Plane.002_0', 'Plane.003_0', 'Plane.004_0', 'boot.001_0', 'boot.002_0', 'boot.005_0', 'boot.008_0'],
    glass: ['window_rear_0', 'windshield_0', 'boot.004_0'],
    leather: [],
    mounts: {
      fl: 'mount_wheel_fl',
      fr: 'mount_wheel_fr',
      rl: 'mount_wheel_rl',
      rr: 'mount_wheel_rr',
    },
  },

  engine: {
    name: '3.0 twin-turbo flat-six (9A2 Evo)',
    layout: 'flat',
    cylinders: 6,
    displacementL: 3.0,
    mounting: 'longitudinal',
    position: 'rear',
    aspiration: 'twin-turbo',
    hp: 443, // 450 PS
    torqueNm: 530,
    coverHex: '#1c1d20',
  },
  weightKg: 1565, // approx
  // Hung out behind the rear axle (z = 1.17 in this model), under the deck lid.
  engineBay: { center: [0, 0.45, 1.45], clipY: 0.68, clipZ: 0.95, width: 1.2 },

  lift: { heightM: 1.45, contactM: 0.12, runnerX: 0.62, runnerZ: 0, runnerLength: 1.4 },

  views: [
    {
      id: 'exterior',
      name: 'Exterior',
      position: [-4.5, 1.5, -5.5],
      target: [0, 0.55, 0],
      fov: 34,
      minDistance: 3,
      maxDistance: 10,
      minPolar: 15,
      maxPolar: 88,
    },
    {
      // Rear-engined: the flat-six sits behind the rear axle.
      id: 'engine',
      name: 'Engine bay',
      position: [1.0, 1.9, 3.4],
      target: [0, 0.75, 1.5],
      fov: 38,
      minDistance: 1.2,
      maxDistance: 4,
      minPolar: 5,
      maxPolar: 80,
      note: 'Deck lid lifted away. The flat-six and its bay are stylised stand-ins, sized from the real engine.',
    },
    {
      id: 'interior',
      name: 'Interior',
      position: [-0.37, 0.95, 0.2],
      target: [-0.16, 0.8, -0.65],
      fov: 72,
      minDistance: 0.05,
      maxDistance: 0.05,
      minPolar: 35,
      maxPolar: 140,
      lookAround: true,
      note: 'The source model is exterior-only, so the cabin is a bare shell.',
    },
    {
      id: 'underside',
      name: 'Underside',
      position: [2.2, 0.75, 3.1],
      target: [0, 1.5, 0],
      fov: 50,
      minDistance: 0.9,
      maxDistance: 4.6,
      minPolar: 92,
      maxPolar: 175,
      lift: true,
    },
  ],
};

export const CARS: CarDef[] = [FERRARI_458, PORSCHE_992, ...CIVICS, ...MORE_CARS];
