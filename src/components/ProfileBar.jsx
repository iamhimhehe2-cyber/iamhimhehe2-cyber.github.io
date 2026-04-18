import React from 'react';
import { getXPForLevel, getXPForNextLevel, getTitle, getTitleColor } from '../store/profile';

export default function ProfileBar({ profile }) {
  const xpCurrent = profile.xp - getXPForLevel(profile.level);
  const xpNeeded = getXPForNextLevel(profile.level) - getXPForLevel(profile.level);
  const pct = Math.min(100, Math.round((xpCurrent / xpNeeded) * 100));
  
  const title = getTitle(profile.level);
  const titleColor = getTitleColor(profile.level);

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'8px 20px',
      background:'rgba(15,23,42,0.9)', borderBottom:'1px solid rgba(255,255,255,0.07)',
      backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:50
    }}>
      {/* Level Badge */}
      <div style={{
        width:42, height:42, borderRadius:12, flexShrink:0,
        background: profile.level >= 50 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 900, color: '#fff',
        boxShadow: profile.level >= 50 ? '0 0 20px rgba(245,158,11,0.4)' : '0 0 15px rgba(99,102,241,0.3)',
        transform: 'rotate(-5deg)', border: '2px solid rgba(255,255,255,0.2)'
      }}>
        {profile.level}
      </div>

      {/* User Info & XP Bar */}
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5}}>
          <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
            <span style={{fontSize:15, fontWeight:900, color:'#f8fafc', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{profile.username}</span>
            {title && (
              <span style={{
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5,
                background: titleColor.includes('gradient') ? titleColor : 'none', 
                WebkitBackgroundClip: titleColor.includes('gradient') ? 'text' : 'none',
                WebkitTextFillColor: titleColor.includes('gradient') ? 'transparent' : titleColor,
                color: titleColor.includes('gradient') ? 'transparent' : titleColor,
                whiteSpace: 'nowrap',
                filter: titleColor.includes('gradient') ? 'drop-shadow(0 0 2px rgba(255,255,255,0.1))' : 'none'
              }}>{title}</span>
            )}
          </div>
          <span style={{fontSize:10, color:'#94a3b8', fontVariantNumeric:'tabular-nums', fontWeight:'bold'}}>
            {Math.floor(xpCurrent).toLocaleString()} / {Math.floor(xpNeeded).toLocaleString()} XP
          </span>
        </div>
        <div style={{height:6, background:'rgba(0,0,0,0.3)', borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.05)'}}>
          <div style={{
            height:'100%', width:`${pct}%`,
            background: profile.level >= 80 ? 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
            borderRadius:10, transition:'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 10px rgba(99,102,241,0.5)'
          }}/>
        </div>
      </div>

      {/* Coins */}
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <span style={{fontSize:9, fontWeight:900, color:'#475569', opacity:0.6}}>V0.0.2</span>
        <div style={{
          display:'flex', alignItems:'center', gap:6, padding:'4px 12px',
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:20, color:'#fbbf24', fontWeight:'bold', fontSize:14, flexShrink:0
      }}>
        🪙 {profile.coins.toLocaleString()}
      </div>
    </div>

      {/* Active Effect */}
      {profile.activeEffect && profile.activeEffect !== 'none' && (
        <div style={{
          padding:'4px 10px', background:'rgba(255,255,255,0.05)',
          border:'1px solid rgba(255,255,255,0.1)', borderRadius:20,
          fontSize:13, flexShrink:0
        }}>
          {profile.activeEffect === 'ember' ? '🔥' :
           profile.activeEffect === 'frost' ? '❄️' :
           profile.activeEffect === 'thunder' ? '⚡' :
           profile.activeEffect === 'shadow' ? '💜' :
           profile.activeEffect === 'celestial' ? '🌟' : '🌀'}
        </div>
      )}
    </div>
  );
}

