import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { legalDisclaimer, site } from "@/data/site";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    pageHead({
      title: "Disclaimer | Incentify",
      description:
        "Important disclaimers regarding the information published on the Incentify website and the nature of services provided.",
      path: "/disclaimer",
    }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      description="Please read the following carefully before relying on any information published on this website."
      updated="1 January 2026"
    >
      <LegalSection title="1. General information only">
        <p>
          Content on this website is provided for general information. It does not constitute legal,
          tax, financial or investment advice and should not be acted upon without a professional
          review of your specific facts.
        </p>
        <p>{legalDisclaimer}</p>
      </LegalSection>

      <LegalSection title="2. No guaranteed outcomes">
        <LegalList
          items={[
            "Registrations, licences and approvals are granted by the relevant authority, not by Incentify.",
            "Loan sanctions and disbursals are decided solely by banks and lending institutions.",
            "Insurance issuance, pricing and claim settlement are decided solely by the insurer.",
            "Tax positions and refunds depend on assessment by the relevant department.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Nature of our role">
        <p>
          {site.legalName} acts as a professional service and facilitation provider. We are not a
          bank, non-banking financial company, insurer or government body, and we do not hold or
          deploy client funds for investment.
        </p>
      </LegalSection>

      <LegalSection title="4. Changes in law">
        <p>
          Statutory provisions, rates, thresholds, forms and procedures change frequently. While we
          make reasonable efforts to keep content current, we do not warrant that every page
          reflects the latest position at the time you read it.
        </p>
      </LegalSection>

      <LegalSection title="5. External links">
        <p>
          Links to government portals or third-party websites are provided for convenience. We are
          not responsible for their content, availability or practices.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
