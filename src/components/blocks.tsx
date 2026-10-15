import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ServiceIcon } from "@/components/icons";
import type { Faq, IconName, Step } from "@/data/services";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="mt-2 text-[1.75rem] leading-tight font-bold text-foreground md:text-4xl">
        {title}
      </Tag>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; to?: string; params?: Record<string, string> }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-primary hover:underline">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            {item.to && i < items.length - 1 ? (
              <Link
                to={item.to}
                params={item.params as never}
                className="hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  visualSrc,
  visualAlt = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string; params?: Record<string, string> }[];
  children?: ReactNode;
  visualSrc?: string;
  visualAlt?: string;
}) {
  return (
    <section className="overflow-hidden border-b border-border bg-primary-soft">
      <div className="container-page py-10 md:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div
          className={cn(
            "mt-5",
            visualSrc &&
              "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-center",
          )}
        >
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-2 text-3xl leading-tight font-extrabold text-foreground md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {description}
              </p>
            )}
            {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
          </div>

          {visualSrc && (
            <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-card">
              <img
                src={visualSrc}
                alt={visualAlt}
                width={900}
                height={650}
                loading="eager"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({
  title,
  description,
  icon,
  to,
  params,
}: {
  title: string;
  description: string;
  icon: IconName;
  to: string;
  params?: Record<string, string>;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
        <ServiceIcon name={icon} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Learn more
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

export function ProcessSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title} className="relative border-t-2 border-primary/20 pt-5">
          <span className="text-sm font-bold text-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-1.5 text-base font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function CheckList({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) {
  return (
    <ul className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2")}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <span className="text-sm leading-relaxed text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
        <AccordionItem key={faq.q} value={`item-${i}`}>
          <AccordionTrigger className="text-left text-base font-semibold">{faq.q}</AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export function CtaBand({
  title = "Speak with Incentify",
  description = "Share your requirement and our team will confirm what applies to you, what is needed and what it will take.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="section-y bg-primary text-primary-foreground">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80 md:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link to="/consultation">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
