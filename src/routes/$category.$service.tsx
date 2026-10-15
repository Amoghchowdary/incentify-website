import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Clock } from "lucide-react";
import {
  categoryBySlug,
  findService,
  resolved,
  servicesByCategory,
} from "@/data/services";
import { site } from "@/data/site";
import { pageHead, breadcrumbSchema } from "@/lib/seo";
import {
  CheckList,
  CtaBand,
  Disclaimer,
  FaqAccordion,
  PageHero,
  ProcessSteps,
  SectionHeading,
  ServiceCard,
} from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/lead-form";
import { visualForCategory } from "@/data/visuals";

export const Route = createFileRoute("/$category/$service")({
  loader: ({ params }) => {
    const category = categoryBySlug(params.category);
    const service = findService(params.category, params.service);
    if (!category || !service) throw notFound();
    return { category, service, detail: resolved(service) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { service, category, detail } = loaderData;
    const path = `/${params.category}/${params.service}`;
    const head = pageHead({
      title: `${service.title} | Incentify`,
      description: `${service.summary} Professional assistance from Incentify, Hyderabad — ${category.title.toLowerCase()}.`,
      path,
      type: "article",
    });
    return {
      ...head,
      scripts: [
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: category.title, path: `/${category.slug}` },
          { name: service.title, path },
        ]),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            serviceType: category.title,
            description: service.summary,
            areaServed: "IN",
            provider: {
              "@type": "ProfessionalService",
              name: site.legalName,
              telephone: site.phone,
              email: site.email,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: detail.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { category, service, detail } = Route.useLoaderData();
  const related = servicesByCategory(category.slug)
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={category.title}
        title={service.heroTitle ?? service.title}
        description={service.summary}
        breadcrumbs={[
          { label: category.title, to: "/$category", params: { category: category.slug } },
          { label: service.title },
        ]}
        visualSrc={visualForCategory(category.slug)}
        visualAlt={`Illustration for ${service.title}`}
      >
        <Button asChild size="lg">
          <a href="#request">Request Assistance</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/consultation">Book a Consultation</Link>
        </Button>
      </PageHero>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-16">
        <article className="min-w-0 space-y-12">
          <section aria-labelledby="overview">
            <h2 id="overview" className="text-2xl font-bold text-foreground">
              Overview
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{service.overview}</p>
          </section>

          <section aria-labelledby="who">
            <h2 id="who" className="text-2xl font-bold text-foreground">
              Who may need it
            </h2>
            <div className="mt-4">
              <CheckList items={detail.who} />
            </div>
          </section>

          <section aria-labelledby="helps">
            <h2 id="helps" className="text-2xl font-bold text-foreground">
              What Incentify helps with
            </h2>
            <div className="mt-4">
              <CheckList items={detail.helps} columns={2} />
            </div>
          </section>

          <section aria-labelledby="documents">
            <h2 id="documents" className="text-2xl font-bold text-foreground">
              Documents typically required
            </h2>
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
              {detail.documents.map((doc) => (
                <li key={doc} className="flex items-start gap-3 p-4">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm leading-relaxed">{doc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              The final checklist depends on your entity type, activity and jurisdiction. We confirm
              it before starting work.
            </p>
          </section>

          <section aria-labelledby="process">
            <h2 id="process" className="text-2xl font-bold text-foreground">
              Our process
            </h2>
            <div className="mt-6">
              <ProcessSteps steps={detail.process} />
            </div>
          </section>

          <section aria-labelledby="timeline">
            <h2 id="timeline" className="text-2xl font-bold text-foreground">
              Expected timeline
            </h2>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-primary-soft p-4">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm leading-relaxed">
                Timeline varies based on documentation, authority processing and individual
                circumstances. We share an indicative schedule once your requirement and documents
                are reviewed.
              </p>
            </div>
          </section>

          <section aria-labelledby="faqs">
            <h2 id="faqs" className="text-2xl font-bold text-foreground">
              Frequently asked questions
            </h2>
            <div className="mt-4">
              <FaqAccordion faqs={detail.faqs} />
            </div>
          </section>

          {category.disclaimer && <Disclaimer>{category.disclaimer}</Disclaimer>}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h2 className="text-base font-bold text-foreground">Speak with Incentify</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Get clarity on applicability, documents and fees before you commit.
            </p>
            <div className="mt-4 grid gap-2.5">
              <Button asChild>
                <a href="#request">Request assistance</a>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${site.phoneHref}`}>Call {site.phone}</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{site.hours}</p>
          </div>

          <nav aria-label="On this page" className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground">On this page</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                ["Overview", "overview"],
                ["Who may need it", "who"],
                ["What we help with", "helps"],
                ["Documents", "documents"],
                ["Process", "process"],
                ["FAQs", "faqs"],
              ].map(([label, id]) => (
                <li key={id}>
                  <a className="hover:text-primary hover:underline" href={`#${id}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/50 section-y">
          <div className="container-page">
            <SectionHeading eyebrow="Related" title={`Other ${category.title.toLowerCase()} services`} />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard
                  key={s.slug}
                  title={s.title}
                  description={s.summary}
                  icon={s.icon}
                  to="/$category/$service"
                  params={{ category: category.slug, service: s.slug }}
                />
              ))}
            </div>
            <a
              href={`/${category.slug}`}
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View all {category.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      )}

      <section id="request" className="section-y scroll-mt-24">
        <div className="container-page max-w-3xl">
          <LeadForm
            source="service-page"
            title={`Request assistance with ${service.title}`}
            description="Share a few details and our team will confirm applicability, documents and fees for your case."
          />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
