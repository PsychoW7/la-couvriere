"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

function Toggle({ tone }: { tone: "light" | "dark" }) {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const href = search ? `${pathname}?${search}` : pathname;

  const wrap =
    tone === "light"
      ? "border-white/20 bg-white/5 text-white/70"
      : "border-deep/15 bg-white text-muted";
  const active =
    tone === "light" ? "bg-white text-deep" : "bg-deep text-white";

  return (
    <nav
      aria-label={t("label")}
      className={`inline-flex items-center rounded-pill border p-1 text-xs font-bold ${wrap}`}
    >
      {routing.locales.map((l: Locale) => {
        const isActive = l === locale;
        return (
          <Link
            key={l}
            href={href}
            locale={l}
            hrefLang={l}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-pill px-3 py-1.5 transition-colors ${
              isActive ? active : "hover:text-current"
            }`}
          >
            {t(l)}
          </Link>
        );
      })}
    </nav>
  );
}

export function LocaleToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Suspense fallback={<span className="inline-block h-8 w-[88px]" />}>
      <Toggle tone={tone} />
    </Suspense>
  );
}
