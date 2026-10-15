import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileCheck2,
  Instagram,
  Linkedin,
  Phone,
  ShieldCheck,
  Timer,
  Users,
  Youtube,
} from "lucide-react";
import { pageHead } from "@/lib/seo";
import { site } from "@/data/site";
import { visuals } from "@/data/visuals";
import { Disclaimer, FaqAccordion, SectionHeading } from "@/components/blocks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Incentify | Business Registration, GST, Tax & Compliance Services",
      description:
        "Incentify Private Limited, Hyderabad — company registration, GST registration and return filing, ROC compliance, accounting, finance, insurance and business advisory under one professional roof.",
      path: "/",
    }),
  component: Home,
});

const pillars = [
  {
    icon: ShieldCheck,
    title: "Professionally handled",
    text: "Structured support for registration, tax, compliance and finance requirements.",
  },
  {
    icon: Timer,
    title: "Clear scope and fees",
    text: "Know the documents, scope and professional fees before work begins.",
  },
  {
    icon: Users,
    title: "One point of contact",
    text: "Coordinate multiple business requirements through one Incentify relationship.",
  },
];

const processPoints = [
  {
    icon: ClipboardCheck,
    title: "Share the requirement",
    text: "Tell us what you are starting, filing or trying to resolve.",
  },
  {
    icon: FileCheck2,
    title: "Receive the checklist",
    text: "We confirm the applicable service, documents, scope and expected fees.",
  },
  {
    icon: Check,
    title: "Move to completion",
    text: "Your coordinator follows preparation, filing and completion updates.",
  },
];

const serviceHighlights = [
  {
    eyebrow: "Start",
    title: "Business Registration",
    text: "Private Limited, LLP, proprietorship, startup and statutory registrations.",
    category: "start-a-business",
    image: visuals.registration,
  },
  {
    eyebrow: "Comply",
    title: "GST, Tax & ROC",
    text: "GST registration and returns, income tax work and recurring corporate compliance.",
    category: "tax",
    image: visuals.taxCompliance,
  },
  {
    eyebrow: "Manage",
    title: "Accounting & Finance",
    text: "Bookkeeping, payroll, virtual CFO support and finance facilitation for growing businesses.",
    category: "finance",
    image: visuals.financeGrowth,
  },
  {
    eyebrow: "Grow",
    title: "Advisory & Business Support",
    text: "Planning, risk, insurance and structured business advisory when decisions become complex.",
    category: "advisory",
    image: visuals.advisory,
  },
] as const;

const homeFaqs = [
  {
    q: "What does Incentify actually do?",
    a: "We assist with company and business registration, statutory registrations, GST and income tax filings, ROC and corporate compliance, accounting, payroll, finance facilitation, insurance assistance and business advisory.",
  },
  {
    q: "Do you work with businesses outside Hyderabad?",
    a: "Yes. Many requirements can be coordinated digitally, while Incentify operates from Hyderabad and supports clients across India.",
  },
  {
    q: "How are fees decided?",
    a: "Fees depend on the scope, entity type and volume of work. We share the professional fee scope before starting; government and third-party charges are separate where applicable.",
  },
];

function Home() {
  return (
    <>
      <section className="overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:py-24">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
              Business setup, compliance & growth support
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-extrabold text-balance md:text-6xl">
              Start the business. Keep it compliant. Build with confidence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              Incentify brings registration, GST, tax, ROC compliance, accounting and business support
              into one professional relationship — so founders can focus on running the business.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/consultation">Book a Consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-foreground/75">
              {["Registrations", "GST & Tax", "ROC Compliance", "Finance & Advisory"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" aria-hidden="true" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-12 -right-20 h-56 w-56 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-primary-foreground/15 bg-white/5 p-2 shadow-2xl">
              <img
                src="/images/business-support-hero-v8-3.png"
                alt="Incentify business setup, GST, ROC compliance and finance-ready support"
                width={900}
                height={600}
                fetchPriority="high"
                className="aspect-[3/2] w-full rounded-[1.35rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we help with"
            title="Business services should be easier to understand at a glance"
            description="Choose the requirement first. Each service opens into a focused page with documents, process and assistance details."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {serviceHighlights.map((service) => (
              <a
                key={service.title}
                href={`/${service.category}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-raised"
              >
                <div className="grid min-h-full sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="overflow-hidden bg-secondary">
                    <img
                      src={service.image}
                      alt=""
                      width={900}
                      height={650}
                      loading="lazy"
                      className="h-full min-h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col p-6 md:p-7">
                    <p className="text-xs font-bold tracking-[0.12em] text-accent uppercase">{service.eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-bold text-foreground">{service.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      View services
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/45 section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-card">
            <img
              src={visuals.teamSupport}
              alt="Illustration of a coordinated professional team supporting a business"
              width={900}
              height={650}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>

          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Less running between people. More clarity on what happens next.
            </h2>
            <div className="mt-8 space-y-6">
              {processPoints.map((point, index) => (
                <div key={point.title} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <point.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent">0{index + 1}</span>
                      <h3 className="text-base font-bold text-foreground">{point.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Why Incentify"
              title="Built around the way small and growing businesses actually need support"
              description="A professional business-services relationship that keeps the scope understandable and the next step visible."
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="border-t-2 border-accent pt-5">
                  <pillar.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-bold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-card">
            <img
              src={visuals.advisory}
              alt="Illustration of professional advisors discussing business decisions"
              width={900}
              height={650}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-primary-soft py-10 md:py-12">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Stay connected</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Follow Incentify beyond the website</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Updates, business-awareness content and company news from Incentify's official social profiles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {site.social.linkedin && (
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="me noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-bold text-foreground shadow-card transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
              </a>
            )}
            {site.social.instagram && (
              <a
                href={site.social.instagram}
                target="_blank"
                rel="me noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-bold text-foreground shadow-card transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" /> Instagram
              </a>
            )}
            {site.social.youtube && (
              <a
                href={site.social.youtube}
                target="_blank"
                rel="me noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-bold text-foreground shadow-card transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Youtube className="h-4 w-4" aria-hidden="true" /> YouTube
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <SectionHeading eyebrow="FAQs" title="A few things clients usually ask first" />
          <div className="min-w-0">
            <FaqAccordion faqs={homeFaqs} />
            <div className="mt-8">
              <Disclaimer>
                Services, eligibility, timelines and outcomes may vary depending on individual
                circumstances, applicable laws, documentation and third-party or regulatory approvals.
              </Disclaimer>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-primary py-10 text-primary-foreground md:py-12">
        <div className="container-page flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">Tell us what the business needs next.</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75 md:text-base">
              We will confirm the applicable service, document checklist, process and fee scope before work begins.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/consultation">Book a Consultation</Link>
            </Button>
            <a
              href={`tel:${site.phoneHref}`}
              className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-primary-foreground/90 hover:text-primary-foreground hover:underline"
            >
              <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
