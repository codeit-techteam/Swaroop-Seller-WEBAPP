import { NextResponse } from "next/server";

import { getPublishedSnapshot } from "@/lib/cx-published-cache";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export function GET() {
  return NextResponse.json(
    { success: true, data: getPublishedSnapshot() },
    { headers: cors },
  );
}
