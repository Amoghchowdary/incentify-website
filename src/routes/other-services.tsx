import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { categories, servicesByCategory } from "@/data/services";
import type { Category } from "@/data/services";
import { ServiceIcon } from "@/components/icons";
import { SectionHeading } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { visuals } from "@/data/visuals";

export const Route = createFileRoute("/other-services")({
  head: () =>
    pageHead({
      title: "Other Services | Accounting, Finance, Insurance & Advisory | Incentify",
      description:
        "Explore Incentify's supporting business services including accounting, finance facilitation, insurance assistance and business advisory.",
      path: "/other-services",
    }),
  component: OtherServicesPage,
});

const otherServiceSlugs = ["accounting", "finance", "insurance", "advisory"];
const otherCategories = categories.filter((category) => otherServiceSlugs.includes(category.slug));

function OtherServicesPage() {
  return (
    <>
      <section className="overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div className="container-page grid gap-8 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-primary-foreground/70 uppercase">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              Extended business support
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">Other Services</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              Accounting, finance facilitation, insurance assistance and advisory services presented
              as simple icon-led points, with each requirement opening into its own detail page.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-primary-foreground/15 bg-white/5 p-2 shadow-2xl">
            <img
              src={visuals.financeGrowth}
              alt=""
              width={900}
              height={650}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            title="Supporting services for growing businesses"
            description="Use the points below to go directly to the service you need. No table-style catalogue and no overloaded navigation menu."
          />

          <div className="mt-12 grid gap-x-14 gap-y-14 lg:grid-cols-2">
            {otherCategories.map((category) => (
              <IconPointCategory key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/50 py-10 md:py-12">
        <div className="container-page flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground">Need multiple business functions coordinated together?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              Tell us the current requirement and Incentify can scope the relevant support in one
              consultation.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/consultation">Book a Consultation</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function IconPointCategory({ category }: { category: Category }) {
  const serviceList = servicesByCategory(category.slug);

  return (
    <section className="min-w-0 border-t-2 border-primary pt-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ServiceIcon name={category.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">{category.short}</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{category.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-1">
        {serviceList.map((service) => (
          <li key={service.slug}>
            <Link
              to="/$category/$service"
              params={{ category: category.slug, service: service.slug }}
              className="group flex items-center gap-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary-soft">
                <ServiceIcon name={service.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">{service.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <a
        href={`/${category.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        View {category.title} overview
      </a>
    </section>
  );
}
