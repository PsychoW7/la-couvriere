export const gite = {
  name: "La Couvrière",
  location: "Cirque de Cilaos",
  altitudeMeters: 1200,
  maxGuests: 4,
  bedrooms: 2,

  currency: "EUR",
  pricePerNightCents: 12000,
  cleaningFeeCents: 4000,
  depositPercent: 30,
  minNights: 2,

  checkInTime: "16:00",
  checkOutTime: "11:00",
  freeCancellationDays: 14,

  contact: {
    addressLine1: "12 chemin des Tamarins",
    addressLine2: "97413 Cilaos, La Réunion",
    phone: "+262 692 00 00 00",
    email: "contact@lacouvriere.re",
  },
} as const;

export type GiteConfig = typeof gite;
