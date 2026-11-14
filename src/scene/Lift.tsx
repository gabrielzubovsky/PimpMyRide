import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { CarDef } from '../data/types';

// An in-ground lift: two runners that sit flush with the floor and rise on
// rams. The car only starts to move once the runners reach its underside.

const RUNNER_WIDTH = 0.24;
const RUNNER_THICKNESS = 0.06;
const REST_TOP = 0.012; // runner top when parked in the floor
const RAM_RADIUS = 0.085;
const LAMP_POWER = 4.5; // brightness of each floor lamp when the car is fully up
const LAMPS = [-1.5, 0.2, 1.9]; // positions along the car

interface LiftProps {
  raised: boolean;
  spec: CarDef['lift'];
  /** Current height of the car's jacking points above the ground. */
  contactY: number;
  children: ReactNode;
}

export function Lift({ raised, spec, contactY, children }: LiftProps) {
  const carGroup = useRef<THREE.Group>(null);
  const runners = useRef<THREE.Group>(null);
  const rams = useRef<THREE.Group>(null);
  const lamps = useRef<THREE.Group>(null);
  const top = useRef(REST_TOP);

  useFrame((_, delta) => {
    const goal = raised ? spec.heightM + contactY : REST_TOP;
    top.current = THREE.MathUtils.damp(top.current, goal, 2.6, delta);
    if (Math.abs(top.current - goal) < 0.0005) top.current = goal;

    if (runners.current) runners.current.position.y = top.current - RUNNER_THICKNESS / 2;
    if (rams.current) {
      // Stretch the rams from the floor up to the runners.
      const length = Math.max(top.current - RUNNER_THICKNESS, 0.001);
      rams.current.scale.y = length;
      rams.current.visible = length > 0.01;
    }
    const raise = Math.max(0, top.current - contactY);
    if (carGroup.current) carGroup.current.position.y = raise;

    // Floor lamps come up with the car so its underside is not left in the dark.
    if (lamps.current) {
      const power = LAMP_POWER * THREE.MathUtils.clamp(raise / spec.heightM, 0, 1);
      lamps.current.visible = power > 0.01;
      for (const lamp of lamps.current.children) (lamp as THREE.PointLight).intensity = power;
    }
  });

  return (
    <>
      <group ref={carGroup}>{children}</group>

      <group ref={runners}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * spec.runnerX, 0, spec.runnerZ]}>
            <boxGeometry args={[RUNNER_WIDTH, RUNNER_THICKNESS, spec.runnerLength]} />
            <meshStandardMaterial color="#2c2f32" metalness={0.6} roughness={0.5} />
          </mesh>
        ))}
      </group>

      <group ref={lamps} visible={false}>
        {LAMPS.map((z) => (
          <pointLight key={z} position={[0, 0.2, z]} color="#fff3e2" intensity={0} distance={7} decay={1.6} />
        ))}
      </group>

      <group ref={rams}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * spec.runnerX, 0.5, spec.runnerZ]}>
            <cylinderGeometry args={[RAM_RADIUS, RAM_RADIUS, 1, 32]} />
            <meshStandardMaterial color="#c8cbce" metalness={1} roughness={0.18} />
          </mesh>
        ))}
      </group>
    </>
  );
}
