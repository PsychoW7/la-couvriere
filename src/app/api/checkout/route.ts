import { NextResponse } from "next/server";
import { gite } from "../../../../config/gite";
import { getUnavailableRanges, PENDING_HOLD_MINUTES } from "@/lib/availability";
import { validateRange } from "@/lib/calendar";
import { isISODate, parseISO, todayISO } from "@/lib/dates";
import { computeQuote } from "@/lib/pricing";
import { siteUrl, stripe } from "@/lib/stripe";
import { supabaseAdmin, type BookingRow } from "@/lib/supabase";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  from?: unknown;
  to?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  locale?: unknown;
  acceptTerms?: unknown;
}

function str(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 && s.length <= max ? s : null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const from = body.from;
  const to = body.to;
  const firstName = str(body.firstName);
  const lastName = str(body.lastName);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const locale = routing.locales.includes(body.locale as never)
    ? (body.locale as string)
    : routing.defaultLocale;

  if (!isISODate(from) || !isISODate(to)) {
    return NextResponse.json({ error: "invalid_dates" }, { status: 400 });
  }
  if (!firstName || !lastName || !email || !phone || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  if (body.acceptTerms !== true) {
    return NextResponse.json({ error: "terms_required" }, { status: 400 });
  }

  try {
    const booked = await getUnavailableRanges();
    const check = validateRange(from, to, { booked, minNights: gite.minNights, today: todayISO() });
    if (!check.ok) {
      return NextResponse.json(
        { error: check.reason === "booked" ? "unavailable" : "invalid_dates" },
        { status: 409 },
      );
    }

    const quote = computeQuote(check.nights);
    const db = supabaseAdmin();
    const { data: booking, error: insertError } = await db
      .from("bookings")
      .insert({
        start_date: from,
        end_date: to,
        guest_name: `${firstName} ${lastName}`,
        email,
        phone,
        nights: quote.nights,
        total_cents: quote.totalCents,
        deposit_cents: quote.depositCents,
        status: "pending",
        locale,
      })
      .select("*")
      .single<BookingRow>();
    if (insertError || !booking) throw insertError ?? new Error("insert_failed");

    const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    const description =
      locale === "en"
        ? `Stay from ${dateFmt.format(parseISO(from))} to ${dateFmt.format(parseISO(to))} (${quote.nights} nights) · ${gite.depositPercent}% deposit`
        : `Séjour du ${dateFmt.format(parseISO(from))} au ${dateFmt.format(parseISO(to))} (${quote.nights} nuits) · acompte ${gite.depositPercent} %`;

    const base = siteUrl();
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: locale === "en" ? "en" : "fr",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: gite.currency.toLowerCase(),
            unit_amount: quote.depositCents,
            product_data: {
              name: locale === "en" ? `Deposit — ${gite.name}` : `Acompte — ${gite.name}`,
              description,
            },
          },
        },
      ],
      metadata: { booking_id: booking.id },
      payment_intent_data: { metadata: { booking_id: booking.id } },
      success_url: `${base}/${locale}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/${locale}/reserver?from=${from}&to=${to}&cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + PENDING_HOLD_MINUTES * 60,
    });

    const { error: updateError } = await db
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);
    if (updateError) throw updateError;

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/checkout]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
