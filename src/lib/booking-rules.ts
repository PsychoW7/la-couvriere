import { gite } from "../../config/gite";
import type { CalendarContext, DateRange } from "./calendar";
import { shiftMonth, toISO, todayISO, type ISODate } from "./dates";

/** Dernier jour de départ acceptable : fin du mois situé à `bookingHorizonMonths` mois. */
export function bookingHorizonEnd(today: ISODate = todayISO()): ISODate {
  const [y, m] = today.split("-").map(Number);
  const { year, month } = shiftMonth(y, m - 1, gite.bookingHorizonMonths + 1);
  return toISO(new Date(Date.UTC(year, month, 0)));
}

export function bookingContext(booked: DateRange[], today: ISODate = todayISO()): CalendarContext {
  return {
    booked,
    today,
    minNights: gite.minNights,
    maxNights: gite.maxNights,
    lastDate: bookingHorizonEnd(today),
  };
}
