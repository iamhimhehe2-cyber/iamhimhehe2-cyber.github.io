import React from 'react';
import { ALL_ABILITIES } from '../chess-engine/engine';
import { getTitle, getTitleColor, getWinRate } from '../store/profile';

export default function Dashboard({ color, state, onDrawCard, isPlayer, playerInfo, activeSkin = 'none' }) {
  const points = state.points[color] || 0;
  const cards = state.cards[color] || [];
  const capturedPieces = state.captured[color] || [];

  const title = playerInfo ? getTitle(playerInfo.level) : '';
  const titleColor = playerInfo ? getTitleColor(playerInfo.level) : '#94a3b8';

  return (
    <div style={{
      background: 'rgba(30,41,59,0.7)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '24px',
      width: '100%',
      maxWidth: '380px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px',
        background: color === 'w' ? 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 min-w-0">
          <h2 style={{ fontFamily: 'Outfit, sans-serif' }} className={`text-2xl font-black truncate tracking-tight ${color === 'w' ? 'text-slate-50' : 'text-slate-300'}`}>
            {playerInfo?.username || (color === 'w' ? 'Grandmaster' : 'Shadow')} {isPlayer ? '👑' : ''}
          </h2>
          {title && (
            <div style={{
              display:'inline-block', padding:'2px 8px', borderRadius:6, background:'rgba(255,255,255,0.05)', marginTop:4, border:'1px solid rgba(255,255,255,0.08)'
            }}>
              <span style={{
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5,
                background: titleColor.includes('gradient') ? titleColor : 'none', 
                WebkitBackgroundClip: titleColor.includes('gradient') ? 'text' : 'none',
                WebkitTextFillColor: titleColor.includes('gradient') ? 'transparent' : titleColor,
                color: titleColor.includes('gradient') ? 'transparent' : titleColor,
                filter: titleColor.includes('gradient') ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : 'none'
              }}>
                {title}
              </span>
            </div>
          )}
        </div>
        <div className="text-right ml-4 shrink-0">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Rank</p>
          <p className="text-3xl font-black text-slate-100 leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {playerInfo?.level || 1}
          </p>
        </div>
      </div>

      {playerInfo && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 relative group hover:border-emerald-500/30 transition-colors">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5 opacity-60">Success Rate</p>
            <p className="text-xl font-black text-emerald-400 leading-none">{getWinRate(playerInfo)}%</p>
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </div>
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 relative group hover:border-orange-500/30 transition-colors">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5 opacity-60">Combat Streak</p>
            <p className="text-xl font-black text-orange-400 leading-none">{playerInfo.winStreak || 0} 🔥</p>
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </div>
        </div>
      )}
      
      <div className="flex flex-col bg-slate-900/80 rounded-2xl p-4 mb-6 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-1">Soul Essence</p>
            <p className="text-4xl font-black text-amber-400" style={{ fontFamily: 'Outfit, sans-serif', textShadow: '0 0 20px rgba(245,158,11,0.3)' }}>{points}</p>
          </div>
          
          {isPlayer && (
            <button 
              onClick={onDrawCard}
              disabled={points < 5}
              style={{
                background: points >= 5 ? 'linear-gradient(135deg, #fbbf24, #f97316)' : 'rgba(255,255,255,0.05)',
                color: points >= 5 ? '#000' : '#475569',
                boxShadow: points >= 5 ? '0 10px 20px -10px rgba(245,158,11,0.6)' : 'none'
              }}
              className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 ${
                points >= 5 ? 'hover:brightness-110 cursor-pointer' : 'cursor-not-allowed border border-white/5'
              }`}
            >
              Draw Power
            </button>
          )}
        </div>
        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div style={{ width: `${Math.min(100, (points/5)*100)}%`, transition: 'width 0.4s ease' }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        </div>
      </div>

      <div className="mb-6 flex-1 min-h-[160px]">
        <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-3 ml-1">Active Artifacts</h3>
        {cards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl py-6 opacity-30">
            <span className="text-3xl mb-2">🃏</span>
            <p className="text-xs uppercase font-black tracking-widest">Awaiting Power</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
            {cards.map((id, i) => {
              const ability = ALL_ABILITIES.find(a => a.id === id);
              // Infer piece type from ability name for the icon
              let pieceType = 'p';
              if (id.toLowerCase().includes('knight')) pieceType = 'n';
              else if (id.toLowerCase().includes('bishop')) pieceType = 'b';
              else if (id.toLowerCase().includes('rook')) pieceType = 'r';
              else if (id.toLowerCase().includes('queen')) pieceType = 'q';
              else if (id.toLowerCase().includes('king')) pieceType = 'k';

              const pieceEmoji = { w: { p:'♙',n:'♘',b:'♗',r:'♖',q:'♕',k:'♔' }, b: { p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚' } }[color][pieceType];

              return (
                <div key={`${id}-${i}`} style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }} className="shrink-0 group hover:border-amber-500/30 transition-all">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* Visual Card Piece Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.05)', position: 'relative'
                    }}>
                      <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%' }}>
                        <defs>
                          <pattern id={`card-camo-${color}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <rect width="40" height="40" fill={color==='w'?'#78716c':'#1c1917'} />
                            <path d="M0,10 Q5,0 15,5 T30,10 T40,20 V40 H0 Z" fill={color==='w'?'#4ade80':'#166534'} opacity="0.6" />
                          </pattern>
                          <linearGradient id="card-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <radialGradient id="card-magma" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#1e1b4b" />
                          </radialGradient>
                          <radialGradient id="card-void" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#020617" />
                          </radialGradient>
                          <linearGradient id="card-ice" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f0f9ff" /><stop offset="100%" stopColor="#0ea5e9" />
                          </linearGradient>
                        </defs>
                        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="70" 
                          fill={
                            activeSkin === 'camo' ? `url(#card-camo-${color})` :
                            activeSkin === 'gold' ? 'url(#card-gold)' :
                            activeSkin === 'magma' ? 'url(#card-magma)' :
                            activeSkin === 'void' ? 'url(#card-void)' :
                            activeSkin === 'ice' ? 'url(#card-ice)' : 
                            (color === 'w' ? '#f8fafc' : '#94a3b8')
                          }
                        >
                          {pieceEmoji}
                        </text>
                      </svg>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: '#fff', letterSpacing: -0.2 }}>{ability?.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.2, marginTop: 2 }}>{ability?.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
          <span>Captured Souls</span>
          <span className="text-slate-300 font-black">{capturedPieces.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[30px]">
          {capturedPieces.map((p, i) => (
             <span key={i} className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default" style={{fontSize: 20}}>{p}</span>
          ))}
          {capturedPieces.length === 0 && <span className="text-[9px] lowercase italic opacity-30">No souls harvested yet...</span>}
        </div>
      </div>

    </div>
  );
}

