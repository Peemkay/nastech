import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { adminAuth } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";
import { updateAdminProfileAction } from "@/lib/actions/account";
import { formatPhoneDisplay } from "@/lib/phone";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata: Metadata = { title: "My Profile" };

export default async function AdminProfilePage() {
  const session = await adminAuth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground">My Profile</h1>

      <Card className="max-w-lg">
        <CardHeader className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Account details</p>
          <Badge tone="brand">{user.role}</Badge>
        </CardHeader>
        <CardBody>
          <form action={updateAdminProfileAction}>
            <div className="mb-4">
              <Label required>Full name</Label>
              <Input name="name" defaultValue={user.name} required />
            </div>
            <div className="mb-4">
              <Label>Email address</Label>
              <Input value={user.email} disabled />
              <p className="mt-1 text-xs text-muted">This is your admin login — used only for the admin console, separate from any storefront account.</p>
            </div>
            {user.phone && (
              <div className="mb-5">
                <Label>Phone number</Label>
                <Input value={formatPhoneDisplay(user.phone)} disabled />
                {user.phoneVerified && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-green-700">
                    <ShieldCheck className="size-3.5" /> Verified
                  </p>
                )}
              </div>
            )}
            <Button type="submit">Save changes</Button>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-lg">
        <CardHeader><p className="text-sm font-semibold text-foreground">Change password</p></CardHeader>
        <CardBody>
          <ChangePasswordForm endpoint="/api/admin/account/password" />
        </CardBody>
      </Card>
    </div>
  );
}
