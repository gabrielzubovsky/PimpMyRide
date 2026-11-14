import type { AxleFitment } from '../data/types';

// Specs are written the way they are stamped on the real parts.

/** Wheel size as cast into the back of a wheel, e.g. "20×8.5J ET42". */
export const formatWheel = (f: AxleFitment) => `${f.diameterIn}×${f.widthIn}J ET${f.offsetMm}`;

/** Tyre size as moulded on a sidewall, e.g. "235/35 ZR20". */
export const formatTyre = (f: AxleFitment) => `${f.tyre.widthMm}/${f.tyre.aspect} ZR${f.diameterIn}`;

export const formatUsd = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Ride height relative to stock, e.g. "30 mm lower". */
export function formatRide(mm: number): string {
  if (mm === 0) return 'Stock';
  return `${Math.abs(mm)} mm ${mm < 0 ? 'lower' : 'higher'}`;
}

export function formatTint(tint: number): string {
  if (tint < 0.12) return 'Clear';
  if (tint < 0.45) return 'Light';
  if (tint < 0.75) return 'Dark';
  return 'Blacked out';
}
