import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  CarIcon,
  FlameIcon,
  KitchenIcon,
  LeafIcon,
  LinenIcon,
  PawIcon,
  WifiIcon,
} from "./Icons";

const cards = ["chalet", "terrasse", "jardin"] as const;
const amenities = [
  { key: "wifi", icon: WifiIcon },
  { key: "parking", icon: CarIcon },
  { key: "stove", icon: FlameIcon },
  { key: "kitchen", icon: KitchenIcon },
  { key: "linen", icon: LinenIcon },
  { key: "pets", icon: PawIcon },
] as const;

export function Gite() {
  const t = useTranslations("gite");
  return (
    <section id="gite" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest">
            <LeafIcon width={16} height={16} />
            {t("eyebrow")}
          </p>
          <h2 className="section-title mt-4 text-deep">{t("title")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{t("text")}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((key, i) => (
            <article key={key} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-surface">
                <Image
                  src={`/photos/${key}.svg`}
                  alt={t(`photoAlt.${key}`)}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-deep">{t(`cards.${key}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-muted">{t(`cards.${key}.text`)}</p>
              </div>
            </article>
          ))}
        </div>

        <h3 className="sr-only">{t("amenitiesTitle")}</h3>
        <ul className="mt-10 flex flex-wrap gap-2.5" aria-label={t("amenitiesTitle")}>
          {amenities.map(({ key, icon: Icon }) => (
            <li key={key} className="chip">
              <Icon width={18} height={18} className="text-forest" />
              {t(`amenities.${key}`)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
