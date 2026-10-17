import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { gite } from "../../../../config/gite";
import { Link } from "@/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { ReserveSummary } from "@/components/ReserveSummary";
import { BookingForm } from "@/components/BookingForm";
import { ChevronLeftIcon } from "@/components/Icons";
import { getUnavailableRanges } from "@/lib/availability";
import { bookingContext } from "@/lib/booking-rules";
import { validateRange } from "@/lib/calendar";
import { isISODate } from "@/lib/dates";
import { computeQuote } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reserve" });
  return { title: `${t("steps.deposit")} · ${gite.name}`, robots: { index: false } };
}

export default async function ReservePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string; cancelled?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { from, to, cancelled } = await searchParams;
  const t = await getTranslations("reserve");

  let error: string | null = null;
  let quote = null;

  if (!isISODate(from) || !isISODate(to)) {
    error = t("errors.invalidDates");
  } else {
    try {
      const booked = await getUnavailableRanges();
      const check = validateRange(from, to, bookingContext(booked));
      if (!check.ok) {
        error = check.reason === "booked" ? t("errors.unavailable") : t("errors.invalidDates");
      } else {
        quote = computeQuote(check.nights);
      }
    } catch {
      error = t("errors.generic");
    }
  }

  return (
    <>
      <Nav />
      <main className="pt-[72px]">
        <div className="bg-deep pb-24 pt-10 text-white sm:pt-14">
          <div className="container-x">
            <Link
              href="/#dispo"
              className="flex w-fit items-center gap-1 text-sm font-medium text-white/70 hover:text-white"
            >
              <ChevronLeftIcon width={16} height={16} />
              {t("backToDates")}
            </Link>
            <div className="mt-6 sm:inline-block">
              <StepIndicator current={2} tone="dark" />
            </div>
            <h1 className="section-title mt-8 max-w-2xl">{t("title")}</h1>
          </div>
        </div>

        <div className="container-x -mt-14 pb-20">
          {cancelled === "1" && (
            <div role="status" className="card mb-6 border border-amber/50 bg-[#FFF6EA] p-5">
              <p className="font-semibold text-deep">{t("cancelled.title")}</p>
              <p className="mt-1 text-sm text-muted">{t("cancelled.text")}</p>
            </div>
          )}

          {error || !quote || !from || !to ? (
            <div role="alert" className="card p-8">
              <p className="text-lg font-semibold text-coral-dark">{error ?? t("errors.generic")}</p>
              <Link href="/#dispo" className="btn-forest mt-6">
                <ChevronLeftIcon />
                {t("backToDates")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
              <ReserveSummary from={from} to={to} quote={quote} />
              <BookingForm from={from} to={to} depositCents={quote.depositCents} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
