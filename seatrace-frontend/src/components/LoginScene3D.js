import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';

function CyberShip(props) {
    const meshRef = useRef();

    useFrame((state) => {
        // Slow rotation
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
            meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group {...props} ref={meshRef}>
            {/* Abstract Ship Hull */}
            <mesh position={[0, 0, 0]}>
                <octahedronGeometry args={[2, 0]} />
                <meshStandardMaterial color="#06b6d4" wireframe />
            </mesh>
            {/* Inner Core */}
            <mesh position={[0, 0, 0]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={2} />
            </mesh>
        </group>
    );
}

function Particles() {
    const ref = useRef();
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y -= delta * 0.05;
        }
    });

    return (
        <group ref={ref}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

const LoginScene3D = () => {
    return (
        <div className="absolute inset-0 z-0 bg-slate-900">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <CyberShip position={[0, 0, 0]} />
                </Float>

                <Particles />

                {/* Grid Floor Effect */}
                <gridHelper args={[100, 50, 0x06b6d4, 0x1e293b]} position={[0, -5, 0]} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900 pointer-events-none"></div>
        </div>
    );
};

export default LoginScene3D;
