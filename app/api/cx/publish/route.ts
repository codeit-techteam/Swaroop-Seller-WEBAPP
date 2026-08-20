import { NextResponse } from "next/server";

import { setPublishedSnapshot } from "@/lib/cx-published-cache";
import type { PublishedMarketplaceSnapshot } from "@/types/marketplace-cms";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  const body = (await request.json()) as PublishedMarketplaceSnapshot;
  const saved = setPublishedSnapshot(body);
  return NextResponse.json({ success: true, data: saved }, { headers: cors });
}
