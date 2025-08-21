// app/api/chart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { scrapeChartData } from "@/lib/chart_scraper"; // Adjust the path based on your setup

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const daysStr = searchParams.get("days");

  if (!companyId || !daysStr) {
    return NextResponse.json(
      { error: "Missing 'companyId' or 'days' query parameter." },
      { status: 400 },
    );
  }

  const days = parseInt(daysStr);

  try {
    const chartData = await scrapeChartData(companyId, days);
    return NextResponse.json({ chartData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch chart data." },
      { status: 500 },
    );
  }
}
