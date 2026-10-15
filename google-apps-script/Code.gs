/**
 * Incentify Website + Customer/Partner Portal Backend
 * Version: 12.0.0
 *
 * Architecture:
 *   GitHub Pages frontend -> Apps Script Web App -> Google Sheets database
 *
 * Existing public lead capture remains supported with schemaVersion 4.
 * Portal requests use a hidden form/iframe bridge so the browser can receive
 * authenticated Apps Script responses without exposing session tokens in URLs.
 */

const APP_VERSION = '12.0.0';
const LEAD_SCHEMA_VERSION = '4';
const PORTAL_SCHEMA_VERSION = '12';
const DATABASE_PROPERTY = 'INCENTIFY_DATABASE_ID';
const PORTAL_SECRET_PROPERTY = 'INCENTIFY_PORTAL_SECRET';
const DATABASE_NAME = 'Incentify Website Database';
const TIME_ZONE = 'Asia/Kolkata';
const MAX_BODY_BYTES = 60000;
const MAX_DUPLICATE_SCAN_ROWS = 250;
const OTP_TTL_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_REQUESTS_PER_HOUR = 5;
const REGISTRATION_TTL_MINUTES = 30;
const SESSION_TTL_HOURS = 12;
const OFFICIAL_REPLY_TO = 'info@incentify.in';

const SHEETS = Object.freeze({
  LEADS: 'Leads',
  CONFIG: 'Config',
  AUDIT: 'Audit_Log',
  ERRORS: 'Error_Log',
  USERS: 'Portal_Users',
  CUSTOMERS: 'Customers',
  PARTNERS: 'Partners',
  SERVICES: 'Services',
  PRODUCTS: 'Products',
  ASSIGNMENTS: 'Service_Assignments',
  WORKFLOW: 'Workflow',
  DOCUMENTS: 'Documents',
  SESSIONS: 'Portal_Sessions',
  OTP: 'Portal_OTP',
  REGISTRATIONS: 'Portal_Registrations',
  ADMINS: 'Admins',
  PARTNER_LEADS: 'Partner_Leads',
  PARTNER_ACCESS: 'Partner_Catalog_Access'
});

const LEAD_STATUS_VALUES = Object.freeze(['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST', 'CLOSED']);
const ALLOWED_SOURCES = Object.freeze(['quote', 'contact', 'consultation', 'service-page']);
const PORTAL_ROLES = Object.freeze(['customer', 'partner', 'admin']);
const PARTNER_STATUS_VALUES = Object.freeze([
  'ASSIGNED',
  'ACCEPTED',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'REVIEW',
  'COMPLETED',
  'CLOSED'
]);
const ALLOWED_PORTAL_ORIGINS = Object.freeze([
  'https://incentify.in',
  'https://www.incentify.in',
  'https://amoghchowdary.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const LEAD_HEADERS = Object.freeze([
  'Submission ID', 'Reference', 'Received At', 'Submitted At', 'Source', 'Status',
  'Full Name', 'Phone', 'Email', 'Business Name', 'Business Type', 'City', 'State',
  'Service', 'Preferred Contact Method', 'Preferred Contact Time', 'Preferred Date',
  'Preferred Time', 'Message', 'Page Path', 'Page URL', 'Referrer', 'User Agent',
  'Schema Version', 'Request Hash'
]);

const AUDIT_HEADERS = Object.freeze(['Timestamp', 'Event', 'Reference / Code', 'Details']);
const ERROR_HEADERS = Object.freeze(['Timestamp', 'Context', 'Reference', 'Error', 'Stack']);
const USER_HEADERS = Object.freeze([
  'User ID', 'Email', 'Role', 'Display Name', 'Entity ID', 'Active',
  'Last Login At', 'Created At', 'Updated At', 'Email Verified At', 'Registration Source'
]);
const CUSTOMER_HEADERS = Object.freeze([
  'Customer ID', 'Business Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Created At', 'Updated At', 'Email Verified At'
]);
const PARTNER_HEADERS = Object.freeze([
  'Partner ID', 'Practice / Business Name', 'Contact Name', 'Email', 'Phone', 'Status', 'Created At', 'Updated At', 'Email Verified At'
]);
const SERVICE_HEADERS = Object.freeze([
  'Service ID', 'Name', 'Category', 'Description', 'Active', 'Sort Order', 'Created At', 'Updated At'
]);
const PRODUCT_HEADERS = Object.freeze([
  'Product ID', 'Name', 'Description', 'Billing Model', 'Active', 'Sort Order', 'Created At', 'Updated At'
]);
const ASSIGNMENT_HEADERS = Object.freeze([
  'Assignment ID', 'Customer ID', 'Partner ID', 'Service ID', 'Product ID', 'Status',
  'Priority', 'Started At', 'Due Date', 'Updated At', 'Created At'
]);
const WORKFLOW_HEADERS = Object.freeze([
  'Workflow ID', 'Assignment ID', 'Status', 'Note', 'Actor User ID', 'Actor Role', 'Created At'
]);
const DOCUMENT_HEADERS = Object.freeze([
  'Document ID', 'Assignment ID', 'Customer ID', 'Partner ID', 'Label', 'URL',
  'Status', 'Added By', 'Created At'
]);
const SESSION_HEADERS = Object.freeze([
  'Session Hash', 'User ID', 'Role', 'Expires At', 'Revoked', 'Created At', 'Last Seen At'
]);
const OTP_HEADERS = Object.freeze([
  'OTP Hash', 'Email', 'Role', 'Expires At', 'Attempts', 'Consumed', 'Created At', 'Purpose', 'Reference'
]);
const REGISTRATION_HEADERS = Object.freeze([
  'Request ID', 'Email', 'Role', 'Display Name', 'Phone', 'Business Name', 'Status',
  'Expires At', 'Created At', 'Updated At'
]);
const ADMIN_HEADERS = Object.freeze([
  'Admin ID', 'Name', 'Email', 'Phone', 'Status', 'Created At', 'Updated At', 'Email Verified At'
]);
const PARTNER_LEAD_HEADERS = Object.freeze([
  'Lead ID', 'Partner ID', 'Partner User ID', 'Contact Name', 'Phone', 'Email',
  'Business Name', 'Business Structure', 'City', 'State', 'Service ID', 'Product ID',
  'Notes', 'Status', 'Customer ID', 'Assignment ID', 'Created At', 'Updated At'
]);
const PARTNER_LEAD_STATUS_VALUES = Object.freeze(['NEW', 'CONTACTED', 'QUALIFIED', 'ON_HOLD', 'LOST', 'CONVERTED']);
const PARTNER_ACCESS_HEADERS = Object.freeze([
  'Access ID', 'Partner ID', 'Item Type', 'Item ID', 'Active', 'Created At', 'Updated At'
]);

/**
 * One-click setup. Safe to run repeatedly.
 * Creates or reuses the database, creates all V12 sheets, seeds service/product
 * catalogues, and ensures the portal security secret exists.
 */
function setupDatabase() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Database setup is already running. Please retry shortly.');

  try {
    const properties = PropertiesService.getScriptProperties();
    let spreadsheet = null;
    let created = false;
    const existingId = properties.getProperty(DATABASE_PROPERTY) || '';

    if (existingId) {
      try {
        spreadsheet = SpreadsheetApp.openById(existingId);
      } catch (error) {
        properties.deleteProperty(DATABASE_PROPERTY);
      }
    }

    if (!spreadsheet) {
      spreadsheet = SpreadsheetApp.create(DATABASE_NAME);
      properties.setProperty(DATABASE_PROPERTY, spreadsheet.getId());
      created = true;
    }

    try { spreadsheet.setSpreadsheetTimeZone(TIME_ZONE); } catch (error) {}
    try { spreadsheet.setSpreadsheetLocale('en_IN'); } catch (error) {}

    ensurePortalSecret_();
    ensureDatabaseStructure_(spreadsheet);
    seedServiceCatalog_(spreadsheet);
    seedProductCatalog_(spreadsheet);

    appendAuditDirect_(spreadsheet, created ? 'DATABASE_CREATED' : 'DATABASE_VERIFIED', 'SETUP',
      created ? 'V12 database created.' : 'Existing database reused; V12 schema verified/repaired.');

    const result = {
      ok: true,
      created: created,
      version: APP_VERSION,
      leadSchemaVersion: LEAD_SCHEMA_VERSION,
      portalSchemaVersion: PORTAL_SCHEMA_VERSION,
      databaseName: spreadsheet.getName(),
      spreadsheetId: spreadsheet.getId(),
      spreadsheetUrl: spreadsheet.getUrl(),
      sheets: Object.keys(SHEETS).map(function(key) { return SHEETS[key]; })
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

function verifyProductionSetup() {
  const spreadsheet = getDatabase_();
  ensureDatabaseStructure_(spreadsheet);
  seedServiceCatalog_(spreadsheet);
  seedProductCatalog_(spreadsheet);

  const required = Object.keys(SHEETS).map(function(key) { return SHEETS[key]; });
  const missingSheets = required.filter(function(name) { return !spreadsheet.getSheetByName(name); });
  const checks = [
    headersMatch_(spreadsheet.getSheetByName(SHEETS.LEADS), LEAD_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.USERS), USER_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.CUSTOMERS), CUSTOMER_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.PARTNERS), PARTNER_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.SERVICES), SERVICE_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.PRODUCTS), PRODUCT_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.ASSIGNMENTS), ASSIGNMENT_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.WORKFLOW), WORKFLOW_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.DOCUMENTS), DOCUMENT_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.SESSIONS), SESSION_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.OTP), OTP_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.REGISTRATIONS), REGISTRATION_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.ADMINS), ADMIN_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.PARTNER_LEADS), PARTNER_LEAD_HEADERS),
    headersMatch_(spreadsheet.getSheetByName(SHEETS.PARTNER_ACCESS), PARTNER_ACCESS_HEADERS)
  ];

  const portalSecretConfigured = Boolean(PropertiesService.getScriptProperties().getProperty(PORTAL_SECRET_PROPERTY));
  const result = {
    ok: missingSheets.length === 0 && checks.every(Boolean) && portalSecretConfigured,
    version: APP_VERSION,
    portalSchemaVersion: PORTAL_SCHEMA_VERSION,
    databaseConfigured: true,
    spreadsheetName: spreadsheet.getName(),
    missingSheets: missingSheets,
    schemasValid: checks.every(Boolean),
    portalSecretConfigured: portalSecretConfigured
  };

  appendAudit_('PRODUCTION_VERIFY', result.ok ? 'OK' : 'FAILED', JSON.stringify(result));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) throw new Error('Production verification failed. Review execution log.');
  return result;
}

function getDatabaseStatus() {
  const properties = PropertiesService.getScriptProperties();
  const id = properties.getProperty(DATABASE_PROPERTY) || '';
  if (!id) {
    const result = { ok: false, configured: false, version: APP_VERSION, message: 'Run setupDatabase() first.' };
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  const spreadsheet = SpreadsheetApp.openById(id);
  const result = {
    ok: true,
    configured: true,
    version: APP_VERSION,
    databaseName: spreadsheet.getName(),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl()
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/** Health endpoint. */
function doGet(e) {
  const action = safeString_(e && e.parameter ? e.parameter.action : '', 30).toLowerCase() || 'health';
  try {
    if (action !== 'health') return jsonOutput_({ ok: false, version: APP_VERSION, error: 'Unsupported action.' });
    getDatabase_();
    return jsonOutput_({
      ok: true,
      service: 'Incentify Website + Portal Backend',
      version: APP_VERSION,
      leadSchemaVersion: LEAD_SCHEMA_VERSION,
      portalSchemaVersion: PORTAL_SCHEMA_VERSION,
      databaseConfigured: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError_('DO_GET', '', error);
    return jsonOutput_({ ok: false, service: 'Incentify Website + Portal Backend', version: APP_VERSION, databaseConfigured: false });
  }
}

/** Public lead submissions + authenticated portal bridge. */
function doPost(e) {
  let reference = '';
  try {
    if (!e) return jsonOutput_({ ok: false, error: 'Missing request.' });
    if (Number(e.contentLength || 0) > MAX_BODY_BYTES) return jsonOutput_({ ok: false, error: 'Request is too large.' });

    const transport = safeString_(e.parameter && e.parameter.transport, 20).toLowerCase();
    if (transport === 'bridge') return handleBridgePost_(e);

    if (!e.postData) return jsonOutput_({ ok: false, error: 'Missing request body.' });
    const payload = parsePayload_(e);
    reference = safeString_(payload.reference, 40).toUpperCase();

    if (String(payload.companyWebsite || '').trim()) {
      appendAudit_('SPAM', 'HONEYPOT', safeAuditValue_(reference));
      return jsonOutput_({ ok: true, reference: reference || 'RECEIVED' });
    }
    if (String(payload.action || '') !== 'lead') {
      appendAudit_('REJECTED', 'UNSUPPORTED_ACTION', safeAuditValue_(payload.action));
      return jsonOutput_({ ok: false, error: 'Unsupported action.' });
    }

    const lead = validateAndNormalizeLead_(payload);
    reference = lead.reference;
    const result = saveLead_(lead);
    return jsonOutput_({ ok: true, duplicate: result.duplicate, reference: lead.reference, version: APP_VERSION });
  } catch (error) {
    logError_('DO_POST', reference, error);
    return jsonOutput_({ ok: false, reference: reference, error: 'Unable to process request.' });
  }
}

function handleBridgePost_(e) {
  let requestId = '';
  let origin = 'https://incentify.in';
  try {
    const raw = safeString_(e.parameter && e.parameter.payload, MAX_BODY_BYTES);
    if (!raw) return bridgeOutput_('', { ok: false, error: 'Missing portal payload.' }, origin);
    const request = JSON.parse(raw);
    requestId = safeString_(request.requestId, 120);
    origin = normalizeAllowedOrigin_(safeString_(request.origin, 200));
    if (!requestId) return bridgeOutput_('', { ok: false, error: 'Invalid request ID.' }, origin);

    const action = safeString_(request.action, 60);
    const sessionToken = safeString_(request.sessionToken, 300);
    const data = request.data && typeof request.data === 'object' ? request.data : {};
    const response = handlePortalAction_(action, data, sessionToken);
    return bridgeOutput_(requestId, response, origin);
  } catch (error) {
    logError_('PORTAL_BRIDGE', requestId, error);
    return bridgeOutput_(requestId, { ok: false, error: 'The portal request could not be processed.' }, origin);
  }
}

function handlePortalAction_(action, data, sessionToken) {
  try {
    switch (action) {
      case 'requestOtp': return requestPortalOtp_(data);
      case 'verifyOtp': return verifyPortalOtp_(data);
      case 'requestRegistrationOtp': return requestPortalRegistrationOtp_(data);
      case 'verifyRegistrationOtp': return verifyPortalRegistrationOtp_(data);
      case 'getDashboard': return success_(getPortalDashboard_(requireSession_(sessionToken)));
      case 'logout': return logoutPortal_(requireSession_(sessionToken));
      case 'updateProfile': return updateProfile_(requireSession_(sessionToken), data);
      case 'updateAssignmentStatus': return updateAssignmentStatus_(requireSession_(sessionToken), data);
      case 'addWorkflowNote': return addWorkflowNote_(requireSession_(sessionToken), data);
      case 'addDocumentLink': return addDocumentLink_(requireSession_(sessionToken), data);
      case 'submitPartnerLead': return submitPartnerLead_(requireSession_(sessionToken), data);
      case 'adminUpsertService': return adminUpsertService_(requireSession_(sessionToken), data);
      case 'adminUpsertProduct': return adminUpsertProduct_(requireSession_(sessionToken), data);
      case 'adminSetPartnerStatus': return adminSetPartnerStatus_(requireSession_(sessionToken), data);
      case 'adminSetPartnerCatalogAccess': return adminSetPartnerCatalogAccess_(requireSession_(sessionToken), data);
      case 'adminUpdatePartnerLeadStatus': return adminUpdatePartnerLeadStatus_(requireSession_(sessionToken), data);
      case 'adminConvertPartnerLead': return adminConvertPartnerLead_(requireSession_(sessionToken), data);
      case 'adminCreateAssignment': return adminCreateAssignment_(requireSession_(sessionToken), data);
      default: return failure_('Unsupported portal action.');
    }
  } catch (error) {
    const message = error && error.message ? safeString_(error.message, 240) : 'Portal request failed.';
    return failure_(message);
  }
}

function requestPortalOtp_(data) {
  const email = normalizeEmail_(data.email);
  const role = normalizeRole_(data.role);
  if (!email || !role) return failure_('Enter a valid registered email and portal role.');

  let user = findUserByEmailRole_(email, role);
  if (!user && role === 'customer') user = autoProvisionCustomerFromLead_(email);
  if (!user) return failure_('No portal account was found for this email and role. Register first or contact Incentify.');
  if (!isTruthy_(user['Active'])) {
    return failure_(role === 'partner'
      ? 'This partner account is pending approval or inactive. Contact Incentify if approval is expected.'
      : 'This portal account is inactive. Contact Incentify support.');
  }

  const sent = sendPortalOtp_(email, role, 'login', String(user['User ID'] || ''), String(user['Display Name'] || ''));
  if (!sent.ok) return sent;
  appendAudit_('PORTAL_LOGIN_OTP_SENT', user['User ID'], role + '|' + email);
  return success_({ message: 'A one-time login code has been sent to your registered email address.', delivery: 'email' });
}

function verifyPortalOtp_(data) {
  const email = normalizeEmail_(data.email);
  const role = normalizeRole_(data.role);
  const otp = safeString_(data.otp, 6);
  if (!email || !role || !/^\d{6}$/.test(otp)) return failure_('Enter the valid 6-digit code.');

  const user = findUserByEmailRole_(email, role);
  if (!user || !isTruthy_(user['Active'])) return failure_('Portal access is not active.');

  const otpRecord = findLatestOtp_(email, role, 'login', '');
  const verified = verifyOtpRecord_(otpRecord, email, role, otp, 'login', String(user['User ID'] || ''));
  if (!verified.ok) return verified;

  updateRowByObject_(SHEETS.USERS, user, {
    'Last Login At': new Date().toISOString(),
    'Updated At': new Date().toISOString()
  });
  appendAudit_('PORTAL_LOGIN', user['User ID'], role + '|' + email);
  return success_(createAuthenticatedPortalPayload_(user));
}

function requestPortalRegistrationOtp_(data) {
  const role = normalizeRole_(data.role);
  const email = normalizeEmail_(data.email);
  const displayName = safeString_(data.displayName, 80);
  const phone = safeString_(data.phone, 20).replace(/[\s-]/g, '');
  const businessName = safeString_(data.businessName, 120);
  const acceptedTerms = data.acceptedTerms === true || String(data.acceptedTerms).toLowerCase() === 'true';

  if (!role || !email) return failure_('Enter a valid email address and account type.');
  if (role === 'admin') return failure_('Admin accounts cannot self-register. Contact the system owner.');
  if (displayName.length < 2) return failure_('Enter your full name.');
  if (businessName.length < 2) return failure_(role === 'partner' ? 'Enter your practice or business name.' : 'Enter your business name.');
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) return failure_('Enter a valid Indian mobile number.');
  if (!acceptedTerms) return failure_('Accept the Terms and Privacy Policy to continue.');

  const existing = findUserByEmailRole_(email, role);
  if (existing) {
    if (isTruthy_(existing['Active'])) return failure_('An active account already exists for this email and role. Use Login instead.');
    return failure_(role === 'partner'
      ? 'A partner registration already exists and is pending approval or inactive.'
      : 'An account already exists but is inactive. Contact Incentify support.');
  }

  const recentRegistration = sheetObjects_(SHEETS.REGISTRATIONS).filter(function(row) {
    return normalizeEmail_(row['Email']) === email && String(row['Role']).toLowerCase() === role &&
      ['OTP_SENT', 'EMAIL_VERIFIED', 'PENDING_APPROVAL'].indexOf(String(row['Status'])) !== -1;
  }).sort(function(a, b) {
    return Date.parse(String(a['Created At'])) - Date.parse(String(b['Created At']));
  }).slice(-1)[0] || null;

  let requestId = '';
  let activeRegistration = null;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + REGISTRATION_TTL_MINUTES * 60 * 1000).toISOString();
  if (recentRegistration && Date.parse(String(recentRegistration['Expires At'])) > Date.now() && String(recentRegistration['Status']) === 'OTP_SENT') {
    requestId = String(recentRegistration['Request ID'] || '');
    activeRegistration = recentRegistration;
    updateRowByObject_(SHEETS.REGISTRATIONS, recentRegistration, {
      'Display Name': displayName, 'Phone': phone, 'Business Name': businessName,
      'Expires At': expiresAt, 'Updated At': now
    });
  } else {
    requestId = createId_('REG');
    getDatabase_().getSheetByName(SHEETS.REGISTRATIONS).appendRow([
      requestId, safeCell_(email), safeCell_(role), safeCell_(displayName), safeCell_(phone),
      safeCell_(businessName), 'OTP_SENT', expiresAt, now, now
    ]);
  }

  const sent = sendPortalOtp_(email, role, 'register', requestId, displayName);
  if (!sent.ok) {
    const registration = activeRegistration || findRow_(SHEETS.REGISTRATIONS, 'Request ID', requestId);
    if (registration) updateRowByObject_(SHEETS.REGISTRATIONS, registration, { 'Status': 'OTP_SENT', 'Updated At': new Date().toISOString() });
    return sent;
  }

  appendAudit_('PORTAL_REGISTRATION_OTP_SENT', requestId, role + '|' + email);
  return success_({
    requestId: requestId,
    message: 'A registration verification code has been sent to your email address.',
    delivery: 'email'
  });
}

function verifyPortalRegistrationOtp_(data) {
  const requestId = safeString_(data.requestId, 80);
  const email = normalizeEmail_(data.email);
  const role = normalizeRole_(data.role);
  const otp = safeString_(data.otp, 6);
  if (!requestId || !email || !role || !/^\d{6}$/.test(otp)) return failure_('Enter the valid registration verification code.');

  const registration = findRow_(SHEETS.REGISTRATIONS, 'Request ID', requestId);
  if (!registration || normalizeEmail_(registration['Email']) !== email || String(registration['Role']).toLowerCase() !== role) {
    return failure_('Registration request was not found. Start registration again.');
  }
  if (String(registration['Status']) !== 'OTP_SENT') return failure_('This registration request has already been processed.');
  if (Date.parse(String(registration['Expires At'])) <= Date.now()) {
    updateRowByObject_(SHEETS.REGISTRATIONS, registration, { 'Status': 'EXPIRED', 'Updated At': new Date().toISOString() });
    return failure_('This registration request has expired. Start registration again.');
  }

  const otpRecord = findLatestOtp_(email, role, 'register', requestId);
  const verified = verifyOtpRecord_(otpRecord, email, role, otp, 'register', requestId);
  if (!verified.ok) return verified;

  const verifiedAt = new Date().toISOString();
  updateRowByObject_(SHEETS.REGISTRATIONS, registration, { 'Status': 'EMAIL_VERIFIED', 'Updated At': verifiedAt });

  if (findUserByEmailRole_(email, role)) return failure_('An account already exists for this email and role. Use Login.');

  const displayName = safeString_(registration['Display Name'], 80);
  const phone = safeString_(registration['Phone'], 20);
  const businessName = safeString_(registration['Business Name'], 120);

  if (role === 'partner') {
    const provisioned = provisionPortalUser_(email, role, displayName, businessName, phone, {
      active: false,
      status: 'PENDING_APPROVAL',
      emailVerifiedAt: verifiedAt,
      source: 'self-registration'
    });
    updateRowByObject_(SHEETS.REGISTRATIONS, registration, { 'Status': 'PENDING_APPROVAL', 'Updated At': new Date().toISOString() });
    appendAudit_('PARTNER_REGISTRATION_PENDING', provisioned.userId || requestId, email);
    return success_({
      pendingApproval: true,
      message: 'Your email is verified. The partner account is pending Incentify approval before login is enabled.'
    });
  }

  const provisioned = provisionPortalUser_(email, role, displayName, businessName, phone, {
    active: true,
    status: 'ACTIVE',
    emailVerifiedAt: verifiedAt,
    source: 'self-registration'
  });
  const user = findUserByEmailRole_(email, 'customer');
  if (!user || !provisioned.ok) return failure_('Customer account could not be created. Contact Incentify support.');
  updateRowByObject_(SHEETS.REGISTRATIONS, registration, { 'Status': 'ACTIVE', 'Updated At': new Date().toISOString() });
  appendAudit_('CUSTOMER_REGISTRATION_ACTIVE', user['User ID'], email);
  return success_(Object.assign({ pendingApproval: false, message: 'Customer account created and email verified.' }, createAuthenticatedPortalPayload_(user)));
}

function sendPortalOtp_(email, role, purpose, reference, displayName) {
  const nowMs = Date.now();
  const recent = findLatestOtp_(email, role, purpose, '');
  if (recent && nowMs - Date.parse(String(recent['Created At'])) < OTP_COOLDOWN_SECONDS * 1000) {
    return failure_('Please wait a minute before requesting another code.');
  }

  const hourAgo = nowMs - 60 * 60 * 1000;
  const recentCount = sheetObjects_(SHEETS.OTP).filter(function(row) {
    return normalizeEmail_(row['Email']) === email && String(row['Role']).toLowerCase() === role &&
      String(row['Purpose'] || 'login').toLowerCase() === purpose && Date.parse(String(row['Created At'])) >= hourAgo;
  }).length;
  if (recentCount >= OTP_MAX_REQUESTS_PER_HOUR) return failure_('Too many OTP requests. Please try again later.');

  if (MailApp.getRemainingDailyQuota() < 1) {
    appendAudit_('PORTAL_OTP_QUOTA_EXHAUSTED', reference || email, purpose + '|' + role);
    return failure_('Email delivery is temporarily unavailable. Please contact Incentify support.');
  }

  const otp = generatePortalOtp_();
  const expiresAt = new Date(nowMs + OTP_TTL_MINUTES * 60 * 1000).toISOString();
  const createdAt = new Date(nowMs).toISOString();
  const otpSheet = getDatabase_().getSheetByName(SHEETS.OTP);
  otpSheet.appendRow([
    hashPortalValue_('otp|' + email + '|' + role + '|' + purpose + '|' + reference + '|' + otp),
    safeCell_(email), safeCell_(role), expiresAt, 0, false, createdAt, safeCell_(purpose), safeCell_(reference)
  ]);
  const otpRecord = findLatestOtp_(email, role, purpose, reference);

  const isRegistration = purpose === 'register';
  const subject = isRegistration ? 'Verify your Incentify portal registration' : 'Your Incentify portal login code';
  const heading = isRegistration ? 'Verify your Incentify registration' : 'Incentify Portal Login';
  const greeting = displayName ? '<p>Hello ' + htmlEscape_(displayName) + ',</p>' : '';
  const plainBody = (displayName ? 'Hello ' + displayName + ',\n\n' : '') +
    'Your Incentify one-time verification code is: ' + otp + '\n\n' +
    'This code expires in ' + OTP_TTL_MINUTES + ' minutes. Do not share it.\n\n' +
    'If you did not request this code, ignore this email.';
  const htmlBody = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#142433">' +
    '<div style="background:#0B3B66;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0"><strong>INCENTIFY</strong><br><span style="font-size:12px;opacity:.8">WE GROW TOGETHER</span></div>' +
    '<div style="border:1px solid #dce8f2;border-top:0;padding:24px;border-radius:0 0 12px 12px">' +
    '<h2 style="color:#0B3B66;margin-top:0">' + heading + '</h2>' + greeting +
    '<p>Your one-time verification code is:</p>' +
    '<p style="font-size:32px;font-weight:800;letter-spacing:6px;color:#0B3B66">' + otp + '</p>' +
    '<p>This code expires in ' + OTP_TTL_MINUTES + ' minutes. Do not share it with anyone.</p>' +
    '<p style="color:#607385;font-size:13px">If you did not request this code, you can safely ignore this email.</p>' +
    '</div></div>';

  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'Incentify Private Limited',
      replyTo: OFFICIAL_REPLY_TO
    });
  } catch (error) {
    if (otpRecord) updateRowByObject_(SHEETS.OTP, otpRecord, { 'Consumed': true });
    logError_('PORTAL_OTP_EMAIL', reference || email, error);
    return failure_('We could not send the OTP email just now. Please retry or contact Incentify support.');
  }
  return success_({ sent: true });
}

function verifyOtpRecord_(otpRecord, email, role, otp, purpose, reference) {
  if (!otpRecord) return failure_('No active verification code was found. Request a new code.');
  if (isTruthy_(otpRecord['Consumed'])) return failure_('This verification code has already been used.');
  if (Date.parse(String(otpRecord['Expires At'])) <= Date.now()) return failure_('This verification code has expired. Request a new one.');

  const attempts = Number(otpRecord['Attempts'] || 0);
  if (attempts >= OTP_MAX_ATTEMPTS) return failure_('Too many incorrect attempts. Request a new code.');

  const expected = String(otpRecord['OTP Hash']);
  const actual = hashPortalValue_('otp|' + email + '|' + role + '|' + purpose + '|' + reference + '|' + otp);
  if (expected !== actual) {
    updateRowByObject_(SHEETS.OTP, otpRecord, { 'Attempts': attempts + 1 });
    return failure_('The one-time code is incorrect.');
  }
  updateRowByObject_(SHEETS.OTP, otpRecord, { 'Consumed': true });
  return success_({ verified: true });
}

function createAuthenticatedPortalPayload_(user) {
  const rawToken = createPortalToken_();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const sessionHash = hashPortalValue_('session|' + rawToken);
  getDatabase_().getSheetByName(SHEETS.SESSIONS).appendRow([
    sessionHash, safeCell_(user['User ID']), safeCell_(user['Role']), expiresAt, false,
    new Date().toISOString(), new Date().toISOString()
  ]);
  const session = {
    token: rawToken,
    role: String(user['Role']),
    email: String(user['Email']),
    displayName: String(user['Display Name'] || ''),
    expiresAt: expiresAt
  };
  return { session: session, dashboard: getPortalDashboard_({ user: user, tokenHash: sessionHash }) };
}

function requireSession_(rawToken) {
  if (!rawToken) throw new Error('Session is required.');
  const hash = hashPortalValue_('session|' + rawToken);
  const sessions = sheetObjects_(SHEETS.SESSIONS);
  const session = sessions.filter(function(row) {
    return String(row['Session Hash']) === hash && !isTruthy_(row['Revoked']);
  }).slice(-1)[0];
  if (!session) throw new Error('Session is invalid.');
  if (Date.parse(String(session['Expires At'])) <= Date.now()) {
    updateRowByObject_(SHEETS.SESSIONS, session, { 'Revoked': true, 'Last Seen At': new Date().toISOString() });
    throw new Error('Session has expired.');
  }

  const user = findRow_(SHEETS.USERS, 'User ID', String(session['User ID']));
  if (!user || !isTruthy_(user['Active'])) throw new Error('Portal user is not active.');
  if (String(session['Role']).toLowerCase() !== String(user['Role']).toLowerCase()) throw new Error('Session role is invalid.');
  updateRowByObject_(SHEETS.SESSIONS, session, { 'Last Seen At': new Date().toISOString() });
  return { user: user, tokenHash: hash, session: session };
}

function logoutPortal_(auth) {
  updateRowByObject_(SHEETS.SESSIONS, auth.session, { 'Revoked': true, 'Last Seen At': new Date().toISOString() });
  appendAudit_('PORTAL_LOGOUT', auth.user['User ID'], String(auth.user['Role']));
  return success_({ loggedOut: true });
}

function getPortalDashboard_(auth) {
  const user = auth.user;
  const role = String(user['Role']);
  const entityId = String(user['Entity ID']);
  let profileRecord = null;
  if (role === 'partner') profileRecord = findRow_(SHEETS.PARTNERS, 'Partner ID', entityId);
  else if (role === 'admin') profileRecord = findRow_(SHEETS.ADMINS, 'Admin ID', entityId);
  else profileRecord = findRow_(SHEETS.CUSTOMERS, 'Customer ID', entityId);

  const allServices = sheetObjects_(SHEETS.SERVICES).sort(sortOrder_).map(servicePublic_);
  const allProducts = sheetObjects_(SHEETS.PRODUCTS).sort(sortOrder_).map(productPublic_);
  const partnerAccessRows = role === 'partner' ? sheetObjects_(SHEETS.PARTNER_ACCESS).filter(function(row) { return String(row['Partner ID']) === entityId && isTruthy_(row['Active']); }) : [];
  const allowedServiceIds = partnerAccessRows.filter(function(row) { return String(row['Item Type']).toUpperCase() === 'SERVICE'; }).map(function(row) { return String(row['Item ID']); });
  const allowedProductIds = partnerAccessRows.filter(function(row) { return String(row['Item Type']).toUpperCase() === 'PRODUCT'; }).map(function(row) { return String(row['Item ID']); });
  const services = role === 'admin' ? allServices : role === 'partner' ? allServices.filter(function(row) { return row.active && allowedServiceIds.indexOf(row.serviceId) !== -1; }) : allServices.filter(function(row) { return row.active; });
  const products = role === 'customer' ? [] : role === 'admin' ? allProducts : allProducts.filter(function(row) { return row.active && allowedProductIds.indexOf(row.productId) !== -1; });

  const assignmentRows = sheetObjects_(SHEETS.ASSIGNMENTS).filter(function(row) {
    if (role === 'admin') return true;
    return role === 'partner' ? String(row['Partner ID']) === entityId : String(row['Customer ID']) === entityId;
  });
  const serviceById = indexBy_(allServices, 'serviceId');
  const productById = indexBy_(allProducts, 'productId');
  const assignmentIds = assignmentRows.map(function(row) { return String(row['Assignment ID']); });
  const assignments = assignmentRows.map(function(row) {
    const service = serviceById[String(row['Service ID'])] || {};
    const product = productById[String(row['Product ID'])] || {};
    return {
      assignmentId: String(row['Assignment ID'] || ''), customerId: String(row['Customer ID'] || ''),
      partnerId: String(row['Partner ID'] || ''), serviceId: String(row['Service ID'] || ''),
      serviceName: String(service.name || row['Service ID'] || ''), productId: String(row['Product ID'] || ''),
      productName: String(product.name || ''), status: String(row['Status'] || 'ASSIGNED'),
      priority: String(row['Priority'] || 'NORMAL'), startedAt: String(row['Started At'] || ''),
      dueDate: String(row['Due Date'] || ''), updatedAt: String(row['Updated At'] || ''), createdAt: String(row['Created At'] || '')
    };
  });

  const workflow = sheetObjects_(SHEETS.WORKFLOW)
    .filter(function(row) { return assignmentIds.indexOf(String(row['Assignment ID'])) !== -1; })
    .sort(function(a, b) { return Date.parse(String(b['Created At'])) - Date.parse(String(a['Created At'])); })
    .map(function(row) { return { workflowId: String(row['Workflow ID'] || ''), assignmentId: String(row['Assignment ID'] || ''), status: String(row['Status'] || ''), note: String(row['Note'] || ''), actorUserId: String(row['Actor User ID'] || ''), actorRole: String(row['Actor Role'] || ''), createdAt: String(row['Created At'] || '') }; });

  const documents = sheetObjects_(SHEETS.DOCUMENTS)
    .filter(function(row) { return assignmentIds.indexOf(String(row['Assignment ID'])) !== -1; })
    .sort(function(a, b) { return Date.parse(String(b['Created At'])) - Date.parse(String(a['Created At'])); })
    .map(function(row) { return { documentId: String(row['Document ID'] || ''), assignmentId: String(row['Assignment ID'] || ''), label: String(row['Label'] || ''), url: String(row['URL'] || ''), status: String(row['Status'] || ''), addedBy: String(row['Added By'] || ''), createdAt: String(row['Created At'] || '') }; });

  const partnerRows = sheetObjects_(SHEETS.PARTNERS);
  const partnerById = {};
  partnerRows.forEach(function(row) { partnerById[String(row['Partner ID'])] = row; });
  const partnerLeadRows = sheetObjects_(SHEETS.PARTNER_LEADS).filter(function(row) {
    return role === 'admin' || (role === 'partner' && String(row['Partner ID']) === entityId);
  });
  const partnerLeads = partnerLeadRows.sort(function(a,b) { return Date.parse(String(b['Created At'])) - Date.parse(String(a['Created At'])); }).map(function(row) {
    const service = serviceById[String(row['Service ID'])] || {};
    const product = productById[String(row['Product ID'])] || {};
    const partner = partnerById[String(row['Partner ID'])] || {};
    return {
      leadId: String(row['Lead ID'] || ''), partnerId: String(row['Partner ID'] || ''),
      partnerName: String(partner['Practice / Business Name'] || row['Partner ID'] || ''),
      contactName: String(row['Contact Name'] || ''), phone: String(row['Phone'] || ''), email: String(row['Email'] || ''),
      businessName: String(row['Business Name'] || ''), businessStructure: String(row['Business Structure'] || ''),
      city: String(row['City'] || ''), state: String(row['State'] || ''), serviceId: String(row['Service ID'] || ''),
      serviceName: String(service.name || row['Service ID'] || ''), productId: String(row['Product ID'] || ''), productName: String(product.name || ''),
      notes: String(row['Notes'] || ''), status: String(row['Status'] || 'NEW'), customerId: String(row['Customer ID'] || ''),
      assignmentId: String(row['Assignment ID'] || ''), createdAt: String(row['Created At'] || ''), updatedAt: String(row['Updated At'] || '')
    };
  });

  const customers = role === 'admin' ? sheetObjects_(SHEETS.CUSTOMERS).map(function(row) { return {
    customerId: String(row['Customer ID'] || ''), businessName: String(row['Business Name'] || ''), contactName: String(row['Contact Name'] || ''),
    email: String(row['Email'] || ''), phone: String(row['Phone'] || ''), status: String(row['Status'] || ''), createdAt: String(row['Created At'] || ''), updatedAt: String(row['Updated At'] || '')
  }; }) : [];
  const allAccessRows = role === 'admin' ? sheetObjects_(SHEETS.PARTNER_ACCESS) : [];
  const partners = role === 'admin' ? partnerRows.map(function(row) {
    const partnerId = String(row['Partner ID'] || '');
    const portalUser = sheetObjects_(SHEETS.USERS).filter(function(u) { return String(u['Role']).toLowerCase() === 'partner' && String(u['Entity ID']) === partnerId; }).slice(-1)[0] || {};
    const activeAccess = allAccessRows.filter(function(access) { return String(access['Partner ID']) === partnerId && isTruthy_(access['Active']); });
    return { partnerId: partnerId, businessName: String(row['Practice / Business Name'] || ''), contactName: String(row['Contact Name'] || ''), email: String(row['Email'] || ''), phone: String(row['Phone'] || ''), status: String(row['Status'] || ''), active: isTruthy_(portalUser['Active']), serviceIds: activeAccess.filter(function(access) { return String(access['Item Type']).toUpperCase() === 'SERVICE'; }).map(function(access) { return String(access['Item ID']); }), productIds: activeAccess.filter(function(access) { return String(access['Item Type']).toUpperCase() === 'PRODUCT'; }).map(function(access) { return String(access['Item ID']); }), createdAt: String(row['Created At'] || ''), updatedAt: String(row['Updated At'] || '') };
  }) : [];
  const registrations = role === 'admin' ? sheetObjects_(SHEETS.REGISTRATIONS).map(function(row) { return {
    requestId: String(row['Request ID'] || ''), email: String(row['Email'] || ''), role: String(row['Role'] || ''), displayName: String(row['Display Name'] || ''),
    phone: String(row['Phone'] || ''), businessName: String(row['Business Name'] || ''), status: String(row['Status'] || ''), createdAt: String(row['Created At'] || ''), updatedAt: String(row['Updated At'] || '')
  }; }) : [];

  const businessName = profileRecord ? String(profileRecord['Business Name'] || profileRecord['Practice / Business Name'] || profileRecord['Organisation Name'] || profileRecord['Name'] || '') : '';
  return {
    version: APP_VERSION,
    profile: { userId: String(user['User ID'] || ''), email: String(user['Email'] || ''), role: role, displayName: String(user['Display Name'] || ''), entityId: entityId, entityName: businessName, phone: String(profileRecord ? profileRecord['Phone'] || '' : ''), businessName: businessName, active: isTruthy_(user['Active']) },
    services: services, products: products, assignments: assignments, workflow: workflow, documents: documents,
    partnerLeads: partnerLeads, customers: customers, partners: partners, registrations: registrations
  };
}

function updateProfile_(auth, data) {
  const displayName = safeString_(data.displayName, 80);
  const phone = safeString_(data.phone, 20);
  const businessName = safeString_(data.businessName, 120);
  if (displayName.length < 2) return failure_('Display name is required.');
  if (phone && !/^(?:\+91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''))) return failure_('Enter a valid Indian mobile number.');
  updateRowByObject_(SHEETS.USERS, auth.user, { 'Display Name': displayName, 'Updated At': new Date().toISOString() });
  const role = String(auth.user['Role']);
  const entityId = String(auth.user['Entity ID']);
  if (role === 'customer') {
    const row = findRow_(SHEETS.CUSTOMERS, 'Customer ID', entityId);
    if (row) updateRowByObject_(SHEETS.CUSTOMERS, row, { 'Business Name': businessName, 'Contact Name': displayName, 'Phone': phone, 'Updated At': new Date().toISOString() });
  } else if (role === 'partner') {
    const row = findRow_(SHEETS.PARTNERS, 'Partner ID', entityId);
    if (row) updateRowByObject_(SHEETS.PARTNERS, row, { 'Practice / Business Name': businessName, 'Contact Name': displayName, 'Phone': phone, 'Updated At': new Date().toISOString() });
  } else if (role === 'admin') {
    const row = findRow_(SHEETS.ADMINS, 'Admin ID', entityId);
    if (row) updateRowByObject_(SHEETS.ADMINS, row, { 'Name': displayName, 'Phone': phone, 'Updated At': new Date().toISOString() });
  }
  appendAudit_('PORTAL_PROFILE_UPDATED', auth.user['User ID'], role);
  return success_({ updated: true });
}

function updateAssignmentStatus_(auth, data) {
  const role = String(auth.user['Role']);
  if (role !== 'partner' && role !== 'admin') return failure_('Only partners or admins can update service status.');
  const assignmentId = safeString_(data.assignmentId, 80);
  const status = safeString_(data.status, 40).toUpperCase();
  if (PARTNER_STATUS_VALUES.indexOf(status) === -1) return failure_('Invalid workflow status.');
  const assignment = findRow_(SHEETS.ASSIGNMENTS, 'Assignment ID', assignmentId);
  if (!assignment) return failure_('Assignment not found.');
  if (role === 'partner' && String(assignment['Partner ID']) !== String(auth.user['Entity ID'])) return failure_('Assignment not found.');
  const currentStatus = safeString_(assignment['Status'], 40).toUpperCase() || 'ASSIGNED';
  if (role === 'partner' && !isAllowedPartnerStatusTransition_(currentStatus, status)) return failure_('This workflow status transition is not allowed.');
  if (currentStatus === status) return success_({ updated: true, unchanged: true });
  updateRowByObject_(SHEETS.ASSIGNMENTS, assignment, { 'Status': status, 'Updated At': new Date().toISOString() });
  appendWorkflow_(assignmentId, status, 'Status updated to ' + status + '.', auth.user);
  appendAudit_('ASSIGNMENT_STATUS', assignmentId, status + '|' + auth.user['User ID']);
  return success_({ updated: true });
}

function addWorkflowNote_(auth, data) {
  const assignmentId = safeString_(data.assignmentId, 80);
  const note = safeString_(data.note, 500);
  if (note.length < 2) return failure_('Enter a workflow note.');
  const assignment = authorizedAssignment_(auth.user, assignmentId);
  if (!assignment) return failure_('Assignment not found.');
  appendWorkflow_(assignmentId, 'NOTE', note, auth.user);
  appendAudit_('WORKFLOW_NOTE', assignmentId, auth.user['User ID']);
  return success_({ created: true });
}

function addDocumentLink_(auth, data) {
  const assignmentId = safeString_(data.assignmentId, 80);
  const label = safeString_(data.label, 120);
  const url = safeString_(data.url, 1200);
  if (!label || !/^https:\/\//i.test(url)) return failure_('Provide a document label and a valid HTTPS share URL.');
  const assignment = authorizedAssignment_(auth.user, assignmentId);
  if (!assignment) return failure_('Assignment not found.');

  const sheet = getDatabase_().getSheetByName(SHEETS.DOCUMENTS);
  sheet.appendRow([
    createId_('DOC'), assignmentId, String(assignment['Customer ID'] || ''), String(assignment['Partner ID'] || ''),
    safeCell_(label), safeCell_(url), 'SUBMITTED', safeCell_(auth.user['User ID']), new Date().toISOString()
  ]);
  appendAudit_('DOCUMENT_LINK_ADDED', assignmentId, auth.user['User ID']);
  return success_({ created: true });
}

function authorizedAssignment_(user, assignmentId) {
  const row = findRow_(SHEETS.ASSIGNMENTS, 'Assignment ID', assignmentId);
  if (!row) return null;
  const role = String(user['Role']);
  if (role === 'admin') return row;
  return role === 'partner'
    ? (String(row['Partner ID']) === String(user['Entity ID']) ? row : null)
    : (String(row['Customer ID']) === String(user['Entity ID']) ? row : null);
}

function appendWorkflow_(assignmentId, status, note, user) {
  const sheet = getDatabase_().getSheetByName(SHEETS.WORKFLOW);
  sheet.appendRow([
    createId_('WF'), safeCell_(assignmentId), safeCell_(status), safeCell_(note),
    safeCell_(user['User ID']), safeCell_(user['Role']), new Date().toISOString()
  ]);
}


function requireRole_(auth, role) {
  if (!auth || !auth.user || String(auth.user['Role']) !== role) throw new Error('You are not authorised for this action.');
  return auth;
}

function submitPartnerLead_(auth, data) {
  requireRole_(auth, 'partner');
  const contactName = safeString_(data.contactName, 100);
  const phone = safeString_(data.phone, 20).replace(/[\s-]/g, '');
  const email = normalizeEmail_(data.email);
  const businessName = safeString_(data.businessName, 140);
  const businessStructure = safeString_(data.businessStructure, 100);
  const city = safeString_(data.city, 80);
  const state = safeString_(data.state, 80);
  const serviceId = safeString_(data.serviceId, 80);
  const productId = safeString_(data.productId, 80);
  const notes = safeString_(data.notes, 1000);
  if (contactName.length < 2) return failure_('Enter the lead contact name.');
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) return failure_('Enter a valid Indian mobile number.');
  if (!email) return failure_('Enter a valid lead email address.');
  if (businessName.length < 2) return failure_('Enter the business or proposed company name.');
  const partnerId = String(auth.user['Entity ID']);
  const partner = findRow_(SHEETS.PARTNERS, 'Partner ID', partnerId);
  if (!partner || String(partner['Status']).toUpperCase() !== 'ACTIVE') return failure_('Partner account is not active.');
  const service = findRow_(SHEETS.SERVICES, 'Service ID', serviceId);
  if (!service || !isTruthy_(service['Active'])) return failure_('Select an active service.');
  if (!isPartnerCatalogAllowed_(partnerId, 'SERVICE', serviceId)) return failure_('This service is not assigned to your partner account.');
  if (productId) {
    const product = findRow_(SHEETS.PRODUCTS, 'Product ID', productId);
    if (!product || !isTruthy_(product['Active'])) return failure_('Selected product is not active.');
    if (!isPartnerCatalogAllowed_(partnerId, 'PRODUCT', productId)) return failure_('This product is not assigned to your partner account.');
  }

  const duplicateSince = Date.now() - 10 * 60 * 1000;
  const duplicate = sheetObjects_(SHEETS.PARTNER_LEADS).filter(function(row) {
    return String(row['Partner ID']) === partnerId && normalizeEmail_(row['Email']) === email &&
      String(row['Service ID']) === serviceId && Date.parse(String(row['Created At'])) >= duplicateSince &&
      String(row['Status']).toUpperCase() !== 'LOST';
  }).slice(-1)[0] || null;
  if (duplicate) return success_({ leadId: String(duplicate['Lead ID']), duplicate: true });

  const now = new Date().toISOString();
  const leadId = createId_('PLEAD');
  getDatabase_().getSheetByName(SHEETS.PARTNER_LEADS).appendRow([
    leadId, partnerId, String(auth.user['User ID']), safeCell_(contactName), safeCell_(phone), safeCell_(email),
    safeCell_(businessName), safeCell_(businessStructure), safeCell_(city), safeCell_(state), safeCell_(serviceId), safeCell_(productId),
    safeCell_(notes), 'NEW', '', '', now, now
  ]);
  appendAudit_('PARTNER_LEAD_CREATED', leadId, String(auth.user['Entity ID']) + '|' + serviceId);
  return success_({ leadId: leadId });
}

function isPartnerCatalogAllowed_(partnerId, itemType, itemId) {
  if (!partnerId || !itemId) return false;
  const type = String(itemType || '').toUpperCase();
  return sheetObjects_(SHEETS.PARTNER_ACCESS).some(function(row) {
    return String(row['Partner ID']) === String(partnerId) &&
      String(row['Item Type']).toUpperCase() === type &&
      String(row['Item ID']) === String(itemId) && isTruthy_(row['Active']);
  });
}

function adminUpsertService_(auth, data) {
  requireRole_(auth, 'admin');
  let serviceId = safeString_(data.serviceId, 80).toUpperCase();
  const name = safeString_(data.name, 120);
  const category = safeString_(data.category, 80);
  const description = safeString_(data.description, 600);
  const active = data.active === true || String(data.active).toLowerCase() === 'true';
  const sortOrder = normalizeSortOrder_(data.sortOrder);
  if (name.length < 2 || category.length < 2 || description.length < 5) return failure_('Enter service name, category and description.');
  const now = new Date().toISOString();
  if (!serviceId) serviceId = createId_('SRV');
  const existing = findRow_(SHEETS.SERVICES, 'Service ID', serviceId);
  if (existing) updateRowByObject_(SHEETS.SERVICES, existing, { 'Name': name, 'Category': category, 'Description': description, 'Active': active, 'Sort Order': sortOrder, 'Updated At': now });
  else getDatabase_().getSheetByName(SHEETS.SERVICES).appendRow([serviceId, safeCell_(name), safeCell_(category), safeCell_(description), active, sortOrder, now, now]);
  appendAudit_('ADMIN_SERVICE_SAVED', serviceId, String(auth.user['User ID']));
  return success_({ saved: true, serviceId: serviceId });
}

function adminUpsertProduct_(auth, data) {
  requireRole_(auth, 'admin');
  let productId = safeString_(data.productId, 80).toUpperCase();
  const name = safeString_(data.name, 120);
  const description = safeString_(data.description, 600);
  const billingModel = safeString_(data.billingModel, 80);
  const active = data.active === true || String(data.active).toLowerCase() === 'true';
  const sortOrder = normalizeSortOrder_(data.sortOrder);
  if (name.length < 2 || description.length < 5 || billingModel.length < 2) return failure_('Enter product name, description and billing model.');
  const now = new Date().toISOString();
  if (!productId) productId = createId_('PRD');
  const existing = findRow_(SHEETS.PRODUCTS, 'Product ID', productId);
  if (existing) updateRowByObject_(SHEETS.PRODUCTS, existing, { 'Name': name, 'Description': description, 'Billing Model': billingModel, 'Active': active, 'Sort Order': sortOrder, 'Updated At': now });
  else getDatabase_().getSheetByName(SHEETS.PRODUCTS).appendRow([productId, safeCell_(name), safeCell_(description), safeCell_(billingModel), active, sortOrder, now, now]);
  appendAudit_('ADMIN_PRODUCT_SAVED', productId, String(auth.user['User ID']));
  return success_({ saved: true, productId: productId });
}

function adminSetPartnerStatus_(auth, data) {
  requireRole_(auth, 'admin');
  const partnerId = safeString_(data.partnerId, 80);
  const status = safeString_(data.status, 30).toUpperCase();
  if (['ACTIVE','INACTIVE','REJECTED'].indexOf(status) === -1) return failure_('Invalid partner status.');
  const partner = findRow_(SHEETS.PARTNERS, 'Partner ID', partnerId);
  if (!partner) return failure_('Partner not found.');
  const email = normalizeEmail_(partner['Email']);
  const user = sheetObjects_(SHEETS.USERS).filter(function(row) { return String(row['Role']).toLowerCase() === 'partner' && String(row['Entity ID']) === partnerId; }).slice(-1)[0] || null;
  if (user) updateRowByObject_(SHEETS.USERS, user, { 'Active': status === 'ACTIVE', 'Updated At': new Date().toISOString() });
  updateRowByObject_(SHEETS.PARTNERS, partner, { 'Status': status, 'Updated At': new Date().toISOString() });
  const regs = sheetObjects_(SHEETS.REGISTRATIONS).filter(function(row) { return normalizeEmail_(row['Email']) === email && String(row['Role']).toLowerCase() === 'partner'; });
  if (regs.length) updateRowByObject_(SHEETS.REGISTRATIONS, regs[regs.length-1], { 'Status': status, 'Updated At': new Date().toISOString() });
  appendAudit_('ADMIN_PARTNER_STATUS', partnerId, status + '|' + auth.user['User ID']);
  return success_({ updated: true });
}

function adminSetPartnerCatalogAccess_(auth, data) {
  requireRole_(auth, 'admin');
  const partnerId = safeString_(data.partnerId, 80);
  const itemType = safeString_(data.itemType, 20).toUpperCase();
  const itemId = safeString_(data.itemId, 80);
  const active = data.active === true || String(data.active).toLowerCase() === 'true';
  if (['SERVICE', 'PRODUCT'].indexOf(itemType) === -1) return failure_('Invalid catalogue item type.');
  const partner = findRow_(SHEETS.PARTNERS, 'Partner ID', partnerId);
  if (!partner) return failure_('Partner not found.');
  const sourceSheet = itemType === 'SERVICE' ? SHEETS.SERVICES : SHEETS.PRODUCTS;
  const idHeader = itemType === 'SERVICE' ? 'Service ID' : 'Product ID';
  const catalogueItem = findRow_(sourceSheet, idHeader, itemId);
  if (!catalogueItem) return failure_('Catalogue item not found.');
  if (active && !isTruthy_(catalogueItem['Active'])) return failure_('Inactive catalogue items cannot be assigned to a partner.');
  const rows = sheetObjects_(SHEETS.PARTNER_ACCESS).filter(function(row) {
    return String(row['Partner ID']) === partnerId && String(row['Item Type']).toUpperCase() === itemType && String(row['Item ID']) === itemId;
  });
  const now = new Date().toISOString();
  if (rows.length) updateRowByObject_(SHEETS.PARTNER_ACCESS, rows[rows.length - 1], { 'Active': active, 'Updated At': now });
  else getDatabase_().getSheetByName(SHEETS.PARTNER_ACCESS).appendRow([createId_('PAC'), partnerId, itemType, itemId, active, now, now]);
  appendAudit_('ADMIN_PARTNER_CATALOG_ACCESS', partnerId, itemType + '|' + itemId + '|' + active + '|' + auth.user['User ID']);
  return success_({ updated: true });
}

function adminUpdatePartnerLeadStatus_(auth, data) {
  requireRole_(auth, 'admin');
  const leadId = safeString_(data.leadId, 80);
  const status = safeString_(data.status, 30).toUpperCase();
  if (PARTNER_LEAD_STATUS_VALUES.indexOf(status) === -1) return failure_('Invalid partner lead status.');
  const lead = findRow_(SHEETS.PARTNER_LEADS, 'Lead ID', leadId);
  if (!lead) return failure_('Partner lead not found.');
  if (String(lead['Status']).toUpperCase() === 'CONVERTED' && status !== 'CONVERTED') return failure_('Converted leads cannot be moved back to an earlier status.');
  updateRowByObject_(SHEETS.PARTNER_LEADS, lead, { 'Status': status, 'Updated At': new Date().toISOString() });
  appendAudit_('ADMIN_PARTNER_LEAD_STATUS', leadId, status + '|' + auth.user['User ID']);
  return success_({ updated: true });
}

function adminConvertPartnerLead_(auth, data) {
  requireRole_(auth, 'admin');
  const leadId = safeString_(data.leadId, 80);
  const dueDate = safeString_(data.dueDate, 20);
  const priority = normalizePriority_(data.priority);
  if (!priority) return failure_('Invalid assignment priority.');
  if (dueDate && !isValidIsoDate_(dueDate)) return failure_('Due date must use YYYY-MM-DD.');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return failure_('This lead is being updated. Please retry.');
  try {
    const lead = findRow_(SHEETS.PARTNER_LEADS, 'Lead ID', leadId);
    if (!lead) return failure_('Partner lead not found.');
    if (String(lead['Assignment ID'] || '')) return success_({ assignmentId: String(lead['Assignment ID']), duplicate: true });
    if (String(lead['Status']).toUpperCase() === 'LOST') return failure_('A lost lead must be re-qualified before conversion.');

    const partnerId = String(lead['Partner ID'] || '');
    const partner = findRow_(SHEETS.PARTNERS, 'Partner ID', partnerId);
    if (!partner || String(partner['Status']).toUpperCase() !== 'ACTIVE') return failure_('The originating partner is not active.');
    const serviceId = String(lead['Service ID'] || '');
    const productId = String(lead['Product ID'] || '');
    const service = findRow_(SHEETS.SERVICES, 'Service ID', serviceId);
    if (!service || !isTruthy_(service['Active'])) return failure_('The lead service is no longer active.');
    if (productId) {
      const product = findRow_(SHEETS.PRODUCTS, 'Product ID', productId);
      if (!product || !isTruthy_(product['Active'])) return failure_('The lead product is no longer active.');
    }

    const email = normalizeEmail_(lead['Email']);
    if (!email) return failure_('Lead email is invalid.');
    let customerUser = findUserByEmailRole_(email, 'customer');
    if (!customerUser) {
      provisionPortalUser_(email, 'customer', safeString_(lead['Contact Name'],80), safeString_(lead['Business Name'],120), safeString_(lead['Phone'],20), { active: true, status: 'ACTIVE', source: 'partner-lead-conversion' });
      customerUser = findUserByEmailRole_(email, 'customer');
    }
    if (!customerUser) return failure_('Customer account could not be created.');

    const assignmentId = createAssignmentRecord_(String(customerUser['Entity ID']), partnerId, serviceId, productId, priority, dueDate, auth.user, 'Partner lead converted to service work.');
    updateRowByObject_(SHEETS.PARTNER_LEADS, lead, { 'Status': 'CONVERTED', 'Customer ID': String(customerUser['Entity ID']), 'Assignment ID': assignmentId, 'Updated At': new Date().toISOString() });
    appendAudit_('ADMIN_PARTNER_LEAD_CONVERTED', leadId, assignmentId + '|' + auth.user['User ID']);
    return success_({ assignmentId: assignmentId, duplicate: false });
  } finally {
    lock.releaseLock();
  }
}

function adminCreateAssignment_(auth, data) {
  requireRole_(auth, 'admin');
  const customerId = safeString_(data.customerId, 80);
  const partnerId = safeString_(data.partnerId, 80);
  const serviceId = safeString_(data.serviceId, 80);
  const productId = safeString_(data.productId, 80);
  const priority = normalizePriority_(data.priority);
  const dueDate = safeString_(data.dueDate, 20);
  if (!priority) return failure_('Invalid assignment priority.');
  if (dueDate && !isValidIsoDate_(dueDate)) return failure_('Due date must use YYYY-MM-DD.');
  if (!findRow_(SHEETS.CUSTOMERS, 'Customer ID', customerId)) return failure_('Customer not found.');
  const partner = findRow_(SHEETS.PARTNERS, 'Partner ID', partnerId);
  if (!partner || String(partner['Status']).toUpperCase() !== 'ACTIVE') return failure_('Active partner not found.');
  const service = findRow_(SHEETS.SERVICES, 'Service ID', serviceId);
  if (!service || !isTruthy_(service['Active'])) return failure_('Active service not found.');
  if (productId) { const product = findRow_(SHEETS.PRODUCTS, 'Product ID', productId); if (!product || !isTruthy_(product['Active'])) return failure_('Active product not found.'); }
  const assignmentId = createAssignmentRecord_(customerId, partnerId, serviceId, productId, priority, dueDate, auth.user, 'Service assigned by Incentify admin.');
  appendAudit_('ADMIN_ASSIGNMENT_CREATED', assignmentId, auth.user['User ID']);
  return success_({ assignmentId: assignmentId });
}

function createAssignmentRecord_(customerId, partnerId, serviceId, productId, priority, dueDate, actorUser, note) {
  const now = new Date().toISOString();
  const assignmentId = createId_('ASN');
  getDatabase_().getSheetByName(SHEETS.ASSIGNMENTS).appendRow([assignmentId, customerId, partnerId, serviceId, productId, 'ASSIGNED', priority || 'NORMAL', now, dueDate || '', now, now]);
  appendWorkflow_(assignmentId, 'ASSIGNED', note || 'Service assigned.', actorUser);
  return assignmentId;
}

function normalizeSortOrder_(value) {
  const numeric = Number(value === null || value === undefined || value === '' ? 100 : value);
  if (!isFinite(numeric)) return 100;
  return Math.max(1, Math.min(9999, Math.round(numeric)));
}

function isAllowedPartnerStatusTransition_(currentStatus, nextStatus) {
  const current = safeString_(currentStatus, 40).toUpperCase();
  const next = safeString_(nextStatus, 40).toUpperCase();
  if (current === next) return true;
  const transitions = {
    ASSIGNED: ['ACCEPTED', 'IN_PROGRESS', 'WAITING_CUSTOMER'],
    ACCEPTED: ['IN_PROGRESS', 'WAITING_CUSTOMER'],
    IN_PROGRESS: ['WAITING_CUSTOMER', 'REVIEW', 'COMPLETED'],
    WAITING_CUSTOMER: ['IN_PROGRESS', 'REVIEW'],
    REVIEW: ['IN_PROGRESS', 'COMPLETED'],
    COMPLETED: ['CLOSED'],
    CLOSED: []
  };
  return Boolean(transitions[current]) && transitions[current].indexOf(next) !== -1;
}

function normalizePriority_(value) {
  const priority = safeString_(value, 20).toUpperCase() || 'NORMAL';
  return ['LOW', 'NORMAL', 'HIGH', 'URGENT'].indexOf(priority) !== -1 ? priority : '';
}

function isValidIsoDate_(value) {
  const text = safeString_(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(text + 'T00:00:00Z');
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

/**
 * Optional maintenance helper. Removes expired/revoked sessions, consumed/expired OTPs,
 * and old completed registration requests so portal sheets remain performant.
 */
function cleanupExpiredPortalRecords() {
  const spreadsheet = getDatabase_();
  const now = Date.now();
  const targets = [
    { name: SHEETS.SESSIONS, shouldDelete: function(row) { return isTruthy_(row['Revoked']) || Date.parse(String(row['Expires At'])) < now - 24 * 60 * 60 * 1000; } },
    { name: SHEETS.OTP, shouldDelete: function(row) { return isTruthy_(row['Consumed']) || Date.parse(String(row['Expires At'])) < now - 24 * 60 * 60 * 1000; } },
    { name: SHEETS.REGISTRATIONS, shouldDelete: function(row) {
      const status = String(row['Status'] || '').toUpperCase();
      return ['ACTIVE', 'REJECTED', 'EXPIRED'].indexOf(status) !== -1 && Date.parse(String(row['Updated At'])) < now - 30 * 24 * 60 * 60 * 1000;
    } }
  ];
  const deleted = {};
  targets.forEach(function(target) {
    const sheet = spreadsheet.getSheetByName(target.name);
    const rows = sheetObjects_(target.name).filter(target.shouldDelete).map(function(row) { return Number(row.__rowNumber); }).sort(function(a,b) { return b-a; });
    rows.forEach(function(rowNumber) { sheet.deleteRow(rowNumber); });
    deleted[target.name] = rows.length;
  });
  appendAudit_('PORTAL_CLEANUP', 'MAINTENANCE', JSON.stringify(deleted));
  console.log(JSON.stringify({ ok: true, deleted: deleted }, null, 2));
  return { ok: true, deleted: deleted };
}

/**
 * Provision the first internal admin safely from Script Properties.
 * Required: PORTAL_ADMIN_EMAIL, PORTAL_ADMIN_NAME
 * Optional: PORTAL_ADMIN_PHONE
 * Run once after setupDatabase(). Admin then signs in through email OTP.
 */
function provisionAdminFromProperties() {
  const props = PropertiesService.getScriptProperties();
  const email = normalizeEmail_(props.getProperty('PORTAL_ADMIN_EMAIL'));
  const name = safeString_(props.getProperty('PORTAL_ADMIN_NAME'), 80);
  const phone = safeString_(props.getProperty('PORTAL_ADMIN_PHONE'), 20);
  if (!email || !name) throw new Error('Set PORTAL_ADMIN_EMAIL and PORTAL_ADMIN_NAME in Script Properties first.');
  const result = provisionPortalUser_(email, 'admin', name, 'Incentify Private Limited', phone, { active: true, status: 'ACTIVE', emailVerifiedAt: new Date().toISOString(), source: 'admin-bootstrap' });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Admin helper for onboarding a partner or a customer without hard-coding credentials.
 * In Apps Script -> Project Settings -> Script Properties set:
 * PORTAL_PROVISION_EMAIL
 * PORTAL_PROVISION_ROLE = customer, partner or admin
 * PORTAL_PROVISION_NAME
 * PORTAL_PROVISION_ENTITY_NAME
 * PORTAL_PROVISION_PHONE (optional)
 * Then run provisionPortalUserFromProperties(). OTP login will work immediately.
 */
function provisionPortalUserFromProperties() {
  const props = PropertiesService.getScriptProperties();
  const email = normalizeEmail_(props.getProperty('PORTAL_PROVISION_EMAIL'));
  const role = normalizeRole_(props.getProperty('PORTAL_PROVISION_ROLE'));
  const name = safeString_(props.getProperty('PORTAL_PROVISION_NAME'), 80);
  const entityName = safeString_(props.getProperty('PORTAL_PROVISION_ENTITY_NAME'), 120) || name;
  const phone = safeString_(props.getProperty('PORTAL_PROVISION_PHONE'), 20);
  if (!email || !role || !name) throw new Error('Set PORTAL_PROVISION_EMAIL, PORTAL_PROVISION_ROLE and PORTAL_PROVISION_NAME first.');
  const result = provisionPortalUser_(email, role, name, entityName, phone, { active: true, status: 'ACTIVE', source: 'admin-provisioning' });
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Approve an email-verified partner registration.
 * Set Script Property PORTAL_APPROVE_PARTNER_EMAIL, then run this function.
 */
function approvePendingPartnerFromProperties() {
  const props = PropertiesService.getScriptProperties();
  const email = normalizeEmail_(props.getProperty('PORTAL_APPROVE_PARTNER_EMAIL'));
  if (!email) throw new Error('Set PORTAL_APPROVE_PARTNER_EMAIL first.');
  const user = findUserByEmailRole_(email, 'partner');
  if (!user) throw new Error('Partner portal user was not found.');
  const partner = findRow_(SHEETS.PARTNERS, 'Partner ID', String(user['Entity ID']));
  if (!partner) throw new Error('Partner record was not found.');

  updateRowByObject_(SHEETS.USERS, user, { 'Active': true, 'Updated At': new Date().toISOString() });
  updateRowByObject_(SHEETS.PARTNERS, partner, { 'Status': 'ACTIVE', 'Updated At': new Date().toISOString() });
  const registrations = sheetObjects_(SHEETS.REGISTRATIONS).filter(function(row) {
    return normalizeEmail_(row['Email']) === email && String(row['Role']).toLowerCase() === 'partner';
  });
  if (registrations.length) updateRowByObject_(SHEETS.REGISTRATIONS, registrations[registrations.length - 1], { 'Status': 'ACTIVE', 'Updated At': new Date().toISOString() });
  appendAudit_('PARTNER_APPROVED', user['User ID'], email);
  const result = { ok: true, email: email, userId: user['User ID'], partnerId: user['Entity ID'] };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Admin helper for assigning a service. Set Script Properties:
 * PORTAL_ASSIGN_CUSTOMER_EMAIL
 * PORTAL_ASSIGN_PARTNER_EMAIL
 * PORTAL_ASSIGN_SERVICE_ID
 * PORTAL_ASSIGN_PRODUCT_ID (optional)
 * PORTAL_ASSIGN_DUE_DATE (optional YYYY-MM-DD)
 */
function assignPortalServiceFromProperties() {
  const props = PropertiesService.getScriptProperties();
  const customerEmail = normalizeEmail_(props.getProperty('PORTAL_ASSIGN_CUSTOMER_EMAIL'));
  const partnerEmail = normalizeEmail_(props.getProperty('PORTAL_ASSIGN_PARTNER_EMAIL'));
  const serviceId = safeString_(props.getProperty('PORTAL_ASSIGN_SERVICE_ID'), 80);
  const productId = safeString_(props.getProperty('PORTAL_ASSIGN_PRODUCT_ID'), 80);
  const dueDate = safeString_(props.getProperty('PORTAL_ASSIGN_DUE_DATE'), 20);

  const customerUser = findUserByEmailRole_(customerEmail, 'customer') || autoProvisionCustomerFromLead_(customerEmail);
  const partnerUser = findUserByEmailRole_(partnerEmail, 'partner');
  const service = findRow_(SHEETS.SERVICES, 'Service ID', serviceId);
  if (!customerUser) throw new Error('Customer portal user was not found.');
  if (!partnerUser) throw new Error('Partner portal user was not found.');
  if (!service || !isTruthy_(service['Active'])) throw new Error('Active service was not found.');

  const now = new Date().toISOString();
  const assignmentId = createId_('ASN');
  getDatabase_().getSheetByName(SHEETS.ASSIGNMENTS).appendRow([
    assignmentId,
    customerUser['Entity ID'],
    partnerUser['Entity ID'],
    serviceId,
    productId,
    'ASSIGNED',
    'NORMAL',
    now,
    dueDate,
    now,
    now
  ]);
  appendWorkflow_(assignmentId, 'ASSIGNED', 'Service assigned.', partnerUser);
  appendAudit_('SERVICE_ASSIGNED', assignmentId, customerEmail + '|' + partnerEmail + '|' + serviceId);
  const result = { ok: true, assignmentId: assignmentId };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function provisionPortalUser_(email, role, displayName, entityName, phone, options) {
  ensureDatabaseStructure_(getDatabase_());
  options = options || {};
  const existing = findUserByEmailRole_(email, role);
  if (existing) return { ok: true, created: false, userId: existing['User ID'], entityId: existing['Entity ID'] };
  const now = new Date().toISOString();
  const userId = createId_('USR');
  const entityId = createId_(role === 'partner' ? 'PAR' : role === 'admin' ? 'ADM' : 'CUS');
  const active = options.active !== false;
  const status = safeString_(options.status, 40) || (active ? 'ACTIVE' : 'PENDING_APPROVAL');
  const verifiedAt = safeString_(options.emailVerifiedAt, 40);
  const source = safeString_(options.source, 80) || 'admin';
  if (role === 'partner') {
    getDatabase_().getSheetByName(SHEETS.PARTNERS).appendRow([entityId, entityName, displayName, email, phone, status, now, now, verifiedAt]);
  } else if (role === 'admin') {
    getDatabase_().getSheetByName(SHEETS.ADMINS).appendRow([entityId, displayName, email, phone, status, now, now, verifiedAt]);
  } else {
    getDatabase_().getSheetByName(SHEETS.CUSTOMERS).appendRow([entityId, entityName, displayName, email, phone, status, now, now, verifiedAt]);
  }
  getDatabase_().getSheetByName(SHEETS.USERS).appendRow([userId, email, role, displayName, entityId, active, '', now, now, verifiedAt, source]);
  appendAudit_('PORTAL_USER_PROVISIONED', userId, role + '|' + email + '|' + source);
  return { ok: true, created: true, userId: userId, entityId: entityId };
}

function autoProvisionCustomerFromLead_(email) {
  if (!email) return null;
  const existing = findUserByEmailRole_(email, 'customer');
  if (existing) return existing;

  const leads = sheetObjects_(SHEETS.LEADS).filter(function(row) {
    return normalizeEmail_(row['Email']) === email;
  });
  if (!leads.length) return null;
  const lead = leads[leads.length - 1];
  const name = safeString_(lead['Full Name'], 80) || 'Customer';
  const business = safeString_(lead['Business Name'], 120) || name;
  const phone = safeString_(lead['Phone'], 20);
  provisionPortalUser_(email, 'customer', name, business, phone, { active: true, status: 'ACTIVE', source: 'lead-auto-provision' });
  return findUserByEmailRole_(email, 'customer');
}

function findUserByEmailRole_(email, role) {
  return sheetObjects_(SHEETS.USERS).filter(function(row) {
    return normalizeEmail_(row['Email']) === email && String(row['Role']).toLowerCase() === role;
  }).slice(-1)[0] || null;
}

function findLatestOtp_(email, role, purpose, reference) {
  const normalizedPurpose = safeString_(purpose, 20).toLowerCase() || 'login';
  const normalizedReference = safeString_(reference, 100);
  return sheetObjects_(SHEETS.OTP).filter(function(row) {
    const rowPurpose = safeString_(row['Purpose'], 20).toLowerCase() || 'login';
    const rowReference = safeString_(row['Reference'], 100);
    return normalizeEmail_(row['Email']) === email && String(row['Role']).toLowerCase() === role &&
      rowPurpose === normalizedPurpose && (!normalizedReference || rowReference === normalizedReference);
  }).sort(function(a, b) {
    return Date.parse(String(a['Created At'])) - Date.parse(String(b['Created At']));
  }).slice(-1)[0] || null;
}

function servicePublic_(row) {
  return {
    serviceId: String(row['Service ID'] || ''),
    name: String(row['Name'] || ''),
    category: String(row['Category'] || ''),
    description: String(row['Description'] || ''),
    active: isTruthy_(row['Active']),
    sortOrder: Number(row['Sort Order'] || 9999)
  };
}

function productPublic_(row) {
  return {
    productId: String(row['Product ID'] || ''),
    name: String(row['Name'] || ''),
    description: String(row['Description'] || ''),
    billingModel: String(row['Billing Model'] || ''),
    active: isTruthy_(row['Active']),
    sortOrder: Number(row['Sort Order'] || 9999)
  };
}

function seedServiceCatalog_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.SERVICES);
  if (!sheet || sheet.getLastRow() > 1) return;
  const now = new Date().toISOString();
  const rows = [
    ['SRV-COMPANY-REG', 'Private Limited Company Registration', 'Registration', 'Company incorporation and setup coordination.', true, 10, now, now],
    ['SRV-GST-REG', 'GST Registration', 'Tax', 'GST registration assistance and document coordination.', true, 20, now, now],
    ['SRV-GST-RETURN', 'GST Return Filing', 'Tax', 'GST return filing and reconciliation support.', true, 30, now, now],
    ['SRV-ROC', 'ROC Compliance', 'Compliance', 'Recurring company and ROC compliance support.', true, 40, now, now],
    ['SRV-BOOKKEEPING', 'Bookkeeping', 'Accounting', 'Books, ledger review and monthly accounting support.', true, 50, now, now],
    ['SRV-VIRTUAL-CFO', 'Virtual CFO', 'Accounting', 'Management reporting, cash-flow and finance-ready records.', true, 60, now, now],
    ['SRV-BUSINESS-LOAN', 'Business Loan Assistance', 'Finance', 'Finance documentation and lender-readiness assistance.', true, 70, now, now],
    ['SRV-BUSINESS-PLANNING', 'Business Planning', 'Advisory', 'Structured planning, compliance and growth advisory.', true, 80, now, now]
  ];
  sheet.getRange(2, 1, rows.length, SERVICE_HEADERS.length).setValues(rows);
}

function seedProductCatalog_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEETS.PRODUCTS);
  if (!sheet || sheet.getLastRow() > 1) return;
  const now = new Date().toISOString();
  const rows = [
    ['PRD-START', 'Start', 'Business setup and statutory registration bundle.', 'Project', true, 10, now, now],
    ['PRD-COMPLY', 'Comply', 'Recurring GST, tax and ROC compliance coordination.', 'Recurring', true, 20, now, now],
    ['PRD-FINANCE-READY', 'Finance Ready', 'Accounting, MIS and documentation support.', 'Recurring', true, 30, now, now],
    ['PRD-GROW', 'Grow', 'Planning and business advisory support.', 'Advisory', true, 40, now, now]
  ];
  sheet.getRange(2, 1, rows.length, PRODUCT_HEADERS.length).setValues(rows);
}

function ensureDatabaseStructure_(spreadsheet) {
  const first = spreadsheet.getSheets()[0];
  let leads = spreadsheet.getSheetByName(SHEETS.LEADS);
  if (!leads && first && first.getLastRow() === 0) {
    first.setName(SHEETS.LEADS);
    leads = first;
  }
  ensureSheet_(spreadsheet, SHEETS.LEADS, LEAD_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.CONFIG, ['Key', 'Value']);
  ensureSheet_(spreadsheet, SHEETS.AUDIT, AUDIT_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.ERRORS, ERROR_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.USERS, USER_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.CUSTOMERS, CUSTOMER_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.PARTNERS, PARTNER_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.SERVICES, SERVICE_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.PRODUCTS, PRODUCT_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.ASSIGNMENTS, ASSIGNMENT_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.WORKFLOW, WORKFLOW_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.DOCUMENTS, DOCUMENT_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.SESSIONS, SESSION_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.OTP, OTP_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.REGISTRATIONS, REGISTRATION_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.ADMINS, ADMIN_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.PARTNER_LEADS, PARTNER_LEAD_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.PARTNER_ACCESS, PARTNER_ACCESS_HEADERS);

  configureLeadValidation_(spreadsheet.getSheetByName(SHEETS.LEADS));
  configureConfigSheet_(spreadsheet.getSheetByName(SHEETS.CONFIG), spreadsheet);
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  ensureMinimumColumns_(sheet, headers.length);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#1f4e78')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), headers.length).setVerticalAlignment('top');
  if (!sheet.getFilter() && name !== SHEETS.CONFIG) {
    try { sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), headers.length).createFilter(); } catch (error) {}
  }
  return sheet;
}

function configureLeadValidation_(sheet) {
  if (!sheet) return;
  sheet.getRange(2, 6, Math.max(sheet.getMaxRows() - 1, 1), 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(LEAD_STATUS_VALUES, true).setAllowInvalid(false).build());
}

function configureConfigSheet_(sheet, spreadsheet) {
  const rows = [
    ['Key', 'Value'],
    ['Application', 'Incentify Website + Portal Backend'],
    ['Version', APP_VERSION],
    ['Lead Schema Version', LEAD_SCHEMA_VERSION],
    ['Portal Schema Version', PORTAL_SCHEMA_VERSION],
    ['Database Name', spreadsheet.getName()],
    ['Spreadsheet ID', spreadsheet.getId()],
    ['Timezone', TIME_ZONE],
    ['Portal Auth', 'Email OTP login + OTP registration + hashed sessions'],
    ['Admin Control', 'OTP-only admin portal; no public admin registration'],
    ['Partner Lead Capture', 'Partner leads -> admin qualification -> customer assignment'],
    ['Partner Catalogue Access', 'Admin assigns which services/products each partner can offer'],
    ['Last Verified', Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm:ss')]
  ];
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#1f4e78').setFontColor('#ffffff');
  sheet.setColumnWidth(1, 210);
  sheet.setColumnWidth(2, 460);
}

function validateAndNormalizeLead_(payload) {
  const source = safeString_(payload.source, 30).toLowerCase();
  const fullName = safeString_(payload.fullName, 80);
  const phone = safeString_(payload.phone, 20).replace(/[\s-]/g, '');
  const email = normalizeEmail_(payload.email);
  const submissionId = safeString_(payload.submissionId, 80);
  const reference = safeString_(payload.reference, 40).toUpperCase();
  const schemaVersion = safeString_(payload.schemaVersion, 10) || LEAD_SCHEMA_VERSION;

  if (!submissionId || submissionId.length < 12) throw new Error('Invalid submission ID.');
  if (!/^INC-\d{8}-[A-Z0-9]{6}$/.test(reference)) throw new Error('Invalid reference.');
  if (ALLOWED_SOURCES.indexOf(source) === -1) throw new Error('Invalid source.');
  if (fullName.length < 2) throw new Error('Invalid name.');
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) throw new Error('Invalid phone number.');
  if (!email) throw new Error('Invalid email address.');

  const lead = {
    submissionId: submissionId,
    reference: reference,
    submittedAt: safeString_(payload.submittedAt, 40),
    source: source,
    fullName: fullName,
    phone: phone,
    email: email,
    businessName: safeString_(payload.businessName, 120),
    businessType: safeString_(payload.businessType, 80),
    city: safeString_(payload.city, 60),
    state: safeString_(payload.state, 60),
    service: safeString_(payload.service, 120),
    contactMethod: safeString_(payload.contactMethod, 60),
    contactTime: safeString_(payload.contactTime, 100),
    preferredDate: safeString_(payload.preferredDate, 20),
    preferredTime: safeString_(payload.preferredTime, 60),
    message: safeString_(payload.message, 1200),
    pagePath: safeString_(payload.pagePath, 300),
    pageUrl: safeString_(payload.pageUrl, 1000),
    referrer: safeString_(payload.referrer, 1000),
    userAgent: safeString_(payload.userAgent, 500),
    schemaVersion: schemaVersion
  };
  lead.requestHash = createRequestHash_(lead);
  return lead;
}

function saveLead_(lead) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('The enquiry system is busy. Please try again.');
  try {
    const spreadsheet = getDatabase_();
    ensureDatabaseStructure_(spreadsheet);
    const sheet = spreadsheet.getSheetByName(SHEETS.LEADS);
    const duplicate = findDuplicate_(sheet, lead);
    if (duplicate) {
      appendAuditDirect_(spreadsheet, 'DUPLICATE', lead.reference, 'Duplicate submission ignored.');
      return { duplicate: true };
    }
    sheet.appendRow([
      safeCell_(lead.submissionId), safeCell_(lead.reference), new Date(), safeCell_(lead.submittedAt),
      safeCell_(lead.source), 'NEW', safeCell_(lead.fullName), safeCell_(lead.phone), safeCell_(lead.email),
      safeCell_(lead.businessName), safeCell_(lead.businessType), safeCell_(lead.city), safeCell_(lead.state),
      safeCell_(lead.service), safeCell_(lead.contactMethod), safeCell_(lead.contactTime), safeCell_(lead.preferredDate),
      safeCell_(lead.preferredTime), safeCell_(lead.message), safeCell_(lead.pagePath), safeCell_(lead.pageUrl),
      safeCell_(lead.referrer), safeCell_(lead.userAgent), safeCell_(lead.schemaVersion), safeCell_(lead.requestHash)
    ]);
    sheet.getRange(sheet.getLastRow(), 3).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    appendAuditDirect_(spreadsheet, 'LEAD_CREATED', lead.reference, lead.source);
    return { duplicate: false };
  } finally {
    lock.releaseLock();
  }
}

function findDuplicate_(sheet, lead) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const startRow = Math.max(2, lastRow - MAX_DUPLICATE_SCAN_ROWS + 1);
  const rows = sheet.getRange(startRow, 1, lastRow - startRow + 1, LEAD_HEADERS.length).getDisplayValues();
  return rows.some(function(row) {
    return row[0] === lead.submissionId || row[1] === lead.reference || row[24] === lead.requestHash;
  });
}

function createRequestHash_(lead) {
  const now = new Date();
  const hour = Utilities.formatDate(now, TIME_ZONE, 'yyyyMMddHH');
  const minute = Number(Utilities.formatDate(now, TIME_ZONE, 'mm'));
  const bucket = Math.floor(minute / 10);
  return sha256Hex_([hour, bucket, lead.source, lead.phone, lead.email, lead.service].join('|')).slice(0, 32);
}

function parsePayload_(e) {
  const raw = String(e.postData && e.postData.contents ? e.postData.contents : '').trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (error) { return e.parameter || {}; }
}

function getDatabase_() {
  const id = PropertiesService.getScriptProperties().getProperty(DATABASE_PROPERTY);
  if (!id) throw new Error('Database not configured. Run setupDatabase() first.');
  return SpreadsheetApp.openById(id);
}

function ensurePortalSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty(PORTAL_SECRET_PROPERTY);
  if (!secret) {
    secret = Utilities.getUuid() + '|' + Utilities.getUuid() + '|' + new Date().getTime();
    props.setProperty(PORTAL_SECRET_PROPERTY, secret);
  }
  return secret;
}

function hashPortalValue_(value) {
  return sha256Hex_(ensurePortalSecret_() + '|' + String(value || ''));
}

function sha256Hex_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value || ''), Utilities.Charset.UTF_8);
  return digest.map(function(byte) {
    const n = byte < 0 ? byte + 256 : byte;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function generatePortalOtp_() {
  const seed = ensurePortalSecret_() + '|' + Utilities.getUuid() + '|' + Utilities.getUuid() + '|' + new Date().getTime();
  const hex = sha256Hex_(seed).slice(0, 12);
  const numeric = parseInt(hex, 16) % 900000;
  return String(100000 + numeric);
}

function createPortalToken_() {
  return sha256Hex_(Utilities.getUuid() + '|' + Utilities.getUuid() + '|' + ensurePortalSecret_() + '|' + new Date().getTime());
}

function createId_(prefix) {
  return String(prefix || 'ID') + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function normalizeEmail_(value) {
  const email = safeString_(value, 160).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function normalizeRole_(value) {
  const role = safeString_(value, 20).toLowerCase();
  return PORTAL_ROLES.indexOf(role) !== -1 ? role : '';
}

function normalizeAllowedOrigin_(value) {
  return ALLOWED_PORTAL_ORIGINS.indexOf(value) !== -1 ? value : 'https://incentify.in';
}

function bridgeOutput_(requestId, response, origin) {
  const envelope = {
    source: 'INCENTIFY_PORTAL_V12',
    requestId: requestId,
    response: response
  };
  const json = JSON.stringify(envelope).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const target = JSON.stringify(normalizeAllowedOrigin_(origin));
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<script>window.parent.postMessage(' + json + ',' + target + ');</script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function success_(data) { return { ok: true, data: data }; }
function failure_(message) { return { ok: false, error: String(message || 'Request failed.') }; }

function sheetObjects_(sheetName) {
  const sheet = getDatabase_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0];
  return values.slice(1).map(function(row, index) {
    const object = { __rowNumber: index + 2 };
    headers.forEach(function(header, column) { object[header] = row[column]; });
    return object;
  });
}

function findRow_(sheetName, header, value) {
  const target = String(value || '');
  return sheetObjects_(sheetName).filter(function(row) { return String(row[header] || '') === target; }).slice(-1)[0] || null;
}

function updateRowByObject_(sheetName, object, changes) {
  if (!object || !object.__rowNumber) return;
  const sheet = getDatabase_().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  Object.keys(changes).forEach(function(key) {
    const index = headers.indexOf(key);
    if (index !== -1) sheet.getRange(Number(object.__rowNumber), index + 1).setValue(safeCell_(changes[key]));
  });
}

function headersMatch_(sheet, headers) {
  if (!sheet) return false;
  const actual = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  return headers.every(function(header, index) { return actual[index] === header; });
}

function sortOrder_(a, b) {
  return Number(a['Sort Order'] || 9999) - Number(b['Sort Order'] || 9999);
}

function indexBy_(rows, key) {
  const out = {};
  rows.forEach(function(row) { out[String(row[key] || '')] = row; });
  return out;
}

function isTruthy_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value).toUpperCase() === 'ACTIVE';
}

function ensureMinimumColumns_(sheet, required) {
  const current = sheet.getMaxColumns();
  if (current < required) sheet.insertColumnsAfter(current, required - current);
}

function appendAudit_(eventName, reference, details) {
  appendAuditDirect_(getDatabase_(), eventName, reference, details);
}

function appendAuditDirect_(spreadsheet, eventName, reference, details) {
  const sheet = spreadsheet.getSheetByName(SHEETS.AUDIT);
  if (!sheet) return;
  sheet.appendRow([new Date(), safeCell_(eventName), safeCell_(reference), safeCell_(safeString_(details, 1200))]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

function logError_(context, reference, error) {
  try {
    const spreadsheet = getDatabase_();
    const sheet = spreadsheet.getSheetByName(SHEETS.ERRORS);
    if (!sheet) return;
    const message = error && error.message ? error.message : String(error || 'Unknown error');
    const stack = error && error.stack ? String(error.stack) : '';
    sheet.appendRow([new Date(), safeCell_(context), safeCell_(reference), safeCell_(safeString_(message, 1200)), safeCell_(safeString_(stack, 4000))]);
  } catch (loggingError) {
    console.error('Error logging failed', loggingError);
  }
}

function htmlEscape_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeString_(value, maxLength) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, maxLength);
}

function safeCell_(value) {
  const text = String(value === null || value === undefined ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeAuditValue_(value) {
  return safeString_(value, 100).replace(/[\r\n\t]/g, ' ');
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
