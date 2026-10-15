import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, MessageSquare, Video } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { Disclaimer, PageHero } from "@/components/blocks";
import { ConsultationForm } from "@/components/consultation-form";
import { site } from "@/data/site";
import { visuals } from "@/data/visuals";

export const Route = createFileRoute("/consultation")({
  head: () =>
    pageHead({
      title: "Book a Consultation | Incentify",
      description:
        "Book a consultation with the Incentify team in Hyderabad to discuss business registration, taxation, compliance, accounting, finance or advisory requirements.",
      path: "/consultation",
    }),
  component: ConsultationPage,
});

const steps = [
  {
    icon: CalendarDays,
    title: "Request a slot",
    text: "Choose a date and time that suits you. Slots are subject to availability.",
  },
  {
    icon: MessageSquare,
    title: "Confirmation",
    text: "Our team confirms the slot over call, WhatsApp or email.",
  },
  {
    icon: Video,
    title: "The discussion",
    text: "We review your requirement and explain applicability, documents and options.",
  },
  {
    icon: Clock,
    title: "Written follow-up",
    text: "You receive a summary with the scope, checklist and indicative fees.",
  },
];

function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Consultation"
        title="Book a consultation"
        description="A focused discussion with our team to establish what applies to your business, what is required and how to proceed."
        breadcrumbs={[{ label: "Book a Consultation" }]}
        visualSrc={visuals.advisory}
        visualAlt="Illustration of a business consultation and advisory discussion"
      />

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ConsultationForm />

          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-base font-bold">How it works</h2>
              <ol className="mt-4 space-y-4">
                {steps.map((s) => (
                  <li key={s.title} className="flex gap-3">
                    <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                {site.hours}
              </p>
            </div>
            <Disclaimer>
              Discussions are general in nature and based on the information you share. A written
              engagement is issued before any work begins. Calendar integration is prepared for a
              future release; slots are currently confirmed by our team.
            </Disclaimer>
          </aside>
        </div>
      </section>
    </>
  );
}
