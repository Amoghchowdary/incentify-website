import { APPS_SCRIPT_URL, USE_MOCK_BACKEND, isAppsScriptConfigured } from "@/config/backend";
import type {
  PortalApiResult,
  PortalDashboard,
  PortalPartnerLeadInput,
  PortalProduct,
  PortalRegistrationInput,
  PortalRegistrationRequest,
  PortalRegistrationVerification,
  PortalRole,
  PortalService,
  PortalSession,
} from "@/lib/portal-types";

const SESSION_KEY = "incentify.portal.session.v12";
const BRIDGE_SOURCE = "INCENTIFY_PORTAL_V12";
const REQUEST_TIMEOUT_MS = 25000;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readPortalSession(): PortalSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PortalSession;
    if (!parsed?.token || !parsed?.role || !parsed?.email) return null;
    if (parsed.expiresAt && Date.parse(parsed.expiresAt) <= Date.now()) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePortalSession(session: PortalSession) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPortalSession() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

function isAllowedBridgeOrigin(origin: string) {
  return (
    origin === "https://script.google.com" ||
    origin.endsWith(".googleusercontent.com") ||
    origin === "https://script.googleusercontent.com"
  );
}

async function bridgeRequest<T>(
  action: string,
  payload: Record<string, unknown>,
  sessionToken = "",
): Promise<PortalApiResult<T>> {
  if (!isBrowser()) return { ok: false, error: "Portal requests require a browser." };
  if (!isAppsScriptConfigured()) return { ok: false, error: "The portal backend is not configured." };

  const requestId = createId("portal");
  const frameName = `incentify_portal_bridge_${requestId.replace(/[^A-Za-z0-9_]/g, "_")}`;
  const iframe = document.createElement("iframe");
  iframe.name = frameName;
  iframe.title = "Incentify secure portal request";
  iframe.hidden = true;
  iframe.setAttribute("aria-hidden", "true");

  const form = document.createElement("form");
  form.method = "POST";
  form.action = APPS_SCRIPT_URL;
  form.target = frameName;
  form.hidden = true;

  const transport = document.createElement("input");
  transport.type = "hidden";
  transport.name = "transport";
  transport.value = "bridge";

  const body = document.createElement("input");
  body.type = "hidden";
  body.name = "payload";
  body.value = JSON.stringify({ requestId, origin: window.location.origin, action, sessionToken, data: payload });

  form.append(transport, body);
  document.body.append(iframe, form);

  return await new Promise<PortalApiResult<T>>((resolve) => {
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      form.remove();
      iframe.remove();
    };
    const finish = (result: PortalApiResult<T>) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (!isAllowedBridgeOrigin(event.origin)) return;
      const data = event.data as { source?: string; requestId?: string; response?: PortalApiResult<T> };
      if (data?.source !== BRIDGE_SOURCE || data.requestId !== requestId || !data.response) return;
      finish(data.response);
    };
    const timeoutId = window.setTimeout(
      () => finish({ ok: false, error: "The portal request timed out. Please retry." }),
      REQUEST_TIMEOUT_MS,
    );
    window.addEventListener("message", onMessage);
    try {
      form.submit();
    } catch (error) {
      if (import.meta.env.DEV) console.error("[portal] bridge submission failed", error);
      finish({ ok: false, error: "The portal request could not be started. Please retry." });
    }
  });
}

const now = () => new Date().toISOString();
const serviceSeed: PortalService[] = [
  { serviceId: "SRV-COMPANY-REG", name: "Private Limited Company Registration", category: "Registration", description: "Company incorporation and setup coordination.", active: true, sortOrder: 10 },
  { serviceId: "SRV-GST-REG", name: "GST Registration", category: "Tax", description: "GST registration assistance and document coordination.", active: true, sortOrder: 20 },
  { serviceId: "SRV-ROC", name: "ROC Compliance", category: "Compliance", description: "Recurring company and ROC compliance support.", active: true, sortOrder: 40 },
];
const productSeed: PortalProduct[] = [
  { productId: "PRD-START", name: "Start", description: "Business setup and registration bundle.", billingModel: "Project", active: true, sortOrder: 10 },
  { productId: "PRD-COMPLY", name: "Comply", description: "Recurring compliance coordination.", billingModel: "Recurring", active: true, sortOrder: 20 },
];

function mockDashboard(role: PortalRole): PortalDashboard {
  const partnerLead = {
    leadId: "PLEAD-DEMO-001",
    partnerId: "PAR-DEMO",
    partnerName: "Demo Partner Practice",
    contactName: "Ravi Kumar",
    phone: "+91 9000000010",
    email: "ravi@example.com",
    businessName: "Ravi Ventures",
    businessStructure: "Proposed Private Limited",
    city: "Hyderabad",
    state: "Telangana",
    serviceId: "SRV-COMPANY-REG",
    serviceName: "Private Limited Company Registration",
    productId: "PRD-START",
    productName: "Start",
    notes: "Lead requires incorporation support.",
    status: "NEW",
    customerId: "",
    assignmentId: "",
    createdAt: now(),
    updatedAt: now(),
  };
  const assignment = {
    assignmentId: "ASN-DEMO-001",
    customerId: "CUS-DEMO",
    partnerId: "PAR-DEMO",
    serviceId: "SRV-GST-REG",
    serviceName: "GST Registration",
    productId: "PRD-COMPLY",
    productName: "Comply",
    status: "IN_PROGRESS",
    priority: "NORMAL",
    startedAt: now(),
    dueDate: "",
    updatedAt: now(),
    createdAt: now(),
  };
  const common = {
    version: "12.0.0-mock",
    services: serviceSeed.map((x) => ({ ...x })),
    products: productSeed.map((x) => ({ ...x })),
    assignments: [assignment],
    workflow: [{ workflowId: "WF-DEMO-001", assignmentId: assignment.assignmentId, status: "IN_PROGRESS", note: "Documents under review.", actorUserId: "USR-DEMO", actorRole: role, createdAt: now() }],
    documents: [],
    partnerLeads: role === "customer" ? [] : [partnerLead],
    customers: role === "admin" ? [{ customerId: "CUS-DEMO", businessName: "Demo Customer Business", contactName: "Demo Customer", email: "customer@example.com", phone: "+91 9000000000", status: "ACTIVE", createdAt: now(), updatedAt: now() }] : [],
    partners: role === "admin" ? [{ partnerId: "PAR-DEMO", businessName: "Demo Partner Practice", contactName: "Demo Partner", email: "partner@example.com", phone: "+91 9000000001", status: "ACTIVE", active: true, serviceIds: ["SRV-COMPANY-REG", "SRV-GST-REG"], productIds: ["PRD-START"], createdAt: now(), updatedAt: now() }] : [],
    registrations: role === "admin" ? [{ requestId: "REG-DEMO", email: "pending@example.com", role: "partner", displayName: "Pending Partner", phone: "+91 9000000002", businessName: "Pending Practice", status: "PENDING_APPROVAL", createdAt: now(), updatedAt: now() }] : [],
  };
  if (role === "admin") {
    return { ...common, profile: { userId: "USR-DEMO-ADMIN", email: "admin@incentify.in", role, displayName: "Incentify Admin", entityId: "ADM-DEMO", entityName: "Incentify Private Limited", phone: "+91 9000988803", businessName: "Incentify Private Limited", active: true } };
  }
  if (role === "partner") {
    return { ...common, profile: { userId: "USR-DEMO-PARTNER", email: "partner@example.com", role, displayName: "Demo Partner", entityId: "PAR-DEMO", entityName: "Demo Partner Practice", phone: "+91 9000000001", businessName: "Demo Partner Practice", active: true }, customers: [], partners: [], registrations: [] };
  }
  return { ...common, products: [], partnerLeads: [], customers: [], partners: [], registrations: [], profile: { userId: "USR-DEMO-CUSTOMER", email: "customer@example.com", role, displayName: "Demo Customer", entityId: "CUS-DEMO", entityName: "Demo Customer Business", phone: "+91 9000000000", businessName: "Demo Customer Business", active: true } };
}

const mockData: Record<PortalRole, PortalDashboard> = {
  customer: mockDashboard("customer"),
  partner: mockDashboard("partner"),
  admin: mockDashboard("admin"),
};

function cloneMock<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
async function mockDelay() {
  await new Promise((resolve) => window.setTimeout(resolve, 180));
}

export async function requestPortalOtp(email: string, role: PortalRole) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    return { ok: true, data: { message: "Demo OTP generated. Use 123456.", delivery: "mock" } } as PortalApiResult<{ message: string; delivery: string }>;
  }
  return bridgeRequest<{ message: string; delivery: string }>("requestOtp", { email, role });
}

export async function verifyPortalOtp(email: string, role: PortalRole, otp: string) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    if (otp !== "123456") return { ok: false, error: "For local demo mode, use OTP 123456." } as const;
    const dashboard = cloneMock(mockData[role]);
    dashboard.profile.email = email;
    const session: PortalSession = { token: `mock-${role}-${Date.now()}`, role, email, displayName: dashboard.profile.displayName, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() };
    savePortalSession(session);
    return { ok: true, data: { session, dashboard } } as PortalApiResult<{ session: PortalSession; dashboard: PortalDashboard }>;
  }
  const result = await bridgeRequest<{ session: PortalSession; dashboard: PortalDashboard }>("verifyOtp", { email, role, otp });
  if (result.ok) savePortalSession(result.data.session);
  return result;
}

export async function requestPortalRegistrationOtp(input: PortalRegistrationInput) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    return { ok: true, data: { requestId: `REG-MOCK-${Date.now()}`, message: "Demo registration OTP generated. Use 123456.", delivery: "mock" } } as PortalApiResult<PortalRegistrationRequest>;
  }
  return bridgeRequest<PortalRegistrationRequest>("requestRegistrationOtp", { ...input });
}

export async function verifyPortalRegistrationOtp(requestId: string, role: Exclude<PortalRole, "admin">, email: string, otp: string) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    if (otp !== "123456") return { ok: false, error: "For local demo mode, use OTP 123456." } as const;
    if (role === "partner") return { ok: true, data: { pendingApproval: true, message: "Partner email verified. The account is pending Incentify approval." } } as PortalApiResult<PortalRegistrationVerification>;
    const dashboard = cloneMock(mockData.customer);
    dashboard.profile.email = email;
    const session: PortalSession = { token: `mock-customer-${Date.now()}`, role: "customer", email, displayName: dashboard.profile.displayName, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() };
    savePortalSession(session);
    return { ok: true, data: { pendingApproval: false, message: "Customer account created.", session, dashboard } } as PortalApiResult<PortalRegistrationVerification>;
  }
  const result = await bridgeRequest<PortalRegistrationVerification>("verifyRegistrationOtp", { requestId, role, email, otp });
  if (result.ok && result.data.session) savePortalSession(result.data.session);
  return result;
}

export async function getPortalDashboard(session: PortalSession) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const dashboard = cloneMock(mockData[session.role]);
    dashboard.profile.email = session.email;
    return { ok: true, data: dashboard } as PortalApiResult<PortalDashboard>;
  }
  return bridgeRequest<PortalDashboard>("getDashboard", {}, session.token);
}

export async function logoutPortal(session: PortalSession) {
  if (USE_MOCK_BACKEND) {
    clearPortalSession();
    return { ok: true, data: { loggedOut: true } } as PortalApiResult<{ loggedOut: boolean }>;
  }
  const result = await bridgeRequest<{ loggedOut: boolean }>("logout", {}, session.token);
  clearPortalSession();
  return result;
}

export async function updatePortalProfile(session: PortalSession, fields: { displayName: string; phone: string; businessName: string }) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const dashboard = mockData[session.role];
    Object.assign(dashboard.profile, { displayName: fields.displayName, phone: fields.phone, businessName: fields.businessName, entityName: fields.businessName || fields.displayName });
    return { ok: true, data: { updated: true } } as PortalApiResult<{ updated: boolean }>;
  }
  return bridgeRequest<{ updated: boolean }>("updateProfile", fields, session.token);
}

export async function updatePortalAssignmentStatus(session: PortalSession, assignmentId: string, status: string) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const assignment = mockData[session.role].assignments.find((item) => item.assignmentId === assignmentId);
    if (assignment) Object.assign(assignment, { status, updatedAt: now() });
    return { ok: true, data: { updated: true } } as PortalApiResult<{ updated: boolean }>;
  }
  return bridgeRequest<{ updated: boolean }>("updateAssignmentStatus", { assignmentId, status }, session.token);
}

export async function addPortalWorkflowNote(session: PortalSession, assignmentId: string, note: string) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    mockData[session.role].workflow.unshift({ workflowId: createId("WF"), assignmentId, status: "NOTE", note, actorUserId: mockData[session.role].profile.userId, actorRole: session.role, createdAt: now() });
    return { ok: true, data: { created: true } } as PortalApiResult<{ created: boolean }>;
  }
  return bridgeRequest<{ created: boolean }>("addWorkflowNote", { assignmentId, note }, session.token);
}

export async function addPortalDocumentLink(session: PortalSession, assignmentId: string, label: string, url: string) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    mockData[session.role].documents.unshift({ documentId: createId("DOC"), assignmentId, label, url, status: "SUBMITTED", addedBy: mockData[session.role].profile.userId, createdAt: now() });
    return { ok: true, data: { created: true } } as PortalApiResult<{ created: boolean }>;
  }
  return bridgeRequest<{ created: boolean }>("addDocumentLink", { assignmentId, label, url }, session.token);
}

export async function submitPartnerLead(session: PortalSession, input: PortalPartnerLeadInput) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const service = mockData.partner.services.find((item) => item.serviceId === input.serviceId);
    const product = mockData.partner.products.find((item) => item.productId === input.productId);
    const lead = { leadId: createId("PLEAD"), partnerId: mockData.partner.profile.entityId, partnerName: mockData.partner.profile.businessName, ...input, serviceName: service?.name || input.serviceId, productName: product?.name || "", status: "NEW", customerId: "", assignmentId: "", createdAt: now(), updatedAt: now() };
    mockData.partner.partnerLeads.unshift(lead);
    mockData.admin.partnerLeads.unshift(cloneMock(lead));
    return { ok: true, data: { leadId: lead.leadId } } as PortalApiResult<{ leadId: string }>;
  }
  return bridgeRequest<{ leadId: string }>("submitPartnerLead", input, session.token);
}

export async function adminUpsertService(session: PortalSession, service: Partial<PortalService> & Pick<PortalService, "name" | "category" | "description">) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const target = mockData.admin.services.find((item) => item.serviceId === service.serviceId);
    if (target) Object.assign(target, service);
    else mockData.admin.services.push({ serviceId: createId("SRV").toUpperCase(), name: service.name, category: service.category, description: service.description, active: service.active !== false, sortOrder: service.sortOrder || 999 });
    return { ok: true, data: { saved: true } } as PortalApiResult<{ saved: boolean }>;
  }
  return bridgeRequest<{ saved: boolean }>("adminUpsertService", service as Record<string, unknown>, session.token);
}

export async function adminUpsertProduct(session: PortalSession, product: Partial<PortalProduct> & Pick<PortalProduct, "name" | "description" | "billingModel">) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const target = mockData.admin.products.find((item) => item.productId === product.productId);
    if (target) Object.assign(target, product);
    else mockData.admin.products.push({ productId: createId("PRD").toUpperCase(), name: product.name, description: product.description, billingModel: product.billingModel, active: product.active !== false, sortOrder: product.sortOrder || 999 });
    return { ok: true, data: { saved: true } } as PortalApiResult<{ saved: boolean }>;
  }
  return bridgeRequest<{ saved: boolean }>("adminUpsertProduct", product as Record<string, unknown>, session.token);
}

export async function adminSetPartnerStatus(session: PortalSession, partnerId: string, status: "ACTIVE" | "INACTIVE" | "REJECTED") {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const partner = mockData.admin.partners.find((item) => item.partnerId === partnerId);
    if (partner) Object.assign(partner, { status, active: status === "ACTIVE", updatedAt: now() });
    return { ok: true, data: { updated: true } } as PortalApiResult<{ updated: boolean }>;
  }
  return bridgeRequest<{ updated: boolean }>("adminSetPartnerStatus", { partnerId, status }, session.token);
}

export async function adminSetPartnerCatalogAccess(
  session: PortalSession,
  partnerId: string,
  itemType: "SERVICE" | "PRODUCT",
  itemId: string,
  active: boolean,
) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const partner = mockData.admin.partners.find((item) => item.partnerId === partnerId);
    if (partner) {
      const target = itemType === "SERVICE" ? partner.serviceIds : partner.productIds;
      const has = target.includes(itemId);
      if (active && !has) target.push(itemId);
      if (!active && has) target.splice(target.indexOf(itemId), 1);
    }
    return { ok: true, data: { updated: true } } as PortalApiResult<{ updated: boolean }>;
  }
  return bridgeRequest<{ updated: boolean }>(
    "adminSetPartnerCatalogAccess",
    { partnerId, itemType, itemId, active },
    session.token,
  );
}

export async function adminUpdatePartnerLeadStatus(session: PortalSession, leadId: string, status: string) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const lead = mockData.admin.partnerLeads.find((item) => item.leadId === leadId);
    if (lead) Object.assign(lead, { status, updatedAt: now() });
    return { ok: true, data: { updated: true } } as PortalApiResult<{ updated: boolean }>;
  }
  return bridgeRequest<{ updated: boolean }>("adminUpdatePartnerLeadStatus", { leadId, status }, session.token);
}

export async function adminConvertPartnerLead(session: PortalSession, leadId: string, dueDate = "", priority = "NORMAL") {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    const lead = mockData.admin.partnerLeads.find((item) => item.leadId === leadId);
    if (!lead) return { ok: false, error: "Lead not found." } as PortalApiResult<{ assignmentId: string }>;
    const assignmentId = createId("ASN");
    Object.assign(lead, { status: "CONVERTED", customerId: "CUS-MOCK-NEW", assignmentId, updatedAt: now() });
    return { ok: true, data: { assignmentId } } as PortalApiResult<{ assignmentId: string }>;
  }
  return bridgeRequest<{ assignmentId: string }>("adminConvertPartnerLead", { leadId, dueDate, priority }, session.token);
}

export async function adminCreateAssignment(session: PortalSession, input: { customerId: string; partnerId: string; serviceId: string; productId: string; priority: string; dueDate: string }) {
  if (USE_MOCK_BACKEND) {
    await mockDelay();
    return { ok: true, data: { assignmentId: createId("ASN") } } as PortalApiResult<{ assignmentId: string }>;
  }
  return bridgeRequest<{ assignmentId: string }>("adminCreateAssignment", input, session.token);
}
