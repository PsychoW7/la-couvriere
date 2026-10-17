import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { gite } from "../../../../config/gite";
import { LegalPage } from "@/components/LegalPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: `${t("title")} · ${gite.name}` };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage
      locale={locale}
      namespace="terms"
      vars={{
        percent: gite.depositPercent,
        days: gite.freeCancellationDays,
        checkIn: gite.checkInTime,
        checkOut: gite.checkOutTime,
        guests: gite.maxGuests,
      }}
    />
  );
}
