import type { PartProduct } from '../data/catalog';
import type { CarDef } from '../data/types';

// Factory figures next to what the build would make, using the makers' own
// claims. Claims are rarely measured the same way (crank or wheel, which
// fuel, which baseline), so the build column is a rough guide, not a dyno.

interface Row {
  label: string;
  unit: string;
  stock: number;
  build: number;
  /** For weight, less is better. */
  lowerIsBetter?: boolean;
  decimals?: number;
}

export function Stats({ car, parts }: { car: CarDef; parts: PartProduct[] }) {
  const sum = (key: 'hp' | 'nm' | 'kg') => parts.reduce((total, p) => total + (p.claims?.[key] ?? 0), 0);
  const hp = car.engine.hp + sum('hp');
  const nm = car.engine.torqueNm + sum('nm');
  const kg = car.weightKg + sum('kg');

  const rows: Row[] = [
    { label: 'Power', unit: 'hp', stock: car.engine.hp, build: hp },
    { label: 'Torque', unit: 'Nm', stock: car.engine.torqueNm, build: nm },
    { label: 'Weight', unit: 'kg', stock: car.weightKg, build: kg, lowerIsBetter: true },
    { label: 'Power to weight', unit: 'hp/t', stock: car.engine.hp / (car.weightKg / 1000), build: hp / (kg / 1000) },
  ];

  const format = (value: number, unit: string, decimals = 0) =>
    `${value.toLocaleString('en-US', { maximumFractionDigits: decimals })} ${unit}`;

  return (
    <div className="stats" role="table" aria-label="Performance, factory and this build">
      <div role="row" className="stats-row stats-head">
        <span role="columnheader">{car.engine.name}</span>
        <span role="columnheader">Factory</span>
        <span role="columnheader">Build</span>
      </div>
      {rows.map((r) => {
        const stock = Math.round(r.stock);
        const build = Math.round(r.build);
        const delta = build - stock;
        const better = r.lowerIsBetter ? delta < 0 : delta > 0;
        return (
          <div role="row" className="stats-row" key={r.label}>
            <span role="rowheader">{r.label}</span>
            <span role="cell" className="spec">
              {format(stock, r.unit, r.decimals)}
            </span>
            <span role="cell" className="spec" data-change={delta === 0 ? 'none' : better ? 'better' : 'worse'}>
              {delta === 0 ? '—' : format(build, r.unit, r.decimals)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
