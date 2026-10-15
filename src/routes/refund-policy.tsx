import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { site } from "@/data/site";

export const Route = createFileRoute("/refund-policy")({
  head: () =>
    pageHead({
      title: "Refund Policy | Incentify",
      description:
        "How refunds, cancellations and government fee payments are handled for professional services provided by Incentify Private Limited.",
      path: "/refund-policy",
    }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="This policy explains when professional fees can be refunded and which charges are non-refundable."
      updated="1 January 2026"
    >
      <LegalSection title="1. Professional fees">
        <p>
          Professional fees cover the time and expertise applied to your engagement. Refund
          eligibility depends on the stage of work completed at the time of cancellation.
        </p>
        <LegalList
          items={[
            "Cancellation before any work has commenced: full refund of professional fees.",
            "Cancellation after documentation or drafting has commenced: pro-rata refund for work not performed.",
            "Cancellation after filing or submission to an authority: no refund of professional fees.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Government and third-party charges">
        <p>
          Government fees, statutory charges, stamp duty, portal charges and payments made to third
          parties on your behalf are non-refundable once paid, regardless of the outcome.
        </p>
      </LegalSection>

      <LegalSection title="3. Rejections and resubmissions">
        <p>
          If an application is rejected on grounds within our control, we resubmit at no additional
          professional fee. Rejections arising from incorrect or incomplete client information,
          policy changes or authority discretion may attract fresh fees.
        </p>
      </LegalSection>

      <LegalSection title="4. Requesting a refund">
        <p>
          Send a written request to{" "}
          <a className="font-medium text-primary hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          with your engagement reference. Approved refunds are processed to the original payment
          method, typically within 7–14 business days.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
