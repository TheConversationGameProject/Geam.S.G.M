"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Mode = "choice" | "login" | "register" | "search";
type Cafe = {
  cafe_name: string;
  public_phone: string;
  province: string;
  city: string;
  address: string;
  manager_name: string;
};
type CafeLocation = { province: string; city: string };

const emptyForm = {
  cafeName: "", email: "", ownerPhone: "", publicPhone: "",
  province: "", city: "", address: "", managerName: "",
  password: "", confirmPassword: "",
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("اتصال سامانه هنوز پیکربندی نشده است.");
  supabaseInstance = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return supabaseInstance;
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("choice");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [locations, setLocations] = useState<CafeLocation[]>([]);
  const [locationsBusy, setLocationsBusy] = useState(false);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchNotice, setSearchNotice] = useState("");
  const [searched, setSearched] = useState(false);

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (mode !== "search" || locations.length) return;
    let alive = true;
    setLocationsBusy(true);
    (async () => {
      try {
        const { data, error } = await getSupabase().rpc("get_active_cafe_locations");
        if (!alive) return;
        if (error) setSearchNotice("دریافت فهرست شهرها انجام نشد. دوباره تلاش کن.");
        else setLocations((data ?? []) as CafeLocation[]);
      } catch {
        if (alive) setSearchNotice("اتصال به فهرست کافه‌ها برقرار نشد.");
      } finally {
        if (alive) setLocationsBusy(false);
      }
    })();
    return () => { alive = false; };
  }, [mode, locations.length]);

  const provinces = useMemo(
    () => Array.from(new Set(locations.map((item) => item.province))).sort((a, b) => a.localeCompare(b, "fa")),
    [locations]
  );
  const cities = useMemo(
    () => Array.from(new Set(locations.filter((item) => item.province === province).map((item) => item.city))).sort((a, b) => a.localeCompare(b, "fa")),
    [locations, province]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (mode !== "login" && mode !== "register") return;
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
      const supabase = getSupabase();
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
        setNotice("درخواست ثبت کافه انجام شد. پیوند تأیید ارسال‌شده به ایمیلت را باز کن.");
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

  async function searchCafes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!province || !city) {
      setSearchNotice("استان و شهر را انتخاب کن.");
      return;
    }
    setSearchBusy(true);
    setSearchNotice("");
    setSearched(false);
    try {
      const { data, error } = await getSupabase().rpc("search_active_cafes", {
        p_province: province,
        p_city: city,
      });
      if (error) throw error;
      setCafes((data ?? []) as Cafe[]);
      setSearched(true);
    } catch {
      setSearchNotice("جستجوی کافه‌ها انجام نشد. دوباره تلاش کن.");
    } finally {
      setSearchBusy(false);
    }
  }

  function changeMode(next: Mode) {
    setMode(next);
    setNotice("");
    setSearchNotice("");
    setCafes([]);
    setSearched(false);
  }

  const isRegister = mode === "register";

  return (
    <main className="landing">
      <div className="atmosphere" aria-hidden="true">
        <div className="map-lines" />
        <div className="window-glow" />
        <div className="shadow-figure" />
      </div>
      <header className="topline">
        <span className="topline-mark">C.</span>
        <span className="topline-date">BELGIUM · WINTER 1945</span>
        <span className="topline-status"><i /> ورودی محرمانه</span>
      </header>

      <section className="scene">
        <div className="scene-topline"><span>ARCHIVE / 07</span><span>THE CANDIDA CAFÉ</span><span>CLASSIFIED</span></div>
        <div className="scene-content">
          <div className="seal" aria-hidden="true">
            <span className="seal-orbit orbit-one" />
            <span className="seal-orbit orbit-two" />
            <span className="seal-letter">C</span>
            <span className="seal-caption">CANDIDA</span>
          </div>
          <p className="eyebrow">در این شهر، هر در بسته رازی دارد</p>
          <h1>کافه <span>کاندیدا</span></h1>
          <div className="title-mark"><i /><span>✦</span><i /></div>
          <p className="intro">بلژیک، ۱۹۴۵ — پاتوقی دور از چشم‌ها؛<br />برای کسانی که بازی را از پشت پرده هدایت می‌کنند.</p>

          <div className="entry-area">
            {mode === "choice" && (
              <div className="main-actions">
                <button className="action action-primary" onClick={() => changeMode("login")}>
                  <span className="action-index">01</span><span className="action-label">ورود راوی<small>ورود به میز فرماندهی</small></span><span className="action-arrow">←</span>
                </button>
                <button className="action action-secondary" onClick={() => changeMode("search")}>
                  <span className="action-index">02</span><span className="action-label">جستجو برای بازی<small>پیدا کردن کافه‌های فعال در شهر شما</small></span><span className="action-arrow">←</span>
                </button>
                <button className="register-entry" onClick={() => changeMode("register")}>ثبت‌نام کافه <span>—</span> برای پیوستن به محفل</button>
              </div>
            )}

            {(mode === "login" || mode === "register") && (
              <form className="entry-form" onSubmit={submit}>
                <div className="form-heading">
                  <button className="back-link" type="button" onClick={() => changeMode("choice")}>بازگشت</button>
                  <span>{isRegister ? "ثبت‌نام کافه" : "ورود راوی"}</span>
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
                <button className="submit-button" type="submit" disabled={busy}>
                  <span>{busy ? "در حال پردازش..." : isRegister ? "ثبت کافه" : "ورود راوی"}</span><span>←</span>
                </button>
                {notice && <p className="notice" role="status">{notice}</p>}
                <button className="switch-mode" type="button" onClick={() => changeMode(isRegister ? "login" : "register")}>
                  {isRegister ? "قبلاً کافه ثبت کرده‌ای؟ ورود راوی" : "کافه‌ای ثبت نکرده‌ای؟ ثبت‌نام کافه"}
                </button>
              </form>
            )}

            {mode === "search" && (
              <div className="search-panel">
                <div className="form-heading">
                  <button className="back-link" type="button" onClick={() => changeMode("choice")}>بازگشت</button>
                  <span>ردیابی کافه‌های فعال</span>
                </div>
                <p className="search-intro">موقعیت را مشخص کن تا پاتوق‌هایی را که اکنون امکان میزبانی بازی دارند پیدا کنی.</p>
                <form className="search-form" onSubmit={searchCafes}>
                  <label htmlFor="searchProvince">استان</label>
                  <select id="searchProvince" value={province} onChange={(e) => { setProvince(e.target.value); setCity(""); setCafes([]); setSearched(false); }} disabled={locationsBusy}>
                    <option value="">{locationsBusy ? "در حال دریافت استان‌ها..." : "انتخاب استان"}</option>
                    {provinces.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label htmlFor="searchCity">شهر</label>
                  <select id="searchCity" value={city} onChange={(e) => { setCity(e.target.value); setCafes([]); setSearched(false); }} disabled={!province}>
                    <option value="">انتخاب شهر</option>
                    {cities.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <button className="submit-button" type="submit" disabled={searchBusy || !province || !city}>
                    <span>{searchBusy ? "در حال جستجو..." : "جستجوی کافه‌ها"}</span><span>←</span>
                  </button>
                </form>
                {searchNotice && <p className="notice" role="status">{searchNotice}</p>}
                {searched && (
                  <div className="results">
                    <div className="results-heading"><span>نتایج جستجو</span><span>{cafes.length} کافه</span></div>
                    {cafes.length ? cafes.map((cafe, index) => (
                      <article className="cafe-result" key={cafe.cafe_name + cafe.address + index}>
                        <div className="result-top"><span className="result-number">FILE {String(index + 1).padStart(2, "0")}</span><span className="active-mark"><i /> فعال</span></div>
                        <h3>{cafe.cafe_name}</h3>
                        <p>{cafe.address}</p>
                        <div className="result-meta"><span>{cafe.manager_name}</span><a href={"tel:" + cafe.public_phone}>{cafe.public_phone}</a></div>
                      </article>
                    )) : <p className="empty-results">در این شهر کافه فعالی ثبت نشده است.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="scene-bottomline"><span>KEEP YOUR VOICE LOW</span><span>BRUSSELS · 50°50' N</span><span>1945</span></div>
      </section>
      <footer className="site-footer">هر بازی، داستانی دارد. هر کافه، رازی.</footer>
    </main>
  );
}
