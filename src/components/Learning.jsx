import React, { useState } from 'react';

const SYM = { K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };

function MiniBoard({ rows, highlights = [] }) {
  const ranks = ['8','7','6','5','4','3','2','1'];
  const files = ['a','b','c','d','e','f','g','h'];
  return (
    <div className="select-none">
      <div className="flex">
        <div className="flex flex-col mr-1">
          {ranks.map(r => <div key={r} style={{height:38}} className="flex items-center justify-center text-xs text-amber-700/60 font-bold w-4">{r}</div>)}
        </div>
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(8,38px)',width:304,border:'2px solid #92400e',borderRadius:6,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
            {rows.map((row, ri) => row.split('').map((p, ci) => {
              const light = (ri+ci)%2===0;
              const hl = highlights.some(([r,c])=>r===ri&&c===ci);
              const isW = p!=='.'&&/[KQRBNP]/.test(p);
              return (
                <div key={`${ri}-${ci}`} style={{width:38,height:38,background:hl?'#f6f669':(light?'#f0d9b5':'#b58863'),display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  {hl && <div style={{position:'absolute',inset:0,background:'rgba(246,246,105,0.45)',pointerEvents:'none'}}/>}
                  {p!=='.'&&<span style={{fontSize:24,lineHeight:1,position:'relative',zIndex:1,color:isW?'#fff':'#111',textShadow:isW?'0 0 3px #000,0 0 3px #000':'0 0 3px #fff,0 0 3px #fff'}}>{SYM[p]}</span>}
                </div>
              );
            }))}
          </div>
          <div style={{display:'flex',width:304}}>
            {files.map(f=><div key={f} style={{width:38,textAlign:'center',fontSize:11,color:'#92400e',fontWeight:'bold',marginTop:4}}>{f}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

const LESSONS = [
  {
    id:'scholars-mate', category:'openings', difficulty:'Beginner', icon:'⚡',
    title:"The Scholar's Mate",
    description:'The fastest trap — a 4-move checkmate. Learn to use it AND stop it!',
    steps:[
      { title:'1. Open with e4', text:'White plays 1.e4, grabbing the center. Black mirrors with 1...e5. Both fight for central control.', board:['rnbqkbnr','pppp.ppp','........','....p...','....P...','........','PPPP.PPP','RNBQKBNR'], highlights:[[4,4],[3,4]] },
      { title:'2. White plays Qh5!', text:'White brings the queen to h5, immediately targeting the weak f7 pawn. This looks scary — but Black can defend!', board:['rnbqkbnr','pppp.ppp','........','....p..Q','....P...','........','PPPP.PPP','RNB.KBNR'], highlights:[[3,7],[1,5]] },
      { title:'3. White plays Bc4', text:'The bishop joins the attack. Now BOTH the queen and bishop aim at f7. Black must act!', board:['r.bqkbnr','pppp.ppp','..n.....','....p..Q','..B.P...','........','PPPP.PPP','RNB.K.NR'], highlights:[[4,2],[1,5]] },
      { title:'4. Checkmate! Qxf7#', text:"If Black plays carelessly (like 3...Nf6?? ignoring the threat), White plays Qxf7# — CHECKMATE! The king is trapped.", board:['r.bqkb.r','pppp.Qpp','..n.n...','....p...','..B.P...','........','PPPP.PPP','RNB.K.NR'], highlights:[[1,5],[0,4]] },
      { title:'5. The Defense: ...g6!', text:"After 2.Qh5, Black plays 2...Nc6 then 3...g6! The g-pawn attacks the queen AND covers f7. Queen must retreat. Scholar's Mate is stopped!", board:['r.bqkbnr','pppp.pp.','..n...p.','....p..Q','..B.P...','........','PPPP.PPP','RNB.K.NR'], highlights:[[2,6],[3,7]] },
    ],
    keyPoints:["Never bring your queen out too early without a plan","f7 (and f2) are the weakest squares at the start","Defend with ...Nc6 then ...g6 against early Qh5","Develop pieces naturally — centre, knights, bishops, castle"],
  },
  {
    id:'italian-game', category:'openings', difficulty:'Beginner', icon:'🏛️',
    title:'The Italian Game',
    description:'One of the oldest openings. Build a strong center and develop your pieces fast.',
    steps:[
      { title:'1. e4 e5 — Claim the Center', text:'Both players claim the center with pawns. This is the most classical start in chess.', board:['rnbqkbnr','pppp.ppp','........','....p...','....P...','........','PPPP.PPP','RNBQKBNR'], highlights:[[4,4],[3,4]] },
      { title:'2. Nf3 Nc6 — Develop Knights', text:'Golden rule: knights before bishops! White attacks e5, Black defends. Both develop a piece with tempo.', board:['r.bqkbnr','pppp.ppp','..n.....','....p...','....P...','....N...','PPPP.PPP','RNBQKB.R'], highlights:[[5,4],[2,2]] },
      { title:'3. Bc4 — The Italian Bishop', text:"White's bishop aims at c4, eyeing the weak f7 pawn and controlling the centre. This is the Italian Game!", board:['r.bqkbnr','pppp.ppp','..n.....','....p...','..B.P...','....N...','PPPP.PPP','RNBQK..R'], highlights:[[4,2]] },
      { title:'3...Bc5 — Symmetric Development', text:'Black mirrors with Bc5. Both bishops are developed and active. The game is balanced — whoever plays better wins!', board:['r.bqk.nr','pppp.ppp','..n.....','..b.p...','..B.P...','....N...','PPPP.PPP','RNBQK..R'], highlights:[[3,2]] },
      { title:'4. Castle! — King Safety', text:'After development, CASTLE immediately! Move your king to safety and connect the rooks. This is a priority in every opening.', board:['r.bqk..r','pppp.ppp','..n.....','..b.p...','..B.P...','....N...','PPPP.PPP','RNBQ.RK.'], highlights:[[7,6],[7,5]] },
    ],
    keyPoints:['Develop All pieces before attacking','Knights before bishops','Control the center (e4, d4, e5, d5)','Castle early — king safety is paramount'],
  },
  {
    id:'sicilian', category:'openings', difficulty:'Intermediate', icon:'🛡️',
    title:'The Sicilian Defense',
    description:"The most popular reply to 1.e4. Black fights back asymmetrically for rich tactical play.",
    steps:[
      { title:'1. e4 c5 — The Sicilian!', text:"Instead of mirroring e5, Black plays c5! This challenges the d4 square without giving White a free central pawn.", board:['rnbqkbnr','pp.ppppp','........','..p.....','....P...','........','PPPP.PPP','RNBQKBNR'], highlights:[[4,4],[3,2]] },
      { title:'2. Nf3 d6 — Flexible Setup', text:'White develops the knight. Black plays d6, a flexible move that opens lines for the bishop and supports e5 later.', board:['rnbqkbnr','pp..pppp','...p....','..p.....','....P...','....N...','PPPP.PPP','RNBQKB.R'], highlights:[[5,4],[2,3]] },
      { title:'3. d4 cxd4 — The Open Sicilian', text:"White grabs the center with d4. Black captures! White recaptures with the knight. White has space, Black has activity.", board:['rnbqkbnr','pp..pppp','...p....','........','...NP...','........','PPP..PPP','RNBQKB.R'], highlights:[[4,3],[4,4]] },
      { title:'4. The Battle Plan', text:"White attacks on the kingside, Black counterattacks on the queenside (a5, b5 pawn push). It's a race — who gets there first?", board:['r.bqk..r','pp..ppbp','..np..pn','........','...NP...','..N.B...','PPP..PPP','R..QKB.R'], highlights:[[0,4],[7,4]] },
    ],
    keyPoints:['Asymmetric positions — both sides have different plans','Black fights for d4, not the e5 square','Typical Black plan: queenside expansion (a5-b5)','Most popular opening at grandmaster level!'],
  },
  {
    id:'opening-principles', category:'openings', difficulty:'Beginner', icon:'📖',
    title:'Opening Principles',
    description:'The golden rules every chess player must know before learning specific openings.',
    steps:[
      { title:'Rule 1 — Control the Center', text:'The 4 central squares (e4,d4,e5,d5) are the most powerful. Control them with pawns and pieces and you control the game!', board:['rnbqkbnr','pppppppp','........','........','....P...','........','PPPP.PPP','RNBQKBNR'], highlights:[[4,3],[4,4],[3,3],[3,4]] },
      { title:'Rule 2 — Develop All Pieces', text:"Every move should bring a new piece into the game. Don't move the same piece twice! Aim to have all your pieces developed by move 10.", board:['r.bqk.r.','ppp..ppp','..npbn..','....p...','..B.P...','..NP.N..','PPP..PPP','R.BQK..R'], highlights:[[5,2],[5,5],[4,2],[2,2],[2,5]] },
      { title:'Rule 3 — Castle Early', text:'After developing your pieces, castle! Move your king behind the pawns. A king in the center is a target — castle on move 4-7 ideally.', board:['r.bq.rk.','ppp..ppp','..npbn..','....p...','..B.P...','..NP.N..','PPP..PPP','R.BQ.RK.'], highlights:[[0,6],[7,6]] },
      { title:'Rule 4 — Connect Your Rooks', text:'Once castled and developed, your rooks should be on the same rank with no pieces blocking them. Then they support each other!', board:['r.b..rk.','ppp..ppp','..npbn..','....p...','..B.P...','..NP.N..','PPP..PPP','R..Q.RK.'], highlights:[[7,0],[7,3]] },
    ],
    keyPoints:["3 Core Rules: Control center, Develop pieces, Castle","Don't move the same piece twice without reason","Don't bring the queen out too early (it gets attacked!)",'Rooks need open files — push pawns to open lines'],
  },
  {
    id:'opposition', category:'endings', difficulty:'Beginner', icon:'👑',
    title:'King & Pawn Endings',
    description:'The most fundamental endgame. Master the opposition and key squares.',
    steps:[
      { title:'Activate Your King!', text:'In the endgame, the king is a POWERFUL piece. Push it forward aggressively. A king that sits back loses!', board:['........','........','........','...k....','....P...','....K...','........','........'], highlights:[[5,4],[3,3],[4,4]] },
      { title:'The Opposition', text:"Kings face each other with ONE square between them. The side WITHOUT the move has the opposition — they control more squares.", board:['........','........','....k...','........','....K...','........','........','........'], highlights:[[2,4],[4,4]] },
      { title:'Take the Opposition to Win', text:'White steps to e5, taking the opposition. The black king must step aside. White marches to a key square to support the pawn.', board:['........','........','....k...','....K...','....P...','........','........','........'], highlights:[[3,4],[2,4],[4,4]] },
      { title:'Key Squares — Win Guaranteed', text:"A pawn on e5 has key squares: d7, e7, f7. If the white king reaches ANY of these, the pawn WILL promote — no matter what!", board:['........','.XXX....','........','....K...','....P...','........','........','........'], highlights:[[1,1],[1,2],[1,3],[3,4]] },
      { title:'WARNING — Rook Pawn Stalemate!', text:"An a-pawn or h-pawn is SPECIAL. Here, Black's king at a8 cannot move — STALEMATE! It's a draw even though White is winning!", board:['k.......','P.K.....','........','........','........','........','........','........'], highlights:[[0,0],[1,0],[1,2]] },
    ],
    keyPoints:['King must be active in the endgame','Opposition: face the king with a gap — it controls the position','Reach the key squares to guarantee promotion','Beware of stalemate with a/h (rook) pawns!'],
  },
  {
    id:'rule-of-square', category:'endings', difficulty:'Beginner', icon:'📐',
    title:'Rule of the Square',
    description:"Can the king catch the passed pawn? Solve it instantly without calculating every move!",
    steps:[
      { title:'The Problem', text:"White has a passed pawn racing to promote. Can the Black king catch it? Calculating every move takes too long. There's a shortcut!", board:['........','........','........','........','....P...','........','........','......k.'], highlights:[[4,4],[7,6]] },
      { title:'Draw the Square', text:"Count the squares the pawn needs to promote (e4→e8 = 4 squares). Draw a 4×4 square from the pawn diagonally. If Black's king can ENTER this square, it catches the pawn!", board:['........','....X...','....X...','....X...','....XXXX','........','........','......k.'], highlights:[[4,4],[4,5],[4,6],[4,7],[3,4],[2,4],[1,4]] },
      { title:'Outside the Square = White Wins', text:"The black king is OUTSIDE the square. Even with Black to move, the king cannot enter in time. The pawn promotes to a queen!", board:['........','........','........','........','....P...','........','........','......k.'], highlights:[[7,6],[4,4]] },
      { title:'Inside the Square = Draw', text:"If the black king is already inside or can step IN on its move, it catches the pawn in time — DRAW!", board:['........','........','........','........','....P...','....k...','........','........'], highlights:[[5,4],[4,4]] },
    ],
    keyPoints:['Count how many squares the pawn needs to reach the end','Build a diagonal square from that number','King inside or can enter = draw','King outside = pawn promotes!'],
  },
  {
    id:'rook-endings', category:'endings', difficulty:'Intermediate', icon:'♜',
    title:'Lucena & Philidor',
    description:'The two most important rook ending positions in chess. Every player must know these!',
    steps:[
      { title:'The Philidor Position — Draw!', text:"Black draws by placing the rook on the 6th rank, cutting off the white king. This is the PHILIDOR DEFENSE — key drawing technique.", board:['........','........','...r....','........','...PK...','........','...k....','........'], highlights:[[2,3],[4,3],[4,4]] },
      { title:'Philidor — Switch to Checks!', text:"Once White pushes the pawn forward, Black switches to the BACK RANK and gives endless checks. The king can never hide from checks!", board:['........','...P....','........','........','...K....','........','...k....','...r....'], highlights:[[7,3],[6,3],[1,3]] },
      { title:'The Lucena Position — Win!', text:"White's king has escaped to g7. White needs to 'build a bridge' to shield from checks. First: bring the rook to e1.", board:['........','...PK...','........','........','........','........','...k....','...R....'], highlights:[[1,3],[1,4],[7,3],[7,4]] },
      { title:'Build the Bridge — Re4!', text:"White plays Re4! When Black checks from the side, the white king steps BEHIND the rook. The rook blocks the checks. Pawn promotes!", board:['........','...P....','...K....','........','...R....','........','...k....','........'], highlights:[[4,3],[2,3],[1,3]] },
    ],
    keyPoints:['Philidor: Rook on the 6th rank = draw','Switch to back-rank checks when the pawn advances','Lucena: Build a bridge with the rook to escort the pawn','These positions come up in almost every rook endgame!'],
  },
];

export default function Learning({ onBack }) {
  const [category, setCategory] = useState('openings');
  const [activeId, setActiveId] = useState('scholars-mate');
  const [stepIdx, setStepIdx] = useState(0);

  const lessons = LESSONS.filter(l => l.category === category);
  const lesson = LESSONS.find(l => l.id === activeId) || lessons[0];
  const step = lesson.steps[stepIdx];
  const totalSteps = lesson.steps.length;

  function selectLesson(id) {
    setActiveId(id);
    setStepIdx(0);
  }

  function selectCategory(cat) {
    setCategory(cat);
    const first = LESSONS.find(l => l.category === cat);
    if (first) { setActiveId(first.id); setStepIdx(0); }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#e2e8f0',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      {/* bg glows */}
      <div style={{position:'absolute',top:-100,left:-100,width:500,height:500,background:'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-100,right:-100,width:500,height:500,background:'radial-gradient(circle,rgba(245,158,11,0.10) 0%,transparent 70%)',pointerEvents:'none'}}/>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)',position:'relative',zIndex:10}}>
        <button onClick={onBack} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'#94a3b8',padding:'8px 16px',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:8,fontWeight:'bold',transition:'all 0.2s'}}
          onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>
          ← Back
        </button>
        <h1 style={{fontSize:28,fontWeight:900,background:'linear-gradient(135deg,#f59e0b,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:0}}>📚 Chess Academy</h1>
        {/* Category Toggle */}
        <div style={{marginLeft:'auto',display:'flex',gap:4,background:'rgba(255,255,255,0.05)',borderRadius:10,padding:4}}>
          {['openings','endings'].map(cat=>(
            <button key={cat} onClick={()=>selectCategory(cat)}
              style={{padding:'8px 20px',borderRadius:7,border:'none',cursor:'pointer',fontWeight:'bold',fontSize:14,transition:'all 0.2s',
                background: category===cat ? (cat==='openings'?'linear-gradient(135deg,#6366f1,#8b5cf6)':'linear-gradient(135deg,#10b981,#059669)') : 'transparent',
                color: category===cat ? '#fff' : '#94a3b8'}}>
              {cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div style={{display:'flex',flex:1,overflow:'hidden',position:'relative',zIndex:10}}>
        {/* Sidebar */}
        <div style={{width:220,borderRight:'1px solid rgba(255,255,255,0.07)',overflowY:'auto',padding:12,flexShrink:0}}>
          <p style={{fontSize:11,color:'#64748b',fontWeight:'bold',textTransform:'uppercase',letterSpacing:2,marginBottom:8,paddingLeft:4}}>Chapters</p>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {lessons.map(l=>(
              <button key={l.id} onClick={()=>selectLesson(l.id)}
                style={{textAlign:'left',padding:'10px 12px',borderRadius:8,border:`1px solid ${activeId===l.id?'rgba(245,158,11,0.4)':'transparent'}`,cursor:'pointer',transition:'all 0.2s',
                  background: activeId===l.id ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  color: activeId===l.id ? '#fbbf24' : '#94a3b8'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{fontSize:16}}>{l.icon}</span>
                  <span style={{fontWeight:'bold',fontSize:13}}>{l.title}</span>
                </div>
                <span style={{fontSize:11,opacity:0.7,marginLeft:24}}>{l.difficulty}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Content */}
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
          <div style={{maxWidth:900,margin:'0 auto'}}>
            {/* Lesson Header */}
            <div style={{marginBottom:24}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                <span style={{fontSize:32}}>{lesson.icon}</span>
                <div>
                  <h2 style={{fontSize:26,fontWeight:900,margin:0}}>{lesson.title}</h2>
                  <p style={{color:'#94a3b8',margin:'4px 0 0',fontSize:14}}>{lesson.description}</p>
                </div>
                <span style={{marginLeft:'auto',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:'bold',
                  background: lesson.difficulty==='Beginner'?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)',
                  color: lesson.difficulty==='Beginner'?'#34d399':'#fbbf24',
                  border: `1px solid ${lesson.difficulty==='Beginner'?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'}`}}>
                  {lesson.difficulty}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{display:'flex',gap:4,marginTop:12}}>
                {lesson.steps.map((_,i)=>(
                  <div key={i} style={{flex:1,height:3,borderRadius:2,cursor:'pointer',transition:'background 0.3s',
                    background:i<=stepIdx?'linear-gradient(90deg,#f59e0b,#f97316)':'rgba(255,255,255,0.1)'}}
                    onClick={()=>setStepIdx(i)}/>
                ))}
              </div>
              <p style={{textAlign:'right',fontSize:12,color:'#64748b',marginTop:4}}>Step {stepIdx+1} of {totalSteps}</p>
            </div>

            {/* Step Content */}
            <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:32,alignItems:'start'}}>
              {/* Board */}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                <MiniBoard rows={step.board} highlights={step.highlights}/>
              </div>

              {/* Explanation */}
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:20}}>
                  <h3 style={{margin:'0 0 12px',fontSize:18,fontWeight:'bold',color:'#f8fafc'}}>{step.title}</h3>
                  <p style={{margin:0,lineHeight:1.7,color:'#cbd5e1',fontSize:15}}>{step.text}</p>
                </div>

                {/* Navigation */}
                <div style={{display:'flex',gap:12}}>
                  <button onClick={()=>setStepIdx(i=>Math.max(0,i-1))} disabled={stepIdx===0}
                    style={{flex:1,padding:'12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.05)',color:stepIdx===0?'#374151':'#e2e8f0',cursor:stepIdx===0?'not-allowed':'pointer',fontWeight:'bold',fontSize:14,transition:'all 0.2s'}}>
                    ← Previous
                  </button>
                  {stepIdx < totalSteps - 1
                    ? <button onClick={()=>setStepIdx(i=>i+1)}
                        style={{flex:1,padding:'12px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'#1a1a1a',cursor:'pointer',fontWeight:'bold',fontSize:14,transition:'all 0.2s'}}>
                        Next Step →
                      </button>
                    : <button onClick={()=>{const next=lessons.findIndex(l=>l.id===activeId)+1; if(next<lessons.length){selectLesson(lessons[next].id);}}}
                        style={{flex:1,padding:'12px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',cursor:'pointer',fontWeight:'bold',fontSize:14}}>
                        Next Chapter →
                      </button>
                  }
                </div>

                {/* Key Points - show on last step */}
                {stepIdx === totalSteps - 1 && (
                  <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:12,padding:20}}>
                    <h4 style={{margin:'0 0 12px',color:'#fbbf24',fontWeight:'bold',display:'flex',alignItems:'center',gap:8}}>
                      ⭐ Key Takeaways
                    </h4>
                    <ul style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:8}}>
                      {lesson.keyPoints.map((kp,i)=>(
                        <li key={i} style={{display:'flex',gap:10,alignItems:'flex-start',color:'#cbd5e1',fontSize:14,lineHeight:1.6}}>
                          <span style={{color:'#f59e0b',marginTop:2,flexShrink:0}}>✓</span>{kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
