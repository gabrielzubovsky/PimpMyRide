import type { CarDef } from '../data/types';

/**
 * Where the nose and tail of the body are along z. Real cars overhang their
 * axles by different amounts front and rear, so a model centred between its
 * axles carries measured ends; anything else is taken as centred on its length.
 */
export function bodyEnds(car: CarDef): { nose: number; tail: number } {
  const [nose, tail] = car.bodyEndsZ ?? [-car.sizeM.length / 2, car.sizeM.length / 2];
  return { nose, tail };
}
