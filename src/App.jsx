import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import Board from './components/Board';
import Dashboard from './components/Dashboard';
import { createInitialState, executeMove, drawCard } from './chess-engine/engine';
import { getAIMove } from './chess-engine/ai';

export default function App() {
  const [gameState, setGameState] = useState(createInitialState());
  const [gameMode, setGameMode] = useState(null); // 'pvp' | 'ai-1' | 'ai-2' | 'ai-3' | 'online'
  const [playerColor, setPlayerColor] = useState('w');

  // Online Multiplayer State
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'hosting', 'connecting', 'connected'
  const [peerId, setPeerId] = useState('');
  const [targetJoinId, setTargetJoinId] = useState('');
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const peerRef = useRef(null);
  const connRef = useRef(null);

  // Handle AI moves
  useEffect(() => {
    if (gameMode && gameMode.startsWith('ai')) {
      if (gameState.turn !== playerColor && !gameState.winner) {
        const level = parseInt(gameMode.split('-')[1]);
        
        const timer = setTimeout(() => {
          let stateToUse = gameState;
          if (stateToUse.points[stateToUse.turn] >= 5) {
             const { nextState } = drawCard(stateToUse, stateToUse.turn);
             stateToUse = nextState;
             setGameState(stateToUse);
          }

          const move = getAIMove(stateToUse, level);
          if (move) {
            setGameState(executeMove(stateToUse, move));
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, gameMode, playerColor]);

  // Cleanup peer on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  // --- MULTIPLAYER LOGIC ---
  const startHosting = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newPeer = new Peer(`CHESS-${randomId}`);
    
    newPeer.on('open', (id) => {
      setPeerId(id.replace('CHESS-', ''));
      setConnectionStatus('hosting');
    });

    newPeer.on('connection', (conn) => {
      connRef.current = conn;
      setConnectionStatus('connected');
      setGameMode('online');
      setPlayerColor('w');
      
      conn.on('data', (data) => {
        setGameState(data);
      });
      
      conn.on('open', () => {
         conn.send(createInitialState());
      });
    });

    newPeer.on('error', (err) => {
      alert("Connection error: " + err);
      setConnectionStatus('disconnected');
    });

    peerRef.current = newPeer;
  };

  const joinGame = () => {
    if (!targetJoinId) return;
    const newPeer = new Peer();
    
    newPeer.on('open', () => {
      const conn = newPeer.connect(`CHESS-${targetJoinId.toUpperCase()}`);
      connRef.current = conn;
      setConnectionStatus('connecting');

      conn.on('open', () => {
        setConnectionStatus('connected');
        setGameMode('online');
        setPlayerColor('b');
      });

      conn.on('data', (data) => {
        setGameState(data);
      });

      conn.on('error', (err) => {
         alert("Connection Error.");
         setConnectionStatus('disconnected');
      });
    });

    newPeer.on('error', (err) => {
      alert("Connection error: " + err);
      setConnectionStatus('disconnected');
    });
    
    peerRef.current = newPeer;
  };

  const resetNetworking = () => {
    if (peerRef.current) peerRef.current.destroy();
    setConnectionStatus('disconnected');
    setGameMode(null);
    setShowJoinPrompt(false);
  };
  // -------------------------

  const handleMove = (move) => {
    const next = executeMove(gameState, move);
    setGameState(next);
    if (gameMode === 'online' && connRef.current) {
      connRef.current.send(next);
    }
  };

  const handleDrawCard = () => {
    const { nextState, drawnCard } = drawCard(gameState, playerColor);
    if (drawnCard) {
      setGameState(nextState);
      if (gameMode === 'online' && connRef.current) {
        connRef.current.send(nextState);
      }
    }
  };

  const handleDrawCardOpponent = () => {
    const { nextState } = drawCard(gameState, playerColor === 'w' ? 'b' : 'w');
    setGameState(nextState);
    if (gameMode === 'online' && connRef.current) {
      connRef.current.send(nextState);
    }
  };

  if (!gameMode && connectionStatus !== 'connected') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 text-center relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

          <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 relative z-10">
            Chess: Ascended
          </h1>
          
          {connectionStatus === 'disconnected' ? (
            <>
              {!showJoinPrompt ? (
                <div className="flex flex-col gap-4 relative z-10">
                  <p className="text-slate-400 mb-4">Draw cards, bend the rules, dominate the board.</p>
                  
                  <button onClick={() => { setGameMode('pvp'); setGameState(createInitialState()); }} className="bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold shadow-lg transition-colors border border-slate-600">
                    Play vs Friend (Local Same Screen)
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={startHosting} className="bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-colors">
                      Host Online
                    </button>
                    <button onClick={() => setShowJoinPrompt(true)} className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-colors">
                      Join Online
                    </button>
                  </div>

                  <div className="h-px bg-slate-700 my-2"></div>
                  <p className="text-sm text-slate-500 uppercase tracking-widest">Play vs AI</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { setGameMode('ai-1'); setGameState(createInitialState()); }} className="bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold">Lvl 1</button>
                    <button onClick={() => { setGameMode('ai-2'); setGameState(createInitialState()); }} className="bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold">Lvl 2</button>
                    <button onClick={() => { setGameMode('ai-3'); setGameState(createInitialState()); }} className="bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold">Lvl 3</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 relative z-10">
                  <h2 className="text-2xl font-bold text-slate-100">Join Game</h2>
                  <p className="text-sm text-slate-400">Enter your friend's 6-character room code:</p>
                  <input 
                    type="text" 
                    value={targetJoinId} 
                    onChange={e => setTargetJoinId(e.target.value)} 
                    placeholder="e.g. A1B2C3"
                    className="bg-slate-900 border border-slate-600 p-3 rounded text-center text-xl font-mono uppercase tracking-widest text-white outline-none focus:border-emerald-500"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowJoinPrompt(false)} className="flex-1 bg-slate-700 py-3 rounded font-bold">Cancel</button>
                    <button onClick={joinGame} className="flex-1 bg-emerald-600 py-3 rounded font-bold">Connect</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-4 relative z-10 min-h-[200px] justify-center">
               {connectionStatus === 'hosting' && (
                 <>
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-slate-300">Waiting for opponent...</p>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">Your Room Code</p>
                    <p className="text-4xl font-mono tracking-widest text-indigo-400 font-bold">{peerId}</p>
                  </div>
                  <button onClick={resetNetworking} className="text-slate-500 underline mt-4 hover:text-slate-300">Cancel Hosting</button>
                 </>
               )}
               {connectionStatus === 'connecting' && (
                 <>
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-emerald-400 font-bold">Connecting to {targetJoinId.toUpperCase()}...</p>
                  <button onClick={resetNetworking} className="text-slate-500 underline mt-4 hover:text-slate-300">Cancel</button>
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const oppColor = playerColor === 'w' ? 'b' : 'w';

  // For local PVP, we treat 'w' as active player facing us, and we let them rotate. Actually, to keep UI simple, let's keep one perspective unless configured otherwise.
  // In Online or AI mode, the player always plays as `playerColor`.

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      {gameState.winner && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-slate-800 p-8 rounded-2xl text-center shadow-2xl border border-amber-500">
            <h2 className="text-5xl font-black text-amber-400 mb-4">
              {gameState.winner === 'w' ? 'White' : 'Black'} Wins!
            </h2>
            <button 
              onClick={() => { resetNetworking(); setGameState(createInitialState()); }}
              className="bg-amber-500 text-slate-900 px-6 py-3 rounded-lg font-bold"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      <div className="flex w-full justify-between items-center max-w-screen-2xl mb-4 px-2">
        <button className="text-slate-400 hover:text-white flex items-center gap-2" onClick={resetNetworking}>
          <span className="text-xl">←</span> Quit Game
        </button>

        {gameMode === 'online' && (
          <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 shadow-inner">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Online Connected</span>
          </div>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center w-full max-w-screen-2xl px-2">
        {/* Board Container */}
        <div className="flex-1 w-full max-w-[95vw] xl:max-w-[75vh] flex justify-center shrink-0">
           <Board 
             state={gameState} 
             onMove={handleMove} 
             playerColor={gameMode === 'pvp' ? null : playerColor}
           />
        </div>

        {/* Sidebar for Dashboards */}
        <div className="flex flex-col gap-6 w-full max-w-sm shrink-0">
          {/* Opponent Dashboard */}
          <Dashboard 
            color={oppColor} 
            state={gameState} 
            onDrawCard={gameMode === 'pvp' ? handleDrawCardOpponent : null} // Can't draw opponents cards online
            isPlayer={gameMode === 'pvp'}
          />

          {/* Player Dashboard */}
          <Dashboard 
            color={playerColor} 
            state={gameState} 
            onDrawCard={handleDrawCard}
            isPlayer={true}
          />
        </div>
      </div>
    </div>
  );
}
