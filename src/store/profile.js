// Profile store — persisted to localStorage
const STORAGE_KEY = 'chess_ascended_profile';

// XP = (level - 1)^2 * 185
const XP_COEFF = 185;

export const LEVEL_EFFECTS = [
  { level: 1, id: 'none',      name: 'None',       icon: '⬜', color: '#94a3b8' },
  { level: 2, id: 'ember',     name: '🔥 Ember',   icon: '🔥', color: '#f97316' },
  { level: 3, id: 'frost',     name: '❄️ Frost',   icon: '❄️', color: '#38bdf8' },
  { level: 4, id: 'thunder',   name: '⚡ Thunder', icon: '⚡', color: '#facc15' },
  { level: 5, id: 'shadow',    name: '💜 Shadow',  icon: '💜', color: '#a855f7' },
  { level: 6, id: 'celestial', name: '🌟 Celestial',icon:'🌟', color: '#fbbf24' },
  { level: 7, id: 'void',      name: '🌀 Void',    icon: '🌀', color: '#6366f1' },
];

export const SHOP_ITEMS = [
  { id: 'double_draw', name: 'Double Draw', desc: 'Draw 2 cards for the price of 1 (one use per game)', icon: '🃏', price: 80 },
  { id: 'king_shield', name: 'King Shield', desc: 'Your king ignores the first check per game', icon: '🛡️', price: 150 },
  { id: 'pawn_rush',   name: 'Pawn Rush',   desc: 'All pawns can move 3 squares on their first move', icon: '⚡', price: 120 },
  { id: 'time_warp',   name: 'Time Warp',   desc: 'Once per game, undo your last move', icon: '⏪', price: 200 },
  { id: 'ghost_piece', name: 'Ghost Piece', desc: 'One of your pieces is invisible to the opponent for 3 turns', icon: '👻', price: 180 },
];

export const SKINS = [
  { id: 'none',       name: 'Original',   icon: '⚪', price: 0,   desc: 'The classic chess look.' },
  { id: 'camo',       name: 'Camo',       icon: '🌿', price: 150, desc: 'Stealthy military camouflage.' },
  { id: 'gold',       name: 'Gold',       icon: '✨', price: 300, desc: 'Pure 24k gold plating.' },
  { id: 'magma',      name: 'Magma',      icon: '🌋', price: 200, desc: 'Burning volcanic energy.' },
  { id: 'void',       name: 'Void',       icon: '🌀', price: 250, desc: 'Cosmic stardust and shadows.' },
  { id: 'ice',        name: 'Ice',        icon: '❄️', price: 180, desc: 'Frozen crystalline shards.' },
];

export const XP_REWARDS = {
  'ai-1': { win: 60,  coins: 25 },
  'ai-2': { win: 120, coins: 50 },
  'ai-3': { win: 220, coins: 90 },
  'quick': { win: 180, coins: 70 },
  'pvp':  { win: 40,  coins: 15 },
};

function defaultProfile() {
  return { 
    xp: 0, 
    level: 1, 
    coins: 100, 
    activeEffect: 'none', 
    activeSkin: 'none',
    ownedItems: [],
    ownedSkins: ['none'],
    username: 'Grandmaster',
    wins: 0,
    totalGames: 0,
    winStreak: 0
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultProfile(), ...JSON.parse(raw) } : defaultProfile();
  } catch { return defaultProfile(); }
}

export function saveProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
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

export function getTitle(level) {
  if (level >= 1000) return 'TOUCH GRASS';
  if (level >= 500)  return 'SYSTEM ERROR';
  if (level >= 250)  return 'GODLIKE';
  if (level >= 150)  return 'ETHEREAL';
  if (level >= 125)  return 'WHATS GRASS';
  if (level >= 100)  return 'EYE OF THE STORM';
  if (level >= 90)   return 'EAT SLEEP CHESS REPEAT';
  if (level >= 80)   return 'ASCENDED';
  if (level >= 65)   return 'TRANSCENDENT';
  if (level >= 50)   return 'GRANDMASTER';
  if (level >= 40)   return 'ZENITH';
  if (level >= 30)   return 'MASTER';
  if (level >= 20)   return 'ADEPT';
  if (level >= 15)   return 'DISCIPLE';
  if (level >= 10)   return 'ELITE';
  if (level >= 5)    return 'PRODIGY';
  return 'MAX';
}

export function getTitleColor(level) {
  if (level >= 125) return 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)'; // Rainbow for WHATS GRASS
  if (level >= 100) return 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)'; // Silver/Cloud
  if (level >= 90)  return 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'; // Pink/Purple for EAT SLEEP...
  if (level >= 80)  return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'; // Golden
  if (level >= 65)  return 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)'; // Purple
  if (level >= 50)  return 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)'; // Blue
  if (level >= 30)  return '#f472b6'; // Pink
  if (level >= 15)  return '#fb7185'; // Rose
  if (level >= 5)   return '#c084fc'; // Light Purple
  return '#cbd5e1'; // Slate-300 (Silver) for Level 1-4
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

export function setUsername(profile, name) {
  const updated = { ...profile, username: name.substring(0, 16) };
  saveProfile(updated);
  return updated;
}

