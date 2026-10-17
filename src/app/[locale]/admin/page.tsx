import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { gite } from "../../../../config/gite";
import { Logo } from "@/components/Logo";
import { LocaleToggle } from "@/components/LocaleToggle";
import { Link } from "@/i18n/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseISO, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/pricing";
import { supabaseAdmin, type BlockedDateRow, type BookingRow } from "@/lib/supabase";
import {
  blockDatesAction,
  loginAction,
  logoutAction,
  setBookingStatusAction,
  unblockDatesAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Admin · ${gite.name}`,
  robots: { index: false, follow: false },
};

const statusTone: Record<BookingRow["status"], string> = {
  pending: "bg-amber/20 text-[#7A4A12]",
  confirmed: "bg-leaf-light/30 text-forest",
  cancelled: "bg-deep/8 text-muted",
};

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; blockError?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error, blockError } = await searchParams;
  const t = await getTranslations("admin");
  const format = await getFormatter();
  const authed = await isAdminAuthenticated();

  const header = (
    <header className="bg-deep text-white">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link href="/" aria-label={gite.name}>
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleToggle />
          {authed && (
            <form action={logoutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn-ghost-light !h-10 !px-4 !text-sm">
                {t("logout")}
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );

  if (!authed) {
    return (
      <>
        {header}
        <main className="container-x flex min-h-[70svh] items-center justify-center py-16">
          <form action={loginAction} className="card w-full max-w-sm p-8">
            <input type="hidden" name="locale" value={locale} />
            <h1 className="text-2xl font-bold text-deep">{t("login.title")}</h1>
            <label htmlFor="password" className="label mt-6">
              {t("login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="field"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
            />
            {error && (
              <p id="login-error" role="alert" className="mt-2 text-sm text-coral-dark">
                {t("login.error")}
              </p>
            )}
            <button type="submit" className="btn-forest mt-6 w-full">
              {t("login.submit")}
            </button>
          </form>
        </main>
      </>
    );
  }

  const db = supabaseAdmin();
  const [bookingsRes, blockedRes] = await Promise.all([
    db.from("bookings").select("*").order("start_date", { ascending: false }).limit(200),
    db.from("blocked_dates").select("*").gte("end_date", todayISO()).order("start_date"),
  ]);
  if (bookingsRes.error) throw bookingsRes.error;
  if (blockedRes.error) throw blockedRes.error;
  const bookings = bookingsRes.data as BookingRow[];
  const blocked = blockedRes.data as BlockedDateRow[];

  const d = (iso: string) =>
    format.dateTime(parseISO(iso), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <>
      {header}
      <main className="container-x py-10">
        <h1 className="text-3xl font-extrabold text-deep">{t("title")}</h1>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="card overflow-hidden">
            <h2 className="px-6 pt-6 text-xl font-bold text-deep">{t("bookings.title")}</h2>
            {bookings.length === 0 ? (
              <p className="p-6 text-muted">{t("bookings.empty")}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3">{t("bookings.guest")}</th>
                      <th className="px-4 py-3">{t("bookings.dates")}</th>
                      <th className="px-4 py-3 text-right">{t("bookings.nights")}</th>
                      <th className="px-4 py-3 text-right">{t("bookings.total")}</th>
                      <th className="px-4 py-3 text-right">{t("bookings.deposit")}</th>
                      <th className="px-4 py-3">{t("bookings.status")}</th>
                      <th className="px-4 py-3">{t("bookings.created")}</th>
                      <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-deep/8">
                    {bookings.map((b) => (
                      <tr key={b.id} className="align-top">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-deep">{b.guest_name}</p>
                          <p className="text-muted"><a href={`mailto:${b.email}`} className="hover:underline">{b.email}</a></p>
                          <p className="text-muted">{b.phone}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-deep">
                          {d(b.start_date)} → {d(b.end_date)}
                        </td>
                        <td className="px-4 py-3 text-right text-deep">{b.nights}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-deep">{formatMoney(b.total_cents, locale)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-deep">{formatMoney(b.deposit_cents, locale)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-pill px-2.5 py-1 text-xs font-semibold ${statusTone[b.status]}`}>
                            {t(`bookings.statuses.${b.status}`)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {format.dateTime(new Date(b.created_at), { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {b.status !== "confirmed" && (
                              <form action={setBookingStatusAction}>
                                <input type="hidden" name="locale" value={locale} />
                                <input type="hidden" name="id" value={b.id} />
                                <input type="hidden" name="status" value="confirmed" />
                                <button type="submit" className="rounded-pill bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-deep">
                                  {t("bookings.confirm")}
                                </button>
                              </form>
                            )}
                            {b.status !== "cancelled" && (
                              <form action={setBookingStatusAction}>
                                <input type="hidden" name="locale" value={locale} />
                                <input type="hidden" name="id" value={b.id} />
                                <input type="hidden" name="status" value="cancelled" />
                                <button type="submit" className="rounded-pill bg-deep/8 px-3 py-1.5 text-xs font-semibold text-deep hover:bg-coral hover:text-white">
                                  {t("bookings.cancel")}
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <form action={blockDatesAction} className="card p-6">
              <input type="hidden" name="locale" value={locale} />
              <h2 className="text-xl font-bold text-deep">{t("blocked.title")}</h2>
              <p className="mt-2 text-sm text-muted">{t("blocked.text")}</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label htmlFor="start" className="label">{t("blocked.start")}</label>
                  <input id="start" name="start" type="date" required min={todayISO()} className="field" />
                </div>
                <div>
                  <label htmlFor="end" className="label">{t("blocked.end")}</label>
                  <input id="end" name="end" type="date" required min={todayISO()} className="field" />
                </div>
                <div>
                  <label htmlFor="reason" className="label">{t("blocked.reason")}</label>
                  <input id="reason" name="reason" type="text" maxLength={200} className="field" />
                </div>
              </div>
              {blockError && (
                <p role="alert" className="mt-3 text-sm text-coral-dark">{t("blocked.error")}</p>
              )}
              <button type="submit" className="btn-forest mt-5 w-full">{t("blocked.add")}</button>
            </form>

            <div className="card p-6">
              {blocked.length === 0 ? (
                <p className="text-sm text-muted">{t("blocked.empty")}</p>
              ) : (
                <ul className="divide-y divide-deep/8">
                  {blocked.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-semibold text-deep">{d(r.start_date)} → {d(r.end_date)}</p>
                        {r.reason && <p className="text-sm text-muted">{r.reason}</p>}
                      </div>
                      <form action={unblockDatesAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="rounded-pill bg-deep/8 px-3 py-1.5 text-xs font-semibold text-deep hover:bg-coral hover:text-white">
                          {t("blocked.remove")}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
