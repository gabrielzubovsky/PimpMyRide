import type { AxleFitment, BrakeFitment, CameraView, CarDef, Fitment, PaintColor } from './types';

// Every generation of the Honda Civic, as catalogue data. None of them has a
// 3D model yet, so they draw as a translucent outline (modelUrl: null) until
// a model is sourced — same idea as parts existing before their models.
// Sizes, offsets and brake figures are approximate, from memory, and need
// checking against a fitment guide before they are trusted.

/** Shorthand for one axle of a fitment. */
export const ax = (diameterIn: number, widthIn: number, offsetMm: number, tyreWidthMm: number, aspect: number): AxleFitment => ({
  diameterIn,
  widthIn,
  offsetMm,
  tyre: { widthMm: tyreWidthMm, aspect },
});

/** Square setup: same wheel and tyre on both axles. */
export const square = (id: string, name: string, note: string, a: AxleFitment): Fitment => ({
  id,
  name,
  note,
  front: a,
  rear: a,
});

export const brake = (discDiameterMm: number, discThicknessMm: number, pistons: number, caliperSide: BrakeFitment['caliperSide']): BrakeFitment => ({
  discDiameterMm,
  discThicknessMm,
  pistons,
  caliperSide,
});

export const CALIPERS = [
  { id: 'silver', name: 'Silver', hex: '#a9adb1' },
  { id: 'black', name: 'Black', hex: '#111214' },
  { id: 'red', name: 'Red', hex: '#c20d12' },
  { id: 'gold', name: 'Gold', hex: '#c5a233' },
  { id: 'teal', name: 'Teal', hex: '#1f8f85' },
];

export const INTERIORS = [
  { id: 'black', name: 'Black', hex: '#141414' },
  { id: 'gray', name: 'Gray', hex: '#585a5c' },
  { id: 'beige', name: 'Beige', hex: '#b4a284' },
  { id: 'red-black', name: 'Red and black', hex: '#8c1518' },
];

/** Camera presets sized from the car's dimensions. Front of the car is -z. */
export function viewsFor(size: CarDef['sizeM']): CameraView[] {
  const f = size.length / 4.5;
  const headY = size.height * 0.72;
  return [
    {
      id: 'exterior',
      name: 'Exterior',
      position: [-4.5 * f, 1.5, -5.6 * f],
      target: [0, size.height * 0.42, 0],
      fov: 34,
      minDistance: 3 * f,
      maxDistance: 10,
      minPolar: 15,
      maxPolar: 88,
    },
    {
      // Front-engined: the bay is under the bonnet at the nose.
      id: 'engine',
      name: 'Engine bay',
      position: [0.9, 1.85, -(size.length / 2 + 0.5)],
      target: [0, size.height * 0.55, -(size.wheelbase / 2 - 0.1)],
      fov: 38,
      minDistance: 1.2,
      maxDistance: 4,
      minPolar: 5,
      maxPolar: 80,
      note: 'The engine sits under the bonnet. Nothing is modelled in there yet.',
    },
    {
      id: 'interior',
      name: 'Interior',
      position: [-0.35, headY, size.wheelbase * 0.08],
      target: [-0.15, headY - 0.16, -0.75],
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
      position: [2.2 * f, 0.75, 3.1 * f],
      target: [0, 1.5, 0],
      fov: 50,
      minDistance: 0.9,
      maxDistance: 4.6,
      minPolar: 92,
      maxPolar: 175,
      lift: true,
    },
  ];
}

interface CivicGen {
  gen: number;
  chassis: string;
  years: string;
  bodyStyle: string;
  boltCount: number;
  pcdMm: number;
  offsetMm: number;
  /** Length, width, height, wheelbase, front track, rear track, in metres. */
  size: [number, number, number, number, number, number];
  front: BrakeFitment;
  rear: BrakeFitment;
  /** Rear drums drawn as small discs until the generator knows drums. */
  rearIsDrum?: boolean;
  fitments: Fitment[];
  paints: PaintColor[];
  /** Steel wheels from the factory; later gens shipped alloys. */
  steelWheels?: boolean;
  ride: { min: number; max: number };
}

function civic(g: CivicGen): CarDef {
  const [length, width, height, wheelbase, trackFront, trackRear] = g.size;
  const size = { length, width, height, wheelbase, trackFront, trackRear };
  return {
    id: `civic-gen${g.gen}`,
    make: 'Honda',
    model: `Civic (${g.chassis})`,
    years: g.years,
    modelUrl: null,
    credit: `${g.bodyStyle}. No 3D model sourced yet; shown as an outline.`,
    sizeM: size,
    factoryWheelId: g.steelWheels ? 'honda-steel' : 'honda-alloy',
    boltCount: g.boltCount,
    pcdMm: g.pcdMm,
    stockOffsetMm: { front: g.offsetMm, rear: g.offsetMm },
    brakes: { front: g.front, rear: g.rear },
    fitments: g.fitments,
    paints: g.paints,
    caliperColors: CALIPERS,
    leatherColors: INTERIORS,
    rideHeightMm: { min: g.ride.min, max: g.ride.max, step: 5 },
    lift: {
      heightM: 1.45,
      contactM: 0.12,
      runnerX: (trackFront / 2) * 0.78,
      runnerZ: 0,
      runnerLength: wheelbase * 0.55,
    },
    views: viewsFor(size),
  };
}

export const paint = (id: string, name: string, hex: string, finish: PaintColor['finish'] = 'gloss'): PaintColor => ({ id, name, hex, finish });

export const CIVICS: CarDef[] = [
  civic({
    gen: 1,
    chassis: 'SB/SG',
    years: '1972 to 1979',
    bodyStyle: 'The original subcompact hatchback',
    boltCount: 4,
    pcdMm: 120,
    offsetMm: 35,
    size: [3.55, 1.5, 1.32, 2.2, 1.27, 1.24],
    front: brake(221, 10, 1, 'behind'),
    rear: brake(180, 10, 1, 'ahead'),
    rearIsDrum: true,
    steelWheels: true,
    ride: { min: -70, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 12-inch steel wheels.', ax(12, 4, 35, 145, 70)),
      square('classic-13', 'Classic 13s', 'Period-style wide 13s tucked under the arches.', ax(13, 7, 10, 175, 50)),
    ],
    paints: [
      paint('sunlight-yellow', 'Sunlight Yellow', '#e3b83a'),
      paint('tahitian-red', 'Tahitian Red', '#b8341f'),
      paint('morning-mist', 'Morning Mist Blue', '#7fa6b8', 'metallic'),
      paint('cool-white', 'Cool White', '#e9e8e0'),
    ],
  }),
  civic({
    gen: 2,
    chassis: 'SL/SS',
    years: '1979 to 1983',
    bodyStyle: 'Squarer second-generation hatchback',
    boltCount: 4,
    pcdMm: 120,
    offsetMm: 35,
    size: [3.76, 1.58, 1.35, 2.25, 1.32, 1.33],
    front: brake(232, 12, 1, 'behind'),
    rear: brake(180, 10, 1, 'ahead'),
    rearIsDrum: true,
    steelWheels: true,
    ride: { min: -70, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 13-inch steel wheels.', ax(13, 4.5, 35, 155, 80)),
      square('13-wide', 'Wide 13s', 'Wider 13s on a low offset.', ax(13, 7, 15, 185, 60)),
    ],
    paints: [
      paint('rio-red', 'Rio Red', '#b02018'),
      paint('bali-blue', 'Bali Blue', '#2a4d7e', 'metallic'),
      paint('silver-metallic', 'Silver', '#b4b7ba', 'metallic'),
      paint('greek-white', 'Greek White', '#e8e7df'),
    ],
  }),
  civic({
    gen: 3,
    chassis: 'AK/AJ',
    years: '1983 to 1987',
    bodyStyle: 'Wedge-shaped third generation; the first Si',
    boltCount: 4,
    pcdMm: 100,
    offsetMm: 45,
    size: [3.81, 1.63, 1.34, 2.38, 1.4, 1.41],
    front: brake(240, 17, 1, 'behind'),
    rear: brake(200, 10, 1, 'ahead'),
    rearIsDrum: true,
    steelWheels: true,
    ride: { min: -75, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 13s.', ax(13, 5, 45, 175, 70)),
      square('14-sport', 'Sport 14s', 'A size up, as the period tuners ran.', ax(14, 6, 38, 185, 60)),
    ],
    paints: [
      paint('victoria-red', 'Victoria Red', '#b51c1a'),
      paint('greek-white', 'Greek White', '#e8e7df'),
      paint('baltic-blue', 'Baltic Blue', '#1e3a66', 'metallic'),
      paint('black-cm', 'Black', '#131315'),
    ],
  }),
  civic({
    gen: 4,
    chassis: 'EF',
    years: '1987 to 1991',
    bodyStyle: 'Low-slung EF with double wishbones all round',
    boltCount: 4,
    pcdMm: 100,
    offsetMm: 45,
    size: [3.97, 1.67, 1.34, 2.5, 1.44, 1.45],
    front: brake(242, 19, 1, 'behind'),
    rear: brake(239, 10, 1, 'ahead'),
    steelWheels: true,
    ride: { min: -80, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 13s.', ax(13, 5, 45, 175, 70)),
      square('15-track', 'Track 15s', 'The classic lightweight-15 track setup.', ax(15, 6.5, 40, 195, 50)),
    ],
    paints: [
      paint('rio-red', 'Rio Red', '#b02018'),
      paint('polar-white', 'Polar White', '#eae9e1'),
      paint('celestial-blue', 'Celestial Blue Pearl', '#27457e', 'metallic'),
      paint('flint-black', 'Flint Black', '#121214', 'metallic'),
    ],
  }),
  civic({
    gen: 5,
    chassis: 'EG',
    years: '1991 to 1995',
    bodyStyle: 'The EG hatch, a tuning icon',
    boltCount: 4,
    pcdMm: 100,
    offsetMm: 45,
    size: [4.07, 1.7, 1.34, 2.57, 1.47, 1.46],
    front: brake(262, 21, 1, 'behind'),
    rear: brake(239, 10, 1, 'ahead'),
    ride: { min: -80, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 14s.', ax(14, 5.5, 45, 185, 60)),
      square('15-track', 'Track 15s', 'Wide 15s, the time-attack staple.', ax(15, 8, 35, 205, 50)),
      square('16-show', 'Show 16s', 'Sixteens on a stretched tyre.', ax(16, 7, 38, 205, 40)),
    ],
    paints: [
      paint('milano-red', 'Milano Red', '#b3131b'),
      paint('frost-white', 'Frost White', '#e8eae6'),
      paint('captiva-blue', 'Captiva Blue Pearl', '#1b2f6b', 'metallic'),
      paint('tahitian-green', 'Tahitian Green Pearl', '#1f4a3c', 'metallic'),
      paint('granada-black', 'Granada Black Pearl', '#121214', 'metallic'),
    ],
  }),
  civic({
    gen: 6,
    chassis: 'EK',
    years: '1995 to 2000',
    bodyStyle: 'The EK; home of the EK9 Type R',
    boltCount: 4,
    pcdMm: 100,
    offsetMm: 45,
    size: [4.18, 1.7, 1.37, 2.62, 1.47, 1.46],
    front: brake(262, 21, 1, 'behind'),
    rear: brake(239, 10, 1, 'ahead'),
    ride: { min: -80, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 14s.', ax(14, 5.5, 45, 185, 65)),
      square('15-track', 'Track 15s', 'Wide 15s, Type R style.', ax(15, 8, 35, 205, 50)),
      square('16-show', 'Show 16s', 'Sixteens on a stretched tyre.', ax(16, 7, 38, 205, 40)),
    ],
    paints: [
      paint('championship-white', 'Championship White', '#ece9dd'),
      paint('milano-red', 'Milano Red', '#b3131b'),
      paint('electron-blue', 'Electron Blue Pearl', '#1546a0', 'metallic'),
      paint('flamenco-black', 'Flamenco Black Pearl', '#0f0f12', 'metallic'),
      paint('vogue-silver', 'Vogue Silver', '#b9bcc0', 'metallic'),
    ],
  }),
  civic({
    gen: 7,
    chassis: 'EM/EP',
    years: '2000 to 2005',
    bodyStyle: 'Seventh generation; EP3 Type R hatch',
    boltCount: 4,
    pcdMm: 100,
    offsetMm: 45,
    size: [4.29, 1.69, 1.42, 2.62, 1.47, 1.46],
    front: brake(262, 21, 1, 'behind'),
    rear: brake(239, 10, 1, 'ahead'),
    ride: { min: -70, max: 30 },
    fitments: [
      square('stock', 'Stock size', 'Factory 15s.', ax(15, 6, 45, 195, 60)),
      square('17-street', 'Street 17s', 'Seventeens on a 40-series tyre.', ax(17, 7, 42, 205, 40)),
    ],
    paints: [
      paint('taffeta-white', 'Taffeta White', '#ebeae2'),
      paint('satin-silver', 'Satin Silver', '#b9babd', 'metallic'),
      paint('nighthawk-black', 'Nighthawk Black Pearl', '#101013', 'metallic'),
      paint('vivid-blue', 'Vivid Blue Pearl', '#1a4fae', 'metallic'),
    ],
  }),
  civic({
    gen: 8,
    chassis: 'FA/FG',
    years: '2005 to 2011',
    bodyStyle: 'Eighth generation with the two-tier dash',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: 45,
    size: [4.49, 1.75, 1.44, 2.7, 1.5, 1.53],
    front: brake(282, 23, 1, 'behind'),
    rear: brake(260, 10, 1, 'ahead'),
    ride: { min: -65, max: 25 },
    fitments: [
      square('stock', 'Stock size', 'Factory 16s.', ax(16, 6.5, 45, 205, 55)),
      square('18-street', 'Street 18s', 'Eighteens on a 40-series tyre.', ax(18, 7.5, 45, 225, 40)),
    ],
    paints: [
      paint('taffeta-white', 'Taffeta White', '#ebeae2'),
      paint('rallye-red', 'Rallye Red', '#c3131c'),
      paint('dyno-blue', 'Dyno Blue Pearl', '#1d53b5', 'metallic'),
      paint('galaxy-gray', 'Galaxy Gray', '#5a5e62', 'metallic'),
      paint('crystal-black', 'Crystal Black Pearl', '#0d0d10', 'metallic'),
    ],
  }),
  civic({
    gen: 9,
    chassis: 'FB',
    years: '2011 to 2015',
    bodyStyle: 'Ninth-generation sedan and coupe',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: 45,
    size: [4.55, 1.75, 1.43, 2.67, 1.52, 1.54],
    front: brake(282, 23, 1, 'behind'),
    rear: brake(260, 10, 1, 'ahead'),
    ride: { min: -65, max: 25 },
    fitments: [
      square('stock', 'Stock size', 'Factory 16s.', ax(16, 6.5, 45, 205, 55)),
      square('18-street', 'Street 18s', 'Eighteens on a 40-series tyre.', ax(18, 7.5, 45, 225, 40)),
    ],
    paints: [
      paint('taffeta-white', 'Taffeta White', '#ebeae2'),
      paint('rallye-red', 'Rallye Red', '#c3131c'),
      paint('dyno-blue', 'Dyno Blue Pearl', '#1d53b5', 'metallic'),
      paint('polished-metal', 'Polished Metal', '#7c8084', 'metallic'),
      paint('crystal-black', 'Crystal Black Pearl', '#0d0d10', 'metallic'),
    ],
  }),
  civic({
    gen: 10,
    chassis: 'FC/FK',
    years: '2015 to 2021',
    bodyStyle: 'Tenth generation; FK8 Type R',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: 45,
    size: [4.63, 1.8, 1.42, 2.7, 1.55, 1.56],
    front: brake(282, 23, 1, 'behind'),
    rear: brake(280, 10, 1, 'ahead'),
    ride: { min: -60, max: 25 },
    fitments: [
      square('stock', 'Stock size', 'Factory 17s.', ax(17, 7, 45, 215, 50)),
      square('18-wide', 'Wide 18s', 'Square wide 18s, the grip setup.', ax(18, 9.5, 38, 265, 35)),
      square('type-r-20', 'Type R 20s', 'The FK8 Type R size.', ax(20, 8.5, 60, 245, 30)),
    ],
    paints: [
      paint('championship-white', 'Championship White', '#ece9dd'),
      paint('rallye-red', 'Rallye Red', '#c3131c'),
      paint('aegean-blue', 'Aegean Blue Metallic', '#2457a5', 'metallic'),
      paint('sonic-gray', 'Sonic Gray Pearl', '#7f8b8e', 'metallic'),
      paint('crystal-black', 'Crystal Black Pearl', '#0d0d10', 'metallic'),
    ],
  }),
  civic({
    gen: 11,
    chassis: 'FE/FL',
    years: '2021 on',
    bodyStyle: 'Eleventh generation; FL5 Type R',
    boltCount: 5,
    pcdMm: 114.3,
    offsetMm: 45,
    size: [4.67, 1.8, 1.4, 2.74, 1.56, 1.6],
    front: brake(312, 25, 1, 'behind'),
    rear: brake(280, 11, 1, 'ahead'),
    ride: { min: -60, max: 25 },
    fitments: [
      square('stock', 'Stock size', 'Factory 17s.', ax(17, 7, 45, 215, 55)),
      square('18-sport', 'Sport 18s', 'The Si and Sport size.', ax(18, 8, 45, 235, 40)),
      square('type-r-19', 'Type R 19s', 'The FL5 Type R size.', ax(19, 9.5, 60, 265, 30)),
    ],
    paints: [
      paint('championship-white', 'Championship White', '#ece9dd'),
      paint('boost-blue', 'Boost Blue Pearl', '#2a7bd2', 'metallic'),
      paint('rallye-red', 'Rallye Red', '#c3131c'),
      paint('sonic-gray', 'Sonic Gray Pearl', '#7f8b8e', 'metallic'),
      paint('platinum-white', 'Platinum White Pearl', '#e9eae6', 'metallic'),
      paint('crystal-black', 'Crystal Black Pearl', '#0d0d10', 'metallic'),
    ],
  }),
];
