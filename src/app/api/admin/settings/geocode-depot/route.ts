import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { geocodeAddress, DeliveryUnavailableError } from "@/lib/delivery/google-maps";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { address } = await req.json().catch(() => ({}));
  if (!address || typeof address !== "string") return NextResponse.json({ error: "address is required" }, { status: 400 });

  try {
    const coords = await geocodeAddress(address);
    return NextResponse.json(coords);
  } catch (e) {
    const message = e instanceof DeliveryUnavailableError ? e.message : "Could not locate that address";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
