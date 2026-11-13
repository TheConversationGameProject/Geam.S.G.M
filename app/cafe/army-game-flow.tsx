"use client";
import { useEffect, useMemo, useState } from "react";

type RoleDetail = { team: string; description: string[] };
type Props = { players: string[]; assigned: Record<string,string>; roleDetails: Record<string,RoleDetail> };

export default function ArmyGameFlow({ players, assigned, roleDetails }: Props) {
  const [stage,setStage]=useState<"roster"|"intro"|"emergency"|"turn-setup"|"turn">("roster");
  const [introSeconds,setIntroSeconds]=useState<30|45>(30);
  const [introIndex,setIntroIndex]=useState(0);
  const [timeLeft,setTimeLeft]=useState(30);
  const [running,setRunning]=useState(false);
  const [emergencyIndex,setEmergencyIndex]=useState(0);
  const [starter,setStarter]=useState("");
  const [turn,setTurn]=useState(1);
  const [order,setOrder]=useState<string[]>([]);
  const [speaker,setSpeaker]=useState(0);
  const [shots,setShots]=useState(0);
  const [specials,setSpecials]=useState(0);
  const [challengeUsed,setChallengeUsed]=useState<string[]>([]);
  const [spent,setSpent]=useState<Record<string,string[]>>({});
  const [actor,setActor]=useState("");
  const [target,setTarget]=useState("");
  const [action,setAction]=useState<"shot"|"special"|"challenge">("shot");
  const [burn,setBurn]=useState<"shot"|"special">("shot");
  const [challengeLeft,setChallengeLeft]=useState(15);
  const [challengeActive,setChallengeActive]=useState(false);
  const [logs,setLogs]=useState<{turn:number;text:string}[]>([]);
  const [history,setHistory]=useState<{turn:number;entries:string[]}[]>([]);

  const rolePlayer=(role:string)=>players.find(p=>assigned[p]===role)||"";
  const emergencySteps=useMemo(()=>{
    const remainder=["مأمور نجات","مأمور نجات","مشتری","مشتری"].map((role,idx)=>{
      const matches=players.filter(p=>assigned[p]===role);
      return {role,player:matches[idx===0?0:idx===1?1:idx===2?0:1]||""};
    });
    return [
      {title:"لایک‌های آغازین",instruction:"سرهنگ کسلر، خلبان و دکتر پاسگال به‌ترتیب لایک نشان بدهند.",players:[rolePlayer("سرهنگ کسلر"),rolePlayer("خلبان"),rolePlayer("دکتر پاسگال")]},
      {title:"بیداری کرتیس",instruction:"کرتیس بیدار شود و سه لایک را مشاهده کند.",players:[rolePlayer("کرتیس")]},
      {title:"بستن چشم‌های کرتیس",instruction:"پس از تأیید راوی، کرتیس چشم‌هایش را ببندد.",players:[rolePlayer("کرتیس")]},
      {title:"بیداری گشتاپو",instruction:"گشتاپوی ساده و راینهارت بیدار شوند؛ فقط لایک کسلر را ببینند و یکدیگر را بشناسند.",players:[rolePlayer("گشتاپو ساده"),rolePlayer("راینهارت")]},
      {title:"بستن چشم‌های گشتاپو",instruction:"پس از تأیید راوی، گشتاپوی ساده و راینهارت چشم‌هایشان را ببندند.",players:[rolePlayer("گشتاپو ساده"),rolePlayer("راینهارت")]},
      {title:"انداختن لایک کسلر",instruction:"سرهنگ کسلر لایک خود را بیندازد.",players:[rolePlayer("سرهنگ کسلر")]},
      ...remainder.map(x=>({title:"لایک نقش باقی‌مانده",instruction:"نقش «"+x.role+"» بدون باز کردن چشم‌ها فقط لایک بدهد.",players:[x.player]}))
    ].map(x=>({...x,players:x.players.filter(Boolean)}));
  },[players,assigned]);

  useEffect(()=>{
    if(!running||stage!=="intro")return;
    const id=window.setInterval(()=>setTimeLeft(v=>{if(v<=1){window.clearInterval(id);setRunning(false);return 0;}return v-1;}),1000);
    return ()=>window.clearInterval(id);
  },[running,stage]);
  useEffect(()=>{
    if(!challengeActive)return;
    const id=window.setInterval(()=>setChallengeLeft(v=>{if(v<=1){window.clearInterval(id);setChallengeActive(false);return 0;}return v-1;}),1000);
    return ()=>window.clearInterval(id);
  },[challengeActive]);

  function nextIntro(){
    setRunning(false);
    if(introIndex<9){setIntroIndex(v=>v+1);setTimeLeft(introSeconds);}
    else setStage("emergency");
  }
  function nextEmergency(){
    if(emergencyIndex<emergencySteps.length-1)setEmergencyIndex(v=>v+1);
    else setStage("turn-setup");
  }
  function startTurn(){
    const i=players.indexOf(starter);if(i<0)return;
    setOrder([...players.slice(i),...players.slice(0,i)]);setSpeaker(0);setTurn(1);setStage("turn");
  }
  function addAction(){
    if(!actor||!target)return;
    const used=spent[actor]||[];
    if(action==="shot"&&(shots>=2||used.includes("shot")))return;
    if(action==="special"&&(specials>=2||used.includes("special")))return;
    if(action==="challenge"&&challengeUsed.includes(actor))return;
    const text=action==="shot"?actor+" به "+target+" شلیک کرد.":action==="special"?actor+" گفت‌وگوی ویژه با "+target+" انجام داد.":actor+" بازیکن "+target+" را به چالش کشید؛ ۱۵ ثانیه.";
    if(action==="shot"){setShots(v=>v+1);setSpent(p=>({...p,[actor]:[...(p[actor]||[]),"shot"]}));}
    if(action==="special"){setSpecials(v=>v+1);setSpent(p=>({...p,[actor]:[...(p[actor]||[]),"special"]}));}
    if(action==="challenge"){setChallengeUsed(p=>[...p,actor]);setSpent(p=>({...p,[actor]:[...(p[actor]||[]),burn]}));setChallengeLeft(15);setChallengeActive(true);}
    setLogs(p=>[...p,{turn,text}]);setActor("");setTarget("");
  }
  function closeTurn(){
    setHistory(p=>[...p,{turn,entries:logs.filter(x=>x.turn===turn).map(x=>x.text)}]);
    setTurn(v=>v+1);setShots(0);setSpecials(0);setChallengeUsed([]);setSpent({});setSpeaker(0);
  }

  return <div className="army-flow">
    {stage==="roster"&&<section className="command-content army-content">
      <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · ROSTER</p><h1>فهرست <em>بازیکنان</em></h1><p>نقش‌ها و قابلیت‌ها برای راوی</p></div><div className="command-crest">10<span>ROSTER</span></div></div>
      <div className="army-roster-list">{players.map((p,i)=><article className="army-roster-item" key={p}><small>{String(i+1).padStart(2,"0")} / PLAYER</small><strong>{p}</strong><b>{assigned[p]}</b><ul>{(roleDetails[assigned[p]]?.description||[]).map((line,j)=><li key={j}>{line}</li>)}</ul></article>)}</div>
      <button className="army-primary-button" onClick={()=>{setTimeLeft(introSeconds);setStage("intro");}}>شروع ترن معارفه <span>←</span></button>
    </section>}
    {stage==="intro"&&<section className="command-content army-content">
      <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · INTRODUCTION</p><h1>ترن <em>معارفه</em></h1><p>بدون چالش و بدون استفاده از قابلیت‌ها</p></div><div className="command-crest">01<span>INTRO</span></div></div>
      <div className="intro-duration-control"><span>زمان صحبت هر بازیکن</span><div><button className={introSeconds===30?"selected":""} onClick={()=>{setIntroSeconds(30);setTimeLeft(30);setRunning(false);}}>۳۰ ثانیه</button><button className={introSeconds===45?"selected":""} onClick={()=>{setIntroSeconds(45);setTimeLeft(45);setRunning(false);}}>۴۵ ثانیه</button></div></div>
      <div className="intro-player-card"><small>نوبت معرفی · بازیکن {introIndex+1} از ۱۰</small><strong>{players[introIndex]}</strong><div className={"intro-countdown "+(timeLeft===0?"time-finished":"")}>{timeLeft}</div><span>{timeLeft===0?"زمان این بازیکن تمام شد":"زمان باقی‌مانده برای صحبت"}</span></div>
      <div className="intro-timer-actions"><button className="army-primary-button" disabled={timeLeft===0} onClick={()=>setRunning(v=>!v)}>{running?"توقف زمان":"شروع زمان"} <span>◷</span></button><button className="intro-reset-button" onClick={()=>{setRunning(false);setTimeLeft(introSeconds);}}>شروع مجدد زمان</button></div>
      <button className="army-primary-button intro-next-button" onClick={nextIntro}>{introIndex===9?"پایان ترن معارفه":"بازیکن بعدی"} <span>←</span></button>
    </section>}
    {stage==="emergency"&&<section className="command-content army-content">
      <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · EMERGENCY</p><h1>وضعیت <em>اضطراری</em></h1><p>مرحله {emergencyIndex+1} از {emergencySteps.length}</p></div><div className="command-crest">02<span>CHECK</span></div></div>
      <div className="army-stage-card"><small>دستور مرحله‌ای برای راوی</small><h2>{emergencySteps[emergencyIndex].title}</h2><p>{emergencySteps[emergencyIndex].instruction}</p>{emergencySteps[emergencyIndex].players.map(p=><span className="army-stage-player" key={p}>{p} · {assigned[p]}</span>)}</div>
      <p className="army-hint">برنامه لایک را تشخیص نمی‌دهد؛ فقط پس از تأیید راوی جلو می‌رود.</p>
      <button className="army-primary-button" onClick={nextEmergency}>{emergencyIndex===emergencySteps.length-1?"تأیید و ورود به ترن اول":"تأیید راوی و مرحله بعد"} <span>←</span></button>
    </section>}
    {stage==="turn-setup"&&<section className="command-content army-content">
      <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · FIRST TURN</p><h1>شروع <em>ترن اول</em></h1><p>شروع‌کننده صحبت را انتخاب کن.</p></div><div className="command-crest">01<span>TURN</span></div></div>
      <label className="army-select-label">بازیکن شروع‌کننده<select value={starter} onChange={e=>setStarter(e.target.value)}><option value="">انتخاب بازیکن</option>{players.map(p=><option key={p}>{p}</option>)}</select></label>
      <button className="army-primary-button" disabled={!starter} onClick={startTurn}>شروع ترن اول <span>←</span></button>
    </section>}
    {stage==="turn"&&<section className="command-content army-content">
      <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · LIVE TURN</p><h1>ترن <em>{turn}</em></h1><p>ثبت اطلاعات ترن جاری و سوابق</p></div><div className="command-crest">{String(turn).padStart(2,"0")}<span>TURN</span></div></div>
      <div className="army-stage-card"><small>نوبت صحبت</small><h2>{order[speaker]||"—"}</h2><button className="intro-reset-button" onClick={()=>setSpeaker(v=>(v+1)%order.length)}>نفر بعدی برای صحبت</button></div>
      <div className="army-turn-counters"><span>شلیک {shots}/۲</span><span>گفت‌وگوی ویژه {specials}/۲</span></div>
      <label className="army-select-label">بازیکن اجراکننده<select value={actor} onChange={e=>setActor(e.target.value)}><option value="">انتخاب بازیکن</option>{players.map(p=><option key={p}>{p}</option>)}</select></label>
      <label className="army-select-label">اقدام<select value={action} onChange={e=>setAction(e.target.value as "shot"|"special"|"challenge")}><option value="shot">شلیک</option><option value="special">گفت‌وگوی ویژه</option><option value="challenge">چالش ۱۵ ثانیه‌ای</option></select></label>
      <label className="army-select-label">بازیکن هدف<select value={target} onChange={e=>setTarget(e.target.value)}><option value="">انتخاب هدف</option>{players.filter(p=>p!==actor).map(p=><option key={p}>{p}</option>)}</select></label>
      {action==="challenge"&&<label className="army-select-label">قابلیتی که برای همین بازیکن می‌سوزد<select value={burn} onChange={e=>setBurn(e.target.value as "shot"|"special")}><option value="shot">شلیک</option><option value="special">گفت‌وگوی ویژه</option></select></label>}
      <button className="army-primary-button" disabled={!actor||!target||(action==="shot"&&(shots>=2||(spent[actor]||[]).includes("shot")))||(action==="special"&&(specials>=2||(spent[actor]||[]).includes("special")))||(action==="challenge"&&challengeUsed.includes(actor))} onClick={addAction}>ثبت اقدام <span>＋</span></button>
      {challengeActive&&<div className="army-challenge-clock"><b>{challengeLeft}</b><span>ثانیه باقی‌مانده چالش</span></div>}
      <div className="army-log"><h2>گزارش ترن جاری</h2>{logs.filter(x=>x.turn===turn).map((x,i)=><p key={i}>{i+1}. {x.text}</p>)}</div>
      <button className="army-primary-button" onClick={closeTurn}>پایان ترن و ثبت سوابق <span>✓</span></button>
      <div className="army-log"><h2>ترن‌های قبلی</h2>{history.map(h=><article key={h.turn}><b>ترن {h.turn}</b>{h.entries.map((x,i)=><p key={i}>{x}</p>)}</article>)}</div>
    </section>}
  </div>;
}
