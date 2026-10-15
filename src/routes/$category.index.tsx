import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { categoryBySlug, servicesByCategory } from "@/data/services";
import { pageHead, breadcrumbSchema } from "@/lib/seo";
import { CtaBand, Disclaimer, PageHero, SectionHeading, ServiceCard } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { visualForCategory } from "@/data/visuals";

export const Route = createFileRoute("/$category/")({
  loader: ({ params }) => {
    const category = categoryBySlug(params.category);
    if (!category) throw notFound();
    return { category, services: servicesByCategory(category.slug) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { category } = loaderData;
    const head = pageHead({
      title: `${category.title} Services in Hyderabad`,
      description: category.description,
      path: `/${params.category}`,
    });
    return {
      ...head,
      scripts: [
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: category.title, path: `/${category.slug}` },
        ]),
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, services } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow={category.short}
        title={category.title}
        description={category.description}
        breadcrumbs={[{ label: category.title }]}
        visualSrc={visualForCategory(category.slug)}
        visualAlt={`Illustration for ${category.title.toLowerCase()} services`}
      >
        <Button asChild size="lg">
          <Link to="/quote">Get a Quote</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/consultation">Book a Consultation</Link>
        </Button>
      </PageHero>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Services"
            title={`${category.title} we handle`}
            description="Select a service to see what it covers, who it applies to, the documents typically required and how the process runs."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
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
          {category.disclaimer && (
            <div className="mt-10 max-w-3xl">
              <Disclaimer>{category.disclaimer}</Disclaimer>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title={`Not sure which ${category.title.toLowerCase()} service applies?`}
        description="Describe your situation and our team will confirm what is applicable, what is required and what it will involve."
      />
    </>
  );
}
