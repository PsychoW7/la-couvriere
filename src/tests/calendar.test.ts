import { describe, expect, it } from "vitest";
import {
  EMPTY_SELECTION,
  getDayState,
  getMonthGrid,
  hasBookedNight,
  isNightBooked,
  isSelectionComplete,
  selectDate,
  validateRange,
  type CalendarContext,
} from "@/lib/calendar";

const ctx: CalendarContext = {
  today: "2026-10-17",
  minNights: 2,
  booked: [
    { start: "2026-10-24", end: "2026-10-27" }, // nuits du 24, 25, 26
    { start: "2026-11-02", end: "2026-11-03" }, // nuit du 2
  ],
};

describe("isNightBooked / hasBookedNight", () => {
  it("marque les nuits dans [start, end) comme réservées", () => {
    expect(isNightBooked("2026-10-24", ctx.booked)).toBe(true);
    expect(isNightBooked("2026-10-26", ctx.booked)).toBe(true);
    expect(isNightBooked("2026-10-27", ctx.booked)).toBe(false);
    expect(isNightBooked("2026-10-23", ctx.booked)).toBe(false);
  });

  it("détecte un chevauchement partiel", () => {
    expect(hasBookedNight("2026-10-20", "2026-10-25", ctx.booked)).toBe(true);
    expect(hasBookedNight("2026-10-26", "2026-10-30", ctx.booked)).toBe(true);
    expect(hasBookedNight("2026-10-20", "2026-10-24", ctx.booked)).toBe(false);
    expect(hasBookedNight("2026-10-27", "2026-10-30", ctx.booked)).toBe(false);
  });

  it("autorise une arrivée le jour de départ d'une autre réservation", () => {
    expect(hasBookedNight("2026-10-27", "2026-10-29", ctx.booked)).toBe(false);
  });
});

describe("selectDate", () => {
  it("1er clic = arrivée", () => {
    expect(selectDate(EMPTY_SELECTION, "2026-10-20", ctx)).toEqual({
      start: "2026-10-20",
      end: null,
    });
  });

  it("2e clic = départ", () => {
    const s1 = selectDate(EMPTY_SELECTION, "2026-10-20", ctx);
    expect(selectDate(s1, "2026-10-23", ctx)).toEqual({
      start: "2026-10-20",
      end: "2026-10-23",
    });
  });

  it("3e clic repart de zéro", () => {
    const s = { start: "2026-10-20", end: "2026-10-23" };
    expect(selectDate(s, "2026-11-10", ctx)).toEqual({
      start: "2026-11-10",
      end: null,
    });
  });

  it("clic avant l'arrivée → nouvelle arrivée", () => {
    const s1 = { start: "2026-10-22", end: null };
    expect(selectDate(s1, "2026-10-20", ctx)).toEqual({
      start: "2026-10-20",
      end: null,
    });
  });

  it("clic sur l'arrivée elle-même → reste l'arrivée", () => {
    const s1 = { start: "2026-10-22", end: null };
    expect(selectDate(s1, "2026-10-22", ctx)).toEqual({
      start: "2026-10-22",
      end: null,
    });
  });

  it("repart de la nouvelle date si une nuit réservée est entre les deux", () => {
    const s1 = { start: "2026-10-22", end: null };
    expect(selectDate(s1, "2026-10-29", ctx)).toEqual({
      start: "2026-10-29",
      end: null,
    });
  });

  it("ignore les dates passées et réservées", () => {
    expect(selectDate(EMPTY_SELECTION, "2026-10-10", ctx)).toEqual(EMPTY_SELECTION);
    expect(selectDate(EMPTY_SELECTION, "2026-10-25", ctx)).toEqual(EMPTY_SELECTION);
    const s1 = { start: "2026-10-20", end: null };
    expect(selectDate(s1, "2026-10-25", ctx)).toEqual(s1);
  });

  it("étend au minimum de nuits quand le départ est trop proche", () => {
    const s1 = { start: "2026-10-20", end: null };
    expect(selectDate(s1, "2026-10-21", ctx)).toEqual({
      start: "2026-10-20",
      end: "2026-10-22",
    });
  });

  it("repart de la date si le minimum de nuits n'est pas disponible", () => {
    // arrivée le 23 : nuit du 24 réservée, donc 2 nuits impossibles
    const s1 = { start: "2026-10-23", end: null };
    expect(selectDate(s1, "2026-10-24", ctx)).toEqual(s1); // 24 réservé → ignoré
    expect(selectDate(s1, "2026-10-27", ctx)).toEqual({
      start: "2026-10-27",
      end: null,
    });
  });

  it("permet de partir le jour où commence une autre réservation", () => {
    const s1 = { start: "2026-10-22", end: null };
    // Le 24 est "booked" (nuit du 24) donc le clic est ignoré par défaut…
    expect(selectDate(s1, "2026-10-24", ctx)).toEqual(s1);
    // …mais la plage 22 → 24 est valide côté validation serveur.
    expect(validateRange("2026-10-22", "2026-10-24", ctx)).toEqual({ ok: true, nights: 2 });
  });
});

describe("getDayState", () => {
  const sel = { start: "2026-10-20", end: "2026-10-23" };
  it("priorise selected, puis past, booked, range, free", () => {
    expect(getDayState("2026-10-20", sel, ctx)).toBe("selected");
    expect(getDayState("2026-10-23", sel, ctx)).toBe("selected");
    expect(getDayState("2026-10-21", sel, ctx)).toBe("range");
    expect(getDayState("2026-10-10", sel, ctx)).toBe("past");
    expect(getDayState("2026-10-25", sel, ctx)).toBe("booked");
    expect(getDayState("2026-10-30", sel, ctx)).toBe("free");
  });
  it("aujourd'hui est libre, pas passé", () => {
    expect(getDayState("2026-10-17", EMPTY_SELECTION, ctx)).toBe("free");
  });
});

describe("isSelectionComplete", () => {
  it("exige arrivée, départ et le minimum de nuits", () => {
    expect(isSelectionComplete(EMPTY_SELECTION, 2)).toBe(false);
    expect(isSelectionComplete({ start: "2026-10-20", end: null }, 2)).toBe(false);
    expect(isSelectionComplete({ start: "2026-10-20", end: "2026-10-21" }, 2)).toBe(false);
    expect(isSelectionComplete({ start: "2026-10-20", end: "2026-10-22" }, 2)).toBe(true);
  });
});

describe("validateRange", () => {
  it("rejette passé, ordre, minimum et chevauchement", () => {
    expect(validateRange("2026-10-10", "2026-10-12", ctx)).toEqual({ ok: false, reason: "past" });
    expect(validateRange("2026-10-20", "2026-10-20", ctx)).toEqual({ ok: false, reason: "order" });
    expect(validateRange("2026-10-20", "2026-10-21", ctx)).toEqual({ ok: false, reason: "min" });
    expect(validateRange("2026-10-23", "2026-10-26", ctx)).toEqual({ ok: false, reason: "booked" });
    expect(validateRange("2026-10-20", "2026-10-24", ctx)).toEqual({ ok: true, nights: 4 });
  });
});

describe("getMonthGrid", () => {
  it("commence le lundi et complète par des null", () => {
    // Octobre 2026 : le 1er est un jeudi → 3 cases vides (lu, ma, me)
    const grid = getMonthGrid(2026, 9);
    expect(grid[0].slice(0, 3)).toEqual([null, null, null]);
    expect(grid[0][3]).toBe("2026-10-01");
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
    expect(grid.at(-1)?.filter(Boolean).at(-1)).toBe("2026-10-31");
  });

  it("un mois commençant un lundi n'a pas de case vide en tête", () => {
    // Juin 2026 commence un lundi
    const grid = getMonthGrid(2026, 5);
    expect(grid[0][0]).toBe("2026-06-01");
  });

  it("gère février bissextile", () => {
    expect(getMonthGrid(2028, 1).flat().filter(Boolean)).toHaveLength(29);
  });
});
