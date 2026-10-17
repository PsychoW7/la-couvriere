import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { gite } from "../../config/gite";
import { parseISO } from "@/lib/dates";
import { formatMoney, type Quote } from "@/lib/pricing";

interface Props {
  from: string;
  to: string;
  quote: Quote;
}

export async function ReserveSummary({ from, to, quote }: Props) {
  const t = await getTranslations("reserve.summary");
  const locale = await getLocale();
  const format = await getFormatter();
  const fmt = (iso: string) =>
    format.dateTime(parseISO(iso), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  return (
    <aside className="rounded-card bg-deep p-6 text-white sm:p-8 lg:sticky lg:top-24">
      <h2 className="text-xl font-bold">{t("title")}</h2>
      <dl className="mt-6 space-y-4">
        {(
          [
            ["arrival", from],
            ["departure", to],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">{t(k)}</dt>
            <dd className="mt-1 font-display text-lg font-bold capitalize tracking-[-0.02em]">{fmt(v)}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-6 space-y-3 border-t border-white/12 pt-6 text-white/80">
        <div className="flex justify-between gap-4">
          <dt>{t("nights", { count: quote.nights, price: formatMoney(quote.nightlyCents, locale) })}</dt>
          <dd className="font-semibold text-white">{formatMoney(quote.accommodationCents, locale)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{t("cleaning")}</dt>
          <dd className="font-semibold text-white">{formatMoney(quote.cleaningCents, locale)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/12 pt-3">
          <dt className="font-semibold text-white">{t("total")}</dt>
          <dd className="font-semibold text-white">{formatMoney(quote.totalCents, locale)}</dd>
        </div>
      </dl>
      <div className="mt-6 rounded-2xl bg-white/6 p-5 ring-1 ring-white/10">
        <p className="text-sm font-semibold text-white/70">{t("deposit", { percent: gite.depositPercent })}</p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-[-0.02em] text-coral-pale">
          {formatMoney(quote.depositCents, locale)}
        </p>
        <p className="mt-3 flex justify-between text-sm text-white/60">
          <span>{t("balance")}</span>
          <span className="font-semibold text-white/80">{formatMoney(quote.balanceCents, locale)}</span>
        </p>
      </div>
    </aside>
  );
}
