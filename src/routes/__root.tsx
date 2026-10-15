import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/data/site";

const publicBaseUrl = import.meta.env.BASE_URL;

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark">
            Go home
          </Link>
          <Link to="/contact" className="inline-flex min-h-11 items-center justify-center rounded-md border border-input px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark">
            Try again
          </button>
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: site.legalName },
      { name: "format-detection", content: "telephone=yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", type: "image/png", href: `${publicBaseUrl}favicon.png` },
      { rel: "apple-touch-icon", href: `${publicBaseUrl}apple-touch-icon.png` },
      { rel: "manifest", href: `${publicBaseUrl}site.webmanifest` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${site.url}/#organization`,
              name: site.legalName,
              alternateName: site.name,
              url: site.url,
              logo: `${site.url}/favicon.png`,
              image: `${site.url}/og-incentify.png`,
              email: site.email,
              telephone: site.phone,
              sameAs: Object.values(site.social).filter(Boolean),
            },
            {
              "@type": "ProfessionalService",
              "@id": `${site.url}/#business`,
              name: site.legalName,
              alternateName: site.name,
              url: site.url,
              image: `${site.url}/og-incentify.png`,
              email: site.email,
              telephone: site.phone,
              description: site.description,
              parentOrganization: { "@id": `${site.url}/#organization` },
              address: {
                "@type": "PostalAddress",
                streetAddress: `${site.address.line1}, ${site.address.line2}`,
                addressLocality: site.address.city,
                postalCode: site.address.postalCode,
                addressRegion: site.address.state,
                addressCountry: "IN",
              },
              areaServed: { "@type": "Country", name: "India" },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "10:00",
                  closes: "18:00",
                },
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: site.phone,
                contactType: "customer service",
                areaServed: "IN",
                availableLanguage: ["English"],
              },
              sameAs: Object.values(site.social).filter(Boolean),
              slogan: site.tagline,
            },
            {
              "@type": "WebSite",
              "@id": `${site.url}/#website`,
              url: site.url,
              name: site.name,
              publisher: { "@id": `${site.url}/#organization` },
              inLanguage: "en-IN",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground">
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" className="flex-1"><Outlet /></main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
