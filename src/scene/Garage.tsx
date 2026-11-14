import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

// The room the car sits in. Nothing here is loaded from a file: the walls,
// floor and lights are simple shapes.
//
// Car paint gets most of its look from what it reflects, so the reflections
// are set up separately in <Environment>. It renders a small hidden scene of
// glowing panels into a texture that every shiny material then mirrors.

const ROOM = { width: 16, height: 4.4, depth: 20 };
const STRIPS = [-2.6, 0, 2.6]; // ceiling light strips, positions across the room
const WALL = '#787d82';
const WALL_BAND = '#3d4145';
const BACKGROUND = '#1a1c1e';

export function Garage() {
  return (
    <>
      <color attach="background" args={[BACKGROUND]} />

      <hemisphereLight args={['#ffffff', '#55585c', 1.1]} />
      <directionalLight position={[4, 7, 3]} intensity={1.1} />

      <Environment resolution={512} frames={1}>
        <color attach="background" args={['#1d1f21']} />
        {/* Overhead strips: the long highlights that run down the bodywork. */}
        {STRIPS.map((x) => (
          <Lightformer key={x} form="rect" intensity={5} position={[x, 4.2, 0]} rotation-x={Math.PI / 2} scale={[0.7, 13, 1]} />
        ))}
        {/* Soft fill from the walls so the sides are not black. */}
        <Lightformer form="rect" intensity={1.5} color="#cfd6dc" position={[-8, 1.6, 0]} rotation-y={Math.PI / 2} scale={[20, 3.2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#cfd6dc" position={[8, 1.6, 0]} rotation-y={-Math.PI / 2} scale={[20, 3.2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 1.8, -10]} scale={[10, 2.6, 1]} />
        <Lightformer form="rect" intensity={0.7} position={[0, 1.8, 10]} rotation-y={Math.PI} scale={[10, 2.6, 1]} />
        {/* A pale floor, so the lower body picks up some light from below. */}
        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial color="#6c6f72" />
        </mesh>
      </Environment>

      <Room />

      {STRIPS.map((x) => (
        <mesh key={x} position={[x, ROOM.height - 0.02, 0]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.5, 13]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      ))}

      {/* Sealed concrete floor with a soft reflection of the car. */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <MeshReflectorMaterial
          color="#4a4d50"
          metalness={0.2}
          roughness={0.7}
          resolution={1024}
          blur={[500, 160]}
          mixBlur={1}
          mixStrength={2.2}
          mirror={0.5}
          depthScale={1}
          minDepthThreshold={0.6}
          maxDepthThreshold={1.2}
        />
      </mesh>

      <BayMarkings />

      {/* A soft dark patch under the car where it blocks the light. */}
      <ContactShadows position={[0, 0.004, 0]} scale={9} resolution={1024} blur={2.4} opacity={0.75} far={1.3} />
    </>
  );
}

/**
 * Walls and ceiling: boxes seen from the inside. A box has six faces, drawn in
 * the order right, left, top, bottom, front, back, and each can have its own
 * material. Faces that would get in the way are given an invisible one: the
 * bottom of the room (the floor is a separate mesh) and the top and bottom of
 * the dark band, which would otherwise act as a low ceiling.
 */
function Room() {
  const materials = useMemo(() => {
    const wall = new THREE.MeshStandardMaterial({ color: WALL, roughness: 0.95, side: THREE.BackSide });
    const band = new THREE.MeshStandardMaterial({ color: WALL_BAND, roughness: 0.9, side: THREE.BackSide });
    const none = new THREE.MeshBasicMaterial({ visible: false });
    return { wall, band, none };
  }, []);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);
  const { wall, band, none } = materials;

  return (
    <>
      <mesh position-y={ROOM.height / 2} material={[wall, wall, wall, none, wall, wall]}>
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.depth]} />
      </mesh>
      {/* A darker band along the bottom of the walls, as in a workshop. */}
      <mesh position-y={0.55} material={[band, band, none, none, band, band]}>
        <boxGeometry args={[ROOM.width - 0.02, 1.1, ROOM.depth - 0.02]} />
      </mesh>
    </>
  );
}

/** Painted outline of the work bay. */
function BayMarkings() {
  const w = 3.3;
  const d = 6.4;
  const line = 0.09;
  const lines: Array<[x: number, z: number, sx: number, sz: number]> = [
    [-w / 2, 0, line, d],
    [w / 2, 0, line, d],
    [0, -d / 2, w + line, line],
    [0, d / 2, w + line, line],
  ];
  return (
    <group position-y={0.002}>
      {lines.map(([x, z, sx, sz], i) => (
        <mesh key={i} position={[x, 0, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[sx, sz]} />
          <meshStandardMaterial color="#d8b23a" roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
    </group>
  );
}
