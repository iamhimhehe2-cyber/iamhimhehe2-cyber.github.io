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

export default function Board({ state, onMove, playerColor, captureEffect = 'none' }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [captureFlash, setCaptureFlash] = useState(null); // { r, c }
  const prevBoardRef = useRef(state.board);

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
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full aspect-square border-[6px] border-slate-800 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
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
                {isLegalMove && !isCapture && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-slate-800/30 z-10"/>
                )}
                {isLegalMove && isCapture && (
                  <div className="absolute w-full h-full border-4 border-red-500/50 rounded-full z-10"/>
                )}
                {piece && (
                  <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] select-none pointer-events-none drop-shadow-xl relative z-20">
                    <text x="50%" y="54%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize="75"
                      fill={piece.color === 'w' ? '#f8fafc' : '#0f172a'}
                      stroke={piece.color === 'w' ? '#00000080' : '#ffffff60'}
                      strokeWidth="2"
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
