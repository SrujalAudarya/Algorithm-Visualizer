import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// Global mouse normalized coords
const mouse = new THREE.Vector2(0, 0);
const smoothMouse = new THREE.Vector2(0, 0);

const CameraRig = () => {
  const { camera } = useThree();

  useFrame(() => {
    // Smooth lerp toward mouse position
    smoothMouse.x += (mouse.x * 2.5 - smoothMouse.x) * 0.04;
    smoothMouse.y += (mouse.y * 1.5 - smoothMouse.y) * 0.04;

    camera.position.x = smoothMouse.x;
    camera.position.y = -smoothMouse.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const ParticleField = () => {
  const points = useRef<THREE.Points>(null);
  const count = 250;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    points.current.rotation.y = t * 0.025;
    points.current.rotation.x = Math.sin(t * 0.015) * 0.12;
    // React to mouse slightly
    points.current.rotation.z = smoothMouse.x * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color="#22d3ee" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const ConnectionLines = () => {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = 20;

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      )
    );
  }, []);

  const edges = useMemo(() => {
    const e: [number, number][] = [];
    for (let i = 0; i < nodeCount; i++) {
      const closest: { dist: number; idx: number }[] = [];
      for (let j = 0; j < nodeCount; j++) {
        if (i === j) continue;
        closest.push({ dist: nodes[i].distanceTo(nodes[j]), idx: j });
      }
      closest.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < Math.min(2, closest.length); k++) {
        const a = Math.min(i, closest[k].idx);
        const b = Math.max(i, closest[k].idx);
        if (!e.some(([x, y]) => x === a && y === b)) e.push([a, b]);
      }
    }
    return e;
  }, [nodes]);

  const lineObjects = useMemo(() => {
    return edges.map(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([nodes[a], nodes[b]]);
      const mat = new THREE.LineBasicMaterial({ color: "#0e7490", transparent: true, opacity: 0.25 });
      return new THREE.Line(geo, mat);
    });
  }, [edges, nodes]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.035;
    // Mouse reactive rotation
    groupRef.current.rotation.x = smoothMouse.y * 0.15;
    groupRef.current.rotation.z = smoothMouse.x * 0.08;
  });

  return (
    <group ref={groupRef}>
      {lineObjects.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      {nodes.map((pos, i) => (
        <Float key={i} speed={1.2} floatIntensity={0.25} rotationIntensity={0}>
          <mesh position={pos}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.75} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const HeroScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Only track if mouse is over the hero area
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
  }, []);

  useEffect(() => {
    // Listen on document so Canvas doesn't block events
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <Stars radius={50} depth={30} count={600} factor={2} saturation={0} fade speed={0.4} />
        <ParticleField />
        <ConnectionLines />
        <CameraRig />
      </Canvas>
    </div>
  );
};

export default HeroScene;
