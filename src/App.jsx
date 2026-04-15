import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Peer } from 'peerjs';
import Board from './components/Board';
import Dashboard from './components/Dashboard';
import Learning from './components/Learning';
import Shop from './components/Shop';
import ProfileBar from './components/ProfileBar';
import LevelUpModal from './components/LevelUpModal';
import AFKZone from './components/AFKZone';
import { createInitialState, executeMove, drawCard } from './chess-engine/engine';
import { getAIMove } from './chess-engine/ai';
import { loadProfile, saveProfile, awardXP, XP_REWARDS, setUsername, getTitle, getTitleColor, getWinRate, getXPForLevel, getXPForNextLevel } from './store/profile';

// ── Quick Match slot helpers ──────────────────────────────────────────────────
const QM_TOTAL = 10; // Low amount to ensure players actually match
function randomSlot() { return Math.floor(Math.random() * QM_TOTAL) + 1; }

export default function App() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(createInitialState());
  const [gameMode, setGameMode] = useState(null);
  const [playerColor, setPlayerColor] = useState('w');
  const [profile, setProfile] = useState(() => loadProfile());
  const [levelUpData, setLevelUpData] = useState(null); // { newLevel, coinsEarned }
  const [xpNotif, setXpNotif] = useState(null); // { xp, coins }
  const [xpAwarded, setXpAwarded] = useState(false);

  // Online state
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [peerId, setPeerId] = useState('');
  const [targetJoinId, setTargetJoinId] = useState('');
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [quickMatchStatus, setQuickMatchStatus] = useState('idle'); // 'idle'|'searching'|'found'|'failed'
  const [quickMatchMsg, setQuickMatchMsg] = useState('');
  const [networkErrorMsg, setNetworkErrorMsg] = useState('');
  const [opponentProfile, setOpponentProfile] = useState(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);
  
  // Force update document title for verification
  useEffect(() => {
    document.title = `Chess: Ascended V0.0.2 | ${getTitle(profile.level)}`;
  }, [profile.level]);

  // Award XP when the game ends
  useEffect(() => {
    if (gameState.winner && !xpAwarded && gameMode) {
      setXpAwarded(true);
      const isMyWin = (gameMode === 'pvp')
        ? true
        : gameState.winner === playerColor;
      if (!isMyWin) return;

      const key = gameMode.startsWith('ai') ? gameMode.replace('-','') :
                  gameMode === 'quick' ? 'quick' : 'pvp';
      const rewardKey = gameMode === 'ai-1' ? 'ai-1' :
                        gameMode === 'ai-2' ? 'ai-2' :
                        gameMode === 'ai-3' ? 'ai-3' :
                        gameMode === 'quick'|| gameMode === 'online' ? 'quick' : 'pvp';
      const rewards = XP_REWARDS[rewardKey] || { win: 40, coins: 15 };

      const { profile: updated, leveled, newLevel } = awardXP(profile, rewards.win, rewards.coins, isMyWin);
      setProfile(updated);
      setXpNotif({ xp: rewards.win, coins: rewards.coins });
      setTimeout(() => setXpNotif(null), 3000);
      if (leveled) {
        setTimeout(() => setLevelUpData({ newLevel, coinsEarned: rewards.coins }), 800);
      }
      // Send final state to opponent if online
      if (connRef.current) {
        connRef.current.send(gameState);
      }
    }
  }, [gameState.winner, gameMode, playerColor, xpAwarded, profile]);

  // AI moves
  useEffect(() => {
    if (gameMode && gameMode.startsWith('ai')) {
      if (gameState.turn !== playerColor && !gameState.winner) {
        const level = parseInt(gameMode.split('-')[1]);
        const timer = setTimeout(() => {
          let st = gameState;
          if (st.points[st.turn] >= 5) {
            const { nextState } = drawCard(st, st.turn);
            st = nextState;
            setGameState(st);
          }
          const move = getAIMove(st, level);
          if (move) setGameState(executeMove(st, move));
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, gameMode, playerColor]);

  // Cleanup peer
  useEffect(() => () => { if (peerRef.current) peerRef.current.destroy(); }, []);

  // ── Networking ──────────────────────────────────────────────────────────────
  const startHosting = () => {
    setNetworkErrorMsg('');
    if (peerRef.current) peerRef.current.destroy();

    // Generate a simple 6-character room code without the CHESS- prefix to avoid spam filters
    const randomId = Math.random().toString(36).substring(2,8).toUpperCase();
    const newPeer = new Peer(randomId, { debug: 0 }); // Use pure defaults

    newPeer.on('open', id => { 
      setPeerId(id); 
      setConnectionStatus('hosting'); 
    });
    
    newPeer.on('connection', conn => {
      connRef.current = conn;
      setConnectionStatus('connected');
      setGameMode('online'); setPlayerColor('w');
      conn.on('data', data => {
        if (data?.type === 'IDENTITY') {
          setOpponentProfile(data.profile);
        } else {
          setGameState(data);
        }
      });
      conn.on('open', () => {
        conn.send({ 
          type: 'IDENTITY', 
          profile: {
            username: profile.username,
            level: profile.level,
            wins: profile.wins,
            totalGames: profile.totalGames,
            winStreak: profile.winStreak,
            activeEffect: profile.activeEffect
          }
        });
        conn.send(createInitialState());
      });
      conn.on('error', () => { setConnectionStatus('disconnected'); setNetworkErrorMsg('Player disconnected.'); });
      navigate('/play');
    });
    
    newPeer.on('error', err => { 
      setConnectionStatus('disconnected'); 
      setNetworkErrorMsg('Server rejected connection. Please wait 15 minutes before hosting again or try another network. (Rate Limiting)');
    });
    peerRef.current = newPeer;
  };

  const joinGame = () => {
    if (!targetJoinId) return;
    setNetworkErrorMsg('');
    if (peerRef.current) peerRef.current.destroy();
    
    const newPeer = new Peer({ debug: 0 });

    newPeer.on('open', () => {
      const conn = newPeer.connect(targetJoinId.toUpperCase(), { reliable: true });
      connRef.current = conn;
      setConnectionStatus('connecting');
      
      conn.on('open', () => { 
        setConnectionStatus('connected'); 
        setGameMode('online'); 
        setPlayerColor('b'); 
        conn.send({ 
          type: 'IDENTITY', 
          profile: {
            username: profile.username,
            level: profile.level,
            wins: profile.wins,
            totalGames: profile.totalGames,
            winStreak: profile.winStreak,
            activeEffect: profile.activeEffect
          }
        });
        navigate('/play');
      });
      conn.on('data', data => {
        if (data?.type === 'IDENTITY') {
          setOpponentProfile(data.profile);
        } else {
          setGameState(data);
        }
      });
      conn.on('error', () => { 
        setNetworkErrorMsg('Disconnected from host.'); 
        setConnectionStatus('disconnected'); 
      });
    });

    newPeer.on('error', err => { 
      setConnectionStatus('disconnected');
      setNetworkErrorMsg('Could not join room. Host may be offline or invalid code.');
    });

    peerRef.current = newPeer;
  };

  const cancelQMRef = useRef(false);

  const startQuickMatch = () => {
    cancelQMRef.current = false;
    setQuickMatchStatus('searching');
    setQuickMatchMsg('Connecting to network...');
    let currentSlot = 1;
    let fallbackTimeout = null;

    const searchPeer = new Peer({ debug: 0 });
    peerRef.current = searchPeer;

    const tryNextSlot = () => {
      if (cancelQMRef.current) return;

      if (currentSlot > QM_TOTAL) {
        searchPeer.destroy();
        const slot = randomSlot();
        const hostId = `CHESSQM${String(slot).padStart(3,'0')}H`; // Removed hyphen for strict filter bypass
        setQuickMatchMsg(`Hosting match on Channel ${slot}...`);
        
        const hostPeer = new Peer(hostId, { debug: 0 });
        hostPeer.on('open', () => {
          if (cancelQMRef.current) { hostPeer.destroy(); return; }
          setPeerId(String(slot));
          setQuickMatchStatus('waiting');
          setQuickMatchMsg(`Waiting for opponent...`);
        });
        hostPeer.on('connection', conn => {
          if (cancelQMRef.current) { conn.close(); return; }
          connRef.current = conn;
          setConnectionStatus('connected');
          setGameMode('quick'); setPlayerColor('w');
          setQuickMatchStatus('found');
          conn.on('data', data => {
            if (data?.type === 'IDENTITY') {
              setOpponentProfile(data.profile);
            } else {
              setGameState(data);
            }
          });
          conn.on('open', () => {
            conn.send({ 
          type: 'IDENTITY', 
          profile: {
            username: profile.username,
            level: profile.level,
            wins: profile.wins,
            totalGames: profile.totalGames,
            winStreak: profile.winStreak,
            activeEffect: profile.activeEffect
          }
        });
            conn.send(createInitialState());
          });
          navigate('/play');
        });
        hostPeer.on('error', (err) => {
          setQuickMatchStatus('failed');
          setQuickMatchMsg('Could not host match. ' + (err.message || ''));
        });
        peerRef.current = hostPeer;
        return;
      }

      const targetId = `CHESSQM${String(currentSlot).padStart(3,'0')}H`;
      setQuickMatchMsg(`Scanning Channel ${currentSlot}/${QM_TOTAL}`);
      
      const conn = searchPeer.connect(targetId, { reliable: true });
      
      // Fallback if the connection hangs without throwing 'peer-unavailable'
      fallbackTimeout = setTimeout(() => {
         currentSlot++;
         tryNextSlot();
      }, 700);

      conn.on('open', () => {
        clearTimeout(fallbackTimeout);
        if (cancelQMRef.current) { conn.close(); return; }
        connRef.current = conn;
        setConnectionStatus('connected');
        setGameMode('quick'); setPlayerColor('b');
        setQuickMatchStatus('found');
        conn.send({ type: 'IDENTITY', profile: profile });
        navigate('/play');
      });
      conn.on('data', data => {
        if (data?.type === 'IDENTITY') {
          setOpponentProfile(data.profile);
        } else {
          setGameState(data);
        }
      });
    };

    searchPeer.on('open', () => {
      tryNextSlot();
    });

    searchPeer.on('error', (err) => {
      if (err.type === 'peer-unavailable') {
         if (fallbackTimeout) clearTimeout(fallbackTimeout);
         currentSlot++;
         // Adding a micro-delay prevents spamming the server instantly 10 times and getting rate-limited
         setTimeout(tryNextSlot, 150);
      } else {
         setQuickMatchStatus('failed');
         setQuickMatchMsg('Network Error: ' + err.message);
      }
    });
  };

  const cancelQuickMatch = () => {
    cancelQMRef.current = true;
    if (peerRef.current) peerRef.current.destroy();
    setQuickMatchStatus('idle');
    setConnectionStatus('disconnected');
    setNetworkErrorMsg('');
    navigate('/');
  };

  const resetNetworking = () => {
    cancelQMRef.current = true;
    if (peerRef.current) peerRef.current.destroy();
    setConnectionStatus('disconnected');
    setGameMode(null);
    setShowJoinPrompt(false);
    setQuickMatchStatus('idle');
    setXpAwarded(false);
    setNetworkErrorMsg('');
    setOpponentProfile(null);
    navigate('/');
  };

  const handleMove = (move) => {
    const next = executeMove(gameState, move);
    setGameState(next);
    if ((gameMode === 'online' || gameMode === 'quick') && connRef.current) {
      connRef.current.send(next);
    }
  };

  const handleDrawCard = () => {
    const { nextState, drawnCard } = drawCard(gameState, playerColor);
    if (drawnCard) {
      setGameState(nextState);
      if ((gameMode === 'online' || gameMode === 'quick') && connRef.current) connRef.current.send(nextState);
    }
  };

  const handleDrawCardOpponent = () => {
    const { nextState } = drawCard(gameState, playerColor === 'w' ? 'b' : 'w');
    setGameState(nextState);
    if ((gameMode === 'online' || gameMode === 'quick') && connRef.current) connRef.current.send(nextState);
  };

  const startGame = (mode, color='w') => {
    setGameMode(mode); setPlayerColor(color);
    setGameState(createInitialState()); setXpAwarded(false);
    navigate('/play');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const oppColor = playerColor === 'w' ? 'b' : 'w';

  return (
    <Routes>
      <Route path="/learn" element={
        <>
          <ProfileBar profile={profile}/>
          <Learning onBack={() => navigate('/')}/>
        </>
      } />

      <Route path="/shop" element={
        <>
          <ProfileBar profile={profile}/>
          <Shop profile={profile} onProfileChange={p => { setProfile(p); saveProfile(p); }} onBack={() => navigate('/')}/>
        </>
      } />

      <Route path="/afk" element={
        <>
          <ProfileBar profile={profile}/>
          <AFKZone profile={profile} onProfileChange={p => { setProfile(p); saveProfile(p); }} onBack={() => navigate('/')} />
        </>
      } />

      <Route path="/" element={
        <>
        {/* Quick Match / Main Menu wrapper */}
        {(quickMatchStatus !== 'idle' && quickMatchStatus !== 'found' && gameMode !== 'quick') ? (
          <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column'}}>
            <ProfileBar profile={profile}/>
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(99,102,241,0.4)',borderRadius:20,padding:40,textAlign:'center',maxWidth:400,width:'100%'}}>
                <div style={{width:64,height:64,border:'4px solid #6366f1',borderTop:'4px solid transparent',borderRadius:'50%',margin:'0 auto 24px',animation:'spin 1s linear infinite'}}/>
                <h2 style={{color:'#e2e8f0',fontSize:22,fontWeight:'bold',margin:'0 0 12px'}}>Quick Match</h2>
                <p style={{color:'#94a3b8',fontSize:14,marginBottom:28}}>{quickMatchMsg}</p>
                {quickMatchStatus === 'waiting' && (
                  <div style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:12,padding:16,marginBottom:24}}>
                    <p style={{color:'#818cf8',fontSize:12,textTransform:'uppercase',letterSpacing:2,margin:'0 0 4px'}}>Hosting Slot</p>
                    <p style={{color:'#6366f1',fontSize:40,fontWeight:900,margin:0}}>{peerId}</p>
                  </div>
                )}
                <button onClick={cancelQuickMatch} style={{padding:'10px 28px',background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',color:'#f87171',borderRadius:8,cursor:'pointer',fontWeight:'bold'}}>
                  Cancel
                </button>
              </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (!gameMode && connectionStatus !== 'connected') ? (
          <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
            {/* Premium Background Effects */}
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 20% 30%,rgba(99,102,241,0.08) 0%,transparent 50%),radial-gradient(circle at 80% 70%,rgba(245,158,11,0.05) 0%,transparent 50%)',pointerEvents:'none'}}/>
            <div className="mesh-gradient" style={{position:'absolute',top:0,left:0,right:0,bottom:0,opacity:0.3,pointerEvents:'none'}}/>
            
            <ProfileBar profile={profile}/>
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:16,position:'relative',zIndex:1}}>
              <div style={{
                background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:20,padding:32,maxWidth:440,width:'100%',
                boxShadow:'0 0 80px rgba(99,102,241,0.15)', position:'relative',overflow:'hidden'
              }}>
                <div style={{position:'absolute',top:-80,left:'50%',transform:'translateX(-50%)',width:300,height:300,background:'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)',pointerEvents:'none'}}/>
                <h1 style={{textAlign:'center',fontSize:36,fontWeight:900,background:'linear-gradient(135deg,#f59e0b,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 4px',position:'relative'}}>
                  Chess: Ascended
                </h1>
                <p style={{textAlign:'center',color:'#64748b',fontSize:13,margin:'0 0 28px',position:'relative'}}>Draw cards, bend the rules, dominate the board.</p>

                {/* Player Profile & Stats Card */}
                <div style={{
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:16, padding:20, marginBottom:24, boxShadow:'inset 0 0 20px rgba(0,0,0,0.2)',
                  position:'relative', overflow:'hidden'
                }}>
                  <div style={{display:'flex', gap:16, alignItems:'center', position:'relative', zIndex:1}}>
                    {/* Rank Badge */}
                    <div style={{
                      width:64, height:64, borderRadius:16, flexShrink:0,
                      background: profile.level >= 50 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      boxShadow: profile.level >= 50 ? '0 0 30px rgba(245,158,11,0.3)' : '0 0 20px rgba(99,102,241,0.2)',
                      border:'1px solid rgba(255,255,255,0.2)', transform:'rotate(-3deg)'
                    }}>
                      <span style={{fontSize:10, fontWeight:900, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', marginBottom:-4}}>Level</span>
                      <span style={{fontSize:28, fontWeight:900, color:'#fff', lineHeight:1}}>{profile.level}</span>
                    </div>

                    <div style={{flex:1, minWidth:0}}>
                      <p style={{fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:1.5, marginBottom:2, fontWeight:900}}>Current Status</p>
                      <h3 style={{fontSize:22, fontWeight:900, color:'#f8fafc', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{profile.username}</h3>
                      <div style={{
                        fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:2, marginTop:4,
                        background: getTitleColor(profile.level), WebkitBackgroundClip: getTitleColor(profile.level).includes('gradient') ? 'text' : 'none',
                        WebkitTextFillColor: getTitleColor(profile.level).includes('gradient') ? 'transparent' : getTitleColor(profile.level),
                        color: getTitleColor(profile.level).includes('gradient') ? 'transparent' : getTitleColor(profile.level),
                        filter: getTitleColor(profile.level).includes('gradient') ? 'drop-shadow(0 0 4px rgba(255,255,255,0.1))' : 'none'
                      }}>
                        {getTitle(profile.level)}
                      </div>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div style={{marginTop:16}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:'#94a3b8', fontWeight:'bold', marginBottom:6, textTransform:'uppercase', letterSpacing:1}}>
                      <span>Progress to Next Rank</span>
                      <span>{Math.floor(profile.xp - getXPForLevel(profile.level)).toLocaleString()} / {Math.floor(getXPForNextLevel(profile.level) - getXPForLevel(profile.level)).toLocaleString()} XP</span>
                    </div>
                    <div style={{height:8, background:'rgba(0,0,0,0.3)', borderRadius:4, overflow:'hidden', border:'1px solid rgba(255,255,255,0.05)'}}>
                      <div style={{
                        height:'100%', width:`${Math.min(100, Math.round(((profile.xp - getXPForLevel(profile.level)) / (getXPForNextLevel(profile.level) - getXPForLevel(profile.level))) * 100))}%`,
                        background: profile.level >= 80 ? 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                        borderRadius:4, transition:'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: '0 0 10px rgba(99,102,241,0.3)'
                      }}/>
                    </div>
                  </div>

                  {/* Combat Stats Grid */}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:16}}>
                    <div style={{background:'rgba(0,0,0,0.2)', padding:'10px 8px', borderRadius:10, textAlign:'center', border:'1px solid rgba(255,255,255,0.03)'}}>
                      <p style={{fontSize:9, color:'#64748b', textTransform:'uppercase', marginBottom:2, fontWeight:900}}>Win Rate</p>
                      <p style={{fontSize:16, fontWeight:900, color:'#10b981', margin:0}}>{getWinRate(profile)}%</p>
                    </div>
                    <div style={{background:'rgba(0,0,0,0.2)', padding:'10px 8px', borderRadius:10, textAlign:'center', border:'1px solid rgba(255,255,255,0.03)'}}>
                      <p style={{fontSize:9, color:'#64748b', textTransform:'uppercase', marginBottom:2, fontWeight:900}}>Hot Streak</p>
                      <p style={{fontSize:16, fontWeight:900, color:'#f59e0b', margin:0}}>{profile.winStreak}🔥</p>
                    </div>
                    <div style={{background:'rgba(0,0,0,0.2)', padding:'10px 8px', borderRadius:10, textAlign:'center', border:'1px solid rgba(255,255,255,0.03)'}}>
                      <p style={{fontSize:9, color:'#64748b', textTransform:'uppercase', marginBottom:2, fontWeight:900}}>Total Wins</p>
                      <p style={{fontSize:16, fontWeight:900, color:'#818cf8', margin:0}}>{profile.wins}</p>
                    </div>
                  </div>

                  {/* Background Decoration */}
                  <div style={{position:'absolute', right:-20, bottom:-20, fontSize:100, opacity:0.04, pointerEvents:'none', transform:'rotate(-15deg)'}}>🛡️</div>
                </div>

                {/* Name Entry */}
                <div style={{marginBottom:24, background:'rgba(255,255,255,0.03)', padding:16, borderRadius:12, border:'1px solid rgba(255,255,255,0.05)'}}>
                  <p style={{fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:8}}>Update Nickname</p>
                  <input 
                    type="text" 
                    value={profile.username} 
                    onChange={e => {
                      const updated = setUsername(profile, e.target.value);
                      setProfile(updated);
                    }}
                    placeholder="Enter name..."
                    style={{
                      width:'100%', background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.1)',
                      padding:'10px 14px', borderRadius:8, color:'#fff', outline:'none', fontSize:14
                    }}
                  />
                </div>

                {networkErrorMsg && (
                  <div style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',color:'#fca5a5',padding:'12px',borderRadius:8,marginBottom:20,fontSize:13,textAlign:'center',fontWeight:'bold'}}>
                    ⚠️ {networkErrorMsg}
                  </div>
                )}

                {connectionStatus === 'disconnected' && !showJoinPrompt && (
                  <div style={{display:'flex',flexDirection:'column',gap:10,position:'relative'}}>
                    <button onClick={startQuickMatch} style={{
                      padding:'14px',borderRadius:12,border:'none',cursor:'pointer',fontWeight:'bold',fontSize:15,
                      background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',
                      boxShadow:'0 0 20px rgba(99,102,241,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:8
                    }}>
                      ⚡ Quick Match <span style={{fontSize:11,opacity:0.8,fontWeight:'normal'}}>(auto-find opponent)</span>
                    </button>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <button onClick={startHosting} style={{padding:'12px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:'bold',background:'rgba(99,102,241,0.15)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.3)'}}>
                        🌐 Host Room
                      </button>
                      <button onClick={()=>setShowJoinPrompt(true)} style={{padding:'12px',borderRadius:10,border:'1px solid rgba(16,185,129,0.3)',cursor:'pointer',fontWeight:'bold',background:'rgba(16,185,129,0.12)',color:'#34d399'}}>
                        🔗 Join Room
                      </button>
                    </div>

                    <button onClick={()=>startGame('pvp')} style={{padding:'12px',borderRadius:10,border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',fontWeight:'bold',background:'rgba(255,255,255,0.04)',color:'#cbd5e1'}}>
                      🎮 Local PvP (Same Screen)
                    </button>

                    <div style={{height:1,background:'rgba(255,255,255,0.07)',margin:'4px 0'}}/>
                    <p style={{textAlign:'center',fontSize:11,color:'#475569',textTransform:'uppercase',letterSpacing:2,margin:0}}>vs AI</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                      {[1,2,3].map(lvl => (
                        <button key={lvl} onClick={()=>startGame(`ai-${lvl}`)} style={{
                          padding:'10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',
                          background:'rgba(255,255,255,0.04)',color:'#94a3b8',fontWeight:'bold',textAlign:'center'
                        }}>
                          <div style={{fontSize:18,marginBottom:2}}>{['🟢','🟡','🔴'][lvl-1]}</div>
                          <div style={{fontSize:12}}>AI Lvl {lvl}</div>
                          <div style={{fontSize:10,color:'#475569'}}>{['60','120','220'][lvl-1]} XP</div>
                        </button>
                      ))}
                    </div>

                    <div style={{height:1,background:'rgba(255,255,255,0.07)',margin:'4px 0'}}/>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                      <button onClick={()=>navigate('/learn')} style={{
                        padding:'12px',borderRadius:10,border:'1px solid rgba(245,158,11,0.3)',cursor:'pointer',
                        background:'rgba(245,158,11,0.08)',color:'#fbbf24',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:6
                      }}>
                        🏛️ Academy
                      </button>
                      <button onClick={()=>navigate('/shop')} style={{
                        padding:'12px',borderRadius:10,border:'1px solid rgba(168,85,247,0.3)',cursor:'pointer',
                        background:'rgba(168,85,247,0.08)',color:'#c084fc',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:6
                      }}>
                        ⚖️ The Bazaar
                      </button>
                      <button onClick={()=>navigate('/afk')} style={{
                        padding:'12px',borderRadius:10,border:'1px solid rgba(99,102,241,0.3)',cursor:'pointer',
                        background:'rgba(99,102,241,0.08)',color:'#818cf8',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:6
                      }}>
                        🌙 Grounds
                      </button>
                    </div>
                  </div>
                )}

                {showJoinPrompt && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <h2 style={{color:'#e2e8f0',fontSize:20,fontWeight:'bold',margin:0}}>Join Game</h2>
                    <p style={{color:'#94a3b8',fontSize:13,margin:0}}>Enter your friend's 6-character room code:</p>
                    <input type="text" value={targetJoinId} onChange={e=>setTargetJoinId(e.target.value)}
                      placeholder="e.g. A1B2C3" maxLength={6}
                      style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.15)',padding:'12px',borderRadius:8,textAlign:'center',fontSize:22,fontFamily:'monospace',textTransform:'uppercase',letterSpacing:6,color:'#fff',outline:'none'}}/>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <button onClick={()=>setShowJoinPrompt(false)} style={{padding:'12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8',borderRadius:8,cursor:'pointer',fontWeight:'bold'}}>Cancel</button>
                      <button onClick={joinGame} style={{padding:'12px',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',borderRadius:8,cursor:'pointer',fontWeight:'bold'}}>Connect</button>
                    </div>
                  </div>
                )}

                {connectionStatus === 'hosting' && (
                  <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{width:48,height:48,border:'4px solid #6366f1',borderTop:'4px solid transparent',borderRadius:'50%',margin:'0 auto',animation:'spin 1s linear infinite'}}/>
                    <p style={{color:'#94a3b8'}}>Waiting for opponent...</p>
                    <div style={{background:'rgba(0,0,0,0.3)',padding:16,borderRadius:12,border:'1px solid rgba(255,255,255,0.08)'}}>
                      <p style={{color:'#64748b',fontSize:11,textTransform:'uppercase',letterSpacing:2,margin:'0 0 4px'}}>Room Code</p>
                      <p style={{color:'#818cf8',fontSize:36,fontFamily:'monospace',fontWeight:900,margin:0}}>{peerId}</p>
                    </div>
                    <button onClick={resetNetworking} style={{color:'#64748b',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Cancel</button>
                  </div>
                )}

                {connectionStatus === 'connecting' && (
                  <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:16}}>
                    <div style={{width:48,height:48,border:'4px solid #10b981',borderTop:'4px solid transparent',borderRadius:'50%',margin:'0 auto',animation:'spin 1s linear infinite'}}/>
                    <p style={{color:'#34d399',fontWeight:'bold'}}>Connecting to {targetJoinId.toUpperCase()}...</p>
                    <button onClick={resetNetworking} style={{color:'#64748b',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : null}
        </>
      } />

      <Route path="/play" element={
        <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column',padding:'0 0 20px'}}>
          <ProfileBar profile={profile}/>
          
          {levelUpData && (
            <LevelUpModal newLevel={levelUpData.newLevel} coinsEarned={levelUpData.coinsEarned} onClose={() => setLevelUpData(null)} />
          )}

          {xpNotif && (
            <div style={{
              position:'fixed',top:70,right:20,zIndex:200,background:'rgba(15,23,42,0.95)',border:'1px solid rgba(245,158,11,0.4)',
              borderRadius:12,padding:'12px 20px',boxShadow:'0 8px 32px rgba(0,0,0,0.5)',animation:'slideIn 0.4s ease'
            }}>
              <div style={{color:'#fbbf24',fontWeight:'bold',fontSize:16}}>⬆ +{xpNotif.xp} XP</div>
              <div style={{color:'#f59e0b',fontSize:14}}>🪙 +{xpNotif.coins} coins</div>
            </div>
          )}

          {gameState.winner && (
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{background:'#1e293b',border:'2px solid rgba(245,158,11,0.5)',borderRadius:20,padding:40,textAlign:'center',boxShadow:'0 0 60px rgba(245,158,11,0.2)'}}>
                <div style={{fontSize:60,marginBottom:8}}>{gameState.winner === playerColor ? '🏆' : '💀'}</div>
                <h2 style={{fontSize:40,fontWeight:900,color:'#fbbf24',margin:'0 0 8px'}}>{gameState.winner === 'w' ? 'White' : 'Black'} Wins!</h2>
                {gameState.winner === playerColor && <div style={{color:'#34d399',fontSize:16,marginBottom:16,fontWeight:'bold'}}>+XP earned! 🎉</div>}
                <button onClick={()=>{resetNetworking();setGameState(createInitialState());}}
                  style={{padding:'12px 32px',background:'linear-gradient(135deg,#f59e0b,#f97316)',border:'none',color:'#1a1a1a',borderRadius:10,fontWeight:'bold',fontSize:16,cursor:'pointer'}}>
                  Back to Menu
                </button>
              </div>
            </div>
          )}

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',maxWidth:1400,width:'100%',margin:'0 auto'}}>
            <button onClick={resetNetworking} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#94a3b8',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:'bold'}}>
              ← Quit
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {(gameMode==='online'||gameMode==='quick') && (
                <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:20}}>
                  <div style={{width:8,height:8,background:'#10b981',borderRadius:'50%',animation:'pulse 2s infinite'}}/>
                  <span style={{color:'#34d399',fontWeight:'bold',fontSize:13}}>{gameMode==='quick'?'Quick Match':'Online'}</span>
                </div>
              )}
              {gameMode?.startsWith('ai') && (
                <div style={{padding:'6px 14px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:20,color:'#fbbf24',fontWeight:'bold',fontSize:13}}>
                  🤖 AI Level {gameMode.split('-')[1]}
                </div>
              )}
            </div>
          </div>

          <div style={{display:'flex',flexWrap:'wrap',gap:24,alignItems:'flex-start',justifyContent:'center',padding:'0 16px',maxWidth:1400,margin:'0 auto',width:'100%'}}>
            <div style={{flex:'1 1 0',maxWidth:'75vh',minWidth:280}}>
              <Board state={gameState} onMove={handleMove} playerColor={gameMode==='pvp'?null:playerColor} captureEffect={profile.activeEffect || 'none'} activeSkin={profile.activeSkin || 'none'}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16,width:300,flexShrink:0}}>
              <Dashboard 
                color={oppColor} 
                state={gameState} 
                onDrawCard={gameMode==='pvp'?handleDrawCardOpponent:null} 
                isPlayer={gameMode==='pvp'}
                playerInfo={opponentProfile || (gameMode==='pvp' ? { username: 'Black', level: profile.level } : null)}
                activeSkin={profile.activeSkin || 'none'}
              />
              <Dashboard 
                color={playerColor} 
                state={gameState} 
                onDrawCard={handleDrawCard} 
                isPlayer={true}
                playerInfo={profile}
                activeSkin={profile.activeSkin || 'none'}
              />
            </div>
          </div>
          <style>{`
            @keyframes spin{to{transform:rotate(360deg)}}
            @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
            @keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
          `}</style>
        </div>
      } />
    </Routes>
  );
}
