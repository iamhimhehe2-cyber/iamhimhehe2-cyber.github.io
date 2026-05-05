import React, { useMemo } from 'react';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

/* ══════════════════════════════════════════════════════════════════════════════
   DEEP SPACE  –  asteroids, shooting stars, nebula
══════════════════════════════════════════════════════════════════════════════ */
function SpaceEnvironment() {
  const rng = seeded(42);

  // Asteroids
  const asteroids = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: 28 + rng() * 32,
      startX: rng() * 120 - 10,      // % from left (can start off-screen)
      startY: rng() * 100,
      dur: 28 + rng() * 24,           // seconds
      delay: -rng() * 30,
      rotate: rng() * 360,
      rotateSpeed: (rng() > 0.5 ? 1 : -1) * (8 + rng() * 14),
    })), []);

  // Shooting stars
  const shootingStars = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: rng() * 60,
      dur: 1.2 + rng() * 1.2,
      delay: rng() * 14,
      length: 80 + rng() * 120,
    })), []);

  // Nebula blobs
  const nebulae = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 10 + rng() * 80,
      y: 5 + rng() * 80,
      r: 180 + rng() * 200,
      color: ['rgba(139,92,246,0.07)', 'rgba(56,189,248,0.06)', 'rgba(245,158,11,0.05)'][i],
    })), []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Nebula clouds */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {nebulae.map(n => (
          <circle key={n.id} cx={n.x} cy={n.y} r={n.r / 10} fill={n.color} style={{ filter: 'blur(18px)' }} />
        ))}
      </svg>

      {/* Asteroids */}
      {asteroids.map(a => (
        <div key={a.id} style={{
          position: 'absolute',
          left: `${a.startX}%`,
          top: `${a.startY}%`,
          width: a.size,
          height: a.size,
          animation: `asteroid-drift ${a.dur}s ${a.delay}s linear infinite`,
          willChange: 'transform',
        }}>
          <svg viewBox="0 0 60 60" style={{
            width: '100%', height: '100%',
            animation: `asteroid-spin ${a.rotateSpeed}s linear infinite`,
            filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.5))',
          }}>
            <polygon points="30,4 52,16 56,40 38,56 12,54 4,30 18,8" fill="#374151" stroke="#6b7280" strokeWidth="1.5" />
            <circle cx="20" cy="22" r="4" fill="#1f2937" />
            <circle cx="38" cy="35" r="3" fill="#1f2937" />
            <circle cx="30" cy="42" r="2" fill="#1f2937" />
          </svg>
        </div>
      ))}

      {/* Shooting stars */}
      {shootingStars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          top: `${s.top}%`,
          left: '-10%',
          width: s.length,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
          borderRadius: 2,
          animation: `shooting-star ${s.dur}s ${s.delay}s ease-in infinite`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   DEEP OCEAN  –  fishes, light rays, dense bubbles
══════════════════════════════════════════════════════════════════════════════ */
function UnderwaterEnvironment() {
  const rng = seeded(99);

  const fishes = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      y: 5 + rng() * 88,
      size: 20 + rng() * 30,
      dur: 14 + rng() * 16,
      delay: -rng() * 20,
      direction: i % 2 === 0 ? 'ltr' : 'rtl',
      depth: Math.floor(rng() * 3),      // 0=back, 1=mid, 2=front
      color: [
        ['#f97316', '#fed7aa'],           // orange
        ['#06b6d4', '#a5f3fc'],           // cyan
        ['#8b5cf6', '#ddd6fe'],           // purple
      ][Math.floor(rng() * 3)],
    })), []);

  const bubbles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: rng() * 100,
      size: 4 + rng() * 10,
      dur: 6 + rng() * 10,
      delay: -rng() * 16,
      wobble: 4 + rng() * 8,
    })), []);

  const rays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 5 + i * 22,
      width: 30 + rng() * 40,
      dur: 6 + rng() * 6,
      delay: -rng() * 8,
    })), []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Light rays from top */}
      {rays.map(r => (
        <div key={r.id} style={{
          position: 'absolute',
          top: 0,
          left: `${r.x}%`,
          width: r.width,
          height: '60%',
          background: 'linear-gradient(180deg, rgba(56,189,248,0.18) 0%, transparent 100%)',
          transform: `rotate(${-8 + r.id * 4}deg)`,
          transformOrigin: 'top center',
          animation: `ray-sway ${r.dur}s ${r.delay}s ease-in-out infinite alternate`,
          borderRadius: '0 0 50% 50%',
        }} />
      ))}

      {/* Fishes */}
      {fishes.map(f => {
        const isLtr = f.direction === 'ltr';
        const opacity = f.depth === 0 ? 0.35 : f.depth === 1 ? 0.65 : 0.9;
        const blur = f.depth === 0 ? 'blur(1.5px)' : 'none';
        const [body, fin] = f.color;
        return (
          <div key={f.id} style={{
            position: 'absolute',
            top: `${f.y}%`,
            left: isLtr ? '-8%' : '108%',
            width: f.size,
            height: f.size * 0.55,
            opacity,
            filter: blur,
            animation: isLtr
              ? `fish-swim-ltr ${f.dur}s ${f.delay}s linear infinite`
              : `fish-swim-rtl ${f.dur}s ${f.delay}s linear infinite`,
            willChange: 'transform',
          }}>
            <svg viewBox="0 0 80 44" style={{ width: '100%', height: '100%', transform: isLtr ? 'none' : 'scaleX(-1)' }}>
              {/* Body */}
              <ellipse cx="38" cy="22" rx="28" ry="14" fill={body} />
              {/* Tail */}
              <polygon points="10,22 0,10 0,34" fill={fin} opacity="0.9" />
              {/* Top fin */}
              <polygon points="28,10 42,10 36,2" fill={fin} opacity="0.8" />
              {/* Eye */}
              <circle cx="60" cy="18" r="4" fill="#0f172a" />
              <circle cx="61" cy="17" r="1.5" fill="#fff" />
              {/* Stripes */}
              <line x1="44" y1="10" x2="44" y2="34" stroke={fin} strokeWidth="1.5" opacity="0.5" />
              <line x1="52" y1="12" x2="52" y2="32" stroke={fin} strokeWidth="1" opacity="0.4" />
            </svg>
          </div>
        );
      })}

      {/* Bubbles */}
      {bubbles.map(b => (
        <div key={b.id} style={{
          position: 'absolute',
          bottom: '-5%',
          left: `${b.x}%`,
          width: b.size,
          height: b.size,
          borderRadius: '50%',
          border: '1.5px solid rgba(56,189,248,0.5)',
          background: 'rgba(255,255,255,0.06)',
          animation: `bubble-rise ${b.dur}s ${b.delay}s ease-in infinite`,
          willChange: 'transform',
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CYBERPUNK  –  neon signs, city skyline, fog
══════════════════════════════════════════════════════════════════════════════ */
const NEON_SIGNS = [
  { text: 'ネオン', color: '#ec4899', x: 5,  y: 12, size: 22, dur: 3.2 },
  { text: 'VOID',  color: '#a855f7', x: 25, y: 8,  size: 18, dur: 2.1 },
  { text: '電脳',  color: '#06b6d4', x: 55, y: 15, size: 24, dur: 4.0 },
  { text: 'DATA',  color: '#f97316', x: 75, y: 6,  size: 16, dur: 2.8 },
  { text: 'AIR',   color: '#ec4899', x: 88, y: 20, size: 20, dur: 3.6 },
  { text: '未来',  color: '#a855f7', x: 42, y: 5,  size: 20, dur: 2.5 },
];

function CyberpunkEnvironment() {
  const rng = seeded(77);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * 2.5,
      dur: 3 + rng() * 5,
      delay: -rng() * 8,
      color: ['#ec4899', '#a855f7', '#06b6d4'][Math.floor(rng() * 3)],
    })), []);

  // City skyline building data (percentages)
  const buildings = useMemo(() => [
    { x: 0, w: 8, h: 20 }, { x: 6, w: 6, h: 30 }, { x: 10, w: 10, h: 18 },
    { x: 18, w: 7, h: 38 }, { x: 23, w: 9, h: 25 }, { x: 30, w: 6, h: 45 },
    { x: 34, w: 8, h: 22 }, { x: 40, w: 11, h: 55 }, { x: 49, w: 7, h: 30 },
    { x: 54, w: 9, h: 40 }, { x: 61, w: 6, h: 20 }, { x: 65, w: 10, h: 50 },
    { x: 73, w: 7, h: 28 }, { x: 78, w: 9, h: 35 }, { x: 85, w: 8, h: 22 },
    { x: 91, w: 6, h: 45 }, { x: 95, w: 9, h: 18 },
  ], []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Rain streaks */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(6,182,212,0.04) 18px, rgba(6,182,212,0.04) 19px)',
        backgroundSize: '19px 100%',
      }} />

      {/* Floating data particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 6px ${p.color}`,
          animation: `data-float ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
        }} />
      ))}

      {/* Neon signs */}
      {NEON_SIGNS.map((sign, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${sign.x}%`,
          top: `${sign.y}%`,
          fontSize: sign.size,
          fontWeight: 900,
          fontFamily: '"Outfit", sans-serif',
          color: sign.color,
          textShadow: `0 0 10px ${sign.color}, 0 0 20px ${sign.color}, 0 0 40px ${sign.color}80`,
          animation: `neon-flicker ${sign.dur}s ease-in-out infinite`,
          letterSpacing: 2,
          whiteSpace: 'nowrap',
        }}>
          {sign.text}
        </div>
      ))}

      {/* City skyline */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' }}>
        {buildings.map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: 0,
            left: `${b.x}%`,
            width: `${b.w}%`,
            height: `${b.h}%`,
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)',
            borderTop: '1px solid rgba(236,72,153,0.25)',
          }}>
            {/* Windows grid */}
            <div style={{
              position: 'absolute', inset: '4px 4px 0 4px',
              backgroundImage: 'radial-gradient(rgba(236,72,153,0.6) 1px, transparent 1px)',
              backgroundSize: '5px 5px',
              opacity: 0.5,
            }} />
          </div>
        ))}
      </div>

      {/* Fog / ground haze */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%',
        background: 'linear-gradient(0deg, rgba(236,72,153,0.12) 0%, transparent 100%)',
        animation: 'fog-drift 12s ease-in-out infinite alternate',
        filter: 'blur(8px)',
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   KEYFRAMES (injected once)
══════════════════════════════════════════════════════════════════════════════ */
const CSS = `
  @keyframes asteroid-drift {
    from { transform: translate(0, 0); }
    to   { transform: translate(-130vw, 60vh); }
  }
  @keyframes asteroid-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes shooting-star {
    0%   { transform: translate(0, 0) rotate(-25deg); opacity: 0; }
    5%   { opacity: 1; }
    40%  { transform: translate(110vw, 40vh) rotate(-25deg); opacity: 0.9; }
    100% { transform: translate(110vw, 40vh) rotate(-25deg); opacity: 0; }
  }
  @keyframes fish-swim-ltr {
    from { transform: translateX(0); }
    to   { transform: translateX(120vw); }
  }
  @keyframes fish-swim-rtl {
    from { transform: translateX(0); }
    to   { transform: translateX(-120vw); }
  }
  @keyframes bubble-rise {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    10%  { opacity: 0.7; }
    50%  { transform: translateY(-45vh) translateX(8px); opacity: 0.5; }
    90%  { opacity: 0.2; }
    100% { transform: translateY(-100vh) translateX(-6px); opacity: 0; }
  }
  @keyframes ray-sway {
    from { opacity: 0.4; transform: rotate(-8deg) scaleX(0.9); }
    to   { opacity: 0.7; transform: rotate(4deg) scaleX(1.1); }
  }
  @keyframes neon-flicker {
    0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; }
    20%,24%,55% { opacity: 0.35; }
  }
  @keyframes data-float {
    from { transform: translate(0, 0) scale(1); opacity: 0.4; }
    to   { transform: translate(8px, -12px) scale(1.6); opacity: 0.9; }
  }
  @keyframes fog-drift {
    from { transform: translateX(-5%) scaleX(1.02); }
    to   { transform: translateX(5%) scaleX(0.98); }
  }
`;

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════════════ */
export default function Environment({ activeBoard }) {
  if (activeBoard === 'classic') return null;

  return (
    <>
      <style>{CSS}</style>
      {activeBoard === 'space'      && <SpaceEnvironment />}
      {activeBoard === 'underwater' && <UnderwaterEnvironment />}
      {activeBoard === 'cyberpunk'  && <CyberpunkEnvironment />}
    </>
  );
}
