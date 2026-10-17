"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/pricing";
import { LockIcon } from "./Icons";

interface Props {
  from: string;
  to: string;
  depositCents: number;
}

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "terms", string>>;

export function BookingForm({ from, to, depositCents }: Props) {
  const t = useTranslations("reserve");
  const locale = useLocale();
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      acceptTerms: fd.get("acceptTerms") === "on",
    };

    const next: Errors = {};
    if (!values.firstName) next.firstName = t("form.required");
    if (!values.lastName) next.lastName = t("form.required");
    if (!values.email) next.email = t("form.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = t("form.invalidEmail");
    if (!values.phone) next.phone = t("form.required");
    if (!values.acceptTerms) next.terms = t("form.acceptTerms");
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, from, to, locale }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (res.ok && json.url) {
        window.location.assign(json.url);
        return;
      }
      setServerError(
        json.error === "unavailable"
          ? t("errors.unavailable")
          : json.error === "invalid_dates"
            ? t("errors.invalidDates")
            : t("errors.generic"),
      );
    } catch {
      setServerError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  const field = (
    name: keyof Errors & string,
    label: string,
    type: string,
    autoComplete: string,
    extra?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={`field ${errors[name] ? "border-coral focus:border-coral focus:ring-coral/15" : ""}`}
        {...extra}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-coral-dark">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("firstName", t("form.firstName"), "text", "given-name")}
        {field("lastName", t("form.lastName"), "text", "family-name")}
        {field("email", t("form.email"), "email", "email", { inputMode: "email" })}
        {field("phone", t("form.phone"), "tel", "tel", { inputMode: "tel" })}
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-deep">
          <input
            type="checkbox"
            name="acceptTerms"
            className="mt-0.5 size-5 shrink-0 rounded-md border-deep/30 accent-forest"
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "terms-error" : undefined}
          />
          <span>
            {t.rich("form.terms", {
              link: (chunks) => (
                <Link href="/conditions" target="_blank" className="font-semibold text-forest underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="mt-1.5 text-sm text-coral-dark">
            {errors.terms}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="mt-6 rounded-2xl bg-coral-pale px-4 py-3 text-sm font-medium text-coral-dark">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn-coral mt-8 w-full" disabled={submitting}>
        <LockIcon width={18} height={18} />
        {submitting ? t("form.paying") : t("form.pay", { amount: formatMoney(depositCents, locale) })}
      </button>
      <p className="mt-4 text-center text-sm text-muted">{t("text")}</p>
    </form>
  );
}
