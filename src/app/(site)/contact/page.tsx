import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { Card, CardBody } from "@/components/ui/Card";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

const CHANNELS = [
  { icon: Phone, label: "Phone", value: "+234 800 000 0000", href: "tel:+2348000000000" },
  { icon: Mail, label: "Email", value: "support@nastech.ng", href: "mailto:support@nastech.ng" },
  { icon: MessageCircle, label: "WhatsApp", value: "+234 800 000 0000", href: "https://wa.me/2348000000000" },
  { icon: MapPin, label: "Head office", value: "Lagos, Nigeria", href: undefined },
];

export default function ContactPage() {
  return (
    <Container className="py-14">
      <SectionHeading align="center" eyebrow="Contact" title="We're here to help" subtitle="Reach out with questions about an order, a sell request, or anything else." />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
          {CHANNELS.map((c) => (
            <Card key={c.label}>
              <CardBody className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-semibold text-foreground hover:text-brand-600">{c.value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">{c.value}</p>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-foreground">Send us a message</p>
            <ContactForm />
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
