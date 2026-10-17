import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroIllustration } from "./HeroIllustration";
import { ArrowRightIcon } from "./Icons";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="relative isolate overflow-hidden bg-deep text-white">
      <HeroIllustration title={t("illustrationAlt")} />
      <div className="container-x relative flex min-h-[100svh] flex-col justify-center pb-[46svh] pt-28 sm:pb-[44svh] lg:pb-[30svh] lg:pt-36">
        <div className="max-w-3xl">
          <p className="animate-rise eyebrow rounded-pill bg-white/10 px-4 py-2 text-amber">
            <span className="size-1.5 rounded-full bg-amber" aria-hidden="true" />
            {t("tag")}
          </p>
          <h1 className="animate-rise animate-rise-1 mt-6 text-[2.6rem] leading-[1.02] font-extrabold sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="animate-rise animate-rise-2 mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
            {t("text")}
          </p>
          <div className="animate-rise animate-rise-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/#dispo" className="btn-coral">
              {t("ctaPrimary")}
              <ArrowRightIcon />
            </Link>
            <Link href="/#gite" className="btn-ghost-light">
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
