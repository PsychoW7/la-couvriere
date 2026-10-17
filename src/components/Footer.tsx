import { useTranslations } from "next-intl";
import { gite } from "../../config/gite";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { LocaleToggle } from "./LocaleToggle";
import { MailIcon, PhoneIcon, PinIcon } from "./Icons";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-deep text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm leading-relaxed text-white/70">{t("tagline")}</p>
          <div className="mt-6">
            <LocaleToggle />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
            {t("contact")}
          </h2>
          <address className="mt-4 space-y-3 not-italic text-white/80">
            <p className="flex gap-3">
              <PinIcon className="mt-0.5 shrink-0 text-white/50" />
              <span>
                {gite.contact.addressLine1}
                <br />
                {gite.contact.addressLine2}
              </span>
            </p>
            <p className="flex gap-3">
              <PhoneIcon className="mt-0.5 shrink-0 text-white/50" />
              <a href={`tel:${gite.contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {gite.contact.phone}
              </a>
            </p>
            <p className="flex gap-3">
              <MailIcon className="mt-0.5 shrink-0 text-white/50" />
              <a href={`mailto:${gite.contact.email}`} className="hover:text-white">
                {gite.contact.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber">
            {t("navigation")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-white/80">
            <li><Link href="/#gite" className="hover:text-white">{tn("gite")}</Link></li>
            <li><Link href="/#dispo" className="hover:text-white">{tn("availability")}</Link></li>
            <li><Link href="/#hauts" className="hover:text-white">{tn("hauts")}</Link></li>
            <li><Link href="/#infos" className="hover:text-white">{tn("infos")}</Link></li>
            <li><Link href="/mentions-legales" className="hover:text-white">{t("legal")}</Link></li>
            <li><Link href="/conditions" className="hover:text-white">{t("terms")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-sm text-white/50">{t("rights", { year })}</div>
      </div>
    </footer>
  );
}
