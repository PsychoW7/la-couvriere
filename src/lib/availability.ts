import "server-only";
import type { DateRange } from "./calendar";
import { hasBookedNight } from "./calendar";
import { todayISO } from "./dates";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase";

/** Une réservation "pending" bloque les dates le temps de la session Stripe Checkout. */
export const PENDING_HOLD_MINUTES = 30;

export async function getUnavailableRanges(): Promise<DateRange[]> {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Supabase non configuré.");
    }
    console.warn("[availability] Supabase non configuré : calendrier vide (dev).");
    return [];
  }

  const db = supabaseAdmin();
  const today = todayISO();
  const holdSince = new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000).toISOString();

  const [bookings, blocked] = await Promise.all([
    db
      .from("bookings")
      .select("start_date,end_date,status,created_at")
      .gte("end_date", today)
      .or(`status.eq.confirmed,and(status.eq.pending,created_at.gte.${holdSince})`),
    db.from("blocked_dates").select("start_date,end_date").gte("end_date", today),
  ]);

  if (bookings.error) throw bookings.error;
  if (blocked.error) throw blocked.error;

  const ranges: DateRange[] = [
    ...bookings.data.map((b) => ({ start: b.start_date, end: b.end_date })),
    ...blocked.data.map((b) => ({ start: b.start_date, end: b.end_date })),
  ];
  return ranges.sort((a, b) => a.start.localeCompare(b.start));
}

export async function isRangeAvailable(start: string, end: string): Promise<boolean> {
  const ranges = await getUnavailableRanges();
  return !hasBookedNight(start, end, ranges);
}
