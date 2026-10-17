import { addDays, diffDays, toISO, type ISODate } from "./dates";

/** Plage de nuits indisponibles : start inclus, end exclu (jour de départ). */
export interface DateRange {
  start: ISODate;
  end: ISODate;
}

export interface Selection {
  start: ISODate | null;
  end: ISODate | null;
}

export interface CalendarContext {
  booked: DateRange[];
  minNights: number;
  today: ISODate;
  /** Durée maximale d'un séjour (nuits). */
  maxNights?: number;
  /** Dernier jour de départ accepté (horizon de réservation). */
  lastDate?: ISODate;
}

export type DayState = "past" | "booked" | "free" | "selected" | "range";

export const EMPTY_SELECTION: Selection = { start: null, end: null };

export function isNightBooked(date: ISODate, booked: DateRange[]): boolean {
  return booked.some((r) => r.start <= date && date < r.end);
}

/** Vrai si au moins une nuit de [start, end) est réservée. */
export function hasBookedNight(
  start: ISODate,
  end: ISODate,
  booked: DateRange[],
): boolean {
  return booked.some((r) => r.start < end && start < r.end);
}

export function nightsBetween(start: ISODate, end: ISODate): number {
  return diffDays(start, end);
}

/**
 * Applique un clic sur `date` à la sélection courante.
 * - 1er clic : arrivée. 2e clic : départ.
 * - Clic avant ou sur l'arrivée, ou nuit réservée entre les deux : on repart de la nouvelle date.
 * - Moins de minNights : on étend automatiquement au minimum si possible, sinon on repart.
 */
export function selectDate(
  selection: Selection,
  date: ISODate,
  ctx: CalendarContext,
): Selection {
  if (date < ctx.today) return selection;
  if (isNightBooked(date, ctx.booked)) return selection;

  const { start, end } = selection;
  if (!start || end) return { start: date, end: null };
  if (date <= start) return { start: date, end: null };
  if (hasBookedNight(start, date, ctx.booked)) return { start: date, end: null };

  if (nightsBetween(start, date) < ctx.minNights) {
    const minEnd = addDays(start, ctx.minNights);
    if (!hasBookedNight(start, minEnd, ctx.booked)) return { start, end: minEnd };
    return { start: date, end: null };
  }

  return { start, end: date };
}

export function getDayState(
  date: ISODate,
  selection: Selection,
  ctx: CalendarContext,
): DayState {
  if (date === selection.start || date === selection.end) return "selected";
  if (date < ctx.today) return "past";
  if (isNightBooked(date, ctx.booked)) return "booked";
  if (selection.start && selection.end && selection.start < date && date < selection.end) {
    return "range";
  }
  return "free";
}

export function isSelectionComplete(
  selection: Selection,
  minNights: number,
): selection is { start: ISODate; end: ISODate } {
  return (
    !!selection.start &&
    !!selection.end &&
    nightsBetween(selection.start, selection.end) >= minNights
  );
}

/** Vérifie une plage venue de l'extérieur (URL, API) contre les règles métier. */
export function validateRange(
  start: ISODate,
  end: ISODate,
  ctx: CalendarContext,
):
  | { ok: true; nights: number }
  | { ok: false; reason: "past" | "order" | "min" | "max" | "horizon" | "booked" } {
  if (start < ctx.today) return { ok: false, reason: "past" };
  if (end <= start) return { ok: false, reason: "order" };
  const nights = nightsBetween(start, end);
  if (nights < ctx.minNights) return { ok: false, reason: "min" };
  if (ctx.maxNights !== undefined && nights > ctx.maxNights) return { ok: false, reason: "max" };
  if (ctx.lastDate !== undefined && end > ctx.lastDate) return { ok: false, reason: "horizon" };
  if (hasBookedNight(start, end, ctx.booked)) return { ok: false, reason: "booked" };
  return { ok: true, nights };
}

/**
 * Grille d'un mois, semaines commençant le lundi.
 * Chaque semaine est un tableau de 7 cases ; `null` pour les jours hors mois.
 */
export function getMonthGrid(year: number, month: number): (ISODate | null)[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // lundi = 0

  const cells: (ISODate | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISO(new Date(Date.UTC(year, month, d))));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
