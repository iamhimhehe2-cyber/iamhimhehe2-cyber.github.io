import React from 'react';
import { getLegalMoves } from '../chess-engine/engine';

const PIECE_EMOJIS = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
};

export default function Board({ state, onMove, playerColor }) {
  const [selectedSquare, setSelectedSquare] = React.useState(null);
  const [legalMoves, setLegalMoves] = React.useState([]);

  // Find legal moves for the selected piece
  React.useEffect(() => {
    if (selectedSquare) {
      const allMoves = getLegalMoves(state);
      const pieceMoves = allMoves.filter(
        m => m.from.r === selectedSquare.r && m.from.c === selectedSquare.c
      );
      setLegalMoves(pieceMoves);
    } else {
      setLegalMoves([]);
    }
  }, [selectedSquare, state]);

  const handleSquareClick = (r, c) => {
    const piece = state.board[r][c];

    // If waiting for opponent
    if (playerColor && state.turn !== playerColor) return;

    if (selectedSquare) {
      // Try to move
      const move = legalMoves.find(m => m.to.r === r && m.to.to === c || (m.to.r === r && m.to.c === c));
      if (move) {
        onMove(move);
        setSelectedSquare(null);
      } else {
        // Select new piece if it's our color
        if (piece && piece.color === state.turn) {
          setSelectedSquare({ r, c });
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      if (piece && piece.color === state.turn) {
        setSelectedSquare({ r, c });
      }
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
                {/* Move highlight indicator */}
                {isLegalMove && !isCapture && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-slate-800/30"></div>
                )}
                {isLegalMove && isCapture && (
                  <div className="absolute w-full h-full border-4 border-red-500/50 rounded-full"></div>
                )}
                
                {/* Piece */}
                {piece && (
                  <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] select-none pointer-events-none drop-shadow-xl">
                    <text x="50%" y="54%" 
                      dominantBaseline="middle" 
                      textAnchor="middle" 
                      fontSize="75" 
                      fill={piece.color === 'w' ? '#f8fafc' : '#0f172a'}
                      stroke={piece.color === 'w' ? '#00000080' : '#ffffff60'}
                      strokeWidth="2"
                    >
                      {PIECE_EMOJIS[piece.color][piece.type]}
                    </text>
                  </svg>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
