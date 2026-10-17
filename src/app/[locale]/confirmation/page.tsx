import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { gite } from "../../../../config/gite";
import { Link } from "@/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { CheckIcon } from "@/components/Icons";
import { confirmBooking, getBookingBySession } from "@/lib/bookings";
import { parseISO } from "@/lib/dates";
import { formatMoney } from "@/lib/pricing";
import { stripe } from "@/lib/stripe";
import type { BookingRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reserve" });
  return { title: `${t("steps.confirmation")} · ${gite.name}`, robots: { index: false } };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session_id } = await searchParams;
  const t = await getTranslations("confirmation");
  const format = await getFormatter();

  let booking: BookingRow | null = null;
  let paid = false;

  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid";
      // Filet de sécurité si le webhook n'est pas encore passé : idempotent.
      booking = paid ? await confirmBooking(session_id) : await getBookingBySession(session_id);
    } catch (err) {
      console.error("[confirmation]", err);
    }
  }

  const fmt = (iso: string) =>
    format.dateTime(parseISO(iso), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <>
      <Nav />
      <main className="pt-[72px]">
        <div className="bg-deep pb-24 pt-10 text-white sm:pt-14">
          <div className="container-x">
            <div className="sm:inline-block">
              <StepIndicator current={3} tone="dark" />
            </div>
            {booking ? (
              <>
                <p className="eyebrow mt-8 text-amber">{t("eyebrow")}</p>
                <h1 className="section-title mt-3 max-w-2xl">
                  {paid ? t("title") : t("pendingTitle")}
                </h1>
                <p className="mt-4 max-w-xl text-lg text-white/75">
                  {paid ? t("text", { email: booking.email }) : t("pendingText")}
                </p>
              </>
            ) : (
              <h1 className="section-title mt-8 max-w-2xl">{t("notFound")}</h1>
            )}
          </div>
        </div>

        <div className="container-x -mt-14 pb-20">
          {booking && (
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-pill bg-leaf-light/30 text-forest">
                    <CheckIcon strokeWidth={3} />
                  </span>
                  <p className="text-sm text-muted">
                    {t("reference")} <span className="font-mono text-deep">{booking.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("arrival")}</dt>
                    <dd className="mt-1 font-display font-bold capitalize text-deep">{fmt(booking.start_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("departure")}</dt>
                    <dd className="mt-1 font-display font-bold capitalize text-deep">{fmt(booking.end_date)}</dd>
                  </div>
                </dl>
                <dl className="mt-6 space-y-2 border-t border-deep/10 pt-5 text-muted">
                  <div className="flex justify-between"><dt>{t("nights", { count: booking.nights })}</dt><dd className="font-semibold text-deep">{formatMoney(booking.total_cents, locale)}</dd></div>
                  <div className="flex justify-between"><dt>{t("paid")}</dt><dd className="font-semibold text-forest">{formatMoney(booking.deposit_cents, locale)}</dd></div>
                  <div className="flex justify-between"><dt>{t("balance")}</dt><dd className="font-semibold text-deep">{formatMoney(booking.total_cents - booking.deposit_cents, locale)}</dd></div>
                </dl>
              </div>
              <div className="card bg-surface p-6 sm:p-8">
                <h2 className="text-xl font-bold text-deep">{t("next")}</h2>
                <ul className="mt-4 space-y-3 text-muted">
                  {(t.raw("nextItems") as string[]).map((_, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckIcon className="mt-1 shrink-0 text-forest" width={18} height={18} />
                      {t(`nextItems.${i}`, { checkIn: gite.checkInTime, checkOut: gite.checkOutTime })}
                    </li>
                  ))}
                </ul>
                <Link href="/" className="btn-forest mt-8">
                  {t("backHome")}
                </Link>
              </div>
            </div>
          )}
          {!booking && (
            <div className="card p-8">
              <Link href="/" className="btn-forest">
                {t("backHome")}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
