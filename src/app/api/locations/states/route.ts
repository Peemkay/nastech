import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllStates, isDefaultEnabled } from "@/lib/locations";
import { formatStateName } from "@/lib/constants";

export async function GET() {
  const [states, regions] = await Promise.all([fetchAllStates(), prisma.serviceRegion.findMany()]);

  const enabledMap = new Map(regions.map((r) => [r.state, r.enabled]));

  const result = states
    .map((state) => ({
      state,
      label: formatStateName(state),
      enabled: enabledMap.has(state) ? enabledMap.get(state)! : isDefaultEnabled(state),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ states: result });
}
