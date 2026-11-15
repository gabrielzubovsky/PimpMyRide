import { create } from 'zustand';
import { CARS } from '../data/cars';
import { CATALOG, CATEGORIES, type PartCategoryId, type PartProduct } from '../data/catalog';
import type { CarDef, PaintFinishId, ViewId } from '../data/types';
import { WHEELS, wheelOffersFitment } from '../data/wheels';

// The whole build lives in one store: which view the camera is on and which
// part is chosen in each category. The 3D scene and the build sheet both read
// from here, so neither needs to know about the other.

export interface Build {
  /** Id of a factory colour, or 'custom' when the colour picker was used. */
  paintId: string;
  paintHex: string;
  paintFinish: PaintFinishId;
  wheelId: string;
  wheelFinishId: string;
  fitmentId: string;
  /** Ride height relative to stock. Negative is lower. */
  rideFrontMm: number;
  rideRearMm: number;
  rideLinked: boolean;
  caliperColorId: string;
  /** Window tint, 0 for clear to 1 for blacked out. */
  tint: number;
  leatherId: string;
  /** Chosen catalogue part per category, or null for factory / none. */
  upgrades: Record<PartCategoryId, string | null>;
}

interface GarageState extends Build {
  car: CarDef;
  view: ViewId;
  setView: (view: ViewId) => void;
  setPaint: (paintId: string) => void;
  setCustomPaint: (hex: string) => void;
  setPaintFinish: (finish: PaintFinishId) => void;
  setWheel: (wheelId: string) => void;
  setWheelFinish: (finishId: string) => void;
  setFitment: (fitmentId: string) => void;
  setRideHeight: (axle: 'front' | 'rear', mm: number) => void;
  setRideLinked: (linked: boolean) => void;
  setCaliperColor: (id: string) => void;
  setTint: (tint: number) => void;
  setLeather: (id: string) => void;
  setUpgrade: (category: PartCategoryId, partId: string | null) => void;
  setCar: (carId: string) => void;
  resetBuild: () => void;
}

/** Everything as it left the factory, for the given car. */
function stockBuild(car: CarDef): Build {
  const wheel = WHEELS.find((w) => w.id === car.factoryWheelId) ?? WHEELS[0];
  return {
    paintId: car.paints[0].id,
    paintHex: car.paints[0].hex,
    paintFinish: car.paints[0].finish,
    wheelId: wheel.id,
    wheelFinishId: wheel.finishes[0].id,
    fitmentId: car.fitments[0].id,
    rideFrontMm: 0,
    rideRearMm: 0,
    rideLinked: true,
    caliperColorId: car.caliperColors[0].id,
    tint: 0.35,
    leatherId: car.leatherColors[0].id,
    upgrades: Object.fromEntries(CATEGORIES.map((c) => [c.id, null])) as Record<PartCategoryId, string | null>,
  };
}

const car = CARS[0];

export const useGarage = create<GarageState>((set, get) => ({
  car,
  view: 'exterior',
  ...stockBuild(car),

  setView: (view) => set({ view }),

  setPaint: (paintId) => {
    const paint = get().car.paints.find((p) => p.id === paintId);
    if (paint) set({ paintId, paintHex: paint.hex, paintFinish: paint.finish });
  },
  setCustomPaint: (hex) => set({ paintId: 'custom', paintHex: hex }),
  setPaintFinish: (paintFinish) => set({ paintFinish }),

  setWheel: (wheelId) => {
    const wheel = WHEELS.find((w) => w.id === wheelId);
    if (!wheel) return;
    // Keep the current size if this wheel is made in it, otherwise fall back
    // to the first of the car's sizes it is made in.
    const { car, fitmentId: current } = get();
    const fitmentId = wheelOffersFitment(wheel, current)
      ? current
      : (car.fitments.find((f) => wheelOffersFitment(wheel, f.id))?.id ?? car.fitments[0].id);
    set({ wheelId, wheelFinishId: wheel.finishes[0].id, fitmentId });
  },
  setWheelFinish: (wheelFinishId) => set({ wheelFinishId }),
  setFitment: (fitmentId) => set({ fitmentId }),

  setRideHeight: (axle, mm) =>
    set((s) => {
      if (s.rideLinked) return { rideFrontMm: mm, rideRearMm: mm };
      return axle === 'front' ? { rideFrontMm: mm } : { rideRearMm: mm };
    }),
  setRideLinked: (rideLinked) =>
    set((s) => (rideLinked ? { rideLinked, rideRearMm: s.rideFrontMm } : { rideLinked })),

  setCaliperColor: (caliperColorId) => set({ caliperColorId }),
  setTint: (tint) => set({ tint }),
  setLeather: (leatherId) => set({ leatherId }),
  setUpgrade: (category, partId) =>
    set((s) => ({ upgrades: { ...s.upgrades, [category]: partId } })),
  // Switching car starts a fresh build: paints, sizes and parts are per-car.
  setCar: (carId) => {
    const next = CARS.find((c) => c.id === carId);
    if (!next || next.id === get().car.id) return;
    set({ car: next, view: 'exterior', ...stockBuild(next) });
  },
  resetBuild: () => set({ ...stockBuild(get().car) }),
}));

/** The chosen parts, looked up from their ids. */
export function useSelection() {
  const car = useGarage((s) => s.car);
  const wheelId = useGarage((s) => s.wheelId);
  const wheelFinishId = useGarage((s) => s.wheelFinishId);
  const fitmentId = useGarage((s) => s.fitmentId);

  const wheel = WHEELS.find((w) => w.id === wheelId) ?? WHEELS[0];
  const wheelFinish = wheel.finishes.find((f) => f.id === wheelFinishId) ?? wheel.finishes[0];
  const fitment = car.fitments.find((f) => f.id === fitmentId) ?? car.fitments[0];
  return { car, wheel, wheelFinish, fitment };
}

/** The chosen catalogue parts, looked up from their ids. */
export function useUpgrades(): PartProduct[] {
  const upgrades = useGarage((s) => s.upgrades);
  return Object.values(upgrades)
    .filter((id): id is string => id !== null)
    .map((id) => CATALOG.find((p) => p.id === id))
    .filter((p): p is PartProduct => p !== undefined);
}

// Handy while developing: inspect or change the build from the browser console.
if (import.meta.env.DEV) {
  (window as unknown as { garage: typeof useGarage }).garage = useGarage;
}
