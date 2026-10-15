export type Step = { title: string; description: string };
export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  title: string;
  navTitle?: string;
  heroTitle?: string;
  summary: string;
  overview: string;
  who?: string[];
  helps?: string[];
  documents?: string[];
  process?: Step[];
  faqs?: Faq[];
  featured?: boolean;
  icon: IconName;
};

export type IconName =
  | "building"
  | "briefcase"
  | "receipt"
  | "file"
  | "shield"
  | "calculator"
  | "coins"
  | "bank"
  | "chart"
  | "users"
  | "scale"
  | "clipboard"
  | "globe"
  | "key"
  | "wallet"
  | "heart";

export type Category = {
  slug: string;
  title: string;
  navTitle: string;
  short: string;
  description: string;
  icon: IconName;
  disclaimer?: string;
  defaults: {
    who: string[];
    helps: string[];
    documents: string[];
    process: Step[];
    faqs: Faq[];
  };
};

const commonProcess = (subject: string): Step[] => [
  {
    title: "Requirement review",
    description: `We understand your business profile and confirm the scope of the ${subject}.`,
  },
  {
    title: "Document checklist",
    description: "You receive a clear checklist and share the required information securely.",
  },
  {
    title: "Preparation & filing",
    description: "Our team prepares the applicable forms, records and submissions.",
  },
  {
    title: "Follow-up & completion",
    description:
      "We track the status, respond to queries where applicable and share the final outcome with you.",
  },
];

const commonFaqs = (subject: string): Faq[] => [
  {
    q: "How long does the process take?",
    a: "Timeline varies based on documentation, authority processing and individual circumstances. We share an indicative schedule after reviewing your requirement.",
  },
  {
    q: "What does Incentify charge for this service?",
    a: `Fees depend on the scope of work, entity type and volume. Request a quotation and we will share a written estimate for your ${subject}.`,
  },
  {
    q: "Do I need to visit your office?",
    a: "Most requirements can be handled digitally. You may share documents online, and our team will coordinate over call, email or WhatsApp.",
  },
  {
    q: "Will I be informed about the progress?",
    a: "Yes. A dedicated point of contact keeps you updated at each stage until the requirement is completed.",
  },
];

export const categories: Category[] = [
  {
    slug: "start-a-business",
    title: "Start a Business",
    navTitle: "Start a Business",
    short: "Incorporation and entity setup",
    description:
      "Choose the right structure and complete incorporation formalities with professional assistance from name approval to post-incorporation registrations.",
    icon: "building",
    defaults: {
      who: [
        "First-time founders setting up a formal business entity",
        "Existing proprietors converting to a registered structure",
        "Teams that need a compliant entity before raising funds or signing contracts",
      ],
      helps: [
        "Structure and eligibility guidance",
        "Name availability check and application",
        "Digital Signature Certificates and director identification",
        "Drafting of incorporation documents",
        "Filing with the applicable authority and follow-up",
        "Post-incorporation registration guidance",
      ],
      documents: [
        "PAN and Aadhaar of promoters/partners",
        "Identity proof (passport, voter ID or driving licence)",
        "Recent address proof (bank statement or utility bill)",
        "Passport-size photographs",
        "Registered office address proof and owner NOC",
        "Rental or lease agreement, where applicable",
      ],
      process: commonProcess("incorporation"),
      faqs: commonFaqs("registration"),
    },
  },
  {
    slug: "registrations",
    title: "Registrations & Licences",
    navTitle: "Registrations",
    short: "Statutory registrations and licences",
    description:
      "Registrations and licences commonly required to operate, invoice, hire and trade — handled with a clear checklist and a single point of contact.",
    icon: "clipboard",
    defaults: {
      who: [
        "Businesses that have crossed an applicable statutory threshold",
        "Entities required to hold a licence for their activity or premises",
        "Companies preparing for tenders, marketplaces or institutional clients",
      ],
      helps: [
        "Applicability and eligibility assessment",
        "Document collection and verification",
        "Application preparation and submission",
        "Clarification handling with the concerned department",
        "Delivery of the certificate and record-keeping guidance",
      ],
      documents: [
        "PAN of the business and promoters",
        "Certificate of incorporation or partnership deed, where applicable",
        "Aadhaar and photograph of the authorised signatory",
        "Address proof of the place of business",
        "Bank account details or cancelled cheque",
      ],
      process: commonProcess("registration"),
      faqs: commonFaqs("registration"),
    },
  },
  {
    slug: "tax",
    title: "Tax & Compliance",
    navTitle: "Tax & Compliance",
    short: "GST and income tax support",
    description:
      "Ongoing GST and income tax support — registrations, periodic returns, reconciliations, notices and advisory for individuals and businesses.",
    icon: "receipt",
    disclaimer:
      "Tax positions depend on facts, applicable law and departmental interpretation. Information on this page is general in nature and is not a substitute for advice on your specific case.",
    defaults: {
      who: [
        "Registered businesses with periodic filing obligations",
        "Individuals and professionals with reporting requirements",
        "Businesses that have received a departmental communication or notice",
      ],
      helps: [
        "Review of records and data readiness",
        "Computation and preparation of the applicable return or response",
        "Filing within the applicable due date",
        "Reconciliation of books with portal data",
        "Advisory on recurring issues and record-keeping",
      ],
      documents: [
        "Login credentials or access to the relevant portal",
        "Sales and purchase registers for the period",
        "Bank statements for the period",
        "Expense and payment records",
        "Previous returns and acknowledgements",
      ],
      process: commonProcess("filing"),
      faqs: commonFaqs("filing"),
    },
  },
  {
    slug: "compliance",
    title: "ROC & Corporate Compliance",
    navTitle: "ROC Compliance",
    short: "Company and LLP secretarial work",
    description:
      "Annual filings, statutory registers, director changes and corporate records maintained accurately through the year, not only at the due date.",
    icon: "shield",
    defaults: {
      who: [
        "Private limited companies and LLPs with annual filing obligations",
        "Companies making changes to directors, address, capital or name",
        "Entities preparing for due diligence, funding or closure",
      ],
      helps: [
        "Compliance calendar for the financial year",
        "Preparation of resolutions, forms and supporting records",
        "Filing with the Registrar of Companies",
        "Maintenance of statutory registers and minutes",
        "Guidance on remediation where filings are pending",
      ],
      documents: [
        "Certificate of incorporation and constitutional documents",
        "Financial statements for the relevant year",
        "Director/partner KYC details and DSCs",
        "Board and shareholder resolutions, where applicable",
        "Previous filings and challans",
      ],
      process: commonProcess("filing"),
      faqs: commonFaqs("compliance requirement"),
    },
  },
  {
    slug: "accounting",
    title: "Accounting",
    navTitle: "Accounting",
    short: "Books, payroll and reporting",
    description:
      "Accurate books, payroll and management reporting so that decisions, filings and funding conversations rest on reliable numbers.",
    icon: "calculator",
    defaults: {
      who: [
        "Businesses without an in-house finance team",
        "Founders who need monthly numbers for decisions and filings",
        "Companies scaling operations, headcount or locations",
      ],
      helps: [
        "Setup or clean-up of the accounting system",
        "Recording of transactions and periodic closing",
        "Reconciliation of banks, vendors and customers",
        "Reporting packs for management and lenders",
        "Coordination with your auditor and tax team",
      ],
      documents: [
        "Bank statements for the period",
        "Sales invoices and purchase bills",
        "Expense records and payment proofs",
        "Payroll inputs, where applicable",
        "Opening balances or previous financial statements",
      ],
      process: commonProcess("engagement"),
      faqs: commonFaqs("engagement"),
    },
  },
  {
    slug: "finance",
    title: "Finance",
    navTitle: "Finance",
    short: "Loan and funding assistance",
    description:
      "Preparation, documentation and facilitation support for business credit requirements. Incentify is not a lender; sanction decisions rest with the financial institution.",
    icon: "coins",
    disclaimer:
      "Incentify is not a bank, non-banking financial company or lender. We provide advisory, documentation and facilitation assistance only. Approval, terms, interest rates and disbursement are decided solely by the financial institution and are subject to eligibility, credit assessment and applicable terms.",
    defaults: {
      who: [
        "Businesses planning capital expenditure or expansion",
        "MSMEs seeking working capital support",
        "Companies preparing financial documentation for lenders",
      ],
      helps: [
        "Requirement assessment and indicative eligibility review",
        "Preparation of financial and business documentation",
        "Assistance in compiling a lender-ready file",
        "Coordination and follow-up with partner institutions",
        "Guidance on queries raised during appraisal",
      ],
      documents: [
        "KYC of the business and promoters",
        "Financial statements for the last two to three years",
        "Bank statements for the last twelve months",
        "GST and income tax returns for the relevant periods",
        "Details of existing borrowings and collateral, where applicable",
      ],
      process: commonProcess("requirement"),
      faqs: [
        {
          q: "Does Incentify provide loans?",
          a: "No. Incentify provides advisory, documentation and facilitation assistance. Credit decisions, terms and disbursement rest entirely with the financial institution.",
        },
        {
          q: "Is approval assured?",
          a: "No approval can be assured. Outcomes depend on the lender's credit assessment, your eligibility, documentation and applicable terms.",
        },
        ...commonFaqs("requirement").slice(1),
      ],
    },
  },
  {
    slug: "insurance",
    title: "Insurance",
    navTitle: "Insurance",
    short: "Business and employee cover assistance",
    description:
      "Assistance in identifying, comparing and arranging insurance cover for business assets, liabilities and employees through partner-supported solutions.",
    icon: "heart",
    disclaimer:
      "Incentify is not an insurance company. Insurance products are arranged through partner-supported solutions. Cover, exclusions, premium and claim outcomes are governed by the policy wording issued by the insurer and are subject to eligibility and applicable terms.",
    defaults: {
      who: [
        "Businesses with premises, stock, equipment or vehicles to protect",
        "Employers arranging cover for their teams",
        "Service firms with contractual insurance obligations",
      ],
      helps: [
        "Discussion of exposures and cover requirements",
        "Assistance in comparing partner-supported options",
        "Support in compiling proposal documentation",
        "Coordination during issuance and renewal",
        "Assistance with claim documentation, where applicable",
      ],
      documents: [
        "Business KYC and registration details",
        "Details of assets, premises or stock to be covered",
        "Employee census, where employee cover is required",
        "Existing policy copies and claim history, if any",
        "Contractual insurance requirements, if any",
      ],
      process: commonProcess("requirement"),
      faqs: [
        {
          q: "Does Incentify issue policies?",
          a: "No. Policies are issued by the insurer. Incentify assists with requirement assessment, documentation and coordination through partner-supported solutions.",
        },
        ...commonFaqs("requirement").slice(1),
      ],
    },
  },
  {
    slug: "advisory",
    title: "Business Advisory",
    navTitle: "Advisory",
    short: "Planning, risk and growth support",
    description:
      "Structured advisory support for planning, financial discipline, risk and compliance readiness as your business grows.",
    icon: "chart",
    disclaimer:
      "Advisory outputs are based on the information shared with us and are intended to support your decision-making. They do not constitute investment, legal or regulatory advice.",
    defaults: {
      who: [
        "Founders planning the next stage of growth",
        "Businesses preparing budgets, projections or investor material",
        "Companies formalising internal processes and controls",
      ],
      helps: [
        "Structured review of the current position",
        "Financial modelling and scenario discussion",
        "Identification of compliance and operational gaps",
        "A prioritised action plan with owners and timelines",
        "Periodic review sessions, where engaged",
      ],
      documents: [
        "Recent financial statements and management accounts",
        "Business plan or growth objectives, if documented",
        "Existing compliance status and pending items",
        "Organisation and process details",
      ],
      process: commonProcess("engagement"),
      faqs: commonFaqs("engagement"),
    },
  },
];

const svc = (
  categorySlug: string,
  s: Omit<Service, "icon"> & { icon?: IconName },
): Service & { category: string } => ({
  ...s,
  icon: s.icon ?? "file",
  category: categorySlug,
});

export const services: (Service & { category: string })[] = [
  // ---------- Start a business ----------
  svc("start-a-business", {
    slug: "private-limited-company",
    title: "Private Limited Company Registration",
    heroTitle: "Private Limited Company Registration",
    summary: "Incorporate a private limited company with structured, end-to-end assistance.",
    overview:
      "A private limited company is a separate legal entity with limited liability for its shareholders and a defined governance structure. It is commonly chosen by businesses that expect to raise external capital, appoint directors, issue shares or contract with larger organisations. Incentify assists with the full incorporation sequence — structure discussion, name application, digital signatures, drafting of the memorandum and articles, filing and post-incorporation registrations.",
    featured: true,
    icon: "building",
    who: [
      "Founders planning to raise external investment",
      "Teams with two or more shareholders",
      "Businesses contracting with corporates or public bodies",
      "Proprietors formalising an existing business",
    ],
    faqs: [
      {
        q: "How many people are required?",
        a: "A private limited company requires a minimum of two shareholders and two directors, at least one of whom must be resident in India.",
      },
      {
        q: "Can my residence be the registered office?",
        a: "A residential address may be used as a registered office where valid address proof and an owner's no-objection certificate are available.",
      },
      ...commonFaqs("registration").slice(0, 3),
    ],
  }),
  svc("start-a-business", {
    slug: "llp",
    title: "LLP Registration",
    summary: "Set up a limited liability partnership with a partnership deed and MCA filings.",
    overview:
      "A limited liability partnership combines the operational flexibility of a partnership with limited liability for its partners. It suits professional practices and closely held businesses that do not intend to issue shares. Incentify assists with designated partner identification, name reservation, incorporation filing and the LLP agreement.",
    featured: true,
    icon: "users",
  }),
  svc("start-a-business", {
    slug: "one-person-company",
    title: "OPC Registration",
    summary: "Incorporate a one person company with a single owner and a nominee.",
    overview:
      "A one person company allows a single promoter to operate with a corporate structure and limited liability, with a nominee recorded at incorporation. Incentify assists with eligibility review, nominee documentation, name approval and incorporation filing.",
    icon: "building",
  }),
  svc("start-a-business", {
    slug: "proprietorship",
    title: "Proprietorship Setup",
    summary: "Establish a sole proprietorship with the registrations relevant to your activity.",
    overview:
      "A proprietorship is the simplest way to begin trading and is identified through the proprietor's own PAN. Rather than a single incorporation certificate, it is established through the registrations relevant to your activity — such as Udyam, GST, a shop and establishment licence and a current account. Incentify assists in identifying and obtaining the right combination.",
    icon: "briefcase",
  }),
  svc("start-a-business", {
    slug: "partnership-firm",
    title: "Partnership Firm Registration",
    summary: "Draft a partnership deed and complete registration formalities.",
    overview:
      "A partnership firm is formed through a deed that records capital, profit sharing, roles and exit terms between partners. Incentify assists with drafting the deed, stamping and registration formalities, and the PAN and tax registrations that follow.",
    icon: "users",
  }),
  svc("start-a-business", {
    slug: "section-8-ngo",
    title: "Section 8 Company / NGO Registration",
    summary: "Register a not-for-profit entity for charitable or social objectives.",
    overview:
      "A Section 8 company is incorporated for charitable, educational, social or similar objectives, with income applied towards those objects. Incentify assists with objective drafting, licence application, incorporation filing and guidance on the registrations that typically follow.",
    icon: "heart",
  }),
  svc("start-a-business", {
    slug: "startup-india-dpiit",
    title: "Startup India / DPIIT Recognition Assistance",
    summary: "Assistance in preparing and submitting a DPIIT recognition application.",
    overview:
      "DPIIT recognition under the Startup India initiative is available to eligible entities that meet the prescribed criteria on age, turnover and innovation. Incentify assists with eligibility review, preparation of the write-up and supporting documents, and submission of the application. Recognition is granted by the concerned authority.",
    icon: "globe",
  }),

  // ---------- Registrations ----------
  svc("registrations", {
    slug: "gst-registration",
    title: "GST Registration",
    heroTitle: "GST Registration Made Clear",
    summary: "Professional assistance for eligible businesses requiring GST registration.",
    overview:
      "GST registration is required where a business crosses the applicable turnover threshold, makes inter-state supplies, sells through e-commerce operators or falls under a category requiring compulsory registration. It allows a business to issue tax invoices and claim input tax credit as permitted under law. Incentify reviews applicability for your case, prepares the application and follows up on departmental queries until the registration certificate is issued.",
    featured: true,
    icon: "receipt",
    who: [
      "Businesses crossing the applicable turnover threshold",
      "Suppliers making inter-state taxable supplies",
      "Sellers on e-commerce marketplaces",
      "Businesses required to register under a specific category",
      "Entities seeking voluntary registration for input credit or client requirements",
    ],
    helps: [
      "Assessment of whether registration is applicable to you",
      "Selection of the correct registration type and business activity codes",
      "Preparation and submission of the application",
      "Response to clarifications raised by the department",
      "Guidance on invoicing and return obligations after registration",
    ],
    documents: [
      "PAN of the business and of the proprietor, partners or directors",
      "Aadhaar and photograph of the authorised signatory",
      "Certificate of incorporation, partnership deed or equivalent",
      "Proof of principal place of business with owner NOC or rent agreement",
      "Bank account details or a cancelled cheque",
      "Board resolution or authorisation letter, where applicable",
    ],
    faqs: [
      {
        q: "Is GST registration mandatory for every business?",
        a: "No. It applies where the prescribed conditions are met, such as crossing the turnover threshold, making inter-state supplies or supplying through an e-commerce operator. We review applicability before filing.",
      },
      {
        q: "Can registration be obtained voluntarily?",
        a: "Yes. Businesses often register voluntarily to claim input tax credit or to meet customer requirements. Voluntary registration brings the same ongoing return obligations.",
      },
      {
        q: "How long does GST registration take?",
        a: "Timeline varies based on documentation, Aadhaar authentication, physical verification where applicable and departmental processing. We share an indicative schedule after reviewing your case.",
      },
      {
        q: "What happens after registration?",
        a: "Periodic returns become due even for periods with no transactions. We can handle ongoing filing under a separate engagement.",
      },
    ],
  }),
  svc("registrations", {
    slug: "msme-udyam",
    title: "MSME / Udyam Registration",
    summary: "Register your enterprise on the Udyam portal for MSME recognition.",
    overview:
      "Udyam registration records an enterprise as a micro, small or medium enterprise based on investment and turnover criteria. It is commonly requested by lenders, buyers and government portals. Incentify assists with classification, data preparation and submission.",
    featured: true,
    icon: "clipboard",
  }),
  svc("registrations", {
    slug: "fssai",
    title: "FSSAI Registration & Licence",
    summary: "Food business registration and licensing assistance by category.",
    overview:
      "Food businesses require an FSSAI registration or licence depending on turnover, activity and scale. Incentify assists with identifying the correct category — basic registration, state licence or central licence — and preparing the application and supporting documents.",
    icon: "shield",
  }),
  svc("registrations", {
    slug: "import-export-code",
    title: "Import Export Code (IEC)",
    summary: "Obtain the code required for cross-border trade.",
    overview:
      "An Import Export Code is required by businesses importing into or exporting from India. Incentify assists with the application, bank and address documentation and issuance follow-up.",
    icon: "globe",
  }),
  svc("registrations", {
    slug: "digital-signature-certificate",
    title: "Digital Signature Certificate",
    summary: "Class 3 DSC assistance for filings and tenders.",
    overview:
      "A digital signature certificate is used to sign statutory filings, tender documents and other electronic records. Incentify assists with application, video verification coordination and token issuance.",
    icon: "key",
  }),
  svc("registrations", {
    slug: "shop-and-establishment",
    title: "Shop & Establishment Registration",
    summary: "Registration of commercial premises under the applicable state law.",
    overview:
      "Most states require commercial establishments to register their premises and employment details under the shop and establishment legislation. Incentify assists with the state-specific application and renewal.",
    icon: "building",
  }),
  svc("registrations", {
    slug: "professional-tax",
    title: "Professional Tax Registration",
    summary: "Employer and enrolment registrations under state professional tax law.",
    overview:
      "Professional tax applies in several states to employers and to persons carrying on a profession or trade. Incentify assists with employer registration, enrolment and guidance on periodic payment obligations.",
    icon: "receipt",
  }),
  svc("registrations", {
    slug: "epf-esi",
    title: "EPF & ESI Registration",
    summary: "Employer registration and onboarding support for social security schemes.",
    overview:
      "Employers meeting the prescribed headcount and wage criteria are required to register under the provident fund and employees' state insurance schemes. Incentify assists with registration, employee onboarding data and guidance on monthly obligations.",
    icon: "users",
  }),
  svc("registrations", {
    slug: "other-business-licences",
    title: "Other Business Licences",
    summary: "Trade licences, signage and activity-specific approvals.",
    overview:
      "Depending on activity, premises and local rules, a business may require trade licences, signage permissions, pollution consents or other approvals. Share your activity and location and we will confirm what applies to you.",
    icon: "clipboard",
  }),

  // ---------- Tax ----------
  svc("tax", {
    slug: "gst-return-filing",
    title: "GST Return Filing",
    summary: "Monthly, quarterly and annual GST returns prepared and filed on time.",
    overview:
      "Registered businesses must file periodic GST returns even where there are no transactions in a period. Incentify handles data review, outward and inward reconciliation, computation and filing within the applicable due dates, and flags mismatches before they become notices.",
    featured: true,
    icon: "receipt",
  }),
  svc("tax", {
    slug: "gst-amendments",
    title: "GST Amendments",
    summary: "Update core and non-core details on your GST registration.",
    overview:
      "Changes to business address, authorised signatory, business name, additional places of business or other particulars must be recorded through an amendment application. Incentify prepares and files the amendment with supporting documents.",
    icon: "file",
  }),
  svc("tax", {
    slug: "gst-cancellation",
    title: "GST Cancellation & Revocation",
    summary: "Surrender a registration or apply for revocation of cancellation.",
    overview:
      "A registration may be surrendered when a business closes or ceases to be liable, and revocation may be sought where a registration has been cancelled by the department. Incentify assists with pending returns, final return requirements and the application.",
    icon: "file",
  }),
  svc("tax", {
    slug: "gst-reconciliation",
    title: "GST Reconciliation",
    summary: "Match books, returns and portal data to protect input tax credit.",
    overview:
      "Differences between your books, filed returns and supplier-reported data are a common source of credit loss and notices. Incentify performs periodic reconciliation, identifies gaps and recommends corrective action.",
    icon: "calculator",
  }),
  svc("tax", {
    slug: "gst-notices",
    title: "GST Notices & Departmental Communication",
    summary: "Structured assistance in preparing and submitting responses.",
    overview:
      "Notices may arise from return mismatches, credit differences, registration verification or scrutiny. Incentify reviews the notice, compiles supporting records and assists in preparing a documented response within the stated timeline.",
    icon: "scale",
  }),
  svc("tax", {
    slug: "gst-refund",
    title: "GST Refund Assistance",
    summary: "Refund applications for exports, inverted duty and excess balance.",
    overview:
      "Refunds may arise in cases such as exports, an inverted duty structure or excess balance in the electronic cash ledger. Incentify assists with eligibility review, statement preparation, application filing and follow-up. Sanction rests with the department.",
    icon: "coins",
  }),
  svc("tax", {
    slug: "e-invoicing-e-way-bill",
    title: "E-Invoicing & E-Way Bill Support",
    summary: "Setup and day-to-day support for e-invoice and e-way bill compliance.",
    overview:
      "Businesses crossing the prescribed turnover threshold must generate e-invoices, and movement of goods above the specified value requires an e-way bill. Incentify assists with applicability, portal setup, process design and ongoing support.",
    icon: "file",
  }),
  svc("tax", {
    slug: "income-tax",
    title: "Income Tax Return Filing",
    heroTitle: "Income Tax Return Filing",
    summary: "Accurate return preparation for individuals, businesses and entities.",
    overview:
      "Income tax returns must be filed by individuals, firms, LLPs and companies meeting the prescribed conditions. Incentify reviews your income sources, computes taxable income under the applicable provisions, confirms tax credits against Form 26AS and the annual information statement, and files the return within the due date.",
    featured: true,
    icon: "receipt",
    who: [
      "Salaried individuals with additional income sources",
      "Professionals and freelancers",
      "Proprietorships, firms and LLPs",
      "Companies and other entities with filing obligations",
      "Individuals claiming refunds or carrying forward losses",
    ],
    documents: [
      "PAN and Aadhaar",
      "Form 16 or salary details, where applicable",
      "Bank statements and interest certificates",
      "Business or professional income records",
      "Capital gains statements, where applicable",
      "Details of deductions and tax-saving investments",
    ],
  }),
  svc("tax", {
    slug: "tds",
    title: "TDS Compliance",
    summary: "Deduction review, quarterly statements and certificates.",
    overview:
      "Businesses deducting tax at source must deposit it within the prescribed timeline, file quarterly statements and issue certificates. Incentify assists with rate and applicability review, challan preparation, statement filing and correction statements.",
    icon: "file",
  }),
  svc("tax", {
    slug: "advance-tax",
    title: "Advance Tax Planning",
    summary: "Periodic estimation and instalment computation.",
    overview:
      "Where the estimated annual tax liability exceeds the prescribed limit, tax is payable in instalments during the year. Incentify assists with estimation based on interim results, instalment computation and payment guidance.",
    icon: "calculator",
  }),
  svc("tax", {
    slug: "tax-notices",
    title: "Income Tax Notices",
    summary: "Review and response support for departmental communications.",
    overview:
      "Communications may relate to processing adjustments, mismatch in reported income, defective returns or scrutiny. Incentify reviews the notice, compiles supporting documentation and assists in filing a considered response.",
    icon: "scale",
  }),
  svc("tax", {
    slug: "tax-advisory",
    title: "Tax Advisory",
    summary: "Structuring, applicability and record-keeping guidance.",
    overview:
      "Advisory support on transaction structuring, applicability questions, withholding positions and documentation, based on the facts you share and the law as it stands.",
    icon: "scale",
  }),

  // ---------- Compliance ----------
  svc("compliance", {
    slug: "roc-compliance",
    title: "Annual ROC Compliance",
    heroTitle: "Annual ROC Compliance",
    summary: "Annual filings and statutory records maintained through the year.",
    overview:
      "Companies and LLPs must complete annual filings with the Registrar of Companies and maintain statutory registers, minutes and disclosures. Incentify maintains a compliance calendar for your entity, prepares the required resolutions and forms, and files them within the applicable due dates.",
    featured: true,
    icon: "shield",
  }),
  svc("compliance", {
    slug: "company-compliance",
    title: "Private Limited Company Compliance",
    summary: "Board meetings, registers, disclosures and annual filings.",
    overview:
      "Beyond annual filings, companies must hold meetings, record minutes, maintain registers and file event-based forms. Incentify provides a structured secretarial support package aligned to your financial year.",
    icon: "building",
  }),
  svc("compliance", {
    slug: "llp-compliance",
    title: "LLP Annual Compliance",
    summary: "Annual return, statement of accounts and partner records.",
    overview:
      "LLPs must file an annual return and a statement of account and solvency each year, irrespective of turnover. Incentify prepares and files these along with the related records.",
    icon: "users",
  }),
  svc("compliance", {
    slug: "director-kyc",
    title: "Director KYC",
    summary: "Annual KYC filing for directors and designated partners.",
    overview:
      "Every person holding a director identification number must complete an annual KYC filing. Incentify handles verification, filing and confirmation.",
    icon: "key",
  }),
  svc("compliance", {
    slug: "director-change",
    title: "Director Addition or Removal",
    summary: "Board changes documented and filed correctly.",
    overview:
      "Appointments, resignations and removals require board or shareholder approval, supporting consents and filings within the prescribed timeline. Incentify prepares the documentation and completes the filing.",
    icon: "users",
  }),
  svc("compliance", {
    slug: "registered-office-change",
    title: "Registered Office Change",
    summary: "Address change within a city, state or across states.",
    overview:
      "A change in the registered office requires approvals and filings that vary depending on whether the move is within the same jurisdiction or across states. Incentify identifies the applicable route and completes it.",
    icon: "building",
  }),
  svc("compliance", {
    slug: "company-name-change",
    title: "Company Name Change",
    summary: "Name availability, approvals and post-approval updates.",
    overview:
      "Changing a company name involves name availability, shareholder approval, filings and subsequent updates to registrations, records and stationery. Incentify manages the sequence end to end.",
    icon: "file",
  }),
  svc("compliance", {
    slug: "corporate-filings",
    title: "Corporate Filing Assistance",
    summary: "Event-based MCA forms and supporting resolutions.",
    overview:
      "Capital changes, charge creation and satisfaction, auditor appointments and similar events each trigger specific filings. Incentify prepares the resolutions and forms and files them within the applicable timelines.",
    icon: "clipboard",
  }),
  svc("compliance", {
    slug: "company-closure",
    title: "Company Closure / Strike-Off",
    summary: "Orderly closure of a company or LLP that is no longer operating.",
    overview:
      "Entities that have ceased operations remain subject to filing obligations until formally closed. Incentify assists with clearing pending filings, preparing the required declarations and submitting the strike-off application.",
    icon: "file",
  }),

  // ---------- Accounting ----------
  svc("accounting", {
    slug: "bookkeeping",
    title: "Bookkeeping",
    heroTitle: "Bookkeeping & Accounting",
    summary: "Day-to-day recording, reconciliation and periodic closing.",
    overview:
      "Reliable books are the foundation for filings, funding and decisions. Incentify records transactions, reconciles banks and ledgers, maintains supporting documentation and closes each period on a defined schedule.",
    featured: true,
    icon: "calculator",
  }),
  svc("accounting", {
    slug: "payroll",
    title: "Payroll Management",
    summary: "Salary processing, payslips and statutory deductions.",
    overview:
      "Incentify processes monthly payroll, computes deductions, prepares payslips and supports the related statutory filings, with a clear approval trail before disbursement.",
    featured: true,
    icon: "users",
  }),
  svc("accounting", {
    slug: "mis-reporting",
    title: "MIS Reporting",
    summary: "Monthly management reporting on the metrics that matter.",
    overview:
      "A concise monthly pack covering revenue, cost, margin, receivables and cash — designed around the decisions you actually make, and delivered on a fixed date each month.",
    icon: "chart",
  }),
  svc("accounting", {
    slug: "accounts-payable",
    title: "Accounts Payable",
    summary: "Vendor bills, approvals and payment scheduling.",
    overview:
      "Structured processing of vendor invoices with approval workflow, ageing visibility and a payment schedule that protects working capital.",
    icon: "wallet",
  }),
  svc("accounting", {
    slug: "accounts-receivable",
    title: "Accounts Receivable",
    summary: "Invoicing, collection tracking and ageing control.",
    overview:
      "Timely invoicing, systematic follow-up and ageing analysis so that revenue converts to cash without avoidable delay.",
    icon: "coins",
  }),
  svc("accounting", {
    slug: "financial-statements",
    title: "Financial Statements",
    summary: "Year-end statements prepared for filing and review.",
    overview:
      "Preparation of the balance sheet, statement of profit and loss and related schedules in the applicable format, with coordination support for your auditor.",
    icon: "file",
  }),
  svc("accounting", {
    slug: "virtual-cfo",
    title: "Virtual CFO",
    summary: "Senior financial oversight without a full-time hire.",
    overview:
      "Periodic financial leadership covering planning, budgeting, cash flow, reporting discipline, lender and investor readiness, and review of the finance function.",
    featured: true,
    icon: "briefcase",
  }),
  svc("accounting", {
    slug: "cash-flow-management",
    title: "Cash Flow Management",
    summary: "Forecasting and control of inflows and outflows.",
    overview:
      "Rolling cash forecasts, working capital review and payment planning so that obligations are met without unplanned borrowing.",
    icon: "chart",
  }),

  // ---------- Finance ----------
  svc("finance", {
    slug: "business-loan",
    title: "Business Loan Assistance",
    heroTitle: "Business Loan Assistance",
    summary: "Documentation and facilitation support for business credit requirements.",
    overview:
      "Credit applications are assessed on financial history, documentation quality and eligibility. Incentify assists in defining the requirement, preparing a complete and consistent file, and coordinating with partner institutions. Incentify is not a lender and does not sanction or disburse credit.",
    featured: true,
    icon: "coins",
  }),
  svc("finance", {
    slug: "working-capital",
    title: "Working Capital Assistance",
    summary: "Cash credit and overdraft facility documentation support.",
    overview:
      "Assistance in assessing the working capital cycle, preparing the supporting statements lenders typically request and coordinating the application for facilities such as cash credit or overdraft.",
    icon: "wallet",
  }),
  svc("finance", {
    slug: "term-loan",
    title: "Term Loan Assistance",
    summary: "Support for medium and long-term borrowing requirements.",
    overview:
      "Assistance with requirement structuring, repayment capacity assessment and documentation for term borrowing linked to specific business purposes.",
    icon: "bank",
  }),
  svc("finance", {
    slug: "machinery-finance",
    title: "Machinery & Equipment Finance",
    summary: "Documentation assistance for asset purchase funding.",
    overview:
      "Support in compiling quotations, asset details and financial documentation for equipment and machinery funding proposals.",
    icon: "briefcase",
  }),
  svc("finance", {
    slug: "msme-finance",
    title: "MSME Finance Assistance",
    summary: "Support for MSME credit requirements and scheme eligibility review.",
    overview:
      "Assistance for registered MSMEs in reviewing available options, confirming documentation readiness and coordinating applications with partner institutions.",
    icon: "coins",
  }),
  svc("finance", {
    slug: "loan-against-property",
    title: "Loan Against Property Assistance",
    summary: "Property-backed credit documentation support.",
    overview:
      "Assistance in compiling property, title and income documentation for secured credit proposals. Valuation and legal assessment are conducted by the lender's appointed professionals.",
    icon: "building",
  }),
  svc("finance", {
    slug: "invoice-financing",
    title: "Invoice Financing Assistance",
    summary: "Receivable-backed funding documentation support.",
    overview:
      "Assistance in preparing receivable data, customer concentration analysis and documentation for invoice-based funding discussions.",
    icon: "file",
  }),
  svc("finance", {
    slug: "project-finance",
    title: "Project Finance Assistance",
    summary: "Project report and documentation support for larger proposals.",
    overview:
      "Assistance in preparing a structured project report covering scope, cost, funding pattern, projections and assumptions, for submission to financial institutions.",
    icon: "chart",
  }),
  svc("finance", {
    slug: "financial-documentation",
    title: "Financial Documentation Assistance",
    summary: "Lender-ready statements, projections and supporting records.",
    overview:
      "Preparation and organisation of the financial documentation typically requested during credit appraisal, so that queries are reduced and the file is consistent.",
    icon: "clipboard",
  }),

  // ---------- Insurance ----------
  svc("insurance", {
    slug: "business-insurance",
    title: "Business Insurance Assistance",
    heroTitle: "Business Insurance Assistance",
    summary: "Assistance in arranging cover for business risks through partner solutions.",
    overview:
      "Businesses carry exposures across premises, stock, equipment, liability and people. Incentify assists in discussing these exposures, comparing partner-supported options and coordinating documentation. Policies are issued by the insurer and governed by the policy wording.",
    featured: true,
    icon: "shield",
  }),
  svc("insurance", {
    slug: "property-insurance",
    title: "Property & Asset Insurance",
    summary: "Cover assistance for premises, stock and equipment.",
    overview:
      "Assistance in arranging cover for owned or leased premises, inventory, plant and equipment, based on declared values and the insurer's terms.",
    icon: "building",
  }),
  svc("insurance", {
    slug: "employee-insurance",
    title: "Employee Insurance Assistance",
    summary: "Support in arranging employee benefit cover.",
    overview:
      "Assistance in structuring and arranging employee cover, including documentation, census preparation and coordination during issuance and renewal.",
    icon: "users",
  }),
  svc("insurance", {
    slug: "group-health",
    title: "Group Health Cover Assistance",
    summary: "Group medical cover coordination for teams.",
    overview:
      "Assistance in comparing partner-supported group health options, preparing the employee census and coordinating enrolment, endorsements and renewal.",
    icon: "heart",
  }),
  svc("insurance", {
    slug: "professional-indemnity",
    title: "Professional Indemnity Assistance",
    summary: "Cover assistance for professional service liabilities.",
    overview:
      "Assistance for service firms in reviewing professional liability exposure and arranging indemnity cover through partner-supported solutions.",
    icon: "scale",
  }),
  svc("insurance", {
    slug: "general-insurance",
    title: "General Insurance Assistance",
    summary: "Vehicle, transit, marine and other general cover.",
    overview:
      "Assistance in arranging general insurance lines relevant to your operations, including renewal tracking and claim documentation support.",
    icon: "clipboard",
  }),

  // ---------- Advisory ----------
  svc("advisory", {
    slug: "business-planning",
    title: "Business Planning",
    summary: "Structured planning for the next phase of growth.",
    overview:
      "A working plan covering objectives, operating model, resourcing and financial implications — documented in a form that supports internal decisions and external conversations.",
    featured: true,
    icon: "chart",
  }),
  svc("advisory", {
    slug: "financial-planning",
    title: "Financial Planning",
    summary: "Budgets, projections and scenario review.",
    overview:
      "Preparation of budgets and projections with clearly stated assumptions, and periodic review against actual performance.",
    icon: "calculator",
  }),
  svc("advisory", {
    slug: "compliance-advisory",
    title: "Compliance Advisory",
    summary: "A consolidated view of what applies to your business.",
    overview:
      "A review of registrations, filings and obligations applicable to your entity, with a calendar and a remediation plan for pending items.",
    icon: "shield",
  }),
  svc("advisory", {
    slug: "risk-management",
    title: "Risk Management",
    summary: "Identification and mitigation of operational and financial risk.",
    overview:
      "A structured review of financial, operational, compliance and continuity risks, with practical controls proportionate to the size of the business.",
    icon: "scale",
  }),
  svc("advisory", {
    slug: "growth-advisory",
    title: "Growth Advisory",
    summary: "Support for expansion, new lines and structural decisions.",
    overview:
      "Advisory support for expansion decisions — new locations, entities or lines of business — covering financial, compliance and structural implications.",
    icon: "globe",
  }),
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export const servicesByCategory = (slug: string) => services.filter((s) => s.category === slug);

export const findService = (category: string, slug: string) =>
  services.find((s) => s.category === category && s.slug === slug);

export const featuredServices = services.filter((s) => s.featured);

export const servicePath = (s: { category: string; slug: string }) => `/${s.category}/${s.slug}`;

export const resolved = (s: Service & { category: string }) => {
  const cat = categoryBySlug(s.category)!;
  return {
    category: cat,
    who: s.who ?? cat.defaults.who,
    helps: s.helps ?? cat.defaults.helps,
    documents: s.documents ?? cat.defaults.documents,
    process: s.process ?? cat.defaults.process,
    faqs: s.faqs ?? cat.defaults.faqs,
  };
};

export const serviceOptions = [
  "Business Registration",
  "GST",
  "Income Tax",
  "ROC Compliance",
  "Accounting",
  "Payroll",
  "Business Loan",
  "Insurance",
  "Business Advisory",
  "Other",
];

export const businessTypes = [
  "Not yet registered",
  "Proprietorship",
  "Partnership Firm",
  "LLP",
  "Private Limited Company",
  "One Person Company",
  "Public Limited Company",
  "Trust / Society / Section 8",
  "Individual / Professional",
];
