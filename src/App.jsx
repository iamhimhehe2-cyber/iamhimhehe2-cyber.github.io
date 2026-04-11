import React, { useState, useEffect, useRef } from 'react';
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
import { loadProfile, saveProfile, awardXP, XP_REWARDS } from './store/profile';

// ── Quick Match slot helpers ──────────────────────────────────────────────────
const QM_TOTAL = 200;
function randomSlot() { return Math.floor(Math.random() * QM_TOTAL) + 1; }
function slotId(n) { return `CHESS-QM-${String(n).padStart(3,'0')}`; }

export default function App() {
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
  const peerRef = useRef(null);
  const connRef = useRef(null);

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

      const { profile: updated, leveled, newLevel } = awardXP(profile, rewards.win, rewards.coins);
      setProfile(updated);
      setXpNotif({ xp: rewards.win, coins: rewards.coins });
      setTimeout(() => setXpNotif(null), 3000);
      if (leveled) {
        setTimeout(() => setLevelUpData({ newLevel, coinsEarned: rewards.coins }), 800);
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
      conn.on('data', data => setGameState(data));
      conn.on('open', () => conn.send(createInitialState()));
      conn.on('error', () => { setConnectionStatus('disconnected'); setNetworkErrorMsg('Player disconnected.'); });
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
      });
      conn.on('data', data => setGameState(data));
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
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    let fallbackTimeout = null;

    const searchPeer = new Peer();
    peerRef.current = searchPeer;

    const tryNextSlot = () => {
      if (cancelQMRef.current) return;

      if (attempts >= MAX_ATTEMPTS) {
        searchPeer.destroy();
        const slot = randomSlot();
        const hostId = `CHESS-QM-${String(slot).padStart(3,'0')}-H`;
        setQuickMatchMsg(`No active matches found. Hosting on slot ${slot}...`);
        
        const hostPeer = new Peer(hostId);
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
          conn.on('data', data => setGameState(data));
          conn.on('open', () => conn.send(createInitialState()));
        });
        hostPeer.on('error', (err) => {
          setQuickMatchStatus('failed');
          setQuickMatchMsg('Could not host. Network error.');
        });
        peerRef.current = hostPeer;
        return;
      }

      const slot = randomSlot();
      const targetId = `CHESS-QM-${String(slot).padStart(3,'0')}-H`;
      setQuickMatchMsg(`Scanning for players... (${attempts+1}/${MAX_ATTEMPTS})`);
      attempts++;
      
      const conn = searchPeer.connect(targetId, { reliable: true });
      
      fallbackTimeout = setTimeout(() => {
         tryNextSlot();
      }, 1000); // 1s per slot

      conn.on('open', () => {
        clearTimeout(fallbackTimeout);
        if (cancelQMRef.current) { conn.close(); return; }
        connRef.current = conn;
        setConnectionStatus('connected');
        setGameMode('quick'); setPlayerColor('b');
        setQuickMatchStatus('found');
        conn.on('data', data => setGameState(data));
      });
    };

    searchPeer.on('open', () => {
      tryNextSlot();
    });

    searchPeer.on('error', (err) => {
      if (err.type === 'peer-unavailable') {
         if (fallbackTimeout) clearTimeout(fallbackTimeout);
         setTimeout(tryNextSlot, 10);
      } else {
         setQuickMatchStatus('failed');
         setQuickMatchMsg('Network Error: ' + err.type);
      }
    });
  };

  const cancelQuickMatch = () => {
    cancelQMRef.current = true;
    if (peerRef.current) peerRef.current.destroy();
    setQuickMatchStatus('idle');
    setConnectionStatus('disconnected');
    setNetworkErrorMsg('');
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
  };

  // ── Special screens ─────────────────────────────────────────────────────────
  if (gameMode === 'learn') return (
    <>
      <ProfileBar profile={profile}/>
      <Learning onBack={() => setGameMode(null)}/>
    </>
  );

  if (gameMode === 'shop') return (
    <>
      <ProfileBar profile={profile}/>
      <Shop profile={profile} onProfileChange={p => { setProfile(p); saveProfile(p); }} onBack={() => setGameMode(null)}/>
    </>
  );

  if (gameMode === 'afk') return (
    <>
      <ProfileBar profile={profile}/>
      <AFKZone profile={profile} onProfileChange={p => { setProfile(p); saveProfile(p); }} onBack={() => setGameMode(null)} />
    </>
  );

  // ── Quick Match waiting screen ───────────────────────────────────────────────
  if (quickMatchStatus !== 'idle' && quickMatchStatus !== 'found' && gameMode !== 'quick') {
    return (
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
    );
  }

  // ── Main Menu ───────────────────────────────────────────────────────────────
  if (!gameMode && connectionStatus !== 'connected') {
    return (
      <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column'}}>
        <ProfileBar profile={profile}/>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
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

            {networkErrorMsg && (
              <div style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',color:'#fca5a5',padding:'12px',borderRadius:8,marginBottom:20,fontSize:13,textAlign:'center',fontWeight:'bold'}}>
                ⚠️ {networkErrorMsg}
              </div>
            )}

            {connectionStatus === 'disconnected' && !showJoinPrompt && (
              <div style={{display:'flex',flexDirection:'column',gap:10,position:'relative'}}>

                {/* Quick Match — prominent */}
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
                  <button onClick={()=>setGameMode('learn')} style={{
                    padding:'12px',borderRadius:10,border:'1px solid rgba(245,158,11,0.3)',cursor:'pointer',
                    background:'rgba(245,158,11,0.08)',color:'#fbbf24',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:6
                  }}>
                    📚 Academy
                  </button>
                  <button onClick={()=>setGameMode('shop')} style={{
                    padding:'12px',borderRadius:10,border:'1px solid rgba(168,85,247,0.3)',cursor:'pointer',
                    background:'rgba(168,85,247,0.08)',color:'#c084fc',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:6
                  }}>
                    🛒 Shop
                  </button>
                  <button onClick={()=>setGameMode('afk')} style={{
                    padding:'12px',borderRadius:10,border:'1px solid rgba(99,102,241,0.3)',cursor:'pointer',
                    background:'rgba(99,102,241,0.08)',color:'#818cf8',fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:6
                  }}>
                    💤 AFK Zone
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
    );
  }

  // ── In-Game ─────────────────────────────────────────────────────────────────
  const oppColor = playerColor === 'w' ? 'b' : 'w';

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',flexDirection:'column',padding:'0 0 20px'}}>
      <ProfileBar profile={profile}/>

      {/* Level Up Modal */}
      {levelUpData && (
        <LevelUpModal
          newLevel={levelUpData.newLevel}
          coinsEarned={levelUpData.coinsEarned}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* XP earned toast */}
      {xpNotif && (
        <div style={{
          position:'fixed',top:70,right:20,zIndex:200,
          background:'rgba(15,23,42,0.95)',border:'1px solid rgba(245,158,11,0.4)',
          borderRadius:12,padding:'12px 20px',boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          animation:'slideIn 0.4s ease'
        }}>
          <div style={{color:'#fbbf24',fontWeight:'bold',fontSize:16}}>⬆ +{xpNotif.xp} XP</div>
          <div style={{color:'#f59e0b',fontSize:14}}>🪙 +{xpNotif.coins} coins</div>
        </div>
      )}

      {/* Winner Overlay */}
      {gameState.winner && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#1e293b',border:'2px solid rgba(245,158,11,0.5)',borderRadius:20,padding:40,textAlign:'center',boxShadow:'0 0 60px rgba(245,158,11,0.2)'}}>
            <div style={{fontSize:60,marginBottom:8}}>
              {gameState.winner === playerColor ? '🏆' : '💀'}
            </div>
            <h2 style={{fontSize:40,fontWeight:900,color:'#fbbf24',margin:'0 0 8px'}}>
              {gameState.winner === 'w' ? 'White' : 'Black'} Wins!
            </h2>
            {gameState.winner === playerColor && (
              <div style={{color:'#34d399',fontSize:16,marginBottom:16,fontWeight:'bold'}}>+XP earned! 🎉</div>
            )}
            <button onClick={()=>{resetNetworking();setGameState(createInitialState());}}
              style={{padding:'12px 32px',background:'linear-gradient(135deg,#f59e0b,#f97316)',border:'none',color:'#1a1a1a',borderRadius:10,fontWeight:'bold',fontSize:16,cursor:'pointer'}}>
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
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

      {/* Game */}
      <div style={{display:'flex',flexWrap:'wrap',gap:24,alignItems:'flex-start',justifyContent:'center',padding:'0 16px',maxWidth:1400,margin:'0 auto',width:'100%'}}>
        <div style={{flex:'1 1 0',maxWidth:'75vh',minWidth:280}}>
          <Board
            state={gameState}
            onMove={handleMove}
            playerColor={gameMode==='pvp'?null:playerColor}
            captureEffect={profile.activeEffect || 'none'}
          />
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16,width:300,flexShrink:0}}>
          <Dashboard color={oppColor} state={gameState} onDrawCard={gameMode==='pvp'?handleDrawCardOpponent:null} isPlayer={gameMode==='pvp'}/>
          <Dashboard color={playerColor} state={gameState} onDrawCard={handleDrawCard} isPlayer={true}/>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>
    </div>
  );
}
