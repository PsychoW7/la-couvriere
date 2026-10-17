import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Gite } from "@/components/Gite";
import { Availability } from "@/components/Availability";
import { Hauts } from "@/components/Hauts";
import { Infos } from "@/components/Infos";
import { Footer } from "@/components/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Gite />
        <Availability />
        <Hauts />
        <Infos />
      </main>
      <Footer />
    </>
  );
}
