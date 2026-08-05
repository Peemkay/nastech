"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const parsed = schema.safeParse({ name: formData.get("name"), phone: formData.get("phone") || undefined });
  if (!parsed.success) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
  });

  revalidatePath("/account/profile");
}
