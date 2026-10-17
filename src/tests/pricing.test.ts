import { describe, expect, it } from "vitest";
import { computeQuote, formatMoney } from "@/lib/pricing";

const cfg = { pricePerNightCents: 12000, cleaningFeeCents: 4000, depositPercent: 30 };

describe("computeQuote", () => {
  it("calcule total, acompte et solde", () => {
    const q = computeQuote(3, cfg);
    expect(q.accommodationCents).toBe(36000);
    expect(q.totalCents).toBe(40000);
    expect(q.depositCents).toBe(12000);
    expect(q.balanceCents).toBe(28000);
  });

  it("arrondit l'acompte au centime et garde total = acompte + solde", () => {
    const q = computeQuote(1, { ...cfg, pricePerNightCents: 12345, depositPercent: 33 });
    expect(q.totalCents).toBe(16345);
    expect(q.depositCents).toBe(Math.round(16345 * 0.33));
    expect(q.depositCents + q.balanceCents).toBe(q.totalCents);
  });
});

describe("formatMoney", () => {
  it("formate en euros selon la locale", () => {
    expect(formatMoney(12000, "fr").replace(/ | /g, " ")).toBe("120 €");
    expect(formatMoney(12050, "en")).toBe("€120.50");
  });
});
