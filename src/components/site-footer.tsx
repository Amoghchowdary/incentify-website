import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { fullAddress, legalDisclaimer, site, whatsappLink } from "@/data/site";
import logo from "@/assets/incentify-logo.png";

type FooterLink = { label: string; to: string; params?: Record<string, string> };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Business Services",
    links: [
      {
        label: "Private Limited Registration",
        to: "/$category/$service",
        params: { category: "start-a-business", service: "private-limited-company" },
      },
      {
        label: "LLP Registration",
        to: "/$category/$service",
        params: { category: "start-a-business", service: "llp" },
      },
      {
        label: "Proprietorship Setup",
        to: "/$category/$service",
        params: { category: "start-a-business", service: "proprietorship" },
      },
      {
        label: "MSME / Udyam Registration",
        to: "/$category/$service",
        params: { category: "registrations", service: "msme-udyam" },
      },
      { label: "All Registrations", to: "/$category", params: { category: "registrations" } },
    ],
  },
  {
    title: "Tax & Compliance",
    links: [
      {
        label: "GST Registration",
        to: "/$category/$service",
        params: { category: "registrations", service: "gst-registration" },
      },
      {
        label: "GST Return Filing",
        to: "/$category/$service",
        params: { category: "tax", service: "gst-return-filing" },
      },
      {
        label: "Income Tax Filing",
        to: "/$category/$service",
        params: { category: "tax", service: "income-tax" },
      },
      {
        label: "ROC Compliance",
        to: "/$category/$service",
        params: { category: "compliance", service: "roc-compliance" },
      },
      { label: "All Compliance Services", to: "/$category", params: { category: "compliance" } },
    ],
  },
  {
    title: "Finance & Advisory",
    links: [
      {
        label: "Business Loan Assistance",
        to: "/$category/$service",
        params: { category: "finance", service: "business-loan" },
      },
      {
        label: "Working Capital",
        to: "/$category/$service",
        params: { category: "finance", service: "working-capital" },
      },
      {
        label: "Business Insurance",
        to: "/$category/$service",
        params: { category: "insurance", service: "business-insurance" },
      },
      {
        label: "Virtual CFO",
        to: "/$category/$service",
        params: { category: "accounting", service: "virtual-cfo" },
      },
      { label: "Business Advisory", to: "/$category", params: { category: "advisory" } },
    ],
  },
  {
    title: "Company & Resources",
    links: [
      { label: "All Services", to: "/services" },
      { label: "Other Services", to: "/other-services" },
      { label: "About Incentify", to: "/about" },
      { label: "Resources & Guides", to: "/resources" },
      { label: "Book a Consultation", to: "/consultation" },
      { label: "Get a Quote", to: "/quote" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <img
              src={logo}
              alt="Incentify Private Limited — We Grow Together"
              width={210}
              height={90}
              loading="lazy"
              className="h-auto w-44 rounded-lg bg-white/95 p-2 object-contain"
            />
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
              {site.description}
            </p>
            <address className="mt-6 space-y-3 text-sm not-italic text-primary-foreground/80">
              <a
                className="flex items-start gap-2.5 hover:text-primary-foreground"
                href={`https://maps.google.com/?q=${encodeURIComponent(site.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{fullAddress}</span>
              </a>
              <a
                className="flex items-center gap-2.5 hover:text-primary-foreground"
                href={`tel:${site.phoneHref}`}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {site.phone}
              </a>
              <a
                className="flex items-center gap-2.5 hover:text-primary-foreground"
                href={`mailto:${site.email}`}
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {site.email}
              </a>
            </address>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center rounded-md border border-primary-foreground/30 px-4 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
            >
              Message us on WhatsApp
            </a>

            <div className="mt-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-primary-foreground/60 uppercase">
                Follow Incentify
              </p>
              <div className="mt-3 flex items-center gap-2">
                {site.social.linkedin && (
                  <a
                    href={site.social.linkedin}
                    target="_blank"
                    rel="me noreferrer"
                    aria-label="Incentify on LinkedIn"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-primary-foreground/10"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {site.social.instagram && (
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="me noreferrer"
                    aria-label="Incentify on Instagram"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-primary-foreground/10"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {site.social.youtube && (
                  <a
                    href={site.social.youtube}
                    target="_blank"
                    rel="me noreferrer"
                    aria-label="Incentify on YouTube"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-primary-foreground/10"
                  >
                    <Youtube className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-bold tracking-wide uppercase">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      params={l.params as never}
                      className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-primary-foreground/15 pt-6">
          <p className="text-xs leading-relaxed text-primary-foreground/70">{legalDisclaimer}</p>
          <p className="mt-3 text-xs leading-relaxed text-primary-foreground/70">
            Incentify provides professional assistance, facilitation and advisory services. Incentify
            is not a bank, lender, insurance company or government body, and is not affiliated with
            any government department or regulator.
          </p>
          <div className="mt-6 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link to="/privacy" className="hover:text-primary-foreground hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary-foreground hover:underline">
                Terms of Use
              </Link>
              <Link to="/disclaimer" className="hover:text-primary-foreground hover:underline">
                Disclaimer
              </Link>
              <Link to="/refund-policy" className="hover:text-primary-foreground hover:underline">
                Refund & Cancellation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
