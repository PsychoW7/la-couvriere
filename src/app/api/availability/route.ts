import { NextResponse } from "next/server";
import { getUnavailableRanges } from "@/lib/availability";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ranges = await getUnavailableRanges();
    return NextResponse.json(
      { today: todayISO(), ranges },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[api/availability]", err);
    return NextResponse.json({ error: "availability_unavailable" }, { status: 500 });
  }
}
