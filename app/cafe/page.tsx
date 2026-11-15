import { createSupabaseServerClient } from "@/lib/supabase/server";
import CafeWorkspace from "./cafe-workspace";
import SignOutForm from "@/app/auth/signout-form";

export default async function CafePage() {
  const supabase = await createSupabaseServerClient();
  const { data: accessData, error: accessError } = await supabase.rpc("get_my_access_status").maybeSingle();
  const access = accessData as {
    role?: string;
    trial_started_at?: string | null;
    trial_ends_at?: string | null;
    has_access?: boolean;
  } | null;

  if (accessError) {
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
          <p>مهلت آزمایشی به پایان رسیده یا شرایط دریافت آن برقرار نیست. برای ادامه فعالیت، اشتراک فعال لازم است.</p>
          <a className="quiet-button" href="/cafe/subscription">مشاهده و خرید اشتراک</a>
          <SignOutForm className="quiet-button" />
        </section>
      </main>
    );
  }

  return <CafeWorkspace gifted={Boolean(access.trial_ends_at && new Date(access.trial_ends_at).getTime() > Date.now())} trialEndsAt={access.trial_ends_at ?? null} />;
}
