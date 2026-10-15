import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    pageHead({
      title: "Internal Access | Incentify",
      description: "Restricted internal access for authorised Incentify administrators.",
      path: "/admin",
      robots: "noindex,nofollow,noarchive,nosnippet",
    }),
  component: HiddenAdminGateway,
});

function HiddenAdminGateway() {
  useEffect(() => {
    window.location.replace("/portal?role=admin");
  }, []);

  return (
    <section className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">Authorised access</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Redirecting to the secure Incentify administrator sign-in.
      </p>
      <a
        href="/portal?role=admin"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        Continue
      </a>
    </section>
  );
}
