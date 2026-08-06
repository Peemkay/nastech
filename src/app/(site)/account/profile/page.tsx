import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileAction } from "@/lib/actions/account";
import { formatPhoneDisplay } from "@/lib/phone";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata: Metadata = { title: "My Profile" };

export default async function AccountProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground">Profile</h1>

      <Card className="max-w-lg">
        <CardHeader><p className="text-sm font-semibold text-foreground">Account details</p></CardHeader>
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
              <Input value={user.phone ? formatPhoneDisplay(user.phone) : "Not set"} disabled />
              {user.phoneVerified && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-700">
                  <ShieldCheck className="size-3.5" /> Verified
                </p>
              )}
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-lg">
        <CardHeader><p className="text-sm font-semibold text-foreground">Change password</p></CardHeader>
        <CardBody>
          <ChangePasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
