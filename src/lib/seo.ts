import { site } from "@/data/site";

export function pageHead({
  title,
  description,
  path,
  type = "website",
  robots,
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
  robots?: string;
}) {
  const fullTitle = title.includes("Incentify") ? title : `${title} | Incentify`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(robots ? [{ name: "robots", content: robots }] : []),
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: path },
      { property: "og:site_name", content: site.legalName },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: `https://${site.domain}${item.path}`,
      })),
    }),
  };
}
