import React, { useRef, useEffect, useState } from 'react';
import { getLegalMoves } from '../chess-engine/engine';

const PIECE_EMOJIS = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
};

const EFFECT_STYLES = {
  none:      { bg:'transparent',   animation: '' },
  ember:     { bg:'rgba(249,115,22,0.55)',  animation: 'ember 0.6s ease-out forwards' },
  frost:     { bg:'rgba(56,189,248,0.55)',  animation: 'frost 0.6s ease-out forwards' },
  thunder:   { bg:'rgba(250,204,21,0.65)',  animation: 'thunder 0.5s ease-out forwards' },
  shadow:    { bg:'rgba(168,85,247,0.55)',  animation: 'shadow 0.7s ease-out forwards' },
  celestial: { bg:'rgba(251,191,36,0.65)', animation: 'celestial 0.6s ease-out forwards' },
  void:      { bg:'rgba(99,102,241,0.65)', animation: 'voidfx 0.7s ease-out forwards' },
};

function CaptureEffect({ effect }) {
  const style = EFFECT_STYLES[effect] || EFFECT_STYLES.none;
  return (
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:5,
      background: style.bg,
      animation: style.animation,
      borderRadius: effect === 'frost' ? '0%' : '50%',
    }}/>
  );
}

export default function Board({ state, onMove, playerColor, captureEffect = 'none', activeSkin = 'none', activeBoard = 'classic' }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [captureFlash, setCaptureFlash] = useState(null); // { r, c }
  const prevBoardRef = useRef(state.board);
  const [moveReactions, setMoveReactions] = useState([]);

  // Detect captures by comparing board state
  useEffect(() => {
    const prev = prevBoardRef.current;
    const cur = state.board;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (prev[r][c] && !cur[r][c] && prev[r][c].color !== state.turn) {
          // A piece disappeared and it was the opponent's turn last — capture!
          setCaptureFlash({ r, c });
          setTimeout(() => setCaptureFlash(null), 700);
        }
      }
    }
    prevBoardRef.current = cur;
  }, [state.board, state.turn]);

  useEffect(() => {
    if (selectedSquare) {
      const allMoves = getLegalMoves(state);
      setLegalMoves(allMoves.filter(m => m.from.r === selectedSquare.r && m.from.c === selectedSquare.c));
    } else {
      setLegalMoves([]);
    }
  }, [selectedSquare, state]);

  const handleSquareClick = (r, c) => {
    const piece = state.board[r][c];
    if (playerColor && state.turn !== playerColor) return;

    if (selectedSquare) {
      const move = legalMoves.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        onMove(move);
        setSelectedSquare(null);
        if (activeBoard !== 'classic') {
          const newId = Date.now();
          setMoveReactions(prev => [...prev, { r: move.to.r, c: move.to.c, id: newId }]);
          setTimeout(() => setMoveReactions(prev => prev.filter(m => m.id !== newId)), 500);
        }
      } else {
        if (piece && piece.color === state.turn) setSelectedSquare({ r, c });
        else setSelectedSquare(null);
      }
    } else {
      if (piece && piece.color === state.turn) setSelectedSquare({ r, c });
    }
  };

  const isDark = (r, c) => (r + c) % 2 !== 0;

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`grid grid-cols-8 grid-rows-8 w-full h-full aspect-square border-[6px] border-slate-800 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ${activeBoard === 'cyberpunk' ? 'bg-cyberpunk-grid' : activeBoard === 'space' ? 'bg-space-stars' : activeBoard === 'underwater' ? 'bg-underwater' : ''} `}>
        {state.board.map((row, r) =>
          row.map((piece, c) => {
            const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
            const isLegalMove = legalMoves.some(m => m.to.r === r && m.to.c === c);
            const isCapture = isLegalMove && piece;
            const isFlashing = captureFlash?.r === r && captureFlash?.c === c;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`flex items-center justify-center relative cursor-pointer
                  ${isDark(r, c) ? 'bg-boardDark' : 'bg-boardLight'}
                  ${isSelected ? 'bg-yellow-400/50' : ''}
                  transition-colors duration-200
                `}
              >
                {isFlashing && captureEffect !== 'none' && <CaptureEffect effect={captureEffect} />}
                {moveReactions.some(m => m.r === r && m.c === c) && (
                  <div className={`absolute inset-0 pointer-events-none ${activeBoard === 'cyberpunk' ? 'reaction-cyber' : activeBoard === 'space' ? 'reaction-space' : activeBoard === 'underwater' ? 'reaction-water' : ''} `}/>
                )}
                {isLegalMove && !isCapture && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-slate-800/30 z-10"/>
                )}
                {isLegalMove && isCapture && (
                  <div className="absolute w-full h-full border-4 border-red-500/50 rounded-full z-10"/>
                )}
                {piece && (
                  <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] select-none pointer-events-none drop-shadow-xl relative z-20">
                    <defs>
                      {/* Camouflage Pattern */}
                      <pattern id="pattern-camo-w" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect width="40" height="40" fill="#78716c" />
                        <path d="M0,10 Q5,0 15,5 T30,10 T40,20 V40 H0 Z" fill="#4ade80" opacity="0.6" />
                        <path d="M20,0 Q30,10 25,25 T10,35 T0,20 Z" fill="#d6d3d1" opacity="0.4" />
                      </pattern>
                      <pattern id="pattern-camo-b" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect width="40" height="40" fill="#1c1917" />
                        <path d="M0,10 Q5,0 15,5 T30,10 T40,20 V40 H0 Z" fill="#166534" opacity="0.7" />
                        <path d="M20,0 Q30,10 25,25 T10,35 T0,20 Z" fill="#44403c" opacity="0.5" />
                      </pattern>

                      {/* Gold Gradient */}
                      <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#fef3c7" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>

                      {/* Magma Gradient */}
                      <radialGradient id="grad-magma" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="70%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#1e1b4b" />
                      </radialGradient>

                      {/* Void Gradient */}
                      <radialGradient id="grad-void" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="60%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#020617" />
                      </radialGradient>

                      {/* Ice Gradient */}
                      <linearGradient id="grad-ice" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f0f9ff" />
                        <stop offset="50%" stopColor="#7dd3fc" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                    </defs>

                    <text x="50%" y="54%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize="75"
                      fill={
                        activeSkin === 'none' ? (piece.color === 'w' ? '#f8fafc' : '#0f172a') :
                        activeSkin === 'camo' ? `url(#pattern-camo-${piece.color})` :
                        activeSkin === 'gold' ? 'url(#grad-gold)' :
                        activeSkin === 'magma' ? 'url(#grad-magma)' :
                        activeSkin === 'void' ? 'url(#grad-void)' :
                        activeSkin === 'ice' ? 'url(#grad-ice)' :
                        (piece.color === 'w' ? '#f8fafc' : '#0f172a')
                      }
                      stroke={
                        activeSkin === 'none' ? (piece.color === 'w' ? '#00000080' : '#ffffff60') :
                        activeSkin === 'gold' ? '#92400e' :
                        activeSkin === 'magma' ? '#450a0a' :
                        activeSkin === 'ice' ? '#0c4a6e' :
                        (piece.color === 'w' ? '#00000080' : '#ffffff60')
                      }
                      strokeWidth={activeSkin === 'none' ? "2" : "1.5"}
                      style={{ filter: piece.stunTimer > 0 ? 'grayscale(1) opacity(0.6)' : 'none' }}
                    >
                      {PIECE_EMOJIS[piece.color][piece.type]}
                    </text>
                    {piece.stunTimer > 0 && (
                      <text x="50%" y="45%" textAnchor="middle" fontSize="40" fill="#fbbf24" style={{filter:'drop-shadow(0 0 5px #000)'}}>⚡</text>
                    )}
                    {piece.shotCount > 0 && (
                      <g transform="translate(25, 82)">
                        {[...Array(piece.shotCount)].map((_, i) => (
                          <circle key={i} cx={i * 12} cy="0" r="4" fill="#ef4444" stroke="#000" strokeWidth="1" />
                        ))}
                      </g>
                    )}
                  </svg>
                )}
                {isLegalMove && legalMoves.find(m => m.to.r === r && m.to.c === c)?.isShoot && (
                   <div style={{ position: 'absolute', inset: '10%' }} className="z-10 flex items-center justify-center">
                     <div className="absolute w-full h-1 bg-orange-500/80"/>
                     <div className="absolute w-1 h-full bg-orange-500/80"/>
                     <div className="absolute w-full h-full border-4 border-orange-500/80 rounded-full"/>
                   </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes ember {
          0%   { opacity:1; transform:scale(1); border-radius:0; }
          50%  { opacity:0.8; transform:scale(1.4) rotate(15deg); border-radius:30%; }
          100% { opacity:0; transform:scale(2) rotate(30deg); border-radius:50%; }
        }
        @keyframes frost {
          0%   { opacity:1; transform:scale(1); }
          40%  { opacity:0.9; transform:scale(1.2); filter:blur(0); }
          100% { opacity:0; transform:scale(1.6); filter:blur(4px); }
        }
        @keyframes thunder {
          0%,20%,60%  { opacity:1; transform:scale(1) skewX(0deg); }
          10%,40%     { opacity:0.7; transform:scale(1.3) skewX(10deg); }
          80%,100%    { opacity:0; transform:scale(1.8); }
        }
        @keyframes shadow {
          0%   { opacity:0.9; transform:scale(1); filter:blur(0); }
          100% { opacity:0; transform:scale(2.5); filter:blur(8px); }
        }
        @keyframes celestial {
          0%   { opacity:1; transform:scale(0.5) rotate(0deg); }
          50%  { opacity:1; transform:scale(1.3) rotate(180deg); }
          100% { opacity:0; transform:scale(2) rotate(360deg); }
        }
        @keyframes voidfx {
          0%   { opacity:1; transform:scale(1.5) rotate(0deg); filter:blur(0); }
          100% { opacity:0; transform:scale(0.1) rotate(-360deg); filter:blur(6px); }
        }
      `}</style>
    </div>
  );
}
