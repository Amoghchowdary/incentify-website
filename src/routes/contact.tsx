import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { PageHero } from "@/components/blocks";
import { LeadForm } from "@/components/lead-form";
import { fullAddress, site, whatsappLink } from "@/data/site";
import { Button } from "@/components/ui/button";
import { visuals } from "@/data/visuals";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...pageHead({
      title: "Contact Incentify | Hyderabad",
      description: `Contact Incentify Private Limited, Sanjeev Reddy Nagar, Hyderabad. Call ${site.phone}, email ${site.email} or send an enquiry for business, tax and compliance services.`,
      path: "/contact",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: site.legalName,
          image: `https://${site.domain}/favicon.png`,
          telephone: site.phone,
          email: site.email,
          url: `https://${site.domain}/contact`,
          address: {
            "@type": "PostalAddress",
            streetAddress: `${site.address.line1}, ${site.address.line2}`,
            addressLocality: site.address.city,
            postalCode: site.address.postalCode,
            addressRegion: site.address.state,
            addressCountry: "IN",
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:00",
            closes: "18:00",
          },
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapQuery)}`;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the Incentify team"
        description="Call, email or send an enquiry. We respond during business hours with the next step for your requirement."
        breadcrumbs={[{ label: "Contact" }]}
        visualSrc={visuals.teamSupport}
        visualAlt="Illustration of a professional business support team"
      />

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="space-y-4">
            <ContactCard icon={Phone} label="Phone" href={`tel:${site.phoneHref}`} value={site.phone} />
            <ContactCard icon={Mail} label="Email" href={`mailto:${site.email}`} value={site.email} />
            <ContactCard
              icon={MessageCircle}
              label="WhatsApp"
              href={whatsappLink}
              value="Start a WhatsApp chat"
              external
            />
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Office
                  </p>
                  <address className="mt-1 text-sm leading-relaxed not-italic">
                    {fullAddress}
                  </address>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <a href={directions} target="_blank" rel="noreferrer">
                      Get directions
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Business hours
                  </p>
                  <p className="mt-1 text-sm">{site.hours}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Sunday: closed</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Looking for a scheduled discussion?{" "}
              <Link to="/consultation" className="font-semibold text-primary hover:underline">
                Book a consultation
              </Link>
              .
            </p>
          </div>

          <div className="min-w-0 space-y-8">
            <LeadForm
              source="contact"
              title="Send an enquiry"
              description="Tell us about your requirement and how you would like to be contacted."
            />
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title="Incentify office location on Google Maps"
                src={mapSrc}
                width="100%"
                height="320"
                loading="lazy"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/40"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm font-semibold text-foreground">{value}</span>
      </span>
    </a>
  );
}
