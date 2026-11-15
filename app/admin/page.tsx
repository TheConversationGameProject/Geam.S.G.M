import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setCafeActive } from "./actions";
import { reviewPaymentRequest } from "./payment-actions";

type CafeRow = {
  id: string; owner_user_id: string; cafe_name: string; owner_email: string;
  public_phone: string; province: string; city: string; address: string;
  manager_name: string; is_active: boolean; created_at: string;
};
type ProfileRow = { id: string; role: string; trial_started_at: string | null; trial_ends_at: string | null };
type SubscriptionRow = {
  user_id: string; status: string; provider: string | null;
  current_period_start: string | null; current_period_end: string | null;
};
type PaymentRequestRow = {
  id: string; user_id: string; plan_name: string; amount_toman: number;
  receipt_number: string; submitted_at: string; status: string;
};

function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function money(value: number) { return new Intl.NumberFormat("fa-IR").format(value) + " تومان"; }
function subscriptionLabel(subscription?: SubscriptionRow) {
  if (!subscription) return "اشتراک پرداختی ثبت نشده";
  const labels: Record<string, string> = { active: "فعال", pending: "در انتظار پرداخت", past_due: "پرداخت معوق", canceled: "لغوشده", expired: "منقضی" };
  return labels[subscription.status] ?? subscription.status;
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: ownProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (ownProfile?.role !== "admin") redirect("/cafe");

  const [cafesResult, profilesResult, subscriptionsResult, requestsResult] = await Promise.all([
    supabase.from("cafes").select("id,owner_user_id,cafe_name,owner_email,public_phone,province,city,address,manager_name,is_active,created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,role,trial_started_at,trial_ends_at"),
    supabase.from("subscriptions").select("user_id,status,provider,current_period_start,current_period_end").order("created_at", { ascending: false }),
    supabase.from("payment_requests").select("id,user_id,plan_name,amount_toman,receipt_number,submitted_at,status").order("submitted_at", { ascending: true }),
  ]);
  const error = cafesResult.error || profilesResult.error || subscriptionsResult.error || requestsResult.error;
  if (error) return <main className="admin-shell"><section className="admin-panel"><h1>پنل مدیریت</h1><p>دریافت اطلاعات مدیریت کامل نشد.</p></section></main>;

  const cafes = (cafesResult.data ?? []) as CafeRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];
  const requests = (requestsResult.data ?? []) as PaymentRequestRow[];
  const profileById = new Map(profiles.map((item) => [item.id, item]));
  const cafeByOwner = new Map(cafes.map((item) => [item.owner_user_id, item]));
  const subscriptionByUser = new Map<string, SubscriptionRow>();
  for (const item of subscriptions) if (!subscriptionByUser.has(item.user_id)) subscriptionByUser.set(item.user_id, item);
  const pendingRequests = requests.filter((request) => request.status === "pending");

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><span className="admin-kicker">CANDIDA CAFÉ / CONTROL ROOM</span><h1>پنل مدیریت</h1></div>
        <form action="/auth/signout" method="post"><button className="admin-logout">خروج</button></form>
      </header>
      <section className="admin-summary">
        <div><span>تعداد کافه‌ها</span><strong>{cafes.length.toLocaleString("fa-IR")}</strong></div>
        <div><span>کافه‌های فعال</span><strong>{cafes.filter((c) => c.is_active).length.toLocaleString("fa-IR")}</strong></div>
        <div><span>درخواست پرداخت در انتظار</span><strong>{pendingRequests.length.toLocaleString("fa-IR")}</strong></div>
      </section>
      <section className="admin-list">
        <h2>درخواست‌های پرداخت واریزی</h2>
        {pendingRequests.length === 0 ? <p className="admin-empty">درخواست پرداختی در انتظار بررسی وجود ندارد.</p> : pendingRequests.map((request) => {
          const cafe = cafeByOwner.get(request.user_id);
          return (
            <article className="admin-cafe" key={request.id}>
              <div className="admin-cafe-top"><div><span className="admin-file">PAYMENT REVIEW</span><h2>{cafe?.cafe_name ?? "کافه ثبت‌نشده"}</h2></div><span className="admin-state is-off">در انتظار بررسی</span></div>
              <div className="admin-details">
                <p><span>گرداننده</span>{cafe?.manager_name ?? "—"}</p>
                <p><span>ایمیل</span>{cafe?.owner_email ?? "—"}</p>
                <p><span>پلن</span>{request.plan_name}</p>
                <p><span>مبلغ</span>{money(request.amount_toman)}</p>
                <p><span>شماره قبض / پیگیری</span>{request.receipt_number}</p>
                <p><span>زمان ثبت توسط راوی</span>{date(request.submitted_at)}</p>
              </div>
              <div className="admin-toggle-form">
                <form action={reviewPaymentRequest}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="decision" value="approved" /><button type="submit">تأیید پرداخت و فعال‌سازی پلن</button></form>
                <form action={reviewPaymentRequest}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="decision" value="rejected" /><button type="submit">رد درخواست</button></form>
              </div>
            </article>
          );
        })}
      </section>
      <section className="admin-list">
        <h2>پرونده کافه‌ها</h2>
        {cafes.length === 0 ? <p className="admin-empty">هنوز کافه‌ای ثبت نشده است.</p> : cafes.map((cafe) => {
          const profile = profileById.get(cafe.owner_user_id);
          const subscription = subscriptionByUser.get(cafe.owner_user_id);
          const trialActive = Boolean(profile?.trial_ends_at && new Date(profile.trial_ends_at).getTime() > Date.now());
          return (
            <article className="admin-cafe" key={cafe.id}>
              <div className="admin-cafe-top">
                <div><span className="admin-file">CAFE FILE</span><h2>{cafe.cafe_name}</h2></div>
                <span className={cafe.is_active ? "admin-state is-on" : "admin-state is-off"}>{cafe.is_active ? "فعال" : "غیرفعال"}</span>
              </div>
              <div className="admin-details">
                <p><span>گرداننده</span>{cafe.manager_name}</p><p><span>ایمیل</span>{cafe.owner_email}</p>
                <p><span>شماره عمومی</span>{cafe.public_phone}</p><p><span>موقعیت</span>{cafe.province}، {cafe.city}</p>
                <p className="admin-wide"><span>آدرس</span>{cafe.address}</p>
                <p><span>شروع هدیه</span>{date(profile?.trial_started_at)}</p><p><span>پایان هدیه</span>{date(profile?.trial_ends_at)}</p>
                <p><span>وضعیت هدیه</span>{trialActive ? "فعال" : profile?.trial_started_at ? "پایان‌یافته" : "تعلق‌نگرفته"}</p>
                <p><span>اشتراک پرداختی</span>{subscriptionLabel(subscription)}</p>
                <p><span>شروع دوره پرداختی</span>{date(subscription?.current_period_start)}</p>
                <p><span>پایان دوره / تمدید</span>{date(subscription?.current_period_end)}</p>
                <p><span>درگاه / ارائه‌دهنده</span>{subscription?.provider || "ثبت نشده"}</p>
              </div>
              <form action={setCafeActive} className="admin-toggle-form">
                <input type="hidden" name="cafe_id" value={cafe.id} /><input type="hidden" name="is_active" value={String(!cafe.is_active)} />
                <button type="submit">{cafe.is_active ? "غیرفعال کردن کافه" : "فعال کردن کافه"}</button>
              </form>
            </article>
          );
        })}
      </section>
    </main>
  );
}
