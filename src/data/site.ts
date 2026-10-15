export const site = {
  legalName: "Incentify Private Limited",
  name: "Incentify",
  tagline: "Start. Comply. Fund. Grow.",
  description:
    "One professional platform for business registration, taxation, corporate compliance, accounting, finance and advisory services.",
  domain: "incentify.in",
  url: "https://incentify.in",
  email: "info@incentify.in",
  phone: "+91 9000988803",
  phoneHref: "+919000988803",
  whatsapp: "919000988803",
  address: {
    line1: "D No. 7-1-621/13, Flat 202",
    line2: "Sanjeev Reddy Nagar",
    city: "Hyderabad",
    postalCode: "500038",
    state: "Telangana",
    country: "India",
  },
  hours: "Monday – Saturday, 10:00 AM – 6:00 PM IST",
  mapQuery:
    "D No. 7-1-621/13, Flat 202, Sanjeev Reddy Nagar, Hyderabad 500038, Telangana, India",
  social: {
    linkedin: "https://www.linkedin.com/in/incentify",
    instagram: "https://www.instagram.com/incentify_26_/",
    youtube: "https://www.youtube.com/@incentifyofficial",
  },
} as const;

export const fullAddress = `${site.address.line1}, ${site.address.line2}, ${site.address.city} – ${site.address.postalCode}, ${site.address.state}, ${site.address.country}`;

export const whatsappLink = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  "Hello Incentify, I would like assistance with a business service.",
)}`;

export const legalDisclaimer =
  "Services, eligibility, timelines and outcomes may vary depending on individual circumstances, applicable laws, documentation and third-party or regulatory approvals.";
