import type { Surface, WheelFinish, WheelProduct } from './types';

// Seed wheel catalogue. The spoke designs are stylised versions of the real
// wheels, not measured copies. Prices and size availability are rough figures
// from memory, so every entry is marked `verified: false` until it has been
// checked against a seller.

const metal = (color: string, roughness = 0.34, metalness = 0.9): Surface => ({ color, metalness, roughness });
const painted = (color: string, roughness = 0.4): Surface => ({ color, metalness: 0.45, roughness, clearcoat: 0.6 });

const POLISHED = metal('#eceded', 0.16, 1);
const SILVER = metal('#b4b8bc', 0.3);
const DARK_CAP = painted('#101113', 0.35);

/** A one-piece wheel finished in a single colour all over. */
const allOver = (id: string, name: string, surface: Surface): WheelFinish => ({
  id,
  name,
  face: surface,
  lip: surface,
  barrel: surface,
  cap: DARK_CAP,
});

export const WHEELS: WheelProduct[] = [
  {
    id: 'ferrari-oem-20',
    brand: 'Ferrari',
    model: 'Factory forged twin five-spoke',
    construction: 'Forged one-piece',
    design: {
      spokes: 5,
      layout: { type: 'twin', gapHubMm: 44, gapRimMm: 70 },
      spokeWidthHubMm: 27,
      spokeWidthRimMm: 21,
      spokeDepthHubMm: 30,
      spokeDepthRimMm: 20,
      lipDepthMm: 14,
      steppedLip: false,
      rivets: 0,
      faceCurve: 1.3,
      hubDiameterMm: 172,
      capDiameterMm: 68,
    },
    finishes: [
      allOver('silver', 'Silver', SILVER),
      allOver('grigio-corsa', 'Grigio Corsa', metal('#3b3e42', 0.42, 0.8)),
    ],
    fitments: ['stock'],
    priceUsdEach: null,
    verified: false,
  },
  {
    id: 'bbs-lm',
    brand: 'BBS',
    model: 'LM',
    construction: 'Forged two-piece',
    design: {
      spokes: 10,
      layout: { type: 'split-y', splitAt: 0.5, spread: 0.37 },
      spokeWidthHubMm: 21,
      spokeWidthRimMm: 15,
      spokeDepthHubMm: 26,
      spokeDepthRimMm: 17,
      lipDepthMm: 85,
      steppedLip: true,
      rivets: 40,
      faceCurve: 1,
      hubDiameterMm: 166,
      capDiameterMm: 70,
    },
    finishes: [
      { id: 'gold', name: 'Gold, diamond-cut rim', face: metal('#b08a35', 0.36, 0.85), lip: POLISHED, barrel: SILVER, cap: DARK_CAP },
      { id: 'diamond-black', name: 'Diamond black, diamond-cut rim', face: metal('#1b1c1f', 0.3, 0.8), lip: POLISHED, barrel: SILVER, cap: DARK_CAP },
      { id: 'diamond-silver', name: 'Diamond silver, diamond-cut rim', face: SILVER, lip: POLISHED, barrel: SILVER, cap: DARK_CAP },
    ],
    fitments: ['stock', 'wide-20'],
    priceUsdEach: 1650,
    verified: false,
  },
  {
    id: 'rays-te37-ultra',
    brand: 'RAYS',
    model: 'Volk Racing TE37 Ultra',
    construction: 'Forged one-piece',
    design: {
      spokes: 6,
      layout: { type: 'straight' },
      spokeWidthHubMm: 64,
      spokeWidthRimMm: 36,
      spokeDepthHubMm: 30,
      spokeDepthRimMm: 22,
      lipDepthMm: 14,
      steppedLip: false,
      rivets: 0,
      faceCurve: 1.5,
      hubDiameterMm: 176,
      capDiameterMm: 64,
    },
    finishes: [
      allOver('bronze', 'Bronze', metal('#6a4a2c', 0.42, 0.8)),
      allOver('gunmetal', 'Diamond dark gunmetal', metal('#33363a', 0.34, 0.85)),
      allOver('blast-black', 'Blast black', painted('#0f0f10', 0.6)),
    ],
    fitments: ['stock', 'wide-20'],
    priceUsdEach: 1250,
    verified: false,
  },
  {
    id: 'advan-gt',
    brand: 'Yokohama',
    model: 'Advan Racing GT Premium',
    construction: 'Forged one-piece',
    design: {
      spokes: 5,
      layout: { type: 'straight' },
      spokeWidthHubMm: 74,
      spokeWidthRimMm: 42,
      spokeDepthHubMm: 30,
      spokeDepthRimMm: 22,
      lipDepthMm: 16,
      steppedLip: false,
      rivets: 0,
      faceCurve: 1.7,
      hubDiameterMm: 172,
      capDiameterMm: 64,
    },
    finishes: [
      allOver('titanium-black', 'Racing titanium black', metal('#2a2b2d', 0.3, 0.85)),
      allOver('gloss-black', 'Racing gloss black', painted('#09090a', 0.18)),
      allOver('hyper-black', 'Racing hyper black', metal('#6d7074', 0.26, 0.95)),
    ],
    fitments: ['stock', 'wide-20'],
    priceUsdEach: 1050,
    verified: false,
  },
  {
    id: 'hre-p101',
    brand: 'HRE',
    model: 'P101',
    construction: 'Forged one-piece, made to order',
    design: {
      spokes: 5,
      layout: { type: 'twin', gapHubMm: 30, gapRimMm: 92 },
      spokeWidthHubMm: 22,
      spokeWidthRimMm: 16,
      spokeDepthHubMm: 28,
      spokeDepthRimMm: 18,
      lipDepthMm: 18,
      steppedLip: false,
      rivets: 0,
      faceCurve: 1.45,
      hubDiameterMm: 160,
      capDiameterMm: 66,
    },
    finishes: [
      allOver('satin-black', 'Satin black', painted('#121213', 0.55)),
      allOver('brushed-clear', 'Brushed clear', metal('#c3c6c9', 0.24, 0.95)),
      allOver('satin-bronze', 'Satin bronze', metal('#7a5a3a', 0.45, 0.8)),
    ],
    fitments: ['stock', 'wide-20', 'staggered-21'],
    priceUsdEach: 2300,
    verified: false,
  },
];
