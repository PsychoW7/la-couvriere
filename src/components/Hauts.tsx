import { useTranslations } from "next-intl";
import { MountainIcon, PinIcon } from "./Icons";

const cards = ["piton", "thermes", "roche", "lentilles"] as const;

function CardArt({ variant }: { variant: number }) {
  const shapes = [
    "M0 80 L40 30 L70 55 L110 15 L150 50 L200 25 L200 100 L0 100Z",
    "M0 70 Q50 40 100 70 T200 70 L200 100 L0 100Z",
    "M0 90 L60 45 L90 60 L130 30 L200 80 L200 100 L0 100Z",
    "M0 85 L50 70 L100 85 L150 70 L200 85 L200 100 L0 100Z",
  ];
  const tones = ["#1F6F4A", "#2E8C5E", "#1F6F4A", "#5BBF7A"];
  return (
    <svg viewBox="0 0 200 100" className="h-24 w-full" aria-hidden="true" focusable="false">
      <circle cx={160 - variant * 25} cy="30" r="14" fill="#F2A65A" />
      <path d={shapes[variant]} fill={tones[variant]} />
      <path
        d={shapes[(variant + 1) % 4]}
        fill="#0E2A20"
        opacity="0.9"
        transform="translate(0 12)"
      />
    </svg>
  );
}

export function Hauts() {
  const t = useTranslations("hauts");
  return (
    <section id="hauts" className="scroll-mt-20 bg-deep py-20 text-white sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow text-amber">
            <MountainIcon width={16} height={16} />
            {t("eyebrow")}
          </p>
          <h2 className="section-title mt-4">{t("title")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/75">{t("text")}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((key, i) => (
            <article
              key={key}
              className="flex flex-col overflow-hidden rounded-card bg-deep-2 ring-1 ring-white/8 transition-transform duration-300 hover:-translate-y-1"
            >
              <CardArt variant={i} />
              <div className="flex flex-1 flex-col p-6">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber">
                  <PinIcon width={14} height={14} />
                  {t(`cards.${key}.distance`)}
                </p>
                <h3 className="mt-2 text-xl font-bold">{t(`cards.${key}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-white/70">{t(`cards.${key}.text`)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
