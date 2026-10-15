import type { ReactNode } from "react";
import { PageHero } from "@/components/blocks";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalPage({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        description={description}
        breadcrumbs={[{ label: title }]}
      />
      <div className="container-page section-y max-w-3xl">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          Last updated: {updated}
        </p>
        <div className="mt-8 space-y-10">{children}</div>
      </div>
    </>
  );
}
