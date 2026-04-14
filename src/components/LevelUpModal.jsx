import React, { useEffect, useState } from 'react';
import { LEVEL_EFFECTS, getTitle, getTitleColor } from '../store/profile';

export default function LevelUpModal({ newLevel, coinsEarned, onClose }) {
  const [visible, setVisible] = useState(false);
  const effect = LEVEL_EFFECTS.find(e => e.level === newLevel) || LEVEL_EFFECTS[0];
  
  const title = getTitle(newLevel);
  const prevTitle = getTitle(newLevel - 1);
  const isTitleBreakthrough = title && title !== prevTitle;
  const titleColor = getTitleColor(newLevel);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    size: 4 + Math.random() * 8,
    color: ['#f59e0b','#f97316','#fbbf24','#ef4444','#a855f7','#38bdf8'][Math.floor(Math.random()*6)]
  }));

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(2,6,23,0.9)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'opacity 0.5s ease', opacity: visible ? 1 : 0
    }}>
      {/* Particles */}
      <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none'}}>
        {particles.map(p => (
          <div key={p.id} style={{
            position:'absolute', left:`${p.x}%`, top:'100%',
            width:p.size, height:p.size, borderRadius:p.size/2,
            background:p.color,
            boxShadow:`0 0 10px ${p.color}`,
            animation:`rise 2.5s ease-out ${p.delay}s infinite`,
          }}/>
        ))}
      </div>

      <div style={{
        background:'linear-gradient(135deg,#1e293b,#0f172a)',
        border: `1px solid ${isTitleBreakthrough ? '#fbbf24' : 'rgba(245,158,11,0.3)'}`,
        borderRadius:24, padding:48, textAlign:'center', maxWidth:440, width:'90%',
        boxShadow: isTitleBreakthrough ? '0 0 100px rgba(251,191,36,0.25)' : '0 0 60px rgba(0,0,0,0.5)',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
        transition:'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        position:'relative', zIndex:1
      }}>
        <div style={{
          fontSize:72, marginBottom:12,
          animation:'float 2s ease-in-out infinite alternate',
          filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.5))'
        }}>
          {isTitleBreakthrough ? '🏆' : '✨'}
        </div>

        <div style={{
          fontSize:12, fontWeight:900, letterSpacing:6,
          color:'#818cf8', textTransform:'uppercase', marginBottom:12
        }}>
          {isTitleBreakthrough ? 'New Milestone' : 'Ascended To'}
        </div>

        <div style={{
          fontSize:96, fontWeight:900,
          background:'linear-gradient(135deg, #fff 0%, #cbd5e1 50%, #94a3b8 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          lineHeight:1, marginBottom:12, filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
        }}>
          <span style={{fontSize:48, opacity:0.5, marginRight:4}}>LVL</span>{newLevel}
        </div>

        {isTitleBreakthrough && (
          <div style={{
            padding:'16px 24px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(251,191,36,0.2)',
            borderRadius:16, marginBottom:24, animation:'slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow:'inset 0 0 20px rgba(251,191,36,0.05)'
          }}>
             <div style={{fontSize:10, color:'#fbbf24', textTransform:'uppercase', letterSpacing:3, marginBottom:6, fontWeight:900}}>Title Unlocked</div>
             <div style={{
               fontSize:28, fontWeight:900, textTransform:'uppercase', letterSpacing:3,
               background: titleColor, WebkitBackgroundClip: titleColor.includes('gradient') ? 'text' : 'none',
               WebkitTextFillColor: titleColor.includes('gradient') ? 'transparent' : titleColor,
               color: titleColor.includes('gradient') ? 'transparent' : titleColor,
               filter: titleColor.includes('gradient') ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : 'none'
             }}>
               {title}
             </div>
          </div>
        )}

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
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

