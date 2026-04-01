import React from 'react';
import { ALL_ABILITIES } from '../chess-engine/engine';

export default function Dashboard({ color, state, onDrawCard, isPlayer }) {
  const points = state.points[color] || 0;
  const cards = state.cards[color] || [];
  const capturedPieces = state.captured[color] || [];

  const name = color === 'w' ? 'White' : 'Black';

  return (
    <div className="flex flex-col bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-slate-700">
      <h2 className={`text-2xl font-bold mb-4 ${color === 'w' ? 'text-slate-100' : 'text-slate-400'}`}>
        {name} {isPlayer ? '(You)' : ''}
      </h2>
      
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
          <div className="flex flex-col gap-2 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
            {cards.map(id => {
              const ability = ALL_ABILITIES.find(a => a.id === id);
              return (
                <div key={id} className="shrink-0 bg-slate-700 p-3 rounded-lg border border-slate-600 relative overflow-hidden group">
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
          {/* Simple count representation */}
          {<span className="text-slate-300">Total captured: {capturedPieces.length}</span>}
        </div>
      </div>
    </div>
  );
}
