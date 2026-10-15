import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalList, LegalPage, LegalSection } from "@/components/legal";
import { fullAddress, site } from "@/data/site";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: "Privacy Policy | Incentify",
      description:
        "How Incentify Private Limited collects, uses, stores and protects the personal and business information you share with us.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what information we collect through this website and our engagements, and how we use and protect it."
      updated="1 January 2026"
    >
      <LegalSection title="1. Information we collect">
        <p>We collect information you provide directly to us, which may include:</p>
        <LegalList
          items={[
            "Contact details such as name, email address, phone number and city.",
            "Business details such as entity type, service requirement and preferred contact method.",
            "Documents and information you share for the purpose of a specific engagement.",
            "Basic technical information such as browser type and pages visited, collected in aggregate.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How we use information">
        <LegalList
          items={[
            "To respond to enquiries, quotation requests and consultation bookings.",
            "To assess applicability of services and prepare a scope of work and fee estimate.",
            "To deliver the professional services you engage us for.",
            "To meet our own legal, statutory and record-keeping obligations.",
          ]}
        />
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="3. Sharing of information">
        <p>
          Information may be shared with government portals, regulatory authorities, banks,
          insurers or professional partners only where necessary to perform the service you have
          engaged us for, or where required by law.
        </p>
      </LegalSection>

      <LegalSection title="4. Data retention and security">
        <p>
          We retain records for as long as needed to provide services and to comply with applicable
          legal and statutory requirements. We apply reasonable administrative and technical
          safeguards, though no method of transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and analytics">
        <p>
          This website may use essential cookies and privacy-respecting analytics to understand
          usage and improve the experience. You can control cookies through your browser settings.
        </p>
      </LegalSection>

      <LegalSection title="6. Your choices">
        <LegalList
          items={[
            "Request access to or correction of the information we hold about you.",
            "Request deletion of information we are not required to retain by law.",
            "Opt out of non-essential communication at any time.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          For any privacy request, write to{" "}
          <a className="font-medium text-primary hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          or {site.phone}. Registered office: {fullAddress}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
