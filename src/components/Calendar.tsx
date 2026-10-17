"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  getDayState,
  getMonthGrid,
  type DateRange,
  type DayState,
  type Selection,
} from "@/lib/calendar";
import { monthOf, parseISO, shiftMonth, type ISODate } from "@/lib/dates";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface Props {
  booked: DateRange[];
  selection: Selection;
  onSelect: (date: ISODate) => void;
  today: ISODate;
  minNights: number;
}

const stateClass: Record<DayState, string> = {
  free: "bg-white text-deep ring-1 ring-deep/8 hover:bg-leaf-light/30 hover:ring-leaf",
  booked: "bg-deep/8 text-muted/70 line-through decoration-muted/60 cursor-not-allowed",
  past: "text-muted/35 cursor-not-allowed",
  selected: "bg-coral text-white font-bold shadow-[0_6px_16px_-6px_rgb(217_71_31/0.7)]",
  range: "bg-leaf-light/35 text-deep",
};

const legend: { state: DayState; swatch: string }[] = [
  { state: "free", swatch: "bg-white ring-1 ring-deep/15" },
  { state: "booked", swatch: "bg-deep/10" },
  { state: "past", swatch: "bg-deep/5" },
  { state: "selected", swatch: "bg-coral" },
  { state: "range", swatch: "bg-leaf-light/40" },
];

export function Calendar({ booked, selection, onSelect, today, minNights }: Props) {
  const t = useTranslations("availability");
  const format = useFormatter();
  const [view, setView] = useState(() => monthOf(today));
  const ctx = { booked, minNights, today };
  const months = [view, shiftMonth(view.year, view.month, 1)];
  const todayMonth = monthOf(today);
  const canGoBack =
    view.year > todayMonth.year ||
    (view.year === todayMonth.year && view.month > todayMonth.month);
  const weekdays = t.raw("weekdays") as string[];

  return (
    <div>
      <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label={t("legendLabel")}>
        {legend.map(({ state, swatch }) => (
          <li key={state} className="flex items-center gap-2">
            <span className={`size-3.5 rounded-[5px] ${swatch}`} aria-hidden="true" />
            {t(`legend.${state}`)}
          </li>
        ))}
      </ul>

      <div className="card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-pill text-deep ring-1 ring-deep/10 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => setView((v) => shiftMonth(v.year, v.month, -1))}
            disabled={!canGoBack}
            aria-label={t("prevMonth")}
          >
            <ChevronLeftIcon />
          </button>
          <div className="grid flex-1 grid-cols-1 text-center lg:grid-cols-2">
            {months.map((m, i) => (
              <h3
                key={`${m.year}-${m.month}`}
                className={`font-display text-lg font-bold capitalize tracking-[-0.02em] text-deep ${
                  i === 1 ? "hidden lg:block" : ""
                }`}
              >
                {format.dateTime(new Date(Date.UTC(m.year, m.month, 1)), {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </h3>
            ))}
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-pill text-deep ring-1 ring-deep/10 transition-colors hover:bg-surface"
            onClick={() => setView((v) => shiftMonth(v.year, v.month, 1))}
            aria-label={t("nextMonth")}
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {months.map((m, i) => (
            <div
              key={`${m.year}-${m.month}`}
              className={i === 1 ? "hidden lg:block" : ""}
              role="grid"
              aria-label={format.dateTime(new Date(Date.UTC(m.year, m.month, 1)), {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            >
              <div role="row" className="mb-2 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                {weekdays.map((d) => (
                  <span key={d} role="columnheader">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getMonthGrid(m.year, m.month).flat().map((date, idx) => {
                  if (!date) return <span key={`e-${idx}`} aria-hidden="true" />;
                  const state = getDayState(date, selection, ctx);
                  const disabled = state === "past" || state === "booked";
                  const label = t(`dayLabel.${state}`, {
                    date: format.dateTime(parseISO(date), {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      timeZone: "UTC",
                    }),
                  });
                  return (
                    <button
                      key={date}
                      type="button"
                      role="gridcell"
                      disabled={disabled}
                      aria-disabled={disabled || undefined}
                      aria-selected={state === "selected"}
                      aria-label={label}
                      onClick={() => onSelect(date)}
                      className={`relative flex aspect-square w-full items-center justify-center rounded-xl text-sm font-medium transition-colors ${stateClass[state]}`}
                    >
                      {Number(date.slice(-2))}
                      {date === today && (
                        <span
                          className={`absolute bottom-1.5 size-1 rounded-full ${
                            state === "selected" ? "bg-white" : "bg-coral"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
