// Registry of real automotive brands, grouped by what they make. This is
// reference data for the parts catalogue: a catalogue entry's `brand` should
// name one of these. A brand can appear before any of its parts do.

export type BrandField =
  | 'wheels'
  | 'tyres'
  | 'suspension'
  | 'brakes'
  | 'exhaust'
  | 'intake'
  | 'forced-induction'
  | 'cooling'
  | 'nitrous'
  | 'engine-management'
  | 'fluids'
  | 'seats'
  | 'harness'
  | 'steering'
  | 'roll-cage'
  | 'gauges'
  | 'audio'
  | 'body-kit'
  | 'aero'
  | 'lighting';

export interface Brand {
  id: string;
  name: string;
  /** Where the company is from. */
  country: string;
  /** What they are known for. */
  fields: BrandField[];
  note?: string;
}

export const BRANDS: Brand[] = [
  // Wheels
  { id: 'bbs', name: 'BBS', country: 'Germany', fields: ['wheels'], note: 'Motorsport wheels since 1970; the LM and E88 are icons.' },
  { id: 'rays', name: 'RAYS (Volk Racing)', country: 'Japan', fields: ['wheels'], note: 'Forged JDM wheels; the TE37 is the best-known.' },
  { id: 'enkei', name: 'Enkei', country: 'Japan', fields: ['wheels'], note: 'Lightweight cast wheels; RPF1 is a track staple.' },
  { id: 'work', name: 'Work Wheels', country: 'Japan', fields: ['wheels'], note: 'Multi-piece wheels with deep lips; Meister series.' },
  { id: 'oz', name: 'OZ Racing', country: 'Italy', fields: ['wheels'], note: 'F1 and rally supplier; Ultraleggera.' },
  { id: 'hre', name: 'HRE', country: 'USA', fields: ['wheels'], note: 'Made-to-order forged wheels.' },
  { id: 'ssr', name: 'SSR', country: 'Japan', fields: ['wheels'], note: 'Professor series, classic VIP deep-dish.' },
  { id: 'rotiform', name: 'Rotiform', country: 'USA', fields: ['wheels'], note: 'Stance and euro styles.' },
  { id: 'vossen', name: 'Vossen', country: 'USA', fields: ['wheels'], note: 'Luxury and concave designs.' },
  { id: 'american-racing', name: 'American Racing', country: 'USA', fields: ['wheels'], note: 'Torq Thrust, the classic muscle-car five-spoke.' },
  { id: 'advan-wheels', name: 'Advan Racing (Yokohama)', country: 'Japan', fields: ['wheels', 'tyres'], note: 'Yokohama’s wheel line.' },
  { id: 'fifteen52', name: 'fifteen52', country: 'USA', fields: ['wheels'], note: 'Rally-inspired styles.' },
  { id: 'weds', name: 'WedsSport', country: 'Japan', fields: ['wheels'] },
  { id: 'konig', name: 'König', country: 'USA', fields: ['wheels'], note: 'Budget-friendly flow-formed wheels.' },

  // Tyres
  { id: 'michelin', name: 'Michelin', country: 'France', fields: ['tyres'], note: 'Pilot Sport line.' },
  { id: 'pirelli', name: 'Pirelli', country: 'Italy', fields: ['tyres'], note: 'P Zero; F1 supplier.' },
  { id: 'bridgestone', name: 'Bridgestone', country: 'Japan', fields: ['tyres'], note: 'Potenza line.' },
  { id: 'yokohama', name: 'Yokohama', country: 'Japan', fields: ['tyres'], note: 'Advan tyres.' },
  { id: 'toyo', name: 'Toyo Tires', country: 'Japan', fields: ['tyres'], note: 'Proxes; drift and time attack.' },
  { id: 'falken', name: 'Falken', country: 'Japan', fields: ['tyres'], note: 'Azenis.' },
  { id: 'nitto', name: 'Nitto', country: 'Japan', fields: ['tyres'], note: 'NT555, drag radials.' },
  { id: 'hankook', name: 'Hankook', country: 'South Korea', fields: ['tyres'] },
  { id: 'continental', name: 'Continental', country: 'Germany', fields: ['tyres'] },
  { id: 'goodyear', name: 'Goodyear', country: 'USA', fields: ['tyres'], note: 'Eagle F1.' },

  // Suspension
  { id: 'kw', name: 'KW Suspensions', country: 'Germany', fields: ['suspension'], note: 'Variant coilover line, V1 to V5.' },
  { id: 'ohlins', name: 'Öhlins', country: 'Sweden', fields: ['suspension'], note: 'Road & Track DFV coilovers.' },
  { id: 'bilstein', name: 'Bilstein', country: 'Germany', fields: ['suspension'], note: 'B-series dampers, OEM and aftermarket.' },
  { id: 'hks', name: 'HKS', country: 'Japan', fields: ['suspension', 'exhaust', 'intake', 'forced-induction', 'engine-management'], note: 'The classic Japanese tuner: Hipermax, Hi-Power, GT superchargers.' },
  { id: 'tein', name: 'TEIN', country: 'Japan', fields: ['suspension'], note: 'Green coilovers.' },
  { id: 'bc-racing', name: 'BC Racing', country: 'Taiwan', fields: ['suspension'], note: 'Budget coilover staple.' },
  { id: 'eibach', name: 'Eibach', country: 'Germany', fields: ['suspension'], note: 'Pro-Kit lowering springs.' },
  { id: 'hr', name: 'H&R', country: 'Germany', fields: ['suspension'], note: 'Springs and spacers.' },
  { id: 'airlift', name: 'Air Lift Performance', country: 'USA', fields: ['suspension'], note: 'Air ride with height presets.' },
  { id: 'accuair', name: 'AccuAir', country: 'USA', fields: ['suspension'], note: 'Air-ride management.' },
  { id: 'cusco', name: 'Cusco', country: 'Japan', fields: ['suspension', 'roll-cage'], note: 'Braces, sway bars and Safety 21 cages.' },
  { id: 'whiteline', name: 'Whiteline', country: 'Australia', fields: ['suspension'], note: 'Bushings and sway bars.' },

  // Brakes
  { id: 'brembo', name: 'Brembo', country: 'Italy', fields: ['brakes'], note: 'OEM supplier to half the supercar world; GT big-brake kits.' },
  { id: 'ap-racing', name: 'AP Racing', country: 'UK', fields: ['brakes'], note: 'Radi-CAL calipers.' },
  { id: 'stoptech', name: 'StopTech', country: 'USA', fields: ['brakes'], note: 'ST-series big-brake kits.' },
  { id: 'wilwood', name: 'Wilwood', country: 'USA', fields: ['brakes'], note: 'Affordable motorsport calipers.' },
  { id: 'alcon', name: 'Alcon', country: 'UK', fields: ['brakes'] },
  { id: 'endless', name: 'Endless', country: 'Japan', fields: ['brakes'], note: 'Pads and monoblock calipers.' },
  { id: 'project-mu', name: 'Project Mu', country: 'Japan', fields: ['brakes'], note: 'Teal calipers and pads.' },
  { id: 'ebc', name: 'EBC Brakes', country: 'UK', fields: ['brakes'], note: 'Colour-coded pad compounds.' },
  { id: 'hawk', name: 'Hawk Performance', country: 'USA', fields: ['brakes'], note: 'HPS and HP+ pads.' },

  // Exhaust
  { id: 'akrapovic', name: 'Akrapovič', country: 'Slovenia', fields: ['exhaust'], note: 'Titanium exhausts.' },
  { id: 'fi-exhaust', name: 'Fi Exhaust', country: 'Taiwan', fields: ['exhaust'], note: 'Valvetronic supercar exhausts.' },
  { id: 'armytrix', name: 'Armytrix', country: 'Taiwan', fields: ['exhaust'], note: 'Valved exhausts with app control.' },
  { id: 'borla', name: 'Borla', country: 'USA', fields: ['exhaust'], note: 'ATAK, S-Type; muscle and trucks.' },
  { id: 'magnaflow', name: 'MagnaFlow', country: 'USA', fields: ['exhaust'] },
  { id: 'remus', name: 'Remus', country: 'Austria', fields: ['exhaust'] },
  { id: 'tomei', name: 'Tomei', country: 'Japan', fields: ['exhaust', 'engine-management'], note: 'Expreme Ti single-exit; engine internals.' },
  { id: 'greddy', name: 'GReddy (Trust)', country: 'Japan', fields: ['exhaust', 'forced-induction', 'cooling'], note: 'Turbo kits, intercoolers, exhausts.' },

  // Intake
  { id: 'kn', name: 'K&N', country: 'USA', fields: ['intake'], note: 'Washable cotton filters and Typhoon intakes.' },
  { id: 'aem', name: 'AEM', country: 'USA', fields: ['intake', 'gauges', 'engine-management'], note: 'Intakes, widebands, standalone ECUs.' },
  { id: 'injen', name: 'Injen', country: 'USA', fields: ['intake'] },
  { id: 'eventuri', name: 'Eventuri', country: 'UK', fields: ['intake'], note: 'Carbon-fibre inverted-cone intakes.' },

  // Forced induction
  { id: 'garrett', name: 'Garrett', country: 'USA', fields: ['forced-induction'], note: 'G-series turbos.' },
  { id: 'borgwarner', name: 'BorgWarner', country: 'USA', fields: ['forced-induction'], note: 'EFR turbo line.' },
  { id: 'precision', name: 'Precision Turbo', country: 'USA', fields: ['forced-induction'], note: 'Drag-racing turbos.' },
  { id: 'whipple', name: 'Whipple', country: 'USA', fields: ['forced-induction'], note: 'Twin-screw superchargers.' },

  // Cooling
  { id: 'mishimoto', name: 'Mishimoto', country: 'USA', fields: ['cooling'], note: 'Radiators and intercoolers.' },
  { id: 'csf', name: 'CSF', country: 'USA', fields: ['cooling'], note: 'Race-spec heat exchangers.' },

  // Nitrous
  { id: 'nos', name: 'NOS (Nitrous Oxide Systems)', country: 'USA', fields: ['nitrous'], note: 'The blue bottle.' },
  { id: 'nitrous-express', name: 'Nitrous Express', country: 'USA', fields: ['nitrous'] },
  { id: 'zex', name: 'ZEX', country: 'USA', fields: ['nitrous'] },

  // Engine management
  { id: 'haltech', name: 'Haltech', country: 'Australia', fields: ['engine-management'], note: 'Elite and Nexus standalone ECUs.' },
  { id: 'motec', name: 'MoTeC', country: 'Australia', fields: ['engine-management', 'gauges'], note: 'Professional motorsport ECUs and dashes.' },
  { id: 'cobb', name: 'COBB Tuning', country: 'USA', fields: ['engine-management'], note: 'Accessport flash tuning.' },
  { id: 'link', name: 'Link ECU', country: 'New Zealand', fields: ['engine-management'] },

  // Fluids
  { id: 'motul', name: 'Motul', country: 'France', fields: ['fluids'], note: '300V ester racing oil; RBF brake fluids.' },
  { id: 'repsol', name: 'Repsol', country: 'Spain', fields: ['fluids'], note: 'Racing oils; famous for the Honda MotoGP livery.' },
  { id: 'castrol', name: 'Castrol', country: 'UK', fields: ['fluids'], note: 'Edge and SRF brake fluid.' },
  { id: 'liqui-moly', name: 'Liqui Moly', country: 'Germany', fields: ['fluids'] },
  { id: 'red-line', name: 'Red Line', country: 'USA', fields: ['fluids'], note: 'Ester oils and water wetter.' },
  { id: 'royal-purple', name: 'Royal Purple', country: 'USA', fields: ['fluids'] },

  // Seats and safety
  { id: 'sparco', name: 'Sparco', country: 'Italy', fields: ['seats', 'harness', 'steering'], note: 'Race seats, suits, wheels and harnesses.' },
  { id: 'bride', name: 'Bride', country: 'Japan', fields: ['seats'], note: 'Gradation-fabric JDM buckets: Zeta, Low Max.' },
  { id: 'recaro', name: 'Recaro', country: 'Germany', fields: ['seats'], note: 'From OEM sports seats to the Podium.' },
  { id: 'omp', name: 'OMP', country: 'Italy', fields: ['seats', 'harness', 'steering'], note: 'FIA racewear and seats.' },
  { id: 'takata', name: 'Takata', country: 'Japan', fields: ['harness'], note: 'The iconic green harness.' },
  { id: 'schroth', name: 'Schroth', country: 'Germany', fields: ['harness'], note: 'FIA harnesses.' },

  // Steering
  { id: 'momo', name: 'MOMO', country: 'Italy', fields: ['steering'], note: 'Prototipo, the retro classic.' },
  { id: 'nardi', name: 'Nardi', country: 'Italy', fields: ['steering'], note: 'Wood and deep-corn wheels.' },
  { id: 'nrg', name: 'NRG Innovations', country: 'USA', fields: ['steering'], note: 'Quick-release hubs.' },
  { id: 'grip-royal', name: 'Grip Royal', country: 'USA', fields: ['steering'] },

  // Gauges
  { id: 'defi', name: 'Defi', country: 'Japan', fields: ['gauges'], note: 'Advance series gauge pods.' },

  // Audio
  { id: 'alpine', name: 'Alpine', country: 'Japan', fields: ['audio'], note: 'Head units.' },
  { id: 'pioneer', name: 'Pioneer', country: 'Japan', fields: ['audio'] },
  { id: 'jl-audio', name: 'JL Audio', country: 'USA', fields: ['audio'], note: 'Subwoofers.' },
  { id: 'rockford', name: 'Rockford Fosgate', country: 'USA', fields: ['audio'] },
  { id: 'focal', name: 'Focal', country: 'France', fields: ['audio'] },
  { id: 'kicker', name: 'Kicker', country: 'USA', fields: ['audio'] },

  // Body kits and aero
  { id: 'liberty-walk', name: 'Liberty Walk', country: 'Japan', fields: ['body-kit'], note: 'Bolt-on widebody kits with exposed fasteners.' },
  { id: 'pandem', name: 'Pandem / Rocket Bunny (TRA Kyoto)', country: 'Japan', fields: ['body-kit'], note: 'Kei Miura’s riveted widebody kits.' },
  { id: 'veilside', name: 'VeilSide', country: 'Japan', fields: ['body-kit'], note: 'Fortune kits of Fast & Furious fame.' },
  { id: 'rwb', name: 'RWB (Rauh-Welt Begriff)', country: 'Japan', fields: ['body-kit'], note: 'Nakai-san’s Porsche widebodies.' },
  { id: 'varis', name: 'Varis', country: 'Japan', fields: ['body-kit', 'aero'], note: 'Carbon aero for time attack.' },
  { id: 'voltex', name: 'Voltex', country: 'Japan', fields: ['aero'], note: 'Time-attack GT wings.' },
  { id: 'apr-performance', name: 'APR Performance', country: 'USA', fields: ['aero'], note: 'GTC carbon wings and splitters.' },
  { id: 'seibon', name: 'Seibon Carbon', country: 'USA', fields: ['body-kit', 'aero'], note: 'Carbon hoods and trunks.' },
  { id: 'mansory', name: 'Mansory', country: 'Germany', fields: ['body-kit'], note: 'Full carbon conversions for exotics.' },
  { id: 'novitec', name: 'Novitec', country: 'Germany', fields: ['body-kit', 'aero', 'suspension', 'exhaust'], note: 'Ferrari and Lamborghini tuner.' },
  { id: 'vorsteiner', name: 'Vorsteiner', country: 'USA', fields: ['body-kit', 'aero'] },
  { id: 'duraflex', name: 'Duraflex (Extreme Dimensions)', country: 'USA', fields: ['body-kit'], note: 'Budget fibreglass kits.' },
  { id: 'mugen', name: 'Mugen', country: 'Japan', fields: ['body-kit', 'aero', 'exhaust'], note: 'Honda’s house tuner.' },
  { id: 'nismo', name: 'NISMO', country: 'Japan', fields: ['body-kit', 'aero', 'suspension'], note: 'Nissan motorsport.' },
  { id: 'trd', name: 'TRD', country: 'Japan', fields: ['body-kit', 'aero', 'suspension'], note: 'Toyota Racing Development.' },

  // Lighting
  { id: 'morimoto', name: 'Morimoto', country: 'USA', fields: ['lighting'], note: 'Retrofit projectors and LEDs.' },
  { id: 'diode-dynamics', name: 'Diode Dynamics', country: 'USA', fields: ['lighting'] },
];
