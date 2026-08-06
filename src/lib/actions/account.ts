"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
});

// Phone number is intentionally not editable here — it's a verified, unique
// login identifier (see PendingRegistration OTP flow). Changing it would
// need re-verification, which isn't built yet; contact support instead.
export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/account/profile");
}
