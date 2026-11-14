import { useState, type ReactNode } from 'react';
import { PAINT_FINISHES } from '../data/paint';
import type { AxleFitment, ViewId } from '../data/types';
import { WHEELS } from '../data/wheels';
import type { WheelDesign } from '../parts/wheel';
import { useGarage, useSelection } from '../state/garage';
import { formatRide, formatTint, formatTyre, formatUsd, formatWheel } from './format';

// The build sheet is both the summary of the build and the way to change it.
// Each line shows the current choice; opening a line reveals its options.

type LineId = 'paint' | 'wheels' | 'size' | 'ride' | 'calipers' | 'glass' | 'leather';

/** Lines that are best judged from a particular camera view. */
const LINE_VIEW: Partial<Record<LineId, ViewId>> = { leather: 'interior' };

export function BuildSheet() {
  const [open, setOpen] = useState<LineId | null>('paint');
  const s = useGarage();
  const { car, wheel, wheelFinish, fitment } = useSelection();

  const toggle = (id: LineId) => {
    const opening = open !== id;
    setOpen(opening ? id : null);
    if (!opening) return;
    // Bring the part into view: inside for cabin parts, back outside otherwise.
    const wanted = LINE_VIEW[id];
    if (wanted) s.setView(wanted);
    else if (s.view === 'interior') s.setView('exterior');
  };
  const line = (id: LineId) => ({ id, open: open === id, onToggle: () => toggle(id) });

  const paintName = car.paints.find((p) => p.id === s.paintId)?.name ?? 'Custom colour';
  const finishName = PAINT_FINISHES.find((f) => f.id === s.paintFinish)?.name ?? '';
  const caliper = car.caliperColors.find((c) => c.id === s.caliperColorId);
  const leather = car.leatherColors.find((c) => c.id === s.leatherId);
  const wheelSet = wheel.priceUsdEach === null ? null : wheel.priceUsdEach * 4;

  return (
    <aside className="sheet" aria-label="Build sheet">
      <header className="sheet-head">
        <h1>Build sheet</h1>
        <p>
          {car.make} {car.model}, {car.years}
        </p>
      </header>

      <div className="lines">
        <Line {...line('paint')} label="Paint" value={`${paintName}, ${finishName.toLowerCase()}`}>
          <div className="chips" role="group" aria-label="Factory colours">
            {car.paints.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                aria-pressed={p.id === s.paintId}
                onClick={() => s.setPaint(p.id)}
              >
                <span className="chip-colour" style={{ background: p.hex }} />
                <span className="chip-name">{p.name}</span>
              </button>
            ))}
          </div>
          <label className="field-row">
            <span>Any other colour</span>
            <input type="color" value={s.paintHex} onChange={(e) => s.setCustomPaint(e.target.value)} />
          </label>
          <Segmented
            label="Finish"
            options={PAINT_FINISHES.map((f) => ({ id: f.id, name: f.name }))}
            value={s.paintFinish}
            onChange={s.setPaintFinish}
          />
        </Line>

        <Line {...line('wheels')} label="Wheels" value={`${wheel.brand} ${wheel.model}`}>
          <div className="options" role="group" aria-label="Wheel">
            {WHEELS.map((w) => (
              <button
                key={w.id}
                type="button"
                className="option"
                aria-pressed={w.id === wheel.id}
                onClick={() => s.setWheel(w.id)}
              >
                <WheelGlyph design={w.design} />
                <span className="option-text">
                  <span className="option-name">
                    {w.brand} {w.model}
                  </span>
                  <span className="option-note">{w.construction}</span>
                </span>
                <span className="option-price">
                  {w.priceUsdEach === null ? 'Factory' : `${formatUsd(w.priceUsdEach)} each`}
                </span>
              </button>
            ))}
          </div>
          <div className="chips chips-wide" role="group" aria-label="Wheel finish">
            {wheel.finishes.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={f.id === wheelFinish.id}
                onClick={() => s.setWheelFinish(f.id)}
              >
                <span
                  className="chip-colour"
                  style={{ background: `linear-gradient(135deg, ${f.face.color} 0 62%, ${f.lip.color} 62%)` }}
                />
                <span className="chip-name">{f.name}</span>
              </button>
            ))}
          </div>
        </Line>

        <Line {...line('size')} label="Wheel and tyre size" value={fitment.name}>
          <div className="options" role="group" aria-label="Size">
            {car.fitments
              .filter((f) => wheel.fitments.includes(f.id))
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="option option-stack"
                  aria-pressed={f.id === fitment.id}
                  onClick={() => s.setFitment(f.id)}
                >
                  <span className="option-name">{f.name}</span>
                  <span className="option-note">{f.note}</span>
                  <SizeTable front={f.front} rear={f.rear} />
                </button>
              ))}
          </div>
          {wheel.fitments.length < car.fitments.length && (
            <p className="note">
              {wheel.brand} {wheel.model} is not listed in every size. Pick another wheel to see more.
            </p>
          )}
        </Line>

        <Line
          {...line('ride')}
          label="Ride height"
          value={
            s.rideFrontMm === s.rideRearMm
              ? formatRide(s.rideFrontMm)
              : `Front ${formatRide(s.rideFrontMm).toLowerCase()}, rear ${formatRide(s.rideRearMm).toLowerCase()}`
          }
        >
          <Slider
            label={s.rideLinked ? 'Front and rear' : 'Front'}
            value={s.rideFrontMm}
            display={formatRide(s.rideFrontMm)}
            {...car.rideHeightMm}
            onChange={(mm) => s.setRideHeight('front', mm)}
          />
          {!s.rideLinked && (
            <Slider
              label="Rear"
              value={s.rideRearMm}
              display={formatRide(s.rideRearMm)}
              {...car.rideHeightMm}
              onChange={(mm) => s.setRideHeight('rear', mm)}
            />
          )}
          <label className="check">
            <input type="checkbox" checked={s.rideLinked} onChange={(e) => s.setRideLinked(e.target.checked)} />
            <span>Move front and rear together</span>
          </label>
        </Line>

        <Line {...line('calipers')} label="Brake calipers" value={caliper?.name ?? ''}>
          <Swatches options={car.caliperColors} value={s.caliperColorId} onChange={s.setCaliperColor} label="Caliper colour" />
        </Line>

        <Line {...line('glass')} label="Window tint" value={formatTint(s.tint)}>
          <Slider
            label="Tint"
            value={Math.round(s.tint * 100)}
            display={formatTint(s.tint)}
            min={0}
            max={100}
            step={5}
            onChange={(v) => s.setTint(v / 100)}
          />
        </Line>

        <Line {...line('leather')} label="Interior leather" value={leather?.name ?? ''}>
          <Swatches options={car.leatherColors} value={s.leatherId} onChange={s.setLeather} label="Leather colour" />
        </Line>
      </div>

      <footer className="sheet-foot">
        <div className="total">
          <span>Parts so far</span>
          <span className="spec">{wheelSet === null ? 'All factory' : formatUsd(wheelSet)}</span>
        </div>
        {wheelSet !== null && (
          <p className="note">
            Four {wheel.brand} {wheel.model} wheels. Prices are rough estimates that have not been checked
            against a seller yet.
          </p>
        )}
        <button type="button" className="reset" onClick={s.resetBuild}>
          Return to stock
        </button>
      </footer>
    </aside>
  );
}

interface LineProps {
  id: LineId;
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function Line({ id, label, value, open, onToggle, children }: LineProps) {
  return (
    <section className="line" data-open={open}>
      <h2>
        <button type="button" className="line-head" aria-expanded={open} aria-controls={`${id}-options`} onClick={onToggle}>
          <span className="line-label">{label}</span>
          <span className="line-value">{value}</span>
        </button>
      </h2>
      {open && (
        <div id={`${id}-options`} className="line-body">
          {children}
        </div>
      )}
    </section>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: T; name: string }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.name}
        </button>
      ))}
    </div>
  );
}

function Swatches({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: string; name: string; hex: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className="chip" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          <span className="chip-colour" style={{ background: o.hex }} />
          <span className="chip-name">{o.name}</span>
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span className="slider-head">
        <span>{label}</span>
        <span className="spec">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function SizeTable({ front, rear }: { front: AxleFitment; rear: AxleFitment }) {
  return (
    <span className="sizes spec">
      <span>Front</span>
      <span>{formatWheel(front)}</span>
      <span>{formatTyre(front)}</span>
      <span>Rear</span>
      <span>{formatWheel(rear)}</span>
      <span>{formatTyre(rear)}</span>
    </span>
  );
}

/** A tiny drawing of the spoke pattern, generated from the same design data as the 3D wheel. */
function WheelGlyph({ design }: { design: WheelDesign }) {
  const rim = 11;
  const hub = 2.6;
  const pitch = (Math.PI * 2) / design.spokes;
  const point = (r: number, a: number, shift = 0) =>
    `${(r * Math.cos(a) - shift * Math.sin(a)).toFixed(2)} ${(r * Math.sin(a) + shift * Math.cos(a)).toFixed(2)}`;

  const paths: string[] = [];
  for (let k = 0; k < design.spokes; k++) {
    const a = k * pitch - Math.PI / 2;
    const layout = design.layout;
    if (layout.type === 'straight') {
      paths.push(`M${point(hub, a)}L${point(rim, a)}`);
    } else if (layout.type === 'twin') {
      for (const side of [-1, 1]) {
        paths.push(`M${point(hub, a, side * 0.9)}L${point(rim, a, side * (layout.gapRimMm / layout.gapHubMm) * 0.9)}`);
      }
    } else {
      const mid = hub + (rim - hub) * layout.splitAt;
      paths.push(`M${point(hub, a)}L${point(mid, a)}`);
      for (const side of [-1, 1]) paths.push(`M${point(mid, a)}L${point(rim, a + side * layout.spread * pitch)}`);
    }
  }
  const weight = design.layout.type === 'straight' ? 2.4 : 1.1;

  return (
    <svg className="glyph" viewBox="-14 -14 28 28" aria-hidden="true">
      <circle r="12.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d={paths.join('')} fill="none" stroke="currentColor" strokeWidth={weight} />
      <circle r="2.8" fill="currentColor" />
    </svg>
  );
}
