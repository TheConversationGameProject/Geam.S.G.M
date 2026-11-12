"use client";

import { useEffect, useState } from "react";

type View = "welcome" | "menu" | "games" | "army-setup" | "army-deal" | "army-intro";
const ARMY_ROLES = ["کرتیس","خلبان","مأمور نجات","مأمور نجات","دکتر پاسگال","سرهنگ کسلر","راینهارت","گشتاپو ساده","مشتری","مشتری"];

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function CafeWorkspace({ gifted }: { gifted: boolean }) {
  const [view, setView] = useState<View>("welcome");
  const [notice, setNotice] = useState("");
  const [players, setPlayers] = useState<string[]>(Array(10).fill(""));
  const [roleDeck, setRoleDeck] = useState<string[]>([]);
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [revealedRole, setRevealedRole] = useState("");
  const [introSeconds, setIntroSeconds] = useState<30 | 45>(30);
  const [introIndex, setIntroIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning || view !== "army-intro") return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, view]);

  function openSection(label: string) {
    setNotice("بخش «" + label + "» در منوی گرداننده ثبت شد؛ برای فعال‌سازی آن باید روند اجرایی‌اش مشخص شود.");
  }

  function beginRoleDeal() {
    const cleaned = players.map((name) => name.trim());
    if (cleaned.some((name) => !name)) {
      setNotice("برای شروع تقسیم نقش، نام هر ۱۰ بازیکن را وارد کن.");
      return;
    }
    if (new Set(cleaned.map((name) => name.toLocaleLowerCase())).size !== 10) {
      setNotice("نام بازیکنان باید یکتا باشد تا نقش به اشتباه به فرد دیگری داده نشود.");
      return;
    }
    setPlayers(cleaned);
    setRoleDeck(shuffle(ARMY_ROLES));
    setAssigned({});
    setSelectedPlayer("");
    setRevealedRole("");
    setNotice("");
    setView("army-deal");
  }

  function revealNextRole() {
    if (!selectedPlayer || spinning || revealedRole) return;
    const role = roleDeck[Object.keys(assigned).length];
    if (!role) return;
    setSpinning(true);
    window.setTimeout(() => {
      setAssigned((previous) => ({ ...previous, [selectedPlayer]: role }));
      setRevealedRole(role);
      setSpinning(false);
    }, 2300);
  }

  function continueAfterRole() {
    setRevealedRole("");
    setSelectedPlayer("");
    if (Object.keys(assigned).length === 10) {
      setIntroIndex(0);
      setTimeLeft(introSeconds);
      setTimerRunning(false);
      setView("army-intro");
    }
  }

  function changeIntroDuration(value: 30 | 45) {
    setIntroSeconds(value);
    setTimeLeft(value);
    setTimerRunning(false);
  }

  function nextIntroPlayer() {
    setTimerRunning(false);
    if (introIndex < 9) {
      setIntroIndex((value) => value + 1);
      setTimeLeft(introSeconds);
    } else {
      setNotice("ترن معارفه هر ۱۰ بازیکن به پایان رسید.");
    }
  }

  const remainingPlayers = players.filter((name) => name && !assigned[name]);
  const dealtCount = Object.keys(assigned).length;

  return (
    <main className="command-screen">
      <div className="command-noise" aria-hidden="true" />
      <header className="command-header">
        <div className="command-brand"><span className="brand-stamp">C</span><div><b>کافه کاندیدا</b><small>میز فرماندهی راوی</small></div></div>
        <div className="command-signal"><i /> ارتباط امن <span>۱۹۴۵ / BXL</span></div>
      </header>
      <div className="command-frame">
        <div className="command-ruler"><span>پرونده عملیاتی ۰۷</span><span>CLASSIFIED / EYES ONLY</span></div>
        {view === "welcome" && (
          <section className="dispatch-welcome">
            <div className="dispatch-seal"><span> C </span><small> CANDIDA · 1945 </small></div>
            <p className="dispatch-overline">پیام رمزگشایی شد · ورود تأیید شد</p>
            <h1>به محفل خوش آمدی،<br /><em>راوی.</em></h1>
            <div className="dispatch-rule"><span>✦</span></div>
            <p className="dispatch-copy">{gifted ? "پرونده کافه فعال شد. یک ماه اشتراک هدیه برای کافه‌ات ثبت شده است." : "دسترسی کافه تأیید شد. میز فرماندهی آماده دریافت دستورهای توست."}</p>
            <div className="dispatch-actions">
              <button className="dispatch-enter" onClick={() => { setNotice(""); setView("menu"); }}>ورود به میز فرماندهی <span>←</span></button>
              <form action="/auth/signout" method="post"><button className="dispatch-logout">خروج از حساب</button></form>
            </div>
            <div className="dispatch-footnote"><span>KEEP THIS CHANNEL CLEAR</span><span>BRUSSELS · 50°50' N</span></div>
          </section>
        )}
        {view === "menu" && (
          <section className="command-content">
            <div className="command-heading"><div><p className="dispatch-overline">کانال فرماندهی / ۰۱</p><h1>میز <em>فرماندهی</em></h1><p>دستور بعدی را انتخاب کن.</p></div><div className="command-crest">C<span>HQ</span></div></div>
            <div className="menu-board">
              <button className="menu-tile menu-tile-main" onClick={() => { setNotice(""); setView("games"); }}><span className="tile-index">۰۱ / FIELD</span><strong>شروع بازی</strong><small>انتخاب عملیات و آماده‌سازی میز</small><b className="tile-arrow">←</b></button>
              <button className="menu-tile" onClick={() => openSection("خرید اشتراک")}><span className="tile-index">۰۲ / SUPPLY</span><strong>خرید اشتراک</strong><small>تدارکات و تمدید دسترسی</small><b className="tile-arrow">←</b></button>
              <button className="menu-tile" onClick={() => openSection("درخواست پشتیبانی و سوال")}><span className="tile-index">۰۳ / SIGNAL</span><strong>درخواست پشتیبانی و سوال</strong><small>ارسال پیام به مرکز ارتباطات</small><b className="tile-arrow">←</b></button>
              <button className="menu-tile" onClick={() => openSection("ثبت شخصیت جدید برای بازی مافیا")}><span className="tile-index">۰۴ / PERSONNEL</span><strong>ثبت شخصیت جدید برای بازی مافیا</strong><small>افزودن پرونده شخصیت به بایگانی</small><b className="tile-arrow">←</b></button>
            </div>
            {notice && <p className="command-notice" role="status">{notice}</p>}
            <div className="command-bottom"><span>وضعیت سامانه: متصل</span><span>فرماندهی کافه کاندیدا</span></div>
          </section>
        )}
        {view === "games" && (
          <section className="command-content">
            <div className="command-heading"><div><p className="dispatch-overline">میز عملیات / ۰۲</p><h1>انتخاب <em>بازی</em></h1><p>نوع عملیات را برای شروع انتخاب کن.</p></div><div className="command-crest">OPS<span>02</span></div></div>
            <div className="game-board">
              <button className="game-tile game-active" onClick={() => { setNotice(""); setView("army-setup"); }}><span className="game-status"><i /> فعال</span><span className="game-code">OPERATION · 1945</span><strong>ارتش سری</strong><small>پرونده عملیاتی آماده انتخاب</small><b>ورود به عملیات <span>←</span></b></button>
              <div className="game-tile game-locked"><span className="game-status">در دست ساخت</span><span className="game-code">DOSSIER · 02</span><strong>پدرخوانده</strong><small>پرونده هنوز مهر نهایی نخورده است.</small><b>به‌زودی</b></div>
              <div className="game-tile game-locked"><span className="game-status">در دست ساخت</span><span className="game-code">DOSSIER · 03</span><strong>مافیا</strong><small>پرونده هنوز مهر نهایی نخورده است.</small><b>به‌زودی</b></div>
            </div>
            {notice && <p className="command-notice" role="status">{notice}</p>}
            <button className="command-back" onClick={() => { setNotice(""); setView("menu"); }}>← بازگشت به منوی فرماندهی</button>
            <div className="command-bottom"><span>وضعیت سامانه: متصل</span><span>فرماندهی کافه کاندیدا</span></div>
          </section>
        )}
        {view === "army-setup" && (
          <section className="command-content army-content">
            <div className="command-heading"><div><p className="dispatch-overline">OPERATION · SECRET ARMY</p><h1>ثبت <em>بازیکنان</em></h1><p>نام دقیق ۱۰ بازیکن را وارد کن.</p></div><div className="command-crest">10<span>PLAYERS</span></div></div>
            <div className="army-player-list">
              {players.map((name, index) => (
                <label className="army-player-input" key={index}><span>{String(index + 1).padStart(2, "0")}</span><input value={name} maxLength={32} placeholder={"نام بازیکن " + (index + 1)} onChange={(event) => setPlayers((previous) => previous.map((value, i) => i === index ? event.target.value : value))} /></label>
              ))}
            </div>
            <p className="army-hint">تقسیم نقش تنها پس از تکمیل هر ۱۰ نام و بررسی تکراری نبودن آن‌ها فعال می‌شود.</p>
            {notice && <p className="command-notice" role="alert">{notice}</p>}
            <button className="army-primary-button" onClick={beginRoleDeal}>تقسیم نقش <span>←</span></button>
            <button className="command-back" onClick={() => { setNotice(""); setView("games"); }}>← بازگشت به انتخاب بازی</button>
          </section>
        )}
        {view === "army-deal" && (
          <section className="command-content army-content">
            <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · ROLE DEALING</p><h1>تقسیم <em>نقش‌ها</em></h1><p>کارت {dealtCount + 1} از ۱۰</p></div><div className="command-crest">{String(dealtCount + 1).padStart(2, "0")}<span>OF 10</span></div></div>
            <div className="army-progress" aria-label={dealtCount + " از ۱۰ نقش تقسیم شده"}><span style={{ width: (dealtCount * 10) + "%" }} /></div>
            <p className="army-hint">نام بازیکنی را که اکنون کارت را دریافت می‌کند انتخاب کن. هر بازیکن فقط یک بار می‌تواند انتخاب شود.</p>
            {!revealedRole ? (
              <>
                <label className="army-select-label">بازیکن دریافت‌کننده کارت
                  <select value={selectedPlayer} disabled={spinning} onChange={(event) => setSelectedPlayer(event.target.value)}>
                    <option value="">انتخاب نام بازیکن</option>
                    {remainingPlayers.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </label>
                <div className={"role-card " + (spinning ? "role-card-spinning" : "")}>
                  <span className="role-card-stamp">CANDIDA · 1945</span><span className="role-card-label">{spinning ? "در حال رمزگشایی کارت..." : selectedPlayer || "کارت محرمانه"}</span><strong>{spinning ? "✦" : "؟"}</strong><small>{spinning ? "PLEASE WAIT" : "SECRET ROLE"}</small>
                </div>
                <button className="army-primary-button" disabled={!selectedPlayer || spinning} onClick={revealNextRole}>{spinning ? "در حال چرخش کارت..." : "نمایش نقش این بازیکن"} <span>←</span></button>
              </>
            ) : (
              <div className="role-reveal-panel">
                <p>نقش اختصاص‌یافته به</p><h2>{selectedPlayer}</h2>
                <div className="role-reveal-card"><small>SECRET ROLE · CLASSIFIED</small><strong>{revealedRole}</strong><span>این نقش را فقط به بازیکن انتخاب‌شده اعلام کن.</span></div>
                <button className="army-primary-button" onClick={continueAfterRole}>{dealtCount === 10 ? "ورود به ترن معارفه" : "نقش بعدی"} <span>←</span></button>
              </div>
            )}
            <div className="army-deal-footer"><span>نقش‌های تقسیم‌شده: {dealtCount} / ۱۰</span><span>نقش‌ها تصادفی و بدون جایگزینی اضافه</span></div>
          </section>
        )}
        {view === "army-intro" && (
          <section className="command-content army-content">
            <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · INTRODUCTION</p><h1>ترن <em>معارفه</em></h1><p>بدون چالش؛ فقط معرفی بازیکنان.</p></div><div className="command-crest">01<span>INTRO</span></div></div>
            <div className="intro-duration-control"><span>زمان صحبت هر بازیکن</span><div><button className={introSeconds === 30 ? "selected" : ""} onClick={() => changeIntroDuration(30)}>۳۰ ثانیه</button><button className={introSeconds === 45 ? "selected" : ""} onClick={() => changeIntroDuration(45)}>۴۵ ثانیه</button></div></div>
            <div className="intro-player-card"><small>نوبت معرفی · بازیکن {introIndex + 1} از ۱۰</small><strong>{players[introIndex]}</strong><div className={"intro-countdown " + (timeLeft === 0 ? "time-finished" : "")}>{timeLeft}</div><span>{timeLeft === 0 ? "زمان این بازیکن تمام شد" : "زمان باقی‌مانده برای صحبت"}</span></div>
            <div className="intro-timer-actions"><button className="army-primary-button" onClick={() => setTimerRunning((value) => !value)} disabled={timeLeft === 0}>{timerRunning ? "توقف زمان" : "شروع زمان"} <span>◷</span></button><button className="intro-reset-button" onClick={() => { setTimerRunning(false); setTimeLeft(introSeconds); }}>شروع مجدد زمان</button></div>
            <button className="army-primary-button intro-next-button" onClick={nextIntroPlayer}>{introIndex === 9 ? "پایان ترن معارفه" : "بازیکن بعدی"} <span>←</span></button>
            {notice && <p className="command-notice" role="status">{notice}</p>}
            <p className="army-hint">در این مرحله هیچ چالشی اجرا نمی‌شود.</p>
          </section>
        )}
      </div>
    </main>
  );
}
