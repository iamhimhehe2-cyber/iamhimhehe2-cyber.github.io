import React, { useState, useEffect } from 'react';
import { getActiveQuests, PERMANENT_QUESTS, equipTitle, getTitle } from '../store/profile';

export default function Quests({ profile, onProfileChange, onBack }) {
  const { dailies, updated: profileAfterRotation } = getActiveQuests(profile);
  
  // Sync if daily rotation happened
  useEffect(() => {
    if (profileAfterRotation.lastQuestReset !== profile.lastQuestReset) {
      onProfileChange(profileAfterRotation);
    }
  }, [profileAfterRotation, profile.lastQuestReset, onProfileChange]);

  const sortedPermanent = [...PERMANENT_QUESTS].sort((a, b) => {
    const aDone = profile.completedQuests.includes(a.id);
    const bDone = profile.completedQuests.includes(b.id);
    return aDone === bDone ? 0 : aDone ? 1 : -1;
  });

  const renderQuestCard = (q, isPermanent = false) => {
    const progress = profile.questProgress[q.id] || 0;
    const isDone = isPermanent ? profile.completedQuests.includes(q.id) : progress >= q.target;
    const pct = Math.min(100, Math.round((progress / q.target) * 100));

    return (
      <div key={q.id} style={{
        background: 'rgba(30,41,59,0.7)',
        border: isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
        opacity: isDone && isPermanent ? 0.6 : 1
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
          <div>
            <h4 style={{margin:0, fontSize:15, color: isDone ? '#10b981' : '#f1f5f9', fontWeight:900, textTransform:'uppercase', letterSpacing:1}}>{q.name} {isDone && '✓'}</h4>
            <p style={{margin:'4px 0 0', fontSize:12, color:'#94a3b8'}}>{q.desc}</p>
          </div>
          <div style={{textAlign:'right'}}>
            {q.rewardXp && <div style={{fontSize:11, fontWeight:900, color:'#fbbf24'}}>+{q.rewardXp} XP</div>}
            {q.rewardTitle && <div style={{fontSize:10, fontWeight:900, color:'#a855f7', textTransform:'uppercase'}}>Title: {q.rewardTitle}</div>}
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{flex:1, height:6, background:'rgba(0,0,0,0.3)', borderRadius:3, overflow:'hidden'}}>
            <div style={{
              width: `${pct}%`, height: '100%', 
              background: isDone ? '#10b981' : 'linear-gradient(90deg, #6366f1, #a855f7)',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <span style={{fontSize:10, color:'#64748b', fontWeight:'bold', minWidth:40, textAlign:'right'}}>
            {progress}/{q.target}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{minHeight:'100vh', background:'#0f172a', color:'#fff', padding:'20px 16px 100px'}}>
      <div style={{maxWidth:800, margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:32}}>
          <button onClick={onBack} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontWeight:900}}>← Back</button>
          <h1 style={{fontSize:32, fontWeight:900, margin:0, background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Quest Board</h1>
        </div>

        <div style={{display:'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap:32}}>
          <div style={{display:'flex', flexDirection:'column', gap:32}}>
            {/* Daily Quests */}
            <section>
              <h2 style={{fontSize:18, fontWeight:900, textTransform:'uppercase', letterSpacing:3, color:'#64748b', marginBottom:16, display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:24}}>📅</span> Daily Missions
              </h2>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {dailies.map(q => renderQuestCard(q))}
              </div>
            </section>

            {/* Permanent Quests */}
            <section>
              <h2 style={{fontSize:18, fontWeight:900, textTransform:'uppercase', letterSpacing:3, color:'#64748b', marginBottom:16, display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:24}}>🏆</span> Achievements
              </h2>
              <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:12}}>
                {sortedPermanent.map(q => renderQuestCard(q, true))}
              </div>
            </section>
          </div>

          {/* Title Collection */}
          <section>
            <h2 style={{fontSize:18, fontWeight:900, textTransform:'uppercase', letterSpacing:3, color:'#64748b', marginBottom:16, display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:24}}>🎖️</span> Titles
            </h2>
            <div style={{background: 'rgba(30,41,59,0.5)', borderRadius: 20, padding: 20, border:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {/* Level Based Title */}
                <div style={{
                  padding:12, borderRadius:12, background: !profile.equippedTitleId ? 'rgba(99,102,241,0.1)' : 'transparent',
                  border: !profile.equippedTitleId ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  cursor: 'pointer'
                }} onClick={() => onProfileChange(equipTitle(profile, null))}>
                  <p style={{margin:0, fontSize:10, color:'#64748b', textTransform:'uppercase', fontWeight:900}}>Level Reward</p>
                  <p style={{margin:0, fontSize:16, fontWeight:900, color: !profile.equippedTitleId ? '#818cf8' : '#cbd5e1'}}>{getTitle({...profile, equippedTitleId: null})}</p>
                </div>

                <div style={{height:1, background:'rgba(255,255,255,0.05)', margin:'10px 0'}} />

                {profile.unlockedTitles.length === 0 && (
                  <p style={{fontSize:12, color:'#475569', textAlign:'center', margin:'20px 0'}}>No custom titles unlocked yet. Complete achievements to earn them!</p>
                )}

                {profile.unlockedTitles.map(t => (
                  <button key={t} onClick={() => onProfileChange(equipTitle(profile, t))} style={{
                    textAlign: 'left', padding: 12, borderRadius: 12, cursor: 'pointer', border: 'none',
                    background: profile.equippedTitleId === t ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                    border: profile.equippedTitleId === t ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}>
                    <p style={{margin:0, fontSize:16, fontWeight:900, color: profile.equippedTitleId === t ? '#c084fc' : '#94a3b8'}}>{t}</p>
                    {profile.equippedTitleId === t && <span style={{fontSize:10, color:'#a855f7', fontWeight:900, textTransform:'uppercase'}}>Equipped</span>}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
