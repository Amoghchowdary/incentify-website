import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { site } from "@/data/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "Terms of Service | Incentify",
      description:
        "The terms that govern use of the Incentify website and the professional services provided by Incentify Private Limited.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms govern your use of this website and any professional engagement with Incentify Private Limited."
      updated="1 January 2026"
    >
      <LegalSection title="1. About these terms">
        <p>
          By using this website or engaging {site.legalName} for any service, you agree to these
          terms. Where a signed engagement letter or proposal exists, that document prevails to the
          extent of any conflict.
        </p>
      </LegalSection>

      <LegalSection title="2. Scope of services">
        <p>
          We provide facilitation, documentation, filing and advisory support across business
          registration, taxation, corporate compliance, accounting, payroll, finance and insurance.
          Scope is defined in writing for each engagement, and anything not expressly included is
          outside scope.
        </p>
      </LegalSection>

      <LegalSection title="3. Client responsibilities">
        <LegalList
          items={[
            "Provide complete, accurate and timely information and documents.",
            "Respond to requests for clarification or approvals within reasonable timelines.",
            "Ensure that information supplied is genuine and lawfully obtained.",
            "Pay applicable government fees, taxes and third-party charges as they arise.",
          ]}
        />
        <p>
          Delays, rejections or additional costs caused by incomplete or inaccurate information are
          not our responsibility.
        </p>
      </LegalSection>

      <LegalSection title="4. Fees and payments">
        <p>
          Professional fees are quoted before work begins. Government fees, statutory charges,
          stamp duty and third-party costs are billed separately at actuals. Unless stated
          otherwise, fees are payable in advance.
        </p>
      </LegalSection>

      <LegalSection title="5. Timelines and outcomes">
        <p>
          Timelines are indicative. Approvals, registrations, sanctions and other outcomes rest with
          government departments, regulators, banks, insurers and other third parties. We do not
          guarantee any specific outcome, approval or processing time.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitation of liability">
        <p>
          To the maximum extent permitted by law, our aggregate liability for any engagement is
          limited to the professional fees received for that engagement. We are not liable for
          indirect, incidental or consequential losses.
        </p>
      </LegalSection>

      <LegalSection title="7. Confidentiality">
        <p>
          Information shared with us is treated as confidential and used only for the engagement,
          except where disclosure is required by law or by an authority.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing law">
        <p>
          These terms are governed by the laws of India. Courts at Hyderabad, Telangana have
          exclusive jurisdiction over any dispute.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
