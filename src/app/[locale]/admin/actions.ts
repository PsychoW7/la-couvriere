"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  attemptLogin,
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
} from "@/lib/admin-auth";
import { isISODate } from "@/lib/dates";
import { supabaseAdmin, type BookingStatus } from "@/lib/supabase";
import { routing } from "@/i18n/routing";

function localeOf(fd: FormData): string {
  const l = fd.get("locale");
  return routing.locales.includes(l as never) ? (l as string) : routing.defaultLocale;
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error("unauthorized");
}

export async function loginAction(fd: FormData) {
  const locale = localeOf(fd);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  const result = await attemptLogin(password);
  if (result !== "ok") redirect(`/${locale}/admin?error=${result}`);
  await setAdminSession();
  redirect(`/${locale}/admin`);
}

export async function logoutAction(fd: FormData) {
  const locale = localeOf(fd);
  await clearAdminSession();
  redirect(`/${locale}/admin`);
}

export async function blockDatesAction(fd: FormData) {
  await requireAdmin();
  const locale = localeOf(fd);
  const start = fd.get("start");
  const end = fd.get("end");
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 200) || null;
  if (!isISODate(start) || !isISODate(end) || end <= start) {
    redirect(`/${locale}/admin?blockError=1`);
  }
  const { error } = await supabaseAdmin()
    .from("blocked_dates")
    .insert({ start_date: start, end_date: end, reason });
  if (error) throw error;
  revalidatePath(`/${locale}/admin`);
}

export async function unblockDatesAction(fd: FormData) {
  await requireAdmin();
  const locale = localeOf(fd);
  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const { error } = await supabaseAdmin().from("blocked_dates").delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/${locale}/admin`);
}

export async function setBookingStatusAction(fd: FormData) {
  await requireAdmin();
  const locale = localeOf(fd);
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "") as BookingStatus;
  if (!/^[0-9a-f-]{36}$/.test(id) || !["confirmed", "cancelled"].includes(status)) return;
  const { error } = await supabaseAdmin().from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath(`/${locale}/admin`);
}
