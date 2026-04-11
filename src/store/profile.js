// Profile store — persisted to localStorage
const STORAGE_KEY = 'chess_ascended_profile';

const XP_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];

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

export const XP_REWARDS = {
  'ai-1': { win: 60,  coins: 25 },
  'ai-2': { win: 120, coins: 50 },
  'ai-3': { win: 220, coins: 90 },
  'quick': { win: 180, coins: 70 },
  'pvp':  { win: 40,  coins: 15 },
};

function defaultProfile() {
  return { xp: 0, level: 1, coins: 100, activeEffect: 'none', ownedItems: [] };
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
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, XP_THRESHOLDS.length);
}

export function getXPForLevel(level) {
  return XP_THRESHOLDS[Math.min(level - 1, XP_THRESHOLDS.length - 1)] || 0;
}

export function getXPForNextLevel(level) {
  return XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
}

export function getUnlockedEffects(level) {
  return LEVEL_EFFECTS.filter(e => e.level <= level);
}

// Returns { profile, leveled, newLevel, prevLevel }
export function awardXP(profile, xpAmount, coinAmount = 0) {
  const prevLevel = profile.level;
  const newXP = profile.xp + xpAmount;
  const newCoins = profile.coins + coinAmount;
  const newLevel = getLevelFromXP(newXP);
  const leveled = newLevel > prevLevel;
  const updated = { ...profile, xp: newXP, coins: newCoins, level: newLevel };
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

export function setActiveEffect(profile, effectId) {
  const updated = { ...profile, activeEffect: effectId };
  saveProfile(updated);
  return updated;
}
