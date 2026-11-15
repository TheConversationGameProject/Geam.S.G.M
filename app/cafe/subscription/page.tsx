import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { submitPaymentRequest } from "../subscription-actions";

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function money(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}

export default async function SubscriptionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const [{ data: plans, error: plansError }, { data: requests, error: requestsError }, { data: profile }] = await Promise.all([
    supabase.from("subscription_plans").select("code,name,duration_days,character_quota,price_toman").eq("is_active", true).order("sort_order"),
    supabase.from("payment_requests").select("id,plan_name,amount_toman,receipt_number,submitted_at,status,reviewed_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("trial_started_at,trial_ends_at").eq("id", user.id).maybeSingle(),
  ]);
  if (plansError || requestsError) return <main className="admin-shell"><section className="admin-panel"><h1>خرید اشتراک</h1><p>دریافت اطلاعات اشتراک ممکن نشد.</p></section></main>;
  const statuses: Record<string,string> = { pending: "در انتظار بررسی ادمین", approved: "تأیید شده", rejected: "رد شده" };
  return (
    <main className="admin-shell">
      <header className="admin-header"><div><span className="admin-kicker">CANDIDA CAFÉ / SUBSCRIPTION OFFICE</span><h1>خرید و تمدید اشتراک</h1></div><a className="admin-logout" href="/cafe">بازگشت</a></header>
      <section className="admin-panel">
        <h2>وضعیت هدیه آزمایشی</h2>
        <p>شروع: {date(profile?.trial_started_at)}</p>
        <p>پایان: {date(profile?.trial_ends_at)}</p>
        <p>اگر اشتراک فعلی یا هدیه آزمایشی فعال باشد، پلن جدید پس از پایان آن فعال می‌شود.</p>
      </section>
      <section className="admin-list">
        {(plans ?? []).map((plan: any) => (
          <article className="admin-cafe" key={plan.code}>
            <span className="admin-file">SUBSCRIPTION PLAN</span>
            <h2>{plan.name}</h2>
            <div className="admin-details">
              <p><span>مدت</span>{plan.duration_days.toLocaleString("fa-IR")} روز</p>
              <p><span>سهمیه ثبت شخصیت</span>{plan.character_quota === 0 ? "بدون دسترسی" : plan.character_quota.toLocaleString("fa-IR") + " شخصیت"}</p>
              <p><span>مبلغ</span>{money(plan.price_toman)}</p>
            </div>
            <form action={submitPaymentRequest} className="admin-toggle-form">
              <input type="hidden" name="plan_code" value={plan.code} />
              <label>شماره قبض / پیگیری واریز<input name="receipt_number" required minLength={3} maxLength={100} placeholder="شماره پیگیری بانکی" /></label>
              <button type="submit">ثبت درخواست تأیید پرداخت</button>
            </form>
          </article>
        ))}
      </section>
      <section className="admin-panel">
        <h2>اطلاعات واریز کارت‌به‌کارت</h2>
        <p><span>شماره کارت:</span> 6219861999152258</p>
        <p><span>دارنده کارت:</span> حمیدرضا معظمی</p>
        <p><span>بانک:</span> سامان (بلو بانک)</p>
        <p>پس از واریز، شماره پیگیری را در فرم پلن موردنظر ثبت کن. زمان ثبت درخواست به‌صورت خودکار توسط سرور ذخیره می‌شود. فعال‌سازی فقط پس از تأیید ادمین انجام خواهد شد.</p>
      </section>
      <section className="admin-list">
        <h2>درخواست‌های پرداخت من</h2>
        {(requests ?? []).length === 0 ? <p className="admin-empty">هنوز درخواستی ثبت نشده است.</p> : (requests ?? []).map((request: any) => (
          <article className="admin-cafe" key={request.id}>
            <h3>{request.plan_name}</h3>
            <p>مبلغ: {money(request.amount_toman)}</p>
            <p>شماره پیگیری: {request.receipt_number}</p>
            <p>زمان ثبت: {date(request.submitted_at)}</p>
            <p>وضعیت: {statuses[request.status] ?? request.status}</p>
            <p>زمان بررسی: {date(request.reviewed_at)}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
