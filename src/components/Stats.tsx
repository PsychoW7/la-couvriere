import { useLocale, useTranslations } from "next-intl";
import { gite } from "../../config/gite";
import { formatMoney } from "@/lib/pricing";
import { BedIcon, PanoramaIcon, TagIcon, UsersIcon } from "./Icons";

export function Stats() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const items = [
    { icon: UsersIcon, value: t("guests", { count: gite.maxGuests }), label: t("guestsLabel") },
    { icon: BedIcon, value: t("rooms", { count: gite.bedrooms }), label: t("roomsLabel") },
    { icon: PanoramaIcon, value: t("view"), label: t("viewLabel") },
    {
      icon: TagIcon,
      value: t("price", { price: formatMoney(gite.pricePerNightCents, locale) }),
      label: t("priceLabel"),
    },
  ];

  return (
    <section className="bg-surface-2" aria-label="Chiffres clés">
      <div className="container-x grid grid-cols-2 divide-deep/10 py-6 lg:grid-cols-4 lg:divide-x">
        {items.map(({ icon: Icon, value, label }, i) => (
          <div
            key={value}
            className={`flex items-center gap-4 px-2 py-4 lg:justify-center lg:px-6 ${
              i % 2 === 1 ? "border-l border-deep/10 lg:border-l-0" : ""
            }`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-forest">
              <Icon width={22} height={22} />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold leading-tight tracking-[-0.02em] text-deep sm:text-2xl">
                {value}
              </p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
