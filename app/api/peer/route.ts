// app/api/peers/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://www.screener.in/api/company/6599230/peers/";
  const res = await fetch(url);
  const html = await res.text();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
export const dynamic = 'force-dynamic';