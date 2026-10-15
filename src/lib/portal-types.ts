export type PortalRole = "customer" | "partner" | "admin";
export type PortalAuthMode = "login" | "register";

export type PortalSession = {
  token: string;
  role: PortalRole;
  email: string;
  displayName: string;
  expiresAt: string;
};

export type PortalRegistrationInput = {
  role: Exclude<PortalRole, "admin">;
  email: string;
  displayName: string;
  phone: string;
  businessName: string;
  acceptedTerms: boolean;
};

export type PortalRegistrationRequest = {
  requestId: string;
  message: string;
  delivery: "email" | "mock";
};

export type PortalRegistrationVerification = {
  pendingApproval: boolean;
  message: string;
  session?: PortalSession;
  dashboard?: PortalDashboard;
};

export type PortalUserProfile = {
  userId: string;
  email: string;
  role: PortalRole;
  displayName: string;
  entityId: string;
  entityName: string;
  phone: string;
  businessName: string;
  active: boolean;
};

export type PortalService = {
  serviceId: string;
  name: string;
  category: string;
  description: string;
  active: boolean;
  sortOrder?: number;
};

export type PortalProduct = {
  productId: string;
  name: string;
  description: string;
  billingModel: string;
  active: boolean;
  sortOrder?: number;
};

export type PortalAssignment = {
  assignmentId: string;
  customerId: string;
  partnerId: string;
  serviceId: string;
  serviceName: string;
  productId: string;
  productName: string;
  status: string;
  priority: string;
  startedAt: string;
  dueDate: string;
  updatedAt: string;
  createdAt: string;
};

export type PortalWorkflowItem = {
  workflowId: string;
  assignmentId: string;
  status: string;
  note: string;
  actorUserId: string;
  actorRole: string;
  createdAt: string;
};

export type PortalDocument = {
  documentId: string;
  assignmentId: string;
  label: string;
  url: string;
  status: string;
  addedBy: string;
  createdAt: string;
};

export type PortalPartnerLead = {
  leadId: string;
  partnerId: string;
  partnerName: string;
  contactName: string;
  phone: string;
  email: string;
  businessName: string;
  businessStructure: string;
  city: string;
  state: string;
  serviceId: string;
  serviceName: string;
  productId: string;
  productName: string;
  notes: string;
  status: string;
  customerId: string;
  assignmentId: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalPartnerLeadInput = {
  contactName: string;
  phone: string;
  email: string;
  businessName: string;
  businessStructure: string;
  city: string;
  state: string;
  serviceId: string;
  productId: string;
  notes: string;
};

export type PortalCustomerSummary = {
  customerId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalPartnerSummary = {
  partnerId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  active: boolean;
  serviceIds: string[];
  productIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type PortalRegistrationSummary = {
  requestId: string;
  email: string;
  role: string;
  displayName: string;
  phone: string;
  businessName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalDashboard = {
  version: string;
  profile: PortalUserProfile;
  services: PortalService[];
  products: PortalProduct[];
  assignments: PortalAssignment[];
  workflow: PortalWorkflowItem[];
  documents: PortalDocument[];
  partnerLeads: PortalPartnerLead[];
  customers: PortalCustomerSummary[];
  partners: PortalPartnerSummary[];
  registrations: PortalRegistrationSummary[];
};

export type PortalApiSuccess<T = unknown> = {
  ok: true;
  data: T;
};

export type PortalApiFailure = {
  ok: false;
  error: string;
};

export type PortalApiResult<T = unknown> = PortalApiSuccess<T> | PortalApiFailure;
