"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { gite } from "../../config/gite";
import {
  EMPTY_SELECTION,
  isSelectionComplete,
  nightsBetween,
  selectDate,
  type DateRange,
  type Selection,
} from "@/lib/calendar";
import { todayISO, type ISODate } from "@/lib/dates";
import { computeQuote } from "@/lib/pricing";
import { Calendar } from "./Calendar";
import { BookingSummary } from "./BookingSummary";
import { CalendarIcon } from "./Icons";

interface AvailabilityPayload {
  today: ISODate;
  ranges: DateRange[];
}

export function Availability() {
  const t = useTranslations("availability");
  const [data, setData] = useState<AvailabilityPayload | null>(null);
  const [error, setError] = useState(false);
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/availability", { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json: AvailabilityPayload) => setData(json))
      .catch((e) => {
        if (e?.name !== "AbortError") setError(true);
      });
    return () => ctrl.abort();
  }, []);

  const today = data?.today ?? todayISO();
  const booked = useMemo(() => data?.ranges ?? [], [data]);
  const ctx = useMemo(
    () => ({ booked, minNights: gite.minNights, today }),
    [booked, today],
  );

  const complete = isSelectionComplete(selection, gite.minNights);
  const quote = complete
    ? computeQuote(nightsBetween(selection.start, selection.end))
    : null;

  const hint = !selection.start
    ? t("hint.pickArrival")
    : !selection.end
      ? t("hint.pickDeparture", { minNights: gite.minNights })
      : t("hint.ready");

  return (
    <section id="dispo" className="scroll-mt-20 bg-surface py-20 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest">
            <CalendarIcon width={16} height={16} />
            {t("eyebrow")}
          </p>
          <h2 className="section-title mt-4 text-deep">{t("title")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            {t("text", { minNights: gite.minNights })}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div>
            {error ? (
              <p role="alert" className="card border border-coral/30 p-6 text-coral-dark">
                {t("loadError")}
              </p>
            ) : (
              <>
                <Calendar
                  booked={booked}
                  selection={selection}
                  onSelect={(d) => setSelection((s) => selectDate(s, d, ctx))}
                  today={today}
                  minNights={gite.minNights}
                />
                <p className="mt-4 text-sm font-medium text-forest" aria-live="polite">
                  {data ? hint : t("loading")}
                </p>
              </>
            )}
          </div>
          <BookingSummary
            selection={selection}
            quote={quote}
            onClear={() => setSelection(EMPTY_SELECTION)}
          />
        </div>
      </div>
    </section>
  );
}
