import { getTranslations, setRequestLocale } from "next-intl/server";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

interface Props {
  locale: string;
  namespace: "legal" | "terms";
  vars?: Record<string, string | number>;
}

export async function LegalPage({ locale, namespace, vars = {} }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations(namespace);
  const sections = t.raw("sections") as { title: string; text: string }[];

  return (
    <>
      <Nav />
      <main className="pt-[72px]">
        <div className="bg-deep py-14 text-white">
          <div className="container-x">
            <h1 className="section-title">{t("title")}</h1>
          </div>
        </div>
        <div className="container-x max-w-3xl py-14">
          {sections.map((_, i) => (
            <section key={i} className="mb-10">
              <h2 className="text-2xl font-bold text-deep">{t(`sections.${i}.title`)}</h2>
              <p className="mt-3 leading-relaxed text-muted">{t(`sections.${i}.text`, vars)}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
