import { useEffect, useMemo } from 'react';
import type { Axle, BrakeFitment, Surface, WheelFinish } from '../data/types';
import { buildBrake, disposeBrake } from '../parts/brake';
import { buildTyre } from '../parts/tyre';
import { buildWheel, disposeWheel, type WheelSpec } from '../parts/wheel';
import { MM } from '../units';
import type { AxleSetup } from './stance';

// Everything that hangs off the hubs of one axle: brake, wheel and tyre, on
// both sides of the car.
//
// The part generators build around the Y axis (Y is the axle). Here each
// corner is turned so the axle points out of the side of the car. The left
// side is a mirror image of the right, which is why it uses a scale of -1.

const BRAKE_HUB_OFFSET_MM = 50; // middle of the disc sits this far inboard of the hub face

interface AxleAssemblyProps {
  axle: Axle;
  setup: AxleSetup;
  wheel: WheelSpec;
  tyre: { widthMm: number; aspect: number };
  finish: WheelFinish;
  brake: BrakeFitment;
  caliperColor: string;
}

export function AxleAssembly({ axle, setup, wheel, tyre, finish, brake, caliperColor }: AxleAssemblyProps) {
  // Geometry is rebuilt only when the specs change, and shared by both sides.
  const wheelKey = JSON.stringify(wheel);
  const wheelGeo = useMemo(() => buildWheel(wheel), [wheelKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => disposeWheel(wheelGeo), [wheelGeo]);

  const tyreGeo = useMemo(
    () => buildTyre({ ...tyre, rimDiameterIn: wheel.diameterIn, rimWidthIn: wheel.widthIn }),
    [tyre.widthMm, tyre.aspect, wheel.diameterIn, wheel.widthIn], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => () => tyreGeo.dispose(), [tyreGeo]);

  const brakeGeo = useMemo(
    () => buildBrake({ ...brake, hubFaceOffsetMm: BRAKE_HUB_OFFSET_MM }),
    [brake],
  );
  useEffect(() => () => disposeBrake(brakeGeo), [brakeGeo]);

  // The caliper geometry points along +X, which after the turn below is
  // straight down. Swing it round to sit ahead of or behind the axle.
  const caliperAngle = brake.caliperSide === 'behind' ? -Math.PI / 2 : Math.PI / 2;

  return (
    <>
      {[-1, 1].map((side) => (
        <group
          key={side}
          name={`corner_${axle}_${side < 0 ? 'left' : 'right'}`}
          position={[side * setup.hubX, setup.axleY, setup.z]}
          scale={[side, 1, 1]}
        >
          {/* Turn the axle from Y to X. The origin is now the hub face. */}
          <group rotation={[0, 0, -Math.PI / 2]}>
            <group position-y={-BRAKE_HUB_OFFSET_MM * MM}>
              <mesh geometry={brakeGeo.disc}>
                <meshStandardMaterial color="#3d3f41" metalness={0.55} roughness={0.5} />
              </mesh>
              <mesh geometry={brakeGeo.hat}>
                <meshStandardMaterial color="#8d9093" metalness={0.9} roughness={0.4} />
              </mesh>
              <mesh geometry={brakeGeo.caliper} rotation-y={caliperAngle}>
                <meshPhysicalMaterial color={caliperColor} metalness={0.1} roughness={0.45} clearcoat={1} clearcoatRoughness={0.1} />
              </mesh>
            </group>

            {/* The wheel's own origin is its centreline, so slide it by the offset. */}
            <group position-y={-setup.offsetM} rotation-y={Math.PI}>
              <mesh geometry={wheelGeo.face}>
                <SurfaceMaterial surface={finish.face} />
              </mesh>
              <mesh geometry={wheelGeo.lip}>
                <SurfaceMaterial surface={finish.lip} />
              </mesh>
              <mesh geometry={wheelGeo.barrel}>
                <SurfaceMaterial surface={finish.barrel} />
              </mesh>
              <mesh geometry={wheelGeo.cap}>
                <SurfaceMaterial surface={finish.cap} />
              </mesh>
              <mesh geometry={wheelGeo.hardware}>
                <meshStandardMaterial color="#c9ccd0" metalness={1} roughness={0.25} />
              </mesh>
              <mesh geometry={tyreGeo}>
                <meshStandardMaterial color="#0e0e0f" metalness={0} roughness={0.82} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </>
  );
}

function SurfaceMaterial({ surface }: { surface: Surface }) {
  return (
    <meshPhysicalMaterial
      color={surface.color}
      metalness={surface.metalness}
      roughness={surface.roughness}
      clearcoat={surface.clearcoat ?? 0}
      clearcoatRoughness={0.15}
    />
  );
}
