import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CafePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: access } = await supabase.rpc("get_my_access_status").maybeSingle();
  const allowed = Boolean(access?.has_access);

  return (
    <main className="cafe-shell">
      <header className="cafe-head"><span className="mini-seal">C</span><span>CAFÉ CANDIDA · BERLIN 1945</span></header>
      <section className="cafe-card">
        <p className="cafe-kicker">محفل راویان</p>
        <h1>به کافه کاندیدا خوش آمدی</h1>
        <div className="cafe-divider">✦</div>
        <p className="cafe-copy">{allowed ? "جایگاه راوی برای حساب تو فعال است." : "دوره‌ی دسترسی این حساب به پایان رسیده است. برای ادامه‌ی فعالیت به اشتراک فعال نیاز داری."}</p>
        {allowed ? (
          <div className="cafe-access"><span className="access-dot" /> دسترسی راوی فعال</div>
        ) : (
          <div className="locked-note">ورود به جایگاه راوی تا فعال‌شدن اشتراک بسته است.</div>
        )}
        <form action="/auth/signout" method="post"><button className="quiet-button">خروج از حساب</button></form>
        <p className="account-line">حساب: {user.email}</p>
      </section>
      <footer className="cafe-bottom"><Link href="/">بازگشت به ورودی کافه</Link></footer>
    </main>
  );
}
