"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function reviewPaymentRequest(formData: FormData) {
  const requestId = String(formData.get("request_id") || "");
  const decision = String(formData.get("decision") || "");
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !["approved", "rejected"].includes(decision)) {
    throw new Error("درخواست نامعتبر است.");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { error } = await supabase.rpc("review_payment_request", {
    p_request_id: requestId,
    p_decision: decision,
  });
  if (error) throw new Error("بررسی درخواست پرداخت انجام نشد: " + error.message);
  revalidatePath("/admin");
  revalidatePath("/cafe/subscription");
  revalidatePath("/cafe");
}

