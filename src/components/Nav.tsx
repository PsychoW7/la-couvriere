"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { LocaleToggle } from "./LocaleToggle";
import { CloseIcon, MenuIcon } from "./Icons";

const links = [
  { key: "gite", href: "/#gite" },
  { key: "availability", href: "/#dispo" },
  { key: "hauts", href: "/#hauts" },
  { key: "infos", href: "/#infos" },
] as const;

export function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = usePathname() === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        !isHome
          ? "bg-deep shadow-[0_1px_0_rgb(255_255_255/0.08)]"
          : scrolled || open
            ? "bg-deep/90 shadow-[0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-md"
            : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label={t("home")} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("primary")}>
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="rounded-pill px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/8 hover:text-white"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleToggle />
          <Link href="/#dispo" className="btn-coral !h-11 !px-5 !text-sm">
            {t("book")}
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-pill text-white hover:bg-white/10 lg:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/10 bg-deep lg:hidden"
      >
        <nav className="container-x flex flex-col gap-1 py-4" aria-label={t("primary")}>
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3.5 text-lg font-semibold text-white hover:bg-white/8"
            >
              {t(l.key)}
            </Link>
          ))}
          <div className="mt-3 flex items-center justify-between gap-3 px-2 pb-2">
            <LocaleToggle />
            <Link href="/#dispo" onClick={() => setOpen(false)} className="btn-coral flex-1">
              {t("book")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
