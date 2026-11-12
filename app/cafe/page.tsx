import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CafePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: access } = await supabase.rpc("get_my_access_status").maybeSingle();
  const allowed = Boolean(access?.has_access);

  return (
    <main className="welcome-screen">
      <div className="welcome-grain" aria-hidden="true" />
      {allowed ? (
        <section className="welcome-note">
          <div className="welcome-seal">C</div>
          <p>به کافه کاندیدا خوش آمدی.</p>
          <span>تیم همراه‌یار</span>
        </section>
      ) : (
        <section className="access-locked">
          <div className="welcome-seal">C</div>
          <h1>دسترسی راوی غیرفعال است</h1>
          <p>برای ادامه فعالیت، اشتراک فعال لازم است.</p>
          <form action="/auth/signout" method="post"><button className="quiet-button">خروج از حساب</button></form>
        </section>
      )}
    </main>
  );
}
