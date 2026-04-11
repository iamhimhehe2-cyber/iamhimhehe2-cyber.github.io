import React from 'react';
import { getXPForLevel, getXPForNextLevel } from '../store/profile';

export default function ProfileBar({ profile }) {
  const xpCurrent = profile.xp - getXPForLevel(profile.level);
  const xpNeeded = getXPForNextLevel(profile.level) - getXPForLevel(profile.level);
  const pct = Math.min(100, Math.round((xpCurrent / xpNeeded) * 100));
  const isMaxLevel = profile.level >= 10;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'8px 20px',
      background:'rgba(15,23,42,0.9)', borderBottom:'1px solid rgba(255,255,255,0.07)',
      backdropFilter:'blur(8px)', position:'sticky', top:0, zIndex:50
    }}>
      {/* Level Badge */}
      <div style={{
        width:40, height:40, borderRadius:'50%', flexShrink:0,
        background:'linear-gradient(135deg,#f59e0b,#f97316)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:16, fontWeight:900, color:'#1a1a1a',
        boxShadow:'0 0 12px rgba(245,158,11,0.5)'
      }}>
        {profile.level}
      </div>

      {/* XP Bar */}
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
          <span style={{fontSize:11, color:'#94a3b8', fontWeight:'bold', textTransform:'uppercase', letterSpacing:1}}>
            Level {profile.level}
          </span>
          <span style={{fontSize:11, color:'#64748b'}}>
            {isMaxLevel ? 'MAX' : `${xpCurrent} / ${xpNeeded} XP`}
          </span>
        </div>
        <div style={{height:5, background:'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden'}}>
          <div style={{
            height:'100%', width:`${isMaxLevel ? 100 : pct}%`,
            background:'linear-gradient(90deg,#f59e0b,#f97316)',
            borderRadius:3, transition:'width 0.8s ease'
          }}/>
        </div>
      </div>

      {/* Coins */}
      <div style={{
        display:'flex', alignItems:'center', gap:6, padding:'4px 12px',
        background:'rgba(250,204,21,0.1)', border:'1px solid rgba(250,204,21,0.25)',
        borderRadius:20, color:'#fbbf24', fontWeight:'bold', fontSize:14, flexShrink:0
      }}>
        🪙 {profile.coins.toLocaleString()}
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
