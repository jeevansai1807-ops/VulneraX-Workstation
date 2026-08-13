import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, Lightformer } from '@react-three/drei';
import { useTheme } from './ThemeProvider';

function Knot({ isDark }) {
  const meshRef = useRef(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = t * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.5, 0.5, 256, 64]} />
        <meshPhysicalMaterial 
          color={isDark ? "#0f172a" : "#0ea5e9"}
          roughness={isDark ? 0.1 : 0.1}
          metalness={isDark ? 0.9 : 0.4}
          clearcoat={isDark ? 1.0 : 1.0}
          clearcoatRoughness={0.1}
          envMapIntensity={isDark ? 2 : 1.5}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 z-0 w-full h-full pointer-events-none transition-colors duration-500">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={isDark ? 0.1 : 0.8} />
        <directionalLight position={[5, 5, 5]} intensity={isDark ? 3 : 2.5} color={isDark ? "#06b6d4" : "#ec4899"} />
        <directionalLight position={[-5, -5, -2]} intensity={isDark ? 2 : 2} color={isDark ? "#ec4899" : "#3b82f6"} />
        
        <Knot isDark={isDark} />
        
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 4, -Math.PI / 4, 0]}>
            <Lightformer form="rect" intensity={isDark ? 4 : 2} color={isDark ? "#06b6d4" : "#ffffff"} position={[5, 5, -5]} scale={[10, 10, 1]} />
            <Lightformer form="rect" intensity={isDark ? 2 : 1.5} color={isDark ? "#ec4899" : "#ffffff"} position={[-5, 5, 5]} scale={[10, 10, 1]} />
            <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, -5, 0]} scale={[10, 10, 1]} />
          </group>
        </Environment>

        <ContactShadows position={[0, -3, 0]} opacity={isDark ? 1 : 0.4} scale={10} blur={2.5} far={4} color={isDark ? "#000000" : "#94a3b8"} />
      </Canvas>
    </div>
  );
}
