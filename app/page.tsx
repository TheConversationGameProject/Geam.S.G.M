"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Mode = "choice" | "login" | "register";

const emptyForm = {
  cafeName: "", email: "", ownerPhone: "", publicPhone: "",
  province: "", city: "", address: "", managerName: "",
  password: "", confirmPassword: "",
};

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("choice");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (mode === "choice") return;
    if (mode === "register" && form.password !== form.confirmPassword) {
      setNotice("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    if (mode === "register" && form.password.length < 8) {
      setNotice("رمز عبور باید دست‌کم ۸ نویسه داشته باشد.");
      return;
    }

    setBusy(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("اتصال سامانه ورود هنوز پیکربندی نشده است.");
      const supabase = createClient(url, key);

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin + "/auth/callback",
            data: {
              cafe_name: form.cafeName.trim(),
              owner_phone: form.ownerPhone.trim(),
              public_phone: form.publicPhone.trim(),
              province: form.province.trim(),
              city: form.city.trim(),
              address: form.address.trim(),
              manager_name: form.managerName.trim(),
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign("/cafe");
          return;
        }
        setNotice("ثبت کافه انجام شد. برای فعال‌کردن ورود، پیوند تأیید ارسال‌شده به ایمیلت را باز کن.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        window.location.assign("/cafe");
        return;
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "درخواست انجام نشد. دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <main className="landing">
      <div className="grain" aria-hidden="true" />
      <header className="topline">
        <span className="topline-mark">C</span>
        <span>BELGIUM · 1945</span>
        <span className="topline-status"><i /> محفل خصوصی</span>
      </header>

      <section className="poster">
        <div className="poster-rule"><span>EST. 1945</span><span>CAFÉ CANDIDA</span><span>NO. 07</span></div>
        <div className="emblem" aria-label="نشان کافه کاندیدا">
          <span className="emblem-small">C</span>
          <span className="emblem-large">C</span>
          <span className="emblem-name">CANDIDA</span>
        </div>
        <p className="eyebrow">پشت درهای بسته، روایت آغاز می‌شود</p>
        <h1>کافه <span>کاندیدا</span></h1>
        <div className="ornament"><b /> <span>✦</span> <b /></div>
        <p className="intro">محفل گردانندگان بازی‌های گفتگو‌محور<br />برای راویانی که جزئیات را از یاد نمی‌برند.</p>

        <div className="entry-area">
          {mode === "choice" ? (
            <div className="choice-actions">
              <button className="enter-button" onClick={() => setMode("login")}>
                <span>ورود به کافه</span><span className="button-arrow">←</span>
              </button>
              <button className="register-link" onClick={() => setMode("register")}>ثبت کافه جدید</button>
            </div>
          ) : (
            <form className="entry-form" onSubmit={submit}>
              <div className="form-heading">
                <button className="back-link" type="button" onClick={() => { setMode("choice"); setNotice(""); }}>بازگشت</button>
                <span>{isRegister ? "ثبت کافه" : "ورود راوی"}</span>
              </div>
              {isRegister && (
                <>
                  <label htmlFor="cafeName">نام کافه</label>
                  <input id="cafeName" value={form.cafeName} onChange={(e) => update("cafeName", e.target.value)} required />
                </>
              )}
              <label htmlFor="email">ایمیل</label>
              <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              {isRegister && (
                <>
                  <label htmlFor="ownerPhone">شماره شخصی صاحب کافه</label>
                  <input id="ownerPhone" type="tel" inputMode="tel" autoComplete="tel" value={form.ownerPhone} onChange={(e) => update("ownerPhone", e.target.value)} required />
                  <label htmlFor="publicPhone">شماره عمومی کافه</label>
                  <input id="publicPhone" type="tel" inputMode="tel" value={form.publicPhone} onChange={(e) => update("publicPhone", e.target.value)} required />
                  <div className="field-pair">
                    <div><label htmlFor="province">استان</label><input id="province" value={form.province} onChange={(e) => update("province", e.target.value)} required /></div>
                    <div><label htmlFor="city">شهر</label><input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} required /></div>
                  </div>
                  <label htmlFor="address">آدرس دقیق کافه</label>
                  <textarea id="address" rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} required />
                  <label htmlFor="managerName">نام دقیق گرداننده</label>
                  <input id="managerName" value={form.managerName} onChange={(e) => update("managerName", e.target.value)} required />
                </>
              )}
              <label htmlFor="password">رمز عبور</label>
              <input id="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={(e) => update("password", e.target.value)} required />
              {isRegister && (
                <>
                  <label htmlFor="confirmPassword">تکرار رمز عبور</label>
                  <input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
                </>
              )}
              <button className="enter-button submit-button" type="submit" disabled={busy}>
                <span>{busy ? "در حال پردازش..." : isRegister ? "ثبت کافه" : "ورود به کافه"}</span><span className="button-arrow">←</span>
              </button>
              {notice && <p className="notice" role="status">{notice}</p>}
              <button className="switch-mode" type="button" onClick={() => { setMode(isRegister ? "login" : "register"); setNotice(""); }}>
                {isRegister ? "قبلاً کافه ثبت کرده‌ای؟ ورود به کافه" : "کافه‌ای ثبت نکرده‌ای؟ ثبت کافه جدید"}
              </button>
            </form>
          )}
          <p className="entry-note">ورود ویژه‌ی گردانندگان بازی</p>
        </div>
        <div className="poster-footer">
          <span>PRIVATE SALON</span><span>BELGIUM · EUROPE</span><span>1945</span>
        </div>
      </section>
      <footer className="site-footer">کافه کاندیدا · محفل راویان</footer>
    </main>
  );
}
