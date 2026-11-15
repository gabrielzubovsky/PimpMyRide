import { ax, brake, CALIPERS, INTERIORS, paint, square, viewsFor } from './civics';
import type { AxleFitment, BrakeFitment, CarDef, Fitment, PaintColor } from './types';

// Ten more cars, one per marque, picked from a survey of downloadable
// Sketchfab models (see docs/sketchfab-cars.md). Every pick is CC Attribution,
// so it only needs crediting. The models are not downloaded yet — that needs a
// free logged-in Sketchfab account — so modelUrl stays null and each credit
// carries the download link. All dimensions, offsets and brake figures are
// approximate, from general knowledge, and need checking against a workshop
// manual or fitment guide before they are trusted — same spirit as the
// verified: false flags in the wheel catalogue.

/** Staggered setup: different wheel or tyre front and rear. */
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
  /** The Sketchfab model chosen for this car, with author, licence and link. */
  credit: string;
  boltCount: number;
  pcdMm: number;
  offsetMm: { front: number; rear: number };
  /** Length, width, height, wheelbase, front track, rear track, in metres. */
  size: [number, number, number, number, number, number];
  front: BrakeFitment;
  rear: BrakeFitment;
  /** Rear- and mid-engined cars get the engine-bay camera at the tail. */
  engineAt?: 'front' | 'rear';
  fitments: Fitment[];
  paints: PaintColor[];
  ride: { min: number; max: number };
}

function car(c: SurveyCar): CarDef {
  const [length, width, height, wheelbase, trackFront, trackRear] = c.size;
  const size = { length, width, height, wheelbase, trackFront, trackRear };
  const views = viewsFor(size).map((v) =>
    v.id === 'engine' && c.engineAt === 'rear'
      ? {
          ...v,
          // Mirror the front-engined preset to the tail of the car.
          position: [0.9, 1.85, length / 2 + 0.5] as [number, number, number],
          target: [0, height * 0.55, wheelbase / 2 - 0.1] as [number, number, number],
          note: 'The engine sits behind the cabin. Nothing is modelled in there yet.',
        }
      : v,
  );
  return {
    id: c.id,
    make: c.make,
    model: c.model,
    years: c.years,
    modelUrl: null,
    credit: c.credit,
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
    views,
  };
}

export const MORE_CARS: CarDef[] = [
  car({
    id: 'toyota-supra-a80',
    make: 'Toyota',
    model: 'Supra (A80)',
    years: '1993 to 2002',
    credit: 'Sketchfab: "Toyota Supra MK IV (1994)" by Martin Trafas, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-eb9bb1eb41db431cb078088ae1ce45f8',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 50, rear: 50 }, // approx
    size: [4.51, 1.81, 1.27, 2.55, 1.52, 1.53], // approx
    front: brake(323, 30, 4, 'behind'), // approx, twin-turbo spec
    rear: brake(324, 20, 2, 'ahead'), // approx
    ride: { min: -60, max: 20 },
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
    credit: 'Sketchfab: "02\' Nissan Skyline R34 GT-R" by DRIVER-FIRE, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-14bee030e5d847b7ad16be3a28459222',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 30, rear: 30 }, // approx
    size: [4.6, 1.79, 1.36, 2.67, 1.48, 1.49], // approx
    front: brake(324, 30, 4, 'behind'), // approx, factory Brembo
    rear: brake(322, 22, 2, 'ahead'), // approx
    ride: { min: -55, max: 20 },
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
    credit: 'Sketchfab: "1993_mazda_rx-7" by 007, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-8b828b5c888c43a1895228d48fe50c97',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 50, rear: 50 }, // approx
    size: [4.29, 1.76, 1.23, 2.43, 1.46, 1.46], // approx
    front: brake(294, 22, 4, 'behind'), // approx
    rear: brake(294, 18, 1, 'ahead'), // approx
    ride: { min: -55, max: 20 },
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
    credit: 'Sketchfab: "Subaru Impreza WRX STi Version VI (GC8)" by Mona x Supercars, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-457f01e7e8d14b088e3f092c1be9e75c',
    boltCount: 5,
    pcdMm: 100,
    offsetMm: { front: 53, rear: 53 }, // approx
    size: [4.35, 1.69, 1.41, 2.52, 1.47, 1.47], // approx
    front: brake(294, 24, 4, 'behind'), // approx
    rear: brake(290, 18, 2, 'ahead'), // approx
    ride: { min: -60, max: 35 },
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
    credit: 'Sketchfab: "[FREE] BMW M3 E30" by Martin Trafas, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-ac3c7013434e403e8faff87948caf422',
    boltCount: 5,
    pcdMm: 120,
    offsetMm: { front: 25, rear: 25 }, // approx
    size: [4.36, 1.68, 1.37, 2.57, 1.41, 1.42], // approx
    front: brake(280, 25, 1, 'behind'), // approx
    rear: brake(282, 10, 1, 'ahead'), // approx
    ride: { min: -55, max: 25 },
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
    credit: 'Sketchfab: "1984 Mercedes 190E" by Dave Love SketchFab, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-dc0799500bc4478296514b25a6541282',
    boltCount: 5,
    pcdMm: 112,
    offsetMm: { front: 49, rear: 49 }, // approx
    size: [4.42, 1.68, 1.39, 2.67, 1.44, 1.42], // approx
    front: brake(284, 22, 1, 'behind'), // approx
    rear: brake(258, 9, 1, 'ahead'), // approx
    ride: { min: -55, max: 25 },
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
    credit: 'Sketchfab: "1989 Porsche 911 (964) Carrera 4" by 007, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-22edb81d9ccf46c09a1add7a9ebda2c0',
    boltCount: 5,
    pcdMm: 130,
    offsetMm: { front: 52, rear: 52 }, // approx
    size: [4.25, 1.65, 1.32, 2.27, 1.38, 1.37], // approx
    front: brake(298, 28, 4, 'behind'), // approx
    rear: brake(299, 24, 4, 'ahead'), // approx
    engineAt: 'rear',
    ride: { min: -40, max: 20 },
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
    credit: 'Sketchfab: "Volkswagen Golf GTI 1976" by geevisual55, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-4ab00bf79f2b413c8e89fb7ff5470249',
    boltCount: 4,
    pcdMm: 100,
    offsetMm: { front: 38, rear: 38 }, // approx
    size: [3.82, 1.63, 1.39, 2.4, 1.39, 1.36], // approx
    front: brake(239, 10, 1, 'behind'), // approx
    rear: brake(180, 10, 1, 'ahead'), // approx, rear drums drawn as discs
    ride: { min: -60, max: 25 },
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
    credit: 'Sketchfab: "1965 Ford Mustang Convertible" by Kristian LaGrange, CC Attribution. Convertible body. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-05f2a294087541ab82f681136d134344',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: { front: 0, rear: 0 }, // approx
    size: [4.61, 1.73, 1.3, 2.74, 1.42, 1.42], // approx
    front: brake(251, 10, 1, 'behind'), // approx, the optional front discs
    rear: brake(254, 10, 1, 'ahead'), // approx, rear drums drawn as discs
    ride: { min: -50, max: 30 },
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
    model: 'Countach 5000 QV',
    years: '1985 to 1988',
    credit: 'Sketchfab: "Lamborghini Countach 5000QV" by Randomness, CC Attribution. Not downloaded yet; shown as an outline. https://sketchfab.com/3d-models/none-2f02b54e01fc428e8b19759c5970f882',
    boltCount: 5,
    pcdMm: 120,
    offsetMm: { front: 23, rear: -10 }, // approx
    size: [4.14, 2.0, 1.07, 2.45, 1.54, 1.61], // approx
    front: brake(300, 28, 4, 'behind'), // approx
    rear: brake(284, 22, 4, 'ahead'), // approx
    engineAt: 'rear',
    ride: { min: -30, max: 20 },
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
