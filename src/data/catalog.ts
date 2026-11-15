// Parts catalogue beyond wheels. Every entry is a real product from a real
// brand (see brands.ts). Most have no 3D model or generator yet — a part can
// exist in the catalogue first and gain a model later. Prices and claimed
// gains are rough figures from memory, so everything is `verified: false`
// until checked against a seller.

export type PartCategoryId =
  | 'body-kit'
  | 'aero'
  | 'hood'
  | 'diffuser'
  | 'suspension'
  | 'brake-kit'
  | 'exhaust'
  | 'intake'
  | 'forced-induction'
  | 'cooling'
  | 'strut-brace'
  | 'engine-cover'
  | 'nitrous'
  | 'engine-management'
  | 'fluids'
  | 'seats'
  | 'harness'
  | 'steering'
  | 'roll-cage'
  | 'gauges'
  | 'audio';

export interface PartCategory {
  id: PartCategoryId;
  name: string;
  /** Which part of the build sheet this belongs to. */
  group: 'exterior' | 'performance' | 'interior';
  /** What counts as "no change" in this category. */
  stockLabel: string;
}

export const CATEGORIES: PartCategory[] = [
  { id: 'body-kit', name: 'Body kit', group: 'exterior', stockLabel: 'Factory body' },
  { id: 'aero', name: 'Spoilers and aero', group: 'exterior', stockLabel: 'No added aero' },
  { id: 'hood', name: 'Hood', group: 'exterior', stockLabel: 'Factory hood' },
  { id: 'diffuser', name: 'Rear diffuser', group: 'exterior', stockLabel: 'Factory bumper' },
  { id: 'suspension', name: 'Suspension', group: 'performance', stockLabel: 'Factory suspension' },
  { id: 'brake-kit', name: 'Brake kit', group: 'performance', stockLabel: 'Factory brakes' },
  { id: 'exhaust', name: 'Exhaust', group: 'performance', stockLabel: 'Factory exhaust' },
  { id: 'intake', name: 'Intake', group: 'performance', stockLabel: 'Factory airbox' },
  { id: 'forced-induction', name: 'Turbo and supercharger', group: 'performance', stockLabel: 'Naturally aspirated' },
  { id: 'cooling', name: 'Cooling', group: 'performance', stockLabel: 'Factory cooling' },
  { id: 'strut-brace', name: 'Strut brace', group: 'performance', stockLabel: 'None' },
  { id: 'engine-cover', name: 'Engine cover', group: 'performance', stockLabel: 'Factory cover' },
  { id: 'nitrous', name: 'Nitrous', group: 'performance', stockLabel: 'None' },
  { id: 'engine-management', name: 'Engine management', group: 'performance', stockLabel: 'Factory ECU' },
  { id: 'fluids', name: 'Oils and fluids', group: 'performance', stockLabel: 'Factory fill' },
  { id: 'seats', name: 'Seats', group: 'interior', stockLabel: 'Factory seats' },
  { id: 'harness', name: 'Harnesses', group: 'interior', stockLabel: 'Factory belts' },
  { id: 'steering', name: 'Steering wheel', group: 'interior', stockLabel: 'Factory wheel' },
  { id: 'roll-cage', name: 'Roll cage', group: 'interior', stockLabel: 'None' },
  { id: 'gauges', name: 'Gauges', group: 'interior', stockLabel: 'Factory cluster' },
  { id: 'audio', name: 'Audio', group: 'interior', stockLabel: 'Factory audio' },
];

/** Manufacturer-claimed changes. Positive hp and nm add power and torque, negative kg saves weight. */
export interface PartClaims {
  hp?: number;
  nm?: number;
  kg?: number;
}

/** One axle of a big-brake kit. The caliper side stays as the car has it. */
export interface BrakeKitAxle {
  discDiameterMm: number;
  discThicknessMm: number;
  pistons: number;
}

/**
 * How to draw this part in 3D. Parts are procedural, built from real published
 * dimensions, in the same spirit as the wheels: close, not millimetre-perfect.
 * A part without a render is catalogue-only until it gains one, or until a
 * proper model is sourced (body kits and seats need sourced models).
 */
export type PartRender =
  | { kind: 'wing'; spanMm: number; chordMm: number; heightMm: number; mount: 'swan' | 'post' }
  | {
      kind: 'exhaust';
      /** What part of the system is replaced, and whether it has valves. */
      system: 'cat-back' | 'axle-back' | 'turbo-back' | 'valvetronic' | 'straight-pipe';
      layout: 'quad' | 'dual' | 'single' | 'center-triple';
      tipDiameterMm: number;
      finish: 'titanium' | 'steel' | 'black' | 'burnt';
    }
  | { kind: 'brakes'; front: BrakeKitAxle; rear: BrakeKitAxle }
  | { kind: 'coilovers'; springHex: string; bodyHex: string; air?: boolean }
  | { kind: 'bottle'; hex: string }
  | { kind: 'cage'; hex: string }
  | { kind: 'gauges'; pods: number; podDiameterMm: number; screen?: boolean }
  | { kind: 'seat'; shellHex: string; padHex: string }
  | { kind: 'steering'; diameterMm: number; dishMm: number; rimHex: string; spokeHex: string }
  | { kind: 'harness'; strapHex: string }
  | { kind: 'bodykit'; widebody: boolean; carbon: boolean }
  | { kind: 'hood'; vented: boolean }
  | { kind: 'diffuser'; fins: number }
  | {
      kind: 'intake';
      /** A cone filter on a tube, or a carbon housing round the filter. */
      style: 'cone' | 'carbon';
      pipeHex: string;
      filterHex: string;
    }
  /** Replaces any factory turbos. Inducer is the compressor wheel's inlet diameter. */
  | { kind: 'turbo'; count: 1 | 2; inducerMm: number }
  | { kind: 'supercharger'; style: 'twin-screw' | 'centrifugal' }
  | { kind: 'radiator' }
  | { kind: 'intercooler' }
  /** Bar across the strut towers; a third leg runs back to the firewall. */
  | { kind: 'strut-brace'; legs: 2 | 3; barHex: string; plateHex: string }
  /** Carbon cover over the top of the engine. */
  | { kind: 'engine-cover' };

export interface PartProduct {
  id: string;
  category: PartCategoryId;
  brand: string;
  model: string;
  /** One line on what it is. */
  blurb: string;
  priceUsd: number;
  /**
   * How this part relates to the selected car:
   * 'this-car' is sold for it, 'universal' fits most cars,
   * 'needs-adapting' is made for other cars and would need fabrication.
   */
  fit: 'this-car' | 'universal' | 'needs-adapting';
  /** Ids of the cars the part is made for. When set, it decides the fit per car. */
  cars?: string[];
  claims?: PartClaims;
  /** How to draw it. Missing means not in 3D yet. */
  render?: PartRender;
  verified: boolean;
}

export const CATALOG: PartProduct[] = [
  // ----- Body kits (the 458 really has kits from all three) -----
  {
    id: 'lb-works-458',
    category: 'body-kit',
    brand: 'Liberty Walk',
    model: 'LB-Works 458 widebody',
    blurb: 'Riveted over-fenders, front diffuser and ducktail.',
    priceUsd: 19000,
    fit: 'this-car',
    render: { kind: 'bodykit', widebody: true, carbon: false },
    verified: false,
  },
  {
    id: 'novitec-rosso-458',
    category: 'body-kit',
    brand: 'Novitec',
    model: 'Rosso aero kit',
    blurb: 'Subtle carbon front lip, skirts and rear diffuser.',
    priceUsd: 12000,
    fit: 'this-car',
    render: { kind: 'bodykit', widebody: false, carbon: true },
    verified: false,
  },
  {
    id: 'mansory-siracusa',
    category: 'body-kit',
    brand: 'Mansory',
    model: 'Siracusa conversion',
    blurb: 'Full carbon body conversion with new bumpers and bonnet.',
    priceUsd: 48000,
    fit: 'this-car',
    claims: { kg: -40 },
    render: { kind: 'bodykit', widebody: false, carbon: true },
    verified: false,
  },
  {
    id: 'pandem-widebody',
    category: 'body-kit',
    brand: 'Pandem / Rocket Bunny (TRA Kyoto)',
    model: 'Widebody kit',
    blurb: 'Kei Miura riveted over-fender kit.',
    priceUsd: 5500,
    fit: 'needs-adapting',
    render: { kind: 'bodykit', widebody: true, carbon: false },
    verified: false,
  },
  {
    id: 'duraflex-kit',
    category: 'body-kit',
    brand: 'Duraflex (Extreme Dimensions)',
    model: 'Fibreglass body kit',
    blurb: 'Budget bumpers and skirts.',
    priceUsd: 1400,
    fit: 'needs-adapting',
    render: { kind: 'bodykit', widebody: false, carbon: false },
    verified: false,
  },

  // ----- Spoilers and aero -----
  {
    id: 'voltex-type7',
    category: 'aero',
    brand: 'Voltex',
    model: 'Type 7 GT wing, 1700 mm',
    blurb: 'Time-attack swan-neck carbon wing.',
    priceUsd: 2300,
    fit: 'universal',
    render: { kind: 'wing', spanMm: 1700, chordMm: 300, heightMm: 250, mount: 'swan' },
    verified: false,
  },
  {
    id: 'apr-gtc500',
    category: 'aero',
    brand: 'APR Performance',
    model: 'GTC-500 adjustable wing',
    blurb: '71-inch carbon aerofoil on chassis mounts.',
    priceUsd: 1900,
    fit: 'universal',
    render: { kind: 'wing', spanMm: 1800, chordMm: 290, heightMm: 230, mount: 'post' },
    verified: false,
  },
  {
    id: 'seibon-hood',
    category: 'hood',
    brand: 'Seibon Carbon',
    model: 'Carbon-fibre vented hood',
    blurb: 'Replaces the steel bonnet, saves weight.',
    priceUsd: 1200,
    fit: 'needs-adapting',
    claims: { kg: -9 },
    render: { kind: 'hood', vented: true },
    verified: false,
  },
  {
    id: 'varis-diffuser',
    category: 'diffuser',
    brand: 'Varis',
    model: 'Carbon rear diffuser',
    blurb: 'Time-attack rear diffuser with fins.',
    priceUsd: 2100,
    fit: 'needs-adapting',
    render: { kind: 'diffuser', fins: 4 },
    verified: false,
  },

  // ----- Suspension -----
  {
    id: 'kw-v4',
    category: 'suspension',
    brand: 'KW Suspensions',
    model: 'Variant 4 coilovers',
    blurb: 'Three-way adjustable, keeps the factory lift system.',
    priceUsd: 6000,
    fit: 'this-car',
    render: { kind: 'coilovers', springHex: '#7b2fbe', bodyHex: '#b9bcc0' },
    verified: false,
  },
  {
    id: 'ohlins-rt',
    category: 'suspension',
    brand: 'Öhlins',
    model: 'Road & Track DFV coilovers',
    blurb: 'Dual-flow valve dampers, 30-click adjustment.',
    priceUsd: 2900,
    fit: 'universal',
    render: { kind: 'coilovers', springHex: '#e6c21a', bodyHex: '#caa84a' },
    verified: false,
  },
  {
    id: 'hks-hipermax',
    category: 'suspension',
    brand: 'HKS',
    model: 'Hipermax IV GT coilovers',
    blurb: 'Single-tube JDM street coilovers.',
    priceUsd: 2200,
    fit: 'needs-adapting',
    render: { kind: 'coilovers', springHex: '#6a3bb5', bodyHex: '#1a1a1c' },
    verified: false,
  },
  {
    id: 'tein-flex-z',
    category: 'suspension',
    brand: 'TEIN',
    model: 'Flex Z coilovers',
    blurb: 'Budget full-length adjustable kit.',
    priceUsd: 1000,
    fit: 'needs-adapting',
    render: { kind: 'coilovers', springHex: '#1f9e4b', bodyHex: '#20242a' },
    verified: false,
  },
  {
    id: 'eibach-pro-kit',
    category: 'suspension',
    brand: 'Eibach',
    model: 'Pro-Kit lowering springs',
    blurb: 'Drops the car about 25 mm on factory dampers.',
    priceUsd: 450,
    fit: 'this-car',
    render: { kind: 'coilovers', springHex: '#c3131c', bodyHex: '#2a2d31' },
    verified: false,
  },
  {
    id: 'airlift-3p',
    category: 'suspension',
    brand: 'Air Lift Performance',
    model: '3P air ride',
    blurb: 'Air struts with height presets from the phone.',
    priceUsd: 4800,
    fit: 'universal',
    render: { kind: 'coilovers', springHex: '#17181a', bodyHex: '#2a2d31', air: true },
    verified: false,
  },

  // ----- Brake kits -----
  {
    id: 'brembo-gt6',
    category: 'brake-kit',
    brand: 'Brembo',
    model: 'GT 6-piston big-brake kit, 380 mm',
    blurb: 'Monobloc calipers on two-piece discs.',
    priceUsd: 5600,
    fit: 'universal',
    render: { kind: 'brakes', front: { discDiameterMm: 380, discThicknessMm: 34, pistons: 6 }, rear: { discDiameterMm: 345, discThicknessMm: 28, pistons: 4 } },
    verified: false,
  },
  {
    id: 'ap-radical',
    category: 'brake-kit',
    brand: 'AP Racing',
    model: 'Radi-CAL competition kit',
    blurb: 'Asymmetric forged calipers, J-hook discs.',
    priceUsd: 7200,
    fit: 'universal',
    render: { kind: 'brakes', front: { discDiameterMm: 372, discThicknessMm: 36, pistons: 6 }, rear: { discDiameterMm: 357, discThicknessMm: 32, pistons: 4 } },
    verified: false,
  },
  {
    id: 'stoptech-st60',
    category: 'brake-kit',
    brand: 'StopTech',
    model: 'ST-60 trophy kit, 355 mm',
    blurb: 'Six-piston street and track kit.',
    priceUsd: 4300,
    fit: 'universal',
    render: { kind: 'brakes', front: { discDiameterMm: 355, discThicknessMm: 32, pistons: 6 }, rear: { discDiameterMm: 345, discThicknessMm: 28, pistons: 4 } },
    verified: false,
  },
  {
    id: 'wilwood-superlite',
    category: 'brake-kit',
    brand: 'Wilwood',
    model: 'Superlite 6R kit',
    blurb: 'Light forged calipers at a club-racing price.',
    priceUsd: 2500,
    fit: 'universal',
    render: { kind: 'brakes', front: { discDiameterMm: 355, discThicknessMm: 32, pistons: 6 }, rear: { discDiameterMm: 335, discThicknessMm: 28, pistons: 4 } },
    verified: false,
  },
  {
    id: 'ebc-yellowstuff',
    category: 'brake-kit',
    brand: 'EBC Brakes',
    model: 'Yellowstuff pads, all round',
    blurb: 'Fast-street pad compound on the factory calipers.',
    priceUsd: 260,
    fit: 'this-car',
    verified: false,
  },

  // ----- Exhaust -----
  {
    id: 'akrapovic-evo',
    category: 'exhaust',
    brand: 'Akrapovič',
    model: 'Evolution Line titanium',
    blurb: 'Full titanium system with carbon tips.',
    priceUsd: 9000,
    fit: 'this-car',
    claims: { hp: 12, kg: -14 },
    render: { kind: 'exhaust', system: 'cat-back', layout: 'quad', tipDiameterMm: 110, finish: 'titanium' },
    verified: false,
  },
  {
    id: 'fi-valvetronic',
    category: 'exhaust',
    brand: 'Fi Exhaust',
    model: 'Valvetronic cat-back',
    blurb: 'Remote-controlled valves, quad tips.',
    priceUsd: 5400,
    fit: 'this-car',
    claims: { hp: 9 },
    render: { kind: 'exhaust', system: 'valvetronic', layout: 'quad', tipDiameterMm: 114, finish: 'steel' },
    verified: false,
  },
  {
    id: 'armytrix-valved',
    category: 'exhaust',
    brand: 'Armytrix',
    model: 'Valvetronic cat-back',
    blurb: 'App-controlled valved exhaust.',
    priceUsd: 4900,
    fit: 'this-car',
    claims: { hp: 8 },
    render: { kind: 'exhaust', system: 'valvetronic', layout: 'quad', tipDiameterMm: 102, finish: 'black' },
    verified: false,
  },
  {
    id: 'borla-atak',
    category: 'exhaust',
    brand: 'Borla',
    model: 'ATAK cat-back',
    blurb: 'The loudest Borla compound.',
    priceUsd: 1500,
    fit: 'needs-adapting',
    claims: { hp: 6 },
    render: { kind: 'exhaust', system: 'axle-back', layout: 'dual', tipDiameterMm: 102, finish: 'steel' },
    verified: false,
  },
  {
    id: 'tomei-expreme',
    category: 'exhaust',
    brand: 'Tomei',
    model: 'Expreme Ti single-exit',
    blurb: 'Featherweight titanium drift pipe.',
    priceUsd: 950,
    fit: 'needs-adapting',
    claims: { hp: 7, kg: -12 },
    render: { kind: 'exhaust', system: 'cat-back', layout: 'single', tipDiameterMm: 110, finish: 'burnt' },
    verified: false,
  },

  {
    id: 'magnaflow-competition',
    category: 'exhaust',
    brand: 'MagnaFlow',
    model: 'Competition axle-back',
    blurb: 'Stainless axle-back, deep tone, keeps the mid-pipe.',
    priceUsd: 900,
    fit: 'needs-adapting',
    claims: { hp: 4 },
    render: { kind: 'exhaust', system: 'axle-back', layout: 'dual', tipDiameterMm: 114, finish: 'steel' },
    verified: false,
  },
  {
    id: 'hks-hipower',
    category: 'exhaust',
    brand: 'HKS',
    model: 'Hi-Power cat-back',
    blurb: 'The classic JDM single-canister cat-back.',
    priceUsd: 800,
    fit: 'needs-adapting',
    claims: { hp: 6 },
    render: { kind: 'exhaust', system: 'cat-back', layout: 'single', tipDiameterMm: 124, finish: 'burnt' },
    verified: false,
  },
  {
    id: 'vibrant-straight-pipe',
    category: 'exhaust',
    brand: 'Vibrant Performance',
    model: 'Straight-pipe kit',
    blurb: 'Muffler and resonator delete. Very, very loud.',
    priceUsd: 350,
    fit: 'universal',
    claims: { hp: 5 },
    render: { kind: 'exhaust', system: 'straight-pipe', layout: 'single', tipDiameterMm: 102, finish: 'steel' },
    verified: false,
  },

  // ----- Intake -----
  {
    id: 'eventuri-carbon',
    category: 'intake',
    brand: 'Eventuri',
    model: 'Carbon intake system',
    blurb: 'Inverted-cone filters in carbon housings.',
    priceUsd: 2700,
    fit: 'this-car',
    claims: { hp: 15 },
    render: { kind: 'intake', style: 'carbon', pipeHex: '#1b1c1e', filterHex: '#c9c2b0' },
    verified: false,
  },
  {
    id: 'kn-typhoon',
    category: 'intake',
    brand: 'K&N',
    model: 'Typhoon cold-air intake',
    blurb: 'Mandrel-bent tube with a washable cone filter.',
    priceUsd: 380,
    fit: 'needs-adapting',
    claims: { hp: 8 },
    render: { kind: 'intake', style: 'cone', pipeHex: '#c9cdd1', filterHex: '#c3131c' },
    verified: false,
  },
  {
    id: 'aem-cai',
    category: 'intake',
    brand: 'AEM',
    model: 'Cold-air intake',
    blurb: 'Wrinkle-red pipe, dry filter.',
    priceUsd: 350,
    fit: 'needs-adapting',
    claims: { hp: 7 },
    render: { kind: 'intake', style: 'cone', pipeHex: '#a3161b', filterHex: '#2a2c30' },
    verified: false,
  },

  // ----- Forced induction -----
  {
    id: 'garrett-g35',
    category: 'forced-induction',
    brand: 'Garrett',
    model: 'G35-900 twin-turbo package',
    blurb: 'Two G-series turbos, lines and manifolds.',
    priceUsd: 9500,
    fit: 'needs-adapting',
    claims: { hp: 320, nm: 380 },
    render: { kind: 'turbo', count: 2, inducerMm: 61 },
    verified: false,
  },
  {
    id: 'precision-6266',
    category: 'forced-induction',
    brand: 'Precision Turbo',
    model: 'Gen2 6266 single-turbo kit',
    blurb: 'Drag-style single turbo conversion.',
    priceUsd: 6800,
    fit: 'needs-adapting',
    claims: { hp: 280, nm: 340 },
    render: { kind: 'turbo', count: 1, inducerMm: 62 },
    verified: false,
  },
  {
    id: 'whipple-30',
    category: 'forced-induction',
    brand: 'Whipple',
    model: '3.0L twin-screw supercharger',
    blurb: 'Positive-displacement blower, instant boost.',
    priceUsd: 8200,
    fit: 'needs-adapting',
    claims: { hp: 250, nm: 300 },
    render: { kind: 'supercharger', style: 'twin-screw' },
    verified: false,
  },
  {
    id: 'hks-gt2',
    category: 'forced-induction',
    brand: 'HKS',
    model: 'GT2 supercharger pro kit',
    blurb: 'Centrifugal blower with HKS intercooling.',
    priceUsd: 8900,
    fit: 'needs-adapting',
    claims: { hp: 200, nm: 190 },
    render: { kind: 'supercharger', style: 'centrifugal' },
    verified: false,
  },

  // ----- Cooling -----
  {
    id: 'csf-coolers',
    category: 'cooling',
    brand: 'CSF',
    model: 'High-performance radiator set',
    blurb: 'All-aluminium cores for track use.',
    priceUsd: 1900,
    fit: 'this-car',
    render: { kind: 'radiator' },
    verified: false,
  },
  {
    id: 'mishimoto-fmic',
    category: 'cooling',
    brand: 'Mishimoto',
    model: 'Front-mount intercooler',
    blurb: 'Bar-and-plate core for boosted builds.',
    priceUsd: 950,
    fit: 'needs-adapting',
    render: { kind: 'intercooler' },
    verified: false,
  },

  // ----- Strut braces -----
  {
    id: 'cusco-os-front',
    category: 'strut-brace',
    brand: 'Cusco',
    model: 'Type OS front strut bar',
    blurb: 'Alloy bar on steel tower brackets, made in versions for most cars.',
    priceUsd: 260,
    fit: 'universal',
    claims: { kg: 2 },
    render: { kind: 'strut-brace', legs: 2, barHex: '#c9cdd1', plateHex: '#2c5fb8' },
    verified: false,
  },
  {
    id: 'ultra-racing-3pt',
    category: 'strut-brace',
    brand: 'Ultra Racing',
    model: '3-point front strut bar',
    blurb: 'Tower-to-tower bar with a third leg back to the firewall.',
    priceUsd: 180,
    fit: 'universal',
    claims: { kg: 3 },
    render: { kind: 'strut-brace', legs: 3, barHex: '#2b62c4', plateHex: '#1b1c1e' },
    verified: false,
  },
  {
    id: 'mugen-strut-bar',
    category: 'strut-brace',
    brand: 'Mugen',
    model: 'Front strut tower bar',
    blurb: 'Honda-only alloy bar.',
    priceUsd: 420,
    fit: 'this-car',
    cars: ['civic-gen6', 'civic-gen7', 'civic-gen8'],
    claims: { kg: 2 },
    render: { kind: 'strut-brace', legs: 2, barHex: '#c9cdd1', plateHex: '#17181a' },
    verified: false,
  },

  // ----- Engine covers -----
  {
    id: 'novitec-458-bay',
    category: 'engine-cover',
    brand: 'Novitec',
    model: 'Carbon engine compartment',
    blurb: 'Carbon panels over the 458 bay and plenum.',
    priceUsd: 6800,
    fit: 'this-car',
    cars: ['ferrari-458-spider'],
    render: { kind: 'engine-cover' },
    verified: false,
  },
  {
    id: 'mugen-coil-cover',
    category: 'engine-cover',
    brand: 'Mugen',
    model: 'Carbon ignition coil cover',
    blurb: 'Covers the K20A coil packs.',
    priceUsd: 350,
    fit: 'this-car',
    cars: ['civic-gen7'],
    render: { kind: 'engine-cover' },
    verified: false,
  },
  {
    id: 'eventuri-engine-cover',
    category: 'engine-cover',
    brand: 'Eventuri',
    model: 'Carbon engine cover',
    blurb: 'Pre-preg carbon, made for specific modern engines.',
    priceUsd: 1300,
    fit: 'needs-adapting',
    render: { kind: 'engine-cover' },
    verified: false,
  },

  // ----- Nitrous -----
  {
    id: 'nos-wet-100',
    category: 'nitrous',
    brand: 'NOS (Nitrous Oxide Systems)',
    model: 'Wet kit, 100-shot',
    blurb: 'The classic blue bottle, wet single-nozzle kit.',
    priceUsd: 750,
    fit: 'universal',
    claims: { hp: 100 },
    render: { kind: 'bottle', hex: '#1f5fd6' },
    verified: false,
  },
  {
    id: 'nx-proton',
    category: 'nitrous',
    brand: 'Nitrous Express',
    model: 'Proton Plus, 75-shot',
    blurb: 'Integrated solenoid plate system.',
    priceUsd: 680,
    fit: 'universal',
    claims: { hp: 75 },
    render: { kind: 'bottle', hex: '#b4b8bc' },
    verified: false,
  },
  {
    id: 'zex-75',
    category: 'nitrous',
    brand: 'ZEX',
    model: 'Perimeter plate, 75-shot',
    blurb: 'Active fuel control wet kit.',
    priceUsd: 620,
    fit: 'universal',
    claims: { hp: 75 },
    render: { kind: 'bottle', hex: '#5b3a8e' },
    verified: false,
  },

  // ----- Engine management -----
  {
    id: 'haltech-elite',
    category: 'engine-management',
    brand: 'Haltech',
    model: 'Elite 2500 standalone ECU',
    blurb: 'Full standalone with flex fuel and boost control.',
    priceUsd: 2500,
    fit: 'universal',
    verified: false,
  },
  {
    id: 'motec-m150',
    category: 'engine-management',
    brand: 'MoTeC',
    model: 'M150 ECU package',
    blurb: 'Pro motorsport ECU with logging.',
    priceUsd: 5200,
    fit: 'universal',
    verified: false,
  },
  {
    id: 'novitec-stage2',
    category: 'engine-management',
    brand: 'Novitec',
    model: 'Stage 2 engine tune',
    blurb: 'Remap with sports cats.',
    priceUsd: 3600,
    fit: 'this-car',
    claims: { hp: 23 },
    verified: false,
  },

  // ----- Fluids -----
  {
    id: 'motul-300v',
    category: 'fluids',
    brand: 'Motul',
    model: '300V 5W-40 service fill',
    blurb: 'Ester-core racing oil, full service.',
    priceUsd: 160,
    fit: 'universal',
    verified: false,
  },
  {
    id: 'repsol-racing',
    category: 'fluids',
    brand: 'Repsol',
    model: 'Racing 10W-50 service fill',
    blurb: 'The MotoGP-livery brand’s race oil.',
    priceUsd: 120,
    fit: 'universal',
    verified: false,
  },
  {
    id: 'castrol-srf',
    category: 'fluids',
    brand: 'Castrol',
    model: 'SRF racing brake fluid',
    blurb: 'The track-day brake fluid benchmark.',
    priceUsd: 90,
    fit: 'universal',
    verified: false,
  },

  // ----- Seats -----
  {
    id: 'recaro-podium',
    category: 'seats',
    brand: 'Recaro',
    model: 'Podium CF, pair',
    blurb: 'Carbon-shell street bucket.',
    priceUsd: 9000,
    fit: 'universal',
    claims: { kg: -14 },
    render: { kind: 'seat', shellHex: '#232426', padHex: '#141414' },
    verified: false,
  },
  {
    id: 'bride-zeta4',
    category: 'seats',
    brand: 'Bride',
    model: 'Zeta IV, pair',
    blurb: 'JDM full bucket in gradation fabric.',
    priceUsd: 3600,
    fit: 'universal',
    claims: { kg: -18 },
    render: { kind: 'seat', shellHex: '#3a3d42', padHex: '#6e1b20' },
    verified: false,
  },
  {
    id: 'sparco-qrt',
    category: 'seats',
    brand: 'Sparco',
    model: 'QRT-R, pair',
    blurb: 'Ultra-light resin-shell buckets.',
    priceUsd: 1900,
    fit: 'universal',
    claims: { kg: -20 },
    render: { kind: 'seat', shellHex: '#1b1c1e', padHex: '#17181a' },
    verified: false,
  },
  {
    id: 'omp-hte-r',
    category: 'seats',
    brand: 'OMP',
    model: 'HTE-R carbon, pair',
    blurb: 'FIA-homologated race seats.',
    priceUsd: 3200,
    fit: 'universal',
    claims: { kg: -16 },
    render: { kind: 'seat', shellHex: '#232426', padHex: '#101113' },
    verified: false,
  },

  // ----- Harnesses -----
  {
    id: 'takata-race6',
    category: 'harness',
    brand: 'Takata',
    model: 'Race 6-point, pair',
    blurb: 'The iconic green harness.',
    priceUsd: 1000,
    fit: 'universal',
    render: { kind: 'harness', strapHex: '#2f9e4f' },
    verified: false,
  },
  {
    id: 'sparco-6pt',
    category: 'harness',
    brand: 'Sparco',
    model: 'Competition 6-point, pair',
    blurb: 'FIA 8853 harnesses.',
    priceUsd: 800,
    fit: 'universal',
    render: { kind: 'harness', strapHex: '#c3131c' },
    verified: false,
  },
  {
    id: 'schroth-profi',
    category: 'harness',
    brand: 'Schroth',
    model: 'Profi II 6-point, pair',
    blurb: 'German FIA harnesses with HANS spec.',
    priceUsd: 950,
    fit: 'universal',
    render: { kind: 'harness', strapHex: '#17181a' },
    verified: false,
  },

  // ----- Steering -----
  {
    id: 'momo-prototipo',
    category: 'steering',
    brand: 'MOMO',
    model: 'Prototipo 350 mm',
    blurb: 'The retro classic, black leather.',
    priceUsd: 350,
    fit: 'universal',
    render: { kind: 'steering', diameterMm: 350, dishMm: 39, rimHex: '#161617', spokeHex: '#c6c9cc' },
    verified: false,
  },
  {
    id: 'nardi-deep-corn',
    category: 'steering',
    brand: 'Nardi',
    model: 'Deep Corn 350 mm',
    blurb: 'Deep-dish Italian leather wheel.',
    priceUsd: 420,
    fit: 'universal',
    render: { kind: 'steering', diameterMm: 350, dishMm: 90, rimHex: '#161617', spokeHex: '#c6c9cc' },
    verified: false,
  },
  {
    id: 'sparco-r383',
    category: 'steering',
    brand: 'Sparco',
    model: 'R383 suede',
    blurb: 'Dished suede competition wheel.',
    priceUsd: 280,
    fit: 'universal',
    render: { kind: 'steering', diameterMm: 330, dishMm: 90, rimHex: '#26262a', spokeHex: '#17181a' },
    verified: false,
  },
  {
    id: 'nrg-quick-release',
    category: 'steering',
    brand: 'NRG Innovations',
    model: 'Quick-release hub, gen 3',
    blurb: 'Pop the wheel off for entry and theft.',
    priceUsd: 140,
    fit: 'universal',
    verified: false,
  },

  // ----- Roll cage -----
  {
    id: 'cusco-safety21',
    category: 'roll-cage',
    brand: 'Cusco',
    model: 'Safety 21 bolt-in cage',
    blurb: 'Chromoly bolt-in cage, dash-escape design.',
    priceUsd: 2000,
    fit: 'needs-adapting',
    claims: { kg: 25 },
    render: { kind: 'cage', hex: '#2a5caa' },
    verified: false,
  },

  // ----- Gauges -----
  {
    id: 'defi-advance',
    category: 'gauges',
    brand: 'Defi',
    model: 'Advance BF gauge set',
    blurb: 'Boost, oil temp and oil pressure pods.',
    priceUsd: 950,
    fit: 'universal',
    render: { kind: 'gauges', pods: 3, podDiameterMm: 60 },
    verified: false,
  },
  {
    id: 'aem-wideband',
    category: 'gauges',
    brand: 'AEM',
    model: 'X-Series wideband gauge',
    blurb: 'Air-fuel ratio in a 52 mm pod.',
    priceUsd: 220,
    fit: 'universal',
    render: { kind: 'gauges', pods: 1, podDiameterMm: 52 },
    verified: false,
  },
  {
    id: 'motec-c125',
    category: 'gauges',
    brand: 'MoTeC',
    model: 'C125 dash logger',
    blurb: 'Colour race dash replacing the cluster.',
    priceUsd: 2900,
    fit: 'universal',
    render: { kind: 'gauges', pods: 0, podDiameterMm: 0, screen: true },
    verified: false,
  },

  // ----- Audio -----
  {
    id: 'alpine-halo9',
    category: 'audio',
    brand: 'Alpine',
    model: 'Halo9 head unit',
    blurb: '9-inch floating screen with CarPlay.',
    priceUsd: 1100,
    fit: 'universal',
    verified: false,
  },
  {
    id: 'focal-utopia',
    category: 'audio',
    brand: 'Focal',
    model: 'Utopia M component speakers',
    blurb: 'French reference two-way fronts.',
    priceUsd: 4000,
    fit: 'universal',
    verified: false,
  },
  {
    id: 'jl-stealthbox',
    category: 'audio',
    brand: 'JL Audio',
    model: 'Stealthbox subwoofer',
    blurb: 'Hidden sub in a moulded enclosure.',
    priceUsd: 900,
    fit: 'universal',
    verified: false,
  },
];

export const partsIn = (category: PartCategoryId) => CATALOG.filter((p) => p.category === category);

/** How a part fits the given car: by its car list when it has one. */
export function fitFor(part: PartProduct, carId: string): PartProduct['fit'] {
  if (!part.cars) return part.fit;
  return part.cars.includes(carId) ? 'this-car' : 'needs-adapting';
}

export const FIT_NOTES: Record<PartProduct['fit'], string | null> = {
  'this-car': null,
  universal: null,
  'needs-adapting': 'Made for other cars; fitting it here would need custom work.',
};
