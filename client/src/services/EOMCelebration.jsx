import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../app/authSlice';

// ── Draggable Mini Card ───────────────────────────────────────────────────
function MiniCard({ savePhase, dismiss, photo, employee }) {
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [useLeftTop, setUseLeftTop] = useState(false);
  const [leftTop, setLeftTop] = useState({ left: 0, top: 0 });

  const onMouseDown = (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragging.current = true;
    didDrag.current = false;
    const rect = cardRef.current.getBoundingClientRect();
    const lt = { left: rect.left, top: rect.top };
    setLeftTop(lt);
    setUseLeftTop(true);
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = lt;
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
      const newLeft = Math.max(0, Math.min(window.innerWidth - 220, startPos.current.left + dx));
      const newTop  = Math.max(0, Math.min(window.innerHeight - 100, startPos.current.top + dy));
      setLeftTop({ left: newLeft, top: newTop });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const posStyle = useLeftTop
    ? { left: leftTop.left, top: leftTop.top, bottom: 'auto', right: 'auto' }
    : { right: 20, bottom: 20 };

  return (
    <div ref={cardRef} style={{ position: 'fixed', zIndex: 9999, ...posStyle,
      animation: useLeftTop ? 'none' : 'eomMI .4s cubic-bezier(.16,1,.3,1)',
      cursor: dragging.current ? 'grabbing' : 'grab', userSelect: 'none',
    }} onMouseDown={onMouseDown}>
      <style>{`
        @keyframes eomMI  { from{opacity:0;transform:scale(.82) translateY(18px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes eomMSh { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
        @keyframes eomMGl { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0),0 0 18px rgba(212,160,23,.2);} 50%{box-shadow:0 0 0 6px rgba(212,160,23,0),0 0 32px rgba(212,160,23,.45);} }
        @keyframes eomMFl { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        @keyframes eomMRi { 0%,100%{opacity:.35;transform:scale(1);} 50%{opacity:.6;transform:scale(1.05);} }
        @keyframes eomMSt { 0%,100%{opacity:.25;transform:scale(.8);} 50%{opacity:1;transform:scale(1.2);} }
        @keyframes eomMPu { 0%,100%{box-shadow:0 16px 48px rgba(0,0,0,.6),0 0 0 1px rgba(212,160,23,.2);} 50%{box-shadow:0 16px 56px rgba(0,0,0,.6),0 0 24px rgba(212,160,23,.3),0 0 0 1px rgba(212,160,23,.4);} }
      `}</style>

      <div onClick={() => { if (didDrag.current) { didDrag.current = false; return; } savePhase('full'); }} style={{
        position: 'relative', overflow: 'hidden', cursor: 'inherit',
        background: 'linear-gradient(160deg,#0f0520 0%,#1e0d3e 40%,#2d1654 70%,#3a1f6e 100%)',
        borderRadius: '24px', width: '220px',
        padding: '0 0 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'eomMPu 2.5s ease-in-out infinite',
        boxShadow: '0 16px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(212,160,23,.2), inset 0 1px 0 rgba(255,255,255,.04)',
      }}>

        {/* Top gold shimmer bar */}
        <div style={{width:'100%',height:'2.5px',borderRadius:'24px 24px 0 0',
          background:'linear-gradient(90deg,transparent,#D4A017,#F5C842,#D4A017,transparent)',
          backgroundSize:'200% 100%',animation:'eomMSh 2.5s ease-in-out infinite'}}/>

        {/* Dismiss */}
        <button onClick={e=>{e.stopPropagation();dismiss();}}
          style={{position:'absolute',top:'10px',right:'10px',width:'22px',height:'22px',borderRadius:'50%',
            background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.14)',
            display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:2}}>
          <XMarkIcon style={{width:'11px',height:'11px',color:'rgba(255,255,255,.55)'}}/>
        </button>

        {/* Announcing label */}
        <p style={{fontSize:'7px',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',
          color:'rgba(212,160,23,.55)',margin:'14px 0 4px',textAlign:'center'}}>
          ✦ &nbsp;Announcing&nbsp; ✦
        </p>
        <p style={{
          margin:'0 0 10px',fontFamily:'Georgia,serif',fontStyle:'italic',fontWeight:900,
          fontSize:'13px',lineHeight:1.1,textAlign:'center',
          backgroundImage:'linear-gradient(135deg,#C8960C,#F5C842,#fff8dc,#F5C842,#C8960C)',
          backgroundSize:'200% 100%',animation:'eomMSh 3s ease-in-out infinite',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
        }}>Congratulations</p>

        {/* Medal area */}
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 0 10px',animation:'eomMFl 4s ease-in-out infinite'}}>
          {/* Rings */}
          <div style={{position:'absolute',width:'130px',height:'130px',borderRadius:'50%',
            border:'1px solid rgba(212,160,23,.12)',animation:'eomMRi 3s ease-in-out infinite'}}/>
          <div style={{position:'absolute',width:'114px',height:'114px',borderRadius:'50%',
            border:'1px solid rgba(212,160,23,.08)',animation:'eomMRi 3s ease-in-out infinite .5s'}}/>
          {/* Stars */}
          {[
            {top:'4px', left:'-10px', size:'10px', delay:'0s'},
            {top:'4px', right:'-10px', size:'10px', delay:'.4s'},
            {bottom:'8px',left:'-5px', size:'7px',  delay:'.8s'},
            {bottom:'8px',right:'-5px',size:'7px',  delay:'1.2s'},
          ].map((s,i)=>(
            <div key={i} style={{position:'absolute',...s,color:'#F5C842',fontSize:s.size,lineHeight:1,
              animation:'eomMSt 2s ease-in-out infinite',animationDelay:s.delay,
              pointerEvents:'none',zIndex:3}}>✦</div>
          ))}
          {/* Gold ring photo */}
          <div style={{position:'relative',zIndex:2,padding:'3px',borderRadius:'50%',
            background:'linear-gradient(135deg,#7a4800,#D4A017,#F5C842,#D4A017,#7a4800)',
            backgroundSize:'200% 200%',animation:'eomMSh 3s ease-in-out infinite, eomMGl 2.5s ease-in-out infinite'}}>
            <div style={{padding:'3px',borderRadius:'50%',background:'linear-gradient(135deg,#0f0520,#1e0d3e)'}}>
              <div style={{width:'80px',height:'80px',borderRadius:'50%',overflow:'hidden',background:'#2d1654'}}>
                <img src={photo} alt={employee?.name}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                  onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name||'?')}&background=D4A017&color=fff`;}} />
              </div>
            </div>
          </div>
        </div>

        {/* EOM label */}
        <p style={{fontSize:'6.5px',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',
          color:'rgba(212,160,23,.6)',margin:'0 0 5px',textAlign:'center'}}>Employee of the Month</p>

        {/* Name badge */}
        <div style={{padding:'1.5px',borderRadius:'40px',margin:'0 16px',
          background:'linear-gradient(135deg,#7a4800,#F5C842,#D4A017,#F5C842,#7a4800)',
          backgroundSize:'200% 100%',animation:'eomMSh 3s ease-in-out infinite',
          boxShadow:'0 0 16px rgba(212,160,23,.35)'}}>
          <div style={{background:'linear-gradient(180deg,#1a0830,#0f0520)',borderRadius:'38px',
            padding:'6px 16px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
            <span style={{color:'#D4A017',fontSize:'7px'}}>✦</span>
            <span style={{fontSize:'11px',fontWeight:900,letterSpacing:'1.5px',textTransform:'uppercase',
              color:'#F5C842',fontFamily:"'Arial Black',Arial,sans-serif",
              textShadow:'0 0 10px rgba(245,200,66,.55)',
              whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'140px'}}>
              {employee?.name || 'Employee'}
            </span>
            <span style={{color:'#D4A017',fontSize:'7px'}}>✦</span>
          </div>
        </div>

        {/* Role */}
        <p style={{fontSize:'10px',color:'rgba(255,255,255,.5)',fontWeight:600,
          margin:'6px 0 0',textAlign:'center'}}>{employee?.role}</p>
      </div>
    </div>
  );
}

export default function EOMCelebration({ announcement, onDismiss }) {
  const id    = announcement?._id || 'eom';
  const PKEY  = `eomPhase_${id}`;
  const SKEY  = `eomSess_${id}`;
  const token = useSelector(selectCurrentToken);
  const sess  = token ? token.slice(0, 20) : 'none';

  const initPhase = () => {
    if (sessionStorage.getItem(SKEY) !== sess) {
      sessionStorage.setItem(SKEY, sess);
      sessionStorage.removeItem(PKEY);
      return 'full';
    }
    return sessionStorage.getItem(PKEY) || 'full';
  };

  const [phase, setPhaseRaw] = useState(initPhase);
  const savePhase = (p) => { sessionStorage.setItem(PKEY, p); setPhaseRaw(p); };

  const employee = announcement?.relatedEmployee;
  const photo = employee?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name||'?')}&background=D4A017&color=fff&size=400`;

  const overlayRef = useRef(null);
  const cardRef    = useRef(null);
  const labelRef   = useRef(null);
  const timerRef   = useRef(null);
  const secRef     = useRef(10);

  useEffect(() => {
    if (phase !== 'full') return;
    secRef.current = 10;
    if (labelRef.current) labelRef.current.textContent = 'Minimises in 10s';
    timerRef.current = setInterval(() => {
      secRef.current -= 1;
      if (labelRef.current) labelRef.current.textContent = `Minimises in ${secRef.current}s`;
      if (secRef.current <= 0) {
        clearInterval(timerRef.current);
        const card = cardRef.current, overlay = overlayRef.current;
        if (card) { card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease'; card.style.transform = 'scale(0.45) translate(60px,60px)'; card.style.opacity = '0'; }
        if (overlay) { overlay.style.transition = 'opacity 0.4s ease'; overlay.style.opacity = '0'; }
        setTimeout(() => savePhase('mini'), 420);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => { clearInterval(timerRef.current); savePhase('gone'); onDismiss(); };

  if (phase === 'gone') return null;
  if (phase === 'mini') return <MiniCard savePhase={savePhase} dismiss={dismiss} photo={photo} employee={employee} />;

  // ── Full card ─────────────────────────────────────────────────────
  return (
    <div ref={overlayRef} style={{
      position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(20px) brightness(.45)',
      WebkitBackdropFilter:'blur(20px) brightness(.45)',
      padding:'16px', willChange:'opacity',
    }}>
      <style>{`
        @keyframes eomIn   { from{opacity:0;transform:scale(.88) translateY(24px);} to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes eomSh   { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
        @keyframes eomGlow { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0),0 0 30px rgba(212,160,23,.25);} 50%{box-shadow:0 0 0 10px rgba(212,160,23,0),0 0 60px rgba(212,160,23,.55);} }
        @keyframes eomFloat{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes eomFd   { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        @keyframes eomBar  { from{width:100%;} to{width:0%;} }
        @keyframes eomStar { 0%,100%{opacity:.3;transform:scale(.8);} 50%{opacity:1;transform:scale(1.2);} }
        @keyframes eomRing { 0%,100%{opacity:.4;transform:scale(1);} 50%{opacity:.7;transform:scale(1.04);} }
        @keyframes eomBadge{ from{opacity:0;transform:translateY(16px) scale(.9);} to{opacity:1;transform:translateY(0) scale(1);} }
      `}</style>

      <div ref={cardRef} style={{
        position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg,#0f0520 0%,#1e0d3e 40%,#2d1654 70%,#3a1f6e 100%)',
        borderRadius:'32px',
        boxShadow:'0 40px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(212,160,23,.2), inset 0 1px 0 rgba(255,255,255,.05)',
        display:'flex', flexDirection:'column', alignItems:'center',
        maxWidth:'440px', width:'100%',
        animation:'eomIn .5s cubic-bezier(.16,1,.3,1)',
        willChange:'transform,opacity',
        padding:'0 0 32px',
      }}>

        {/* Top gold shimmer bar */}
        <div style={{width:'100%',height:'3px',background:'linear-gradient(90deg,transparent,#D4A017,#F5C842,#D4A017,transparent)',backgroundSize:'200% 100%',animation:'eomSh 2.5s ease-in-out infinite',borderRadius:'32px 32px 0 0'}}/>

        {/* Dismiss button */}
        <button onClick={dismiss} style={{
          position:'absolute', top:'16px', right:'16px',
          width:'34px', height:'34px', borderRadius:'50%',
          background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)',
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:2,
        }}>
          <XMarkIcon style={{width:'16px',height:'16px',color:'rgba(255,255,255,.6)'}}/>
        </button>

        {/* Header text */}
        <div style={{textAlign:'center', padding:'32px 32px 0', animation:'eomFd .5s ease-out'}}>
          <p style={{fontSize:'10px',fontWeight:700,letterSpacing:'5px',textTransform:'uppercase',color:'rgba(212,160,23,.6)',margin:'0 0 8px'}}>
            ✦ &nbsp; Announcing &nbsp; ✦
          </p>
          <h1 style={{
            margin:0, fontFamily:'Georgia,serif', fontStyle:'italic', fontWeight:900,
            fontSize:'clamp(2rem,5vw,2.6rem)', lineHeight:1.1,
            backgroundImage:'linear-gradient(135deg,#C8960C,#F5C842,#fff8dc,#F5C842,#C8960C)',
            backgroundSize:'200% 100%', animation:'eomSh 3s ease-in-out infinite',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Congratulations</h1>
        </div>

        {/* Medal area */}
        <div style={{
          position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
          margin:'28px 0 20px',
          animation:'eomFloat 4s ease-in-out infinite',
        }}>
          {/* Outer glow ring */}
          <div style={{
            position:'absolute', width:'240px', height:'240px', borderRadius:'50%',
            border:'1px solid rgba(212,160,23,.15)',
            animation:'eomRing 3s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute', width:'210px', height:'210px', borderRadius:'50%',
            border:'1px solid rgba(212,160,23,.1)',
            animation:'eomRing 3s ease-in-out infinite .5s',
          }}/>

          {/* Gold ring photo */}
          <div style={{
            position:'relative', zIndex:2,
            padding:'5px', borderRadius:'50%',
            background:'linear-gradient(135deg,#7a4800,#D4A017,#F5C842,#D4A017,#7a4800)',
            backgroundSize:'200% 200%', animation:'eomSh 3s ease-in-out infinite, eomGlow 2.5s ease-in-out infinite',
          }}>
            <div style={{
              padding:'4px', borderRadius:'50%',
              background:'linear-gradient(135deg,#0f0520,#1e0d3e)',
            }}>
              <div style={{width:'160px',height:'160px',borderRadius:'50%',overflow:'hidden',background:'#2d1654'}}>
                <img src={photo} alt={employee?.name}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                  onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name||'?')}&background=D4A017&color=fff&size=400`;}}/>
              </div>
            </div>
          </div>

          {/* Decorative stars */}
          {[
            {top:'10px',left:'-18px',size:'18px',delay:'0s'},
            {top:'10px',right:'-18px',size:'18px',delay:'.4s'},
            {bottom:'20px',left:'-10px',size:'13px',delay:'.8s'},
            {bottom:'20px',right:'-10px',size:'13px',delay:'1.2s'},
          ].map((s,i)=>(
            <div key={i} style={{
              position:'absolute', ...s, width:s.size, height:s.size,
              color:'#F5C842', fontSize:s.size, lineHeight:1,
              animation:`eomStar 2s ease-in-out infinite`, animationDelay:s.delay,
              pointerEvents:'none', zIndex:3,
            }}>✦</div>
          ))}
        </div>

        {/* Label */}
        <p style={{
          fontSize:'10px', fontWeight:700, letterSpacing:'4px', textTransform:'uppercase',
          color:'rgba(212,160,23,.65)', margin:'0 0 6px',
          animation:'eomFd .6s .1s ease-out both',
        }}>Employee of the Month</p>

        {/* Name badge */}
        <div style={{
          animation:'eomBadge .6s .2s cubic-bezier(.34,1.56,.64,1) both',
          padding:'2px', borderRadius:'50px',
          background:'linear-gradient(135deg,#7a4800,#F5C842,#D4A017,#F5C842,#7a4800)',
          backgroundSize:'200% 100%', animation:'eomSh 3s ease-in-out infinite',
          boxShadow:'0 0 28px rgba(212,160,23,.4)',
          margin:'0 24px',
        }}>
          <div style={{
            background:'linear-gradient(180deg,#1a0830,#0f0520)',
            borderRadius:'48px', padding:'12px 36px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'12px',
          }}>
            <span style={{color:'#D4A017',fontSize:'12px'}}>✦</span>
            <span style={{
              fontSize:'16px', fontWeight:900, letterSpacing:'3px',
              textTransform:'uppercase', color:'#F5C842',
              fontFamily:"'Arial Black',Arial,sans-serif",
              textShadow:'0 0 16px rgba(245,200,66,.6)',
            }}>{employee?.name || 'Employee'}</span>
            <span style={{color:'#D4A017',fontSize:'12px'}}>✦</span>
          </div>
        </div>

        {/* Role & company */}
        <div style={{textAlign:'center', marginTop:'14px', animation:'eomFd .7s .3s ease-out both'}}>
          <p style={{color:'rgba(255,255,255,.6)',fontWeight:600,fontSize:'13px',margin:0}}>{employee?.role}</p>
          {employee?.company && <p style={{color:'rgba(255,255,255,.3)',fontSize:'12px',margin:'3px 0 0'}}>{employee.company}</p>}
        </div>

        {/* Progress bar */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:'rgba(255,255,255,.06)',borderRadius:'0 0 32px 32px'}}>
          <div style={{height:'100%',background:'linear-gradient(90deg,#7a4800,#D4A017,#F5C842)',borderRadius:'0 0 32px 32px',animation:'eomBar 10s linear forwards'}}/>
        </div>
        <p ref={labelRef} style={{
          position:'absolute', bottom:'6px', left:'50%', transform:'translateX(-50%)',
          fontSize:'10px', color:'rgba(255,255,255,.2)', whiteSpace:'nowrap', margin:0, pointerEvents:'none',
        }}>Minimises in 10s</p>
      </div>
    </div>
  );
}
