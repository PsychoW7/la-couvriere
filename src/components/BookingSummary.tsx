"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { gite } from "../../config/gite";
import { Link } from "@/i18n/navigation";
import type { Selection } from "@/lib/calendar";
import { parseISO } from "@/lib/dates";
import { formatMoney, type Quote } from "@/lib/pricing";
import { ArrowRightIcon, LockIcon } from "./Icons";

interface Props {
  selection: Selection;
  quote: Quote | null;
  onClear: () => void;
}

export function BookingSummary({ selection, quote, onClear }: Props) {
  const t = useTranslations("availability.summary");
  const locale = useLocale();
  const format = useFormatter();
  const ready = quote !== null && selection.start && selection.end;

  const fmtDate = (iso: string | null) =>
    iso
      ? format.dateTime(parseISO(iso), {
          weekday: "short",
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        })
      : t("notSelected");

  const nightly = formatMoney(gite.pricePerNightCents, locale);

  return (
    <aside
      className="rounded-card bg-deep p-6 text-white sm:p-8 lg:sticky lg:top-24"
      aria-live="polite"
      aria-label={t("title")}
    >
      <h3 className="text-xl font-bold">{t("title")}</h3>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        {(["arrival", "departure"] as const).map((k) => (
          <div key={k} className="rounded-2xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">{t(k)}</dt>
            <dd className="mt-1 font-display text-base font-bold capitalize tracking-[-0.02em] sm:text-lg">
              {fmtDate(k === "arrival" ? selection.start : selection.end)}
            </dd>
          </div>
        ))}
      </dl>

      <dl className="mt-6 space-y-3 text-white/80">
        <div className="flex justify-between gap-4">
          <dt>{t("nights", { count: quote?.nights ?? 0, price: nightly })}</dt>
          <dd className="font-semibold text-white">
            {quote ? formatMoney(quote.accommodationCents, locale) : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t("cleaning")}</dt>
          <dd className="font-semibold text-white">{formatMoney(gite.cleaningFeeCents, locale)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/12 pt-3">
          <dt className="font-semibold text-white">{t("total")}</dt>
          <dd className="font-semibold text-white">
            {quote ? formatMoney(quote.totalCents, locale) : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-2xl bg-white/6 p-5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white/70">
          {t("deposit", { percent: gite.depositPercent })}{" "}
          <span className="font-normal text-white/50">· {t("depositNow")}</span>
        </p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-[-0.02em] text-coral-pale sm:text-5xl">
          {quote ? formatMoney(quote.depositCents, locale) : "—"}
        </p>
      </div>

      {ready ? (
        <Link
          href={{ pathname: "/reserver", query: { from: selection.start!, to: selection.end! } }}
          className="btn-coral mt-6 w-full"
        >
          {t("pay")}
          <ArrowRightIcon />
        </Link>
      ) : (
        <button type="button" className="btn-coral mt-6 w-full" disabled title={t("payDisabled")}>
          {t("pay")}
        </button>
      )}

      {ready && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full text-center text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
        >
          {t("clear")}
        </button>
      )}

      <p className="mt-5 flex gap-2.5 text-sm leading-relaxed text-white/60">
        <LockIcon className="mt-0.5 shrink-0" width={16} height={16} />
        {t("secure", { days: gite.freeCancellationDays })}
      </p>
    </aside>
  );
}
