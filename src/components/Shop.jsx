import React, { useState } from 'react';
import { SHOP_ITEMS, LEVEL_EFFECTS, buyItem, setActiveEffect, getUnlockedEffects } from '../store/profile';

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

export default function Shop({ profile, onProfileChange, onBack }) {
  const [tab, setTab] = useState('abilities');
  const [notification, setNotification] = useState(null);
  const [previewId, setPreviewId] = useState(null);

  function showNotif(msg, ok=true) {
    setNotification({ msg, ok });
    setTimeout(() => setNotification(null), 2500);
  }

  function handleBuy(itemId) {
    if (profile.ownedItems.includes(itemId)) { showNotif('Already owned!', false); return; }
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (profile.coins < item.price) { showNotif('Not enough coins! 🪙', false); return; }
    const { profile: updated, success } = buyItem(profile, itemId);
    if (success) { onProfileChange(updated); showNotif(`${item.name} purchased!`); }
  }

  function handleSetEffect(effectId) {
    const updated = setActiveEffect(profile, effectId);
    onProfileChange(updated);
    showNotif('Effect activated! ✨');
  }

  function handlePreview(e, effectId) {
    e.stopPropagation();
    setPreviewId(null);
    setTimeout(() => {
      setPreviewId(effectId);
      setTimeout(() => setPreviewId(null), 800);
    }, 10);
  }

  const unlockedEffects = getUnlockedEffects(profile.level);

  // Auto-replay the capture animation every 2 seconds if previewing a board
  const isPreviewingBoard = previewId !== null;

  return (
    <div style={{minHeight:'100vh', background:'#0f172a', color:'#e2e8f0', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute',top:-80,right:-80,width:400,height:400,background:'radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 70%)',pointerEvents:'none'}}/>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <button onClick={onBack} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'#94a3b8',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:'bold'}}>
          ← Back
        </button>
        <h1 style={{margin:0,fontSize:28,fontWeight:900,fontFamily:'Outfit, sans-serif',background:'linear-gradient(135deg,#fbbf24,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          The Bazaar
        </h1>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,padding:'8px 16px',background:'rgba(250,204,21,0.1)',border:'1px solid rgba(250,204,21,0.25)',borderRadius:20,color:'#fbbf24',fontWeight:'bold',fontSize:16}}>
          🪙 {profile.coins.toLocaleString()}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',
          background: notification.ok ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
          color:'#fff',padding:'10px 24px',borderRadius:10,fontWeight:'bold',fontSize:14,
          zIndex:100,boxShadow:'0 4px 20px rgba(0,0,0,0.4)',animation:'slideDown 0.3s ease'
        }}>
          {notification.msg}
        </div>
      )}

      {/* Preview Board Modal */}
      {previewId && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200,
          display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)'
        }} onClick={() => setPreviewId(null)}>
          <div style={{
            background:'#1e293b', border:'1px solid rgba(245,158,11,0.4)', borderRadius:20, padding:30,
            maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 0 60px rgba(0,0,0,0.8)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{color:'#f8fafc', fontSize:22, margin:'0 0 8px'}}>In-Game Preview</h2>
            <p style={{color:'#94a3b8', fontSize:14, marginBottom:24}}>
              {LEVEL_EFFECTS.find(e => e.id === previewId)?.name || 'Effect'}
            </p>

            <div style={{
              display:'grid', gridTemplateColumns:'repeat(3, 1fr)', width:240, height:240, margin:'0 auto',
              border:'4px solid #0f172a', borderRadius:8, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {[0,1,2,3,4,5,6,7,8].map(i => {
                const isDark = (Math.floor(i/3) + (i%3)) % 2 !== 0;
                const isCenter = i === 4;
                return (
                  <div key={i} style={{
                    background: isDark ? '#334155' : '#e2e8f0',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative'
                  }}>
                    {isCenter && (
                      <>
                        <CaptureEffect effect={previewId} />
                        <svg viewBox="0 0 100 100" style={{width:'85%', height:'85%', position:'absolute', zIndex:10, animation:'previewPiece 2s infinite'}}>
                          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="75" fill="#f8fafc" stroke="#00000080" strokeWidth="2">
                            ♘
                          </text>
                        </svg>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setPreviewId(null)} style={{
              marginTop:30, padding:'10px 24px', background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', borderRadius:8,
              cursor:'pointer', fontWeight:'bold'
            }}>Close Preview</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:4,padding:'16px 24px 0',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        {['abilities','effects'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'10px 24px',borderRadius:'8px 8px 0 0',border:'none',cursor:'pointer',
            fontWeight:'bold',fontSize:14,transition:'all 0.2s',
            background: tab===t ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: tab===t ? '#fbbf24' : '#64748b',
            borderBottom: tab===t ? '2px solid #f59e0b' : '2px solid transparent'
          }}>
            {t === 'abilities' ? '⚡ Abilities' : '✨ Effects'}
          </button>
        ))}
      </div>

      <div style={{padding:24,maxWidth:800,margin:'0 auto'}}>
        {tab === 'abilities' && (
          <div>
            <p style={{color:'#64748b',marginBottom:20,fontSize:14}}>
              Use coins to unlock special abilities that carry into your games.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
              {SHOP_ITEMS.map(item => {
                const owned = profile.ownedItems.includes(item.id);
                return (
                  <div key={item.id} style={{
                    background:'rgba(255,255,255,0.03)',
                    border:`1px solid ${owned?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.06)'}`,
                    borderRadius:16,padding:24,transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: owned?'0 0 30px rgba(16,185,129,0.05)':'none',
                    display:'flex', flexDirection:'column', height:'100%'
                  }}>
                    <div style={{fontSize:36,marginBottom:8}}>{item.icon}</div>
                    <div style={{fontWeight:'bold',fontSize:16,marginBottom:4}}>{item.name}</div>
                    <div style={{fontSize:13,color:'#94a3b8',marginBottom:16,lineHeight:1.5}}>{item.desc}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontWeight:'bold',color:'#fbbf24',fontSize:16}}>🪙 {item.price}</span>
                      {owned
                        ? <span style={{color:'#34d399',fontWeight:'bold',fontSize:13}}>✓ Owned</span>
                        : <button onClick={()=>handleBuy(item.id)} style={{
                            padding:'8px 16px',borderRadius:8,border:'none',
                            background: profile.coins >= item.price ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'rgba(255,255,255,0.05)',
                            color: profile.coins >= item.price ? '#1a1a1a' : '#475569',
                            fontWeight:'bold',fontSize:13,cursor: profile.coins >= item.price ? 'pointer' : 'not-allowed',
                          }}>Buy</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'effects' && (
          <div>
            <p style={{color:'#64748b',marginBottom:20,fontSize:14}}>
              Visual effects are unlocked by leveling up. Select your active effect.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
              {LEVEL_EFFECTS.map(eff => {
                const unlocked = unlockedEffects.some(u => u.id === eff.id);
                const active = profile.activeEffect === eff.id;
                return (
                  <div key={eff.id} onClick={() => unlocked && handleSetEffect(eff.id)}
                    style={{
                      background: active ? `rgba(${eff.id==='ember'?'249,115,22':eff.id==='frost'?'56,189,248':eff.id==='thunder'?'250,204,21':eff.id==='shadow'?'168,85,247':eff.id==='celestial'?'251,191,36':'99,102,241'},0.12)` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${active ? eff.color : unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                      borderRadius:14,padding:20,textAlign:'center',
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      opacity: unlocked ? 1 : 0.4,
                      transition:'all 0.2s',
                      boxShadow: active ? `0 0 20px ${eff.color}40` : 'none',
                      position: 'relative', overflow: 'hidden'
                    }}>
                    {eff.id !== 'none' && (
                      <button onClick={(e) => { e.stopPropagation(); setPreviewId(eff.id); }} style={{
                        position:'absolute', top:8, right:8, background:'rgba(255,255,255,0.1)',
                        border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 8px', fontSize:11, color:'#f8fafc',
                        cursor:'pointer', zIndex:10, transition:'background 0.2s'
                      }}>
                        👁️ Preview
                      </button>
                    )}
                    <div style={{fontSize:40,marginBottom:8,filter: unlocked ? 'none' : 'grayscale(1)', position:'relative', zIndex:6}}>{eff.icon}</div>
                    <div style={{fontWeight:'bold',color: unlocked ? eff.color : '#475569', fontSize:15, marginBottom:4, position:'relative', zIndex:6}}>{eff.name}</div>
                    <div style={{fontSize:12,color:'#64748b', position:'relative', zIndex:6}}>
                      {unlocked ? (active ? '✓ Active' : 'Click to activate') : `Unlock at Level ${eff.level}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideDown{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        @keyframes previewPiece {
          0%, 30% { transform: scale(1) translateY(-100%); opacity:0; }
          35% { transform: scale(1.2) translateY(0); opacity:1; }
          40%, 80% { transform: scale(1) translateY(0); opacity:1; }
          90%, 100% { transform: scale(1) translateY(0); opacity:0; }
        }
        @keyframes ember {
          0%, 34%   { opacity:0; transform:scale(0); border-radius:0; }
          35%       { opacity:1; transform:scale(1); border-radius:0; }
          60%       { opacity:0.8; transform:scale(1.4) rotate(15deg); border-radius:30%; }
          100%      { opacity:0; transform:scale(2) rotate(30deg); border-radius:50%; }
        }
        @keyframes frost {
          0%, 34%   { opacity:0; transform:scale(0); filter:blur(0); }
          35%       { opacity:1; transform:scale(1); filter:blur(0); }
          55%       { opacity:0.9; transform:scale(1.2); filter:blur(0); }
          100%      { opacity:0; transform:scale(1.6); filter:blur(4px); }
        }
        @keyframes thunder {
          0%, 34%   { opacity:0; transform:scale(0); }
          35%,45%,65% { opacity:1; transform:scale(1) skewX(0deg); }
          40%,55%   { opacity:0.7; transform:scale(1.3) skewX(10deg); }
          75%,100%  { opacity:0; transform:scale(1.8); }
        }
        @keyframes shadow {
          0%, 34%   { opacity:0; transform:scale(0); }
          35%       { opacity:0.9; transform:scale(1); filter:blur(0); }
          100%      { opacity:0; transform:scale(3); filter:blur(12px); }
        }
        @keyframes celestial {
          0%, 34%   { opacity:0; transform:scale(0); }
          35%       { opacity:1; transform:scale(0.5) rotate(0deg); }
          60%       { opacity:1; transform:scale(1.3) rotate(180deg); }
          100%      { opacity:0; transform:scale(2.5) rotate(360deg); }
        }
        @keyframes voidfx {
          0%, 34%   { opacity:0; transform:scale(0); }
          35%       { opacity:1; transform:scale(1.5) rotate(0deg); filter:blur(0); }
          100%      { opacity:0; transform:scale(0.1) rotate(-360deg); filter:blur(6px); }
        }
      `}</style>
    </div>
  );
}
