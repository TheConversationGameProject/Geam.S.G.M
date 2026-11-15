import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { submitPaymentRequest } from "../subscription-actions";
import SubscriptionFlow from "./subscription-flow";

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
  const statuses: Record<string,string> = { pending: "در انتظار بررسی ادمین", approved: "پرداخت تأیید شده", rejected: "درخواست رد شده" };
  const safePlans = (plans ?? []).map((plan: any) => ({
    code: String(plan.code), name: String(plan.name), durationDays: Number(plan.duration_days),
    characterQuota: Number(plan.character_quota), priceToman: Number(plan.price_toman),
  }));
  const safeRequests = (requests ?? []).map((request: any) => ({
    id: String(request.id), planName: String(request.plan_name), amountToman: Number(request.amount_toman),
    receiptNumber: String(request.receipt_number), submittedAt: String(request.submitted_at),
    status: String(request.status), reviewedAt: request.reviewed_at ? String(request.reviewed_at) : null,
  }));
  return (
    <main className="admin-shell">
      <header className="admin-header"><div><span className="admin-kicker">CANDIDA CAFÉ / SUBSCRIPTION OFFICE</span><h1>خرید و تمدید اشتراک</h1></div><a className="admin-logout" href="/cafe">بازگشت به میز فرماندهی</a></header>
      <section className="admin-panel">
        <h2>وضعیت اشتراک آزمایشی</h2>
        <p>شروع دوره: {date(profile?.trial_started_at)}</p>
        <p>پایان دوره: {date(profile?.trial_ends_at)}</p>
        <p>در صورت داشتن اعتبار آزمایشی یا اشتراک قبلی، دوره زمانی پلن خریداری‌شده پس از پایان اعتبار فعلی آغاز می‌شود.</p>
      </section>
      <SubscriptionFlow plans={safePlans} requests={safeRequests} statuses={statuses} submitAction={submitPaymentRequest} />
    </main>
  );
}
