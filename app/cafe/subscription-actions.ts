"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitPaymentRequest(formData: FormData) {
  const planCode = String(formData.get("plan_code") || "");
  const receiptNumber = String(formData.get("receipt_number") || "").trim();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { error } = await supabase.rpc("submit_payment_request", {
    p_plan_code: planCode,
    p_receipt_number: receiptNumber,
  });
  if (error) throw new Error(error.message.includes("در انتظار") ? error.message : "ثبت درخواست پرداخت انجام نشد. شماره پیگیری را بررسی کن.");
  revalidatePath("/cafe/subscription");
  revalidatePath("/admin");
}

