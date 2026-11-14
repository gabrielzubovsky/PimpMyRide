import type { PaintFinish } from './types';

export const PAINT_FINISHES: PaintFinish[] = [
  { id: 'gloss', name: 'Gloss', metalness: 0, roughness: 0.55, clearcoat: 1, clearcoatRoughness: 0.03 },
  { id: 'metallic', name: 'Metallic', metalness: 0.85, roughness: 0.42, clearcoat: 1, clearcoatRoughness: 0.04 },
  { id: 'satin', name: 'Satin', metalness: 0.35, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.45 },
  { id: 'matte', name: 'Matte', metalness: 0.1, roughness: 0.88, clearcoat: 0, clearcoatRoughness: 1 },
  { id: 'chrome', name: 'Chrome', metalness: 1, roughness: 0.04, clearcoat: 0, clearcoatRoughness: 0 },
];

export const paintFinish = (id: string) => PAINT_FINISHES.find((f) => f.id === id) ?? PAINT_FINISHES[0];
