"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function HomePage() {
  const [showEntry, setShowEntry] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function enterCafe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setBusy(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("اتصال سامانه ورود هنوز پیکربندی نشده است.");
      const supabase = createClient(url, key);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setNotice("پیوند ورود برایت ایمیل شد. صندوق ورودی و پوشه هرزنامه را بررسی کن.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ارسال پیوند ورود انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="landing">
      <div className="grain" aria-hidden="true" />
      <header className="topline">
        <span className="topline-mark">B</span>
        <span>BERLIN · 1945</span>
        <span className="topline-status"><i /> محفل خصوصی</span>
      </header>

      <section className="poster">
        <div className="poster-rule"><span>EST. 1945</span><span>CAFÉ CANDIDA</span><span>NO. 07</span></div>
        <div className="emblem" aria-label="نشان کافه کاندیدا">
          <span className="emblem-small">C</span>
          <span className="emblem-large">C</span>
          <span className="emblem-name">CANDIDA</span>
        </div>
        <p className="eyebrow">کافه‌ای برای آنان که روایت را در دست دارند</p>
        <h1>کافه <span>کاندیدا</span></h1>
        <div className="ornament"><b /> <span>✦</span> <b /></div>
        <p className="intro">درهای این محفل به روی راویان باز است؛<br />جایی برای اداره‌ی دقیق بازی، بی‌آنکه رشته‌ی روایت از دست برود.</p>

        <div className="entry-area">
          {!showEntry ? (
            <button className="enter-button" onClick={() => setShowEntry(true)}>
              <span>ورود به کافه</span><span className="button-arrow">←</span>
            </button>
          ) : (
            <form className="entry-form" onSubmit={enterCafe}>
              <label htmlFor="email">نشانی ایمیل راوی</label>
              <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className="enter-button" type="submit" disabled={busy}>
                <span>{busy ? "در حال ارسال..." : "دریافت رمز ورود"}</span><span className="button-arrow">←</span>
              </button>
              {notice && <p className="notice" role="status">{notice}</p>}
            </form>
          )}
          <p className="entry-note">ورود ویژه‌ی گردانندگان بازی</p>
        </div>
        <div className="poster-footer">
          <span>PRIVATE SALON</span><span>BERLIN · DEUTSCHLAND</span><span>1945</span>
        </div>
      </section>
      <footer className="site-footer">روایت را تو هدایت می‌کنی؛ جزئیات را به ما بسپار.</footer>
    </main>
  );
}
