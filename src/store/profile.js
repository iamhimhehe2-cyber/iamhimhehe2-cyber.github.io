// Profile store — persisted to localStorage
const STORAGE_KEY = 'chess_ascended_profile';

// XP = (level - 1)^2 * 185
const XP_COEFF = 185;

export const LEVEL_EFFECTS = [
  { level: 1, id: 'none', name: 'None', icon: '⬜', color: '#94a3b8' },
  { level: 2, id: 'ember', name: '🔥 Ember', icon: '🔥', color: '#f97316' },
  { level: 3, id: 'frost', name: '❄️ Frost', icon: '❄️', color: '#38bdf8' },
  { level: 4, id: 'thunder', name: '⚡ Thunder', icon: '⚡', color: '#facc15' },
  { level: 5, id: 'shadow', name: '💜 Shadow', icon: '💜', color: '#a855f7' },
  { level: 6, id: 'celestial', name: '🌟 Celestial', icon: '🌟', color: '#fbbf24' },
  { level: 7, id: 'void', name: '🌀 Void', icon: '🌀', color: '#6366f1' },
];

export const SHOP_ITEMS = [
  { id: 'double_draw', name: 'Double Draw', desc: 'Draw 2 cards for the price of 1 (one use per game)', icon: '🃏', price: 80 },
  { id: 'king_shield', name: 'King Shield', desc: 'Your king ignores the first check per game', icon: '🛡️', price: 150 },
  { id: 'pawn_rush', name: 'Pawn Rush', desc: 'All pawns can move 3 squares on their first move', icon: '⚡', price: 120 },
  { id: 'time_warp', name: 'Time Warp', desc: 'Once per game, undo your last move', icon: '⏪', price: 200 },
  { id: 'ghost_piece', name: 'Ghost Piece', desc: 'One of your pieces is invisible to the opponent for 3 turns', icon: '👻', price: 180 },
];

export const SKINS = [
  { id: 'none', name: 'Original', icon: '⚪', price: 0, desc: 'The classic chess look.' },
  { id: 'camo', name: 'Camo', icon: '🌿', price: 150, desc: 'Stealthy military camouflage.' },
  { id: 'gold', name: 'Gold', icon: '✨', price: 300, desc: 'Pure 24k gold plating.' },
  { id: 'magma', name: 'Magma', icon: '🌋', price: 200, desc: 'Burning volcanic energy.' },
  { id: 'void', name: 'Void', icon: '🌀', price: 250, desc: 'Cosmic stardust and shadows.' },
  { id: 'ice', name: 'Ice', icon: '❄️', price: 180, desc: 'Frozen crystalline shards.' },
];


export const BOARDS = [
  { id: 'classic', name: 'Classic', icon: '♟️', price: 0, desc: 'The traditional wooden chess board.' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', price: 400, desc: 'Neon grids and glitchy interactions.' },
  { id: 'space', name: 'Deep Space', icon: '🌌', price: 500, desc: 'Parallax stars and cosmic ripples.' },
  { id: 'underwater', name: 'Underwater', icon: '🌊', price: 450, desc: 'Rising bubbles and water splashes.' },
];

export const XP_REWARDS = {
  'ai-1': { win: 60, coins: 25 },
  'ai-2': { win: 120, coins: 50 },
  'ai-3': { win: 220, coins: 90 },
  'quick': { win: 180, coins: 70 },
  'pvp': { win: 40, coins: 15 },
};

// ── Quests ──────────────────────────────────────────────────────────────────
export const PERMANENT_QUESTS = [
  { id: 'pawn_to_queen', name: 'Ascension', desc: 'Upgrade a pawn to a Queen', rewardXp: 300, type: 'promo', target: 1 },
  { id: 'stun_kill_achievement', name: 'Stun Kill', desc: 'Use modern knight to kill 5 cards in one match', rewardTitle: 'STUN KILL', type: 'match_modern_knight_kills', target: 5 },
  { id: 'grandmaster_achievement', name: 'The Grandmaster', desc: 'Win a game against AI Level 3', rewardTitle: 'GRANDMASTER', type: 'win_ai_3', target: 1 },
  { id: 'win_streak_achievement', name: 'Unstoppable', desc: 'Maintain a 5-win streak', rewardTitle: 'UNSTOPPABLE', type: 'win_streak', target: 5 },
  { id: 'collector_achievement', name: 'Hoarder', desc: 'Hold 15 soul essence at once', rewardTitle: 'ESSENCE HOARDER', type: 'hold_essence', target: 15 },
  { id: 'deck_master', name: 'Tactician', desc: 'Draw 5 cards in a single match', rewardTitle: 'TACTICIAN', type: 'match_cards_drawn', target: 5 },
];

export const DAILY_QUEST_POOL = [
  ...Array.from({length: 20}, (_, i) => ({ id: `daily_win_${i+1}`, type: 'win', target: Math.ceil((i+1)/4), rewardXp: 100 * (i+1), name: `Victory Lap ${i+1}`, desc: `Win ${Math.ceil((i+1)/4)} matches` })),
  ...Array.from({length: 20}, (_, i) => ({ id: `daily_capture_${i+1}`, type: 'capture', target: (i+1)*3, rewardXp: 50 * (i+1), name: `Soul Harvester ${i+1}`, desc: `Capture ${(i+1)*3} pieces` })),
  ...Array.from({length: 20}, (_, i) => ({ id: `daily_draw_${i+1}`, type: 'draw', target: Math.ceil((i+1)/2), rewardXp: 40 * (i+1), name: `Card Shark ${i+1}`, desc: `Draw ${Math.ceil((i+1)/2)} cards` })),
  ...Array.from({length: 20}, (_, i) => ({ id: `daily_essence_${i+1}`, type: 'essence', target: (i+1)*10, rewardXp: 60 * (i+1), name: `Essence Flux ${i+1}`, desc: `Collect ${(i+1)*10} soul essence` })),
  ...Array.from({length: 20}, (_, i) => ({ id: `daily_promo_${i+1}`, type: 'promo', target: 1, rewardXp: 200, name: `Promotion Day ${i+1}`, desc: `Promote a pawn to Queen` })),
];

function defaultProfile() {
  return {
    xp: 0,
    level: 1,
    coins: 100,
    activeEffect: 'none',
    activeSkin: 'none',
    activeBoard: 'classic',
    ownedItems: [],
    ownedSkins: ['none'],
    ownedBoards: ['classic'],
    redeemedCodes: [],
    username: 'Grandmaster',
    wins: 0,
    totalGames: 0,
    winStreak: 0,
    unlockedTitles: [],      // Titles like 'STUN KILL'
    equippedTitleId: null,      // Manual title
    questProgress: {},       // { questId: currentProgress }
    dailyQuestIds: [],       // Current 5 quests
    lastQuestReset: null,    // Date string
    completedQuests: [],     // Completed permanent quest IDs
    globallyReservedNames: [], // Names learned from other STARTER claimants
    uid: Math.random().toString(36).substring(2, 12),
    reservedName: null       // The name this user has officially "Equipped"
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed.ownedBoards) parsed.ownedBoards = ['classic'];
    if (!parsed.activeBoard) parsed.activeBoard = 'classic';
    if (!parsed.redeemedCodes) parsed.redeemedCodes = [];
    if (!parsed.globallyReservedNames) parsed.globallyReservedNames = [];
    if (!parsed.uid) parsed.uid = Math.random().toString(36).substring(2, 12);
    if (!parsed.reservedName) parsed.reservedName = null;
    return raw ? { ...defaultProfile(), ...parsed } : defaultProfile();
  } catch { return defaultProfile(); }
}

export function saveProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { }
}

export function getLevelFromXP(xp) {
  // Solve: xp = (level - 1)^2 * XP_COEFF -> level = sqrt(xp / XP_COEFF) + 1
  const level = Math.floor(Math.sqrt(xp / XP_COEFF)) + 1;
  return Math.max(1, level);
}

export function getXPForLevel(level) {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * XP_COEFF;
}

export function getXPForNextLevel(level) {
  return Math.pow(level, 2) * XP_COEFF;
}

export function getTitle(profile) {
  if (profile.equippedTitleId) return profile.equippedTitleId;
  const { level } = profile;
  if (level >= 1000) return 'TOUCH GRASS';
  if (level >= 500) return 'SYSTEM ERROR';
  if (level >= 250) return 'GODLIKE';
  if (level >= 150) return 'ETHEREAL';
  if (level >= 100) return 'ASCENDED';
  if (level >= 50) return 'WHATS GRASS';
  if (level >= 25) return 'EAT SLEEP CHESS REPEAT';
  if (level >= 10) return 'MAXX';
  return '';
}

export function getTitleColor(level) {
  if (level >= 250) return 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)'; // Rainbow
  if (level >= 100) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'; // Golden
  if (level >= 50) return 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)'; // Blue/Azure (WHATS GRASS)
  if (level >= 25) return 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'; // Pink/Purple (EAT SLEEP...)
  if (level >= 10) return '#c084fc'; // Light Purple (MAXX)
  return '#f8fafc'; // White
}

export function getWinRate(profile) {
  if (!profile.totalGames) return 0;
  return Math.round((profile.wins / profile.totalGames) * 100);
}

export function getUnlockedEffects(level) {
  return LEVEL_EFFECTS.filter(e => e.level <= level);
}

// Returns { profile, leveled, newLevel, prevLevel }
export function awardXP(profile, xpAmount, coinAmount = 0, didWin = true) {
  const prevLevel = profile.level;
  const newXP = profile.xp + xpAmount;
  const newCoins = profile.coins + coinAmount;
  const newLevel = getLevelFromXP(newXP);
  const leveled = newLevel > prevLevel;

  const updated = {
    ...profile,
    xp: newXP,
    coins: newCoins,
    level: newLevel,
    wins: profile.wins + (didWin ? 1 : 0),
    totalGames: profile.totalGames + 1,
    winStreak: didWin ? (profile.winStreak + 1) : 0
  };

  saveProfile(updated);
  return { profile: updated, leveled, newLevel, prevLevel };
}

export function spendCoins(profile, amount) {
  if (profile.coins < amount) return { profile, success: false };
  const updated = { ...profile, coins: profile.coins - amount };
  saveProfile(updated);
  return { profile: updated, success: true };
}

export function buyItem(profile, itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return { profile, success: false };
  if (profile.ownedItems.includes(itemId)) return { profile, success: false };
  const result = spendCoins(profile, item.price);
  if (!result.success) return result;
  const updated = { ...result.profile, ownedItems: [...result.profile.ownedItems, itemId] };
  saveProfile(updated);
  return { profile: updated, success: true };
}

export function buySkin(profile, skinId) {
  const skin = SKINS.find(s => s.id === skinId);
  if (!skin) return { profile, success: false };
  if (profile.ownedSkins.includes(skinId)) return { profile, success: false };
  const result = spendCoins(profile, skin.price);
  if (!result.success) return result;
  const updated = { ...result.profile, ownedSkins: [...result.profile.ownedSkins, skinId] };
  saveProfile(updated);
  return { profile: updated, success: true };
}

export function setActiveEffect(profile, effectId) {
  const updated = { ...profile, activeEffect: effectId };
  saveProfile(updated);
  return updated;
}

export function setActiveSkin(profile, skinId) {
  const updated = { ...profile, activeSkin: skinId };
  saveProfile(updated);
  return updated;
}


export function buyBoard(profile, boardId) {
  const board = BOARDS.find(b => b.id === boardId);
  if (!board) return { profile, success: false };
  const owned = profile.ownedBoards || ['classic'];
  if (owned.includes(boardId)) return { profile, success: false };
  const result = spendCoins(profile, board.price);
  if (!result.success) return result;
  const updated = { ...result.profile, ownedBoards: [...owned, boardId] };
  saveProfile(updated);
  return { profile: updated, success: true };
}

export function setActiveBoard(profile, boardId) {
  const updated = { ...profile, activeBoard: boardId };
  saveProfile(updated);
  return updated;
}

// Names reserved by the ORIGINAL code — no one else can use them
const RESERVED_NAMES = ['original', 'iamhimhehe'];

export function isNameReserved(name, profile) {
  const lower = name.trim().toLowerCase();
  const dynamic = profile.globallyReservedNames || [];
  
  // If it's the user's own reserved name, it's not reserved for THEM
  if (profile.reservedName && profile.reservedName.toLowerCase() === lower) return false;

  if (!RESERVED_NAMES.includes(lower) && !dynamic.includes(lower)) return false;
  // Allow if this profile has already redeemed ORIGINAL or STARTER
  if (profile.nameGold) return false;
  return true;
}

export function addReservedName(profile, name) {
  const lower = name.trim().toLowerCase();
  const current = profile.globallyReservedNames || [];
  if (current.includes(lower)) return profile;
  if (RESERVED_NAMES.includes(lower)) return profile;
  
  const updated = { ...profile, globallyReservedNames: [...current, lower] };
  saveProfile(updated);
  return updated;
}

export function setUsername(profile, name) {
  if (isNameReserved(name, profile)) return profile; // silently block
  const updated = { ...profile, username: name.substring(0, 16) };
  saveProfile(updated);
  return updated;
}


export function redeemCode(profile, code) {
  const codeStr = code.trim().toUpperCase();
  const redeemed = profile.redeemedCodes || [];
  
  if (redeemed.includes(codeStr)) {
    return { profile, success: false, message: 'Code already redeemed!' };
  }

  let updated = { ...profile, redeemedCodes: [...redeemed, codeStr] };
  let rewards = null;

  if (codeStr === 'EXP4000') {
    const { profile: afterXp } = awardXP(updated, 4000, 0, false);
    updated = afterXp;
    rewards = '4000 EXP';
  } else if (codeStr === 'GOLD1000') {
    updated = { ...updated, coins: updated.coins + 1000 };
    saveProfile(updated);
    rewards = '1000 Coins';
  } else if (codeStr === 'ORIGINAL') {
    updated = { ...updated, coins: updated.coins + 1000, nameGold: true };
    saveProfile(updated);
    rewards = '1000 Gold + Golden Name';
  } else if (codeStr === 'STARTER') {
    updated = { ...updated, coins: updated.coins + 5000, nameGold: true };
    saveProfile(updated);
    rewards = '5000 Gold + Golden Name';
  } else {
    return { profile, success: false, message: 'Invalid code!' };
  }

  return { profile: updated, success: true, message: `Redeemed ${rewards}!` };
}

export function getActiveQuests(profile) {
  const today = new Date().toDateString();
  let updated = { ...profile };
  let changed = false;

  if (profile.lastQuestReset !== today) {
    const ids = [];
    const pool = [...DAILY_QUEST_POOL];
    for (let i=0; i<5; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      ids.push(pool[idx].id);
      pool.splice(idx, 1);
    }
    updated.dailyQuestIds = ids;
    updated.lastQuestReset = today;
    // We don't necessarily reset progress if we want multi-day quests, 
    // but the user said "switches to another 5 quests", implying replacement.
    changed = true;
  }
  
  if (changed) saveProfile(updated);
  
  const dailies = updated.dailyQuestIds.map(id => DAILY_QUEST_POOL.find(q => q.id === id)).filter(Boolean);
  return { dailies, updated };
}

export function updateQuestProgress(profile, type, amount, isMatchEnd = false) {
  let updated = { ...profile, questProgress: { ...profile.questProgress } };
  let rewards = { xp: 0, titles: [] };
  
  const allQuests = [...DAILY_QUEST_POOL, ...PERMANENT_QUESTS];
  const activeIds = [...profile.dailyQuestIds, ...PERMANENT_QUESTS.map(q => q.id)];
  
  activeIds.forEach(id => {
    const q = allQuests.find(quest => quest.id === id);
    if (!q || q.type !== type) return;
    if (profile.completedQuests.includes(id)) return;
    
    const current = updated.questProgress[id] || 0;
    if (current >= q.target) return;
    
    const nextValue = isMatchEnd ? amount : (current + amount);
    updated.questProgress[id] = nextValue;
    
    if (nextValue >= q.target) {
      // Completed!
      if (q.rewardXp) rewards.xp += q.rewardXp;
      if (q.rewardTitle) {
        rewards.titles.push(q.rewardTitle);
        updated.unlockedTitles = Array.from(new Set([...updated.unlockedTitles, q.rewardTitle]));
      }
      if (PERMANENT_QUESTS.some(pq => pq.id === id)) {
        updated.completedQuests = [...updated.completedQuests, id];
      }
    }
  });

  if (rewards.xp > 0 || rewards.titles.length > 0) {
    const { profile: profilesAfterXp } = awardXP(updated, rewards.xp, 0, false);
    updated = profilesAfterXp;
  } else {
    saveProfile(updated);
  }

  return { updated, rewards };
}

export function equipTitle(profile, titleId) {
  const updated = { ...profile, equippedTitleId: titleId };
  saveProfile(updated);
  return updated;
}

