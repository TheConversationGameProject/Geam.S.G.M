"use client";

import { useState } from "react";
import ArmyGameFlow from "./army-game-flow";
import SignOutForm from "@/app/auth/signout-form";

type View = "welcome" | "menu" | "games" | "army-setup" | "army-deal" | "army-flow";
const ARMY_ROLES = ["کرتیس","خلبان","مأمور نجات","مأمور نجات","دکتر پاسگال","سرهنگ کسلر","راینهارت","گشتاپو ساده","مشتری","مشتری"];
const ROLE_DETAILS: Record<string, { team: string; description: string[] }> = {
  "کرتیس": { team: "partisan", description: ["شما می‌تواند لایک سه نفر را ببیند: خلبان، کسلر، دکتر.", "در ضمن شما مسلح هستید؛ دشمن را پیدا کنید..."] },
  "مأمور نجات": { team: "partisan", description: ["شما باید پارتیزان را شناسایی کنید.", "شما مسلح هستید و باید از خلبان محافظت کنید..."] },
  "سرهنگ کسلر": { team: "gestapo", description: ["به هیچ‌کس اعتماد نکنید...", "شما مسلح هستید و می‌توانید به‌راحتی دروغ بگویید...", "شما جلیقه دارید..."] },
  "راینهارت": { team: "gestapo", description: ["سکوت کنید تا در تاریکی بهتر بشنوید...", "شما می‌توانید یک بازیکن را با شناخت نقش دقیقش از بازی حذف کنید... شما مسلح هستید...."] },
  "گشتاپو ساده": { team: "gestapo", description: ["شما مسلح هستید....", "مراقب سرهنگ باشید..."] },
  "مشتری": { team: "customer", description: ["شما سایدی ندارید ولی می‌توانید انتخاب کنید در کدام ساید باشید، گشتاپو یا پارتیزان....", "فقط نیاز به یک اسلحه دارید."] },
  "خلبان": { team: "partisan", description: ["مراقب باشید...", "شما مسلح نیستید ولی می‌توانید باشید...", "به پارتیزان‌ها اعتماد کنید تا نجات پیدا کنید...", "شما یک جلیقه در برابر گلوله و یک جلیقه در برابر رأی دارید.."] },
  "دکتر پاسگال": { team: "partisan", description: ["شما نظامی نیستید...", "شما می‌توانید دو نفر را نجات دهید...", "مراقب باشید چه کسی را نجات می‌دهید...."] }
};

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
  const [revealedRole, setRevealedRole] = useState("");
  const [revealedPlayer, setRevealedPlayer] = useState("");
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
    setRevealedRole("");
    setRevealedPlayer("");
    setNotice("");
    setView("army-deal");
  }

  function revealNextRole() {
    const index = Object.keys(assigned).length;
    const currentPlayer = players[index];
    const role = roleDeck[index];
    if (!currentPlayer || !role || revealedRole) return;
    setAssigned((previous) => ({ ...previous, [currentPlayer]: role }));
    setRevealedRole(role);
    setRevealedPlayer(currentPlayer);
  }

  function continueAfterRole() {
    setRevealedRole("");
    setRevealedPlayer("");
    if (Object.keys(assigned).length === 10) setView("army-flow");
  }

  const dealtCount = Object.keys(assigned).length;
  const currentPlayer = players[dealtCount] || "";

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
              <SignOutForm className="dispatch-logout" />
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
            <div className="command-heading"><div><p className="dispatch-overline">SECRET ARMY · ROLE DEALING</p><h1>تقسیم <em>نقش‌ها</em></h1><p>کارت {revealedRole ? dealtCount : dealtCount + 1} از ۱۰</p></div><div className="command-crest">{String(dealtCount + 1).padStart(2, "0")}<span>OF 10</span></div></div>
            <div className="army-progress" aria-label={dealtCount + " از ۱۰ نقش تقسیم شده"}><span style={{ width: (dealtCount * 10) + "%" }} /></div>
            <p className="army-hint">گوشی را به بازیکنِ نوبت‌دار بده. نام او روی کارت دیده می‌شود؛ بازیکن برای دیدن نقش خودش روی کارت می‌زند.</p>
            {!revealedRole ? (
              <button type="button" className="secret-envelope" onClick={revealNextRole} aria-label={"باز کردن نامه محرمانه برای " + currentPlayer}>
                <span className="envelope-topline"><b>FELDPOST</b><span>1945 · BRUSSELS</span></span>
                <span className="envelope-address"><small>محرمانه ـ فقط برای</small><strong>{currentPlayer}</strong></span>
                <span className="envelope-flap" aria-hidden="true" />
                <span className="envelope-seal" aria-hidden="true">C</span>
                <span className="envelope-bottomline">GEHEIM · EYES ONLY</span>
                <span className="envelope-instruction">✉ برای گشودن نامه لمس کن</span>
              </button>
            ) : (
              <div className="role-reveal-panel">
                <p className="letter-recipient">نامه محرمانه خطاب به</p><h2>{revealedPlayer}</h2>
                <article className={"role-reveal-card role-team-" + ROLE_DETAILS[revealedRole].team}>
                  <div className="letter-classification"><span>GEHEIME NACHRICHT</span><span>NO. {String(dealtCount).padStart(2,"0")} / 10</span></div>
                  <div className="faction-seal" data-faction={ROLE_DETAILS[revealedRole].team} aria-label={ROLE_DETAILS[revealedRole].team==="gestapo"?"نشان تاریخی آلمان نازی":ROLE_DETAILS[revealedRole].team==="partisan"?"نشان ارتش بریتانیا":"نشان بلژیک"}>
                    {ROLE_DETAILS[revealedRole].team==="gestapo" ? <><svg viewBox="0 0 100 76" role="img" aria-label="نشان عقاب تاریخی آلمان در دوره جنگ جهانی دوم"><path d="M48 25 C34 10 16 13 4 5 C10 22 18 31 31 35 C20 37 12 34 5 30 C13 47 28 49 43 42 L50 54 L57 42 C72 49 87 47 95 30 C88 34 80 37 69 35 C82 31 90 22 96 5 C84 13 66 10 52 25 Z" fill="#342b26" stroke="#742f31" strokeWidth="2"/><path d="M50 21 L58 32 L53 39 L57 47 L50 56 L43 47 L47 39 L42 32 Z" fill="#342b26"/><path d="M44 57 H56 L60 67 L50 73 L40 67 Z" fill="#eee1c4" stroke="#742f31" strokeWidth="2"/><path d="M50 59 V69 M44 64 H56" stroke="#742f31" strokeWidth="3"/></svg><b>DEUTSCHES REICH</b><small>GESTAPO · 1945</small></> : ROLE_DETAILS[revealedRole].team==="partisan" ? <><svg viewBox="0 0 100 82" role="img" aria-label="نشان سپر و پرچم ارتش بریتانیا"><path d="M50 4 L88 17 V43 C88 62 72 74 50 80 C28 74 12 62 12 43 V17 Z" fill="#e9e2cb" stroke="#40583b" strokeWidth="4"/><path d="M50 8 V72 M17 40 H83" stroke="#a33b36" strokeWidth="12"/><path d="M18 13 L82 63 M82 13 L18 63" stroke="#334c37" strokeWidth="8"/><path d="M50 8 V72 M17 40 H83" stroke="#eee7d3" strokeWidth="4"/><path d="M18 13 L82 63 M82 13 L18 63" stroke="#eee7d3" strokeWidth="3"/></svg><b>BRITISH FORCES</b><small>RESISTANCE · 1945</small></> : <><svg viewBox="0 0 100 82" role="img" aria-label="نشان شیر بلژیک"><path d="M24 68 L31 53 L23 42 L31 31 L28 18 L42 23 L50 12 L59 24 L74 20 L71 35 L84 43 L72 53 L77 66 L61 62 L50 76 L39 63 Z" fill="#9a702c" stroke="#59451f" strokeWidth="3"/><path d="M47 30 L53 22 L59 31 L55 39 L65 43 L60 49 L53 45 L48 56 L43 48 L35 50 L39 41 L33 35 L43 36 Z" fill="#e7d4a5"/><path d="M43 57 L34 72 M57 57 L67 72" stroke="#59451f" strokeWidth="5" strokeLinecap="round"/></svg><b>BELGIQUE</b><small>BRUSSELS · 1945</small></>}
                  </div>
                  <small className="letter-role-label">پرونده هویت و مأموریت</small>
                  <strong>{revealedRole}</strong>
                  <div className="role-description">{ROLE_DETAILS[revealedRole].description.map((line, index) => <p key={index}>{line}</p>)}</div>
                  <span className="letter-warning">پس از مطالعه، نامه را محرمانه نگه دار.</span>
                </article>
                <button className="army-primary-button" onClick={continueAfterRole}>نامه را خواندم <span>←</span></button>
              </div>
            )}
            <div className="army-deal-footer"><span>نقش‌های تقسیم‌شده: {dealtCount} / ۱۰</span><span>نقش‌ها تصادفی و بدون جایگزینی اضافه</span></div>
          </section>
        )}
        {view === "army-flow" && <ArmyGameFlow players={players} assigned={assigned} roleDetails={ROLE_DETAILS} onReturnToGames={() => { setPlayers(Array(10).fill("")); setRoleDeck([]); setAssigned({}); setRevealedRole(""); setRevealedPlayer(""); setNotice(""); setView("games"); }} />}

      </div>
    </main>
  );
}
