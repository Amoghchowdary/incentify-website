import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { CheckList, CtaBand, Disclaimer, PageHero, ProcessSteps, SectionHeading } from "@/components/blocks";
import { categories } from "@/data/services";
import { fullAddress, legalDisclaimer, site } from "@/data/site";
import { ServiceIcon } from "@/components/icons";
import { visuals } from "@/data/visuals";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About Incentify | Professional Business Services, Hyderabad",
      description:
        "Incentify Private Limited is a Hyderabad-based professional services firm supporting businesses with registration, taxation, compliance, accounting, finance and advisory.",
      path: "/about",
    }),
  component: AboutPage,
});

const values = [
  {
    title: "Clarity before commitment",
    text: "We explain what applies to you, what is required and what it costs before any engagement begins.",
  },
  {
    title: "Accuracy over speed",
    text: "Filings are reviewed before submission. We would rather take an extra day than file something incorrect.",
  },
  {
    title: "Continuity",
    text: "Records, filings and deadlines are tracked so nothing lapses between financial years.",
  },
  {
    title: "Honest positioning",
    text: "We state plainly what is within our control and what depends on an authority, bank or insurer.",
  },
];

const workflow = [
  { title: "Understand", description: "We review your business profile, stage and specific requirement." },
  { title: "Define", description: "You receive a written scope, document checklist and fee estimate." },
  { title: "Execute", description: "Our team prepares, reviews and files with the relevant authority." },
  { title: "Maintain", description: "We track deadlines and keep your compliance calendar current." },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="A professional services firm built for growing businesses"
        description={`${site.legalName} brings business registration, taxation, compliance, accounting, finance and advisory support together under one accountable team.`}
        breadcrumbs={[{ label: "About" }]}
        visualSrc={visuals.teamSupport}
        visualAlt="Illustration of the Incentify professional support model"
      />

      <section className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-10">
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Most businesses do not fail on ambition. They lose time and money on fragmented
                paperwork — one consultant for incorporation, another for GST, a third for
                accounts, and nobody accountable for what falls between them.
              </p>
              <p>
                Incentify was built to remove that gap. We operate as a single professional team
                across the full lifecycle of a business: choosing and registering the right
                structure, obtaining statutory registrations, keeping tax and corporate compliance
                current, maintaining books and payroll, and supporting finance and insurance
                requirements as the business scales.
              </p>
              <p>
                We work from Hyderabad and serve clients across India. Our approach is deliberately
                unglamorous: define the scope in writing, do the work properly, and keep the client
                informed at every stage.
              </p>
            </div>

            <div>
              <SectionHeading eyebrow="How we work" title="A consistent engagement model" />
              <div className="mt-8">
                <ProcessSteps steps={workflow} />
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="Principles" title="What we hold ourselves to" />
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {values.map((v) => (
                  <div key={v.title} className="border-t-2 border-accent pt-4">
                    <h3 className="text-base font-bold text-foreground">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="Coverage" title="Practice areas" />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {categories.map((c) => (
                  <li
                    key={c.slug}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <ServiceIcon name={c.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{c.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{c.short}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Disclaimer>{legalDisclaimer}</Disclaimer>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-base font-bold">Firm details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                    Legal name
                  </dt>
                  <dd className="mt-0.5 font-medium">{site.legalName}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">Office</dt>
                  <dd className="mt-0.5 leading-relaxed">{fullAddress}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">Hours</dt>
                  <dd className="mt-0.5">{site.hours}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">Contact</dt>
                  <dd className="mt-0.5">
                    <a className="text-primary hover:underline" href={`tel:${site.phoneHref}`}>
                      {site.phone}
                    </a>
                    <br />
                    <a className="text-primary hover:underline" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-bold">Who we work with</h2>
              <div className="mt-4">
                <CheckList
                  items={[
                    "First-time founders and startups",
                    "Proprietors formalising their business",
                    "Private limited companies and LLPs",
                    "Professionals and consultants",
                    "Established SMEs and family businesses",
                  ]}
                />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand title="Work with a team that stays accountable" />
    </>
  );
}
