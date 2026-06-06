"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function TorusKnot() {
  const mesh = useRef<any>(null);
  const light1 = useRef<any>(null);
  const light2 = useRef<any>(null);

  useFrame((state: any) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.x = t * 0.1;
      mesh.current.rotation.y = t * 0.15;
      mesh.current.rotation.z = t * 0.05;
    }
    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.6) * 4;
      light1.current.position.y = Math.cos(t * 0.4) * 3;
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(t * 0.5) * 3;
      light2.current.position.z = Math.sin(t * 0.3) * 4;
    }
  });

  return (
    <>
      {/* @ts-ignore */}
      <pointLight ref={light1} intensity={8} color="#a78bfa" distance={12} decay={2} />
      {/* @ts-ignore */}
      <pointLight ref={light2} intensity={5} color="#60a5fa" distance={10} decay={2} />
      {/* @ts-ignore */}
      <mesh ref={mesh}>
        {/* @ts-ignore */}
        <torusKnotGeometry args={[1.1, 0.38, 180, 32, 2, 3]} />
        {/* @ts-ignore */}
        <meshStandardMaterial
          color="#2d1060"
          emissive="#6d28d9"
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.9}
        />
        {/* @ts-ignore */}
      </mesh>
    </>
  );
}

export default function FloatingTorus() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true } as any}
      camera={{ position: [0, 0, 5], fov: 42 } as any}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      {/* @ts-ignore */}
      <ambientLight intensity={0.4} color="#c4b5fd" />
      <TorusKnot />
    </Canvas>
  );
}
