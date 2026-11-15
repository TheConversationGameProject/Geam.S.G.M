"use client";

import { useState } from "react";

type Plan = { code: string; name: string; durationDays: number; characterQuota: number; priceToman: number };
type PaymentRequest = { id: string; planName: string; amountToman: number; receiptNumber: string; submittedAt: string; status: string; reviewedAt: string | null };
type Props = { plans: Plan[]; requests: PaymentRequest[]; statuses: Record<string,string>; submitAction: (formData: FormData) => void | Promise<void> };

function money(value: number) { return new Intl.NumberFormat("fa-IR").format(value) + " تومان"; }
function date(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function SubscriptionFlow({ plans, requests, statuses, submitAction }: Props) {
  const [selected, setSelected] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const plan = plans.find((item) => item.code === selected);
  return (
    <>
      <section className="admin-panel">
        <h2>راهنمای خرید و فعال‌سازی</h2>
        <p>۱. پلن موردنظر را انتخاب کنید. ۲. مبلغ نمایش‌داده‌شده را به شماره کارت اعلام‌شده واریز کنید. ۳. پس از واریز، گزینه تأیید پرداخت را بزنید و شناسه قبض یا شماره پیگیری را ثبت کنید.</p>
        <p>درخواست شما پس از ارسال در پنل مدیریت بررسی می‌شود و اشتراک فقط پس از تأیید ادمین فعال خواهد شد.</p>
        <p><strong>نکته مهم درباره ثبت شخصیت:</strong> اگر پلن انتخابی شما امکان ثبت شخصیت جدید داشته باشد، سهمیه ثبت شخصیت بلافاصله پس از تأیید ادمین برای شما فعال می‌شود؛ حتی اگر شروع دوره زمانی اشتراک به دلیل باقی‌ماندن اعتبار قبلی یا آزمایشی به تاریخ بعد موکول شده باشد.</p>
        <p>مدت اعتبار خود اشتراک همچنان از پایان اعتبار قبلی محاسبه می‌شود؛ بنابراین زمان فعال‌شدن سهمیه ثبت شخصیت با زمان شروع دوره اشتراک یکسان نیست.</p>
      </section>

      <section className="admin-list">
        <h2>انتخاب پلن اشتراک</h2>
        {plans.map((item) => (
          <article className="admin-cafe" key={item.code}>
            <span className="admin-file">SUBSCRIPTION PLAN</span>
            <h2>{item.name}</h2>
            <div className="admin-details">
              <p><span>مدت اعتبار</span>{item.durationDays.toLocaleString("fa-IR")} روز</p>
              <p><span>سهمیه ثبت شخصیت</span>{item.characterQuota === 0 ? "بدون دسترسی" : item.characterQuota.toLocaleString("fa-IR") + " شخصیت"}</p>
              <p><span>قیمت</span>{money(item.priceToman)}</p>
            </div>
            <button type="button" className="admin-logout" aria-pressed={selected === item.code} onClick={() => { setSelected(item.code); setShowReceipt(false); }}>
              {selected === item.code ? "پلن انتخاب شده" : "انتخاب این اشتراک"}
            </button>
          </article>
        ))}
      </section>

      {plan && (
        <section className="admin-panel">
          <h2>اطلاعات پرداخت پلن {plan.name}</h2>
          <p>مبلغ قابل پرداخت: <strong>{money(plan.priceToman)}</strong></p>
          <p>شماره کارت: <strong dir="ltr">6219861999152258</strong></p>
          <p>به نام: حمیدرضا معظمی</p>
          <p>بانک: سامان (بلو بانک)</p>
          <p>پس از واریز دقیقاً مبلغ بالا، دکمه زیر را بزنید تا شناسه قبض یا شماره پیگیری را ثبت کنید.</p>
          {!showReceipt ? (
            <button type="button" className="admin-logout" onClick={() => setShowReceipt(true)}>واریز را انجام دادم؛ ثبت شناسه قبض</button>
          ) : (
            <form action={submitAction} className="admin-toggle-form">
              <input type="hidden" name="plan_code" value={plan.code} />
              <label>شناسه قبض / شماره پیگیری بانکی
                <input name="receipt_number" required minLength={3} maxLength={100} placeholder="شناسه قبض یا شماره پیگیری" />
              </label>
              <button type="submit">ارسال درخواست برای تأیید ادمین</button>
            </form>
          )}
        </section>
      )}

      <section className="admin-list">
        <h2>وضعیت درخواست‌های پرداخت</h2>
        {requests.length === 0 ? <p className="admin-empty">هنوز درخواستی ثبت نشده است.</p> : requests.map((request) => (
          <article className="admin-cafe" key={request.id}>
            <h3>{request.planName}</h3>
            <p>مبلغ: {money(request.amountToman)}</p>
            <p>شناسه قبض / پیگیری: {request.receiptNumber}</p>
            <p>زمان ثبت درخواست: {date(request.submittedAt)}</p>
            <p>وضعیت: {statuses[request.status] ?? request.status}</p>
            <p>زمان بررسی ادمین: {date(request.reviewedAt)}</p>
            {request.status === "pending" && <p>پس از بررسی ادمین، نتیجه همین‌جا نمایش داده می‌شود.</p>}
            {request.status === "approved" && <p>پرداخت تأیید شده است. سهمیه ثبت شخصیت این پلن از زمان تأیید ادمین فعال شده و مدت اشتراک طبق زمان‌بندی اعتبار قبلی آغاز می‌شود.</p>}
          </article>
        ))}
      </section>
    </>
  );
}
