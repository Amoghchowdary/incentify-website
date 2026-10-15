import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { PageHero, Disclaimer } from "@/components/blocks";
import { LeadForm } from "@/components/lead-form";
import { site, whatsappLink } from "@/data/site";
import { visuals } from "@/data/visuals";

export const Route = createFileRoute("/quote")({
  head: () =>
    pageHead({
      title: "Get a Quotation | Incentify",
      description:
        "Request a written quotation for business registration, GST, income tax, ROC compliance, accounting, payroll, finance or insurance assistance.",
      path: "/quote",
    }),
  component: QuotePage,
});

function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Request a quotation"
        title="Tell us what you need"
        description="Share your requirement and our team will respond with the applicable scope, document checklist and fees. There is no obligation to proceed."
        breadcrumbs={[{ label: "Get a Quote" }]}
        visualSrc={visuals.businessGrowth}
        visualAlt="Illustration of a business services plan and growth path"
      />

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <LeadForm source="quote" />

          <aside className="space-y-5">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-base font-bold">Prefer to talk first?</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    className="flex items-center gap-2.5 font-medium text-primary hover:underline"
                    href={`tel:${site.phoneHref}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center gap-2.5 font-medium text-primary hover:underline"
                    href={`mailto:${site.email}`}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" /> {site.email}
                  </a>
                </li>
                <li>
                  <a
                    className="font-medium text-primary hover:underline"
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Message us on WhatsApp
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{site.hours}</p>
            </div>
            <Disclaimer>
              A quotation is an estimate of professional fees for the scope described. Government
              fees, taxes and third-party charges, where applicable, are billed separately.
            </Disclaimer>
          </aside>
        </div>
      </section>
    </>
  );
}
