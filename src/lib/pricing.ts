import { gite } from "../../config/gite";

export interface Quote {
  nights: number;
  nightlyCents: number;
  accommodationCents: number;
  cleaningCents: number;
  totalCents: number;
  depositPercent: number;
  depositCents: number;
  balanceCents: number;
}

export interface PricingConfig {
  pricePerNightCents: number;
  cleaningFeeCents: number;
  depositPercent: number;
}

export function computeQuote(
  nights: number,
  cfg: PricingConfig = gite,
): Quote {
  const accommodationCents = nights * cfg.pricePerNightCents;
  const totalCents = accommodationCents + cfg.cleaningFeeCents;
  const depositCents = Math.round((totalCents * cfg.depositPercent) / 100);
  return {
    nights,
    nightlyCents: cfg.pricePerNightCents,
    accommodationCents,
    cleaningCents: cfg.cleaningFeeCents,
    totalCents,
    depositPercent: cfg.depositPercent,
    depositCents,
    balanceCents: totalCents - depositCents,
  };
}

export function formatMoney(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: gite.currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
