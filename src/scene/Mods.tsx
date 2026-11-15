import { useMemo } from 'react';
import * as THREE from 'three';
import { CATALOG, type PartCategoryId, type PartRender } from '../data/catalog';
import type { CarDef } from '../data/types';
import { MM } from '../units';
import { useGarage } from '../state/garage';
import type { AxleMount, AxleSetup } from './stance';

// Procedural 3D for catalogue parts, in the same spirit as the wheels: built
// from real published dimensions, close but not millimetre-perfect. Everything
// here is positioned from the car's real sizeM, so it sits sensibly on the
// 458's model and on the Civic outlines alike.

/** The render spec of the part chosen in a category, if it has one. */
export function useRender<K extends PartRender['kind']>(category: PartCategoryId, kind: K) {
  const upgrades = useGarage((s) => s.upgrades);
  const id = upgrades[category];
  const part = id ? CATALOG.find((p) => p.id === id) : undefined;
  const render = part?.render;
  return render && render.kind === kind ? (render as Extract<PartRender, { kind: K }>) : null;
}

// --- GT wing -----------------------------------------------------------------

/** Cambered aerofoil cross-section, chord `c` metres, thickness `t`. */
function airfoilShape(c: number, t: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(c * 0.3, t * 1.2, c, t * 0.15); // upper surface
  s.quadraticCurveTo(c * 0.5, -t * 0.45, c * 0.03, -t * 0.5); // lower surface
  s.quadraticCurveTo(-t * 0.35, -t * 0.2, 0, 0); // rounded leading edge
  return s;
}

const CARBON = { color: '#1b1c1e', roughness: 0.32, metalness: 0.15 };
const BRACKET = { color: '#999ea4', roughness: 0.4, metalness: 0.9 };

/** Rear wing on the deck, sized from the part's published dimensions. */
export function WingMod({ car }: { car: CarDef }) {
  const spec = useRender('aero', 'wing');
  const geometry = useMemo(() => {
    if (!spec) return null;
    const c = spec.chordMm * MM;
    const shape = airfoilShape(c, c * 0.13);
    const g = new THREE.ExtrudeGeometry(shape, { depth: spec.spanMm * MM, bevelEnabled: false, curveSegments: 16 });
    g.translate(-c * 0.35, 0, (-spec.spanMm * MM) / 2); // centre the span, pivot near the spar
    g.rotateY(Math.PI / 2); // span along x, chord along z
    return g;
  }, [spec]);
  if (!spec || !geometry) return null;

  const span = spec.spanMm * MM;
  const chord = spec.chordMm * MM;
  const h = spec.heightMm * MM;
  // Mount on the rear deck, worked out from the car's overall size.
  const deckY = car.sizeM.height * 0.78;
  const deckZ = (car.sizeM.length / 2) * 0.72;
  const wingY = deckY + h;
  const mountX = spec.mount === 'swan' ? span * 0.27 : span * 0.22;

  return (
    <group name="mod-wing" position={[0, 0, deckZ]}>
      {/* Main element, a few degrees nose-down for downforce. */}
      <mesh geometry={geometry} position={[0, wingY, 0]} rotation={[-0.16, 0, 0]}>
        <meshStandardMaterial {...CARBON} />
      </mesh>
      {/* Endplates */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * span) / 2, wingY - 0.01, chord * 0.1]}>
          <boxGeometry args={[0.012, chord * 0.55, chord * 0.95]} />
          <meshStandardMaterial {...CARBON} />
        </mesh>
      ))}
      {/* Uprights: swan-neck hangs from above the element, posts sit under it. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * mountX, 0, 0]}>
          <mesh position={[0, deckY + h / 2 + (spec.mount === 'swan' ? 0.02 : 0), spec.mount === 'swan' ? -chord * 0.18 : 0]}>
            <boxGeometry args={[0.016, h + (spec.mount === 'swan' ? 0.05 : 0.01), chord * (spec.mount === 'swan' ? 0.42 : 0.3)]} />
            <meshStandardMaterial {...BRACKET} />
          </mesh>
          <mesh position={[0, deckY + 0.006, -chord * 0.1]}>
            <boxGeometry args={[0.07, 0.012, chord * 0.6]} />
            <meshStandardMaterial {...BRACKET} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- Exhaust tips ------------------------------------------------------------

const TIP_FINISH: Record<string, { color: string; roughness: number; metalness: number }> = {
  titanium: { color: '#8d939c', roughness: 0.3, metalness: 1 },
  steel: { color: '#cfd3d6', roughness: 0.15, metalness: 1 },
  black: { color: '#1c1d1f', roughness: 0.45, metalness: 0.8 },
  burnt: { color: '#8a5f9e', roughness: 0.25, metalness: 1 }, // blued titanium
};

/** Where the tips sit across the rear, as fractions of half the car's width. */
const TIP_LAYOUT: Record<string, number[]> = {
  quad: [-0.42, -0.28, 0.28, 0.42],
  dual: [-0.36, 0.36],
  single: [-0.36],
  'center-triple': [-0.11, 0, 0.11],
};

export function ExhaustMod({ car }: { car: CarDef }) {
  const spec = useRender('exhaust', 'exhaust');
  if (!spec) return null;

  const r = (spec.tipDiameterMm / 2) * MM;
  const y = car.sizeM.height * 0.2;
  const z = car.sizeM.length / 2 - 0.04;
  const finish = TIP_FINISH[spec.finish];

  return (
    <group name="mod-exhaust">
      {TIP_LAYOUT[spec.layout].map((frac) => (
        <group key={frac} position={[frac * (car.sizeM.width / 2) * 2 * 0.5, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[r, r * 0.96, 0.2, 24, 1, true]} />
            <meshStandardMaterial {...finish} side={THREE.DoubleSide} />
          </mesh>
          {/* Dark throat so the pipe reads as hollow. */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[r * 0.82, r * 0.82, 0.18, 20]} />
            <meshStandardMaterial color="#060606" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// --- Nitrous bottle ----------------------------------------------------------

export function BottleMod({ car }: { car: CarDef }) {
  const spec = useRender('nitrous', 'bottle');
  if (!spec) return null;

  // Strapped across the cabin floor behind the seats.
  const y = car.sizeM.height * 0.38;
  const z = car.sizeM.wheelbase * 0.18;

  return (
    <group name="mod-bottle" position={[0.2, y, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <capsuleGeometry args={[0.08, 0.34, 8, 20]} />
        <meshStandardMaterial color={spec.hex} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Valve */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.07, 12]} />
        <meshStandardMaterial color="#9aa0a5" roughness={0.35} metalness={0.9} />
      </mesh>
    </group>
  );
}

// --- Roll cage ---------------------------------------------------------------

type V3 = [number, number, number];

/** A straight tube between two points. */
function Bar({ from, to, r, hex }: { from: V3; to: V3; r: number; hex: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const length = dir.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    const position = a.add(b).multiplyScalar(0.5);
    return { position, quaternion, length };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[r, r, length, 12]} />
      <meshStandardMaterial color={hex} roughness={0.35} metalness={0.4} />
    </mesh>
  );
}

/**
 * Bolt-in half cage, laid out from the cabin's real dimensions: main hoop
 * behind the seats, A-pillar legs, door bars, rear stays and a harness bar.
 */
export function CageMod({ car }: { car: CarDef }) {
  const spec = useRender('roll-cage', 'cage');
  const { width: w, height: h, length: l } = car.sizeM;

  const hoop = useMemo(() => {
    if (!spec) return null;
    const hw = w * 0.36; // half the cabin width
    const top = h * 0.88;
    const floor = h * 0.12;
    const z = l * 0.08;
    const pts = [
      new THREE.Vector3(-hw, floor, z),
      new THREE.Vector3(-hw, top - 0.14, z),
      new THREE.Vector3(-hw + 0.12, top, z),
      new THREE.Vector3(hw - 0.12, top, z),
      new THREE.Vector3(hw, top - 0.14, z),
      new THREE.Vector3(hw, floor, z),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.08);
    return new THREE.TubeGeometry(curve, 48, 0.021, 10);
  }, [spec, w, h, l]);
  if (!spec || !hoop) return null;

  const hw = w * 0.36;
  const top = h * 0.88;
  const floor = h * 0.12;
  const z = l * 0.08;
  const r = 0.021;
  const frontZ = -l * 0.14;

  return (
    <group name="mod-cage">
      <mesh geometry={hoop}>
        <meshStandardMaterial color={spec.hex} roughness={0.35} metalness={0.4} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          {/* A-pillar leg, then down to the front floor */}
          <Bar from={[side * hw * 0.97, top * 0.97, z]} to={[side * hw * 0.9, h * 0.5, frontZ]} r={r} hex={spec.hex} />
          <Bar from={[side * hw * 0.9, h * 0.5, frontZ]} to={[side * hw * 0.9, floor, frontZ]} r={r} hex={spec.hex} />
          {/* Door bar */}
          <Bar from={[side * hw, h * 0.18, z]} to={[side * hw * 0.92, h * 0.24, frontZ * 0.9]} r={r} hex={spec.hex} />
          {/* Rear stay down to the parcel shelf */}
          <Bar from={[side * hw * 0.9, top * 0.95, z]} to={[side * w * 0.3, h * 0.3, l * 0.26]} r={r} hex={spec.hex} />
        </group>
      ))}
      {/* Harness bar */}
      <Bar from={[-hw * 0.98, h * 0.55, z]} to={[hw * 0.98, h * 0.55, z]} r={r} hex={spec.hex} />
    </group>
  );
}

// --- Gauge pods --------------------------------------------------------------

/** Pods on the dash top, or a race dash screen, angled at the driver. */
export function GaugeMod({ car }: { car: CarDef }) {
  const spec = useRender('gauges', 'gauges');
  if (!spec) return null;

  const { height: h, wheelbase } = car.sizeM;
  const dashY = h * 0.6;
  const dashZ = -wheelbase * 0.15;
  const driverX = -0.33;

  if (spec.screen) {
    // A dash logger: one wide screen where the cluster sits.
    return (
      <group name="mod-gauges" position={[driverX, dashY + 0.03, dashZ]} rotation={[-0.35, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.17, 0.1, 0.025]} />
          <meshStandardMaterial color="#141518" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <planeGeometry args={[0.15, 0.08]} />
          <meshStandardMaterial color="#0a1b12" emissive="#1fda7c" emissiveIntensity={0.55} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  const r = (spec.podDiameterMm / 2) * MM;
  return (
    <group name="mod-gauges" position={[driverX, dashY + r, dashZ]}>
      {Array.from({ length: spec.pods }, (_, i) => {
        const x = (i - (spec.pods - 1) / 2) * (r * 2.3);
        // Fan the pods so each face points at the driver's head.
        const yaw = -x * 1.1;
        return (
          <group key={i} position={[x, 0, 0]} rotation={[Math.PI / 2 - 0.5, yaw, 0]}>
            <mesh>
              <cylinderGeometry args={[r, r * 0.94, r * 1.5, 20]} />
              <meshStandardMaterial color="#17181b" roughness={0.6} />
            </mesh>
            <mesh position={[0, r * 0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[r * 0.86, 20]} />
              <meshStandardMaterial color="#0c0d10" emissive="#9fd8ff" emissiveIntensity={0.4} roughness={0.25} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// --- Bucket seats ------------------------------------------------------------

/** One stylised full-bucket seat: shell behind, padded face, big bolsters. */
function Seat({ x, car, shellHex, padHex }: { x: number; car: CarDef; shellHex: string; padHex: string }) {
  const y = car.sizeM.height * 0.16;
  const z = car.sizeM.wheelbase * 0.1;
  return (
    <group position={[x, y, z]}>
      {/* Base cushion with thigh bolsters */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.38, 0.1, 0.44]} />
        <meshStandardMaterial color={padHex} roughness={0.85} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.2, 0.08, 0.02]} rotation={[0, 0, side * -0.35]}>
          <boxGeometry args={[0.07, 0.14, 0.4]} />
          <meshStandardMaterial color={padHex} roughness={0.85} />
        </mesh>
      ))}
      {/* Backrest, tilted back, with the shell showing behind */}
      <group position={[0, 0.06, 0.2]} rotation={[0.3, 0, 0]}>
        <mesh position={[0, 0.34, -0.01]}>
          <boxGeometry args={[0.4, 0.7, 0.06]} />
          <meshStandardMaterial color={padHex} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.33, 0.035]}>
          <boxGeometry args={[0.43, 0.74, 0.025]} />
          <meshStandardMaterial color={shellHex} roughness={0.35} metalness={0.15} />
        </mesh>
        {/* Shoulder bolsters */}
        {([-1, 1] as const).map((side) => (
          <mesh key={side} position={[side * 0.19, 0.3, -0.05]} rotation={[0, side * -0.25, 0]}>
            <boxGeometry args={[0.07, 0.56, 0.12]} />
            <meshStandardMaterial color={padHex} roughness={0.85} />
          </mesh>
        ))}
        {/* Head surround */}
        <mesh position={[0, 0.68, -0.02]}>
          <boxGeometry args={[0.3, 0.16, 0.1]} />
          <meshStandardMaterial color={padHex} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

/** Seats are sold in pairs: driver and passenger. */
export function SeatsMod({ car }: { car: CarDef }) {
  const spec = useRender('seats', 'seat');
  if (!spec) return null;
  return (
    <group name="mod-seats">
      {[-0.33, 0.33].map((x) => (
        <Seat key={x} x={x} car={car} shellHex={spec.shellHex} padHex={spec.padHex} />
      ))}
    </group>
  );
}

// --- Steering wheel ----------------------------------------------------------

/** Aftermarket wheel on the column: rim, three spokes, dished hub. */
export function SteeringMod({ car }: { car: CarDef }) {
  const spec = useRender('steering', 'steering');
  if (!spec) return null;

  const R = (spec.diameterMm / 2) * MM;
  const dish = spec.dishMm * MM;
  const rimR = 0.0155;

  return (
    <group
      name="mod-steering"
      position={[-0.33, car.sizeM.height * 0.55, -car.sizeM.wheelbase * 0.08]}
      rotation={[-0.35, 0, 0]}
    >
      {/* Rim */}
      <mesh>
        <torusGeometry args={[R - rimR, rimR, 12, 36]} />
        <meshStandardMaterial color={spec.rimHex} roughness={0.7} />
      </mesh>
      {/* Three spokes: 3 o'clock, 9 o'clock and 6 o'clock */}
      {[0, Math.PI, -Math.PI / 2].map((angle) => (
        <mesh
          key={angle}
          position={[(Math.cos(angle) * R) / 2, (Math.sin(angle) * R) / 2, -dish / 3]}
          rotation={[0, 0, angle]}
        >
          <boxGeometry args={[R, 0.03, 0.008]} />
          <meshStandardMaterial color={spec.spokeHex} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* Dished hub back to the column, and the horn pad */}
      <mesh position={[0, 0, -dish / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.034, 0.042, Math.max(dish, 0.03), 16]} />
        <meshStandardMaterial color="#17181a" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, -dish / 3 + 0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.012, 16]} />
        <meshStandardMaterial color={spec.rimHex} roughness={0.6} />
      </mesh>
    </group>
  );
}

// --- Harnesses ---------------------------------------------------------------

/** Six-point harness draped over one seat: shoulder straps, lap belt, cam lock. */
function Harness({ x, car, strapHex }: { x: number; car: CarDef; strapHex: string }) {
  const y = car.sizeM.height * 0.16; // same floor point the seats use
  const z = car.sizeM.wheelbase * 0.1;
  const strap = <meshStandardMaterial color={strapHex} roughness={0.8} />;
  return (
    <group position={[x, y, z]}>
      {/* Shoulder straps over the backrest, down to the lap */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.07, 0.52, 0.17]} rotation={[0.62, 0, side * -0.05]}>
          <boxGeometry args={[0.048, 0.56, 0.009]} />
          {strap}
        </mesh>
      ))}
      {/* Lap belts out to the floor mounts */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.11, 0.17, 0.05]} rotation={[0, 0, side * 0.9]}>
          <boxGeometry args={[0.048, 0.24, 0.009]} />
          {strap}
        </mesh>
      ))}
      {/* Anti-submarine strap and the cam lock */}
      <mesh position={[0, 0.16, 0.03]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.048, 0.18, 0.009]} />
        {strap}
      </mesh>
      <mesh position={[0, 0.24, 0.07]} rotation={[Math.PI / 2 - 0.5, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.02, 16]} />
        <meshStandardMaterial color="#b9bdc1" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

export function HarnessMod({ car }: { car: CarDef }) {
  const spec = useRender('harness', 'harness');
  if (!spec) return null;
  return (
    <group name="mod-harness">
      {[-0.33, 0.33].map((x) => (
        <Harness key={x} x={x} car={car} strapHex={spec.strapHex} />
      ))}
    </group>
  );
}

// --- Body kit ----------------------------------------------------------------

const SATIN_BLACK = { color: '#141517', roughness: 0.6, metalness: 0.1 };
const FIBREGLASS = { color: '#1d1e20', roughness: 0.5, metalness: 0.05 };

/**
 * Stylised kit pieces hung on the real body: riveted over-fenders for the
 * widebody kits, plus front lip, side skirts and a rear diffuser. A sculpted
 * kit needs a sourced model; this stands in until one exists.
 */
export function BodyKitMod({ car, mounts }: { car: CarDef; mounts: { front: AxleMount; rear: AxleMount } }) {
  const spec = useRender('body-kit', 'bodykit');
  // A dedicated diffuser replaces the kit's own rear piece.
  const dedicatedDiffuser = useRender('diffuser', 'diffuser');
  if (!spec) return null;

  const { width: w, length: l, wheelbase } = car.sizeM;
  const finish = spec.carbon ? CARBON : spec.widebody ? SATIN_BLACK : FIBREGLASS;

  return (
    <group name="mod-bodykit">
      {/* Over-fenders around each arch */}
      {spec.widebody &&
        (['front', 'rear'] as const).map((axle) =>
          ([-1, 1] as const).map((side) => {
            const m = mounts[axle];
            const R = m.y + 0.09;
            return (
              <mesh
                key={`${axle}${side}`}
                position={[side * (w / 2 + 0.035), m.y, m.z]}
                rotation={[0, Math.PI / 2, 0]}
                scale={[1, 1, 0.55]}
              >
                <torusGeometry args={[R, 0.05, 10, 24, Math.PI]} />
                <meshStandardMaterial {...finish} />
              </mesh>
            );
          }),
        )}
      {/* Front lip */}
      <mesh position={[0, 0.09, -(l / 2) * 0.93]}>
        <boxGeometry args={[w * 0.88, 0.045, 0.3]} />
        <meshStandardMaterial {...finish} />
      </mesh>
      {/* Side skirts */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * (w / 2 - 0.03), 0.1, 0]}>
          <boxGeometry args={[0.1, 0.07, wheelbase * 0.72]} />
          <meshStandardMaterial {...finish} />
        </mesh>
      ))}
      {/* Rear diffuser, unless a dedicated one is fitted */}
      {!dedicatedDiffuser && (
        <mesh position={[0, 0.12, (l / 2) * 0.9]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[w * 0.7, 0.04, 0.34]} />
          <meshStandardMaterial {...finish} />
        </mesh>
      )}
    </group>
  );
}

// --- Carbon hood -------------------------------------------------------------

/** Carbon skin over the bonnet, with a vent slot when the hood has one. */
export function HoodMod({ car }: { car: CarDef }) {
  const spec = useRender('hood', 'hood');
  if (!spec) return null;

  const { width: w, length: l, height: h } = car.sizeM;
  return (
    <group name="mod-hood" position={[0, h * 0.66, -l * 0.3]} rotation={[-0.12, 0, 0]}>
      <mesh>
        <boxGeometry args={[w * 0.78, 0.014, l * 0.2]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>
      {spec.vented && (
        <mesh position={[0, 0.009, -l * 0.03]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[w * 0.32, 0.008, l * 0.05]} />
          <meshStandardMaterial color="#060607" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

// --- Rear diffuser -----------------------------------------------------------

/** Angled diffuser plate with vertical strakes under the rear bumper. */
export function DiffuserMod({ car }: { car: CarDef }) {
  const spec = useRender('diffuser', 'diffuser');
  if (!spec) return null;

  const { width: w, length: l } = car.sizeM;
  const plateW = w * 0.72;
  return (
    <group name="mod-diffuser" position={[0, 0.13, (l / 2) * 0.9]} rotation={[0.3, 0, 0]}>
      <mesh>
        <boxGeometry args={[plateW, 0.035, 0.36]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>
      {/* Strakes */}
      {Array.from({ length: spec.fins }, (_, i) => {
        const x = (i - (spec.fins - 1) / 2) * (plateW / spec.fins);
        return (
          <mesh key={i} position={[x, -0.045, 0.02]}>
            <boxGeometry args={[0.012, 0.09, 0.3]} />
            <meshStandardMaterial {...CARBON} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Everything that rides on the body. */
export function BodyMods({ car, mounts }: { car: CarDef; mounts: { front: AxleMount; rear: AxleMount } }) {
  return (
    <>
      <WingMod car={car} />
      <ExhaustMod car={car} />
      <BottleMod car={car} />
      <CageMod car={car} />
      <GaugeMod car={car} />
      <SeatsMod car={car} />
      <SteeringMod car={car} />
      <HarnessMod car={car} />
      <BodyKitMod car={car} mounts={mounts} />
      <HoodMod car={car} />
      <DiffuserMod car={car} />
    </>
  );
}

// --- Coilovers ---------------------------------------------------------------

/** A helix for the spring coil. */
function springCurve(radius: number, coils: number, height: number): THREE.Curve<THREE.Vector3> {
  const points: THREE.Vector3[] = [];
  const steps = Math.round(coils * 24);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = coils * Math.PI * 2 * t;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, t * height, Math.sin(angle) * radius));
  }
  return new THREE.CatmullRomCurve3(points);
}

/** One suspension unit, drawn just inboard of a wheel. */
export function CoiloverMod({ setup, side }: { setup: AxleSetup; side: 1 | -1 }) {
  const spec = useRender('suspension', 'coilovers');
  const spring = useMemo(() => {
    if (!spec || spec.air) return null;
    return new THREE.TubeGeometry(springCurve(0.048, 6.5, 0.2), 160, 0.0075, 8);
  }, [spec]);
  if (!spec) return null;

  const x = side * Math.max(setup.hubX - 0.16, 0.2);
  const baseY = setup.axleY + 0.02;

  return (
    <group name="mod-coilover" position={[x, baseY, setup.z]} rotation={[0, 0, side * 0.12]}>
      {spec.air ? (
        // Air spring: a fat rubber bag.
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.058, 0.064, 0.15, 20]} />
          <meshStandardMaterial color={spec.springHex} roughness={0.9} metalness={0} />
        </mesh>
      ) : (
        spring && (
          <mesh geometry={spring} position={[0, 0.08, 0]}>
            <meshStandardMaterial color={spec.springHex} roughness={0.45} metalness={0.4} />
          </mesh>
        )
      )}
      {/* Damper body and shaft */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.14, 16]} />
        <meshStandardMaterial color={spec.bodyHex} roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.22, 10]} />
        <meshStandardMaterial color="#c9cdd1" roughness={0.2} metalness={1} />
      </mesh>
    </group>
  );
}
