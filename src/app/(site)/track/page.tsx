"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function TrackLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <Container className="max-w-lg py-16">
      <SectionHeading
        align="center"
        eyebrow="Track"
        title="Track your order or pickup"
        subtitle="Enter the tracking code you received by email or on the confirmation page."
      />
      <Card>
        <CardBody>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) router.push(`/track/${code.trim().toUpperCase()}`);
            }}
          >
            <Label required>Tracking code</Label>
            <div className="flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. NAS-ORD-000123" />
              <Button type="submit" icon={<PackageSearch className="size-4" />}>
                Track
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted">Codes start with NAS-ORD- for purchases, NAS-SEL- for sell/trade-in requests, or NAS-REP- for repairs.</p>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}
