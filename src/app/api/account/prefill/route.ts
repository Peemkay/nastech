import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAccountPrefill } from "@/lib/account-prefill";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json(null);

  const prefill = await getAccountPrefill(session.user.id);
  return NextResponse.json(prefill);
}
