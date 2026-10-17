import "server-only";
import { Resend } from "resend";
import { gite } from "../../config/gite";
import { parseISO } from "./dates";
import { formatMoney } from "./pricing";
import type { BookingRow } from "./supabase";

const copy = {
  fr: {
    subject: (name: string) => `Réservation confirmée — ${name}`,
    title: "C'est réservé !",
    intro: (first: string) =>
      `Bonjour ${first}, votre acompte a bien été reçu. Nous vous attendons dans les Hauts.`,
    arrival: "Arrivée",
    departure: "Départ",
    nights: (n: number) => `${n} ${n > 1 ? "nuits" : "nuit"}`,
    total: "Total du séjour",
    paid: "Acompte réglé",
    balance: "Solde à régler à l'arrivée",
    practical: "Infos pratiques",
    items: [
      `Arrivée à partir de ${gite.checkInTime}, départ avant ${gite.checkOutTime}.`,
      "Le code de la boîte à clés vous sera envoyé par SMS la veille.",
      `Annulation gratuite jusqu'à ${gite.freeCancellationDays} jours avant l'arrivée.`,
    ],
    reply: "Une question ? Répondez simplement à cet e-mail.",
    ref: "Référence",
  },
  en: {
    subject: (name: string) => `Booking confirmed — ${name}`,
    title: "You're booked!",
    intro: (first: string) =>
      `Hi ${first}, your deposit has been received. We look forward to welcoming you in the highlands.`,
    arrival: "Check-in",
    departure: "Check-out",
    nights: (n: number) => `${n} ${n > 1 ? "nights" : "night"}`,
    total: "Stay total",
    paid: "Deposit paid",
    balance: "Balance due on arrival",
    practical: "Practical info",
    items: [
      `Check-in from ${gite.checkInTime}, check-out before ${gite.checkOutTime}.`,
      "The key-box code will be sent by SMS the day before.",
      `Free cancellation up to ${gite.freeCancellationDays} days before arrival.`,
    ],
    reply: "Any question? Just reply to this email.",
    ref: "Reference",
  },
} as const;

function fmtDate(iso: string, locale: "fr" | "en") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseISO(iso));
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function renderConfirmationEmail(b: BookingRow) {
  const locale: "fr" | "en" = b.locale === "en" ? "en" : "fr";
  const c = copy[locale];
  const first = escapeHtml(b.guest_name.split(" ")[0] ?? b.guest_name);
  const balance = b.total_cents - b.deposit_cents;
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:8px 0;color:#4B5E55">${label}</td><td style="padding:8px 0;text-align:right;font-weight:${strong ? 700 : 600};color:#0E2A20">${value}</td></tr>`;

  const html = `<!doctype html><html lang="${locale}"><body style="margin:0;background:#F4F7F3;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0E2A20">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#0E2A20;border-radius:24px;padding:32px;color:#fff">
    <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#F2A65A;font-weight:700">${escapeHtml(gite.name)} · ${escapeHtml(gite.location)}</p>
    <h1 style="margin:12px 0 0;font-size:28px;line-height:1.1;letter-spacing:-.02em">${c.title}</h1>
    <p style="margin:16px 0 0;color:rgba(255,255,255,.8);line-height:1.5">${c.intro(first)}</p>
  </div>
  <div style="background:#fff;border-radius:24px;padding:28px 32px;margin-top:16px">
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${row(c.arrival, fmtDate(b.start_date, locale))}
      ${row(c.departure, fmtDate(b.end_date, locale))}
      ${row(c.nights(b.nights), "")}
      <tr><td colspan="2" style="border-top:1px solid #E3EBE5;padding:0"></td></tr>
      ${row(c.total, formatMoney(b.total_cents, locale))}
      ${row(c.paid, formatMoney(b.deposit_cents, locale), true)}
      ${row(c.balance, formatMoney(balance, locale), true)}
    </table>
    <p style="margin:16px 0 0;font-size:12px;color:#4B5E55">${c.ref} : ${b.id}</p>
  </div>
  <div style="background:#E8F0EA;border-radius:24px;padding:24px 32px;margin-top:16px">
    <h2 style="margin:0;font-size:16px">${c.practical}</h2>
    <ul style="margin:12px 0 0;padding-left:18px;color:#4B5E55;line-height:1.6">${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>
  </div>
  <p style="margin:24px 0 0;text-align:center;font-size:13px;color:#4B5E55">${c.reply}<br>${escapeHtml(gite.contact.addressLine1)}, ${escapeHtml(gite.contact.addressLine2)} · ${escapeHtml(gite.contact.phone)}</p>
</div></body></html>`;

  const text = [
    c.title,
    "",
    c.intro(b.guest_name.split(" ")[0] ?? b.guest_name),
    "",
    `${c.arrival}: ${fmtDate(b.start_date, locale)}`,
    `${c.departure}: ${fmtDate(b.end_date, locale)} (${c.nights(b.nights)})`,
    `${c.total}: ${formatMoney(b.total_cents, locale)}`,
    `${c.paid}: ${formatMoney(b.deposit_cents, locale)}`,
    `${c.balance}: ${formatMoney(balance, locale)}`,
    "",
    ...c.items.map((i) => `- ${i}`),
    "",
    `${c.ref}: ${b.id}`,
  ].join("\n");

  return { subject: c.subject(gite.name), html, text };
}

export async function sendConfirmationEmail(booking: BookingRow): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY / RESEND_FROM manquants : e-mail non envoyé.");
    return;
  }
  const resend = new Resend(apiKey);
  const { subject, html, text } = renderConfirmationEmail(booking);
  const owner = process.env.OWNER_NOTIFICATION_EMAIL;

  const { error } = await resend.emails.send({
    from,
    to: booking.email,
    ...(owner ? { bcc: owner } : {}),
    replyTo: gite.contact.email,
    subject,
    html,
    text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
