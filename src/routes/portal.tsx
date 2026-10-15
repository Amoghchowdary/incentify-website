import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleUserRound,
  FileText,
  Handshake,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  PackageCheck,
  Phone,
  PlusCircle,
  RefreshCw,
  Route as RouteIcon,
  Settings,
  ShieldCheck,
  UploadCloud,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { pageHead } from "@/lib/seo";
import {
  addPortalDocumentLink,
  addPortalWorkflowNote,
  adminConvertPartnerLead,
  adminCreateAssignment,
  adminSetPartnerCatalogAccess,
  adminSetPartnerStatus,
  adminUpdatePartnerLeadStatus,
  adminUpsertProduct,
  adminUpsertService,
  clearPortalSession,
  getPortalDashboard,
  logoutPortal,
  readPortalSession,
  requestPortalOtp,
  requestPortalRegistrationOtp,
  submitPartnerLead,
  updatePortalAssignmentStatus,
  updatePortalProfile,
  verifyPortalOtp,
  verifyPortalRegistrationOtp,
} from "@/lib/portal-api";
import type {
  PortalAssignment,
  PortalAuthMode,
  PortalDashboard,
  PortalPartnerLeadInput,
  PortalProduct,
  PortalRegistrationInput,
  PortalRole,
  PortalService,
  PortalSession,
} from "@/lib/portal-types";
import { USE_MOCK_BACKEND } from "@/config/backend";

export const Route = createFileRoute("/portal")({
  validateSearch: (search: Record<string, unknown>) => ({
    role:
      search["role"] === "partner"
        ? ("partner" as const)
        : search["role"] === "admin"
          ? ("admin" as const)
          : ("customer" as const),
  }),
  head: () =>
    pageHead({
      title: "Secure Customer & Partner Portal | Incentify",
      description:
        "Secure Incentify customer and partner portal with email OTP access, service tracking and partner workflows.",
      path: "/portal",
      robots: "noindex,nofollow,noarchive,nosnippet",
    }),
  component: PortalPage,
});

type PortalTab =
  | "overview"
  | "leads"
  | "services"
  | "products"
  | "partners"
  | "customers"
  | "flow"
  | "documents"
  | "settings";

const blankRegistration = (role: Exclude<PortalRole, "admin">): PortalRegistrationInput => ({
  role,
  email: "",
  displayName: "",
  phone: "",
  businessName: "",
  acceptedTerms: false,
});

function PortalPage() {
  const search = Route.useSearch();
  const [role, setRole] = useState<PortalRole>(search.role);
  const [authMode, setAuthMode] = useState<PortalAuthMode>("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [registration, setRegistration] = useState<PortalRegistrationInput>(() => blankRegistration("customer"));
  const [registrationRequestId, setRegistrationRequestId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [session, setSession] = useState<PortalSession | null>(null);
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [tab, setTab] = useState<PortalTab>("overview");

  useEffect(() => {
    const saved = readPortalSession();
    if (!saved) return;
    setSession(saved);
    setRole(saved.role);
    setEmail(saved.email);
    void refreshDashboard(saved);
  }, []);

  useEffect(() => {
    if (session) return;
    setRole(search.role);
    if (search.role === "admin") setAuthMode("login");
    if (search.role === "customer" || search.role === "partner") {
      setRegistration((current) => ({ ...current, role: search.role as "customer" | "partner" }));
    }
  }, [search.role, session]);

  async function refreshDashboard(currentSession = session) {
    if (!currentSession) return;
    setBusy(true);
    setError("");
    const result = await getPortalDashboard(currentSession);
    if (result.ok) {
      setDashboard(result.data);
    } else {
      if (/session|expired|authoriz/i.test(result.error)) {
        clearPortalSession();
        setSession(null);
        setDashboard(null);
      }
      setError(result.error);
    }
    setBusy(false);
  }

  function resetOtpState() {
    setOtp("");
    setOtpSent(false);
    setRegistrationRequestId("");
    setError("");
    setNotice("");
  }

  function changeRole(nextRole: PortalRole) {
    setRole(nextRole);
    if (nextRole === "admin") {
      setAuthMode("login");
    } else {
      setRegistration((current) => ({ ...current, role: nextRole }));
    }
    resetOtpState();
  }

  function changeAuthMode(nextMode: PortalAuthMode) {
    if (role === "admin" && nextMode === "register") return;
    setAuthMode(nextMode);
    resetOtpState();
  }

  async function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const result = await requestPortalOtp(email.trim(), role);
    if (result.ok) {
      setOtpSent(true);
      setNotice(result.data.message || "A one-time code has been sent to your registered email address.");
    } else setError(result.error);
    setBusy(false);
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await verifyPortalOtp(email.trim(), role, otp.trim());
    if (result.ok) {
      setSession(result.data.session);
      setDashboard(result.data.dashboard);
      setNotice("");
      setTab("overview");
    } else setError(result.error);
    setBusy(false);
  }

  async function handleRequestRegistrationOtp(event: FormEvent) {
    event.preventDefault();
    if (role === "admin") return;
    setBusy(true);
    setError("");
    setNotice("");
    const payload: PortalRegistrationInput = {
      ...registration,
      role,
      email: registration.email.trim(),
      displayName: registration.displayName.trim(),
      phone: registration.phone.trim(),
      businessName: registration.businessName.trim(),
    };
    const result = await requestPortalRegistrationOtp(payload);
    if (result.ok) {
      setRegistrationRequestId(result.data.requestId);
      setOtpSent(true);
      setNotice(result.data.message || "A registration verification code has been sent by email.");
    } else setError(result.error);
    setBusy(false);
  }

  async function handleVerifyRegistrationOtp(event: FormEvent) {
    event.preventDefault();
    if (role === "admin") return;
    setBusy(true);
    setError("");
    const result = await verifyPortalRegistrationOtp(
      registrationRequestId,
      role,
      registration.email.trim(),
      otp.trim(),
    );
    if (result.ok) {
      if (result.data.pendingApproval) {
        setAuthMode("login");
        setEmail(registration.email.trim());
        setOtp("");
        setOtpSent(false);
        setRegistrationRequestId("");
        setError("");
        setNotice(result.data.message);
      } else if (result.data.session && result.data.dashboard) {
        setSession(result.data.session);
        setDashboard(result.data.dashboard);
        setNotice("");
        setTab("overview");
      } else setNotice(result.data.message);
    } else setError(result.error);
    setBusy(false);
  }

  async function handleLogout() {
    if (session) await logoutPortal(session);
    clearPortalSession();
    setSession(null);
    setDashboard(null);
    resetOtpState();
  }

  if (!session || !dashboard) {
    return (
      <AuthScreen
        role={role}
        setRole={changeRole}
        authMode={authMode}
        setAuthMode={changeAuthMode}
        email={email}
        setEmail={setEmail}
        registration={registration}
        setRegistration={setRegistration}
        otp={otp}
        setOtp={setOtp}
        otpSent={otpSent}
        busy={busy}
        error={error}
        notice={notice}
        onRequestOtp={handleRequestOtp}
        onVerifyOtp={handleVerifyOtp}
        onRequestRegistrationOtp={handleRequestRegistrationOtp}
        onVerifyRegistrationOtp={handleVerifyRegistrationOtp}
        onReset={resetOtpState}
      />
    );
  }

  return (
    <PortalDashboardView
      session={session}
      dashboard={dashboard}
      tab={tab}
      setTab={setTab}
      busy={busy}
      error={error}
      notice={notice}
      setError={setError}
      setNotice={setNotice}
      refresh={() => refreshDashboard(session)}
      logout={handleLogout}
    />
  );
}

function AuthScreen({
  role,
  setRole,
  authMode,
  setAuthMode,
  email,
  setEmail,
  registration,
  setRegistration,
  otp,
  setOtp,
  otpSent,
  busy,
  error,
  notice,
  onRequestOtp,
  onVerifyOtp,
  onRequestRegistrationOtp,
  onVerifyRegistrationOtp,
  onReset,
}: {
  role: PortalRole;
  setRole: (role: PortalRole) => void;
  authMode: PortalAuthMode;
  setAuthMode: (mode: PortalAuthMode) => void;
  email: string;
  setEmail: (email: string) => void;
  registration: PortalRegistrationInput;
  setRegistration: (value: PortalRegistrationInput) => void;
  otp: string;
  setOtp: (otp: string) => void;
  otpSent: boolean;
  busy: boolean;
  error: string;
  notice: string;
  onRequestOtp: (event: FormEvent) => void;
  onVerifyOtp: (event: FormEvent) => void;
  onRequestRegistrationOtp: (event: FormEvent) => void;
  onVerifyRegistrationOtp: (event: FormEvent) => void;
  onReset: () => void;
}) {
  const updateRegistration = (patch: Partial<PortalRegistrationInput>) =>
    setRegistration({ ...registration, ...patch });
  const roleLabel = role === "customer" ? "Customer" : role === "partner" ? "Partner" : "Admin";

  return (
    <section className="bg-secondary/45 py-12 md:py-20">
      <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-raised md:p-10">
          <p className="text-xs font-bold tracking-[0.16em] text-primary-foreground/65 uppercase">Incentify V12 Portal</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Customers and partners in one controlled workflow.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/78">
            Email OTP access powers customer service tracking and partner workflows. No portal password is stored in the browser or Google Sheets.
          </p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <PortalBenefit icon={CircleUserRound} title="Customer portal" text="Track assigned services, workflow updates and shared documents." />
            <PortalBenefit icon={Handshake} title="Partner portal" text="Submit new business leads and manage assigned service work." />
            <PortalBenefit icon={ShieldCheck} title="Role-protected access" text="Customer and partner access remain separated and protected by verified email OTP." />
            <PortalBenefit icon={KeyRound} title="Official email OTP" text="Login and registration verification use the Apps Script mail service." />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 shadow-card md:p-10">
          {role !== "admin" && (
            <div className="grid grid-cols-2 gap-2">
              {(["customer", "partner"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-bold transition-colors ${
                    role === item ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item === "customer" ? "Customer Login" : "Partner Login"}
                </button>
              ))}
            </div>
          )}

          {role !== "admin" && (
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1.5">
              <button type="button" onClick={() => setAuthMode("login")} className={`min-h-11 rounded-lg px-4 text-sm font-bold ${authMode === "login" ? "bg-background text-primary shadow-card" : "text-muted-foreground"}`}>Login</button>
              <button type="button" onClick={() => setAuthMode("register")} className={`min-h-11 rounded-lg px-4 text-sm font-bold ${authMode === "register" ? "bg-background text-primary shadow-card" : "text-muted-foreground"}`}>Register</button>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {role === "admin" ? <ShieldCheck className="h-5 w-5" /> : authMode === "register" ? <UserPlus className="h-5 w-5" /> : role === "customer" ? <CircleUserRound className="h-5 w-5" /> : <Handshake className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{role === "admin" ? "Admin login" : `${roleLabel} ${authMode}`}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {role === "admin"
                  ? "Admin accounts are provisioned internally and cannot self-register."
                  : authMode === "register"
                    ? role === "partner"
                      ? "Verify the official email OTP. Partner access remains pending until admin approval."
                      : "Create a customer account by verifying the OTP sent to your email."
                    : "Enter your registered email and verify the OTP sent by Incentify."}
              </p>
            </div>
          </div>

          {(authMode === "login" || role === "admin") ? (
            !otpSent ? (
              <form onSubmit={onRequestOtp} className="mt-7 space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Registered email address</span>
                  <div className="mt-2 flex min-h-12 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@business.com" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
                  </div>
                </label>
                <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send {roleLabel.toLowerCase()} login OTP
                </button>
              </form>
            ) : (
              <OtpForm email={email} otp={otp} setOtp={setOtp} busy={busy} onSubmit={onVerifyOtp} buttonLabel={`Verify & open ${roleLabel.toLowerCase()} portal`} onReset={onReset} />
            )
          ) : !otpSent ? (
            <form onSubmit={onRequestRegistrationOtp} className="mt-7 space-y-4">
              <label className="block"><span className="text-sm font-semibold">Full name</span><input required minLength={2} value={registration.displayName} onChange={(e) => updateRegistration({ displayName: e.target.value })} className="mt-2 min-h-12 w-full rounded-lg border border-input px-4 text-sm" /></label>
              <label className="block"><span className="text-sm font-semibold">{role === "partner" ? "Practice / business name" : "Business name"}</span><input required minLength={2} value={registration.businessName} onChange={(e) => updateRegistration({ businessName: e.target.value })} className="mt-2 min-h-12 w-full rounded-lg border border-input px-4 text-sm" /></label>
              <label className="block"><span className="text-sm font-semibold">Email address</span><input type="email" required value={registration.email} onChange={(e) => updateRegistration({ email: e.target.value })} className="mt-2 min-h-12 w-full rounded-lg border border-input px-4 text-sm" /></label>
              <label className="block"><span className="text-sm font-semibold">Indian mobile number</span><input required value={registration.phone} onChange={(e) => updateRegistration({ phone: e.target.value })} className="mt-2 min-h-12 w-full rounded-lg border border-input px-4 text-sm" /></label>
              <label className="flex items-start gap-3 rounded-lg border border-border p-4 text-sm"><input type="checkbox" checked={registration.acceptedTerms} onChange={(e) => updateRegistration({ acceptedTerms: e.target.checked })} className="mt-1" /><span>I agree to the Terms and Privacy Policy and consent to email OTP verification.</span></label>
              <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Send registration OTP</button>
            </form>
          ) : (
            <OtpForm email={registration.email} otp={otp} setOtp={setOtp} busy={busy} onSubmit={onVerifyRegistrationOtp} buttonLabel="Verify registration OTP" onReset={onReset} />
          )}

          {USE_MOCK_BACKEND && <div className="mt-5 rounded-lg border border-accent/25 bg-accent-soft p-3 text-xs text-foreground"><strong>Local mock mode:</strong> use OTP <code>123456</code>.</div>}
          {notice && <div className="mt-5 rounded-lg border border-success/25 bg-success/10 p-3 text-sm text-foreground">{notice}</div>}
          {error && <div className="mt-5 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        </div>
      </div>
    </section>
  );
}

function OtpForm({ email, otp, setOtp, busy, onSubmit, buttonLabel, onReset }: { email: string; otp: string; setOtp: (value: string) => void; busy: boolean; onSubmit: (event: FormEvent) => void; buttonLabel: string; onReset: () => void }) {
  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-5">
      <div className="rounded-lg bg-secondary p-4 text-sm"><p className="font-bold text-foreground">OTP sent</p><p className="mt-1 text-muted-foreground">Enter the six-digit code sent to {email}.</p></div>
      <label className="block"><span className="text-sm font-semibold">One-time code</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-2 min-h-12 w-full rounded-lg border border-input px-4 text-center text-xl font-extrabold tracking-[0.35em]" /></label>
      <button type="submit" disabled={busy || otp.length !== 6} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} {buttonLabel}</button>
      <button type="button" onClick={onReset} className="w-full text-center text-sm font-semibold text-primary hover:underline">Start again</button>
    </form>
  );
}

function PortalBenefit({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="rounded-2xl border border-primary-foreground/12 bg-white/5 p-4"><Icon className="h-5 w-5 text-accent" /><h3 className="mt-3 text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-primary-foreground/65">{text}</p></div>;
}

function PortalDashboardView({ session, dashboard, tab, setTab, busy, error, notice, setError, setNotice, refresh, logout }: { session: PortalSession; dashboard: PortalDashboard; tab: PortalTab; setTab: (tab: PortalTab) => void; busy: boolean; error: string; notice: string; setError: (message: string) => void; setNotice: (message: string) => void; refresh: () => Promise<void> | void; logout: () => Promise<void> | void }) {
  const tabs = useMemo<PortalTab[]>(() => {
    if (session.role === "admin") return ["overview", "leads", "partners", "customers", "services", "products", "flow", "settings"];
    if (session.role === "partner") return ["overview", "leads", "services", "products", "flow", "settings"];
    return ["overview", "services", "flow", "documents", "settings"];
  }, [session.role]);

  return (
    <section className="bg-secondary/35 py-8 md:py-12">
      <div className="container-page">
        <div className="rounded-2xl border border-border bg-background p-5 shadow-card md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary uppercase">{session.role} portal</span><span className="text-xs text-muted-foreground">V{dashboard.version}</span></div><h1 className="mt-3 text-3xl font-extrabold md:text-4xl">Welcome, {dashboard.profile.displayName}</h1><p className="mt-2 text-sm text-muted-foreground">{dashboard.profile.entityName || dashboard.profile.email}</p></div>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => void refresh()} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-bold"><RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh</button><button type="button" onClick={() => void logout()} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground"><LogOut className="h-4 w-4" /> Sign out</button></div>
          </div>
          <div className="mt-7 flex gap-2 overflow-x-auto border-b border-border pb-3">{tabs.map((item) => <button key={item} type="button" onClick={() => { setTab(item); setError(""); setNotice(""); }} className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-bold capitalize ${tab === item ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{item}</button>)}</div>
        </div>
        {notice && <div className="mt-4 rounded-lg border border-success/25 bg-success/10 p-3 text-sm">{notice}</div>}
        {error && <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <div className="mt-6">
          {tab === "overview" && <Overview session={session} dashboard={dashboard} />}
          {tab === "leads" && session.role === "partner" && <PartnerLeadsView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "leads" && session.role === "admin" && <AdminLeadsView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "partners" && session.role === "admin" && <AdminPartnersView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "customers" && session.role === "admin" && <AdminCustomersView dashboard={dashboard} />}
          {tab === "services" && session.role === "admin" && <AdminServicesView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "services" && session.role !== "admin" && <ServicesView dashboard={dashboard} />}
          {tab === "products" && session.role === "admin" && <AdminProductsView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "products" && session.role === "partner" && <ProductsView dashboard={dashboard} />}
          {tab === "flow" && <FlowView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "documents" && session.role === "customer" && <DocumentsView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
          {tab === "settings" && <SettingsView session={session} dashboard={dashboard} setError={setError} setNotice={setNotice} refresh={refresh} />}
        </div>
      </div>
    </section>
  );
}

function Overview({ session, dashboard }: { session: PortalSession; dashboard: PortalDashboard }) {
  const inProgress = dashboard.assignments.filter((item) => !["COMPLETED", "CLOSED"].includes(item.status)).length;
  const completed = dashboard.assignments.filter((item) => ["COMPLETED", "CLOSED"].includes(item.status)).length;
  const stats = session.role === "admin"
    ? [
        { label: "Partner leads", value: dashboard.partnerLeads.length, icon: BriefcaseBusiness },
        { label: "Active assignments", value: inProgress, icon: RouteIcon },
        { label: "Partners", value: dashboard.partners.length, icon: Handshake },
        { label: "Customers", value: dashboard.customers.length, icon: Users },
      ]
    : session.role === "partner"
      ? [
          { label: "Leads submitted", value: dashboard.partnerLeads.length, icon: BriefcaseBusiness },
          { label: "Assigned work", value: dashboard.assignments.length, icon: RouteIcon },
          { label: "Active work", value: inProgress, icon: RefreshCw },
          { label: "Completed", value: completed, icon: CheckCircle2 },
        ]
      : [
          { label: "Assigned services", value: dashboard.assignments.length, icon: BriefcaseBusiness },
          { label: "Active work", value: inProgress, icon: RouteIcon },
          { label: "Completed", value: completed, icon: CheckCircle2 },
          { label: "Documents", value: dashboard.documents.length, icon: FileText },
        ];
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-border bg-background p-5 shadow-card"><stat.icon className="h-5 w-5 text-primary" /><p className="mt-5 text-3xl font-extrabold">{stat.value}</p><p className="mt-1 text-sm text-muted-foreground">{stat.label}</p></div>)}</div><div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Current work</h2><div className="mt-5 space-y-3">{dashboard.assignments.length ? dashboard.assignments.slice(0, 5).map((a) => <AssignmentSummary key={a.assignmentId} assignment={a} />) : <EmptyState text="No services are assigned yet." />}</div></div><div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-card"><BadgeCheck className="h-6 w-6 text-accent" /><h2 className="mt-4 text-xl font-bold">Portal record</h2><dl className="mt-5 space-y-4 text-sm"><InfoRow label="Email" value={dashboard.profile.email} /><InfoRow label="Role" value={dashboard.profile.role} /><InfoRow label="Business" value={dashboard.profile.businessName || dashboard.profile.entityName} /><InfoRow label="Phone" value={dashboard.profile.phone || "Not added"} /></dl></div></div></div>;
}

function PartnerLeadsView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [form, setForm] = useState<PortalPartnerLeadInput>({ contactName: "", phone: "", email: "", businessName: "", businessStructure: "Private Limited", city: "", state: "", serviceId: dashboard.services[0]?.serviceId || "", productId: "", notes: "" });
  const [working, setWorking] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setWorking(true); setError("");
    const result = await submitPartnerLead(session, form);
    if (result.ok) { setNotice(`Lead ${result.data.leadId} submitted to Incentify admin.`); setForm({ ...form, contactName: "", phone: "", email: "", businessName: "", city: "", state: "", notes: "" }); await refresh(); } else setError(result.error);
    setWorking(false);
  }
  return <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><form onSubmit={submit} className="rounded-2xl border border-border bg-background p-6 shadow-card"><PlusCircle className="h-5 w-5 text-primary" /><h2 className="mt-3 text-xl font-bold">Add a new lead</h2><p className="mt-2 text-sm text-muted-foreground">Capture the prospect and select the service they require. Incentify admin receives it immediately.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Contact name" value={form.contactName} setValue={(v) => setForm({ ...form, contactName: v })} required /><Field label="Phone" value={form.phone} setValue={(v) => setForm({ ...form, phone: v })} required /><Field label="Email" value={form.email} setValue={(v) => setForm({ ...form, email: v })} type="email" required /><Field label="Business / proposed company" value={form.businessName} setValue={(v) => setForm({ ...form, businessName: v })} required /><Field label="Business structure" value={form.businessStructure} setValue={(v) => setForm({ ...form, businessStructure: v })} /><Field label="City" value={form.city} setValue={(v) => setForm({ ...form, city: v })} /><Field label="State" value={form.state} setValue={(v) => setForm({ ...form, state: v })} /><label className="block"><span className="text-sm font-semibold">Service</span><select required value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select service</option>{dashboard.services.filter((s) => s.active).map((s) => <option key={s.serviceId} value={s.serviceId}>{s.name}</option>)}</select></label><label className="block sm:col-span-2"><span className="text-sm font-semibold">Product / package (optional)</span><select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">No product</option>{dashboard.products.filter((p) => p.active).map((p) => <option key={p.productId} value={p.productId}>{p.name}</option>)}</select></label><label className="block sm:col-span-2"><span className="text-sm font-semibold">Lead notes</span><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} maxLength={1000} className="mt-2 w-full rounded-md border border-input p-3 text-sm" /></label></div><button type="submit" disabled={working} className="mt-5 min-h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">Submit lead</button></form><div className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">My submitted leads</h2><div className="mt-5 space-y-3">{dashboard.partnerLeads.length ? dashboard.partnerLeads.map((lead) => <LeadCard key={lead.leadId} lead={lead} />) : <EmptyState text="No leads submitted yet." />}</div></div></div>;
}

function AdminLeadsView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [workingId, setWorkingId] = useState("");
  async function status(leadId: string, value: string) { setWorkingId(leadId); const r = await adminUpdatePartnerLeadStatus(session, leadId, value); if (r.ok) { setNotice("Lead status updated."); await refresh(); } else setError(r.error); setWorkingId(""); }
  async function convert(leadId: string) { setWorkingId(leadId); const r = await adminConvertPartnerLead(session, leadId); if (r.ok) { setNotice(`Lead converted to assignment ${r.data.assignmentId}.`); await refresh(); } else setError(r.error); setWorkingId(""); }
  return <div className="rounded-2xl border border-border bg-background p-6 shadow-card"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Partner lead control</h2><p className="mt-1 text-sm text-muted-foreground">Review partner-sourced prospects and convert qualified leads into customer service assignments.</p></div><span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{dashboard.partnerLeads.length} leads</span></div><div className="mt-6 space-y-4">{dashboard.partnerLeads.length ? dashboard.partnerLeads.map((lead) => <div key={lead.leadId} className="rounded-xl border border-border p-5"><LeadCard lead={lead} /><div className="mt-4 flex flex-wrap items-center gap-2"><select value={lead.status} disabled={workingId === lead.leadId} onChange={(e) => void status(lead.leadId, e.target.value)} className="min-h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold">{["NEW", "CONTACTED", "QUALIFIED", "ON_HOLD", "LOST", "CONVERTED"].map((x) => <option key={x} value={x}>{formatStatus(x)}</option>)}</select><button type="button" disabled={workingId === lead.leadId || lead.status === "CONVERTED"} onClick={() => void convert(lead.leadId)} className="min-h-10 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50">Convert to service work</button></div></div>) : <EmptyState text="No partner leads have been submitted." />}</div></div>;
}

function AdminPartnersView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [workingId, setWorkingId] = useState("");
  async function setStatus(partnerId: string, status: "ACTIVE" | "INACTIVE" | "REJECTED") {
    setWorkingId(partnerId);
    const r = await adminSetPartnerStatus(session, partnerId, status);
    if (r.ok) { setNotice(`Partner ${formatStatus(status)}.`); await refresh(); } else setError(r.error);
    setWorkingId("");
  }
  async function setAccess(partnerId: string, itemType: "SERVICE" | "PRODUCT", itemId: string, active: boolean) {
    setWorkingId(`${partnerId}-${itemType}-${itemId}`);
    const r = await adminSetPartnerCatalogAccess(session, partnerId, itemType, itemId, active);
    if (r.ok) { setNotice("Partner catalogue access updated."); await refresh(); } else setError(r.error);
    setWorkingId("");
  }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-background p-6 shadow-card">
        <h2 className="text-xl font-bold">Partner registrations & approval</h2>
        <div className="mt-5 space-y-3">
          {dashboard.registrations.filter((r) => r.role === "partner" && r.status === "PENDING_APPROVAL").length ? (
            dashboard.registrations.filter((r) => r.role === "partner" && r.status === "PENDING_APPROVAL").map((r) => (
              <div key={r.requestId} className="rounded-xl border border-accent/30 bg-accent-soft/40 p-4">
                <p className="font-bold">{r.displayName} · {r.businessName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.email} · {r.phone}</p>
                <p className="mt-2 text-xs font-bold text-accent">Pending approval</p>
              </div>
            ))
          ) : <EmptyState text="No pending partner registrations." />}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 shadow-card">
        <h2 className="text-xl font-bold">Partner accounts & catalogue access</h2>
        <p className="mt-2 text-sm text-muted-foreground">Approve the partner, then select exactly which services and products that partner can offer or submit leads for.</p>
        <div className="mt-5 space-y-5">
          {dashboard.partners.map((p) => (
            <div key={p.partnerId} className="rounded-xl border border-border p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-bold">{p.businessName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.contactName} · {p.email} · {p.phone}</p>
                  <p className="mt-1 text-xs">{p.partnerId} · {formatStatus(p.status)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={workingId === p.partnerId} onClick={() => void setStatus(p.partnerId, "ACTIVE")} className="rounded-md bg-success/10 px-3 py-2 text-xs font-bold text-success">Approve / Activate</button>
                  <button disabled={workingId === p.partnerId} onClick={() => void setStatus(p.partnerId, "INACTIVE")} className="rounded-md bg-secondary px-3 py-2 text-xs font-bold">Deactivate</button>
                  <button disabled={workingId === p.partnerId} onClick={() => void setStatus(p.partnerId, "REJECTED")} className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">Reject</button>
                </div>
              </div>
              <div className="mt-5 grid gap-5 border-t border-border pt-5 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-bold">Allowed services</p>
                  <div className="mt-3 grid gap-2">
                    {dashboard.services.filter((s) => s.active).map((service) => {
                      const checked = p.serviceIds.includes(service.serviceId);
                      const key = `${p.partnerId}-SERVICE-${service.serviceId}`;
                      return (
                        <label key={service.serviceId} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                          <input type="checkbox" checked={checked} disabled={workingId === key || !p.active} onChange={(event) => void setAccess(p.partnerId, "SERVICE", service.serviceId, event.target.checked)} />
                          <span>{service.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold">Allowed products</p>
                  <div className="mt-3 grid gap-2">
                    {dashboard.products.filter((product) => product.active).map((product) => {
                      const checked = p.productIds.includes(product.productId);
                      const key = `${p.partnerId}-PRODUCT-${product.productId}`;
                      return (
                        <label key={product.productId} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                          <input type="checkbox" checked={checked} disabled={workingId === key || !p.active} onChange={(event) => void setAccess(p.partnerId, "PRODUCT", product.productId, event.target.checked)} />
                          <span>{product.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminCustomersView({ dashboard }: { dashboard: PortalDashboard }) {
  return <div className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Customers</h2><div className="mt-5 grid gap-3 lg:grid-cols-2">{dashboard.customers.length ? dashboard.customers.map((c) => <div key={c.customerId} className="rounded-xl border border-border p-4"><p className="font-bold">{c.businessName || c.contactName}</p><p className="mt-1 text-sm text-muted-foreground">{c.contactName} · {c.email}</p><p className="mt-1 text-xs text-muted-foreground">{c.phone} · {c.customerId} · {formatStatus(c.status)}</p></div>) : <EmptyState text="No customers yet." />}</div></div>;
}

function AdminServicesView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [form, setForm] = useState<PortalService>({ serviceId: "", name: "", category: "", description: "", active: true, sortOrder: 100 });
  const [working, setWorking] = useState(false);
  async function save(event: FormEvent) { event.preventDefault(); setWorking(true); const r = await adminUpsertService(session, form); if (r.ok) { setNotice("Service catalogue saved."); setForm({ serviceId: "", name: "", category: "", description: "", active: true, sortOrder: 100 }); await refresh(); } else setError(r.error); setWorking(false); }
  return <CatalogLayout title="Service catalogue control" description="Add or edit services. Inactive services remain in history but are hidden from partner/customer selection." form={<form onSubmit={save} className="space-y-4"><Field label="Service ID (leave blank for new)" value={form.serviceId} setValue={(v) => setForm({ ...form, serviceId: v })} /><Field label="Service name" value={form.name} setValue={(v) => setForm({ ...form, name: v })} required /><Field label="Category" value={form.category} setValue={(v) => setForm({ ...form, category: v })} required /><label className="block"><span className="text-sm font-semibold">Description</span><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-2 w-full rounded-md border border-input p-3 text-sm" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label><button disabled={working} className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">Save service</button></form>} list={<div className="space-y-3">{dashboard.services.map((s) => <div key={s.serviceId} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{s.name}</p><p className="mt-1 text-xs font-bold uppercase text-accent">{s.category} · {s.serviceId}</p></div><StatusBadge status={s.active ? "ACTIVE" : "INACTIVE"} /></div><p className="mt-3 text-sm text-muted-foreground">{s.description}</p><button type="button" onClick={() => setForm({ ...s, sortOrder: s.sortOrder || 100 })} className="mt-3 text-sm font-bold text-primary hover:underline">Edit this service</button></div>)}</div>} />;
}

function AdminProductsView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [form, setForm] = useState<PortalProduct>({ productId: "", name: "", description: "", billingModel: "Project", active: true, sortOrder: 100 });
  const [working, setWorking] = useState(false);
  async function save(event: FormEvent) { event.preventDefault(); setWorking(true); const r = await adminUpsertProduct(session, form); if (r.ok) { setNotice("Product catalogue saved."); setForm({ productId: "", name: "", description: "", billingModel: "Project", active: true, sortOrder: 100 }); await refresh(); } else setError(r.error); setWorking(false); }
  return <CatalogLayout title="Product catalogue control" description="Create product bundles/packages that partners can associate with leads and assignments." form={<form onSubmit={save} className="space-y-4"><Field label="Product ID (leave blank for new)" value={form.productId} setValue={(v) => setForm({ ...form, productId: v })} /><Field label="Product name" value={form.name} setValue={(v) => setForm({ ...form, name: v })} required /><Field label="Billing model" value={form.billingModel} setValue={(v) => setForm({ ...form, billingModel: v })} required /><label className="block"><span className="text-sm font-semibold">Description</span><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-2 w-full rounded-md border border-input p-3 text-sm" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label><button disabled={working} className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">Save product</button></form>} list={<div className="grid gap-3 md:grid-cols-2">{dashboard.products.map((p) => <div key={p.productId} className="rounded-xl border border-border p-4"><PackageCheck className="h-5 w-5 text-primary" /><p className="mt-3 font-bold">{p.name}</p><p className="mt-1 text-xs font-bold uppercase text-accent">{p.billingModel} · {p.productId}</p><p className="mt-3 text-sm text-muted-foreground">{p.description}</p><div className="mt-3 flex items-center justify-between"><StatusBadge status={p.active ? "ACTIVE" : "INACTIVE"} /><button type="button" onClick={() => setForm({ ...p, sortOrder: p.sortOrder || 100 })} className="text-sm font-bold text-primary hover:underline">Edit</button></div></div>)}</div>} />;
}

function CatalogLayout({ title, description, form, list }: { title: string; description: string; form: ReactNode; list: ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]"><div className="h-fit rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p><div className="mt-6">{form}</div></div><div className="rounded-2xl border border-border bg-background p-6 shadow-card">{list}</div></div>;
}

function ServicesView({ dashboard }: { dashboard: PortalDashboard }) { return <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><div className="rounded-2xl border border-border bg-background p-6 shadow-card"><div className="flex items-center gap-3"><LayoutDashboard className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Service catalogue</h2></div><div className="mt-5 space-y-3">{dashboard.services.filter((s) => s.active).map((s) => <div key={s.serviceId} className="rounded-xl border border-border p-4"><p className="font-bold">{s.name}</p><p className="mt-1 text-xs font-semibold uppercase text-accent">{s.category}</p><p className="mt-3 text-sm text-muted-foreground">{s.description}</p></div>)}</div></div><div className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Assigned services</h2><div className="mt-5 space-y-3">{dashboard.assignments.length ? dashboard.assignments.map((a) => <AssignmentSummary key={a.assignmentId} assignment={a} />) : <EmptyState text="No services are assigned yet." />}</div></div></div>; }

function ProductsView({ dashboard }: { dashboard: PortalDashboard }) { return <div><div className="mb-5 flex items-center gap-3"><Boxes className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-bold">Products</h2><p className="text-sm text-muted-foreground">Data-driven partner product catalogue.</p></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{dashboard.products.filter((p) => p.active).map((p) => <div key={p.productId} className="rounded-2xl border border-border bg-background p-6 shadow-card"><PackageCheck className="h-5 w-5 text-primary" /><h3 className="mt-4 text-lg font-bold">{p.name}</h3><p className="mt-2 text-sm text-muted-foreground">{p.description}</p><p className="mt-5 text-xs font-bold uppercase text-accent">{p.billingModel}</p></div>)}</div></div>; }

function FlowView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [note, setNote] = useState("");
  const [assignmentId, setAssignmentId] = useState(dashboard.assignments[0]?.assignmentId || "");
  const [working, setWorking] = useState(false);
  const [assign, setAssign] = useState({ customerId: dashboard.customers[0]?.customerId || "", partnerId: dashboard.partners.find((p) => p.active)?.partnerId || "", serviceId: dashboard.services.find((s) => s.active)?.serviceId || "", productId: "", priority: "NORMAL", dueDate: "" });
  async function updateStatus(id: string, status: string) { setWorking(true); const r = await updatePortalAssignmentStatus(session, id, status); if (r.ok) { setNotice("Workflow status updated."); await refresh(); } else setError(r.error); setWorking(false); }
  async function addNote(event: FormEvent) { event.preventDefault(); if (!assignmentId || note.trim().length < 2) return; setWorking(true); const r = await addPortalWorkflowNote(session, assignmentId, note.trim()); if (r.ok) { setNote(""); setNotice("Workflow note added."); await refresh(); } else setError(r.error); setWorking(false); }
  async function createAssignment(event: FormEvent) { event.preventDefault(); setWorking(true); const r = await adminCreateAssignment(session, assign); if (r.ok) { setNotice(`Assignment ${r.data.assignmentId} created.`); await refresh(); } else setError(r.error); setWorking(false); }
  return <div className="space-y-6">{session.role === "admin" && <form onSubmit={createAssignment} className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Assign service manually</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><SelectField label="Customer" value={assign.customerId} setValue={(v) => setAssign({ ...assign, customerId: v })} options={dashboard.customers.map((c) => ({ value: c.customerId, label: c.businessName || c.contactName }))} /><SelectField label="Partner" value={assign.partnerId} setValue={(v) => setAssign({ ...assign, partnerId: v })} options={dashboard.partners.filter((p) => p.active).map((p) => ({ value: p.partnerId, label: p.businessName }))} /><SelectField label="Service" value={assign.serviceId} setValue={(v) => setAssign({ ...assign, serviceId: v })} options={dashboard.services.filter((s) => s.active).map((s) => ({ value: s.serviceId, label: s.name }))} /><SelectField label="Product (optional)" value={assign.productId} setValue={(v) => setAssign({ ...assign, productId: v })} options={[{ value: "", label: "No product" }, ...dashboard.products.filter((p) => p.active).map((p) => ({ value: p.productId, label: p.name }))]} /><SelectField label="Priority" value={assign.priority} setValue={(v) => setAssign({ ...assign, priority: v })} options={["LOW", "NORMAL", "HIGH", "URGENT"].map((x) => ({ value: x, label: formatStatus(x) }))} /><Field label="Due date" type="date" value={assign.dueDate} setValue={(v) => setAssign({ ...assign, dueDate: v })} /></div><button disabled={working || !assign.customerId || !assign.partnerId || !assign.serviceId} className="mt-5 min-h-11 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">Create assignment</button></form>}<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Service flow</h2><div className="mt-5 space-y-4">{dashboard.assignments.length ? dashboard.assignments.map((a) => <div key={a.assignmentId} className="rounded-xl border border-border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{a.serviceName}</p><p className="mt-1 text-xs text-muted-foreground">{a.assignmentId} · Customer {a.customerId} · Partner {a.partnerId || "Unassigned"}</p></div>{session.role === "customer" ? <StatusBadge status={a.status} /> : <select value={a.status} disabled={working} onChange={(e) => void updateStatus(a.assignmentId, e.target.value)} className="min-h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold">{["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "WAITING_CUSTOMER", "REVIEW", "COMPLETED", "CLOSED"].map((x) => <option key={x} value={x}>{formatStatus(x)}</option>)}</select>}</div><div className="mt-4 border-l-2 border-primary-soft pl-4">{dashboard.workflow.filter((w) => w.assignmentId === a.assignmentId).slice(0, 5).map((w) => <div key={w.workflowId} className="pb-4 last:pb-0"><p className="text-xs font-bold text-primary">{formatStatus(w.status)}</p><p className="mt-1 text-sm">{w.note}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(w.createdAt)}</p></div>)}</div></div>) : <EmptyState text="No active workflow exists yet." />}</div></div><form onSubmit={addNote} className="h-fit rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Add workflow note</h2><select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="mt-5 min-h-11 w-full rounded-md border border-input px-3 text-sm">{dashboard.assignments.map((a) => <option key={a.assignmentId} value={a.assignmentId}>{a.serviceName}</option>)}</select><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} maxLength={500} placeholder="Add a clear progress note..." className="mt-4 w-full rounded-md border border-input p-3 text-sm" /><button disabled={working || !assignmentId || note.trim().length < 2} className="mt-4 min-h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">Add note</button></form></div></div>;
}

function DocumentsView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [assignmentId, setAssignmentId] = useState(dashboard.assignments[0]?.assignmentId || ""); const [label, setLabel] = useState(""); const [url, setUrl] = useState(""); const [working, setWorking] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setWorking(true); const r = await addPortalDocumentLink(session, assignmentId, label.trim(), url.trim()); if (r.ok) { setLabel(""); setUrl(""); setNotice("Document link submitted."); await refresh(); } else setError(r.error); setWorking(false); }
  return <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl border border-border bg-background p-6 shadow-card"><h2 className="text-xl font-bold">Shared documents</h2><div className="mt-5 space-y-3">{dashboard.documents.length ? dashboard.documents.map((d) => <a key={d.documentId} href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl border border-border p-4"><FileText className="h-5 w-5 text-primary" /><span><span className="block font-bold">{d.label}</span><span className="mt-1 block text-xs text-muted-foreground">{d.status} · {formatDate(d.createdAt)}</span></span></a>) : <EmptyState text="No documents shared yet." />}</div></div><form onSubmit={submit} className="h-fit rounded-2xl border border-border bg-background p-6 shadow-card"><UploadCloud className="h-5 w-5 text-primary" /><h2 className="mt-3 text-xl font-bold">Add secure document link</h2><select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="mt-5 min-h-11 w-full rounded-md border border-input px-3 text-sm">{dashboard.assignments.map((a) => <option key={a.assignmentId} value={a.assignmentId}>{a.serviceName}</option>)}</select><Field label="Document label" value={label} setValue={setLabel} required /><Field label="HTTPS share URL" type="url" value={url} setValue={setUrl} required /><button disabled={working || !assignmentId} className="mt-4 min-h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">Submit link</button></form></div>;
}

function SettingsView({ session, dashboard, setError, setNotice, refresh }: PortalActionProps) {
  const [displayName, setDisplayName] = useState(dashboard.profile.displayName); const [phone, setPhone] = useState(dashboard.profile.phone); const [businessName, setBusinessName] = useState(dashboard.profile.businessName || dashboard.profile.entityName); const [working, setWorking] = useState(false);
  async function save(event: FormEvent) { event.preventDefault(); setWorking(true); const r = await updatePortalProfile(session, { displayName, phone, businessName }); if (r.ok) { setNotice("Profile settings updated."); await refresh(); } else setError(r.error); setWorking(false); }
  return <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]"><div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-card"><Settings className="h-6 w-6 text-accent" /><h2 className="mt-4 text-xl font-bold">Account settings</h2><p className="mt-2 text-sm text-primary-foreground/70">Email and role are controlled by the portal access record.</p><dl className="mt-6 space-y-4 text-sm"><InfoRow label="Registered email" value={dashboard.profile.email} /><InfoRow label="Access role" value={dashboard.profile.role} /><InfoRow label="Entity ID" value={dashboard.profile.entityId} /></dl></div><form onSubmit={save} className="rounded-2xl border border-border bg-background p-6 shadow-card"><div className="grid gap-5 sm:grid-cols-2"><Field label="Display name" value={displayName} setValue={setDisplayName} required /><Field label="Phone" value={phone} setValue={setPhone} /><div className="sm:col-span-2"><Field label={session.role === "admin" ? "Organisation name" : "Business / practice name"} value={businessName} setValue={setBusinessName} /></div></div><button disabled={working} className="mt-6 min-h-11 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground">Save settings</button></form></div>;
}

type PortalActionProps = { session: PortalSession; dashboard: PortalDashboard; setError: (message: string) => void; setNotice: (message: string) => void; refresh: () => Promise<void> | void };

function Field({ label, value, setValue, type = "text", required = false }: { label: string; value: string; setValue: (value: string) => void; type?: string; required?: boolean }) { return <label className="block"><span className="text-sm font-semibold">{label}</span><input type={type} required={required} value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>; }
function SelectField({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: { value: string; label: string }[] }) { return <label className="block"><span className="text-sm font-semibold">{label}</span><select value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm">{options.map((o) => <option key={`${label}-${o.value}`} value={o.value}>{o.label}</option>)}</select></label>; }
function LeadCard({ lead }: { lead: PortalDashboard["partnerLeads"][number] }) { return <div><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold">{lead.contactName} · {lead.businessName}</p><p className="mt-1 text-sm text-muted-foreground">{lead.phone} · {lead.email}</p><p className="mt-1 text-xs text-muted-foreground">{lead.businessStructure} · {lead.city}{lead.state ? `, ${lead.state}` : ""}</p></div><StatusBadge status={lead.status} /></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><strong>Service:</strong> {lead.serviceName}</p><p><strong>Product:</strong> {lead.productName || "—"}</p><p><strong>Partner:</strong> {lead.partnerName || lead.partnerId}</p><p><strong>Created:</strong> {formatDate(lead.createdAt)}</p></div>{lead.notes && <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-sm">{lead.notes}</p>}{lead.assignmentId && <p className="mt-2 text-xs font-bold text-success">Converted: {lead.assignmentId}</p>}</div>; }
function AssignmentSummary({ assignment }: { assignment: PortalAssignment }) { return <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{assignment.serviceName}</p><p className="mt-1 text-xs text-muted-foreground">{assignment.assignmentId}{assignment.dueDate ? ` · Due ${assignment.dueDate}` : ""}</p></div><StatusBadge status={assignment.status} /></div>; }
function StatusBadge({ status }: { status: string }) { return <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{formatStatus(status)}</span>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-muted-foreground">{text}</div>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide opacity-65">{label}</dt><dd className="mt-1 break-words font-semibold">{value || "—"}</dd></div>; }
function formatStatus(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date); }
