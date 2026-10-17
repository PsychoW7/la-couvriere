import { useTranslations } from "next-intl";
import { gite } from "../../config/gite";
import { CardIcon, ClockIcon, ShieldIcon } from "./Icons";

export function Infos() {
  const t = useTranslations("infos");
  const items = [
    { key: "checkin", icon: ClockIcon, vars: { time: gite.checkInTime } },
    { key: "checkout", icon: ClockIcon, vars: { time: gite.checkOutTime } },
    { key: "deposit", icon: CardIcon, vars: { percent: gite.depositPercent } },
    { key: "cancellation", icon: ShieldIcon, vars: { days: gite.freeCancellationDays } },
  ] as const;

  return (
    <section id="infos" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest">{t("eyebrow")}</p>
          <h2 className="section-title mt-4 text-deep">{t("title")}</h2>
        </div>
        <dl className="mt-12 grid gap-5 sm:grid-cols-2">
          {items.map(({ key, icon: Icon, vars }) => (
            <div key={key} className="card flex gap-5 p-6 sm:p-7">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-forest">
                <Icon width={24} height={24} />
              </span>
              <div>
                <dt className="font-display text-lg font-bold tracking-[-0.02em] text-deep sm:text-xl">
                  {t(`items.${key}.title`, vars)}
                </dt>
                <dd className="mt-1.5 leading-relaxed text-muted">{t(`items.${key}.text`)}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
