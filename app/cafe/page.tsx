import { createSupabaseServerClient } from "@/lib/supabase/server";
import CafeWorkspace from "./cafe-workspace";
import SignOutForm from "@/app/auth/signout-form";

export default async function CafePage() {
  const supabase = await createSupabaseServerClient();
  const { data: gifted, error: giftError } = await supabase.rpc("claim_first_login_trial");
  const { data: accessData } = await supabase.rpc("get_my_access_status").maybeSingle();
  const access = accessData as {
    role?: string;
    trial_started_at?: string | null;
    trial_ends_at?: string | null;
    has_access?: boolean;
  } | null;

  if (giftError) {
    return (
      <main className="welcome-screen">
        <section className="access-locked">
          <div className="welcome-seal">C</div>
          <h1>بررسی ورود کامل نشد</h1>
          <p>وضعیت اشتراک قابل بررسی نیست. دوباره وارد شو یا با پشتیبانی تماس بگیر.</p>
          <SignOutForm className="quiet-button" />
        </section>
      </main>
    );
  }

  if (!access?.has_access) {
    return (
      <main className="welcome-screen">
        <div className="welcome-grain" aria-hidden="true" />
        <section className="access-locked">
          <div className="welcome-seal">C</div>
          <h1>دسترسی راوی غیرفعال است</h1>
          <p>هدیه یک‌ماهه قبلاً استفاده شده یا شرایط دریافت آن برقرار نیست. برای ادامه فعالیت، اشتراک فعال لازم است.</p>
          <SignOutForm className="quiet-button" />
        </section>
      </main>
    );
  }

  return <CafeWorkspace gifted={Boolean(gifted)} />;
}
