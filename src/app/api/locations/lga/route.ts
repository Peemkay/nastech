import { NextRequest, NextResponse } from "next/server";
import { fetchLgasForState } from "@/lib/locations";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state");
  if (!state) return NextResponse.json({ error: "state is required" }, { status: 400 });

  const lgas = await fetchLgasForState(state);
  return NextResponse.json({ lgas });
}
