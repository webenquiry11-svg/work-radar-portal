import React, { useState, useMemo, useEffect } from 'react';
import { useGetHallOfFameQuery } from '../services/EmployeApi';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Winner Spotlight ──────────────────────────────────────────────────────
const WinnerSpotlight = ({ winner, month, year }) => {
  const emp = winner?.employee;
  const photo = emp?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(emp?.name || '?')}&background=D4A017&color=fff&size=400`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[520px] rounded-3xl overflow-hidden select-none"
      style={{ background:'linear-gradient(160deg,#0f0520 0%,#1e0d3e 40%,#2d1654 70%,#3a1f6e 100%)' }}>
      <style>{`
        @keyframes hofSh{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes hofFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes hofGlow{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0),0 0 30px rgba(212,160,23,.3);}50%{box-shadow:0 0 0 14px rgba(212,160,23,0),0 0 60px rgba(212,160,23,.65);}}
        @keyframes hofFd{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes hofRing{0%,100%{opacity:.35;transform:scale(1);}50%{opacity:.65;transform:scale(1.04);}}
        @keyframes hofStar{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1.2);}}
        @keyframes hofBar{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes hofBadge{from{opacity:0;transform:translateY(14px) scale(.9);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes hofSweep{0%{opacity:0;transform:translateX(-100%);}50%{opacity:.6;}100%{opacity:0;transform:translateX(300%);}}
      `}</style>

      {/* Top shimmer bar */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',
        background:'linear-gradient(90deg,transparent,#D4A017,#F5C842,#D4A017,transparent)',
        backgroundSize:'200% 100%',animation:'hofSh 2.5s ease-in-out infinite',borderRadius:'24px 24px 0 0'}}/>

      {/* Floating particles */}
      {[...Array(8)].map((_,i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', opacity:0.12,
          width:`${4+(i%3)*3}px`, height:`${4+(i%3)*3}px`,
          left:`${(i*13+7)%85}%`, top:`${(i*19+5)%75}%`,
          background:'#F5C842',
          animation:`hofFloat ${3+(i%3)}s ease-in-out infinite`,
          animationDelay:`${i*0.3}s`,
        }}/>
      ))}

      {/* Month/Year header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1.5"
          style={{color:'rgba(212,160,23,.6)'}}>✦ &nbsp; Employee of the Month &nbsp; ✦</p>
        <h2 className="text-2xl font-black" style={{
          backgroundImage:'linear-gradient(135deg,#92600A,#D4A017,#F5C842,#D4A017,#92600A)',
          backgroundSize:'200% 100%', animation:'hofSh 3s ease-in-out infinite',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>{MONTHS[month - 1]} {year}</h2>
      </div>

      {/* Medal area */}
      <div className="flex flex-col items-center gap-5 px-8 pt-24 pb-10"
        style={{animation:'hofFd .45s ease-out'}}>
        <div className="relative flex items-center justify-center"
          style={{animation:'hofFloat 4s ease-in-out infinite'}}>

          {/* Concentric rings */}
          <div style={{position:'absolute',width:'260px',height:'260px',borderRadius:'50%',
            border:'1px solid rgba(212,160,23,.12)',animation:'hofRing 3s ease-in-out infinite'}}/>
          <div style={{position:'absolute',width:'228px',height:'228px',borderRadius:'50%',
            border:'1px solid rgba(212,160,23,.08)',animation:'hofRing 3s ease-in-out infinite .5s'}}/>

          {/* Decorative stars */}
          {[
            {top:'8px',left:'-22px',size:'20px',delay:'0s'},
            {top:'8px',right:'-22px',size:'20px',delay:'.4s'},
            {bottom:'22px',left:'-12px',size:'14px',delay:'.8s'},
            {bottom:'22px',right:'-12px',size:'14px',delay:'1.2s'},
          ].map((s,i)=>(
            <div key={i} style={{
              position:'absolute',...s,color:'#F5C842',fontSize:s.size,lineHeight:1,
              animation:'hofStar 2s ease-in-out infinite',animationDelay:s.delay,
              pointerEvents:'none',zIndex:3,
            }}>✦</div>
          ))}

          {/* Gold ring photo */}
          <div className="rounded-full relative z-10" style={{
            padding:'6px',
            background:'linear-gradient(135deg,#7a4800,#D4A017,#F5C842,#D4A017,#7a4800)',
            backgroundSize:'200% 200%',
            animation:'hofSh 3s ease-in-out infinite, hofGlow 2.5s ease-in-out infinite',
          }}>
            <div style={{padding:'4px',borderRadius:'50%',background:'linear-gradient(135deg,#0f0520,#1e0d3e)'}}>
              <div style={{width:'180px',height:'180px',borderRadius:'50%',overflow:'hidden',background:'#2d1654'}}>
                <img src={photo} alt={emp?.name}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                  onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(emp?.name||'?')}&background=D4A017&color=fff&size=400`;}}/>
              </div>
            </div>
          </div>
        </div>

        {/* Name badge */}
        <div style={{
          animation:'hofBadge .6s .15s cubic-bezier(.34,1.56,.64,1) both',
          padding:'2px',borderRadius:'50px',
          background:'linear-gradient(135deg,#7a4800,#F5C842,#D4A017,#F5C842,#7a4800)',
          backgroundSize:'200% 100%',animation:'hofSh 3s ease-in-out infinite',
          boxShadow:'0 0 28px rgba(212,160,23,.35)',margin:'0 24px',
        }}>
          <div style={{
            background:'linear-gradient(180deg,#1a0830,#0f0520)',
            borderRadius:'48px',padding:'11px 32px',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
          }}>
            <span style={{color:'#D4A017',fontSize:'11px'}}>✦</span>
            <span style={{
              fontSize:'18px',fontWeight:900,letterSpacing:'2.5px',textTransform:'uppercase',
              color:'#F5C842',fontFamily:"'Arial Black',Arial,sans-serif",
              textShadow:'0 0 16px rgba(245,200,66,.55)',
            }}>{emp?.name || '—'}</span>
            <span style={{color:'#D4A017',fontSize:'11px'}}>✦</span>
          </div>
        </div>

        {/* Role / company / score */}
        <div className="text-center" style={{animation:'hofFd .7s .25s ease-out both'}}>
          <p style={{color:'rgba(255,255,255,.65)',fontWeight:600,fontSize:'14px',margin:0}}>{emp?.role}</p>
          {emp?.company && <p style={{color:'rgba(255,255,255,.35)',fontSize:'12px',margin:'3px 0 0'}}>{emp.company}</p>}
          {winner.score != null && (
            <div className="inline-flex items-center gap-1.5 mt-3 rounded-full px-4 py-1.5"
              style={{background:'rgba(212,160,23,.12)',border:'1px solid rgba(212,160,23,.28)'}}>
              <StarIcon className="h-3.5 w-3.5 text-amber-400"/>
              <span className="text-sm font-black text-amber-300">{winner.score} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Empty ─────────────────────────────────────────────────────────────────
const EmptySpotlight = ({ month, year }) => (
  <div className="flex flex-col items-center justify-center min-h-[520px] rounded-3xl"
    style={{background:'linear-gradient(160deg,#0f0520,#1e0d3e,#2d1654)'}}>
    <TrophyIcon className="h-16 w-16 mb-4" style={{color:'rgba(212,160,23,.2)'}}/>
    <p className="text-white/30 font-bold">No winner for {MONTHS[month - 1]} {year}</p>
  </div>
);

// ── Small winner card ─────────────────────────────────────────────────────
const WinnerCard = ({ w, i }) => {
  const photo = w.employee?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(w.employee?.name||'?')}&background=8E5FD0&color=fff`;
  return (
    <div style={{
      position:'relative',overflow:'hidden',
      background:'linear-gradient(135deg,#0f0520 0%,#1e0d3e 55%,#2d1654 100%)',
      borderRadius:'18px',border:'1px solid rgba(212,160,23,.18)',
      padding:'16px',display:'flex',alignItems:'center',gap:'14px',
      boxShadow:'0 4px 20px rgba(0,0,0,.35)',
      transition:'transform .18s,box-shadow .18s',
    }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.45)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.35)';}}>

      {/* shimmer top line */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'1.5px',
        background:'linear-gradient(90deg,transparent,rgba(212,160,23,.5),transparent)'}}/>

      {/* rank badge */}
      {i === 0 && (
        <div style={{position:'absolute',top:'10px',right:'10px',
          background:'linear-gradient(135deg,#92600A,#F5C842)',
          borderRadius:'6px',padding:'2px 7px',
          fontSize:'9px',fontWeight:900,color:'#0f0520',letterSpacing:'1px'}}>
          #1
        </div>
      )}

      {/* avatar */}
      <div style={{flexShrink:0,padding:'2.5px',borderRadius:'50%',
        background:'linear-gradient(135deg,#92600A,#F5C842,#D4A017)'}}>
        <div style={{width:'52px',height:'52px',borderRadius:'50%',overflow:'hidden',background:'#1e0d3e'}}>
          <img src={photo} alt={w.employee?.name}
            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
            onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(w.employee?.name||'?')}&background=8E5FD0&color=fff`;}}/>
        </div>
      </div>

      {/* text */}
      <div style={{minWidth:0,flex:1}}>
        <p style={{fontWeight:800,color:'#F5C842',fontSize:'14px',margin:'0 0 2px',
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{w.employee?.name}</p>
        <p style={{fontSize:'11px',color:'rgba(139,92,246,.85)',fontWeight:600,margin:'0 0 5px',
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{w.employee?.role}</p>
        {w.score != null && (
          <div style={{display:'inline-flex',alignItems:'center',gap:'4px',
            background:'rgba(212,160,23,.1)',border:'1px solid rgba(212,160,23,.22)',
            borderRadius:'20px',padding:'2px 8px'}}>
            <StarIcon style={{width:'10px',height:'10px',color:'#F5C842'}}/>
            <span style={{fontSize:'11px',fontWeight:800,color:'#F5C842'}}>{w.score} pts</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
const HallOfFame = () => {
  const { data: hallOfFameData = {}, isLoading } = useGetHallOfFameQuery();
  const [selected, setSelected] = useState(null);

  const allEntries = useMemo(() => {
    const list = [];
    Object.keys(hallOfFameData).sort((a,b) => Number(b) - Number(a)).forEach(yr => {
      Object.keys(hallOfFameData[yr]).sort((a,b) => Number(b) - Number(a)).forEach(mo => {
        list.push({ year: Number(yr), month: Number(mo) });
      });
    });
    return list;
  }, [hallOfFameData]);

  useEffect(() => {
    if (allEntries.length > 0 && !selected) setSelected(allEntries[0]);
  }, [allEntries, selected]);

  const currentWinners = useMemo(() => {
    if (!selected) return [];
    return hallOfFameData[selected.year]?.[selected.month] || [];
  }, [hallOfFameData, selected]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{backgroundColor:'#DFCDFE'}}>
        <p className="text-slate-500 font-medium">Loading Hall of Fame...</p>
      </div>
    );
  }

  const hasData = allEntries.length > 0;

  return (
    <div className="min-h-full p-6 lg:p-8" style={{backgroundColor:'#DFCDFE'}}>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{background:'linear-gradient(135deg,#48306A,#8E5FD0)'}}>
          <BuildingLibraryIcon className="h-6 w-6 text-white"/>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hall of Fame</h2>
          <p className="text-slate-500 text-sm">A legacy of excellence — Employee of the Month winners</p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center min-h-[520px] rounded-3xl"
          style={{background:'linear-gradient(160deg,#0f0520,#1e0d3e,#2d1654)'}}>
          <TrophyIcon className="h-16 w-16 mb-4" style={{color:'rgba(212,160,23,.2)'}}/>
          <p className="text-white/30 font-bold text-lg">No winners recorded yet</p>
        </div>
      ) : (
        <>
          {/* Selectors */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-purple-200 shadow-sm px-4 py-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month</span>
              <select
                value={selected?.month ?? ''}
                onChange={e => setSelected(s => ({ ...s, month: Number(e.target.value) }))}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-1">
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-purple-200 shadow-sm px-4 py-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Year</span>
              <select
                value={selected?.year ?? ''}
                onChange={e => setSelected(s => ({ ...s, year: Number(e.target.value) }))}
                className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-1">
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Spotlight */}
          <div className="relative">
            {selected && currentWinners.length > 0
              ? <WinnerSpotlight winner={currentWinners[0]} month={selected.month} year={selected.year}/>
              : selected && <EmptySpotlight month={selected.month} year={selected.year}/>
            }
          </div>

          {/* Multiple winners grid */}
          {currentWinners.length > 1 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                All Winners — {MONTHS[selected.month - 1]} {selected.year}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentWinners.map((w, i) => (
                  <WinnerCard key={w._id} w={w} i={i}/>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HallOfFame;
