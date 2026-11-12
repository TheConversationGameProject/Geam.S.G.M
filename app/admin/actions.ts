"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setCafeActive(formData: FormData) {
  const cafeId = String(formData.get("cafe_id") || "");
  const activeValue = String(formData.get("is_active") || "");
  if (!/^[0-9a-f-]{36}$/i.test(cafeId) || !["true", "false"].includes(activeValue)) {
    throw new Error("درخواست نامعتبر است.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/cafe");

  const { error } = await supabase
    .from("cafes")
    .update({ is_active: activeValue === "true" })
    .eq("id", cafeId);

  if (error) throw new Error("تغییر وضعیت کافه انجام نشد.");
  revalidatePath("/admin");
  revalidatePath("/");
}
