import "server-only";
import { sendConfirmationEmail } from "./email";
import { stripe } from "./stripe";
import { supabaseAdmin, type BookingRow } from "./supabase";

export async function getBookingBySession(sessionId: string): Promise<BookingRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle<BookingRow>();
  if (error) throw error;
  return data;
}

/**
 * Passe une réservation en "confirmed" et envoie l'e-mail. Idempotent :
 * un deuxième appel (webhook + page de confirmation) ne renvoie pas d'e-mail.
 */
export async function confirmBooking(sessionId: string): Promise<BookingRow | null> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("stripe_session_id", sessionId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle<BookingRow>();

  if (error) {
    // 23P01 = contrainte d'exclusion : les nuits ont été confirmées par une autre réservation
    // entre-temps. On annule et on rembourse l'acompte automatiquement.
    if (error.code === "23P01") {
      console.error(`[bookings] Chevauchement pour la session ${sessionId} : annulation + remboursement.`);
      await refundAndCancel(sessionId);
      return getBookingBySession(sessionId);
    }
    throw error;
  }
  if (!data) return getBookingBySession(sessionId);

  try {
    await sendConfirmationEmail(data);
  } catch (err) {
    console.error("[bookings] Échec de l'envoi de l'e-mail :", err);
  }
  return data;
}

async function refundAndCancel(sessionId: string): Promise<void> {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (paymentIntent) {
    await stripe().refunds.create({ payment_intent: paymentIntent, reason: "duplicate" });
  }
  await cancelPendingBooking(sessionId);
}

export async function cancelPendingBooking(sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("stripe_session_id", sessionId)
    .eq("status", "pending");
  if (error) throw error;
}
