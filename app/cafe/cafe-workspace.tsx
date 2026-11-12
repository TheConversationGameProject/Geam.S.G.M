"use client";

import { useState } from "react";

type View = "welcome" | "menu" | "games";

export default function CafeWorkspace({ gifted }: { gifted: boolean }) {
  const [view, setView] = useState<View>("welcome");
  const [notice, setNotice] = useState("");

  function openSection(label: string) {
    setNotice(`بخش «${label}» در منوی گرداننده ثبت شد؛ برای فعال‌سازی آن باید روند اجرایی‌اش مشخص شود.`);
  }

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
            <div className="command-heading">
              <div><p className="dispatch-overline">کانال فرماندهی / ۰۱</p><h1>میز <em>فرماندهی</em></h1><p>دستور بعدی را انتخاب کن.</p></div>
              <div className="command-crest">C<span>HQ</span></div>
            </div>
            <div className="menu-board">
              <button className="menu-tile menu-tile-main" onClick={() => { setNotice(""); setView("games"); }}>
                <span className="tile-index">۰۱ / FIELD</span><strong>شروع بازی</strong><small>انتخاب عملیات و آماده‌سازی میز</small><b className="tile-arrow">←</b>
              </button>
              <button className="menu-tile" onClick={() => openSection("خرید اشتراک")}>
                <span className="tile-index">۰۲ / SUPPLY</span><strong>خرید اشتراک</strong><small>تدارکات و تمدید دسترسی</small><b className="tile-arrow">←</b>
              </button>
              <button className="menu-tile" onClick={() => openSection("درخواست پشتیبانی و سوال")}>
                <span className="tile-index">۰۳ / SIGNAL</span><strong>درخواست پشتیبانی و سوال</strong><small>ارسال پیام به مرکز ارتباطات</small><b className="tile-arrow">←</b>
              </button>
              <button className="menu-tile" onClick={() => openSection("ثبت شخصیت جدید برای بازی مافیا")}>
                <span className="tile-index">۰۴ / PERSONNEL</span><strong>ثبت شخصیت جدید برای بازی مافیا</strong><small>افزودن پرونده شخصیت به بایگانی</small><b className="tile-arrow">←</b>
              </button>
            </div>
            {notice && <p className="command-notice" role="status">{notice}</p>}
            <div className="command-bottom"><span>وضعیت سامانه: متصل</span><span>فرماندهی کافه کاندیدا</span></div>
          </section>
        )}

        {view === "games" && (
          <section className="command-content">
            <div className="command-heading">
              <div><p className="dispatch-overline">میز عملیات / ۰۲</p><h1>انتخاب <em>بازی</em></h1><p>نوع عملیات را برای شروع انتخاب کن.</p></div>
              <div className="command-crest">OPS<span>02</span></div>
            </div>
            <div className="game-board">
              <button className="game-tile game-active" onClick={() => openSection("ارتش سری")}>
                <span className="game-status"><i /> فعال</span>
                <span className="game-code">OPERATION · 1945</span>
                <strong>ارتش سری</strong>
                <small>پرونده عملیاتی آماده انتخاب</small>
                <b>ورود به عملیات <span>←</span></b>
              </button>
              <div className="game-tile game-locked">
                <span className="game-status">در دست ساخت</span>
                <span className="game-code">DOSSIER · 02</span>
                <strong>پدرخوانده</strong>
                <small>پرونده هنوز مهر نهایی نخورده است.</small>
                <b>به‌زودی</b>
              </div>
              <div className="game-tile game-locked">
                <span className="game-status">در دست ساخت</span>
                <span className="game-code">DOSSIER · 03</span>
                <strong>مافیا</strong>
                <small>پرونده هنوز مهر نهایی نخورده است.</small>
                <b>به‌زودی</b>
              </div>
            </div>
            {notice && <p className="command-notice" role="status">{notice}</p>}
            <button className="command-back" onClick={() => { setNotice(""); setView("menu"); }}>← بازگشت به منوی فرماندهی</button>
            <div className="command-bottom"><span>وضعیت سامانه: متصل</span><span>فرماندهی کافه کاندیدا</span></div>
          </section>
        )}
      </div>
    </main>
  );
}
