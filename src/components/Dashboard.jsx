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
    <div className="flex flex-col bg-slate-800 rounded-xl p-5 w-full max-w-sm shadow-xl border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h2 className={`text-xl font-black truncate ${color === 'w' ? 'text-slate-100' : 'text-slate-400'}`}>
            {playerInfo?.username || (color === 'w' ? 'White' : 'Black')} {isPlayer ? '(You)' : ''}
          </h2>
          {title && (
            <div className="mt-0.5">
              <span style={{
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2,
                background: titleColor, WebkitBackgroundClip: titleColor.includes('gradient') ? 'text' : 'none',
                WebkitTextFillColor: titleColor.includes('gradient') ? 'transparent' : titleColor,
                color: titleColor.includes('gradient') ? 'transparent' : titleColor,
                filter: titleColor.includes('gradient') ? 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' : 'none'
              }}>
                {title}
              </span>
            </div>
          )}
        </div>
        <div className="text-right ml-4 shrink-0">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Level</p>
          <p className="text-2xl font-black text-slate-100 leading-none" style={{
            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {playerInfo?.level || 1}
          </p>
        </div>
      </div>

      {playerInfo && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Win Rate</p>
            <p className="text-lg font-black text-emerald-400 leading-none">{getWinRate(playerInfo)}<span className="text-xs opacity-60 ml-0.5">%</span></p>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Streak</p>
            <p className="text-lg font-black text-orange-400 leading-none">{playerInfo.winStreak || 0}<span className="text-xs ml-1">🔥</span></p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center bg-slate-900 rounded-lg p-4 mb-4">
        <div>
          <p className="text-sm text-slate-400 uppercase tracking-widest">Points</p>
          <p className="text-4xl font-black text-amber-400">{points}</p>
        </div>
        
        {isPlayer && (
          <button 
            onClick={onDrawCard}
            disabled={points < 5}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              points >= 5 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Draw Card (5 pts)
          </button>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-2">Active Abilities ({cards.length})</h3>
        {cards.length === 0 ? (
          <p className="text-slate-500 italic text-sm">No abilities drawn yet.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[25vh] overflow-y-auto pr-2 custom-scrollbar">
            {cards.map((id, i) => {
              const ability = ALL_ABILITIES.find(a => a.id === id);
              return (
                <div key={`${id}-${i}`} className="shrink-0 bg-slate-700 p-3 rounded-lg border border-slate-600 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 group-hover:opacity-100 opacity-50 transition-opacity" />
                  <p className="font-bold text-cyan-400 relative z-10">{ability?.name}</p>
                  <p className="text-xs text-slate-300 relative z-10">{ability?.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-2">Captures ({capturedPieces.length})</h3>
        <div className="flex flex-wrap gap-1 text-2xl h-8 overflow-hidden">
          <span className="text-slate-300">Total captured: {capturedPieces.length}</span>
        </div>
      </div>
    </div>
  );
}

