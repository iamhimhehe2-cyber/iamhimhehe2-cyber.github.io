import React, { useState, useEffect } from 'react';
import { awardXP } from '../store/profile';

export default function AFKZone({ profile, onProfileChange, onBack }) {
  const [minutesAfk, setMinutesAfk] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);

  // Initialize AdSense ad block on mount
  useEffect(() => {
    let script = document.getElementById('adsense-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'adsense-script';
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9992695561469755";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense error:", e);
    }
  }, []);

  // Timer logic for AFK rewards
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesAfk(prev => {
        const nextMin = prev + 1;
        // Formula: 1 xp base, multiplies by 1.5 every minute
        // e.g. min 1 => 1, min 2 => 1.5, min 3 => 2.25
        const currentTickXP = Math.floor(1 * Math.pow(1.5, prev));

        // Ensure at least 1 XP per minute
        const reward = Math.max(1, currentTickXP);

        setSessionXP(currSession => currSession + reward);

        // Apply XP immediately to profile
        const { profile: updated } = awardXP(profile, reward, 0); // 0 coins
        onProfileChange(updated);

        return nextMin;
      });
    }, 60 * 1000); // 60,000 ms = 1 minute

    return () => clearInterval(timer);
  }, [profile, onProfileChange]);

  return (
    <div style={{
      minHeight: '100vh', background: '#020617', color: '#e2e8f0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: 20
    }}>
      {/* Background ambient animation */}
      <div style={{
        position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 60%)',
        animation: 'pulse 4s ease-in-out infinite alternate', pointerEvents: 'none'
      }} />

      <div style={{ zIndex: 10, textAlign: 'center', maxWidth: 600, width: '100%' }}>
        <h1 style={{ fontSize: 52, fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 12, background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.3))' }}>
          AFK Zone
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 40, letterSpacing: 0.5, lineHeight: 1.6 }}>
          Channel passive energy while you rest. <br />
          Experience essence gathers x1.5 faster every passing minute.
        </p>

        {/* Ad Container */}
        <div style={{
          background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16,
          padding: '20px', marginBottom: 40, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {/* AdSense Unit */}
          <ins className="adsbygoogle"
            style={{ display: 'inline-block', width: '350px', height: '250px' }}
            data-ad-client="ca-pub-9992695561469755"
            data-ad-slot="1703123193"></ins>
        </div>

        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 40
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 30px' }}>
            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Time AFK</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#cbd5e1' }}>{minutesAfk} <span style={{ fontSize: 16, color: '#64748b' }}>min</span></div>
          </div>

          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 30px' }}>
            <div style={{ fontSize: 12, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Session XP</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#6366f1' }}>+{sessionXP}</div>
          </div>
        </div>

        <button onClick={onBack} style={{
          padding: '12px 32px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 16, transition: 'all 0.2s'
        }}>
          Leave AFK Zone
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
