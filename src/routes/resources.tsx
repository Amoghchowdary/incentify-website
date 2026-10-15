import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { CtaBand, Disclaimer, PageHero, SectionHeading } from "@/components/blocks";
import { categories } from "@/data/services";
import { visuals } from "@/data/visuals";

export const Route = createFileRoute("/resources")({
  head: () =>
    pageHead({
      title: "Resources & Compliance Calendar | Incentify",
      description:
        "Recurring compliance due dates, document checklists and official government portals for Indian businesses, compiled by Incentify.",
      path: "/resources",
    }),
  component: ResourcesPage,
});

const calendar = [
  { due: "7th of every month", item: "TDS / TCS payment for the previous month" },
  { due: "11th of every month", item: "GSTR-1 — outward supplies (monthly filers)" },
  { due: "13th of every month", item: "GSTR-1 IFF (QRMP scheme opt-in taxpayers)" },
  { due: "15th of every month", item: "PF and ESI contribution payment" },
  { due: "20th of every month", item: "GSTR-3B — summary return (monthly filers)" },
  { due: "Quarterly", item: "TDS returns, advance tax instalments and QRMP returns" },
  { due: "31 October", item: "Tax audit report, where applicable" },
  { due: "Annually", item: "Income tax return, ROC annual filings and GST annual return" },
];

const checklists = [
  {
    title: "Incorporation",
    items: ["PAN & Aadhaar of promoters", "Address proof", "Photographs", "Office address proof & NOC"],
  },
  {
    title: "GST registration",
    items: ["PAN of entity", "Constitution documents", "Bank details", "Place of business proof"],
  },
  {
    title: "Accounting handover",
    items: ["Prior year financials", "Bank statements", "Sales & purchase registers", "Existing ledgers"],
  },
  {
    title: "Business loan",
    items: ["Financial statements", "Bank statements", "KYC of promoters", "Project or use-of-funds note"],
  },
];

const portals = [
  { name: "MCA — Ministry of Corporate Affairs", url: "https://www.mca.gov.in" },
  { name: "GST Portal", url: "https://www.gst.gov.in" },
  { name: "Income Tax e-Filing", url: "https://www.incometax.gov.in" },
  { name: "EPFO — Employees' Provident Fund", url: "https://www.epfindia.gov.in" },
  { name: "ESIC", url: "https://www.esic.gov.in" },
  { name: "Udyam Registration (MSME)", url: "https://udyamregistration.gov.in" },
  { name: "IP India — Trademarks", url: "https://ipindia.gov.in" },
  { name: "DGFT — Import Export Code", url: "https://www.dgft.gov.in" },
];

function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Compliance calendar, checklists and portals"
        description="Practical references for recurring obligations and common document requirements. Applicability depends on your entity, turnover and registrations."
        breadcrumbs={[{ label: "Resources" }]}
        visualSrc={visuals.taxCompliance}
        visualAlt="Illustration of compliance calendars and business records"
      />

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Calendar"
            title="Recurring compliance due dates"
            description="An indicative view of common statutory deadlines for Indian businesses."
          />
          <div className="mt-8 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Recurring statutory compliance due dates</caption>
              <thead className="bg-secondary text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Due</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Obligation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {calendar.map((row) => (
                  <tr key={row.item}>
                    <th scope="row" className="px-4 py-3 font-semibold whitespace-nowrap text-foreground">
                      {row.due}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{row.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Dates may be extended or revised by the relevant authority. Always confirm the current
            due date before filing.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 section-y">
        <div className="container-page">
          <SectionHeading eyebrow="Checklists" title="Documents commonly required" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {checklists.map((c) => (
              <div key={c.title} className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-base font-bold text-foreground">{c.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {c.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Portals" title="Official government portals" />
            <ul className="mt-6 grid gap-2">
              {portals.map((p) => (
                <li key={p.url}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40"
                  >
                    <span className="min-w-0 truncate">{p.name}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Browse" title="Explore our practice areas" />
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/${c.slug}`}
                    className="block rounded-md border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Disclaimer>
                This page is general information, not advice. Due dates and requirements change with
                notifications and depend on your specific registrations.
              </Disclaimer>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title="Not sure what applies to your business?" />
    </>
  );
}
