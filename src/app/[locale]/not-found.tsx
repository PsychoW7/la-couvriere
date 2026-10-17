import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <>
      <Nav />
      <main className="bg-deep pt-[72px] text-white">
        <div className="container-x flex min-h-[70svh] flex-col items-start justify-center py-20">
          <p className="eyebrow text-amber">404</p>
          <h1 className="section-title mt-4">{t("title")}</h1>
          <p className="mt-4 text-lg text-white/75">{t("text")}</p>
          <Link href="/" className="btn-coral mt-8">
            {t("back")}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
