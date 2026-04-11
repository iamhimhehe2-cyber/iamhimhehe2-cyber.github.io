import React, { useEffect, useState } from 'react';
import { LEVEL_EFFECTS } from '../store/profile';

export default function LevelUpModal({ newLevel, coinsEarned, onClose }) {
  const [visible, setVisible] = useState(false);
  const effect = LEVEL_EFFECTS.find(e => e.level === newLevel) || LEVEL_EFFECTS[0];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 10,
    color: ['#f59e0b','#f97316','#fbbf24','#ef4444','#a855f7'][Math.floor(Math.random()*5)]
  }));

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'opacity 0.4s', opacity: visible ? 1 : 0
    }}>
      {/* Particles */}
      <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none'}}>
        {particles.map(p => (
          <div key={p.id} style={{
            position:'absolute', left:`${p.x}%`, top:'100%',
            width:p.size, height:p.size, borderRadius:'50%',
            background:p.color,
            animation:`rise 2s ease-out ${p.delay}s infinite`,
          }}/>
        ))}
      </div>

      <div style={{
        background:'linear-gradient(135deg,#1e293b,#0f172a)',
        border:'2px solid rgba(245,158,11,0.5)',
        borderRadius:20, padding:40, textAlign:'center', maxWidth:400, width:'90%',
        boxShadow:'0 0 60px rgba(245,158,11,0.3)',
        transform: visible ? 'scale(1)' : 'scale(0.6)',
        transition:'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        position:'relative', zIndex:1
      }}>
        <div style={{
          fontSize:60, marginBottom:8,
          animation:'pulse 1s ease-in-out infinite alternate'
        }}>🎉</div>

        <div style={{
          fontSize:14, fontWeight:'bold', letterSpacing:4,
          color:'#f59e0b', textTransform:'uppercase', marginBottom:8
        }}>Level Up!</div>

        <div style={{
          fontSize:80, fontWeight:900,
          background:'linear-gradient(135deg,#f59e0b,#f97316)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          lineHeight:1, marginBottom:16
        }}>{newLevel}</div>

        {effect && effect.id !== 'none' && (
          <div style={{
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, padding:'16px 20px', marginBottom:20
          }}>
            <div style={{fontSize:36, marginBottom:6}}>{effect.icon}</div>
            <div style={{
              fontSize:18, fontWeight:'bold', color: effect.color, marginBottom:4
            }}>{effect.name} Effect Unlocked!</div>
            <div style={{fontSize:13, color:'#94a3b8'}}>
              Your captures and moves now have a special visual effect
            </div>
          </div>
        )}

        {coinsEarned > 0 && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:8, fontSize:18, fontWeight:'bold', color:'#fbbf24',
            marginBottom:20
          }}>
            🪙 +{coinsEarned} coins earned!
          </div>
        )}

        <button onClick={onClose} style={{
          padding:'12px 32px', borderRadius:10, border:'none',
          background:'linear-gradient(135deg,#f59e0b,#f97316)',
          color:'#1a1a1a', fontWeight:'bold', fontSize:16, cursor:'pointer',
          transition:'transform 0.2s'
        }}
          onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'}
          onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
          Awesome! Continue
        </button>
      </div>

      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity:1; }
          100% { transform: translateY(-100vh) scale(0.3) rotate(360deg); opacity:0; }
        }
        @keyframes pulse {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
