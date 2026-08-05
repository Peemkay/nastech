import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileAction } from "@/lib/actions/account";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "My Profile" };

export default async function AccountProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">Profile</h1>
      <Card className="max-w-lg">
        <CardBody>
          <form action={updateProfileAction}>
            <div className="mb-4">
              <Label required>Full name</Label>
              <Input name="name" defaultValue={user.name} required />
            </div>
            <div className="mb-4">
              <Label>Email address</Label>
              <Input value={user.email} disabled />
              <p className="mt-1 text-xs text-muted">Contact support to change your email address.</p>
            </div>
            <div className="mb-5">
              <Label>Phone number</Label>
              <Input name="phone" defaultValue={user.phone ?? ""} placeholder="080X XXX XXXX" />
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
