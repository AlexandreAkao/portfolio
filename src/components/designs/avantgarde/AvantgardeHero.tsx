import { useRef, useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLocale } from '@i18n/useLocale';
import { t } from '@i18n/utils';

const PARTICLE_COUNT_DESKTOP = 200;
const PARTICLE_COUNT_MOBILE = 80;
const CONNECTION_DISTANCE = 1.8;

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const { size, viewport } = useThree();

  const isMobile = size.width < 768;
  const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, [count]);

  const opacities = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = 0.3 + Math.random() * 0.7;
    }
    return arr;
  }, [count]);

  const linePositions = useMemo(
    () => new Float32Array(count * count * 0.1 * 6),
    [count]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const posArr = posAttr.array as Float32Array;

    const mouseWorld = new THREE.Vector3(
      mouseRef.current.x * viewport.width * 0.5,
      mouseRef.current.y * viewport.height * 0.5,
      0
    );

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      posArr[ix] += velocities[ix];
      posArr[ix + 1] += velocities[ix + 1];
      posArr[ix + 2] += velocities[ix + 2];

      // Mouse repulsion
      const dx = posArr[ix] - mouseWorld.x;
      const dy = posArr[ix + 1] - mouseWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        const force = (2 - dist) * 0.003;
        posArr[ix] += dx * force;
        posArr[ix + 1] += dy * force;
      }

      // Bounds
      if (Math.abs(posArr[ix]) > 7) velocities[ix] *= -1;
      if (Math.abs(posArr[ix + 1]) > 5) velocities[ix + 1] *= -1;
      if (Math.abs(posArr[ix + 2]) > 3) velocities[ix + 2] *= -1;
    }
    posAttr.needsUpdate = true;

    // Connection lines (desktop only)
    if (!isMobile && linesRef.current) {
      let lineIndex = 0;
      const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count && lineIndex < linePositions.length - 6; i++) {
        for (let j = i + 1; j < count && lineIndex < linePositions.length - 6; j++) {
          const dx = posArr[i * 3] - posArr[j * 3];
          const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
          const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (d < CONNECTION_DISTANCE) {
            lineArr[lineIndex++] = posArr[i * 3];
            lineArr[lineIndex++] = posArr[i * 3 + 1];
            lineArr[lineIndex++] = posArr[i * 3 + 2];
            lineArr[lineIndex++] = posArr[j * 3];
            lineArr[lineIndex++] = posArr[j * 3 + 1];
            lineArr[lineIndex++] = posArr[j * 3 + 2];
          }
        }
      }

      // Clear remaining
      for (let i = lineIndex; i < lineArr.length; i++) {
        lineArr[i] = 0;
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.setDrawRange(0, lineIndex / 3);
    }
  });

  return (
    <>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-opacity"
            args={[opacities, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#c5ff41"
          size={0.04}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {!isMobile && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#c5ff41" transparent opacity={0.06} />
        </lineSegments>
      )}
    </>
  );
}

export default function AvantgardeHero() {
  const locale = useLocale();
  const name = t('hero.name', locale);
  const title = t('hero.title', locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const words = name.split(' ');

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden">
      {/* Three.js Background */}
      {mounted && (
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            dpr={[1, 1.5]}
            style={{ background: 'transparent' }}
          >
            <Particles />
          </Canvas>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm uppercase tracking-[0.3em] text-text-secondary"
        >
          {t('hero.greeting', locale)}
        </motion.p>

        <h1
          className="mb-4 text-left font-heading text-[clamp(2.25rem,8vw,6.5rem)] font-bold leading-[0.95]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {words.map((word, wordIndex) => {
            const charOffset = words.slice(0, wordIndex).reduce((sum, w) => sum + w.length + 1, 0);
            return (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + (charOffset + charIndex) * 0.03 }}
                    className="inline-block text-text"
                  >
                    {char}
                  </motion.span>
                ))}
                {wordIndex < words.length - 1 && <span>{'\u00A0'}</span>}
              </span>
            );
          })}
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-4 h-px origin-left bg-accent"
          style={{ maxWidth: '200px' }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-6 text-xl text-text-secondary md:text-2xl"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-10 max-w-lg text-base text-text-secondary"
        >
          {t('hero.tagline', locale)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-wrap gap-4"
        >
          <a
            href="#projects"
            className="rounded-[var(--radius-btn)] bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wider text-[#131211] transition-colors hover:bg-accent-hover sm:px-8"
          >
            {t('hero.cta.work', locale)}
          </a>
          <a
            href="/resume/Alexandre_Akira_en_CV.pdf"
            download
            className="rounded-[var(--radius-btn)] border border-accent px-5 py-3 text-sm font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent/10 sm:px-8"
          >
            {t('hero.cta.cv', locale)}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
