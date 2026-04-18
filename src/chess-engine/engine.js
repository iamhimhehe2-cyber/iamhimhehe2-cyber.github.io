// engine.js
export const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

export const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export const ALL_ABILITIES = [
  { id: 'ghostRook', name: 'Ghost Rook', desc: 'Rooks ignore blocking pieces.' },
  { id: 'flyingBishop', name: 'Flying Bishop', desc: 'Bishops can jump over blocking pieces.' },
  { id: 'royalKnight', name: 'Royal Knight', desc: 'Knights can also move 1 square in any direction.' },
  { id: 'relentlessPawn', name: 'Relentless Pawn', desc: 'Pawns can move up to 2 squares forward at any time.' },
  { id: 'crabPawn', name: 'Crab Pawn', desc: 'Pawns can move 1 square horizontally.' },
  { id: 'retreatingPawn', name: 'Retreating Pawn', desc: 'Pawns can move 1 square straight backwards.' },
  { id: 'heavyQueen', name: 'Heavy Queen', desc: 'The Queen cannot be captured by Pawns.' },
  { id: 'diagonalRook', name: 'Diagonal Rook', desc: 'Rooks can also move 1 square diagonally.' },
  { id: 'straightBishop', name: 'Straight Bishop', desc: 'Bishops can also move 1 square straight.' },
  { id: 'stoutKing', name: 'Stout King', desc: 'The King can capture friendly pieces to escape check.' },
  { id: 'amazonQueen', name: 'Amazon Queen', desc: 'Queen gains Knight movement (Amazon Piece).' },
  { id: 'assassinPawn', name: 'Assassin Pawn', desc: 'Pawns can capture pieces directly in front of them.' },
  { id: 'swapKnight', name: 'Swap Knight', desc: 'Knights can swap places with non-king friendly pieces.' },
  { id: 'fortressRook', name: 'Fortress Rook', desc: 'Rooks are immune to capture by Knights or Bishops.' },
  { id: 'leapingPawn', name: 'Leaping Pawn', desc: 'Pawns can jump exactly one piece directly in front of them.' },
  { id: 'modernKnight', name: 'Modern Knight', desc: 'Knight shoots in 8 directions to stun for 1 turn. 5 hits kills.' },
  
  // King Rule Awakened Cards
  { id: 'king_ghostRook', name: 'Awakened: Ghost King', desc: 'King acts as a Ghost Rook (infinite reach).' },
  { id: 'king_flyingBishop', name: 'Awakened: Flying King', desc: 'King acts as a Flying Bishop (infinite reach).' },
  { id: 'king_royalKnight', name: 'Awakened: Knight King', desc: 'King can jump like a Knight.' },
  { id: 'king_relentlessPawn', name: 'Awakened: Relentless King', desc: 'King can leap 2 squares in any standard direction.' },
  { id: 'king_crabPawn', name: 'Awakened: Crab King', desc: 'King gains 3-square leaping abilities.' },
  { id: 'king_retreatingPawn', name: 'Awakened: Retreating King', desc: 'King gains 3-square leaping abilities.' },
  { id: 'king_heavyQueen', name: 'Awakened: Heavy King', desc: 'King is completely immune to Pawns.' },
  { id: 'king_diagonalRook', name: 'Awakened: Diagonal King', desc: 'King extends diagonal reach to 2 squares.' },
  { id: 'king_straightBishop', name: 'Awakened: Straight King', desc: 'King extends straight reach to 2 squares.' },
  { id: 'king_stoutKing', name: 'Awakened: True Stout', desc: 'Retains King sacrifice powers.' },
  { id: 'king_amazonQueen', name: 'Awakened: Amazon King', desc: 'King gain Knight jump.' },
  { id: 'king_assassinPawn', name: 'Awakened: Assassin King', desc: 'King can capture without moving directly forward.' },
  { id: 'king_swapKnight', name: 'Awakened: Swap King', desc: 'King can swap places with any friendly piece.' },
  { id: 'king_fortressRook', name: 'Awakened: Fortress King', desc: 'King cannot be targeted by Knights or Bishops.' },
  { id: 'king_leapingPawn', name: 'Awakened: Leaping King', desc: 'King can leap over 1 piece.' },
  { id: 'king_modernKnight', name: 'Awakened: Gun King', desc: 'King can shoot in 8 directions.' }
];

export function createInitialState() {
  return {
    board: parseFen(INITIAL_BOARD),
    turn: 'w',
    castling: { w: { k: true, q: true }, b: { k: true, q: true } },
    points: { w: 0, b: 0 },
    cards: { w: [], b: [] },
    captured: { w: [], b: [] }, // pieces captured BY this color
    winner: null,
    inCheck: false,
    fivePieceRuleTriggered: { w: false, b: false }
  };
}

export function parseFen(fen) {
  const board = [];
  const rows = fen.split(' ')[0].split('/');
  for (const row of rows) {
    const rowArr = [];
    for (const char of row) {
      if (isNaN(char)) {
        const color = char === char.toLowerCase() ? 'b' : 'w';
        const type = char.toLowerCase();
        rowArr.push({ type, color });
      } else {
        for (let i = 0; i < parseInt(char); i++) {
          rowArr.push(null);
        }
      }
    }
    board.push(rowArr);
  }
  return board;
}

export function isInside(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Generate all pseudo-legal moves for a specific side
export function getAllPseudoLegalMoves(state, color) {
  const moves = [];
  const { board, cards } = state;
  const abilities = cards[color] || [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        moves.push(...getPseudoLegalMovesForPiece(state, r, c, piece, abilities));
      }
    }
  }
  return moves;
}

export function getPseudoLegalMovesForPiece(state, r, c, piece, abilities) {
  const moves = [];
  if (piece.stunTimer > 0) return moves;

  const { board } = state;
  const isWhite = piece.color === 'w';
  const dir = isWhite ? -1 : 1;

  const canCapture = (targetR, targetC) => {
    const target = board[targetR][targetC];
    // Heavy Queen check
    if (target && target.type === 'q' && piece.type === 'p') {
      const targetAbilities = state.cards[target.color] || [];
      if (targetAbilities.includes('heavyQueen')) return false;
    }
    // Stout King check
    if (target && target.color === piece.color) {
      if (piece.type === 'k' && abilities.includes('stoutKing')) return true;
      return false;
    }
    // Fortress Rook check
    if (target && target.type === 'r') {
      const targetAbilities = state.cards[target.color] || [];
      if (targetAbilities.includes('fortressRook') && ['n','b'].includes(piece.type)) return false;
    }
    if (target && target.type === 'k') {
      const targetAbilities = state.cards[target.color] || [];
      if (targetAbilities.includes('king_fortressRook') && ['n','b'].includes(piece.type)) return false;
    }
    return target && target.color !== piece.color;
  };

  const isEmpty = (targetR, targetC) => board[targetR][targetC] === null;
  const isEnemy = (targetR, targetC) => canCapture(targetR, targetC) && board[targetR][targetC] && board[targetR][targetC].color !== piece.color;
  const isFriendlySacrifice = (targetR, targetC) => canCapture(targetR, targetC) && board[targetR][targetC] && board[targetR][targetC].color === piece.color;

  const addMove = (toR, toC, isCapture) => {
    moves.push({ from: {r, c}, to: {r: toR, c: toC}, capture: isCapture, piece });
  };

  if (piece.type === 'p') {
    // Normal forward
    if (isInside(r + dir, c)) {
      if (isEmpty(r + dir, c)) {
        addMove(r + dir, c, false);
        // Double push
        if (abilities.includes('relentlessPawn')) {
          if (isInside(r + 2 * dir, c) && isEmpty(r + 2 * dir, c)) {
            addMove(r + 2 * dir, c, false);
          }
        } else {
          if ((isWhite && r === 6) || (!isWhite && r === 1)) {
            if (isInside(r + 2 * dir, c) && isEmpty(r + 2 * dir, c)) {
              addMove(r + 2 * dir, c, false);
            }
          }
        }
      } else if (abilities.includes('assassinPawn') && canCapture(r + dir, c)) {
        addMove(r + dir, c, true);
      }
    }
    // Captures
    if (isInside(r + dir, c - 1) && canCapture(r + dir, c - 1)) addMove(r + dir, c - 1, true);
    if (isInside(r + dir, c + 1) && canCapture(r + dir, c + 1)) addMove(r + dir, c + 1, true);

    // Abilities
    if (abilities.includes('crabPawn')) {
      if (isInside(r, c - 1) && isEmpty(r, c - 1)) addMove(r, c - 1, false);
      if (isInside(r, c + 1) && isEmpty(r, c + 1)) addMove(r, c + 1, false);
    }
    if (abilities.includes('retreatingPawn')) {
      if (isInside(r - dir, c) && isEmpty(r - dir, c)) addMove(r - dir, c, false);
    }
    if (abilities.includes('leapingPawn')) {
      if (isInside(r + 2*dir, c) && !isEmpty(r + dir, c) && isEmpty(r + 2*dir, c)) {
        addMove(r + 2*dir, c, false);
      }
    }
  }

  const knightDirs = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  if (piece.type === 'n') {
    for (const [dr, dc] of knightDirs) {
      const nr = r + dr, nc = c + dc;
      if (isInside(nr, nc)) {
        if (isEmpty(nr, nc)) addMove(nr, nc, false);
        else if (canCapture(nr, nc)) addMove(nr, nc, true);
        else if (abilities.includes('swapKnight') && !isEmpty(nr, nc) && board[nr][nc].color === piece.color && board[nr][nc].type !== 'k') {
          moves.push({ from: {r, c}, to: {r: nr, c: nc}, isSwap: true, piece });
        }
      }
    }
    if (abilities.includes('royalKnight')) {
      const kingDirs = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
      for (const [dr, dc] of kingDirs) {
        const nr = r + dr, nc = c + dc;
        if (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) addMove(nr, nc, false);
          else if (canCapture(nr, nc)) addMove(nr, nc, true);
        }
      }
    }
    if (abilities.includes('modernKnight')) {
      const shootDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of shootDirs) {
        let cr = r + dr, cc = c + dc;
        while (isInside(cr, cc)) {
          if (!isEmpty(cr, cc)) {
            moves.push({ from: {r, c}, to: {r: cr, c: cc}, isShoot: true, targetPiece: board[cr][cc], piece });
            break;
          }
          cr += dr; cc += dc;
        }
      }
    }
  }

  const slideDirs = {
    'b': [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    'r': [[-1, 0], [1, 0], [0, -1], [0, 1]],
    'q': [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
    'k': [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
  };

  // Flying Bishop / Ghost Rook
  const canFly = (piece.type === 'b' && abilities.includes('flyingBishop')) || 
                 (piece.type === 'r' && abilities.includes('ghostRook'));

  if (['b', 'r', 'q'].includes(piece.type)) {
    let dirs = slideDirs[piece.type];
    for (const [dr, dc] of dirs) {
      let cr = r + dr, cc = c + dc;
      while (isInside(cr, cc)) {
        if (isEmpty(cr, cc)) {
          addMove(cr, cc, false);
        } else {
          if (canCapture(cr, cc)) addMove(cr, cc, true);
          if (!canFly) break; // stop at piece if cannot fly
          // if can fly, we continue checking squares, but we cannot land on own pieces
        }
        cr += dr; cc += dc;
      }
    }

    // Ability additions for Rook & Bishop
    if (piece.type === 'r' && abilities.includes('diagonalRook')) {
      for (const [dr, dc] of slideDirs['b']) {
        const nr = r + dr, nc = c + dc;
        if (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) addMove(nr, nc, false);
          else if (canCapture(nr, nc)) addMove(nr, nc, true);
        }
      }
    }
    if (piece.type === 'b' && abilities.includes('straightBishop')) {
      for (const [dr, dc] of slideDirs['r']) {
        const nr = r + dr, nc = c + dc;
        if (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) addMove(nr, nc, false);
          else if (canCapture(nr, nc)) addMove(nr, nc, true);
        }
      }
    }

    // Amazon Queen Knight Moves
    if (piece.type === 'q' && (abilities.includes('amazonQueen') || abilities.includes('king_amazonQueen'))) {
      const qKnightDirs = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of qKnightDirs) {
        const nr = r + dr, nc = c + dc;
        if (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) addMove(nr, nc, false);
          else if (canCapture(nr, nc)) addMove(nr, nc, true);
        }
      }
    }
  }

  if (piece.type === 'k') {
    for (const [dr, dc] of slideDirs['k']) {
      const nr = r + dr, nc = c + dc;
      if (isInside(nr, nc)) {
        if (isEmpty(nr, nc)) addMove(nr, nc, false);
        else if (canCapture(nr, nc)) addMove(nr, nc, true);
      }
    }

    if (abilities.includes('king_ghostRook')) {
      for (const [dr, dc] of slideDirs['r']) {
        let cr = r + dr, cc = c + dc;
        while (isInside(cr, cc)) {
          if (isEmpty(cr, cc)) addMove(cr, cc, false);
          else { if (canCapture(cr, cc)) addMove(cr, cc, true); }
          cr += dr; cc += dc;
        }
      }
    }

    if (abilities.includes('king_flyingBishop')) {
      for (const [dr, dc] of slideDirs['b']) {
        let cr = r + dr, cc = c + dc;
        while (isInside(cr, cc)) {
          if (isEmpty(cr, cc)) addMove(cr, cc, false);
          else { if (canCapture(cr, cc)) addMove(cr, cc, true); }
          cr += dr; cc += dc;
        }
      }
    }

    if (abilities.includes('king_royalKnight')) {
      for (const [dr, dc] of knightDirs) {
        const nr = r + dr, nc = c + dc;
        if (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) addMove(nr, nc, false);
          else if (canCapture(nr, nc)) addMove(nr, nc, true);
        }
      }
    }

    if (abilities.includes('king_relentlessPawn')) {
      for (const [dr, dc] of slideDirs['k']) {
        const nr2 = r + dr * 2, nc2 = c + dc * 2;
        if (isInside(nr2, nc2)) {
          if (isEmpty(nr2, nc2)) addMove(nr2, nc2, false);
          else if (canCapture(nr2, nc2)) addMove(nr2, nc2, true);
        }
      }
    }

    if (abilities.includes('king_diagonalRook')) {
       for (const [dr, dc] of slideDirs['b']) {
         const nr2 = r + dr * 2, nc2 = c + dc * 2;
         if (isInside(nr2, nc2)) {
           if (isEmpty(nr2, nc2)) addMove(nr2, nc2, false);
           else if (canCapture(nr2, nc2)) addMove(nr2, nc2, true);
         }
       }
    }

    if (abilities.includes('king_straightBishop')) {
       for (const [dr, dc] of slideDirs['r']) {
         const nr2 = r + dr * 2, nc2 = c + dc * 2;
         if (isInside(nr2, nc2)) {
           if (isEmpty(nr2, nc2)) addMove(nr2, nc2, false);
           else if (canCapture(nr2, nc2)) addMove(nr2, nc2, true);
         }
       }
    }

    if (abilities.includes('king_leapingPawn')) {
       if (isInside(r + 2*dir, c) && !isEmpty(r + dir, c) && isEmpty(r + 2*dir, c)) {
         addMove(r + 2*dir, c, false);
       }
    }

    if (abilities.includes('king_swapKnight')) {
      for (let rr=0; rr<8; rr++) {
        for (let cc=0; cc<8; cc++) {
          if (board[rr][cc] && board[rr][cc].color === piece.color && (rr!==r || cc!==c)) {
            moves.push({ from: {r, c}, to: {r: rr, c: cc}, isSwap: true, piece });
          }
        }
      }
    }

    if (abilities.includes('king_modernKnight')) {
      const shootDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of shootDirs) {
        let cr = r + dr, cc = c + dc;
        while (isInside(cr, cc)) {
          if (!isEmpty(cr, cc)) {
            moves.push({ from: {r, c}, to: {r: cr, c: cc}, isShoot: true, targetPiece: board[cr][cc], piece });
            break;
          }
          cr += dr; cc += dc;
        }
      }
    }

    if (abilities.includes('king_crabPawn') || abilities.includes('king_retreatingPawn')) {
       for (const [dr, dc] of slideDirs['k']) {
         const nr3 = r + dr * 3, nc3 = c + dc * 3;
         if (isInside(nr3, nc3)) {
           if (isEmpty(nr3, nc3)) addMove(nr3, nc3, false);
           else if (canCapture(nr3, nc3)) addMove(nr3, nc3, true);
         }
       }
    }

    if (abilities.includes('king_amazonQueen')) {
      const qKnightDirs = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of qKnightDirs) {
        const nr = r + dr, nc = c + dc;
        if (isInside(nr, nc)) {
          if (isEmpty(nr, nc)) addMove(nr, nc, false);
          else if (canCapture(nr, nc)) addMove(nr, nc, true);
        }
      }
    }
  }

  return moves;
}

// Generate full legal moves (filters out moves that leave king in check)
export function getLegalMoves(state) {
  const color = state.turn;
  const pseudoMoves = getAllPseudoLegalMoves(state, color);
  
  return pseudoMoves.filter(move => {
    // simulate move
    const valBoard = copyBoard(state.board);
    const targetPiece = valBoard[move.to.r][move.to.c];
    valBoard[move.to.r][move.to.c] = valBoard[move.from.r][move.from.c];
    valBoard[move.from.r][move.from.c] = null;
    
    // find king
    let kingPos = null;
    for (let r=0; r<8; r++) {
      for (let c=0; c<8; c++) {
        const p = valBoard[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingPos = {r, c};
          break;
        }
      }
    }
    if (!kingPos) return false; // king captured (should only happen in sacrifice)

    // is king under attack?
    const enemyColor = color === 'w' ? 'b' : 'w';
    const simState = { ...state, board: valBoard };
    const enemyMoves = getAllPseudoLegalMoves(simState, enemyColor);
    
    for (const em of enemyMoves) {
      if (em.to.r === kingPos.r && em.to.c === kingPos.c) {
        return false;
      }
    }
    return true;
  });
}

function copyBoard(board) {
  return board.map(row => row.map(p => p ? { ...p } : null));
}

export function executeMove(state, move) {
  const nextState = { 
    ...state,
    points: { ...state.points },
    cards: { ...state.cards },
    captured: { ...state.captured },
    fivePieceRuleTriggered: { ...state.fivePieceRuleTriggered }
  };
  nextState.board = copyBoard(state.board);
  const color = state.turn;
  const board = nextState.board;

  // Modern Knight / Shoot Logic
  if (move.isShoot) {
    const target = board[move.to.r][move.to.c];
    if (target) {
      target.shotCount = (target.shotCount || 0) + 1;
      target.stunTimer = 1;
      
      // If 5 shots, piece is destroyed
      if (target.shotCount >= 5) {
        const pts = PIECE_VALUES[target.type] || 0;
        if (target.color !== color) {
          nextState.points[color] += pts;
          nextState.captured[color] = [...nextState.captured[color], target.type];
        }
        board[move.to.r][move.to.c] = null;
      }
    }
    // Execution ends here for shoot — piece does not move
  } else if (move.isSwap) {
    const fromPiece = board[move.from.r][move.from.c];
    const toPiece = board[move.to.r][move.to.c];
    board[move.to.r][move.to.c] = fromPiece;
    board[move.from.r][move.from.c] = toPiece;
  } else {
    // Standard Move
    const targetPiece = board[move.to.r][move.to.c];
    
    // if capture, add points
    if (targetPiece && targetPiece.color !== color) {
      const pts = PIECE_VALUES[targetPiece.type] || 0;
      nextState.points[color] += pts;
      nextState.captured[color] = [...nextState.captured[color], targetPiece.type];
    }
    
    // move piece
    const piece = board[move.from.r][move.from.c];
    board[move.to.r][move.to.c] = piece;
    board[move.from.r][move.from.c] = null;
    
    // pawn promotion
    if (piece.type === 'p' && (move.to.r === 0 || move.to.r === 7)) {
      board[move.to.r][move.to.c] = { type: 'q', color };
    }
  }

  // 1. Check 5 pieces left logic
  let enemyPieces = 0;
  for (let r=0; r<8; r++) {
    for (let c=0; c<8; c++) {
      const p = board[r][c];
      if (p && p.color !== color) enemyPieces++;
    }
  }

  if (enemyPieces === 5 && !nextState.fivePieceRuleTriggered[color]) {
    nextState.fivePieceRuleTriggered[color] = true;
    const opponent = color === 'w' ? 'b' : 'w';
    const toCopy = nextState.cards[color] || [];
    const kingCards = toCopy.map(c => `king_${c}`);
    const currentOpp = nextState.cards[opponent] || [];
    nextState.cards[opponent] = Array.from(new Set([...currentOpp, ...kingCards]));
  }

  // 2. Decat stun timers for the player who just FINISHED their turn
  for (let r=0; r<8; r++) {
    for (let c=0; c<8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.stunTimer > 0) {
        p.stunTimer--;
      }
    }
  }

  nextState.turn = color === 'w' ? 'b' : 'w';
  
  // Check for win/loss/check
  const nextLegalMoves = getLegalMoves(nextState);
  if (nextLegalMoves.length === 0) {
    nextState.winner = color; // simplifies stalemate as win
  }

  return nextState;
}

export function drawCard(state, color) {
  if (state.points[color] >= 5) {
    const currentCards = state.cards[color] || [];
    const available = ALL_ABILITIES.filter(a => !a.id.startsWith('king_') && !currentCards.includes(a.id));
    if (available.length > 0) {
      const drawn = available[Math.floor(Math.random() * available.length)];
      const nextState = { ...state };
      nextState.points = { ...state.points, [color]: state.points[color] - 5 };
      nextState.cards = { ...state.cards, [color]: [...currentCards, drawn.id] };
      return { nextState, drawnCard: drawn };
    }
  }
  return { nextState: state, drawnCard: null };
}
