import { getLegalMoves, executeMove, PIECE_VALUES } from './engine.js';

function evaluateBoard(state, perspectiveColor) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type] * 10; // scale up
        // Give slight center preference to pieces
        const centerBonus = (3.5 - Math.abs(r - 3.5)) + (3.5 - Math.abs(c - 3.5));
        
        if (piece.color === perspectiveColor) {
          score += val + centerBonus;
        } else {
          score -= (val + centerBonus);
        }
      }
    }
  }
  
  // Evaluate abilities logic (very basic - just possessing cards is good)
  const myCards = state.cards[perspectiveColor] || [];
  const enemyCards = state.cards[perspectiveColor === 'w' ? 'b' : 'w'] || [];
  score += myCards.length * 15;
  score -= enemyCards.length * 15;

  return score;
}

export function getAIMove(state, level) {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return null;

  if (level === 1) {
    // Level 1: purely random
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Draw card logic for AI
  if (state.points[state.turn] >= 5) {
    // AI should draw if it can (signal to UI)
    // For now, engine does not mutate state here, AI will just return a flag if it wants to draw.
  }

  const depth = level === 2 ? 1 : 2; // Keep depth low because JS copyBoard in move generation is slow
  
  let bestScore = -Infinity;
  let bestMove = moves[0];
  const color = state.turn;

  for (const move of moves) {
    const nextState = executeMove(state, move);
    const score = minimax(nextState, depth - 1, -Infinity, Infinity, false, color);
    
    // Add small random noise to prevent identical games
    const noisyScore = score + (Math.random() * 2 - 1);
    
    if (noisyScore > bestScore) {
      bestScore = noisyScore;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(state, depth, alpha, beta, isMaximizing, aiColor) {
  if (depth === 0 || state.winner) {
    return evaluateBoard(state, aiColor);
  }

  const moves = getLegalMoves(state);
  if (moves.length === 0) {
    // Checkmate or stalemate
    if (state.winner === aiColor) return 10000;
    if (state.winner) return -10000;
    return 0; // stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextState = executeMove(state, move);
      const evalScore = minimax(nextState, depth - 1, alpha, beta, false, aiColor);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextState = executeMove(state, move);
      const evalScore = minimax(nextState, depth - 1, alpha, beta, true, aiColor);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
