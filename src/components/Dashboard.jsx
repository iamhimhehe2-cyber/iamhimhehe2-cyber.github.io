import React from 'react';
import { ALL_ABILITIES } from '../chess-engine/engine';
import { getTitle, getTitleColor, getWinRate } from '../store/profile';

export default function Dashboard({ color, state, onDrawCard, isPlayer, playerInfo }) {
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
                background: titleColor, WebkitBackgroundClip: titleColor.includes('gradient') ? 'text' : 'none',
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
          <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
            {cards.map((id, i) => {
              const ability = ALL_ABILITIES.find(a => a.id === id);
              return (
                <div key={`${id}-${i}`} className="shrink-0 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex justify-between items-center mb-1">
                     <p className="font-black text-white text-sm tracking-tight group-hover:text-amber-400 transition-colors">{ability?.name}</p>
                     <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40 font-bold uppercase">Active</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{ability?.desc}</p>
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

      {/* AdSense Unit Placeholder */}
      <div style={{ marginTop: 24, padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#475569', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Advertisement</p>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-9992695561469755"
             data-ad-slot="YOUR_GAME_AD_SLOT"
             data-ad-format="auto" />
      </div>
    </div>
  );
}

