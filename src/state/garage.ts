import { create } from 'zustand';
import { FERRARI_458 } from '../data/cars';
import type { CarDef, PaintFinishId, ViewId } from '../data/types';
import { WHEELS } from '../data/wheels';

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
  resetBuild: () => void;
}

const car = FERRARI_458;

const STOCK: Build = {
  paintId: car.paints[0].id,
  paintHex: car.paints[0].hex,
  paintFinish: car.paints[0].finish,
  wheelId: WHEELS[0].id,
  wheelFinishId: WHEELS[0].finishes[0].id,
  fitmentId: car.fitments[0].id,
  rideFrontMm: 0,
  rideRearMm: 0,
  rideLinked: true,
  caliperColorId: car.caliperColors[0].id,
  tint: 0.35,
  leatherId: car.leatherColors[0].id,
};

export const useGarage = create<GarageState>((set, get) => ({
  car,
  view: 'exterior',
  ...STOCK,

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
    // Keep the current size if this wheel is made in it, otherwise fall back.
    const fitmentId = wheel.fitments.includes(get().fitmentId) ? get().fitmentId : wheel.fitments[0];
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
  resetBuild: () => set({ ...STOCK }),
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

// Handy while developing: inspect or change the build from the browser console.
if (import.meta.env.DEV) {
  (window as unknown as { garage: typeof useGarage }).garage = useGarage;
}
